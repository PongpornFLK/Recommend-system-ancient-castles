from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from db import get_db
from model.model import Castle, NearbyPlace
from schemas.schemas import NearbyPlaceCreate

router = APIRouter(prefix="/manage-nearby-place", tags=["manage-nearby-place"])


@router.post("/add")
def add_nearby_place(req: NearbyPlaceCreate, db: Session = Depends(get_db)):
    try:
        castle = db.query(Castle).filter(Castle.castle_id == req.castle_id).first()
        if not castle:
            raise HTTPException(status_code=404, detail="ไม่พบข้อมูลปราสาท")

        if not req.place_name.strip():
            raise HTTPException(status_code=400, detail="กรุณากรอกชื่อสถานที่")

        new_place = NearbyPlace(
            castle_id=req.castle_id,
            place_name=req.place_name.strip(),
            nearby_detail=req.nearby_detail.strip() if req.nearby_detail else "",
            latitude=req.latitude,
            longitude=req.longitude,
        )

        db.add(new_place)
        db.commit()
        db.refresh(new_place)

        return {
            "status": "success",
            "message": "เพิ่มสถานที่ใกล้เคียงสำเร็จ",
            "nearplace_id": new_place.nearplace_id,
        }

    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))