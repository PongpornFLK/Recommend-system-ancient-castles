import os
import re
import io
from datetime import date
from typing import Optional, List, Dict, Any, Tuple

from dotenv import load_dotenv
from fastapi import APIRouter, Depends, UploadFile, File, Query, HTTPException
from pydantic import BaseModel
from loguru import logger

from pymilvus import connections, Collection
from sentence_transformers import SentenceTransformer
from PIL import Image

from sqlalchemy.orm import Session
from sqlalchemy import text
from db import get_db

from langchain_groq import ChatGroq
from langchain_core.messages import SystemMessage, HumanMessage

load_dotenv()

router = APIRouter(prefix="/zilliz", tags=["zilliz"])

# =========================
# Embedders
# =========================
doc_embedder = SentenceTransformer("sentence-transformers/paraphrase-multilingual-mpnet-base-v2")
img_embedder = SentenceTransformer("sentence-transformers/clip-ViT-B-32")


# =========================
# Request Models
# =========================
class QAReq(BaseModel):
    query: str
    k: int = 5
    castle_id: Optional[int] = None

# connect_zilliz
def connect_zilliz():
    uri = os.getenv("ZILLIZ_URI")
    token = os.getenv("ZILLIZ_TOKEN")
    if not uri or not token:
        raise ValueError("Missing ZILLIZ_URI / ZILLIZ_TOKEN (check .env)")
    if not connections.has_connection("default"):
        connections.connect(alias="default", uri=uri, token=token, secure=True)
#โหลด Collection จาก Vector Database
def get_collection(name: str) -> Collection:
    col = Collection(name)
    col.load()
    return col


def get_groq_llm() -> ChatGroq:
    api_key = os.getenv("GROQ_API_KEY")
    if not api_key:
        raise ValueError("Missing GROQ_API_KEY in .env")
    return ChatGroq(
        model="llama-3.1-8b-instant",
        api_key=api_key.strip(),
        temperature=0.2,
    )


def sanitize_text(s: str) -> str:
    if not s:
        return ""
    s = s.replace("\r", "")
    s = re.sub(r"\n(?!\n)", " ", s)
    s = re.sub(r"\n{3,}", "\n\n", s)
    s = re.sub(r"[ \t]{2,}", " ", s)
    s = re.sub(r"([ก-๙])\s+([ก-๙])", r"\1\2", s)
    s = re.sub(r"\s+([่้๊๋์])", r"\1", s)
    return s.strip()


def normalize_query_text(text_value: str) -> str:
    if not text_value:
        return ""
    text_value = text_value.lower().strip()
    text_value = text_value.replace("\n", " ")
    text_value = re.sub(r"\s+", " ", text_value)

    replacements = {
        "มิมาย": "พิมาย",
        "พิมายย": "พิมาย",
        "พนรุ้ง": "พนมรุ้ง",
        "พนมรุ้ง": "พนมรุ้ง",
        "พนมรุ้งง": "พนมรุ้ง",
        "เมืองต้ำ": "เมืองต่ำ",
        "นครหลวงง": "นครหลวง",
    }
    for wrong, correct in replacements.items():
        text_value = text_value.replace(wrong, correct)

    return text_value


def contains_any(text_value: str, keywords: List[str]) -> bool:
    return any(kw in text_value for kw in keywords)


def detect_intents(query: str) -> Dict[str, bool]:
    q = normalize_query_text(query)

    travel_keywords = [
        "แนะนำการเดินทาง",
        "แนะนำวิธีเดินทาง",
        "แนะนำการไป",
        "เดินทางยังไง",
        "ไปยังไง",
        "ไปอย่างไร",
        "ควรเดินทางยังไง",
        "วิธีเดินทาง",
        "การเดินทางไป",
        "เดินทางไป",
        "travel guide",
        "how to travel",
        "how to go",
    ]

    nearby_keywords = [
        "ใกล้", "ใกล้เคียง", "สถานที่ใกล้", "สถานที่ใกล้เคียง", "ที่เที่ยวใกล้",
        "แนะนำที่เที่ยวใกล้", "รอบๆ", "รอบ", "รอบข้าง", "แถวๆ", "ละแวก",
        "near", "nearby", "around", "ใกล้พิมาย", "ใกล้พนมรุ้ง", "ใกล้เมืองต่ำ",
        "ใกล้นครหลวง",
    ]

    event_keywords = [
        "เทศกาล", "กิจกรรม", "event", "events", "งาน", "งานประเพณี", "ประเพณี",
        "festival", "festivals", "อีเวนต์", "มีงานอะไร", "ตอนนี้มีอะไร",
        "ช่วงนี้มีอะไร", "วันนี้มีอะไร", "มีกิจกรรม", "มีงาน", "จัดงาน", "งานที่จัด",
    ]

    current_keywords = [
        "ตอนนี้", "วันนี้", "ช่วงนี้", "ปัจจุบัน", "ล่าสุด", "ขณะนี้", "current", "now", "today"
    ]

    upcoming_keywords = [
        "เร็วๆนี้", "ที่จะถึง", "อนาคต", "ถัดไป", "เดือนหน้า", "ปีหน้า", "upcoming", "next", "soon"
    ]

    general_keywords = [
        "ข้อมูล", "รายละเอียด", "ประวัติ", "คืออะไร", "คือ", "เกี่ยวกับ",
        "ลักษณะ", "สถาปัตยกรรม", "ยุคสมัย", "สร้างสมัยใด", "สร้างเมื่อใด",
        "description", "detail",
    ]

    return {
        "is_travel_query": contains_any(q, travel_keywords),
        "is_nearby_query": contains_any(q, nearby_keywords),
        "is_event_query": contains_any(q, event_keywords),
        "is_current_query": contains_any(q, current_keywords),
        "is_upcoming_query": contains_any(q, upcoming_keywords),
        "is_general_query": contains_any(q, general_keywords),
    }


