from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from db import get_db
from model.model import Interest, Castle # มั่นใจว่ามี Model เหล่านี้ใน model.py
from schemas.schemas import InterestCreate, InterestResponse # สร้าง Schema รองรับ
from typing import List, Annotated
from loguru import logger
router = APIRouter(prefix="/interests", tags=["interests"])
from authen.secur import *


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
        results = db.query(Interest, Castle).join(
            Castle, Interest.castle_id == Castle.castle_id
        ).filter(Interest.user_id == user_id).all()
        
        output = []
        for row in results:
            output.append({
                "interest_id": row.Interest.interest_id,
                "castle_id": row.Castle.castle_id,
                "castle_name": row.Castle.castle_name,
                "user_id": row.Interest.user_id
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
