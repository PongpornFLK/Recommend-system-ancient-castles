# backend/route/zilliz_search.py
import os
from typing import Optional, List, Dict, Any

from dotenv import load_dotenv
from fastapi import APIRouter, UploadFile, File, Depends
from pydantic import BaseModel

from pymilvus import connections, Collection
from sentence_transformers import SentenceTransformer
from PIL import Image

from sqlalchemy.orm import Session

from db import get_db
from model.model import Castle  # <-- ORM class ชื่อ Castle อยู่ใน backend/model/model.py

load_dotenv()

router = APIRouter(prefix="/zilliz", tags=["zilliz"])

# โหลดโมเดลครั้งเดียว (ตอน start backend)
doc_embedder = SentenceTransformer("sentence-transformers/paraphrase-multilingual-mpnet-base-v2")  # dim=768
img_embedder = SentenceTransformer("sentence-transformers/clip-ViT-B-32")  # dim=512


# ---------- Zilliz helpers ----------
def connect_zilliz():
    uri = os.getenv("ZILLIZ_URI")
    token = os.getenv("ZILLIZ_TOKEN")
    if not uri or not token:
        raise ValueError("❌ Missing ZILLIZ_URI / ZILLIZ_TOKEN (check .env)")
    if not connections.has_connection("default"):
        connections.connect(alias="default", uri=uri, token=token, secure=True)


def get_collection(name: str) -> Collection:
    col = Collection(name)
    col.load()
    return col


# ---------- DB helpers ----------
def fetch_castles(db: Session, castle_ids: List[int]) -> Dict[int, Dict[str, Any]]:
    """
    ดึงข้อมูลปราสาทจากตาราง castles ตามรายการ castle_id
    คืนค่าเป็น dict: {castle_id: {...fields...}}
    """
    if not castle_ids:
        return {}

    rows = (
        db.query(Castle)
        .filter(Castle.castle_id.in_(castle_ids))
        .all()
    )

    out: Dict[int, Dict[str, Any]] = {}
    for c in rows:
        out[int(c.castle_id)] = {
            "castle_id": int(c.castle_id),
            "castle_name": c.castle_name,
            "castle_description": c.castle_description,
            "era": c.era,
            "type_id": c.type_id,
        }
    return out


# ---------- Request models ----------
class DocSearchReq(BaseModel):
    query: str
    k: int = 5
    castle_id: Optional[int] = None


# ---------- Routes ----------
@router.post("/docs")
def search_docs(req: DocSearchReq, db: Session = Depends(get_db)):
    """
    1) แปลง query -> vector
    2) search ใน document_vectors
    3) เอา castle_id ที่เจอ ไป join กับ DB castles
    4) return hits + castles
    """
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
        output_fields=["castle_id", "document_name", "chunk_id", "chunk_text", "source_url"]
    )

    hits: List[Dict[str, Any]] = []
    castle_ids: List[int] = []
    best_score_by_castle: Dict[int, float] = {}

    for hit in res[0]:
        cid = hit.entity.get("castle_id")
        score = float(hit.score)

        if cid is not None:
            cid = int(cid)
            castle_ids.append(cid)
            best_score_by_castle[cid] = max(best_score_by_castle.get(cid, -1e9), score)

        hits.append({
            "score": score,
            "castle_id": cid,
            "document_name": hit.entity.get("document_name"),
            "chunk_id": hit.entity.get("chunk_id"),
            "text": hit.entity.get("chunk_text"),
            "source_url": hit.entity.get("source_url"),
        })

    unique_ids = sorted(set(castle_ids))
    castle_map = fetch_castles(db, unique_ids)

    castles: List[Dict[str, Any]] = []
    for cid in unique_ids:
        c = castle_map.get(cid)
        if c:
            c = dict(c)
            c["best_score"] = float(best_score_by_castle.get(cid, 0.0))
            castles.append(c)

    castles.sort(key=lambda x: x.get("best_score", 0.0), reverse=True)

    return {"hits": hits, "castles": castles}


@router.post("/images")
async def search_images(
    file: UploadFile = File(...),
    k: int = 5,
    castle_id: Optional[int] = None,
    db: Session = Depends(get_db),
):
    """
    1) แปลงรูป -> vector
    2) search ใน image_vectors
    3) เอา castle_id ที่เจอ ไป join กับ DB castles
    4) return hits + castles
    """
    connect_zilliz()
    col = get_collection("image_vectors")

    img = Image.open(file.file).convert("RGB")
    qvec = img_embedder.encode(img, normalize_embeddings=True).tolist()
    expr = f"castle_id == {castle_id}" if castle_id is not None else None

    res = col.search(
        data=[qvec],
        anns_field="image_vector",
        param={"params": {"ef": 64}},
        limit=k,
        expr=expr,
        output_fields=["img_id", "castle_id", "place_id", "image_url"]
    )

    hits: List[Dict[str, Any]] = []
    castle_ids: List[int] = []
    best_score_by_castle: Dict[int, float] = {}

    for hit in res[0]:
        cid = hit.entity.get("castle_id")
        score = float(hit.score)

        if cid is not None:
            cid = int(cid)
            castle_ids.append(cid)
            best_score_by_castle[cid] = max(best_score_by_castle.get(cid, -1e9), score)

        hits.append({
            "score": score,
            "img_id": hit.entity.get("img_id"),
            "castle_id": cid,
            "place_id": hit.entity.get("place_id"),
            "image_url": hit.entity.get("image_url"),
        })

    unique_ids = sorted(set(castle_ids))
    castle_map = fetch_castles(db, unique_ids)

    castles: List[Dict[str, Any]] = []
    for cid in unique_ids:
        c = castle_map.get(cid)
        if c:
            c = dict(c)
            c["best_score"] = float(best_score_by_castle.get(cid, 0.0))
            castles.append(c)

    castles.sort(key=lambda x: x.get("best_score", 0.0), reverse=True)

    return {"hits": hits, "castles": castles}
