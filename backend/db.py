import sqlalchemy as _sql
import sqlalchemy.ext.declarative as _declarative
import sqlalchemy.orm as _orm
import os
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")

if not DATABASE_URL: # Localhost
    DATABASE_URL = "postgresql://myuser:password@localhost:5432/fastapi_database"
    print("Connect Localhost")
else: # Docker
    print(f"Connect Docker : {DATABASE_URL}")

engine = _sql.create_engine(DATABASE_URL)

SessionLocal = _orm.sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = _declarative.declarative_base()

# with engine.begin() as conn:conn.execute(text("CREATE EXTENSION IF NOT EXISTS vector;"))

# Dependency
def get_db():
    db = SessionLocal()
    try: 
        yield db
    finally:
        db.close
