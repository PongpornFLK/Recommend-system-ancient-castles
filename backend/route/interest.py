from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import text
from db import get_db
from model.model import Interest, Castle
from schemas.schemas import InterestCreate, InterestResponse
from typing import List, Annotated
from loguru import logger
router = APIRouter(prefix="/interests", tags=["interests"])
from authen.secur import *
def fetch_cover_images_map(db: Session, castle_ids: list[int]) -> dict[int, str]:
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

# ตรวจสอบว่า User คนนี้กดใจสถานที่นี้ไปหรือยัง
@router.get("/check")
def check_favorite(
    castle_id: int, 
    user_id: int, # รับค่าจากหน้าบ้าน (แต่เราจะเช็คเพิ่มเพื่อความปลอดภัย)
    db: Session = Depends(get_db),
    current_user: dict = Depends(getCurrentUser)
):
    # ป้องกัน IDOR: ถ้าแอบส่อง ID คนอื่น จะโดนเตะออก
    if current_user["user_id"] != user_id:
        raise HTTPException(status_code=403, detail="Not authorized")
        
    fav = db.query(Interest).filter(Interest.user_id == user_id, Interest.castle_id == castle_id).first()
    return {
        "is_favorite": fav is not None,
        "interest_id": fav.interest_id if fav else None
    }

# เพิ่มรายการโปรด
@router.post("", response_model=InterestResponse)
def add_favorite(
    req: InterestCreate, 
    db: Session = Depends(get_db),
    current_user: dict = Depends(getCurrentUser)
):
    # ป้องกัน IDOR: บังคับใช้ user_id จาก Token เท่านั้น
    user_id = current_user["user_id"]
    
    existing = db.query(Interest).filter(Interest.user_id == user_id, Interest.castle_id == req.castle_id).first()
    if existing: 
        return existing
    
    new_fav = Interest(
        user_id=user_id,
        castle_id=req.castle_id,
        interest_name=req.interest_name
    )
    db.add(new_fav)
    db.commit()
    db.refresh(new_fav)
    return new_fav

# ดึงรายการโปรดทั้งหมดของ User
@router.get("/{user_id}")
def get_user_favorites(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: dict = Depends(getCurrentUser)
):
    # ป้องกัน IDOR: ห้ามดูรายการโปรดคนอื่น
    if current_user["user_id"] != user_id:
        raise HTTPException(status_code=403, detail="Not authorized")

    try:
        results = (
            db.query(Interest, Castle)
            .join(Castle, Interest.castle_id == Castle.castle_id)
            .filter(Interest.user_id == user_id)
            .all()
        )

        castle_ids = [row.Castle.castle_id for row in results]
        cover_map = fetch_cover_images_map(db, castle_ids)

        output = []
        for row in results:
            output.append({
                "interest_id": row.Interest.interest_id,
                "castle_id": row.Castle.castle_id,
                "castle_name": row.Castle.castle_name,
                "user_id": row.Interest.user_id,
                "cover_image": cover_map.get(row.Castle.castle_id),
            })

        return output
    except Exception as e:
        logger.error(f"Error fetching favorites: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# ลบรายการโปรด
@router.delete("/{interest_id}")
def delete_favorite(
    interest_id: int, 
    db: Session = Depends(get_db),
    current_user: dict = Depends(getCurrentUser)
):
    fav = db.query(Interest).filter(Interest.interest_id == interest_id).first()
    if not fav:
        raise HTTPException(status_code=404, detail="Not found")
        
    # ป้องกัน IDOR: ลบได้เฉพาะของตัวเอง
    if fav.user_id != current_user["user_id"]:
        raise HTTPException(status_code=403, detail="Forbidden")

    db.delete(fav)
    db.commit()
    return {"message": "Deleted"}
