# backend/route/zilliz_search.py
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
from db import get_db
from model.model import Castle

from langchain_groq import ChatGroq
from langchain_core.messages import SystemMessage, HumanMessage

load_dotenv()

router = APIRouter(prefix="/zilliz", tags=["zilliz"])

# =========================
# Embedders (โหลดครั้งเดียว)
# =========================
doc_embedder = SentenceTransformer("sentence-transformers/paraphrase-multilingual-mpnet-base-v2")  # 768
img_embedder = SentenceTransformer("sentence-transformers/clip-ViT-B-32")  # 512


# =========================
# Helpers
# =========================
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

    api_key = api_key.strip()
    if not api_key.isascii():
        raise ValueError("GROQ_API_KEY has non-ascii characters")

    return ChatGroq(
        model="llama-3.1-8b-instant",
        api_key=api_key,
        temperature=0.2,
    )


def fetch_castles_map(db: Session, castle_ids: List[int]) -> Dict[int, Castle]:
    if not castle_ids:
        return {}
    rows = db.query(Castle).filter(Castle.castle_id.in_(castle_ids)).all()
    return {r.castle_id: r for r in rows}


def sanitize_text(s: str) -> str:
    if not s:
        return ""
    s = s.replace("\r", "")
    s = re.sub(r"\n(?!\n)", " ", s)
    s = re.sub(r"\n{3,}", "\n\n", s)
    s = re.sub(r"[ \t]{2,}", " ", s)
    s = re.sub(r"([ก-๙])\s+([ก-๙])", r"\1\2", s)
    s = re.sub(r"\s+([่้๊๋์])", r"\1", s)
    return s.strip()


def pick_vector_field(col: Collection) -> Tuple[str, int]:
    """
    หา field ที่เป็น vector ใน collection แบบอัตโนมัติ
    return (field_name, dim)
    """
    for f in col.schema.fields:
        # 101 = FLOAT_VECTOR ใน pymilvus dtype code
        if str(getattr(f, "dtype", "")) == "101" or "FLOAT_VECTOR" in str(getattr(f, "dtype", "")):
            # ใน pymilvus field จะมี params/dim บางเวอร์ชัน
            dim = None
            try:
                dim = int(getattr(f, "params", {}).get("dim"))
            except Exception:
                dim = None
            return f.name, (dim or 0)
    raise ValueError(f"Vector field not found in collection: {col.name}")


# =========================
# QA (Text)
# =========================
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

        hits: List[Dict[str, Any]] = []
        castle_ids: List[int] = []

        for hit in res[0]:
            cid = hit.entity.get("castle_id")
            cid_int = int(cid) if cid is not None else None
            if cid_int is not None:
                castle_ids.append(cid_int)

            hits.append(
                {
                    "score": float(hit.score),
                    "castle_id": cid_int,
                    "document_name": hit.entity.get("document_name"),
                    "chunk_id": hit.entity.get("chunk_id"),
                    "chunk_text": sanitize_text(hit.entity.get("chunk_text") or ""),
                    "source_url": hit.entity.get("source_url"),
                }
            )

        if not hits:
            return {"answer": "ไม่พบข้อมูลที่เกี่ยวข้องในเอกสาร", "castles": [], "hits": []}

        castle_map = fetch_castles_map(db, list(set(castle_ids)))

        best_by_castle: Dict[int, float] = {}
        for h in hits:
            cid = h["castle_id"]
            if cid is None:
                continue
            best_by_castle[cid] = max(best_by_castle.get(cid, 0.0), float(h["score"]))

        castles = []
        for cid, best in sorted(best_by_castle.items(), key=lambda x: x[1], reverse=True):
            c = castle_map.get(cid)
            if not c:
                continue
            castles.append(
                {
                    "castle_id": c.castle_id,
                    "castle_name": sanitize_text(c.castle_name or ""),
                    "castle_description": sanitize_text(c.castle_description or ""),
                    "era": sanitize_text(c.era or "") if c.era else None,
                    "type_id": c.type_id,
                    "best_score": float(best),
                }
            )

        context_lines = []
        for i, h in enumerate(hits, start=1):
            cid = h["castle_id"]
            if cid is None:
                continue
            cname = castle_map.get(cid).castle_name if cid in castle_map else f"castle_id={cid}"
            context_lines.append(
                f"[{i}] {sanitize_text(cname)} | score={float(h['score']):.4f}\n{h['chunk_text']}"
            )
        context = "\n\n".join(context_lines)

        try:
            llm = get_groq_llm()
            system = SystemMessage(
                content=(
                    "คุณเป็นผู้ช่วยตอบคำถามเกี่ยวกับโบราณสถาน/ปราสาทในไทย\n"
                    "- ตอบภาษาไทย กระชับ อ่านง่าย\n"
                    "- ห้ามแต่งข้อมูลเพิ่มจากบริบท\n"
                    "- ถ้าบริบทไม่พอ ให้บอกว่า 'ไม่พบข้อมูลในเอกสารที่มี'\n"
                )
            )
            human = HumanMessage(
                content=(
                    f"คำถาม: {req.query}\n\n"
                    f"บริบท:\n{context}\n\n"
                    "ตอบเป็น Markdown:\n"
                    "1) **สรุป**\n"
                    "2) **รายละเอียดจากเอกสาร** (bullet)\n"
                    "3) **อ้างอิง** (bullet: document_name + source_url)\n"
                )
            )
            ai = llm.invoke([system, human])
            answer_text = sanitize_text(ai.content)
        except Exception:
            logger.exception("Groq invoke failed; fallback to top chunk")
            top_chunk = hits[0].get("chunk_text") or ""
            answer_text = (
                "**สรุป**\n\n"
                "ขณะนี้ระบบสรุปคำตอบด้วย Groq ไม่สำเร็จ จึงแสดงข้อความที่เกี่ยวข้องที่สุดจากเอกสารแทน\n\n"
                f"**รายละเอียดจากเอกสาร**\n\n{top_chunk}"
            )

        return {"answer": answer_text, "castles": castles, "hits": hits}

    except Exception as e:
        logger.exception("QA endpoint failed")
        raise HTTPException(status_code=500, detail=str(e))


