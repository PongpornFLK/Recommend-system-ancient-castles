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
doc_embedder = SentenceTransformer("sentence-transformers/paraphrase-multilingual-mpnet-base-v2") 
img_embedder = SentenceTransformer("sentence-transformers/clip-ViT-B-32") 

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
    
    # ดึงข้อมูล castles พร้อม JOIN ข้อมูลลักษณะเด่น และตาราง events
    sql = text("""
        SELECT 
            c.castle_id, c.castle_name, c.castle_description, c.era, c.type_id,
            ct.type_detail,
            (SELECT a.architec_detail FROM architectures a 
             WHERE a.castle_id = c.castle_id 
             AND a.architec_detail IS NOT NULL 
             AND a.architec_detail <> '' 
             LIMIT 1) as architecture,
            -- ดึงข้อมูลเทศกาลจากตาราง public.events
            (SELECT STRING_AGG(e.event_name || ': ' || e.event_description, ' | ') 
             FROM events e WHERE e.castle_id = c.castle_id) as festivals_info
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
            output_fields=["castle_id", "document_name", "chunk_text"],
        )

        hits, castle_ids = [], []
        for hit in res[0]:
            cid = hit.entity.get("castle_id")
            if cid is not None: castle_ids.append(int(cid))
            hits.append({
                "score": float(hit.score),
                "castle_id": int(cid) if cid is not None else None,
                "chunk_text": sanitize_text(hit.entity.get("chunk_text") or ""),
            })

        if not hits:
            return {"answer": "### ผลการค้นหา\nไม่พบข้อมูลที่เกี่ยวข้องในฐานข้อมูล", "castles": [], "hits": []}

        castle_map = fetch_castles_map(db, list(set(castle_ids)))
        
        # --- เช็ค Keywords ว่าเป็นเรื่องเทศกาลหรือไม่ ---
        is_event_query = any(kw in req.query for kw in ["เทศกาล", "กิจกรรม", "event", "งาน", "ประเพณี", "ตอนนี้มีอะไร"])
        
        context_lines = []
        for i, h in enumerate(hits, start=1):
            c_info = castle_map.get(h["castle_id"])
            if not c_info: continue
            
            # ใส่ข้อมูลเทศกาลเฉพาะเมื่อผู้ใช้ถามถึงเท่านั้น
            fest_info = c_info.get("festivals_info") if is_event_query else "ผู้ใช้ไม่ได้ถามถึงกิจกรรม (ไม่ต้องตอบส่วนนี้)"
            
            context_lines.append(
                f"ข้อมูลชุดที่ {i} (โบราณสถาน: {c_info['castle_name']})\n"
                f"เนื้อหาจากเอกสาร (ห้ามบิดเบือน): {h['chunk_text']}\n"
                f"ข้อมูลกิจกรรมจากตาราง SQL: {fest_info}"
            )
        context = "\n\n".join(context_lines)

        try:
            llm = get_groq_llm()
            system = SystemMessage(content=(
                "คุณเป็นผู้เชี่ยวชาญด้านประวัติศาสตร์ไทยที่ตอบคำถามตามความจริงเท่านั้น "
                "1. ห้ามคิดคำตอบเองเด็ดขาด ให้ใช้ข้อมูลจาก 'บริบทข้อมูล' ที่ส่งให้เท่านั้น "
                "2. หากในบริบทไม่มีคำตอบที่ตรงกับคำถาม ให้ตอบว่า 'ขออภัย ไม่พบข้อมูลส่วนนี้ในฐานข้อมูลเอกสาร' "
                "3. ตอบเป็นภาษาไทยที่สุภาพ กระชับ และเป็นทางการ"
            ))
            
            # ปรับหัวข้อ Markdown ตามเงื่อนไขการถาม
            event_section = "###  กิจกรรมและเทศกาล\n* (ระบุจากข้อมูลตาราง SQL เท่านั้น)\n\n" if is_event_query else ""
            
            human = HumanMessage(content=(
                f"คำถาม: {req.query}\n\n"
                f"บริบทข้อมูล:\n{context}\n\n"
                "จัดรูปแบบ Markdown ดังนี้:\n"
                "###  สรุปจากเอกสาร\n(ตอบตามเนื้อหาในเอกสารเท่านั้น)\n\n"
                f"{event_section}"
                "###  สถานที่ที่เกี่ยวข้อง\n* (ระบุชื่อปราสาท)"
            ))
            
            ai = llm.invoke([system, human])
            answer_text = sanitize_text(ai.content)
        except Exception:
            answer_text = f"###  สรุป\nพบข้อมูลที่เกี่ยวข้องแต่ระบบ AI ขัดข้อง\n\n{hits[0]['chunk_text']}"

        # เตรียมส่งข้อมูล castles กลับไปโชว์ Card (ยังคงดึง festivals ไปเผื่อหน้า Card โชว์)
        castles_out = []
        for cid, info in castle_map.items():
            castles_out.append({
                "castle_id": info["castle_id"],
                "castle_name": info["castle_name"],
                "castle_description": info["castle_description"],
                "era": info["era"],
                "type_detail": info["type_detail"],
                "architecture": info["architecture"],
                "festivals": info.get("festivals_info") or "ไม่มีกิจกรรม"
            })

        return {"answer": answer_text, "castles": castles_out, "hits": hits}
    except Exception as e:
        logger.exception("QA failed")
        raise HTTPException(status_code=500, detail=str(e))

# Image Search (ยังคงเหมือนเดิมแต่ดึงข้อมูลเทศกาลมาด้วย)
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
            output_fields=["castle_id", "image_url"]
        )

        hits, castle_ids = [], []
        for hit in res[0]:
            cid = hit.entity.get("castle_id")
            cid_int = int(cid) if cid is not None else None
            if cid_int is not None: castle_ids.append(cid_int)
            hits.append({
                "score": float(hit.score),
                "castle_id": cid_int,
                "image_url": hit.entity.get("image_url")
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
                "castle_description": sanitize_text(c["castle_description"] or ""),
                "era": c["era"] or "ไม่ระบุ",
                "type_detail": c["type_detail"] or "ไม่ระบุ",
                "architecture": c["architecture"] or "ไม่มีข้อมูล",
                "festivals": c.get("festivals_info") or "ไม่มีข้อมูลกิจกรรม",
                "best_score": float(best),
            })
        return {"hits": hits, "castles": castles}
    except Exception as e:
        logger.exception("Image search failed")
        raise HTTPException(status_code=500, detail=str(e))