def pick_vector_field(col: Collection) -> Tuple[str, int]:
    for f in col.schema.fields:
        if str(getattr(f, "dtype", "")) == "101" or "FLOAT_VECTOR" in str(getattr(f, "dtype", "")):
            try:
                dim = int(getattr(f, "params", {}).get("dim"))
            except Exception:
                dim = None
            return f.name, (dim or 0)
    raise ValueError(f"Vector field not found in collection: {col.name}")


def detect_castle_from_query(db: Session, query: str) -> Optional[Dict[str, Any]]:
    """
    จับชื่อปราสาทจาก keyword table ก่อน
    ถ้าไม่เจอ ให้ fallback ไปตรวจจาก castles โดยตรง
    """
    normalized_query = normalize_query_text(query)

    sql = text("""
        SELECT
            pr.castle_id,
            pr.place_id,
            k.keyword
        FROM keywords k
        JOIN place_keywords pk ON k.keyword_id = pk.keyword_id
        JOIN places_rag pr ON pk.place_id = pr.place_id
        WHERE REPLACE(LOWER(:query), ' ', '') LIKE '%' || REPLACE(LOWER(k.keyword), ' ', '') || '%'
        ORDER BY LENGTH(k.keyword) DESC
        LIMIT 1
    """)
    row = db.execute(sql, {"query": normalized_query}).mappings().first()
    if row:
        return dict(row)

    castle_rows = db.execute(text("""
        SELECT castle_id, castle_name
        FROM castles
        ORDER BY castle_id ASC
    """)).mappings().all()

    for row in castle_rows:
        castle_name = normalize_query_text(row["castle_name"] or "")
        if castle_name and castle_name in normalized_query:
            return {
                "castle_id": row["castle_id"],
                "place_id": None,
                "keyword": row["castle_name"],
            }

    fallback_map = [
        ("พิมาย", 1),
        ("ปราสาทพิมาย", 1),
        ("ปราสาทหินพิมาย", 1),
        ("พนมรุ้ง", 2),
        ("ปราสาทพนมรุ้ง", 2),
        ("ปราสาทหินพนมรุ้ง", 2),
        ("เมืองต่ำ", 3),
        ("ปราสาทเมืองต่ำ", 3),
        ("ปราสาทหินเมืองต่ำ", 3),
        ("นครหลวง", 4),
        ("ปราสาทนครหลวง", 4),
    ]

    for keyword, castle_id in fallback_map:
        if normalize_query_text(keyword) in normalized_query:
            return {
                "castle_id": castle_id,
                "place_id": None,
                "keyword": keyword,
            }

    return None


# =========================
# DB Helpers
# =========================
def fetch_castles_map(db: Session, castle_ids: List[int]) -> Dict[int, Dict[str, Any]]:
    
    if not castle_ids:
        return {}

    ids = list(set(castle_ids))
    if not ids:
        return {}

    placeholders = ", ".join([str(int(cid)) for cid in ids])

    sql = text(f"""
        SELECT
            c.castle_id,
            c.castle_name,
            c.castle_description,
            c.era,
            c.type_id,
            ct.type_detail,
            (
                SELECT a.architec_detail
                FROM architectures a
                WHERE a.castle_id = c.castle_id
                  AND a.architec_detail IS NOT NULL
                  AND a.architec_detail <> ''
                LIMIT 1
            ) AS architecture,
            (
                SELECT STRING_AGG(e.event_name || ': ' || e.event_description, ' | ')
                FROM events e
                WHERE e.castle_id = c.castle_id
            ) AS festivals_info
        FROM castles c
        LEFT JOIN castle_types ct ON ct.type_id = c.type_id
        WHERE c.castle_id IN ({placeholders})
    """)

    rows = db.execute(sql).mappings().all()
    return {r["castle_id"]: dict(r) for r in rows}

