from schemas.schemas import *
from model.model import *
from fastapi import Depends , HTTPException , FastAPI , APIRouter
from sqlalchemy.orm import Session
from db import get_db
from authen.secur import *
from .locationcastle import haversine

router = APIRouter(
    prefix = '/nearplace',
    tags = ['nearplace']
)

# สถานที่ใกล้เคียงกับปราสาทนั้น ตอน create_route
@router.get("")
def readPlaceCastle(castle_id : int , db : Session=Depends(get_db) , current_user : User=Depends(getCurrentUser)) :
    if(current_user.get("roles") != "user"):
        raise HTTPException(status_code=403,detail="You don't have permission")
    
    db_place = db.query(NearbyPlace).filter(NearbyPlace.castle_id == castle_id).all()
    
    return db_place

# get lat long
@router.get("/nearby/user={lat}&{lng}")
async def readPlaceNearMe(
    lat: float,
    lng: float,
    radius: int = 10,
    current_user: User = Depends(getCurrentUser),
    db: Session = Depends(get_db),
):

    if current_user.get("roles") != "user":
        raise HTTPException(status_code=403, detail="You dont have permission")

    db_nearplace = (
        db.query(NearbyPlace.place_name, NearbyPlace.latitude, NearbyPlace.longitude)
        .select_from(NearbyPlace)
        .all()
    )

    if db_nearplace is None:
        raise HTTPException(status_code=404, detail="Not Found")

    near_place = []
    for place in db_nearplace:
        # หน่วยเป็น Km
        distance = haversine(lng, lat, place.longitude, place.latitude)

        if distance <= radius:
            near_place.append(
                {
                    "place_name": place.place_name,
                    "distance": round(distance, 2),
                    "lat": place.latitude,
                    "lng": place.longitude,
                }
            )

    return near_place