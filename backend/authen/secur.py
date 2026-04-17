from schemas.schemas import *
from model.model import *
from fastapi import Depends, HTTPException
from fastapi.security import OAuth2PasswordBearer
from typing import Annotated, Optional
from passlib.context import CryptContext
from datetime import datetime, timedelta, timezone
from jwt.exceptions import DecodeError, ExpiredSignatureError
from dotenv import load_dotenv
from supabase import create_client, Client
from db import get_db
from sqlalchemy.orm import Session
import os
import jwt

load_dotenv()

SECRET_KEY = os.getenv(
    "SECRET_KEY", "aLuFNmIOShSvec46sYiNsnAX+fk9Ak+Y3262rl+BB1AZyI8GbkwDuSyWBdk1"
)
ALGORITHM = os.getenv("ALGORITHM", "HS256")

# Setup Supabase Client
SUPABASE_URL = os.getenv("SUPABASE_URL", "https://phejqfklpipcjemjgydt.supabase.co")
SUPABASE_KEY = os.getenv(
    "SUPABASE_ANON_KEY",
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBoZWpxZmtscGlwY2plbWpneWR0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI4ODA0MTMsImV4cCI6MjA4ODQ1NjQxM30.unsAdwbc5myUmlydxbqu9Josu1f42YXVheExIlce9B4",
)
supabase_client: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto") # Encrypt pwd
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/token") # ดึง Token
optional_oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/token", auto_error=False) # ดึง Token แบบไม่บังคับ


# สำหรับ Encrypt pwd ใช้ตอน Register
def get_password_hash(password):
    return pwd_context.hash(password)


# สำหรับ Encrypt pwd ใช้ตอน Login
def verify_password(userInputPassword, passwordInDatabase):
    return pwd_context.verify(userInputPassword, passwordInDatabase)


# ตรวจสอบว่ามี user นี้ไหม
def authenticate_user(username: str, password: str, db):
    dbUser = db.query(User).filter(
        (User.username == username) | (User.email == username)
    ).first() # ค้นหา user จาก username หรือ email
    
    if not dbUser:
        return False
    if not pwd_context.verify(password, dbUser.password):  
        return False

    return dbUser # มี user นี้ส่งกลับไป


# password = "supersecretpassword123"
# hashed = get_password_hash(password)
# print(f"Hashed password: {hashed}")

# สร้าง Token
def createAccessToken(
    username: str,
    user_id: int,
    roles: str,
    token_version: int,
    expires_delta: Optional[timedelta] = None,
    auth_provider: str = "local", # local = login ปกติ
):
    encode = { # ข้อมูลที่จะเก็บใน Token
        "sub": str(user_id),
        "user_id": user_id,
        "roles": roles,
        "token_version": token_version,
        "auth_provider": auth_provider,
    }
    # กำหนดวันหมดอายุ Token
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=60)
        
    encode.update({"exp": expire}) # เพิ่มวันหมดอายุ
    encode_jwt = jwt.encode(encode, SECRET_KEY, algorithm=ALGORITHM) # เข้ารหัส Token
    
    return encode_jwt

# ดึงข้อมูล user
async def getCurrentUser(
    token: Annotated[str, Depends(oauth2_scheme)],
    db: Session = Depends(get_db)
):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM]) # ถอดรหัส Token
        user_id: int = payload.get("user_id") # ดึง user_id
        token_version: int = payload.get("token_version") # ดึง token_version

        if user_id is None or token_version is None:
            raise HTTPException(status_code=401, detail="Invalid token payload")

        # ตรวจสอบกับ Database
        db_user = db.query(User).filter(User.user_id == user_id).first()
        if not db_user:
            raise HTTPException(status_code=401, detail="User not found")
        
        # เช็คว่า Version ถูกต้องไหม ถ้าไม่ = เตะออก
        if db_user.token_version != token_version:
            raise HTTPException(status_code=401, detail="Token has been revoked")
        
        # ส่งข้อมูล user
        return {
            "username": db_user.username,
            "user_id": db_user.user_id,
            "roles": db_user.roles,
            "auth_provider": db_user.auth_provider,
        }

    except (DecodeError, ExpiredSignatureError):
        raise HTTPException(status_code=401, detail="Not Validate ")

# ดึงข้อมูล user แบบไม่บังคับกรณี
async def getOptionalUser(token: Annotated[Optional[str], Depends(optional_oauth2_scheme)] = None):
    if token is None or token == "undefined" or token == "null":
        return None
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return {
            "username": payload.get("sub"),
            "user_id": payload.get("user_id"),
            "roles": payload.get("roles"),
            "auth_provider": payload.get("auth_provider"),
        }
    except:
        return None

# สร้าง Refresh Token
def createRefreshToken(user_id:int, token_version: int):
    # ข้อมูลที่จะเก็บใน
    encode = {
        "user_id" : user_id,
        "token_version": token_version,
        "type" : "refresh",
    }

    # กำหนดวันหมดอายุ Token และเข้ารหัส Token
    expire = datetime.now(timezone.utc) + timedelta(days=7)
    encode.update({"exp" : expire})
    encode_jwt = jwt.encode(encode,SECRET_KEY, algorithm=ALGORITHM)

    return encode_jwt