def fetch_cover_images_map(db: Session, castle_ids: List[int]) -> Dict[int, Optional[str]]:
    if not castle_ids:
        return {}

    ids = list(set([int(cid) for cid in castle_ids if cid is not None]))
    if not ids:
        return {}

    placeholders = ", ".join([str(cid) for cid in ids])

    sql = text(f"""
        SELECT DISTINCT ON (i.castle_id)
            i.castle_id,
            i.img_url
        FROM images i
        WHERE i.castle_id IN ({placeholders})
        ORDER BY i.castle_id, i.is_cover DESC, i.sort_order ASC, i.img_id ASC
    """)

    rows = db.execute(sql).mappings().all()
    return {r["castle_id"]: r["img_url"] for r in rows}
def get_castle_location(db: Session, castle_id: int) -> Optional[Dict[str, Any]]:
    sql = text("""
        SELECT
            c.castle_id,
            c.castle_name,
            l.latitude,
            l.longitude,
            l.sub_district,
            l.district,
            l.province
        FROM castles c
        LEFT JOIN location_castles lc ON lc.castle_id = c.castle_id
        LEFT JOIN locations l ON l.location_id = lc.location_id
        WHERE c.castle_id = :castle_id
        LIMIT 1
    """)
    row = db.execute(sql, {"castle_id": castle_id}).mappings().first()
    return dict(row) if row else None


def get_nearby_places(db: Session, castle_id: int, limit: int = 10) -> List[Dict[str, Any]]:
    sql = text("""
        SELECT
            nearplace_id,
            castle_id,
            place_name,
            nearby_detail,
            latitude,
            longitude
        FROM nearby_places
        WHERE castle_id = :castle_id
        ORDER BY nearplace_id ASC
        LIMIT :limit_val
    """)
    rows = db.execute(sql, {"castle_id": castle_id, "limit_val": limit}).mappings().all()
    return [dict(r) for r in rows]


def get_events_by_castle(
    db: Session,
    castle_id: int,
    only_current: bool = False,
    only_upcoming: bool = False,
    limit: int = 10,
) -> List[Dict[str, Any]]:
    today = date.today()

    if only_current:
        sql = text("""
            SELECT
                event_id,
                castle_id,
                event_name,
                event_description,
                event_start_date,
                event_end_date,
                event_start_time,
                event_end_time
            FROM events
            WHERE castle_id = :castle_id
              AND event_start_date <= :today
              AND event_end_date >= :today
            ORDER BY event_start_date ASC
            LIMIT :limit_val
        """)
        rows = db.execute(
            sql,
            {"castle_id": castle_id, "today": today, "limit_val": limit}
        ).mappings().all()
        return [dict(r) for r in rows]

    if only_upcoming:
        sql = text("""
            SELECT
                event_id,
                castle_id,
                event_name,
                event_description,
                event_start_date,
                event_end_date,
                event_start_time,
                event_end_time
            FROM events
            WHERE castle_id = :castle_id
              AND event_start_date > :today
            ORDER BY event_start_date ASC
            LIMIT :limit_val
        """)
        rows = db.execute(
            sql,
            {"castle_id": castle_id, "today": today, "limit_val": limit}
        ).mappings().all()
        return [dict(r) for r in rows]

    sql = text("""
        SELECT
            event_id,
            castle_id,
            event_name,
            event_description,
            event_start_date,
            event_end_date,
            event_start_time,
            event_end_time
        FROM events
        WHERE castle_id = :castle_id
        ORDER BY event_start_date ASC
        LIMIT :limit_val
    """)
    rows = db.execute(
        sql,
        {"castle_id": castle_id, "limit_val": limit}
    ).mappings().all()
    return [dict(r) for r in rows]


# =========================
# Builder Helpers
# =========================
def build_travel_highlights(
    nearby_places: List[Dict[str, Any]],
    events: List[Dict[str, Any]],
    limit_nearby: int = 3,
    limit_events: int = 2,
) -> List[Dict[str, Any]]:
    highlights = []

    for place in nearby_places[:limit_nearby]:
        highlights.append({
            "type": "nearby",
            "title": place.get("place_name"),
            "description": place.get("nearby_detail"),
            "latitude": place.get("latitude"),
            "longitude": place.get("longitude"),
        })

    for event in events[:limit_events]:
        highlights.append({
            "type": "event",
            "title": event.get("event_name"),
            "description": event.get("event_description"),
            "event_start_date": str(event.get("event_start_date")) if event.get("event_start_date") else None,
            "event_end_date": str(event.get("event_end_date")) if event.get("event_end_date") else None,
            "event_start_time": event.get("event_start_time"),
            "event_end_time": event.get("event_end_time"),
        })

    return highlights


