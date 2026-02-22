from sqlalchemy import asc
from schemas.schemas import *
from model.model import *
from fastapi import Depends , HTTPException , FastAPI , APIRouter
from sqlalchemy.orm import Session
from db import get_db 
from authen.secur import getCurrentUser
from loguru import logger
from authen.secur import *
from fastapi_pagination.ext.sqlalchemy import paginate 
from fastapi_pagination import Page , Params

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


@router.get("" ) #### get all
def readUserAll(page : int = 1 , size: int=10 , db : Session = Depends(get_db) , current_user : User = Depends(getCurrentUser)) -> Page[UserResponse]:
    if(current_user.get("roles") != "admin"):
        raise HTTPException(status_code=403 , detail="You don't have permission")
    
    db_user = db.query(User).order_by(asc(User.user_id))
    
    return paginate(db_user , Params(page=page, size=size))


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

@router.post("/changepwd")
async def changePassword(password: ChangeNewPwdCreate,current_user: Annotated[dict, Depends(getCurrentUser)],db: Session = Depends(get_db)):  
    user_id = current_user["user_id"]
    db_user = db.query(User).filter(User.user_id == user_id).first()
    
    if db_user is None:
        raise HTTPException(status_code=404, detail="Not Found")
    
    if not verify_password(password.old_pass , db_user.password):
        raise HTTPException(status_code=401, detail="Invalid Authentication")
    
    db_user.password =  pwd_context.hash(password.new_pass)
    db.commit()
    
    return {"message" : "You change password success"}