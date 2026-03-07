from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from db import get_db
from model.model import Interest, Castle # มั่นใจว่ามี Model เหล่านี้ใน model.py
from schemas.schemas import InterestCreate, InterestResponse # สร้าง Schema รองรับ
from typing import List, Annotated
from loguru import logger
router = APIRouter(prefix="/interests", tags=["interests"])

# ตรวจสอบว่า User คนนี้กดใจสถานที่นี้ไปหรือยัง
@router.get("/check")
def check_favorite(user_id: int, castle_id: int, db: Session = Depends(get_db)):
    fav = db.query(Interest).filter(Interest.user_id == user_id, Interest.castle_id == castle_id).first()
    return {
        "is_favorite": fav is not None,
        "interest_id": fav.interest_id if fav else None
    }

# เพิ่มรายการโปรด
@router.post("", response_model=InterestResponse)
def add_favorite(req: InterestCreate, db: Session = Depends(get_db)):
    existing = db.query(Interest).filter(Interest.user_id == req.user_id, Interest.castle_id == req.castle_id).first()
    if existing: return {"message": "Already added"}
    
    new_fav = Interest(**req.model_dump())
    db.add(new_fav)
    db.commit()
    return new_fav
    

# ดึงรายการโปรดทั้งหมดของ User (JOIN กับตาราง castles เพื่อเอาชื่อและรูป)
@router.get("/{user_id}")
def get_user_favorites(user_id: int, db: Session = Depends(get_db)):
    try:
        # ตรวจสอบการ Join และการดึงข้อมูล
        results = db.query(Interest, Castle).join(
            Castle, Interest.castle_id == Castle.castle_id
        ).filter(Interest.user_id == user_id).all()
        
        # ปรับการ Return ให้เป็น list ของ dictionary ที่เรียบง่าย
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
def delete_favorite(interest_id: int, db: Session = Depends(get_db)):
    db.query(Interest).filter(Interest.interest_id == interest_id).delete()
    db.commit()
    return {"message": "Deleted"}
