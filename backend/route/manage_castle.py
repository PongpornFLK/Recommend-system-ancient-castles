from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from db import get_db
from model.model import Castle, Location, Architecture, LocationCastle
from schemas.schemas import CastleFullCreate

from authen.secur import getCurrentUser

router = APIRouter(prefix="/manage-castle", tags=["manage-castle"])


@router.post("/add")
async def add_new_castle(
    req: CastleFullCreate, 
    db: Session = Depends(get_db),
    current_user: dict = Depends(getCurrentUser)
):
    if current_user.get("roles") != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    try:
        new_location = Location(
            latitude=req.latitude,
            longitude=req.longitude,
            sub_district=req.sub_district,
            district=req.district,
            province=req.province
        )
        db.add(new_location)
        db.flush()

        new_castle = Castle(
            castle_name=req.castle_name,
            castle_description=req.castle_description,
            era=req.era,
            type_id=req.type_id
        )
        db.add(new_castle)
        db.flush()

        new_architecture = Architecture(
            castle_id=new_castle.castle_id,
            architec_detail=req.architecture_detail
        )
        db.add(new_architecture)
        db.flush()

        new_location_castle = LocationCastle(
            castle_id=new_castle.castle_id,
            location_id=new_location.location_id
        )
        db.add(new_location_castle)

        db.commit()
        return {
            "status": "success",
            "message": "เพิ่มข้อมูลปราสาทสำเร็จ",
            "castle_id": new_castle.castle_id
        }

    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/list")
def get_castles(
    db: Session = Depends(get_db),
    current_user: dict = Depends(getCurrentUser)
):
    if current_user.get("roles") != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    try:
        results = (
            db.query(Castle, Architecture, Location, LocationCastle)
            .outerjoin(Architecture, Architecture.castle_id == Castle.castle_id)
            .outerjoin(LocationCastle, LocationCastle.castle_id == Castle.castle_id)
            .outerjoin(Location, Location.location_id == LocationCastle.location_id)
            .order_by(Castle.castle_id.asc())
            .all()
        )

        data = []
        for castle, architecture, location, location_castle in results:
            data.append({
                "castle_id": castle.castle_id,
                "castle_name": castle.castle_name,
                "castle_description": castle.castle_description,
                "era": castle.era,
                "type_id": castle.type_id,
                "architecture_detail": architecture.architec_detail if architecture else "",
                "province": location.province if location else "",
                "district": location.district if location else "",
                "sub_district": location.sub_district if location else "",
                "latitude": location.latitude if location else "",
                "longitude": location.longitude if location else "",
            })

        return {"status": "success", "data": data}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.put("/update/{castle_id}")
def update_castle(
    castle_id: int, 
    req: CastleFullCreate, 
    db: Session = Depends(get_db),
    current_user: dict = Depends(getCurrentUser)
):
    if current_user.get("roles") != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    try:
        castle = db.query(Castle).filter(Castle.castle_id == castle_id).first()
        if not castle:
            raise HTTPException(status_code=404, detail="ไม่พบข้อมูลปราสาท")

        castle.castle_name = req.castle_name
        castle.castle_description = req.castle_description
        castle.era = req.era
        castle.type_id = req.type_id

        architecture = db.query(Architecture).filter(Architecture.castle_id == castle_id).first()
        if architecture:
            architecture.architec_detail = req.architecture_detail
        else:
            architecture = Architecture(
                castle_id=castle_id,
                architec_detail=req.architecture_detail
            )
            db.add(architecture)

        location_link = db.query(LocationCastle).filter(LocationCastle.castle_id == castle_id).first()
        if location_link:
            location = db.query(Location).filter(Location.location_id == location_link.location_id).first()
            if location:
                location.latitude = req.latitude
                location.longitude = req.longitude
                location.sub_district = req.sub_district
                location.district = req.district
                location.province = req.province
            else:
                new_location = Location(
                    latitude=req.latitude,
                    longitude=req.longitude,
                    sub_district=req.sub_district,
                    district=req.district,
                    province=req.province
                )
                db.add(new_location)
                db.flush()
                location_link.location_id = new_location.location_id
        else:
            new_location = Location(
                latitude=req.latitude,
                longitude=req.longitude,
                sub_district=req.sub_district,
                district=req.district,
                province=req.province
            )
            db.add(new_location)
            db.flush()

            new_link = LocationCastle(
                castle_id=castle_id,
                location_id=new_location.location_id
            )
            db.add(new_link)

        db.commit()
        return {"status": "success", "message": "แก้ไขข้อมูลสำเร็จ"}

    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/delete/{castle_id}")
def delete_castle(
    castle_id: int, 
    db: Session = Depends(get_db),
    current_user: dict = Depends(getCurrentUser)
):
    if current_user.get("roles") != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    try:
        castle = db.query(Castle).filter(Castle.castle_id == castle_id).first()
        if not castle:
            raise HTTPException(status_code=404, detail="ไม่พบข้อมูลปราสาท")

        architecture = db.query(Architecture).filter(Architecture.castle_id == castle_id).all()
        for item in architecture:
            db.delete(item)

        location_links = db.query(LocationCastle).filter(LocationCastle.castle_id == castle_id).all()
        for link in location_links:
            location = db.query(Location).filter(Location.location_id == link.location_id).first()
            db.delete(link)
            if location:
                db.delete(location)

        db.delete(castle)
        db.commit()

        return {"status": "success", "message": "ลบข้อมูลสำเร็จ"}

    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))