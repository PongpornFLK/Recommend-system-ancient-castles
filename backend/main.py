from fastapi import FastAPI
from db import Base , engine
from route import auth , user

# Create Table และ Check err
try:
    Base.metadata.create_all(bind=engine)
    print("Create Success")
except Exception as e:
    print(f"Error Err : {e} ")
    
app = FastAPI()

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