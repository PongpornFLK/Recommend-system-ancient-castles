import sqlalchemy as _sql
import sqlalchemy.ext.declarative as _declarative
import sqlalchemy.orm as _orm
import os
from dotenv import load_dotenv

# ระบุตำแหน่งไฟล์ .env ให้ชัดเจนโดยอ้างอิงจากตำแหน่งของไฟล์ db.py
env_path = os.path.join(os.path.dirname(__file__), '.env')
load_dotenv(env_path)

DATABASE_URL = os.getenv("DATABASE_URL")

if not DATABASE_URL:
    # หากไม่มีค่าใน .env ให้ใช้ Local เป็นค่าพื้นฐาน
    DATABASE_URL = "postgresql://myuser:password@localhost:5432/fastapi_database"
    print("🚀 Status: Connected to Localhost")
else:
    # หากพบ DATABASE_URL (ซึ่งเป็นค่าของ Supabase)
    print("🌐 Status: Connected to Supabase Cloud")

engine = _sql.create_engine(
    DATABASE_URL,
    pool_size=10, 
    max_overflow=20, 
    pool_timeout=30, 
    pool_pre_ping=True, # สำคัญมากสำหรับ Supabase เพื่อตรวจสอบ connection ที่อาจโดนตัด
    pool_recycle=3600,
)

SessionLocal = _orm.sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = _declarative.declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()