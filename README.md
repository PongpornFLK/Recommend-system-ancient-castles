<div align="center">

# 🏰 Ancient Castles

**ระบบแนะนำและวางแผนท่องเที่ยวโบราณสถานอัจฉริยะ**

ค้นหาปราสาท วัด และสถานที่ประวัติศาสตร์ที่ใช่สำหรับคุณ ด้วยการค้นหาเชิงความหมาย (semantic search),
การแนะนำสถานที่ใกล้เคียงบนแผนที่ และผู้ช่วย AI ที่ตอบคำถามเกี่ยวกับโบราณสถานได้แบบเรียลไทม์

[![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![FastAPI](https://img.shields.io/badge/FastAPI-Backend-009688?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Database-4169E1?logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Milvus](https://img.shields.io/badge/Milvus%2FZilliz-Vector%20DB-00A1EA)](https://milvus.io/)
[![LangChain](https://img.shields.io/badge/LangChain-Groq%20LLM-1C3C3C)](https://www.langchain.com/)
[![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?logo=docker&logoColor=white)](https://www.docker.com/)

</div>

---

## 📖 เกี่ยวกับโปรเจกต์

**Ancient Castles** เป็นเว็บแอปพลิเคชันแบบ full-stack ที่ช่วยให้นักท่องเที่ยวค้นหา สำรวจ และวางแผนการเดินทางไปยังโบราณสถานในประเทศไทย
โดยผสาน **vector search (RAG)** และ **LLM** เข้ากับข้อมูลตำแหน่งทางภูมิศาสตร์ (GIS) เพื่อให้คำแนะนำที่ตรงกับความสนใจของผู้ใช้แต่ละคน
พร้อมระบบหลังบ้าน (admin) สำหรับจัดการข้อมูลสถานที่ อีเวนต์ และสถานที่ใกล้เคียงแบบครบวงจร

## ✨ Features

**สำหรับผู้ใช้ทั่วไป**

- 🔍 **ค้นหาด้วย AI (Semantic Search)** — ค้นหาโบราณสถานด้วยภาษาธรรมชาติ และถาม-ตอบข้อมูลผ่าน LLM (RAG ด้วย Milvus/Zilliz + LangChain + Groq)
- 🖼️ **ค้นหาด้วยรูปภาพ** — อัปโหลดรูปเพื่อค้นหาสถานที่ใกล้เคียงด้วย image vector search
- 🗺️ **แผนที่และสถานที่ใกล้เคียง** — แสดงตำแหน่งบนแผนที่ (Google Maps) พร้อมค้นหาสถานที่ใกล้เคียงจากพิกัดผู้ใช้
- 🧭 **วางแผนทริป** — สร้าง/ยืนยัน/ยกเลิกแผนการเดินทาง และดูเส้นทาง (route) ของแต่ละทริป
- ❤️ **รายการโปรดและความสนใจ** — บันทึกสถานที่ที่สนใจ และดูประวัติการเข้าชม (check-in history)
- 🔐 **ระบบสมาชิก** — สมัคร/เข้าสู่ระบบด้วย JWT หรือ Google Login

**สำหรับผู้ดูแลระบบ (Admin)**

- 🏛️ จัดการข้อมูลโบราณสถาน (เพิ่ม/แก้ไข/ลบ/อัปโหลดรูปภาพ)
- 📅 จัดการอีเวนต์ประจำสถานที่
- 📍 จัดการสถานที่ใกล้เคียง (nearby places)
- 📄 อัปโหลดเอกสารเข้าสู่ vector database สำหรับใช้กับระบบ AI Q&A
- 👥 จัดการผู้ใช้งาน

## 🏗️ สถาปัตยกรรมระบบ

![System Architecture](docs/System%20Architecture%20.png)

ระบบถูกออกแบบแยกส่วนเป็น Client → API Gateway (RBAC) → Core Services (User & Content / GIS / Recommendation) → Data Storage (PostgreSQL + PostGIS และ Milvus Vector DB)

โปรเจกต์แบ่งเป็น 3 ส่วนหลัก:

| ส่วน | เทคโนโลยี | หน้าที่ |
| --- | --- | --- |
| `frontend/` | Next.js (App Router) · React 19 · TypeScript · Tailwind CSS · HeroUI | เว็บแอปสำหรับผู้ใช้และแอดมิน |
| `backend/` | FastAPI · SQLAlchemy · PostgreSQL · JWT Auth | REST API, business logic, authentication |
| `model/` | Python · Sentence Transformers · Milvus/Zilliz | Embedding & recommendation logic |

### เทคโนโลยีหลักฝั่ง Backend

- FastAPI, Uvicorn, SQLAlchemy, PostgreSQL (psycopg2)
- JWT authentication (PyJWT, passlib, bcrypt)
- Milvus / Zilliz — vector database สำหรับ semantic search
- LangChain + Groq — LLM สำหรับ chat/แนะนำสถานที่ (RAG)
- Sentence Transformers — สร้าง embeddings
- Supabase — จัดเก็บไฟล์/รูปภาพ

### เทคโนโลยีหลักฝั่ง Frontend

- Next.js, React, TypeScript
- Tailwind CSS, HeroUI
- Google Maps API (แผนที่ / วางแผนเส้นทาง)
- Axios, Swiper

## 📂 โครงสร้างโปรเจกต์

```
.
├── backend/            # FastAPI backend
│   ├── main.py         # entrypoint ของ API
│   ├── db.py           # การเชื่อมต่อฐานข้อมูล
│   ├── route/          # API routes (auth, trip, recommend, castle, ...)
│   ├── schemas/        # Pydantic schemas
│   ├── authen/         # การยืนยันตัวตน
│   └── model/          # โมเดลฐานข้อมูล (SQLAlchemy)
├── frontend/            # Next.js frontend
│   └── app/             # หน้าเว็บและคอมโพเนนต์ (App Router)
├── model/               # ระบบ/สคริปต์ recommendation model
├── docs/                # เอกสารและไดอะแกรมระบบ
└── docker-compose.yml   # รันทั้งระบบด้วย Docker
```

## 🚀 การติดตั้งและรันโปรเจกต์

### สิ่งที่ต้องมี

- [Docker](https://www.docker.com/) และ Docker Compose (สำหรับรันแบบง่ายที่สุด)
- หรือสำหรับรันแยกส่วน: Node.js 18+ / Bun และ Python 3.10+ พร้อม PostgreSQL

### ตั้งค่า Environment Variables

คัดลอกไฟล์ตัวอย่างแล้วกรอกค่าที่จำเป็น:

```bash
cp .env.example backend/.env
cp .env.example frontend/.env.local
```

ตัวแปรที่ต้องตั้งค่า:

| ตัวแปร | ใช้ที่ | คำอธิบาย |
| --- | --- | --- |
| `NEXT_PUBLIC_API_URL` | frontend | URL ของ backend API |
| `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` | frontend | API key สำหรับ Google Maps |
| `FRONTEND_URL` | backend | URL ของ frontend (ใช้ตั้งค่า CORS) |
| `DATABASE_URL` | backend | connection string ของ PostgreSQL |
| `SECRET_KEY` | backend | secret key สำหรับ JWT |
| `ALGORITHM` | backend | อัลกอริทึมของ JWT (ค่าเริ่มต้น `HS256`) |
| `GROQ_API_KEY` | backend | API key ของ Groq (LLM) |
| `ZILLIZ_URI` / `ZILLIZ_TOKEN` | backend | การเชื่อมต่อ Zilliz/Milvus vector database |

### รันด้วย Docker Compose (แนะนำ)

```bash
docker-compose up --build
```

- Backend จะรันที่ `http://localhost:8000`
- Frontend จะรันที่ `http://localhost:3000`
- API Docs (Swagger UI) จะอยู่ที่ `http://localhost:8000/docs`

### รันแบบแยกส่วน (Development)

**Backend**

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate      # Windows
pip install -r requirements.txt
uvicorn main:app --reload
```

**Frontend**

```bash
cd frontend
npm install
npm run dev
```

## 📸 Screenshots

> _เพิ่มภาพหน้าจอของแอปพลิเคชันที่นี่ เช่น หน้า Landing, หน้าค้นหา/แผนที่, หน้าแชท AI และหน้า Admin Panel_

## 👥 ผู้พัฒนา

| ชื่อ | GitHub |
| --- | --- |
| Pongporn | [@PongpornFLK](https://github.com/PongpornFLK) |
| Nattha | [@Nattha45](https://github.com/Nattha45) |

## 📄 License

โปรเจกต์นี้จัดทำขึ้นเพื่อการศึกษา
