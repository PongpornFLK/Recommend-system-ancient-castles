from schemas.schemas import *
from model.model import *
from fastapi import Depends, HTTPException
from fastapi.security import OAuth2PasswordBearer
from typing import Annotated, Optional
from passlib.context import CryptContext
from datetime import datetime, timedelta, timezone
import jwt
from jwt.exceptions import DecodeError, ExpiredSignatureError
import os
from dotenv import load_dotenv
from supabase import create_client, Client

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

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/token")


# สำหรับ Encrypt pwd ใช้ตอน Register
def get_password_hash(password):
    return pwd_context.hash(password)


# สำหรับ Encrypt pwd ใช้ตอน Login
def verify_password(userInputPassword, passwordInDatabase):
    return pwd_context.verify(userInputPassword, passwordInDatabase)


def authenticate_user(username: str, password: str, db):
    dbUser = db.query(User).filter(User.username == username).first()
    if not dbUser:
        return False
    if not pwd_context.verify(password, dbUser.password):
        return False
    return dbUser


# password = "supersecretpassword123"
# hashed = get_password_hash(password)
# print(f"Hashed password: {hashed}")


def createToken(
    username: str,
    user_id: int,
    roles: str,
    expires_delta: Optional[timedelta] = None,
    auth_provider: str = "local",
):
    encode = {
        "sub": username,
        "user_id": user_id,
        "roles": roles,
        "auth_provider": auth_provider,
    }
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(days=7)
    encode.update({"exp": expire})
    encode_jwt = jwt.encode(encode, SECRET_KEY, algorithm=ALGORITHM)
    return encode_jwt


async def getCurrentUser(token: Annotated[str, Depends(oauth2_scheme)]):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        user_id: int = payload.get("user_id")
        roles: str = payload.get("roles")
        auth_provider: str = payload.get("auth_provider")

        if username is None or user_id is None:
            raise HTTPException(status_code=401, detail="Not Validate")

        return {
            "username": username,
            "user_id": user_id,
            "roles": roles,
            "auth_provider": auth_provider,
        }

    except (DecodeError, ExpiredSignatureError):
        raise HTTPException(status_code=401, detail="Not Validate ")
