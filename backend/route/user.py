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
# ... (import ส่วนเดิม) ...

@router.post("", response_model=UserResponse)
def createUser(user: UserCreate, db: Session = Depends(get_db)):
    # 1. เพิ่มการตรวจสอบ Username ซ้ำ
    existing_user = db.query(User).filter(User.username == user.username).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Username already registered")
    
    # 2. เพิ่มการตรวจสอบ Email ซ้ำ
    existing_email = db.query(User).filter(User.email == user.email).first()
    if existing_email:
        raise HTTPException(status_code=400, detail="Email already registered")

    # บันทึกพร้อม Hash รหัสผ่าน (แก้ไขปัญหา Error 500 ตอน Login)
    db_user = User(
        **user.model_dump(exclude={"password"}), 
        password = pwd_context.hash(user.password)
    )
    
    try:
        db.add(db_user)
        db.commit()
        db.refresh(db_user)
        logger.info(f"User created - ID: {db_user.user_id}")
        return db_user
    except Exception as e:
        db.rollback()
        logger.error(f"Register database error: {e}")
        raise HTTPException(status_code=500, detail="Database error during registration")

@router.put("/{user_id}", response_model=UserResponse)
async def updateUser(
    user_id: int, 
    user: UserUpdate, 
    db: Session = Depends(get_db),
    current_user: dict = Depends(getCurrentUser) # 3. เพิ่ม Security Check
):
    # ป้องกันไม่ให้ User คนอื่นมาแอบแก้ข้อมูลคนอื่น
    if current_user["user_id"] != user_id and current_user["roles"] != "admin":
        raise HTTPException(status_code=403, detail="Not authorized to update this user")

    db_user = db.query(User).filter(User.user_id == user_id).first()
    if db_user is None:
        raise HTTPException(status_code=404, detail="User Not Found")
    
    for key, value in user.model_dump(exclude_unset=True).items():
        setattr(db_user, key, value)
    
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