def build_travel_answer(
    castle_info: Dict[str, Any],
    location_info: Optional[Dict[str, Any]],
    nearby_places: List[Dict[str, Any]],
    events: List[Dict[str, Any]],
) -> str:
    castle_name = sanitize_text(castle_info.get("castle_name") or "ไม่ระบุ")

    if not location_info:
        return (
            "### แนะนำการเดินทาง\n"
            f"พบชื่อสถานที่คือ **{castle_name}** แต่ยังไม่มีพิกัดในฐานข้อมูล\n\n"
            "### จุดแวะน่าสนใจ\n"
            "- ยังไม่มีข้อมูลพิกัดสำหรับแนะนำเส้นทาง\n\n"
            "### สถานที่ที่เกี่ยวข้อง\n"
            f"- {castle_name}"
        )

    latitude = location_info.get("latitude")
    longitude = location_info.get("longitude")
    sub_district = sanitize_text(location_info.get("sub_district") or "-")
    district = sanitize_text(location_info.get("district") or "-")
    province = sanitize_text(location_info.get("province") or "-")

    lines = [
        "### แนะนำการเดินทาง",
        f"สถานที่ปลายทางคือ **{castle_name}**",
        "",
        f"- จังหวัด: {province}",
        f"- อำเภอ: {district}",
        f"- ตำบล: {sub_district}",
        f"- พิกัด: {latitude}, {longitude}",
        "",
        "### จุดแวะน่าสนใจ",
    ]

    if nearby_places:
        lines.append("สถานที่ใกล้เคียงที่สามารถแวะได้:")
        for idx, place in enumerate(nearby_places[:3], start=1):
            place_name = sanitize_text(place.get("place_name") or "ไม่ระบุชื่อ")
            detail = sanitize_text(place.get("nearby_detail") or "ไม่มีรายละเอียด")
            lines.append(f"{idx}. **{place_name}** - {detail}")
    else:
        lines.append("- ยังไม่มีข้อมูลสถานที่ใกล้เคียงในฐานข้อมูล")

    if events:
        lines.append("")
        lines.append("เทศกาลหรือกิจกรรมที่เกี่ยวข้อง:")
        for idx, event in enumerate(events[:2], start=1):
            event_name = sanitize_text(event.get("event_name") or "ไม่ระบุชื่อกิจกรรม")
            event_description = sanitize_text(event.get("event_description") or "ไม่มีรายละเอียด")
            event_start_date = event.get("event_start_date") or "-"
            event_end_date = event.get("event_end_date") or "-"
            lines.append(
                f"{idx}. **{event_name}** - {event_description} "
                f"(วันที่ {event_start_date} ถึง {event_end_date})"
            )
    else:
        lines.append("")
        lines.append("เทศกาลหรือกิจกรรมที่เกี่ยวข้อง:")
        lines.append("- ยังไม่มีข้อมูลกิจกรรมในฐานข้อมูล")

    lines.extend([
        "",
        "### คำแนะนำ",
        "- ระบบสามารถใช้สถานที่ใกล้เคียงและกิจกรรมเหล่านี้เป็นจุดแวะระหว่างทางได้",
        "",
        "### สถานที่ที่เกี่ยวข้อง",
        f"- {castle_name}",
    ])

    return "\n".join(lines)


def build_nearby_answer(castle_info: Dict[str, Any], nearby_places: List[Dict[str, Any]]) -> str:
    castle_name = sanitize_text(castle_info.get("castle_name") or "ไม่ระบุ")

    if not nearby_places:
        return (
            "### สถานที่ใกล้เคียง\n"
            f"ขออภัย ยังไม่พบข้อมูลสถานที่ใกล้เคียงของ **{castle_name}** ในฐานข้อมูล\n\n"
            "### สถานที่ที่เกี่ยวข้อง\n"
            f"- {castle_name}"
        )

    lines = [
        "### สถานที่ใกล้เคียง",
        f"สถานที่ใกล้ **{castle_name}** ที่พบในฐานข้อมูล ได้แก่"
    ]

    for idx, place in enumerate(nearby_places, start=1):
        place_name = sanitize_text(place.get("place_name") or "ไม่ระบุชื่อ")
        detail = sanitize_text(place.get("nearby_detail") or "ไม่มีรายละเอียด")
        latitude = place.get("latitude")
        longitude = place.get("longitude")

        lines.append(f"{idx}. **{place_name}**")
        lines.append(f"   - รายละเอียด: {detail}")
        if latitude is not None and longitude is not None:
            lines.append(f"   - พิกัด: {latitude}, {longitude}")

    lines.append("")
    lines.append("### สถานที่ที่เกี่ยวข้อง")
    lines.append(f"- {castle_name}")

    return "\n".join(lines)


