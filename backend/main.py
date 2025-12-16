from schemas import *
from model import *
from fastapi import FastAPI , Depends , HTTPException
from fastapi.security import OAuth2PasswordBearer , OAuth2PasswordRequestForm
from fastapi.routing import APIRouter
from sqlalchemy.orm import Session
from db import get_db , Base , engine
from typing import List , Annotated , Optional
from passlib.context import CryptContext
from datetime import datetime, timedelta, timezone
import jwt
from loguru import logger

# Create Table และ Check err
try:
    Base.metadata.create_all(bind=engine)
    print("Create Success")
except Exception as e:
    print(f"Error Err : {e} ")
    
routeApi = APIRouter(
    prefix = '/auth',
    tags = ['auth']
)

SECRET_KEY = "aLuFNmIOShSvec46sYiNsnAX+fk9Ak+Y3262rl+BB1AZyI8GbkwDuSyWBdk1"
ALGORITHM = "HS256"

pwd_context = CryptContext(schemes=["bcrypt"] , deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")
    
app = FastAPI()

app.include_router(routeApi)

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

def createToken(username : str , user_id : int , expires_delta: Optional[timedelta] = None):
    encode = {'sub' : username , 'id' : user_id}
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=15)
    encode.update({"exp": expire})
    isJWT = jwt.encode(encode, SECRET_KEY, algorithm=ALGORITHM)
    return isJWT


@app.get("/")
def testServer():
    return {"message":"Test server Complete"}

@app.post("/token" , response_model = Token)
def loginAccessToken( user : Annotated[OAuth2PasswordRequestForm , Depends()] , db : Session = Depends(get_db)):
    userAuth = authenticate_user(user.username , user.password , db)
    if not userAuth:
        raise HTTPException(status_code=401 , detail="Incorrect username or password")
    token = createToken(
        username = userAuth.username,  
        user_id = userAuth.user_id,   
        expires_delta = timedelta(minutes=20)
    )
    
    return {"access_token" : token , "token_type" : "bearer"}

### User ( Register )###
@app.post("/users" , response_model = UserResponse)
def createUser(user: UserCreate , db: Session = Depends(get_db)):

    db_user = User(**user.model_dump(exclude={"password"}) , password = pwd_context.hash(user.password))
    
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    logger.info(f"success- id : {db_user.user_id} pass: {db_user.password}")
    return db_user

# get บางตัว
@app.get("/users/{user_id}"  , response_model = UserResponse )
def readUser(user_id : int , db : Session = Depends(get_db)):
	db_user = db.query(User).filter(User.user_id == user_id).first()
	return db_user

# get all
@app.get("/users"  , response_model = List[UserResponse] )
def readUserAll(db : Session = Depends(get_db)):
	db_user = db.query(User).all()
	return db_user
	
@app.put("/users/{user_id}"  , response_model = UserResponse )
async def updateUser(user_id : int ,user: UserUpdate ,db : Session=Depends(get_db)):
	db_user = db.query(User).filter(User.user_id == user_id).first()
	if db_user is None :
		raise HTTPException(status_code=404 , detail = "Not Found")
	for key , value in user.model_dump(exclude_unset=True).items():
		setattr(db_user , key , value)
	db.commit()
	db.refresh(db_user)
	return db_user

@app.delete("/users/{user_id}")
async def deleteUser(user_id: int, db: Session = Depends(get_db)):
    db_user = db.query(User).filter(User.user_id == user_id).first()
    if db_user is None:
        raise HTTPException(status_code=404, detail="Not Found")
    db.delete(db_user)
    db.commit()
    return {"message": "Delete Success"}