import os
import uuid
import mimetypes
from typing import List, Optional

from dotenv import load_dotenv
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session
from supabase import create_client

from db import get_db
from model.model import Castle, Location, Architecture, LocationCastle, Image
from schemas.schemas import CastleFullCreate
from authen.secur import getCurrentUser

load_dotenv()

router = APIRouter(prefix="/manage-castle", tags=["manage-castle"])

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_SERVICE_ROLE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
SUPABASE_BUCKET = os.getenv("SUPABASE_BUCKET", "castle-images")

if not SUPABASE_URL or not SUPABASE_SERVICE_ROLE_KEY:
    raise RuntimeError("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY")

supabase = create_client(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)


def require_admin(current_user: dict):
    if current_user.get("roles") != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")


def build_public_url(path: str) -> str:
    try:
        res = supabase.storage.from_(SUPABASE_BUCKET).get_public_url(path)
        if isinstance(res, dict):
            return res.get("publicURL") or res.get("publicUrl") or ""
        return res
    except Exception:
        return ""


@router.post("/add")
async def add_new_castle(
    req: CastleFullCreate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(getCurrentUser)
):
    require_admin(current_user)

    try:
        loc = Location(
            latitude=req.latitude,
            longitude=req.longitude,
            sub_district=req.sub_district,
            district=req.district,
            province=req.province
        )
        db.add(loc)
        db.flush()

        castle = Castle(
            castle_name=req.castle_name,
            castle_description=req.castle_description,
            era=req.era,
            type_id=req.type_id
        )
        db.add(castle)
        db.flush()

        arch = Architecture(
            castle_id=castle.castle_id,
            architec_detail=req.architecture_detail
        )
        db.add(arch)

        link = LocationCastle(
            castle_id=castle.castle_id,
            location_id=loc.location_id
        )
        db.add(link)

        db.commit()

        return {
            "status": "success",
            "castle_id": castle.castle_id
        }

    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/list")
def get_castles(
    db: Session = Depends(get_db),
    current_user: dict = Depends(getCurrentUser)
):
    require_admin(current_user)

    try:
        results = (
            db.query(Castle, Architecture, Location, LocationCastle)
            .outerjoin(Architecture, Architecture.castle_id == Castle.castle_id)
            .outerjoin(LocationCastle, LocationCastle.castle_id == Castle.castle_id)
            .outerjoin(Location, Location.location_id == LocationCastle.location_id)
            .order_by(Castle.castle_id.asc())
            .all()
        )

        data = []
        for castle, arch, loc, _ in results:
            data.append({
                "castle_id": castle.castle_id,
                "castle_name": castle.castle_name,
                "castle_description": castle.castle_description,
                "era": castle.era,
                "type_id": castle.type_id,
                "architecture_detail": arch.architec_detail if arch else "",
                "province": loc.province if loc else "",
                "district": loc.district if loc else "",
                "sub_district": loc.sub_district if loc else "",
                "latitude": loc.latitude if loc else "",
                "longitude": loc.longitude if loc else "",
            })

        return {"status": "success", "data": data}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.put("/update/{castle_id}")
def update_castle(
    castle_id: int,
    req: CastleFullCreate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(getCurrentUser)
):
    require_admin(current_user)

    try:
        castle = db.query(Castle).filter(Castle.castle_id == castle_id).first()
        if not castle:
            raise HTTPException(status_code=404, detail="ไม่พบข้อมูลปราสาท")

        castle.castle_name = req.castle_name
        castle.castle_description = req.castle_description
        castle.era = req.era
        castle.type_id = req.type_id

        architecture = db.query(Architecture).filter(Architecture.castle_id == castle_id).first()
        if architecture:
            architecture.architec_detail = req.architecture_detail
        else:
            architecture = Architecture(
                castle_id=castle_id,
                architec_detail=req.architecture_detail
            )
            db.add(architecture)

        location_link = db.query(LocationCastle).filter(LocationCastle.castle_id == castle_id).first()
        if location_link:
            location = db.query(Location).filter(Location.location_id == location_link.location_id).first()
            if location:
                location.latitude = req.latitude
                location.longitude = req.longitude
                location.sub_district = req.sub_district
                location.district = req.district
                location.province = req.province
            else:
                new_location = Location(
                    latitude=req.latitude,
                    longitude=req.longitude,
                    sub_district=req.sub_district,
                    district=req.district,
                    province=req.province
                )
                db.add(new_location)
                db.flush()
                location_link.location_id = new_location.location_id
        else:
            new_location = Location(
                latitude=req.latitude,
                longitude=req.longitude,
                sub_district=req.sub_district,
                district=req.district,
                province=req.province
            )
            db.add(new_location)
            db.flush()

            new_link = LocationCastle(
                castle_id=castle_id,
                location_id=new_location.location_id
            )
            db.add(new_link)

        db.commit()
        return {"status": "success", "message": "แก้ไขข้อมูลสำเร็จ"}

    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/delete/{castle_id}")
def delete_castle(
    castle_id: int,
    db: Session = Depends(get_db),
    current_user: dict = Depends(getCurrentUser)
):
    require_admin(current_user)

    try:
        castle = db.query(Castle).filter(Castle.castle_id == castle_id).first()
        if not castle:
            raise HTTPException(status_code=404, detail="ไม่พบข้อมูลปราสาท")

        architecture = db.query(Architecture).filter(Architecture.castle_id == castle_id).all()
        for item in architecture:
            db.delete(item)

        location_links = db.query(LocationCastle).filter(LocationCastle.castle_id == castle_id).all()
        for link in location_links:
            location = db.query(Location).filter(Location.location_id == link.location_id).first()
            db.delete(link)
            if location:
                db.delete(location)

        db.delete(castle)
        db.commit()

        return {"status": "success", "message": "ลบข้อมูลสำเร็จ"}

    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/upload-images/{castle_id}")