def build_event_answer(
    castle_info: Dict[str, Any],
    events: List[Dict[str, Any]],
    is_current_query: bool = False,
    is_upcoming_query: bool = False,
) -> str:
    castle_name = sanitize_text(castle_info.get("castle_name") or "ไม่ระบุ")

    title_text = "### กิจกรรมและเทศกาล"
    if is_current_query:
        title_text = "### กิจกรรมและเทศกาลที่จัดอยู่ตอนนี้"
    elif is_upcoming_query:
        title_text = "### กิจกรรมและเทศกาลที่กำลังจะมาถึง"

    if not events:
        empty_text = "ขออภัย ไม่พบข้อมูล"
        if is_current_query:
            empty_text = "ขออภัย ตอนนี้ไม่พบกิจกรรมที่กำลังจัดอยู่"
        elif is_upcoming_query:
            empty_text = "ขออภัย ไม่พบกิจกรรมที่กำลังจะมาถึง"

        return (
            f"{title_text}\n"
            f"{empty_text} สำหรับ **{castle_name}**\n\n"
            "### สถานที่ที่เกี่ยวข้อง\n"
            f"- {castle_name}"
        )

    lines = [title_text, f"ข้อมูลกิจกรรมของ **{castle_name}**"]

    for idx, event in enumerate(events, start=1):
        event_name = sanitize_text(event.get("event_name") or "ไม่ระบุชื่อกิจกรรม")
        event_description = sanitize_text(event.get("event_description") or "ไม่มีรายละเอียด")
        event_start_date = event.get("event_start_date")
        event_end_date = event.get("event_end_date")
        event_start_time = event.get("event_start_time") or "-"
        event_end_time = event.get("event_end_time") or "-"

        lines.append(f"{idx}. **{event_name}**")
        lines.append(f"   - รายละเอียด: {event_description}")
        lines.append(f"   - วันที่เริ่ม: {event_start_date}")
        lines.append(f"   - วันที่สิ้นสุด: {event_end_date}")
        lines.append(f"   - เวลาเริ่ม: {event_start_time}")
        lines.append(f"   - เวลาสิ้นสุด: {event_end_time}")

    lines.append("")
    lines.append("### สถานที่ที่เกี่ยวข้อง")
    lines.append(f"- {castle_name}")

    return "\n".join(lines)


# =========================
# API Endpoints
# =========================

