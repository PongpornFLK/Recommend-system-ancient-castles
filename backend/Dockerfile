# เลือก Base Image
FROM python:3.11-slim

# Setup dir ใน Img
WORKDIR /app

# คัดลอก FILE เข้า Img
COPY requirements.txt .

RUN pip install -r requirements.txt

# คัดลอก Source Code เข้า Img
COPY . .

# กำหนดคำสั่งเริ่มต้นเมื่อ Run Container ทำงาน
CMD ["python" , "main.py"]