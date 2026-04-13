from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from db import get_db
from authen.secur import getOptionalUser
from model.model import Interest, Castle, CastleType, Architecture

router = APIRouter(prefix="/recommend", tags=["recommend"])


def normalize_text(value):
    return (value or "").strip().lower()


def calculate_similarity_score(candidate, target):
    score = 0

    # 1) ประเภท
    if candidate.type_id == target.type_id:
        score += 3

    # 2) ยุคสมัย
    if normalize_text(candidate.era) and normalize_text(candidate.era) == normalize_text(target.era):
        score += 2

    # 3) สถาปัตยกรรม
    candidate_arch = normalize_text(candidate.architecture)
    target_arch = normalize_text(target.architecture)

    if candidate_arch and target_arch:
        # ตรงกันเป๊ะ
        if candidate_arch == target_arch:
            score += 4
        else:
            # หา keyword ซ้ำกันแบบง่าย
            candidate_words = set(candidate_arch.split())
            target_words = set(target_arch.split())
            common_words = candidate_words.intersection(target_words)

            # ให้คะแนนตามจำนวนคำที่ซ้ำ แต่ไม่เกิน 3
            score += min(len(common_words), 3)

    return score


@router.get("")
async def get_recommendations_by_content(
    db: Session = Depends(get_db),
    current_user: dict = Depends(getOptionalUser)
):
    user_id = current_user.get("user_id") if current_user else None

    try:
        # ถ้าไม่ได้ login หรือไม่มี user_id
        if not user_id:
            return {
                "type": "no_user",
                "message": "User not logged in",
                "data": []
            }

        # 1) ค้นหาปราสาทล่าสุดที่ผู้ใช้กดถูกใจ
        latest_fav = (
            db.query(Interest)
            .filter(Interest.user_id == user_id)
            .order_by(Interest.interest_id.desc())
            .first()
        )

        # 2) ถ้ายังไม่เคยกดถูกใจอะไรเลย
        if not latest_fav:
            return {
                "type": "no_interests",
                "message": "User has no interests, hide recommendation section",
                "data": []
            }

        # 3) ดึงข้อมูลปราสาทต้นทางที่ใช้เป็นฐานแนะนำ
        target_castle = (
            db.query(
                Castle.castle_id.label("castle_id"),
                Castle.castle_name.label("castle_name"),
                Castle.castle_description.label("castle_description"),
                Castle.era.label("era"),
                Castle.type_id.label("type_id"),
                CastleType.type_detail.label("type_detail"),
                Architecture.architec_detail.label("architecture")
            )
            .join(CastleType, Castle.type_id == CastleType.type_id)
            .outerjoin(Architecture, Castle.castle_id == Architecture.castle_id)
            .filter(Castle.castle_id == latest_fav.castle_id)
            .first()
        )

        if not target_castle:
            raise HTTPException(status_code=404, detail="Castle not found")

        # 4) ดึง candidate ทั้งหมดที่ไม่ใช่ปราสาทเดิม
        candidate_castles = (
            db.query(
                Castle.castle_id.label("castle_id"),
                Castle.castle_name.label("castle_name"),
                Castle.castle_description.label("castle_description"),
                Castle.era.label("era"),
                Castle.type_id.label("type_id"),
                CastleType.type_detail.label("type_detail"),
                Architecture.architec_detail.label("architecture")
            )
            .join(CastleType, Castle.type_id == CastleType.type_id)
            .outerjoin(Architecture, Castle.castle_id == Architecture.castle_id)
            .filter(Castle.castle_id != latest_fav.castle_id)
            .all()
        )

        # 5) คำนวณคะแนนความคล้าย
        ranked_results = []
        for item in candidate_castles:
            score = calculate_similarity_score(item, target_castle)

            # เอาเฉพาะที่มีความคล้ายอย่างน้อยบางส่วน
            if score > 0:
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

        # 6) เรียงจากคะแนนมากไปน้อย
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