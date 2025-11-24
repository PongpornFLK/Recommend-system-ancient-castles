# เลือก Base Image
FROM python:3.9-slim

# Setup working directory ภายใน Img
WORKDIR /app

# คัดลอก FILE ที่จำเป็นเข้าไปใน Img
COPY requirements.txt .

#RUN Command เพื่อติดตั้ง dependencies ภายใน Img
RUN pip install -r requirements.txt

# คัดลอก Source Code เข้าไปใน Img
COPY . .

# กำหนดคำสั่งเริ่มต้นเมื่อ Run Container ทำงาน
CMD ["python" , "main.py"]