async def upload_castle_images(
    castle_id: int,
    files: List[UploadFile] = File(...),
    descriptions: Optional[str] = Form(None),
    cover_index: int = Form(0),
    db: Session = Depends(get_db),
    current_user: dict = Depends(getCurrentUser)
):
    require_admin(current_user)

    castle = db.query(Castle).filter(Castle.castle_id == castle_id).first()
    if not castle:
        raise HTTPException(status_code=404, detail="Castle not found")

    desc_list = descriptions.split("|||") if descriptions else []
    uploaded = []
    existing_count = db.query(Image).filter(Image.castle_id == castle_id).count()

    if existing_count >= 3:
        raise HTTPException(
            status_code=400,
            detail="สถานที่นี้มีรูปครบ 3 รูปแล้ว"
        )

    if existing_count + len(files) > 3:
        raise HTTPException(
            status_code=400,
            detail=f"อัปโหลดได้อีก {3 - existing_count} รูปเท่านั้น"
        )

    try:
        last_image = (
            db.query(Image)
            .filter(Image.castle_id == castle_id)
            .order_by(Image.sort_order.desc(), Image.img_id.desc())
            .first()
        )
        next_sort_order = (last_image.sort_order + 1) if last_image else 0

        for idx, file in enumerate(files):
            content = await file.read()
            if not content:
                continue

            ext = os.path.splitext(file.filename or "")[1] or ".jpg"
            filename = f"{uuid.uuid4().hex}{ext}"
            path = f"castles/{castle_id}/{filename}"

            content_type = (
                file.content_type
                or mimetypes.guess_type(file.filename or "")[0]
                or "image/jpeg"
            )

            supabase.storage.from_(SUPABASE_BUCKET).upload(
                path,
                content,
                {"content-type": content_type}
            )

            url = build_public_url(path)
            if not url:
                raise HTTPException(status_code=500, detail="ไม่สามารถสร้าง public URL ได้")

            if idx == cover_index:
                db.query(Image).filter(
                    Image.castle_id == castle_id,
                    Image.is_cover == True
                ).update({"is_cover": False}, synchronize_session=False)

            img = Image(
                castle_id=castle_id,
                img_url=url,
                img_description=desc_list[idx] if idx < len(desc_list) else (file.filename or ""),
                is_cover=(idx == cover_index),
                sort_order=next_sort_order + idx
            )

            db.add(img)
            db.flush()

            uploaded.append({
                "img_id": img.img_id,
                "castle_id": img.castle_id,
                "img_url": img.img_url,
                "img_description": img.img_description,
                "is_cover": img.is_cover,
                "sort_order": img.sort_order,
                "created_at": img.created_at.isoformat() if img.created_at else None,
            })

        db.commit()

        return {
            "status": "success",
            "message": "อัปโหลดรูปสำเร็จ",
            "data": uploaded
        }

    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/{castle_id}/images")
def get_images(castle_id: int, db: Session = Depends(get_db)):
    castle = db.query(Castle).filter(Castle.castle_id == castle_id).first()
    if not castle:
        raise HTTPException(status_code=404, detail="ไม่พบข้อมูลปราสาท")

    imgs = (
        db.query(Image)
        .filter(Image.castle_id == castle_id)
        .order_by(Image.is_cover.desc(), Image.sort_order.asc(), Image.img_id.asc())
        .all()
    )

    return {
        "status": "success",
        "data": [
            {
                "img_id": i.img_id,
                "castle_id": i.castle_id,
                "img_url": i.img_url,
                "img_description": i.img_description,
                "is_cover": i.is_cover,
                "sort_order": i.sort_order,
                "created_at": i.created_at.isoformat() if i.created_at else None,
            }
            for i in imgs
        ]
    }


@router.delete("/image/{img_id}")
def delete_image(
    img_id: int,
    db: Session = Depends(get_db),
    current_user: dict = Depends(getCurrentUser)
):
    require_admin(current_user)

    img = db.query(Image).filter(Image.img_id == img_id).first()
    if not img:
        raise HTTPException(status_code=404, detail="Image not found")

    try:
        castle_id = img.castle_id
        was_cover = img.is_cover

        db.delete(img)
        db.commit()

        if was_cover:
            first_img = (
                db.query(Image)
                .filter(Image.castle_id == castle_id)
                .order_by(Image.sort_order.asc(), Image.img_id.asc())
                .first()
            )
            if first_img:
                first_img.is_cover = True
                db.commit()

        return {"status": "success"}

    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))


@router.put("/image/{img_id}/cover")
def set_cover(
    img_id: int,
    db: Session = Depends(get_db),
    current_user: dict = Depends(getCurrentUser)
):
    require_admin(current_user)

    img = db.query(Image).filter(Image.img_id == img_id).first()
    if not img:
        raise HTTPException(status_code=404, detail="Image not found")

    db.query(Image).filter(
        Image.castle_id == img.castle_id
    ).update({"is_cover": False}, synchronize_session=False)

    img.is_cover = True
    db.commit()

    return {"status": "success"}