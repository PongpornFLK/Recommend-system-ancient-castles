from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from db import get_db
from model.model import Castle, NearbyPlace
from schemas.schemas import NearbyPlaceCreate, NearbyPlaceUpdate

from authen.secur import getCurrentUser

router = APIRouter(prefix="/manage-nearby-place", tags=["manage-nearby-place"])


@router.post("/add")
def add_nearby_place(
    req: NearbyPlaceCreate, 
    db: Session = Depends(get_db),
    current_user: dict = Depends(getCurrentUser)
):
    if current_user.get("roles") != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
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


@router.get("/list")
def get_nearby_places(
    db: Session = Depends(get_db),
    current_user: dict = Depends(getCurrentUser)
):
    if current_user.get("roles") != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    try:
        results = (
            db.query(NearbyPlace, Castle)
            .outerjoin(Castle, Castle.castle_id == NearbyPlace.castle_id)
            .order_by(NearbyPlace.nearplace_id.asc())
            .all()
        )

        data = []
        for nearby_place, castle in results:
            data.append({
                "nearplace_id": nearby_place.nearplace_id,
                "castle_id": nearby_place.castle_id,
                "castle_name": castle.castle_name if castle else "",
                "place_name": nearby_place.place_name,
                "nearby_detail": nearby_place.nearby_detail,
                "latitude": nearby_place.latitude,
                "longitude": nearby_place.longitude,
            })

        return {"status": "success", "data": data}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.put("/update/{nearplace_id}")
def update_nearby_place(
    nearplace_id: int,
    req: NearbyPlaceUpdate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(getCurrentUser)
):
    if current_user.get("roles") != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    try:
        nearby_place = (
            db.query(NearbyPlace)
            .filter(NearbyPlace.nearplace_id == nearplace_id)
            .first()
        )
        if not nearby_place:
            raise HTTPException(status_code=404, detail="ไม่พบข้อมูลสถานที่ใกล้เคียง")

        castle = db.query(Castle).filter(Castle.castle_id == req.castle_id).first()
        if not castle:
            raise HTTPException(status_code=404, detail="ไม่พบข้อมูลปราสาท")

        if not req.place_name.strip():
            raise HTTPException(status_code=400, detail="กรุณากรอกชื่อสถานที่")

        nearby_place.castle_id = req.castle_id
        nearby_place.place_name = req.place_name.strip()
        nearby_place.nearby_detail = req.nearby_detail.strip() if req.nearby_detail else ""
        nearby_place.latitude = req.latitude
        nearby_place.longitude = req.longitude

        db.commit()

        return {"status": "success", "message": "แก้ไขสถานที่ใกล้เคียงสำเร็จ"}

    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/delete/{nearplace_id}")
def delete_nearby_place(
    nearplace_id: int, 
    db: Session = Depends(get_db),
    current_user: dict = Depends(getCurrentUser)
):
    if current_user.get("roles") != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    try:
        nearby_place = (
            db.query(NearbyPlace)
            .filter(NearbyPlace.nearplace_id == nearplace_id)
            .first()
        )
        if not nearby_place:
            raise HTTPException(status_code=404, detail="ไม่พบข้อมูลสถานที่ใกล้เคียง")

        db.delete(nearby_place)
        db.commit()

        return {"status": "success", "message": "ลบสถานที่ใกล้เคียงสำเร็จ"}

    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))