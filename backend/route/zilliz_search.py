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

# Embedders
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

    sql = text("""
        SELECT
            c.castle_id, c.castle_name, c.castle_description, c.era, c.type_id,
            ct.type_detail,
            (
                SELECT a.architec_detail
                FROM architectures a
                WHERE a.castle_id = c.castle_id
                  AND a.architec_detail IS NOT NULL
                  AND a.architec_detail <> ''
                LIMIT 1
            ) AS architecture,
            (
                SELECT STRING_AGG(e.event_name || ': ' || e.event_description, ' | ')
                FROM events e
                WHERE e.castle_id = c.castle_id
            ) AS festivals_info
        FROM castles c
        LEFT JOIN castle_types ct ON ct.type_id = c.type_id
        WHERE c.castle_id IN :ids
    """)

    rows = db.execute(sql, {"ids": tuple(castle_ids)}).mappings().all()
    return {r["castle_id"]: dict(r) for r in rows}


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
    for f in col.schema.fields:
        if str(getattr(f, "dtype", "")) == "101" or "FLOAT_VECTOR" in str(getattr(f, "dtype", "")):
            try:
                dim = int(getattr(f, "params", {}).get("dim"))
            except Exception:
                dim = None
            return f.name, (dim or 0)
    raise ValueError(f"Vector field not found in collection: {col.name}")


