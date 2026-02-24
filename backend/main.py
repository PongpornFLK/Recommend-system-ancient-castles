from fastapi import FastAPI
from db import Base , engine
from route import auth , user , history , event , nearplace
from fastapi.middleware.cors import CORSMiddleware
from fastapi_pagination import add_pagination
from contextlib import asynccontextmanager


@asynccontextmanager
async def lifespan(app: FastAPI):
    try:
        # Create Table และ Check err
        Base.metadata.create_all(bind=engine)
        print("Create Success")
        yield
    except Exception as e:
        print(f"Error Err : {e} ")
    finally:
        print("Shutdown app")
        engine.dispose()
    
app = FastAPI(lifespan=lifespan)

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
app.include_router(event.router)
app.include_router(nearplace.router)


@app.get("/")
def testServer():
    return {"message":"Test server Complete"}

@app.get("/server")
def Server():
    return {"message":"Test server Complete"}

### Role : User get data ###
# ### Role : Admin manage data ###