# ---------- QA (Text Search) ----------
@router.post("/qa")
def qa(req: QAReq, db: Session = Depends(get_db)):
    try:
        query_text = sanitize_text(req.query or "")
        normalized_query = normalize_query_text(query_text)

        intents = detect_intents(normalized_query)
        detected = detect_castle_from_query(db, normalized_query)

        logger.info(
            f"QA query={normalized_query}, detected={detected}, "
            f"is_travel={intents['is_travel_query']}, "
            f"is_nearby={intents['is_nearby_query']}, "
            f"is_event={intents['is_event_query']}"
        )

        matched_castle_id = None
        match_source = "none"

        if req.castle_id is not None:
            matched_castle_id = req.castle_id
            match_source = "request.castle_id"
        elif detected is not None:
            matched_castle_id = detected["castle_id"]
            match_source = "keyword"

        castle_map = fetch_castles_map(db, [matched_castle_id] if matched_castle_id else [])
        current_castle_info = castle_map.get(matched_castle_id) if matched_castle_id else None


        # TRAVEL QUERY
        if intents["is_travel_query"]:
            if matched_castle_id is None:
                cover_map = fetch_cover_images_map(db, [matched_castle_id] if matched_castle_id else [])
                return {
                    "answer": "### แนะนำการเดินทาง\nขออภัย ระบบยังไม่สามารถระบุสถานที่ปลายทางจากคำถามนี้ได้",
                    "intent": "travel_no_castle",
                    "castles": [],
                    "hits": [],
                    "nearby_places": [],
                    "events": [],
                    "travel_highlights": [],
                    "route": None,
                    "map_link": None,
                    "plan_link": None,
                    "debug": {
                        "intent": "travel_no_castle",
                        "detected": detected,
                        "matched_castle_id": matched_castle_id,
                        "match_source": match_source,
                        "normalized_query": normalized_query,
                    }
                }

            location_info = get_castle_location(db, matched_castle_id)
            nearby_places = get_nearby_places(db, matched_castle_id, limit=5)
            events = get_events_by_castle(
                db=db,
                castle_id=matched_castle_id,
                only_current=False,
                only_upcoming=False,
                limit=5,
            )
            travel_highlights = build_travel_highlights(nearby_places, events)

            return {
                "answer": build_travel_answer(
                    current_castle_info or {"castle_name": "ไม่ระบุ"},
                    location_info,
                    nearby_places,
                    events,
                ),
                "intent": "travel",
                "castles": [
                        {
                            **current_castle_info,
                            "cover_image": cover_map.get(matched_castle_id)
                        }
                    ] if current_castle_info else [],
                "hits": [],
                "nearby_places": nearby_places,
                "events": events,
                "travel_highlights": travel_highlights,
                "route": location_info,
                "map_link": f"/viewroute?castle_id={matched_castle_id}",
                "plan_link": f"/plan?castle_id={matched_castle_id}",
                "debug": {
                    "intent": "travel",
                    "detected": detected,
                    "matched_castle_id": matched_castle_id,
                    "match_source": match_source,
                    "normalized_query": normalized_query,
                    "location_found": location_info is not None,
                    "nearby_count": len(nearby_places),
                    "event_count": len(events),
                }
            }

        # NEARBY QUERY
        if intents["is_nearby_query"] and matched_castle_id:
            nearby_places = get_nearby_places(db, matched_castle_id, limit=10)
            cover_map = fetch_cover_images_map(db, [matched_castle_id])
            return {
                "answer": build_nearby_answer(
                    current_castle_info or {"castle_name": "ไม่ระบุ"},
                    nearby_places
                ),
                "intent": "nearby",
                "castles": [
                    {
                        **current_castle_info,
                        "cover_image": cover_map.get(matched_castle_id)
                    }
                ] if current_castle_info else [],
                "hits": [],
                "nearby_places": nearby_places,
                "events": [],
                "travel_highlights": [],
                "route": None,
                "map_link": f"/viewroute?castle_id={matched_castle_id}",
                "plan_link": f"/plan?castle_id={matched_castle_id}",
                "debug": {
                    "intent": "nearby",
                    "detected": detected,
                    "matched_castle_id": matched_castle_id,
                    "match_source": match_source,
                    "normalized_query": normalized_query,
                }
            }


        # EVENT QUERY
        if intents["is_event_query"] and matched_castle_id:
            events = get_events_by_castle(
                db=db,
                castle_id=matched_castle_id,
                only_current=intents["is_current_query"],
                only_upcoming=intents["is_upcoming_query"],
                limit=10,
            )
            cover_map = fetch_cover_images_map(db, [matched_castle_id])
            return {
                "answer": build_event_answer(
                    current_castle_info or {"castle_name": "ไม่ระบุ"},
                    events,
                    is_current_query=intents["is_current_query"],
                    is_upcoming_query=intents["is_upcoming_query"],
                ),
                "intent": "event",
                "castles": [
                    {
                        **current_castle_info,
                        "cover_image": cover_map.get(matched_castle_id)
                    }
                ] if current_castle_info else [],
                "hits": [],
                "nearby_places": [],
                "events": events,
                "travel_highlights": [],
                "route": None,
                "map_link": f"/viewroute?castle_id={matched_castle_id}",
                "plan_link": f"/plan?castle_id={matched_castle_id}" + (f"&event_id={events[0]['event_id']}" if events else ""),
                "debug": {
                    "intent": "event",
                    "detected": detected,
                    "matched_castle_id": matched_castle_id,
                    "match_source": match_source,
                    "normalized_query": normalized_query,
                }
            }

        # GENERAL QUESTION -> VECTOR SEARCH
        connect_zilliz()
        col = get_collection("document_vectors")

        qvec = doc_embedder.encode(
            query_text,
            normalize_embeddings=True
        ).tolist()

        expr = None
        if matched_castle_id is not None:
            expr = f"castle_id == {matched_castle_id}"

        res = col.search(
            data=[qvec],
            anns_field="document_vector",
            param={"metric_type": "COSINE", "params": {"ef": 64}},
            limit=req.k,
            expr=expr,
            output_fields=["castle_id", "document_name", "chunk_text"],
        )

        MIN_SCORE = 0.50 if matched_castle_id is not None else 0.55
        
        #กรองผลลัพธ์ข้อความและเชื่อมกับฐานข้อมูลหลัก
        raw_hits = []
        filtered_hits = []
        castle_ids = []

        for hit in res[0]:
            score = float(hit.score)
            cid = hit.entity.get("castle_id")
            doc_name = hit.entity.get("document_name") or ""
            chunk_text = sanitize_text(hit.entity.get("chunk_text") or "")

            hit_obj = {
                "score": score,
                "castle_id": int(cid) if cid is not None else None,
                "document_name": doc_name,
                "chunk_text": chunk_text,
            }
            raw_hits.append(hit_obj)

            if score < MIN_SCORE:
                continue

            if not chunk_text.strip():
                continue

            filtered_hits.append(hit_obj)

            if cid is not None:
                castle_ids.append(int(cid))

        filtered_hits = sorted(filtered_hits, key=lambda x: x["score"], reverse=True)

        if not filtered_hits:
            return {
                "answer": "### ผลการค้นหา\nขออภัย ไม่พบข้อมูลที่เกี่ยวข้องในฐานข้อมูล",
                "intent": "general_vector_no_result",
                "castles": [],
                "hits": [],
                "nearby_places": [],
                "events": [],
                "travel_highlights": [],
                "route": None,
                "map_link": None,
                "plan_link": None,
                "debug": {
                    "intent": "general_vector_no_result",
                    "detected": detected,
                    "matched_castle_id": matched_castle_id,
                    "match_source": match_source,
                    "expr": expr,
                    "min_score": MIN_SCORE,
                    "raw_scores": [round(h["score"], 4) for h in raw_hits],
                    "used_scores": [],
                    "normalized_query": normalized_query,
                }
            }

        filtered_hits = filtered_hits[:3]
        castle_map = fetch_castles_map(db, list(set(castle_ids)))

        context_lines = []
        related_castles = set()

        for i, h in enumerate(filtered_hits, start=1):
            c_info = castle_map.get(h["castle_id"])
            if not c_info:
                continue

            related_castles.add(h["castle_id"])

            context_lines.append(
                f"ข้อมูลชุดที่ {i}\n"
                f"ชื่อปราสาท: {sanitize_text(c_info.get('castle_name') or '')}\n"
                f"ชื่อเอกสาร: {sanitize_text(h.get('document_name') or '')}\n"
                f"คะแนนความเกี่ยวข้อง: {h['score']:.4f}\n"
                f"เนื้อหาจากเอกสาร: {h['chunk_text']}\n"
            )

        context = "\n\n".join(context_lines).strip()

        if not context:
            return {
                "answer": "### ผลการค้นหา\nขออภัย ไม่พบข้อมูลที่เกี่ยวข้องในฐานข้อมูล",
                "intent": "general_vector_empty_context",
                "castles": [],
                "hits": [],
                "nearby_places": [],
                "events": [],
                "travel_highlights": [],
                "route": None,
                "map_link": None,
                "plan_link": None,
                "debug": {
                    "intent": "general_vector_empty_context",
                    "detected": detected,
                    "matched_castle_id": matched_castle_id,
                    "match_source": match_source,
                    "expr": expr,
                    "min_score": MIN_SCORE,
                    "raw_scores": [round(h["score"], 4) for h in raw_hits],
                    "used_scores": [round(h["score"], 4) for h in filtered_hits],
                    "normalized_query": normalized_query,
                }
            }

        try:
            llm = get_groq_llm()

            system = SystemMessage(content=(
                "คุณเป็นผู้ช่วยสรุปข้อมูลเกี่ยวกับโบราณสถานไทย\n"
                "กฎสำคัญ:\n"
                "1. ใช้เฉพาะข้อมูลจากบริบทที่ได้รับเท่านั้น ห้ามแต่งข้อมูลเอง\n"
                "2. หากบริบทไม่มีคำตอบตรงคำถาม ให้ตอบว่า 'ขออภัย ไม่พบข้อมูลส่วนนี้ในฐานข้อมูลเอกสาร'\n"
                "3. ตอบเป็นภาษาไทยแบบสุภาพ กระชับ ชัดเจน\n"
                "4. ถ้าผู้ใช้ถามถึงสถานที่เฉพาะแห่ง ให้ตอบเฉพาะแห่งนั้นก่อน\n"
                "5. ห้ามสรุปเกินกว่าที่ปรากฏในบริบท\n"
            ))

            human = HumanMessage(content=(
                f"คำถามผู้ใช้: {query_text}\n\n"
                f"บริบทข้อมูล:\n{context}\n\n"
                "โปรดตอบเป็น Markdown ตามรูปแบบนี้:\n"
                "### สรุปจากเอกสาร\n"
                "(ตอบจากบริบทเท่านั้น)\n\n"
                "### สถานที่ที่เกี่ยวข้อง\n"
                "- ระบุชื่อปราสาทที่เกี่ยวข้องเท่านั้น"
            ))

            ai = llm.invoke([system, human])
            answer_text = sanitize_text(ai.content)

        except Exception:
            top_chunk = filtered_hits[0]["chunk_text"] if filtered_hits else ""
            top_castle_name = "ไม่ระบุ"
            if filtered_hits and filtered_hits[0]["castle_id"] in castle_map:
                top_castle_name = castle_map[filtered_hits[0]["castle_id"]]["castle_name"]

            answer_text = (
                "### สรุปจากเอกสาร\n"
                "ระบบสรุปอัตโนมัติขัดข้อง จึงแสดงข้อความจากเอกสารที่ใกล้เคียงที่สุดแทน\n\n"
                f"{top_chunk}\n\n"
                "### สถานที่ที่เกี่ยวข้อง\n"
                f"- {top_castle_name}"
            )

        castles_out = []
        for cid in related_castles:
            info = castle_map.get(cid)
            if not info:
                continue
            cover_map = fetch_cover_images_map(db, list(related_castles))
            castles_out.append({
                "castle_id": info["castle_id"],
                "castle_name": info["castle_name"],
                "castle_description": info["castle_description"],
                "era": info["era"],
                "type_detail": info["type_detail"],
                "architecture": info["architecture"],
                "festivals": info.get("festivals_info") or "ไม่มีกิจกรรม",
                "cover_image": cover_map.get(cid),
            })
        final_intent = "general_vector_with_keyword" if matched_castle_id else "general_vector_direct"

        return {
            "answer": answer_text,
            "intent": final_intent,
            "castles": castles_out,
            "hits": filtered_hits,
            "nearby_places": [],
            "events": [],
            "travel_highlights": [],
            "route": None,
            "map_link": f"/viewroute?castle_id={matched_castle_id}" if matched_castle_id else None,
            "plan_link": f"/plan?castle_id={matched_castle_id}" if matched_castle_id else None,
            "debug": {
                "intent": final_intent,
                "detected": detected,
                "matched_castle_id": matched_castle_id,
                "match_source": match_source,
                "expr": expr,
                "min_score": MIN_SCORE,
                "raw_scores": [round(h["score"], 4) for h in raw_hits],
                "used_scores": [round(h["score"], 4) for h in filtered_hits],
                "normalized_query": normalized_query,
            }
        }

    except Exception as e:
        logger.exception("QA failed")
        raise HTTPException(status_code=500, detail=str(e))


