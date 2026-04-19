from typing import Optional, List, Dict, Any
from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session
from sqlalchemy import text

from db import get_db

router = APIRouter(prefix="/filters", tags=["filters"])


class FilterReq(BaseModel):
    province: Optional[str] = None
    district: Optional[str] = None
    subdistrict: Optional[str] = None
    era: Optional[str] = None
    architecture: Optional[str] = None
    type_id: Optional[int] = None


def fetch_cover_images_map(db: Session, castle_ids: List[int]) -> Dict[int, str]:
    if not castle_ids:
        return {}

    ids = list(set([int(cid) for cid in castle_ids if cid is not None]))
    if not ids:
        return {}

    placeholders = ", ".join([str(cid) for cid in ids])

    sql = text(f"""
        SELECT DISTINCT ON (i.castle_id)
            i.castle_id,
            i.img_url
        FROM images i
        WHERE i.castle_id IN ({placeholders})
        ORDER BY i.castle_id, i.is_cover DESC, i.sort_order ASC, i.img_id ASC
    """)

    rows = db.execute(sql).mappings().all()
    return {r["castle_id"]: r["img_url"] for r in rows}


@router.get("/options")
def get_filter_options(db: Session = Depends(get_db)):
    provinces = [
        r[0] for r in db.execute(
            text("SELECT DISTINCT province FROM locations WHERE province IS NOT NULL AND province <> '' ORDER BY province ASC")
        ).all()
    ]
    districts = [
        r[0] for r in db.execute(
            text("SELECT DISTINCT district FROM locations WHERE district IS NOT NULL AND district <> '' ORDER BY district ASC")
        ).all()
    ]
    subdistricts = [
        r[0] for r in db.execute(
            text("SELECT DISTINCT sub_district FROM locations WHERE sub_district IS NOT NULL AND sub_district <> '' ORDER BY sub_district ASC")
        ).all()
    ]
    eras = [
        r[0] for r in db.execute(
            text("SELECT DISTINCT era FROM castles WHERE era IS NOT NULL AND era <> '' ORDER BY era ASC")
        ).all()
    ]
    architectures = [
        r[0] for r in db.execute(
            text("SELECT DISTINCT architec_detail FROM architectures WHERE architec_detail IS NOT NULL AND architec_detail <> '' ORDER BY architec_detail ASC")
        ).all()
    ]
    types = [
        {"type_id": int(r[0]), "type_detail": r[1]}
        for r in db.execute(
            text("SELECT type_id, type_detail FROM castle_types ORDER BY type_id ASC")
        ).all()
    ]

    return {
        "provinces": provinces,
        "districts": districts,
        "subdistricts": subdistricts,
        "eras": eras,
        "architectures": architectures,
        "types": types,
    }


@router.post("/search")
def filter_search(req: FilterReq, db: Session = Depends(get_db)):
    sql = """
    SELECT DISTINCT
        c.castle_id,
        c.castle_name,
        c.castle_description,
        c.era,
        c.type_id,
        ct.type_detail,
        (
            SELECT a2.architec_detail
            FROM architectures a2
            WHERE a2.castle_id = c.castle_id
              AND a2.architec_detail IS NOT NULL
              AND a2.architec_detail <> ''
            LIMIT 1
        ) AS architecture
    FROM castles c
    LEFT JOIN castle_types ct ON ct.type_id = c.type_id
    LEFT JOIN location_castles lc ON lc.castle_id = c.castle_id
    LEFT JOIN locations l ON l.location_id = lc.location_id
    LEFT JOIN architectures a ON a.castle_id = c.castle_id
    WHERE 1=1
    """

    params: Dict[str, Any] = {}

    if req.province:
        sql += " AND l.province = :province"
        params["province"] = req.province

    if req.district:
        sql += " AND l.district = :district"
        params["district"] = req.district

    if req.subdistrict:
        sql += " AND l.sub_district = :subdistrict"
        params["subdistrict"] = req.subdistrict

    if req.era:
        sql += " AND c.era ILIKE :era"
        params["era"] = f"%{req.era}%"

    if req.type_id is not None:
        sql += " AND c.type_id = :type_id"
        params["type_id"] = req.type_id

    if req.architecture:
        sql += " AND a.architec_detail ILIKE :architecture"
        params["architecture"] = f"%{req.architecture}%"

    sql += " ORDER BY c.castle_id ASC"

    rows = db.execute(text(sql), params).mappings().all()

    castle_ids = [r["castle_id"] for r in rows]
    cover_map = fetch_cover_images_map(db, castle_ids)

    out = []
    for r in rows:
        out.append({
            "castle_id": r["castle_id"],
            "castle_name": r["castle_name"],
            "castle_description": r["castle_description"] or "",
            "era": r["era"] or "ไม่ระบุ",
            "type_id": r["type_id"],
            "type_detail": r["type_detail"] or "ไม่ระบุ",
            "architecture": r["architecture"] or "ไม่มีข้อมูล",
            "cover_image": cover_map.get(r["castle_id"]),
        })

    return {"count": len(out), "castles": out}