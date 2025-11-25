from pydantic import BaseModel, EmailStr
from typing import List, Optional
from datetime import datetime

class UserBase(BaseModel):
    username: str
    email: EmailStr
    tel: Optional[str] = None
    roles: str = "user"

#สำหรับ Create -> ต้องรับ Password
class UserCreate(UserBase):
    password: str

# สำหรับ Response -> ห้ามส่ง Password กลับ
class UserResponse(UserBase):
    user_id: int
    # อ่านข้อมูลจาก SQLAlchemy
    class Config:
        from_attributes = True

class SearchHistoryBase(BaseModel):
    query_text: str
    search_time: datetime

class SearchHistoryCreate(SearchHistoryBase):
    user_id: int

class SearchHistoryResponse(SearchHistoryBase):
    search_id: int
    user_id: int
    class Config:
        from_attributes = True

class VisitHistoryBase(BaseModel):
    visit_date: datetime

class VisitHistoryCreate(VisitHistoryBase):
    user_id: int
    castle_id: int

class VisitHistoryResponse(VisitHistoryBase):
    visit_id: int
    user_id: int
    castle_id: int
    class Config:
        from_attributes = True

class InterestBase(BaseModel):
    interest_name: str

class InterestCreate(InterestBase):
    user_id: int
    castle_id: int

class InterestResponse(InterestBase):
    interest_id: int
    user_id: int
    castle_id: int
    class Config:
        from_attributes = True

class TripPlanBase(BaseModel):
    plan_name: str
    event_description: Optional[str] = None
    start_date: datetime
    end_date: datetime
    duration: int

class TripPlanCreate(TripPlanBase):
    user_id: int
    route_id: Optional[int] = None
    event_id: Optional[int] = None

class TripPlanResponse(TripPlanBase):
    plan_id: int
    user_id: int
    route_id: Optional[int] = None
    event_id: Optional[int] = None
    class Config:
        from_attributes = True

class TripItineraryBase(BaseModel):
    start_time: datetime
    end_time: datetime

class TripItineraryCreate(TripItineraryBase):
    plan_id: int
    castle_id: int
    event_id: Optional[int] = None

class TripItineraryResponse(TripItineraryBase):
    itinerary_id: int
    plan_id: int
    castle_id: int
    event_id: Optional[int] = None
    class Config:
        from_attributes = True

class CastleTypeBase(BaseModel):
    type_detail: str

class CastleTypeCreate(CastleTypeBase):
    pass

class CastleTypeResponse(CastleTypeBase):
    type_id: int
    class Config:
        from_attributes = True

class ArchitectureBase(BaseModel):
    architec_detail: str

class ArchitectureCreate(ArchitectureBase):
    castle_id: int

class ArchitectureResponse(ArchitectureBase):
    architec_id: int
    castle_id: int
    class Config:
        from_attributes = True

class LocationBase(BaseModel):
    latitude: float
    longitude: float
    sub_district: Optional[str] = None
    district: Optional[str] = None
    province: Optional[str] = None

class LocationCreate(LocationBase):
    pass

class LocationResponse(LocationBase):
    location_id: int
    class Config:
        from_attributes = True

class CastleBase(BaseModel):
    castle_name: str
    castle_description: Optional[str] = None
    era: Optional[str] = None
    # Vector รับเป็น List ของ float
    text_vector: Optional[List[float]] = None 

class CastleCreate(CastleBase):
    type_id: Optional[int] = None

class CastleResponse(CastleBase):
    castle_id: int
    type_id: Optional[int] = None
    location: Optional[LocationResponse] = None 
    class Config:
        from_attributes = True

class ImageBase(BaseModel):
    img_description: Optional[str] = None
    image_vector: Optional[List[float]] = None

class ImageCreate(ImageBase):
    castle_id: int

class ImageResponse(ImageBase):
    img_id: int
    castle_id: int
    class Config:
        from_attributes = True

class EventBase(BaseModel):
    event_name: str
    event_description: Optional[str] = None
    event_start: datetime
    event_end: datetime
    event_time: Optional[str] = None

class EventCreate(EventBase):
    castle_id: int

class EventResponse(EventBase):
    event_id: int
    castle_id: int
    class Config:
        from_attributes = True

class NearbyPlaceBase(BaseModel):
    place_name: str
    nearby_detail: Optional[str] = None

class NearbyPlaceCreate(NearbyPlaceBase):
    castle_id: int

class NearbyPlaceResponse(NearbyPlaceBase):
    place_id: int
    castle_id: int
    class Config:
        from_attributes = True

class RouteBase(BaseModel):
    route_name: str
    description_gps: Optional[str] = None

class RouteCreate(RouteBase):
    pass

class RouteResponse(RouteBase):
    route_id: int
    class Config:
        from_attributes = True

class RouteCastleBase(BaseModel):
    route_id: int
    castle_id: int
    # sequence_order: Optional[int] = None

class RouteCastleCreate(RouteCastleBase):
    pass

class RouteCastleResponse(RouteCastleBase):
    class Config:
        from_attributes = True

class DocumentBase(BaseModel):
    document_name: str

class DocumentCreate(DocumentBase):
    castle_id: int

class DocumentResponse(DocumentBase):
    document_id: int
    castle_id: int
    class Config:
        from_attributes = True

class PlaceBase(BaseModel):
    document_vector: Optional[List[float]] = None

class PlaceCreate(PlaceBase):
    document_id: int
    castle_id: Optional[int] = None

class PlaceResponse(PlaceBase):
    place_id: int
    document_id: int
    castle_id: Optional[int] = None
    class Config:
        from_attributes = True

class KeywordBase(BaseModel):
    keyword: str

class KeywordCreate(KeywordBase):
    pass

class KeywordResponse(KeywordBase):
    keyword_id: int
    class Config:
        from_attributes = True