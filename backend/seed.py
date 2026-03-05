import random
from datetime import datetime, timedelta
from faker import Faker
import sqlalchemy.orm as _orm
from passlib.context import CryptContext

# Import จากไฟล์โปรเจกต์ของคุณ
from db import SessionLocal, engine, Base

# ใช้ localhost connection สำหรับรัน seed จากเครื่อง local
from sqlalchemy import create_engine
local_engine = create_engine("postgresql://myuser:password@localhost:5432/fastapi_database")
from schemas.schemas import *
from model.model import *

# ตั้งค่า Faker และ Password Hasher
fake = Faker(['th_TH', 'en_US']) # รองรับภาษาไทย + อังกฤษ
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def get_password_hash(password):
    return pwd_context.hash(password)

def create_mock_castles(count=20):
    castles = []
    for i in range(count):
        castle = Castle(
            castle_name=fake.company(),
            castle_description=fake.text(max_nb_chars=200),
            era=fake.word(),
            type_id=random.randint(1, 5)  # Assuming 5 castle types
        )
        castles.append(castle)
    return castles

def create_mock_locations(count=15):
    locations = []
    # Bangkok area coordinates (approximately)
    bangkok_lat_range = (13.5, 13.9)  # Bangkok latitude range
    bangkok_lng_range = (100.4, 100.9)  # Bangkok longitude range
    
    for i in range(count):
        location = Location(
            latitude=round(random.uniform(bangkok_lat_range[0], bangkok_lat_range[1]), 6),
            longitude=round(random.uniform(bangkok_lng_range[0], bangkok_lng_range[1]), 6),
            province="กรุงเทพมหานคร",
            sub_district=fake.city(),
            district=fake.street_name()
        )
        locations.append(location)
    return locations

def create_mock_location_castles(castles, locations):
    """Create 1-to-1 relationships between castles and locations"""
    location_castles = []
    # Use the minimum of castles and locations to ensure 1-to-1 relationship
    max_relationships = min(len(castles), len(locations))
    
    for i in range(max_relationships):
        location_castle = LocationCastle(
            castle_id=castles[i].castle_id,
            location_id=locations[i].location_id
        )
        location_castles.append(location_castle)
    
    return location_castles

def create_mock_castle_types():
    types = [
        "Medieval Fortress",
        "Royal Palace", 
        "Military Fort",
        "Historic Castle",
        "Ancient Ruins"
    ]
    return [CastleType(type_detail=t) for t in types]

def create_mock_architectures(count=30):
    architectures = []
    arch_styles = ["Gothic", "Romanesque", "Baroque", "Renaissance", "Neoclassical"]
    
    for i in range(count):
        arch = Architecture(
            castle_id=random.randint(1, 20),  # Assuming 20 castles
            architec_detail=f"{random.choice(arch_styles)} style architecture with {fake.word()} elements"
        )
        architectures.append(arch)
    return architectures

def create_mock_images(count=40):
    images = []
    
    for i in range(count):
        img = Image(
            castle_id=random.randint(1, 20),  # Assuming 20 castles
            img_description=fake.text(max_nb_chars=100)
        )
        images.append(img)
    return images

def create_mock_events(count=25):
    events = []
    event_types = ["Festival", "Tour", "Exhibition", "Historical Reenactment", "Cultural Event"]
    
    for i in range(count):
        start_date = fake.date_this_year()
        end_date = start_date + timedelta(days=random.randint(1, 7))
 
        start_hour = random.randint(9, 18)
        end_hour = random.randint(start_hour + 1, 22)
 
        event = Event(
            castle_id=random.randint(1, 20),  # Assuming 20 castles
            event_name=f"{random.choice(event_types)} - {fake.city()}",
            event_description=fake.text(max_nb_chars=150),
            event_date=start_date,  # datetime object for event date
            event_start=f"{start_hour:02d}:00:00",  # string time format HH:MM:SS
            event_end=f"{end_hour:02d}:00:00",      # string time format HH:MM:SS
        )
        events.append(event)
    return events

def create_mock_nearby_places(count=35):
    places = []
    place_types = ["Restaurant", "Hotel", "Museum", "Park", "Shopping Center", "Temple"]
    # Bangkok area coordinates (approximately)
    bangkok_lat_range = (13.5, 13.9)  # Bangkok latitude range
    bangkok_lng_range = (100.4, 100.9)  # Bangkok longitude range
    
    for i in range(count):
        place = NearbyPlace(
            castle_id=random.randint(1, 20),  # Assuming 20 castles
            place_name=f"{random.choice(place_types)} {fake.company()}",
            nearby_detail=fake.text(max_nb_chars=100),
            latitude=round(random.uniform(bangkok_lat_range[0], bangkok_lat_range[1]), 6),
            longitude=round(random.uniform(bangkok_lng_range[0], bangkok_lng_range[1]), 6)
        )
        places.append(place)
    return places

