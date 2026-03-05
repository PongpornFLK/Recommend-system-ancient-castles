import os
import re
import io
from typing import Optional, List, Dict, Any, Tuple

from dotenv import load_dotenv
from fastapi import APIRouter, Depends, UploadFile, File, Query, HTTPException
from pydantic import BaseModel
from loguru import logger

from pymilvus import connections, Collection
from sentence_transformers import SentenceTransformer
from PIL import Image

from sqlalchemy.orm import Session
from sqlalchemy import text
from db import get_db
from model.model import Castle

from langchain_groq import ChatGroq
from langchain_core.messages import SystemMessage, HumanMessage

load_dotenv()

router = APIRouter(prefix="/zilliz", tags=["zilliz"])

# Embedders (โหลดครั้งเดียว)
doc_embedder = SentenceTransformer("sentence-transformers/paraphrase-multilingual-mpnet-base-v2")  # 768
img_embedder = SentenceTransformer("sentence-transformers/clip-ViT-B-32")  # 512

# Helpers
def connect_zilliz():
    uri = os.getenv("ZILLIZ_URI")
    token = os.getenv("ZILLIZ_TOKEN")
    if not uri or not token:
        raise ValueError("Missing ZILLIZ_URI / ZILLIZ_TOKEN (check .env)")
    if not connections.has_connection("default"):
        connections.connect(alias="default", uri=uri, token=token, secure=True)

def get_collection(name: str) -> Collection:
    col = Collection(name)
    col.load()
    return col

def get_groq_llm() -> ChatGroq:
    api_key = os.getenv("GROQ_API_KEY")
    if not api_key:
        raise ValueError("Missing GROQ_API_KEY in .env")
    return ChatGroq(
        model="llama-3.1-8b-instant",
        api_key=api_key.strip(),
        temperature=0.2,
    )

def fetch_castles_map(db: Session, castle_ids: List[int]) -> Dict[int, Dict[str, Any]]:
    if not castle_ids:
        return {}
    # ดึงข้อมูล castles พร้อม JOIN ข้อมูลลักษณะเด่นทั้งหมด
    sql = text("""
        SELECT 
            c.castle_id, c.castle_name, c.castle_description, c.era, c.type_id,
            ct.type_detail,
            (SELECT a.architec_detail FROM architectures a 
             WHERE a.castle_id = c.castle_id 
             AND a.architec_detail IS NOT NULL 
             AND a.architec_detail <> '' 
             LIMIT 1) as architecture
        FROM castles c
        LEFT JOIN castle_types ct ON ct.type_id = c.type_id
        WHERE c.castle_id IN :ids
    """)
    rows = db.execute(sql, {"ids": tuple(castle_ids)}).mappings().all()
    return {r["castle_id"]: dict(r) for r in rows}

def sanitize_text(s: str) -> str:
    if not s: return ""
    s = s.replace("\r", "")
    s = re.sub(r"\n(?!\n)", " ", s)
    s = re.sub(r"\n{3,}", "\n\n", s)
    s = re.sub(r"[ \t]{2,}", " ", s)
    s = re.sub(r"([ก-๙])\s+([ก-๙])", r"\1\2", s)
    s = re.sub(r"\s+([่้๊๋์])", r"\1", s)
    return s.strip()

def pick_vector_field(col: Collection) -> Tuple[str, int]:
    for f in col.schema.fields:
        if str(getattr(f, "dtype", "")) == "101" or "FLOAT_VECTOR" in str(getattr(f, "dtype", "")):
            try: dim = int(getattr(f, "params", {}).get("dim"))
            except: dim = None
            return f.name, (dim or 0)
    raise ValueError(f"Vector field not found in collection: {col.name}")

# QA (Text Search)
class QAReq(BaseModel):
    query: str
    k: int = 5
    castle_id: Optional[int] = None

