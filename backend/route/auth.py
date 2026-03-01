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
    token = createToken(
        username = userAuth.username,  
        user_id = userAuth.user_id,
        roles = userAuth.roles,
        expires_delta = timedelta(minutes=480) # อายุ token
    )
    
    return {"access_token" : token , "token_type" : "bearer"}

@router.get("/user/active"  , status_code=200)
async def readUserActive(user : Annotated[dict , Depends(getCurrentUser)] , db : Annotated[Session ,Depends(get_db)]):
    if user is None :  
        raise HTTPException(status_code=401, detail="Auth Fail")
    return user