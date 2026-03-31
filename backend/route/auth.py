from schemas.schemas import *
from model.model import *
from fastapi import Depends , HTTPException , FastAPI , APIRouter
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from db import get_db
from typing import Annotated
from authen.secur import *

router = APIRouter(
    prefix = '/auth',
    tags = ['auth']
)

@router.post("/token" , response_model = Token)
def loginAccessToken( user : Annotated[OAuth2PasswordRequestForm , Depends()] , db : Session = Depends(get_db)):
    userAuth = authenticate_user(user.username , user.password , db)
    if not userAuth:
        raise HTTPException(status_code=401 , detail="Incorrect username or password")
    access_token = createAccessToken(
        username = userAuth.username,  
        user_id = userAuth.user_id,
        roles = userAuth.roles,
        expires_delta = timedelta(minutes=60) # อายุ token สำหรับใช้งานจริง
    )
    refresh_token = createRefreshToken(
        user_id = userAuth.user_id
    )
    
    userAuth.refresh_token=refresh_token
    db.commit()
    
    return {"access_token" : access_token , "refresh_token" : refresh_token ,"token_type" : "bearer"}


@router.get("/user/active"  , status_code=200)
async def readUserActive(user : Annotated[dict , Depends(getCurrentUser)] , db : Annotated[Session ,Depends(get_db)]):
    if user is None :  
        raise HTTPException(status_code=401, detail="Auth Fail")
    return user


@router.post("/refreshtoken")
async def refreshToken(request : RefreshTokenRequest , db : Session=Depends(get_db)):
    try:
        payload = jwt.decode(request.refresh_token ,SECRET_KEY,algorithms=[ALGORITHM])
        user_id : int = payload.get("user_id")
        
        if payload.get("type") != "refresh" or user_id is None :
            raise HTTPException(status_code=401,detail="Invalid token type")

        db_user = db.query(User).filter(User.user_id == user_id).first()
        
        if db_user is None or db_user.refresh_token != request.refresh_token:
            raise HTTPException(status_code=401,detail="Refresh token invalid")
        
        new_token = createAccessToken(
            username = db_user.username,  
            user_id = db_user.user_id,
            roles = db_user.roles,
            auth_provider = getattr(db_user , "auth_provider" , "local")
        )
        
        return {"access_token" : new_token , "refresh_token": request.refresh_token, "token_type" : "bearer"}
    
    except Exception as e:
        raise HTTPException(status_code=401, detail="Refresh token expired or invalid")
    