from dotenv import load_dotenv
load_dotenv()

import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi_pagination import add_pagination

from db import Base, engine

# import router
from route.auth import router as auth_router
from route.user import router as user_router
from route.history import router as history_router
from route.zilliz_search import router as zilliz_router
from route.filter_search import router as filter_router
from route.castle_detail import router as castle_detail_router

print("DATABASE_URL set =", bool(os.getenv("DATABASE_URL")))
print("ZILLIZ_URI set   =", bool(os.getenv("ZILLIZ_URI")))
print("ZILLIZ_TOKEN set =", bool(os.getenv("ZILLIZ_TOKEN")))
print("GROQ_API_KEY set =", bool(os.getenv("GROQ_API_KEY")))

try:
    Base.metadata.create_all(bind=engine)
    print("Create tables: SUCCESS")
except Exception as e:
    print(f"Create tables: FAILED: {e}")

app = FastAPI()
add_pagination(app)

origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:3001",
    "http://127.0.0.1:3001",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ✅ include router หลังสร้าง app แล้ว
app.include_router(auth_router)
app.include_router(user_router)
app.include_router(history_router)
app.include_router(zilliz_router)
app.include_router(filter_router)
app.include_router(castle_detail_router)

@app.get("/")
def root():
    return {"message": "Test server Complete"}

@app.get("/server")
def server():
    return {"message": "Test server Complete"}