from sqlalchemy import asc
from schemas.schemas import *
from model.model import *
from fastapi import Depends, HTTPException, APIRouter
from sqlalchemy.orm import Session
from db import get_db
from authen.secur import getCurrentUser, pwd_context, verify_password
from loguru import logger
from fastapi_pagination.ext.sqlalchemy import paginate
from fastapi_pagination import Page, Params
from typing import Annotated
from authen.secur import createAccessToken, createRefreshToken, supabase_client

router = APIRouter(prefix="/users", tags=["users"])


### Login Google token
@router.post("/auth/google_login")
async def createUserWithGoogle(
    request: GoogleTokenRequest, db: Session = Depends(get_db)
):
    supabase_token = request.access_token # รับ token จาก frontend

    try:
        # ยืนยันตัวตนที่ supabase
        user_response = supabase_client.auth.get_user(supabase_token)
        email = user_response.user.email
        user_metadata = user_response.user.user_metadata or {}
        google_name = user_metadata.get("full_name") # รับชื่อ

        if email is None:
            raise HTTPException(status_code=400, detail="Not found email")

        # ดึงข้อมูล email นี้ในระบบไหม
        db_user_email = db.query(User).filter(User.email == email).first()

        if db_user_email is None:
            # random pwd ถ้า login Google กัน Error
            import secrets 
            import string  

            alphabet = string.ascii_letters + string.digits
            random_pass = "".join(secrets.choice(alphabet) for i in range(20))

            db_user = User(
                email=email,
                username=google_name,
                password=pwd_context.hash(random_pass),
                roles="user",
            )
            db.add(db_user)
            db.commit()
            db.refresh(db_user)
            db_user_email = db_user

        # สร้าง access token
        create_token = createAccessToken (
            username=db_user_email.username,
            user_id=db_user_email.user_id,
            roles=db_user_email.roles,
            token_version=db_user_email.token_version, # เพิ่มตรงนี้
            auth_provider="google",
        )
        
        # สร้าง-เก็บ refresh token
        refresh_token = createRefreshToken(db_user_email.user_id, db_user_email.token_version)
        db_user_email.refresh_token = refresh_token
        db.commit()
        
        return {"access_token": create_token, "refresh_token": refresh_token, "token_type": "bearer"}

    except Exception as e:
        raise HTTPException(status_code=401, detail=f"Token error: {str(e)}")


### Register
@router.post("", response_model=UserResponse)
def createUser(user: UserCreate, db: Session = Depends(get_db)):
    # Check Username ซ้ำ
    existing_user = db.query(User).filter(User.username == user.username).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Username already registered")

    # Check Email ซ้ำ
    existing_email = db.query(User).filter(User.email == user.email).first()
    if existing_email:
        raise HTTPException(status_code=400, detail="Email already registered")

    # Hashing รหัสผ่านก่อนบันทึก
    db_user = User(
        **user.model_dump(exclude={"password"}),
        password=pwd_context.hash(user.password), 
    )

    try:
        db.add(db_user) # บันทึกลงฐานข้อมูล
        db.commit() # ยืนยันการบันทึก
        db.refresh(db_user) # ดึงข้อมูลล่าสุด
        logger.info(f"User created - ID: {db_user.user_id}")
        return db_user
    except Exception as e:
        db.rollback() # ยกเลิกการบันทึก
        logger.error(f"Register database error: {e}")
        raise HTTPException(
            status_code=500, detail="Database error during registration"
        )


### Get All Users (สำหรับ Admin เท่านั้น)
@router.get("", response_model=Page[UserResponse])
def readUserAll(
    page: int = 1,
    size: int = 10,
    db: Session = Depends(get_db),
    current_user: Annotated[dict, Depends(getCurrentUser)] = None,
):
    if current_user.get("roles") != "admin":
        raise HTTPException(status_code=403, detail="You don't have permission")

    query = db.query(User).order_by(asc(User.user_id))
    return paginate(query, Params(page=page, size=size))


### Get Single User (ดึงข้อมูลรายบุคคล)
@router.get("/{user_id}", response_model=UserResponse)
def readUser(user_id: int, db: Session = Depends(get_db)):
    db_user = db.query(User).filter(User.user_id == user_id).first()
    if db_user is None:
        raise HTTPException(status_code=404, detail="User not found")
    return db_user


### Update User 
@router.put("/{user_id}", response_model=UserResponse)
async def updateUser(
    user_id: int,
    user: UserUpdate,
    db: Session = Depends(get_db),
    current_user: Annotated[dict, Depends(getCurrentUser)] = None,
):

    if current_user["user_id"] != user_id and current_user["roles"] != "admin":
        raise HTTPException(
            status_code=403, detail="Not authorized to update this user"
        )

    db_user = db.query(User).filter(User.user_id == user_id).first()
    if db_user is None:
        raise HTTPException(status_code=404, detail="User Not Found")

    for key, value in user.model_dump(exclude_unset=True).items():
        setattr(db_user, key, value)

    db.commit()
    db.refresh(db_user)
    return db_user


### Delete User (Admin Only)
@router.delete("/{user_id}")
async def deleteUser(
    user_id: int,
    user: Annotated[dict, Depends(getCurrentUser)],
    db: Session = Depends(get_db),
):
    if user["roles"] != "admin":
        raise HTTPException(status_code=404, detail="Only Admin can Delete!!")

    db_user = db.query(User).filter(User.user_id == user_id).first()
    if db_user is None:
        raise HTTPException(status_code=404, detail="Not Found")

    db.delete(db_user)
    db.commit()
    return {"message": "Delete Success"}


### Change Password
@router.post("/changepwd")
async def changePassword(
    password: ChangeNewPwdCreate,
    current_user: Annotated[dict, Depends(getCurrentUser)],
    db: Session = Depends(get_db),
):
    user_id = current_user["user_id"]
    db_user = db.query(User).filter(User.user_id == user_id).first()

    if db_user is None:
        raise HTTPException(status_code=404, detail="Not Found")

    if not verify_password(password.old_pass, db_user.password):
        raise HTTPException(status_code=401, detail="Invalid Authentication")

    db_user.password = pwd_context.hash(password.new_pass)
    
    # พีคตรงนี้: สั่งให้ Token เก่าทุุกใบตายทันที
    db_user.token_version += 1
    
    db.commit()
    return {"message": "You change password success. All other sessions have been logged out."}


@router.post("/logout-all")
async def logoutAllDevices(
    current_user: Annotated[dict, Depends(getCurrentUser)],
    db: Session = Depends(get_db),
):
    db_user = db.query(User).filter(User.user_id == current_user["user_id"]).first()
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # อัปเกรด Version เพื่อเตะทุกเครื่องออก
    db_user.token_version += 1
    db.commit()
    
    return {"message": "Logged out from all devices successfully"}



