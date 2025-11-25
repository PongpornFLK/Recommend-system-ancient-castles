from sqlalchemy import Column, Integer, String, Text, ForeignKey, DateTime, Boolean, Float, Time
from sqlalchemy.orm import relationship
from sqlalchemy.ext.declarative import declarative_base
from pgvector.sqlalchemy import Vector

Base = declarative_base()

# 1. User Management
# ==========================================

class User(Base):
    __tablename__ = "users"

    user_id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, nullable=False)
    password = Column(String, nullable=False) # เก็บ Hash 
    email = Column(String, unique=True, nullable=False)
    tel = Column(String)
    roles = Column(String, default="user") # 'admin' / 'user'

    # Relationships
    search_histories = relationship("SearchHistory", back_populates="user")
    visit_histories = relationship("VisitHistory", back_populates="user")
    interests = relationship("Interest", back_populates="user")
    trip_plans = relationship("TripPlan", back_populates="user")


class SearchHistory(Base):
    __tablename__ = "search_histories"

    search_id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.user_id"))
    query_text = Column(Text)
    search_time = Column(DateTime)

    user = relationship("User", back_populates="search_histories")


class VisitHistory(Base):
    __tablename__ = "visit_histories"

    visit_id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.user_id"))
    castle_id = Column(Integer, ForeignKey("castles.castle_id"))
    visit_date = Column(DateTime)

    user = relationship("User", back_populates="visit_histories")
    castle = relationship("Castle", back_populates="visit_histories")


class Interest(Base):
    __tablename__ = "interests"

    interest_id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.user_id"))
    castle_id = Column(Integer, ForeignKey("castles.castle_id"))
    interest_name = Column(Text)

    user = relationship("User", back_populates="interests")
    castle = relationship("Castle", back_populates="interests")


# 2. Trip Planning
# ==========================================

class TripPlan(Base):
    __tablename__ = "trip_plans"

    plan_id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.user_id"))
    route_id = Column(Integer, ForeignKey("routes.route_id"), nullable=True) # Optional route
    
    # Note: event_id here might be redundant if used in Itinerary, but keeping as per DBML
    event_id = Column(Integer, ForeignKey("events.event_id"), nullable=True) 
    plan_name = Column(String)
    event_description = Column(Text)
    start_date = Column(DateTime)
    end_date = Column(DateTime)
    duration = Column(Integer)

    user = relationship("User", back_populates="trip_plans")
    route = relationship("Route") # One-way trip
    itineraries = relationship("TripItinerary", back_populates="plan")


class TripItinerary(Base):
    __tablename__ = "trip_itineraries"

    itinerary_id = Column(Integer, primary_key=True, index=True)
    plan_id = Column(Integer, ForeignKey("trip_plans.plan_id"))
    castle_id = Column(Integer, ForeignKey("castles.castle_id"))
    event_id = Column(Integer, ForeignKey("events.event_id"), nullable=True)
    start_time = Column(DateTime)
    end_time = Column(DateTime)

    plan = relationship("TripPlan", back_populates="itineraries")
    castle = relationship("Castle")
    event = relationship("Event")



# 3. Castle Core Data
# ==========================================

class CastleType(Base):
    __tablename__ = "castle_types"
    
    type_id = Column(Integer, primary_key=True, index=True)
    type_detail = Column(String)
    
    # Relationship back to Castle
    castles = relationship("Castle", back_populates="castle_type")


class Castle(Base):
    __tablename__ = "castles"

    castle_id = Column(Integer, primary_key=True, index=True)
    castle_name = Column(String, index=True)
    castle_description = Column(Text)
    era = Column(String)    
    text_vector = Column(Vector(768))

    # Foreign Keys
    # ปรับปรุงจาก DBML: เอา type_id มาใส่ใน Castle (Many-to-One) ตาม Best Practice
    type_id = Column(Integer, ForeignKey("castle_types.type_id"), nullable=True)

    # Relationships
    castle_type = relationship("CastleType", back_populates="castles")
    architectures = relationship("Architecture", back_populates="castle")
    images = relationship("Image", back_populates="castle")
    events = relationship("Event", back_populates="castle")
    nearby_places = relationship("NearbyPlace", back_populates="castle")
    
    # Link Tables Relationships
    visit_histories = relationship("VisitHistory", back_populates="castle")
    interests = relationship("Interest", back_populates="castle")
    
    # 1-to-1 Location logic (via Link Table or Direct FK, here using Link Table as per DBML)
    location_link = relationship("LocationCastle", back_populates="castle", uselist=False)


