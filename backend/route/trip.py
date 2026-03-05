from schemas.schemas import *
from model.model import *
from fastapi import Depends , HTTPException , FastAPI , APIRouter
from sqlalchemy.orm import Session
from db import get_db
from authen.secur import *

router = APIRouter(
    prefix = '/trip',
    tags = ['trip']
)


# ตอน save ปกติ
@router.post("/create")
def create_trip_plan(
    plan_data: TripPlanCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(getCurrentUser)
):
    if(current_user.get("roles") != "user"):
        raise HTTPException(status_code=403,detail="You don't have permission")
    
    # ทำ Route Name กับ DescriptGPS
    first_name = "ตำแหน่งปัจจุบัน"
    destination_name = plan_data.destination_name
    route_name = f"{first_name} -> {destination_name}"
    
    stop_name = []
    if plan_data.itinerary_data:
        stop_name = [item.place_name for item in plan_data.itinerary_data if item.place_name]
    if stop_name:
        stop_arrow = "->".join(stop_name)
        descript = f"{first_name} -> {stop_arrow} -> {destination_name}"
    else :
        descript = f"{first_name} -> {destination_name}"
        
    # สร้างตาราง Route โดยเอา descript กับ roure_name มาใส่ 
    new_route = Route(
        route_name = route_name,
        description_gps = descript
    )
    db.add(new_route)
    db.flush() # flush ขอ route_id มาจอง
    
    # สร้างตาราง Route Castle
    last_order = 0
    if plan_data.itinerary_data: # ใส่ waypoint
        for index, item in enumerate(plan_data.itinerary_data):
            last_order = index + 1
            route_castle_waypoint = RouteCastle(
                route_id=new_route.route_id,
                castle_id=item.castle_id,
                sequence_order=index + 1
            )
            db.add(route_castle_waypoint)
            
    route_castle_dest = RouteCastle( # ใส่ destination
        route_id=new_route.route_id,
        castle_id=plan_data.destination_id,
        sequence_order=last_order + 1
    )
    db.add(route_castle_dest)
    
    # สร้างตาราง Trip plan
    trip_plan = TripPlan(
        user_id=current_user.user_id,
        plan_name=plan_data.plan_name,
        event_description=plan_data.event_description,
        start_date=plan_data.start_date,
        end_date=plan_data.end_date,
        duration=plan_data.duration,
        route_id=new_route.route_id,
        event_id=plan_data.event_id,
        status="travelling",  
        destination_name=plan_data.destination_name,  
        destination_lat=plan_data.destination_lat,  
        destination_lng=plan_data.destination_lng  
    )
    
    db.add(trip_plan)
    db.flush()
    
    if plan_data.itinerary_data:
        for item in plan_data.itinerary_data:
            itinerary = TripItinerary(
                plan_id=trip_plan.plan_id, 
                castle_id=item.castle_id,
                event_id=item.event_id,
                start_time=item.start_time,
                end_time=item.end_time
            )
            db.add(itinerary)
        
    db.commit() # บันทึกจุดแวะพักทั้งหมดลงฐานข้อมูล
    
    return {
        "trip_id": trip_plan.plan_id,
        "route_id" : new_route.route_id,
        "status": "travelling",
        "message": "Trip plan and stops created successfully"
    }


# เมื่อ status success จะสร้างเข้า TripItinerary
@router.post("/{trip_id}/confirm")
def confirm_trip_plan(
    trip_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(getCurrentUser)
):
    if(current_user.get("roles") != "user"):
        raise HTTPException(status_code=403,detail="You don't have permission")
    
    # Get trip plan
    trip_plan = db.query(TripPlan).filter(TripPlan.plan_id == trip_id).first()
    if not trip_plan:
        raise HTTPException(status_code=404, detail="Trip plan not found")
    
    if trip_plan.user_id != current_user.user_id:
        raise HTTPException(status_code=403, detail="You don't have permission to access this trip")
    
    # Update status
    trip_plan.status = "success"
    
    db.commit()
    
    return {
        "status": "success", 
        "message": "Trip plan confirmed successfully",
        "trip_id": trip_id
    }
    
# get trip ทั้งหมดของ user คนนั้น
@router.get("/user" , response_model=List[TripPlanResponse])
def get_user_trips(
    db: Session = Depends(get_db),
    current_user: User = Depends(getCurrentUser)
):
    if(current_user.get("roles") != "user"):
        raise HTTPException(status_code=403,detail="You don't have permission")
    
    trips = db.query(TripPlan).filter(TripPlan.user_id == current_user.get("user_id")).all()
    return trips

# get รายละเอียดทริป
@router.get("/{trip_id}")
def get_trip_details(
    trip_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(getCurrentUser)
):
    if(current_user.get("roles") != "user"):
        raise HTTPException(status_code=403,detail="You don't have permission")
    
    trip = db.query(TripPlan).filter(TripPlan.plan_id == trip_id).first()
    if not trip:
        raise HTTPException(status_code=404, detail="Trip plan not found")
    
    if trip.user_id != current_user.user_id:
        raise HTTPException(status_code=403, detail="You don't have permission to access this trip")
    
    # Get itinerary items
    itineraries = db.query(TripItinerary).filter(TripItinerary.plan_id == trip_id).all()
    
    return {
        "trip": trip,
        "itineraries": itineraries
    }
