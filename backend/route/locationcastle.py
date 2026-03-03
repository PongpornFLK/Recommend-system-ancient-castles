from schemas.schemas import *
from model.model import *
from fastapi import Depends, HTTPException, APIRouter
from sqlalchemy.orm import Session
from db import get_db
from authen.secur import getCurrentUser
from authen.secur import *
from math import radians, cos, sin, asin, sqrt

router = APIRouter(prefix="/locationcastle", tags=["locationcastle"])


# สูตรคำนวณระยะทางแบบ Haversine
def haversine(lon1, lat1, lon2, lat2):
    lon1, lat1, lon2, lat2 = map(radians, [lon1, lat1, lon2, lat2])
    R = 6371
    dlon = lon2 - lon1
    dlat = lat2 - lat1
    a = sin(dlat / 2) ** 2 + cos(lat1) * cos(lat2) * sin(dlon / 2) ** 2
    c = 2 * asin(sqrt(a))
    return R * c


# ดึง castle_id แล้วดูว่าตรงกับ location_id ไหน
@router.get("/{castle_id}", response_model=CastleResponse)
def readLocation(
    castle_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(getCurrentUser),
):
    if current_user.get("roles") != "user":
        raise HTTPException(status_code=403, detail="You don't have permission")

    db_locationcastle = (
        db.query(
            Castle.castle_name,
            Location.location_id,
            Location.latitude,
            Location.longitude,
        )
        .join(LocationCastle, Castle.castle_id == LocationCastle.castle_id)
        .join(Location, LocationCastle.location_id == Location.location_id)
        .filter(LocationCastle.castle_id == castle_id)
        .first()
    )

    if db_locationcastle is None:
        raise HTTPException(status_code=404, detail="Not Found")

    return {
        "castle_id": castle_id,
        "castle_name": db_locationcastle.castle_name,
        "location": {
            "location_id": db_locationcastle.location_id,
            "latitude": db_locationcastle.latitude,
            "longitude": db_locationcastle.longitude,
        },
    }


# get lat long
@router.get("/castle/nearby/user={lat}&{lng}")
def readCastleNearMe(
    lat: float,
    lng: float,
    current_user: User = Depends(getCurrentUser),
    db: Session = Depends(get_db),
):

    if current_user.get("roles") != "user":
        raise HTTPException(status_code=403, detail="You dont have permission")

    db_castle = (
        db.query(Castle.castle_name, Location.latitude, Location.longitude)
        .select_from(Castle)
        .join(LocationCastle)
        .join(Location)
        .all()
    )

    if db_castle is None:
        raise HTTPException(status_code=404, detail="Not Found")

    near_castle = []
    for castle in db_castle:
        # หน่วยเป็น Km
        distance = haversine(lng, lat, castle.longitude, castle.latitude)

        if distance <= 5:
            near_castle.append(
                {
                    "castle_name": castle.castle_name,
                    "distance": round(distance, 2),
                    "lat": castle.latitude,
                    "lng": castle.longitude,
                }
            )

    return near_castle
