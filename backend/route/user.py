from schemas.schemas import *
from model.model import *
from fastapi import Depends , HTTPException , FastAPI , APIRouter
from sqlalchemy.orm import Session
from db import get_db 
from loguru import logger
from authen.secur import *

router = APIRouter(
    prefix = '/users',
    tags = ['users']
)

### Role : User ( Register )###
@router.post("" , response_model = UserResponse)
def createUser(user: UserCreate , db: Session = Depends(get_db)):

    db_user = User(**user.model_dump(exclude={"password"}) , password = pwd_context.hash(user.password))
    
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    logger.info(f"success- id : {db_user.user_id} pass: {db_user.password}")
    return db_user


@router.get("/{user_id}"  , response_model = UserResponse ) #### get บางตัว
def readUser(user_id : int , db : Session = Depends(get_db)):
	db_user = db.query(User).filter(User.user_id == user_id).first()
	if db_user is None:
		raise HTTPException(status_code=404, detail="User not found")
	return db_user


@router.get(""  , response_model = List[UserResponse] ) #### get all
def readUserAll(db : Session = Depends(get_db)):
	db_user = db.query(User).all()
	return db_user


@router.put("/{user_id}"  , response_model = UserResponse )
async def updateUser(user_id : int ,user: UserUpdate ,db : Session=Depends(get_db)):
	db_user = db.query(User).filter(User.user_id == user_id).first()
	if db_user is None :
		raise HTTPException(status_code=404 , detail = "Not Found")
	for key , value in user.model_dump(exclude_unset=True).items():
		setattr(db_user , key , value)
	db.commit()
	db.refresh(db_user)
	return db_user


@router.delete("/{user_id}")
async def deleteUser(user_id : int , user : Annotated[dict , Depends(getCurrentUser)], db: Session = Depends(get_db)):
    
    if user["roles"] != "admin":
        raise HTTPException(status_code=404 , detail = "Only Admin can Delete!!")
    
    db_user = db.query(User).filter(User.user_id == user_id).first()
    
    if db_user is None:
        raise HTTPException(status_code=404, detail="Not Found")
    
    db.delete(db_user)
    db.commit()
        
    return {"message": "Delete Success"}