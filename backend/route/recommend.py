from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from db import get_db
from authen.secur import getOptionalUser
from model.model import Interest, Castle, CastleType
from sqlalchemy import func

router = APIRouter(prefix="/recommend", tags=["recommend"])

@router.get("")
async def get_recommendations_by_type(
    db: Session = Depends(get_db), 
    current_user: dict = Depends(getOptionalUser)
):
    # check user
    user_id = current_user.get("user_id") if current_user else None
    
    try:
        #ค้นหาปราสาทล่าสุดที่ผู้ใช้คนนี้กดถูกใจจากInterest
        latest_fav = db.query(Interest).filter(
            Interest.user_id == user_id
        ).order_by(Interest.interest_id.desc()).first()
        
        #ไม่เคยถูกใจอะไรเลยให้ส่งลิสต์ว่างกลับไป(ไม่ต้องสุ่มแนะนำ)
        if not latest_fav:
            return {
                "type": "no_interests", 
                "message": "User has no interests, hide recommendation section", 
                "data": [] 
            }

        # ดึงข้อมูลปราสาทที่ถูกใจเพื่อดูว่ามี type_id เป็นเลขอะไร
        target_castle = db.query(Castle).filter(Castle.castle_id == latest_fav.castle_id).first()
        if not target_castle:
             raise HTTPException(status_code=404, detail="Castle not found")
        
        current_type_id = target_castle.type_id

        # ค้นหาปราสาท "อื่นๆ" ที่มี type_id เดียวกันมาแสดง
        recommended_castles = db.query(
            Castle.castle_id,
            Castle.castle_name,
            Castle.castle_description,
            Castle.era,
            CastleType.type_detail
        ).join(CastleType, Castle.type_id == CastleType.type_id)\
         .filter(Castle.type_id == current_type_id)\
         .filter(Castle.castle_id != latest_fav.castle_id)\
         .limit(5).all()

        # จัดรูปแบบข้อมูลเพื่อส่งให้ CardLanding
        data_output = []
        for item in recommended_castles:
            data_output.append({
                "castle_id": item.castle_id,
                "castle_name": item.castle_name,
                "castle_description": item.castle_description,
                "era": item.era,
                "type_detail": item.type_detail,
                "is_recommended": True 
            })

        return {
            "type": "recommend_by_type",
            "based_on_castle": target_castle.castle_name,
            "matching_type_id": current_type_id,
            "data": data_output
        }

    except Exception as e:
        print(f"Recommend Error: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")