# ---------- Image Search ----------
@router.post("/images")
def search_images(
    k: int = Query(5, ge=1, le=20),
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    try:
        connect_zilliz()
        col = get_collection("image_vectors")
        anns_field, _ = pick_vector_field(col)

        content = file.file.read()
        img = Image.open(io.BytesIO(content)).convert("RGB")
        qvec = img_embedder.encode(img, normalize_embeddings=True).tolist()

        res = col.search(
            data=[qvec],
            anns_field=anns_field,
            param={"metric_type": "COSINE", "params": {"nprobe": 10}},
            limit=k,
            output_fields=["castle_id", "image_url"]
        )

        MIN_SCORE = 0.85
        hits, castle_ids = [], []

        for hit in res[0]:
            score = float(hit.score)
            if score < MIN_SCORE:
                continue

            cid = hit.entity.get("castle_id")
            cid_int = int(cid) if cid is not None else None
            if cid_int is not None:
                castle_ids.append(cid_int)

            hits.append({
                "score": score,
                "castle_id": cid_int,
                "image_url": hit.entity.get("image_url")
            })

        if not hits:
            return {
                "hits": [],
                "castles": [],
                "message": "ไม่พบรูปภาพที่เกี่ยวข้องในฐานข้อมูล"
            }

        castle_map = fetch_castles_map(db, list(set(castle_ids)))
        cover_map = fetch_cover_images_map(db, list(set(castle_ids)))
        
        #จัดกลุ่มผลลัพธ์ภาพและส่งกลับสู่ Front-end
        best_by_castle = {}

        for h in hits:
            if h["castle_id"]:
                best_by_castle[h["castle_id"]] = max(
                    best_by_castle.get(h["castle_id"], 0.0),
                    h["score"]
                )
                sorted_castles = sorted(best_by_castle.items(), key=lambda x: x[1], reverse=True)
        castles = []
        if sorted_castles:
            cid, best = sorted_castles[0]

            c = castle_map.get(cid)
            if c:
                castles.append({
                    "castle_id": c["castle_id"],
                    "castle_name": sanitize_text(c["castle_name"] or ""),
                    "castle_description": sanitize_text(c["castle_description"] or ""),
                    "era": c["era"] or "ไม่ระบุ",
                    "type_detail": c["type_detail"] or "ไม่ระบุ",
                    "architecture": c["architecture"] or "ไม่มีข้อมูล",
                    "festivals": c.get("festivals_info") or "ไม่มีข้อมูลกิจกรรม",
                    "best_score": float(best),
                    "cover_image": cover_map.get(cid),
                })
        return {"hits": hits, "castles": castles}

    except Exception as e:
        logger.exception("Image search failed")
        raise HTTPException(status_code=500, detail=str(e))