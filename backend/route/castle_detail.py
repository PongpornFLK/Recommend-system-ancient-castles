from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import text
from db import get_db

router = APIRouter(prefix="/castles", tags=["castles"])

@router.get("/{castle_id}")
def get_castle_detail(castle_id: int, db: Session = Depends(get_db)):
    # 1) ดึงข้อมูลพื้นฐาน castles + type_detail
    row = db.execute(
        text(
            """
            SELECT
                c.castle_id,
                c.castle_name,
                c.castle_description,
                c.era,
                c.type_id,
                ct.type_detail
            FROM castles c
            LEFT JOIN castle_types ct ON ct.type_id = c.type_id
            WHERE c.castle_id = :id
            """
        ),
        {"id": castle_id},
    ).fetchone()

    if not row:
        raise HTTPException(status_code=404, detail="Castle not found")

    # 2) ดึงข้อมูลตำแหน่งที่ตั้ง (Location)
    loc = db.execute(
        text(
            """
            SELECT l.province, l.district, l.sub_district
            FROM location_castles lc
            JOIN locations l ON l.location_id = lc.location_id
            WHERE lc.castle_id = :id
            LIMIT 1
            """
        ),
        {"id": castle_id},
    ).fetchone()

    province = (loc[0] if loc else "") or ""
    district = (loc[1] if loc else "") or ""
    subdistrict = (loc[2] if loc else "") or ""

    # 3) architectures => รวมเป็นข้อความเดียว
    arch_rows = db.execute(
        text(
            """
            SELECT DISTINCT a.architec_detail
            FROM architectures a
            WHERE a.castle_id = :id
              AND a.architec_detail IS NOT NULL
              AND a.architec_detail <> ''
            ORDER BY a.architec_detail ASC
            """
        ),
        {"id": castle_id},
    ).fetchall()
    arch_list = [r[0] for r in arch_rows] if arch_rows else []
    architecture = "\n".join(arch_list)

    # 4) nearby places => แก้ไข ORDER BY เพราะไม่มีคอลัมน์ place_id
    nearby_rows = db.execute(
        text(
            """
            SELECT place_name, nearby_detail
            FROM nearby_places
            WHERE castle_id = :id
            ORDER BY place_name ASC
            """
        ),
        {"id": castle_id},
    ).fetchall()

    nearby_places = [
        {"place_name": r[0] or "", "nearby_detail": r[1] or ""} for r in (nearby_rows or [])
    ]

    return {
        "castle_id": row[0],
        "castle_name": row[1],
        "castle_description": row[2] or "",
        "era": row[3] or "",
        "type_id": row[4],
        "type_detail": row[5] or "",
        "province": province,
        "district": district,
        "subdistrict": subdistrict,
        "architecture": architecture,
        "nearby_places": nearby_places,
    }