def create_mock_search_histories(count, users_list):
    histories = []
    search_queries = [
        "ancient castle", "medieval fortress", "historic palace", 
        "castle tour", "castle architecture", "castle history",
        "royal palace", "military fort", "castle ruins"
    ]
    
    for i in range(count):
        history = SearchHistory(
            user_id=random.choice(users_list).user_id,  # Use actual user objects
            query_text=random.choice(search_queries),
            search_time=fake.date_time_this_year()
        )
        histories.append(history)
    return histories

def create_mock_visit_histories(count, users_list, castles_list):
    histories = []
    
    for i in range(count):
        history = VisitHistory(
            user_id=random.choice(users_list).user_id,  # Use actual user objects
            castle_id=random.choice(castles_list).castle_id,  # Use actual castle objects
            visit_date=fake.date_this_year()
        )
        histories.append(history)
    return histories

def seed_data():
    # ใช้ localhost session สำหรับรัน seed จากเครื่อง local
    LocalSessionLocal = _orm.sessionmaker(autocommit=False, autoflush=False, bind=local_engine)
    db = LocalSessionLocal()
    
    try:
        print("Start Seeding Data...")
        
        # 1. สร้าง Users
        created_users = []
        admin_user = db.query(User).filter(User.username == "admin").first()
        if not admin_user:
            admin = User(
                username="admin",
                password=get_password_hash("admin123"),
                email="admin@example.com",
            )
            db.add(admin)
            created_users.append(admin)
        
        for _ in range(10):
            profile = fake.simple_profile()
            user = User(
                username=profile['username'],
                password=get_password_hash("1234"),
                email=profile['mail'],
            )
            db.add(user)
            created_users.append(user)
        
        db.commit() # Commit เพื่อให้ได้ user_id
        
        for user in created_users:
            db.refresh(user)

        # 2. สร้าง Trip Plans
        print("   Creating Trip Plans...")
        trip_names = ["เที่ยวเชียงใหม่", "ทริปภูเก็ต", "ไหว้พระอยุธยา", "เดินป่าเขาใหญ่", "พักผ่อนพัทยา"]
        trip_plans = []
        for user in created_users:
            for _ in range(random.randint(1, 3)):
                start_date = fake.date_this_year()
                duration = random.randint(1, 5)
                start_dt = datetime.combine(start_date, datetime.min.time())
                end_dt = start_dt + timedelta(days=duration)

                trip = TripPlan(
                    user_id=user.user_id,
                    plan_name=f"{random.choice(trip_names)} - {fake.first_name()}",
                    event_description=fake.text(max_nb_chars=100),
                    start_date=start_dt,
                    end_date=end_dt,
                    duration=duration,
                )
                db.add(trip)
                trip_plans.append(trip)

        # 3. สร้าง Mock Data อื่นๆ
        print("   Creating Mock Data...")
        # (ส่วนนี้ใช้โค้ดเดิมของคุณได้เลย แต่ครอบด้วย try...except)
        castle_types = create_mock_castle_types()
        db.add_all(castle_types)
        db.commit()
        
        castles = create_mock_castles(count=20)
        locations = create_mock_locations(count=15)
        db.add_all(castles)
        db.add_all(locations)
        db.commit()
        
        for castle in castles: db.refresh(castle)
        for location in locations: db.refresh(location)
        
        # เพิ่มข้อมูลส่วนที่เหลือ
        db.add_all(create_mock_location_castles(castles, locations))
        db.add_all(create_mock_architectures(count=30))
        db.add_all(create_mock_images(count=40))
        db.add_all(create_mock_events(count=25))
        db.add_all(create_mock_nearby_places(count=35))
        db.commit()

        db.add_all(create_mock_search_histories(count=60, users_list=created_users))
        db.add_all(create_mock_visit_histories(count=45, users_list=created_users, castles_list=castles))
        db.commit()

        print("Seeding Complete Successfully!")

    except Exception as e:
        print(f"❌ Error occurred: {e}")
        db.rollback() # ถอยกลับถ้ามีปัญหา ข้อมูลจะได้ไม่เน่า
    finally:
        db.close() # ปิดการเชื่อมต่อเสมอ
        
if __name__ == "__main__":
    print("Dropping old tables...")
    # 🔴 1. สั่งลบตารางและข้อมูลเก่าทิ้งทั้งหมด (Reset)
    Base.metadata.drop_all(bind=local_engine)
    
    print("Creating new tables...")
    # 🟢 2. สร้างตารางใหม่แบบสะอาดเอี่ยม
    Base.metadata.create_all(bind=local_engine)
    
    # 3. รันฟังก์ชัน Seed เพื่อใส่ข้อมูลใหม่
    seed_data()