from dotenv import load_dotenv
load_dotenv()
from fastapi import FastAPI
from db import Base , engine
from route import auth, user, history, zilliz_search
from fastapi.middleware.cors import CORSMiddleware
from fastapi_pagination import add_pagination
import os
print("DATABASE_URL =", os.getenv("DATABASE_URL"))
print("ZILLIZ_URI =", os.getenv("ZILLIZ_URI"))
# Create Table และ Check err
try:
    Base.metadata.create_all(bind=engine)
    print("Create Success")
except Exception as e:
    print(f"Error Err : {e} ")
    
app = FastAPI()

add_pagination(app)

origins = [
    "http://localhost:3000",      
    "http://127.0.0.1:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,       
    allow_credentials=True,    
    allow_methods=["*"],         
    allow_headers=["*"],    
         
)

app.include_router(auth.router)
app.include_router(user.router)
app.include_router(history.router)
app.include_router(zilliz_search.router)


@app.get("/")
def testServer():
    return {"message":"Test server Complete"}

@app.get("/server")
def Server():
    return {"message":"Test server Complete"}

### Role : User get data ###

### Role : Admin manage data ###