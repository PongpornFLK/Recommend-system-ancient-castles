from schemas.schemas import *
from model.model import *
from fastapi import Depends, HTTPException, APIRouter
from sqlalchemy.orm import Session
from db import get_db
from authen.secur import *
from fastapi_pagination.ext.sqlalchemy import paginate
from fastapi_pagination import Page, Params
from sqlalchemy import desc
from datetime import datetime

router = APIRouter(prefix="/history", tags=["history"])


# get all with user
@router.get("/{user_id}")
def getHistory(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(getCurrentUser),
) -> Page[TripPlanResponse]:

    if current_user["user_id"] != user_id:
        raise HTTPException(status_code=403, detail="You don't have permission")

    db_history = (
        db.query(TripPlan)
        .filter(TripPlan.user_id == user_id, TripPlan.status == "success")
        .order_by(desc(TripPlan.start_date))
    )

    return paginate(db_history, Params(size=10))

    # set Params 20 / page


@router.post("/checkin/{user_id}")
def createHistorty(
    history_data: VisitHistoryCreate,
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(getCurrentUser),
):

    if current_user.get("roles") != "user":
        raise HTTPException(status_code=403, detail="You don't have permission")
    if current_user.get("user_id") != user_id:
        raise HTTPException(status_code=403, detail="You can't check-in")

    castle = db.query(Castle).filter(Castle.castle_id == history_data.castle_id).first()

    if castle is None:
        raise HTTPException(status_code=404, detail="Not Found")

    db_visit = VisitHistory(
        user_id=user_id, castle_id=castle.castle_id, visit_date=datetime.now()
    )
    db.add(db_visit)
    db.commit()
    db.refresh(db_visit)
    
    return {
        "message" : "Check-In success",
        "status" : "success",
        "visit_id" : db_visit.visit_id,
        "visit_date" : db_visit.visit_date
    }
