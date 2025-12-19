from schemas.schemas import *
from model.model import *
from fastapi import Depends , HTTPException
from fastapi.security import OAuth2PasswordBearer
from typing import Annotated , Optional
from passlib.context import CryptContext
from datetime import datetime, timedelta, timezone
import jwt


SECRET_KEY = "aLuFNmIOShSvec46sYiNsnAX+fk9Ak+Y3262rl+BB1AZyI8GbkwDuSyWBdk1"
ALGORITHM = "HS256"

pwd_context = CryptContext(schemes=["bcrypt"] , deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/token")


# สำหรับ Encrypt pwd ใช้ตอน Register
def get_password_hash(password):
    return pwd_context.hash(password)

# สำหรับ Encrypt pwd ใช้ตอน Login
def verify_password( userInputPassword , passwordInDatabase ):
    return pwd_context.verify(userInputPassword, passwordInDatabase )

def authenticate_user(username : str , password : str , db):
    dbUser = db.query(User).filter(User.username == username).first()
    if not dbUser:
        return False
    if not pwd_context.verify(password, dbUser.password):
        return False
    return dbUser

# password = "supersecretpassword123"
# hashed = get_password_hash(password)
# print(f"Hashed password: {hashed}")

def createToken(username : str , user_id : int , roles : str , expires_delta: Optional[timedelta] = None):
    encode = {'sub' : username , 'user_id' : user_id , 'roles' : roles}
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=15)
    encode.update({"exp": expire})
    isJWT = jwt.encode(encode, SECRET_KEY, algorithm=ALGORITHM)
    return isJWT

async def getCurrentUser(token : Annotated[str , Depends(oauth2_scheme)]):
    try:
        payload = jwt.decode(token , SECRET_KEY , algorithms=[ALGORITHM])
        username : str = payload.get('sub')
        user_id : int = payload.get('user_id')
        roles : str = payload.get('roles')
        
        if username is None or user_id is None:
            raise HTTPException(status_code=401 , detail="Not Validate")
        return {'username' : username , "user_id" : user_id , "roles" : roles}
    
    except JWTError:
        raise HTTPException(status_code=401 , detail="Not Validate ")
    