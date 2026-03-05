from schemas.schemas import *
from model.model import *
from fastapi import Depends , HTTPException , FastAPI , APIRouter
from sqlalchemy.orm import Session
from db import get_db
from authen.secur import *

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