def detect_castle_from_query(db: Session, query: str) -> Optional[Dict[str, Any]]:
    """
    จับชื่อปราสาทจาก keyword table
    ใช้ keyword ที่ยาวที่สุดก่อน เช่น 'ปราสาทหินพิมาย' มาก่อน 'พิมาย'
    """
    sql = text("""
        SELECT
            pr.castle_id,
            pr.place_id,
            k.keyword
        FROM keywords k
        JOIN place_keywords pk ON k.keyword_id = pk.keyword_id
        JOIN places_rag pr ON pk.place_id = pr.place_id
        WHERE REPLACE(LOWER(:query), ' ', '') LIKE '%' || REPLACE(LOWER(k.keyword), ' ', '') || '%'
        ORDER BY LENGTH(k.keyword) DESC
        LIMIT 1
    """)
    row = db.execute(sql, {"query": query}).mappings().first()
    return dict(row) if row else None



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

        # query -> vector
        qvec = doc_embedder.encode(req.query, normalize_embeddings=True).tolist()

        # 1) ตรวจ keyword ก่อน
        # priority:req.castle_id > detected keyword > None

        detected = detect_castle_from_query(db, req.query)

        if req.castle_id is not None:
            expr = f"castle_id == {req.castle_id}"
            matched_castle_id = req.castle_id
            match_source = "request.castle_id"
        elif detected is not None:
            expr = f"castle_id == {detected['castle_id']}"
            matched_castle_id = detected["castle_id"]
            match_source = "keyword"
        else:
            expr = None
            matched_castle_id = None
            match_source = "vector_fallback"

        # 2) search ใน vector db
        res = col.search(
            data=[qvec],
            anns_field="document_vector",
            param={"metric_type": "COSINE", "params": {"ef": 64}},
            limit=req.k,
            expr=expr,
            output_fields=["castle_id", "document_name", "chunk_text"],
        )

        # 3) threshold filtering

        MIN_SCORE = 0.50 if matched_castle_id is not None else 0.55

        raw_hits = []
        filtered_hits = []
        castle_ids = []

        for hit in res[0]:
            score = float(hit.score)
            cid = hit.entity.get("castle_id")
            doc_name = hit.entity.get("document_name") or ""
            chunk_text = sanitize_text(hit.entity.get("chunk_text") or "")

            hit_obj = {
                "score": score,
                "castle_id": int(cid) if cid is not None else None,
                "document_name": doc_name,
                "chunk_text": chunk_text,
            }
            raw_hits.append(hit_obj)

            if score < MIN_SCORE:
                continue

            if not chunk_text.strip():
                continue

            filtered_hits.append(hit_obj)

            if cid is not None:
                castle_ids.append(int(cid))

        filtered_hits = sorted(filtered_hits, key=lambda x: x["score"], reverse=True)

        # ไม่พบข้อมูลที่ผ่าน threshold
        if not filtered_hits:
            return {
                "answer": "### ผลการค้นหา\nขออภัย ไม่พบข้อมูลที่เกี่ยวข้องในฐานข้อมูลเอกสาร",
                "castles": [],
                "hits": [],
                "debug": {
                    "detected": detected,
                    "matched_castle_id": matched_castle_id,
                    "match_source": match_source,
                    "expr": expr,
                    "min_score": MIN_SCORE,
                    "raw_scores": [round(h["score"], 4) for h in raw_hits],
                    "used_scores": []
                }
            }

        # จำกัดจำนวน chunk ที่จะส่งเข้า LLM
        filtered_hits = filtered_hits[:3]

        castle_map = fetch_castles_map(db, list(set(castle_ids)))

        query_lower = req.query.lower()
        is_event_query = any(
            kw in query_lower for kw in [
                "เทศกาล", "กิจกรรม", "event", "งาน", "ประเพณี", "ตอนนี้มีอะไร"
            ]
        )

        # 4) build context
        context_lines = []
        related_castles = set()

        for i, h in enumerate(filtered_hits, start=1):
            c_info = castle_map.get(h["castle_id"])
            if not c_info:
                continue

            related_castles.add(h["castle_id"])

            fest_info = (
                c_info.get("festivals_info") or "ไม่มีข้อมูลกิจกรรม"
            ) if is_event_query else "ผู้ใช้ไม่ได้ถามถึงกิจกรรม"

            context_lines.append(
                f"ข้อมูลชุดที่ {i}\n"
                f"ชื่อปราสาท: {sanitize_text(c_info.get('castle_name') or '')}\n"
                f"ชื่อเอกสาร: {sanitize_text(h.get('document_name') or '')}\n"
                f"คะแนนความเกี่ยวข้อง: {h['score']:.4f}\n"
                f"เนื้อหาจากเอกสาร: {h['chunk_text']}\n"
                f"ข้อมูลกิจกรรมจากฐานข้อมูล: {sanitize_text(fest_info)}"
            )

        context = "\n\n".join(context_lines).strip()

        if not context:
            return {
                "answer": "### ผลการค้นหา\nขออภัย ไม่พบข้อมูลที่เกี่ยวข้องในฐานข้อมูลเอกสาร",
                "castles": [],
                "hits": [],
                "debug": {
                    "detected": detected,
                    "matched_castle_id": matched_castle_id,
                    "match_source": match_source,
                    "expr": expr,
                    "min_score": MIN_SCORE,
                    "raw_scores": [round(h["score"], 4) for h in raw_hits],
                    "used_scores": [round(h["score"], 4) for h in filtered_hits]
                }
            }

        # 5) เรียก LLM
        try:
            llm = get_groq_llm()

            system = SystemMessage(content=(
                "คุณเป็นผู้ช่วยสรุปข้อมูลเกี่ยวกับโบราณสถานไทย\n"
                "กฎสำคัญ:\n"
                "1. ใช้เฉพาะข้อมูลจาก 'บริบทข้อมูล' ที่ได้รับเท่านั้น ห้ามแต่งข้อมูลเอง\n"
                "2. หากบริบทไม่มีคำตอบตรงคำถาม ให้ตอบว่า 'ขออภัย ไม่พบข้อมูลส่วนนี้ในฐานข้อมูลเอกสาร'\n"
                "3. ตอบเป็นภาษาไทยแบบสุภาพ กระชับ ชัดเจน\n"
                "4. ถ้าผู้ใช้ถามถึงโบราณสถานเฉพาะแห่ง ให้ตอบเฉพาะแห่งนั้นก่อน\n"
                "5. ห้ามสรุปเกินกว่าที่ปรากฏในบริบท\n"
            ))

            event_section = (
                "### กิจกรรมและเทศกาล\n"
                "- ระบุเฉพาะข้อมูลที่มีในบริบทเท่านั้น\n\n"
            ) if is_event_query else ""

            human = HumanMessage(content=(
                f"คำถามผู้ใช้: {req.query}\n\n"
                f"บริบทข้อมูล:\n{context}\n\n"
                "โปรดตอบเป็น Markdown ตามรูปแบบนี้:\n"
                "### สรุปจากเอกสาร\n"
                "(ตอบจากบริบทเท่านั้น)\n\n"
                f"{event_section}"
                "### สถานที่ที่เกี่ยวข้อง\n"
                "- ระบุชื่อปราสาทที่เกี่ยวข้องเท่านั้น"
            ))

            ai = llm.invoke([system, human])
            answer_text = sanitize_text(ai.content)

        except Exception:
            top_chunk = filtered_hits[0]["chunk_text"] if filtered_hits else ""
            top_castle_name = "ไม่ระบุ"
            if filtered_hits and filtered_hits[0]["castle_id"] in castle_map:
                top_castle_name = castle_map[filtered_hits[0]["castle_id"]]["castle_name"]

            answer_text = (
                "### สรุปจากเอกสาร\n"
                "ระบบสรุปอัตโนมัติขัดข้อง จึงแสดงข้อความจากเอกสารที่ใกล้เคียงที่สุดแทน\n\n"
                f"{top_chunk}\n\n"
                "### สถานที่ที่เกี่ยวข้อง\n"
                f"- {top_castle_name}"
            )


        # 6) เตรียม castle cards
        castles_out = []
        for cid in related_castles:
            info = castle_map.get(cid)
            if not info:
                continue

            castles_out.append({
                "castle_id": info["castle_id"],
                "castle_name": info["castle_name"],
                "castle_description": info["castle_description"],
                "era": info["era"],
                "type_detail": info["type_detail"],
                "architecture": info["architecture"],
                "festivals": info.get("festivals_info") or "ไม่มีกิจกรรม"
            })

        return {
            "answer": answer_text,
            "castles": castles_out,
            "hits": filtered_hits,
            "debug": {
                "detected": detected,
                "matched_castle_id": matched_castle_id,
                "match_source": match_source,
                "expr": expr,
                "min_score": MIN_SCORE,
                "raw_scores": [round(h["score"], 4) for h in raw_hits],
                "used_scores": [round(h["score"], 4) for h in filtered_hits]
            }
        }

    except Exception as e:
        logger.exception("QA failed")
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
            output_fields=["castle_id", "image_url"]
        )

        MIN_SCORE = 0.85
        hits, castle_ids = [], []

        for hit in res[0]:
            score = float(hit.score)
            if score < MIN_SCORE:
                continue

            cid = hit.entity.get("castle_id")
            cid_int = int(cid) if cid is not None else None
            if cid_int is not None:
                castle_ids.append(cid_int)

            hits.append({
                "score": score,
                "castle_id": cid_int,
                "image_url": hit.entity.get("image_url")
            })

        if not hits:
            return {
                "hits": [],
                "castles": [],
                "message": "ไม่พบรูปภาพที่เกี่ยวข้องในฐานข้อมูล"
            }

        castle_map = fetch_castles_map(db, list(set(castle_ids)))
        best_by_castle = {}

        for h in hits:
            if h["castle_id"]:
                best_by_castle[h["castle_id"]] = max(best_by_castle.get(h["castle_id"], 0.0), h["score"])

        castles = []
        for cid, best in sorted(best_by_castle.items(), key=lambda x: x[1], reverse=True):
            c = castle_map.get(cid)
            if not c:
                continue
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