import io
import time
import hashlib
from typing import List

from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from PyPDF2 import PdfReader

from route.zilliz_search import connect_zilliz, get_collection, doc_embedder

router = APIRouter(prefix="/manage-doc-vector", tags=["manage-doc-vector"])


def stable_int64_from_text(s: str) -> int:
    h = hashlib.sha1(s.encode("utf-8")).hexdigest()[:16]
    x = int(h, 16)
    return x % (2**63 - 1)


def chunk_text(text: str, chunk_size=500, overlap=100):
    chunks = []
    start = 0
    while start < len(text):
        chunk = text[start:start+chunk_size]
        chunks.append(chunk)
        start += chunk_size - overlap
    return chunks


def extract_text_pdf(content: bytes):
    reader = PdfReader(io.BytesIO(content))
    return "\n".join([p.extract_text() or "" for p in reader.pages])


@router.post("/upload-document-vector")
async def upload_doc_vector(
    castle_id: int = Form(...),
    file: UploadFile = File(...)
):
    try:
        content = await file.read()

        # อ่าน text
        if file.filename.endswith(".pdf"):
            text = extract_text_pdf(content)
        else:
            text = content.decode("utf-8", errors="ignore")

        if not text.strip():
            raise HTTPException(status_code=400, detail="ไม่มีข้อความในไฟล์")

        chunks = chunk_text(text)

        connect_zilliz()
        col = get_collection("document_vectors")

        vectors = doc_embedder.encode(chunks, normalize_embeddings=True).tolist()

        rows = []
        document_id = stable_int64_from_text(file.filename)

        for i, (chunk, vec) in enumerate(zip(chunks, vectors)):

            chunk_id = stable_int64_from_text(chunk + str(i))
            place_id = stable_int64_from_text(f"{castle_id}-{i}")

            rows.append({
                "chunk_id": chunk_id,
                "document_id": document_id,
                "castle_id": castle_id,
                "place_id": place_id,
                "chunk_text": chunk,
                "document_name": file.filename,
                "source_url": "",  # ยังไม่ใช้ก็ใส่ ""
                "document_vector": vec
            })

        col.insert(rows)
        col.flush()

        return {
            "status": "success",
            "inserted": len(rows)
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))