# =========================
# Image Search (Image)
# =========================
@router.post("/images")
def search_images(
    k: int = Query(5, ge=1, le=20),
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
):
    """
    Zilliz schema ของคุณ:
    - collection: image_vectors
    - vector field: image_vector (512)
    - fields: img_id, castle_id, image_url, place_id
    """
    try:
        connect_zilliz()
        col = get_collection("image_vectors")

        # ✅ เลือก vector field อัตโนมัติ (ของคุณจะได้ "image_vector")
        anns_field, _dim = pick_vector_field(col)

        content = file.file.read()
        if not content:
            raise HTTPException(status_code=400, detail="Empty file")

        img = Image.open(io.BytesIO(content)).convert("RGB")
        qvec = img_embedder.encode(img, normalize_embeddings=True).tolist()

        # ✅ metric_type ต้องสอดคล้องกับตอนสร้าง index (ส่วนใหญ่ COSINE/Inner Product)
        res = col.search(
            data=[qvec],
            anns_field=anns_field,  # ✅ "image_vector"
            param={"metric_type": "COSINE", "params": {"nprobe": 10}},
            limit=k,
            output_fields=["img_id", "castle_id", "image_url", "place_id"],
        )

        hits: List[Dict[str, Any]] = []
        castle_ids: List[int] = []

        for hit in res[0]:
            ent = hit.entity
            cid = ent.get("castle_id")
            cid_int = int(cid) if cid is not None else None
            if cid_int is not None:
                castle_ids.append(cid_int)

            hits.append(
                {
                    "score": float(hit.score),
                    "primary_key": int(hit.id) if hasattr(hit, "id") else None,
                    "img_id": ent.get("img_id"),
                    "castle_id": cid_int,
                    "place_id": ent.get("place_id"),
                    "image_url": ent.get("image_url"),
                }
            )

        castle_map = fetch_castles_map(db, list(set(castle_ids)))

        best_by_castle: Dict[int, float] = {}
        for h in hits:
            cid = h["castle_id"]
            if cid is None:
                continue
            best_by_castle[cid] = max(best_by_castle.get(cid, 0.0), float(h["score"]))

        castles = []
        for cid, best in sorted(best_by_castle.items(), key=lambda x: x[1], reverse=True):
            c = castle_map.get(cid)
            if not c:
                continue
            castles.append(
                {
                    "castle_id": c.castle_id,
                    "castle_name": sanitize_text(c.castle_name or ""),
                    "castle_description": sanitize_text(c.castle_description or ""),
                    "era": sanitize_text(c.era or "") if c.era else None,
                    "type_id": c.type_id,
                    "best_score": float(best),
                }
            )

        return {
            "hits": hits,
            "castles": castles,
            "meta": {"collection": col.name, "anns_field": anns_field},
        }

    except HTTPException:
        raise
    except Exception as e:
        logger.exception("Image search failed")
        raise HTTPException(status_code=500, detail=str(e))