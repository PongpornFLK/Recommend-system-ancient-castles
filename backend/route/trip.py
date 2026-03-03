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

@router.post("/create")
def create_trip_plan(
    plan_data: TripPlanCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(getCurrentUser)
):
    if(current_user.get("roles") != "user"):
        raise HTTPException(status_code=403,detail="You don't have permission")
    
    # Create trip plan with "pending" status
    trip_plan = TripPlan(
        user_id=current_user.user_id,
        plan_name=plan_data.plan_name,
        event_description=plan_data.event_description,
        start_date=plan_data.start_date,
        end_date=plan_data.end_date,
        duration=plan_data.duration,
        route_id=plan_data.route_id,
        event_id=plan_data.event_id,
        status="pending"  # Initial status
    )
    
    db.add(trip_plan)
    db.commit()
    db.refresh(trip_plan)
    
    return {
        "trip_id": trip_plan.plan_id,
        "status": "pending",
        "message": "Trip plan created successfully"
    }

@router.post("/{trip_id}/confirm")
def confirm_trip_plan(
    trip_id: int,
    itinerary_data: List[TripItineraryCreate],
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
    
    # Update status to "success"
    trip_plan.status = "success"
    
    # Create itinerary items
    for item in itinerary_data:
        itinerary = TripItinerary(
            plan_id=trip_id,
            castle_id=item.castle_id,
            event_id=item.event_id,
            start_time=item.start_time,
            end_time=item.end_time
        )
        db.add(itinerary)
    
    db.commit()
    
    return {
        "status": "success", 
        "message": "Trip plan confirmed successfully",
        "trip_id": trip_id
    }

@router.get("/user")
def get_user_trips(
    db: Session = Depends(get_db),
    current_user: User = Depends(getCurrentUser)
):
    if(current_user.get("roles") != "user"):
        raise HTTPException(status_code=403,detail="You don't have permission")
    
    trips = db.query(TripPlan).filter(TripPlan.user_id == current_user.user_id).all()
    return trips

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
