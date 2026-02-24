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
    for i in range(count):
        location = Location(
            latitude=float(fake.latitude()),
            longitude=float(fake.longitude()),
            province=fake.province(),
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

def create_mock_interests(count=50):
    interests = []
    interest_types = ["History", "Architecture", "Photography", "Nature", "Culture", "Adventure"]
    
    for i in range(count):
        interest = Interest(
            interest_name=random.choice(interest_types),
            user_id=random.randint(1, 10),  # Assuming 10 users
            castle_id=random.randint(1, 20)  # Assuming 20 castles
        )
        interests.append(interest)
    return interests

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
    
    for i in range(count):
        place = NearbyPlace(
            castle_id=random.randint(1, 20),  # Assuming 20 castles
            place_name=f"{random.choice(place_types)} {fake.company()}",
            nearby_detail=fake.text(max_nb_chars=100)
        )
        places.append(place)
    return places

def create_mock_search_histories(count=60):
    histories = []
    search_queries = [
        "ancient castle", "medieval fortress", "historic palace", 
        "castle tour", "castle architecture", "castle history",
        "royal palace", "military fort", "castle ruins"
    ]
    
    for i in range(count):
        history = SearchHistory(
            user_id=random.randint(1, 10),  # Assuming 10 users
            query_text=random.choice(search_queries),
            search_time=fake.date_time_this_year()
        )
        histories.append(history)
    return histories

def create_mock_visit_histories(count=45):
    histories = []
    
    for i in range(count):
        history = VisitHistory(
            user_id=random.randint(1, 10),  # Assuming 10 users
            castle_id=random.randint(1, 20),  # Assuming 20 castles
            visit_date=fake.date_this_year()
        )
        histories.append(history)
    return histories

def seed_data():
    # ใช้ localhost session สำหรับรัน seed จากเครื่อง local
    LocalSessionLocal = _orm.sessionmaker(autocommit=False, autoflush=False, bind=local_engine)
    db = LocalSessionLocal()
    
    print("Start Seeding Data...")
    
    # Create mock data
    users = []
    created_users = []
    

    # 1.1 สร้าง Admin (Fixed User) - เอาไว้เทส Login
    admin_user = db.query(User).filter(User.username == "admin").first()
    if not admin_user:
        admin = User(
            username="admin",
            password=get_password_hash("admin123"),
            email="admin@example.com",
            # role="admin" # เปิดบรรทัดนี้ถ้าใน Model User มี field role
        )
        db.add(admin)
        created_users.append(admin)
    
    # 1.2 สร้าง User ทั่วไป 10 คน
    for _ in range(10):
        profile = fake.simple_profile()
        user = User(
            username=profile['username'],
            password=get_password_hash("1234"), # รหัสเดียวกันหมดจะได้เทสง่าย
            email=profile['mail'],
            # role="user"
        )
        db.add(user)
        created_users.append(user)
    
    # Commit รอบแรกเพื่อเอา user_id
    db.commit()
    
    # Refresh object เพื่อให้ได้ ID ล่าสุดจาก DB
    for user in created_users:
        db.refresh(user)

    # ---------------------------------------
    # 2. สร้าง Trip Plan ให้ User แต่ละคน
    # ---------------------------------------
    print("   Creating Trip Plans...")
    
    trip_names = ["เที่ยวเชียงใหม่", "ทริปภูเก็ต", "ไหว้พระอยุธยา", "เดินป่าเขาใหญ่", "พักผ่อนพัทยา"]
    
    for user in created_users:
        # สุ่มว่า User คนนี้จะมีกี่ทริป (1 ถึง 3 ทริป)
        num_trips = random.randint(1, 3)
        
        for _ in range(num_trips):
            # สุ่มวันเดินทาง (ภายในปีนี้)
            start_date = fake.date_this_year()
            duration = random.randint(1, 5) # 1-5 วัน
            end_date = start_date + timedelta(days=duration)
            
            # แปลงเป็น datetime object เพราะ DB เก็บเป็น DateTime
            start_dt = datetime.combine(start_date, datetime.min.time())
            end_dt = datetime.combine(end_date, datetime.min.time())

            trip = TripPlan(
                user_id=user.user_id,          # ผูกกับ User ตรงนี้
                plan_name=f"{random.choice(trip_names)} - {fake.first_name()}",
                event_description=fake.text(max_nb_chars=100),
                start_date=start_dt,
                end_date=end_dt,
                duration=duration,
                # route_id=... (ใส่เพิ่มถ้ามี mock route)
                # event_id=... (ใส่เพิ่มถ้ามี mock event)
            )
            db.add(trip)

    # ---------------------------------------
    # 3. สร้าง Mock Data ทั้งหมด
    # ---------------------------------------
    print("   Creating Mock Data...")
    
    # Create castle types first (needed by castles)
    castle_types = create_mock_castle_types()
    db.add_all(castle_types)
    db.commit()
    
    # Create castles, locations, and other data
    castles = create_mock_castles(count=20)
    locations = create_mock_locations(count=15)
    
    # Add castles and locations first to get their IDs
    db.add_all(castles)
    db.add_all(locations)
    db.commit()
    
    # Refresh objects to get their IDs
    for castle in castles:
        db.refresh(castle)
    for location in locations:
        db.refresh(location)
    
    # Now create location-castle relationships with valid IDs
    location_castles = create_mock_location_castles(castles, locations)
    interests = create_mock_interests(count=50)
    architectures = create_mock_architectures(count=30)
    images = create_mock_images(count=40)
    events = create_mock_events(count=25)
    nearby_places = create_mock_nearby_places(count=35)
    search_histories = create_mock_search_histories(count=60)
    visit_histories = create_mock_visit_histories(count=45)
    
    # Add all mock data to database
    db.add_all(location_castles)
    db.add_all(interests)
    db.add_all(architectures)
    db.add_all(images)
    db.add_all(events)
    db.add_all(nearby_places)
    db.commit()  # Commit before adding search_histories and visit_histories
    db.add_all(search_histories)
    db.add_all(visit_histories)
    db.commit()  # Commit again after adding all data
    
    # ---------------------------------------
    # 4. บันทึกทั้งหมดลง Database
    # ---------------------------------------
    db.close()
    
    print(f"Seeding Complete!")
    print(f"  - Users: {len(created_users)} (including admin)")
    print(f"  - Locations: {len(locations)}")
    print(f"  - Location-Castle Relationships: {len(location_castles)}")
    print(f"  - Interests: {len(interests)}")
    print(f"  - Architectures: {len(architectures)}")
    print(f"  - Images: {len(images)}")
    print(f"  - Events: {len(events)}")
    print(f"  - Nearby Places: {len(nearby_places)}")
    print(f"  - Search Histories: {len(search_histories)}")
    print(f"  - Visit Histories: {len(visit_histories)}")

if __name__ == "__main__":
    # สร้าง Table ก่อน (เผื่อยังไม่มี)
    Base.metadata.create_all(bind=local_engine)
    
    # รันฟังก์ชัน Seed
    seed_data()