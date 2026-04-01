from dotenv import load_dotenv
load_dotenv()

import os
from fastapi import FastAPI
from db import Base , engine
from route import auth , user , history , event , nearplace , trip , locationcastle , route
from fastapi.middleware.cors import CORSMiddleware
from fastapi_pagination import add_pagination
from contextlib import asynccontextmanager
from route import interest
from route import recommend
from route import manage_castle
from db import Base, engine
from route import manage_vector
# import router
from route.zilliz_search import router as zilliz_router
from route.filter_search import router as filter_router
from route.castle_detail import router as castle_detail_router
from route import manage_document_vector
from route.manage_nearby_place import router as manage_nearby_place_router


print("DATABASE_URL set =", bool(os.getenv("DATABASE_URL")))
print("ZILLIZ_URI set   =", bool(os.getenv("ZILLIZ_URI")))
print("ZILLIZ_TOKEN set =", bool(os.getenv("ZILLIZ_TOKEN")))
print("GROQ_API_KEY set =", bool(os.getenv("GROQ_API_KEY")))


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

frontend_url = os.getenv("FRONTEND_URL")
origins = [
    "http://localhost:3000",
    "http://localhost:3001",
    "http://127.0.0.1:3000",
    "http://127.0.0.1:3001",
]

if frontend_url:
    origins.append(frontend_url)

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# include router หลังสร้าง app แล้ว

app.include_router(zilliz_router)
app.include_router(filter_router)
app.include_router(castle_detail_router)
app.include_router(auth.router)
app.include_router(user.router)
app.include_router(history.router)
app.include_router(event.router)
app.include_router(nearplace.router)
app.include_router(trip.router)
app.include_router(locationcastle.router)
app.include_router(interest.router)
app.include_router(route.router)
app.include_router(recommend.router)
app.include_router(manage_castle.router)
app.include_router(manage_vector.router)
app.include_router(manage_document_vector.router)
app.include_router(manage_nearby_place_router)

@app.get("/")
def root():
    return {"message": "Test server Complete"}

@app.get("/server")
def server():
    return {"message": "Test server Complete"}
