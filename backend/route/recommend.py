from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func, text

from db import get_db
from authen.secur import getOptionalUser
from model.model import Interest, Castle, CastleType, Architecture

router = APIRouter(prefix="/recommend", tags=["recommend"])


# =========================
# Helper: normalize text
# =========================
def normalize_text(value: str) -> str:
    return (value or "").strip().lower()


# =========================
# Helper: split architecture into keyword set
# =========================
def tokenize_architecture(value: str) -> set[str]:
    text_value = normalize_text(value)
    if not text_value:
        return set()

    # แยกด้วย comma ก่อน
    parts = []
    for chunk in text_value.split(","):
        chunk = chunk.strip()
        if chunk:
            parts.append(chunk)

    # แตกต่อด้วยช่องว่าง
    words = set()
    for part in parts:
        for word in part.split():
            word = word.strip()
            if word:
                words.add(word)

        # เก็บทั้งวลีด้วย เผื่อบางกรณีตรงกันทั้ง phrase
        words.add(part)

    return words


# =========================
# Helper: similarity score
# =========================
def calculate_similarity_score(candidate, target) -> int:
    score = 0

    TYPE_WEIGHT = 3
    ERA_WEIGHT = 2
    ARCH_EXACT_WEIGHT = 4
    ARCH_PARTIAL_MAX = 3

    # 1) ประเภท
    if candidate.type_id == target.type_id:
        score += TYPE_WEIGHT

    # 2) ยุคสมัย
    if normalize_text(candidate.era) and normalize_text(candidate.era) == normalize_text(target.era):
        score += ERA_WEIGHT

    # 3) สถาปัตยกรรม
    candidate_arch = normalize_text(candidate.architecture)
    target_arch = normalize_text(target.architecture)

    if candidate_arch and target_arch:
        # ถ้าตรงกันเป๊ะ
        if candidate_arch == target_arch:
            score += ARCH_EXACT_WEIGHT
        else:
            candidate_words = tokenize_architecture(candidate_arch)
            target_words = tokenize_architecture(target_arch)
            common_words = candidate_words.intersection(target_words)

            # ให้คะแนนตามจำนวน keyword ที่ซ้ำ แต่ไม่เกินค่าที่กำหนด
            score += min(len(common_words), ARCH_PARTIAL_MAX)

    return score


# =========================
# Helper: fetch cover image from images table
# =========================
def fetch_cover_images_map(db: Session, castle_ids: list[int]) -> dict[int, str]:
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


# =========================
# API: Recommend by Content-Based Filtering
# =========================
@router.get("")
async def get_recommendations_by_content(
    db: Session = Depends(get_db),
    current_user: dict = Depends(getOptionalUser)
):
    user_id = current_user.get("user_id") if current_user else None

    try:
        # 1) ถ้ายังไม่ได้ login
        if not user_id:
            return {
                "type": "no_user",
                "message": "User not logged in",
                "data": []
            }

        # 2) ดึงปราสาทล่าสุดที่ผู้ใช้กดถูกใจ
        latest_fav = (
            db.query(Interest)
            .filter(Interest.user_id == user_id)
            .order_by(Interest.interest_id.desc())
            .first()
        )

        if not latest_fav:
            return {
                "type": "no_interests",
                "message": "User has no interests, hide recommendation section",
                "data": []
            }

        # 3) ดึงข้อมูล target castle (ตัวตั้งต้น)
        target_castle = (
            db.query(
                Castle.castle_id.label("castle_id"),
                Castle.castle_name.label("castle_name"),
                Castle.castle_description.label("castle_description"),
                Castle.era.label("era"),
                Castle.type_id.label("type_id"),
                CastleType.type_detail.label("type_detail"),
                func.coalesce(
                    func.string_agg(func.distinct(Architecture.architec_detail), ", "),
                    ""
                ).label("architecture")
            )
            .join(CastleType, Castle.type_id == CastleType.type_id)
            .outerjoin(Architecture, Castle.castle_id == Architecture.castle_id)
            .filter(Castle.castle_id == latest_fav.castle_id)
            .group_by(
                Castle.castle_id,
                Castle.castle_name,
                Castle.castle_description,
                Castle.era,
                Castle.type_id,
                CastleType.type_detail
            )
            .first()
        )

        if not target_castle:
            raise HTTPException(status_code=404, detail="Castle not found")

        # 4) ดึง candidate castles ทั้งหมดที่ไม่ใช่ target
        candidate_castles = (
            db.query(
                Castle.castle_id.label("castle_id"),
                Castle.castle_name.label("castle_name"),
                Castle.castle_description.label("castle_description"),
                Castle.era.label("era"),
                Castle.type_id.label("type_id"),
                CastleType.type_detail.label("type_detail"),
                func.coalesce(
                    func.string_agg(func.distinct(Architecture.architec_detail), ", "),
                    ""
                ).label("architecture")
            )
            .join(CastleType, Castle.type_id == CastleType.type_id)
            .outerjoin(Architecture, Castle.castle_id == Architecture.castle_id)
            .filter(Castle.castle_id != latest_fav.castle_id)
            .group_by(
                Castle.castle_id,
                Castle.castle_name,
                Castle.castle_description,
                Castle.era,
                Castle.type_id,
                CastleType.type_detail
            )
            .all()
        )

        # 5) คำนวณคะแนนความคล้าย
        ranked_results = []
        candidate_ids = []

        for item in candidate_castles:
            score = calculate_similarity_score(item, target_castle)

            # เอาเฉพาะที่มีความคล้ายอย่างน้อยบางส่วน
            if score > 0:
                candidate_ids.append(item.castle_id)
                ranked_results.append({
                    "castle_id": item.castle_id,
                    "castle_name": item.castle_name,
                    "castle_description": item.castle_description,
                    "era": item.era,
                    "type_detail": item.type_detail,
                    "architecture": item.architecture,
                    "score": score,
                    "is_recommended": True
                })

        # 6) เติมรูปปกจาก images table
        cover_map = fetch_cover_images_map(db, candidate_ids)
        for item in ranked_results:
            item["cover_image"] = cover_map.get(item["castle_id"])

        # 7) เรียงจากคะแนนมากไปน้อย
        ranked_results.sort(key=lambda x: x["score"], reverse=True)

        return {
            "type": "recommend_by_content",
            "based_on_castle": target_castle.castle_name,
            "target_features": {
                "era": target_castle.era,
                "type_detail": target_castle.type_detail,
                "architecture": target_castle.architecture
            },
            "data": ranked_results[:5]
        }

    except HTTPException:
        raise
    except Exception as e:
        print(f"Recommend Error: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")