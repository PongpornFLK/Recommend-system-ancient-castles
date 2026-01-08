from fastapi import FastAPI
from db import Base , engine
from route import auth , user
from fastapi.middleware.cors import CORSMiddleware

# Create Table และ Check err
try:
    Base.metadata.create_all(bind=engine)
    print("Create Success")
except Exception as e:
    print(f"Error Err : {e} ")
    
app = FastAPI()

origins = [
    "http://localhost:3000",      
    "http://127.0.0.1:8000/auth/token",
    "http://127.0.0.1:8000/users",
                   
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

@app.get("/")
def testServer():
    return {"message":"Test server Complete"}

@app.get("/server")
def Server():
    return {"message":"Test server Complete"}

### Role : User get data ###

### Role : Admin manage data ###