@router.post("/qa")
def qa(req: QAReq, db: Session = Depends(get_db)):
    try:
        connect_zilliz()
        col = get_collection("document_vectors")
        qvec = doc_embedder.encode(req.query, normalize_embeddings=True).tolist()
        expr = f"castle_id == {req.castle_id}" if req.castle_id is not None else None

        res = col.search(
            data=[qvec],
            anns_field="document_vector",
            param={"params": {"ef": 64}},
            limit=req.k,
            expr=expr,
            output_fields=["castle_id", "document_name", "chunk_id", "chunk_text", "source_url"],
        )

        hits, castle_ids = [], []
        for hit in res[0]:
            cid = hit.entity.get("castle_id")
            cid_int = int(cid) if cid is not None else None
            if cid_int is not None: castle_ids.append(cid_int)
            hits.append({
                "score": float(hit.score),
                "castle_id": cid_int,
                "document_name": hit.entity.get("document_name"),
                "chunk_id": hit.entity.get("chunk_id"),
                "chunk_text": sanitize_text(hit.entity.get("chunk_text") or ""),
                "source_url": hit.entity.get("source_url"),
            })

        if not hits:
            return {"answer": "ไม่พบข้อมูลที่เกี่ยวข้องในเอกสาร", "castles": [], "hits": []}

        castle_map = fetch_castles_map(db, list(set(castle_ids)))
        best_by_castle = {}
        for h in hits:
            if h["castle_id"] is not None:
                best_by_castle[h["castle_id"]] = max(best_by_castle.get(h["castle_id"], 0.0), h["score"])

        castles = []
        for cid, best in sorted(best_by_castle.items(), key=lambda x: x[1], reverse=True):
            c = castle_map.get(cid)
            if not c: continue
            castles.append({
                "castle_id": c["castle_id"],
                "castle_name": sanitize_text(c["castle_name"] or ""),
                "castle_description": sanitize_text(c["castle_description"] or ""),
                "era": sanitize_text(c["era"] or "") if c["era"] else "ไม่ระบุ",
                "type_detail": sanitize_text(c["type_detail"] or "") if c["type_detail"] else "ไม่ระบุ",
                "architecture": sanitize_text(c["architecture"] or "") if c["architecture"] else "ไม่มีข้อมูล",
                "best_score": float(best),
            })

        context_lines = []
        for i, h in enumerate(hits, start=1):
            cname = castle_map.get(h["castle_id"])["castle_name"] if h["castle_id"] in castle_map else f"ID:{h['castle_id']}"
            context_lines.append(f"[{i}] {sanitize_text(cname)} | score={h['score']:.4f}\n{h['chunk_text']}")
        context = "\n\n".join(context_lines)

        try:
            llm = get_groq_llm()
            system = SystemMessage(content="คุณเป็นผู้ช่วยตอบคำถามเกี่ยวกับโบราณสถาน/ปราสาทในไทย\n- ตอบภาษาไทย กระชับ อ่านง่าย\n- ห้ามแต่งข้อมูลเพิ่มจากบริบท\n- ถ้าบริบทไม่พอ ให้บอกว่า 'ไม่พบข้อมูลในเอกสารที่มี'")
            human = HumanMessage(content=f"คำถาม: {req.query}\n\nบริบท:\n{context}\n\nตอบเป็น Markdown:\n1) **สรุป**\n2) **รายละเอียดจากเอกสาร** (bullet)\n3) **อ้างอิง** (bullet: document_name + source_url)")
            ai = llm.invoke([system, human])
            answer_text = sanitize_text(ai.content)
        except Exception:
            answer_text = f"**สรุป**\n\nระบบสรุปขัดข้อง แสดงข้อมูลที่เกี่ยวข้องที่สุด:\n\n{hits[0]['chunk_text']}"

        return {"answer": answer_text, "castles": castles, "hits": hits}
    except Exception as e:
        logger.exception("QA endpoint failed")
        raise HTTPException(status_code=500, detail=str(e))

# Image Search
@router.post("/images")
def search_images(k: int = Query(5, ge=1, le=20), file: UploadFile = File(...), db: Session = Depends(get_db)):
    try:
        connect_zilliz()
        col = get_collection("image_vectors")
        anns_field, _ = pick_vector_field(col)
        content = file.file.read()
        img = Image.open(io.BytesIO(content)).convert("RGB")
        qvec = img_embedder.encode(img, normalize_embeddings=True).tolist()

        res = col.search(
            data=[qvec], 
            anns_field=anns_field, 
            param={"metric_type": "COSINE", "params": {"nprobe": 10}}, 
            limit=k, 
            output_fields=["castle_id", "image_url", "place_id"]
        )

        hits, castle_ids = [], []
        for hit in res[0]:
            ent = hit.entity
            cid = ent.get("castle_id")
            cid_int = int(cid) if cid is not None else None
            if cid_int is not None: castle_ids.append(cid_int)
            hits.append({
                "score": float(hit.score),
                "castle_id": cid_int,
                "image_url": ent.get("image_url"),
                "place_id": ent.get("place_id")
            })

        castle_map = fetch_castles_map(db, list(set(castle_ids)))
        best_by_castle = {}
        for h in hits:
            if h["castle_id"]:
                best_by_castle[h["castle_id"]] = max(best_by_castle.get(h["castle_id"], 0.0), h["score"])

        castles = []
        for cid, best in sorted(best_by_castle.items(), key=lambda x: x[1], reverse=True):
            c = castle_map.get(cid)
            if not c: continue
            castles.append({
                "castle_id": c["castle_id"],
                "castle_name": sanitize_text(c["castle_name"] or ""),
                # เพิ่ม description และข้อมูลลักษณะเด่นเพื่อให้แสดงผลเหมือนฝั่งข้อความ
                "castle_description": sanitize_text(c["castle_description"] or ""),
                "era": c["era"] or "ไม่ระบุ",
                "type_detail": c["type_detail"] or "ไม่ระบุ",
                "architecture": c["architecture"] or "ไม่มีข้อมูล",
                "best_score": float(best),
            })
        return {"hits": hits, "castles": castles}
    except Exception as e:
        logger.exception("Image search failed")
        raise HTTPException(status_code=500, detail=str(e))