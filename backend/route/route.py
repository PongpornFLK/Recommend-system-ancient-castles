from schemas.schemas import *
from model.model import *
from fastapi import Depends , HTTPException , APIRouter
from sqlalchemy.orm import Session
from db import get_db
from fastapi_pagination.ext.sqlalchemy import paginate 
from authen.secur import *


router = APIRouter(
    prefix = '/route',
    tags = ['route']
)

# get Route ทั้งหมดของ User คนนั้น
@router.get("/{user_id}")
async def readRoute(user_id : int , db : Session = Depends(get_db), current_user : User = Depends(getCurrentUser)) :
    
    if(current_user.get("roles") != "user"):
        raise HTTPException(status_code=403,detail="You don't have permission")
    if(current_user.get("user_id") != user_id):
        raise HTTPException(status_code=403,detail="You can't see Route")
    
    db_route = db.query(Route).join(TripPlan,Route.route_id == TripPlan.route_id).filter(TripPlan.user_id == user_id).all() 
       
    return db_route

# get เฉพาะ Route ที่ไปใน Trip นั้น
@router.get("/trip/{plan_id}")
async def getRouteTrip(plan_id : int , db : Session = Depends(get_db) , current_user : User = Depends(getCurrentUser)):
    
    if(current_user.get("roles") != "user"):
        raise HTTPException(status_code=403,detail="You don't have permission")

    db_plan = db.query(TripPlan).filter(TripPlan.plan_id == plan_id).first()
    
    if db_plan is None:
        raise HTTPException(status_code=404,detail="Not Found")
    if(current_user.get("user_id") != db_plan.user_id):
        raise HTTPException(status_code=403,detail="You can't see Route in this Trip")
    
    db_route_trip = db.query(Route).filter(Route.route_id == db_plan.route_id).all()
    
    return {
        "route_trip" : db_route_trip,
        "map_url" : db_plan.map_url
    }