class Architecture(Base):
    __tablename__ = "architectures"

    architec_id = Column(Integer, primary_key=True, index=True)
    # DBML: ref : > Castle.castle_id (Many Architectures belong to One Castle logic)
    castle_id = Column(Integer, ForeignKey("castles.castle_id")) 
    architec_detail = Column(String)

    castle = relationship("Castle", back_populates="architectures")


class Location(Base):
    __tablename__ = "locations"

    location_id = Column(Integer, primary_key=True, index=True)
    latitude = Column(Float)
    longitude = Column(Float)
    sub_district = Column(String)
    district = Column(String)
    province = Column(String)

    # Back ref for 1-to-1 link
    castle_link = relationship("LocationCastle", back_populates="location", uselist=False)


class LocationCastle(Base):
    __tablename__ = "location_castles"
    
    # Link Table for 1-to-1 relationship
    castle_id = Column(Integer, ForeignKey("castles.castle_id"), primary_key=True)
    location_id = Column(Integer, ForeignKey("locations.location_id"), unique=True) # Unique enforces 1-to-1

    castle = relationship("Castle", back_populates="location_link")
    location = relationship("Location", back_populates="castle_link")


# 4. Castle Related Assets
# ==========================================

class Image(Base):
    __tablename__ = "images"

    img_id = Column(Integer, primary_key=True, index=True)
    castle_id = Column(Integer, ForeignKey("castles.castle_id"))
    img_description = Column(Text)    
    image_vector = Column(Vector(512))

    castle = relationship("Castle", back_populates="images")


class Event(Base):
    __tablename__ = "events"

    event_id = Column(Integer, primary_key=True, index=True)
    castle_id = Column(Integer, ForeignKey("castles.castle_id"))
    event_name = Column(String)
    event_description = Column(Text)
    event_start = Column(DateTime)
    event_end = Column(DateTime)
    event_time = Column(String)

    castle = relationship("Castle", back_populates="events")


class NearbyPlace(Base):
    __tablename__ = "nearby_places"

    place_id = Column(Integer, primary_key=True, index=True)
    castle_id = Column(Integer, ForeignKey("castles.castle_id"))
    place_name = Column(String)
    nearby_detail = Column(Text)

    castle = relationship("Castle", back_populates="nearby_places")


# 5. Routes
# ==========================================

class Route(Base):
    __tablename__ = "routes"

    route_id = Column(Integer, primary_key=True, index=True)
    route_name = Column(String)
    description_gps = Column(Text)

    # Many-to-Many RouteCastle
    castles = relationship("RouteCastle", back_populates="route")


class RouteCastle(Base):
    __tablename__ = "route_castles"

    # Composite Primary Key
    route_id = Column(Integer, ForeignKey("routes.route_id"), primary_key=True)
    castle_id = Column(Integer, ForeignKey("castles.castle_id"), primary_key=True)
    # sequence_order = Column(Integer, nullable=True) # store order castle in route

    route = relationship("Route", back_populates="castles")
    castle = relationship("Castle")


# 6. RAG / Search Documents
# ==========================================

class Document(Base):
    __tablename__ = "documents"

    document_id = Column(Integer, primary_key=True, index=True)
    # DBML: Ref : Document.document_id > Castle.castle_id 
    # (Interpreted as: Document belongs to a Castle)
    castle_id = Column(Integer, ForeignKey("castles.castle_id"))
    document_name = Column(String)

    places = relationship("Place", back_populates="document")


class Place(Base):
    __tablename__ = "places_rag"

    place_id = Column(Integer, primary_key=True, index=True)
    # DBML: Ref : Place.place_id > Document.document_id
    document_id = Column(Integer, ForeignKey("documents.document_id"))
    castle_id = Column(Integer, nullable=True) 
    document_vector = Column(Vector(768))

    document = relationship("Document", back_populates="places")
    keywords = relationship("PlaceKeyword", back_populates="place")


class Keyword(Base):
    __tablename__ = "keywords"

    keyword_id = Column(Integer, primary_key=True, index=True)
    keyword = Column(String, unique=True)

    places = relationship("PlaceKeyword", back_populates="keyword")


class PlaceKeyword(Base):
    __tablename__ = "place_keywords"

    place_id = Column(Integer, ForeignKey("places_rag.place_id"), primary_key=True)
    keyword_id = Column(Integer, ForeignKey("keywords.keyword_id"), primary_key=True)

    place = relationship("Place", back_populates="keywords")
    keyword = relationship("Keyword", back_populates="places")