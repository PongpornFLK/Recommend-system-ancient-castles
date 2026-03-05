from schemas.schemas import *
from model.model import *
from fastapi import Depends , HTTPException , FastAPI , APIRouter
from sqlalchemy.orm import Session
from db import get_db
from fastapi_pagination.ext.sqlalchemy import paginate 
from fastapi_pagination import Page , Params
from authen.secur import *
from sqlalchemy import asc


router = APIRouter(
    prefix = '/event',
    tags = ['event']
)

@router.post("/users" , response_model= EventResponse)
def createEvent(event : EventCreate , db : Session=Depends(get_db) , current_user : User=Depends(getCurrentUser)):
    db_event=Event(**event.model_dump(exclude={"password"}));
    
    if(current_user.get("roles") != "user"):
        raise HTTPException(status_code=403 , detail="You don't have permission")
    
    db.add(db_event)
    db.commit()
    db.refresh(db_event)
    logger.info(f"success- id : {db_event.event_id}")
    
    return db_event

# get ฝั่ง Admin
@router.get("/admin")
def readEventAll(page: int = 1, size: int = 5,db : Session = Depends(get_db) , current_user : User = Depends(getCurrentUser)) -> Page[EventResponse]:
    
    if(current_user.get("roles") != "admin"):
        raise HTTPException(status_code=403 , detail="You don't have permission")
    
    db_event = db.query(Event).order_by(asc(Event.event_id))
    return paginate(db_event , Params(page=page, size=size))

# get EventDescript หน้า Myplan
@router.get("/event/description/{castle_id}")
def readEventDescript( castle_id : int , db: Session = Depends(get_db) , current_user : User = Depends(getCurrentUser)):
    if(current_user.get("roles") != "user"):
        raise HTTPException(status_code=403,detail="You don't have permission")
    
    db_event = db.query(Event).filter(Event.castle_id == castle_id).first()
    
    if db_event is None:
        raise HTTPException(status_code=404,detail="Not Found")
    
    return db_event


@router.delete("/{event_id}")
async def deleteEvent(event_id:int , current_user : User = Depends(getCurrentUser) , db : Session=Depends(get_db)):
    if(current_user.get("roles") != "admin"):
        raise HTTPException(status_code=403 , detail="Only Admin can Delete!!")
    
    db_event = db.query(Event).filter(Event.event_id == event_id).first()
    
    if db_event is None:
        raise HTTPException(status_code=404, detail="Not Found")
    
    db.delete(db_event)
    db.commit()
    
    return {"message": "Delete Success"}


@router.put("/{event_id}" , response_model = EventResponse)
async def updateEvent(event_id : int , event : EventUpdate , db : Session=Depends(get_db) , current_user : User = Depends(getCurrentUser)):
    db_event = db.query(Event).filter(Event.event_id == event_id).first()
    
    if(current_user.get("roles") != "admin"):
        raise HTTPException(status_code=403 , detail="Only Admin can Update!!")
    if db_event is None:
        raise HTTPException(status_code=404 , detail = "Not Found")
    
    for key , value in event.model_dump(exclude_unset=True).items():
        if key == "castle" and value is not None:
            setattr(db_event, "castle_id", int(value.get("castle_id", 0)))
            if value.get("castle_name"):
                from model.model import Castle
                castle = db.query(Castle).filter(Castle.castle_id == int(value.get("castle_id", 0))).first()
                if castle:
                    castle.castle_name = value.get("castle_name")
                    db.commit()
        elif key != "castle": 
            setattr(db_event, key, value)
            
    db.commit()
    db.refresh(db_event)
    return db_event