# 1. เลือก Base Image
FROM python:3.11-slim

# 2. ติดตั้ง dependencies สำหรับ psycopg2 (ถ้าใช้ PostgreSQL) 
# และเครื่องมือพื้นฐานที่จำเป็น
RUN apt-get update && apt-get install -y \
    build-essential \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# 3. Setup directory ใน Container
WORKDIR /app

# 4. คัดลอก requirements.txt และติดตั้ง
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# 5. คัดลอก Source Code ทั้งหมด
COPY . .

# 6. เปิดพอร์ต 8000 (พอร์ตมาตรฐานของ FastAPI)
EXPOSE 8000

# 7. ใช้ uvicorn เป็นคำสั่งรันเพื่อให้รองรับการเชื่อมต่อจากภายนอก (--host 0.0.0.0)
CMD ["uvicorn", "main.py:app", "--host", "0.0.0.0", "--port", "8000"]