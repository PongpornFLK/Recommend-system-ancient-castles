import io
import time
import hashlib
from typing import Optional

from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from PIL import Image

from route.zilliz_search import connect_zilliz, get_collection, img_embedder

router = APIRouter(prefix="/manage-vector", tags=["manage-vector"])


def stable_int64_from_text(s: str) -> int:
    h = hashlib.sha1(s.encode("utf-8")).hexdigest()[:16]
    x = int(h, 16)
    return x % (2**63 - 1)


@router.post("/upload-image-vector")
async def upload_image_vector(
    castle_id: int = Form(...),
    file: UploadFile = File(...),
):
    try:
        if not file:
            raise HTTPException(status_code=400, detail="กรุณาอัปโหลดรูปภาพ")

        if not file.content_type or not file.content_type.startswith("image/"):
            raise HTTPException(status_code=400, detail="ไฟล์ที่อัปโหลดต้องเป็นรูปภาพเท่านั้น")

        connect_zilliz()
        img_col = get_collection("image_vectors")

        content = await file.read()
        if not content:
            raise HTTPException(status_code=400, detail="ไฟล์รูปว่างเปล่า")

        try:
            img = Image.open(io.BytesIO(content)).convert("RGB")
        except Exception:
            raise HTTPException(status_code=400, detail="ไม่สามารถเปิดไฟล์รูปได้")

        vector = img_embedder.encode(img, normalize_embeddings=True).tolist()

        original_filename = file.filename or f"upload_{int(time.time())}.jpg"
        unique_key = f"{castle_id}:{original_filename}:{int(time.time() * 1000)}"
        img_id = stable_int64_from_text(unique_key)

        row = {
            "img_id": img_id,
            "castle_id": castle_id,
            "place_id": 0,
            "image_url": original_filename,  # เก็บชื่อไฟล์ไว้เป็น metadata
            "image_vector": vector,
        }

        img_col.insert([row])
        img_col.flush()

        return {
            "status": "success",
            "message": "อัปโหลดและเพิ่ม image vector สำเร็จ",
            "img_id": img_id,
            "castle_id": castle_id,
            "original_filename": original_filename,
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))