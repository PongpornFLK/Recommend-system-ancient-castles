from schemas.schemas import *
from model.model import *
from fastapi import Depends, HTTPException, FastAPI, APIRouter
from sqlalchemy.orm import Session
from db import get_db
from authen.secur import *
from datetime import datetime

router = APIRouter(prefix="/trip", tags=["trip"])


# ตอน save ปกติ และ create Route , create_RouteCastle
@router.post("/create")
def createTrip(
    plan_data: TripPlanCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(getCurrentUser),
):
    try:
        if current_user.get("roles") != "user":
            raise HTTPException(status_code=403, detail="You don't have permission")

        castle = db.query(Castle).filter(Castle.castle_id == plan_data.castle_id).first()

        if castle is None:
            raise HTTPException(status_code=404, detail="Not Found Castle")

        first_name = "ตำแหน่งปัจจุบัน"
        destination_name = castle.castle_name
        route_name = f"{first_name} -> {destination_name}"

        stop_name = []
        if plan_data.itinerary_data:
            stop_name = [
                item.place_name for item in plan_data.itinerary_data if item.place_name
            ]
        
        if stop_name:
            stop_arrow = "->".join(stop_name)
            descript = f"{first_name} -> {stop_arrow} -> {destination_name}"
        else:
            descript = f"{first_name} -> {destination_name}"

        # สร้างตาราง Route
        new_route = Route(route_name=route_name, description_gps=descript)
        db.add(new_route)
        db.flush()

        # ป้องกัน Duplicate castle_id ใน RouteCastle
        added_castle_ids = set()
        last_order = 0

        if plan_data.itinerary_data:
            for item in plan_data.itinerary_data:
                if item.castle_id and item.castle_id not in added_castle_ids:
                    last_order += 1
                    route_castle = RouteCastle(
                        route_id=new_route.route_id,
                        castle_id=item.castle_id,
                        sequence_order=last_order,
                    )
                    db.add(route_castle)
                    added_castle_ids.add(item.castle_id)

        # เพิ่มจุดหมายปลายทาง (ถ้ายังไม่มีในรายการ)
        if plan_data.castle_id not in added_castle_ids:
            route_castle_dest = RouteCastle(
                route_id=new_route.route_id,
                castle_id=plan_data.castle_id,
                sequence_order=last_order + 1,
            )
            db.add(route_castle_dest)

        # สร้างตาราง Trip plan
        trip_plan = TripPlan(
            user_id=current_user.get("user_id"),
            plan_name=plan_data.plan_name,
            event_description=plan_data.event_description,
            start_date=plan_data.start_date,
            end_date=plan_data.end_date,
            duration=plan_data.duration,
            route_id=new_route.route_id,
            event_id=plan_data.event_id,
            status="travelling",
            castle_id=plan_data.castle_id,
        )

        db.add(trip_plan)
        db.flush()

        if plan_data.itinerary_data:
            for item in plan_data.itinerary_data:
                if item.castle_id:
                    itinerary = TripItinerary(
                        plan_id=trip_plan.plan_id,
                        castle_id=item.castle_id,
                        event_id=item.event_id,
                        start_time=item.start_time,
                        end_time=item.end_time,
                    )
                    db.add(itinerary)

        db.commit()
        return {
            "trip_id": trip_plan.plan_id,
            "route_id": new_route.route_id,
            "status": "travelling",
            "message": "Trip plan created successfully",
        }
    except Exception as e:
        db.rollback()
        print(f"Error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

# เมื่อ status success จะสร้างเข้า TripItinerary
@router.post("/{trip_id}/confirm")
def confirmTrip(
    trip_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(getCurrentUser),
):
    if current_user.get("roles") != "user":
        raise HTTPException(status_code=403, detail="You don't have permission")

    # Get trip plan
    trip_plan = db.query(TripPlan).filter(TripPlan.plan_id == trip_id).first()
    if not trip_plan:
        raise HTTPException(status_code=404, detail="Trip plan not found")

    if trip_plan.user_id != current_user.get("user_id"):
        raise HTTPException(
            status_code=403, detail="You don't have permission to access this trip"
        )

    # Update status
    trip_plan.status = "success"
    trip_plan.end_date = datetime.now()

    db.commit()

    return {
        "status": "success",
        "message": "Trip plan confirmed successfully",
        "trip_id": trip_id,
    }


# get trip ทั้งหมดของ user คนนั้น
@router.get("/user", response_model=List[TripPlanResponse])
def getUserTrips(
    db: Session = Depends(get_db), current_user: User = Depends(getCurrentUser)
):
    if current_user.get("roles") != "user":
        raise HTTPException(status_code=403, detail="You don't have permission")

    trips = (
        db.query(TripPlan, Castle.castle_name, Location.latitude, Location.longitude)
        .join(Castle , TripPlan.castle_id == Castle.castle_id)
        .join(LocationCastle, Castle.castle_id == LocationCastle.castle_id)
        .join(Location, LocationCastle.location_id == Location.location_id)
        .filter(TripPlan.user_id == current_user.get("user_id")).all()
    )
    
    db_trip = []
    
    for trip_data, castle_name, lat, lng in trips:
        db_trip.append({
            "plan_id" : trip_data.plan_id,
            "user_id" : trip_data.user_id,
            "route_id" : trip_data.route_id,
            "castle_id" : trip_data.castle_id,
            "event_id" : trip_data.event_id,
            "plan_name" : trip_data.plan_name,
            "event_description" : trip_data.event_description,
            "start_date" : trip_data.start_date,
            "end_date" : trip_data.end_date,
            "duration" : trip_data.duration,
            "status" : trip_data.status,
            "destination_name" : castle_name,
            "destination_lat" : lat,
            "destination_lng" : lng,
        })
        
    return db_trip


# get รายละเอียดทริป
@router.get("/{trip_id}")
def getTripDetails(
    trip_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(getCurrentUser),
):
    if current_user.get("roles") != "user":
        raise HTTPException(status_code=403, detail="You don't have permission")

    trip = db.query(TripPlan).filter(TripPlan.plan_id == trip_id).first()
    if not trip:
        raise HTTPException(status_code=404, detail="Trip plan not found")

    if trip.user_id != current_user.get("user_id"):
        raise HTTPException(
            status_code=403, detail="You don't have permission to access this trip"
        )

    # Get itinerary items
    itineraries = db.query(TripItinerary).filter(TripItinerary.plan_id == trip_id).all()

    return {"trip": trip, "itineraries": itineraries}


@router.post("/{trip_id}/cancel")
def cancelTrip(
    trip_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(getCurrentUser),
):
    if current_user.get("roles") != "user":
        raise HTTPException(status_code=403, detail="You don't have permission")

    trip_plan = db.query(TripPlan).filter(TripPlan.plan_id == trip_id).first()
    if not trip_plan:
        raise HTTPException(status_code=404, detail="Trip plan not found")

    if trip_plan.user_id != current_user.get("user_id"):
        raise HTTPException(
            status_code=403, detail="You don't have permission to access this trip"
        )

    # เปลี่ยนเป็น cancel
    trip_plan.status = "cancel"
    db.commit()

    return {"status": "cancel", "message": "Trip plan cancelled successfully"}


# cancle แล้วถึง ลบ trip ได้
@router.delete("/{trip_id}")
def deleteTrip(
    trip_id: int,
    db: Session = Depends(get_db),
    current_user: dict = Depends(getCurrentUser),
):
    trip = db.query(TripPlan).filter(TripPlan.plan_id == trip_id).first()

    if not trip:
        raise HTTPException(status_code=404, detail="Trip plan not found")

    if trip.user_id != current_user.get("user_id"):
        raise HTTPException(
            status_code=403, detail="You don't have permission to delete this trip"
        )

    db.delete(trip)
    db.commit()

    return {"status": "success", "message": "Trip plan deleted successfully"}
