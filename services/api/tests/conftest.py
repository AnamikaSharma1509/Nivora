import sys
import os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from fastapi.testclient import TestClient

# Import Base and ALL models to ensure they register on Base.metadata
from app.core.database import Base, get_db
from app.models.user import User, UserPreference, Notification, UserAchievement
from app.models.productivity import Goal, Task, DailyPlan
from app.models.story import Avatar, Series, Episode, Scene, GenerationJob, MediaAsset
from app.main import app

TEST_DB_URL = "sqlite:///./test_shared.db"
test_engine = create_engine(TEST_DB_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=test_engine)

def override_get_db():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()

app.dependency_overrides[get_db] = override_get_db

@pytest.fixture(scope="session", autouse=True)
def setup_test_database():
    Base.metadata.create_all(bind=test_engine)
    yield
    Base.metadata.drop_all(bind=test_engine)
    if os.path.exists("./test_shared.db"):
        try:
            os.remove("./test_shared.db")
        except Exception:
            pass

@pytest.fixture(scope="session")
def client():
    return TestClient(app)
