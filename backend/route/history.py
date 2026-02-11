from schemas.schemas import *
from model.model import *
from fastapi import Depends , HTTPException , FastAPI , APIRouter
from sqlalchemy.orm import Session
from db import get_db 
from authen.secur import *
# from typing import List
from fastapi_pagination.ext.sqlalchemy import paginate 
from fastapi_pagination import Page , Params
from sqlalchemy import desc


router = APIRouter(
    prefix = '/history',
    tags = ['history']
)

# get all with user
@router.get("/{user_id}")
def getHistory(user_id : int , db: Session = Depends(get_db) , current_user : User = Depends(getCurrentUser)) -> Page[TripPlanResponse]:
    
    if(current_user["user_id"] != user_id):
        raise HTTPException(status_code=403 , detail="You don't have permission")
    
    db_history = db.query(TripPlan).filter(TripPlan.user_id == user_id).order_by(desc(TripPlan.start_date));
    
    return paginate(db_history , Params(size = 10));
    
    # set Params 20 / page