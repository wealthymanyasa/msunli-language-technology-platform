import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine, event
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.main import app
from app.models.base import Base, get_db

TEST_DB_URL = "sqlite://"

engine = create_engine(
    TEST_DB_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)

TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base.metadata.create_all(bind=engine)


def override_get_db():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()


app.dependency_overrides[get_db] = override_get_db

client = TestClient(app)


@pytest.fixture(autouse=True)
def reset_db():
    with engine.begin() as conn:
        for table in reversed(Base.metadata.sorted_tables):
            conn.execute(table.delete())
    yield


class TestRegister:
    def test_register_success(self):
        response = client.post("/auth/register", json={
            "name": "Obert Manyasa",
            "email": "omanyasa@yahoo.com",
            "password": "securepass123",
        })
        assert response.status_code == 201
        data = response.json()
        assert data["email"] == "omanyasa@yahoo.com"
        assert data["username"] == "Obert Manyasa"
        assert data["is_active"] is True
        assert data["role"] == "user"
        assert "id" in data
        assert "password" not in data

    def test_register_duplicate_email(self):
        client.post("/auth/register", json={
            "name": "User One",
            "email": "dupe@test.com",
            "password": "securepass123",
        })
        response = client.post("/auth/register", json={
            "name": "User Two",
            "email": "dupe@test.com",
            "password": "securepass123",
        })
        assert response.status_code == 400
        assert "already registered" in response.json().get("detail", response.json().get("error", "")).lower()

    def test_register_invalid_email(self):
        response = client.post("/auth/register", json={
            "name": "Test User",
            "email": "not-an-email",
            "password": "securepass123",
        })
        assert response.status_code == 422

    def test_register_short_password(self):
        response = client.post("/auth/register", json={
            "name": "Test User",
            "email": "test@test.com",
            "password": "short",
        })
        assert response.status_code == 422


class TestLogin:
    @pytest.fixture(autouse=True)
    def _register_user(self):
        client.post("/auth/register", json={
            "name": "Obert Manyasa",
            "email": "omanyasa@yahoo.com",
            "password": "securepass123",
        })

    def test_login_with_email(self):
        response = client.post("/auth/login/json", json={
            "username": "omanyasa@yahoo.com",
            "password": "securepass123",
        })
        assert response.status_code == 200
        data = response.json()
        assert "access_token" in data
        assert data["token_type"] == "bearer"

    def test_login_with_username(self):
        response = client.post("/auth/login/json", json={
            "username": "Obert Manyasa",
            "password": "securepass123",
        })
        assert response.status_code == 200
        data = response.json()
        assert "access_token" in data

    def test_login_wrong_password(self):
        response = client.post("/auth/login/json", json={
            "username": "omanyasa@yahoo.com",
            "password": "wrongpassword",
        })
        assert response.status_code == 401

    def test_login_nonexistent_user(self):
        response = client.post("/auth/login/json", json={
            "username": "nobody@test.com",
            "password": "securepass123",
        })
        assert response.status_code == 401


class TestMe:
    @pytest.fixture(autouse=True)
    def _register_and_login(self):
        client.post("/auth/register", json={
            "name": "Obert Manyasa",
            "email": "omanyasa@yahoo.com",
            "password": "securepass123",
        })
        resp = client.post("/auth/login/json", json={
            "username": "omanyasa@yahoo.com",
            "password": "securepass123",
        })
        self.token = resp.json()["access_token"]

    def test_get_me_success(self):
        response = client.get("/auth/me", headers={
            "Authorization": f"Bearer {self.token}",
        })
        assert response.status_code == 200
        data = response.json()
        assert data["email"] == "omanyasa@yahoo.com"
        assert data["username"] == "Obert Manyasa"
        assert data["is_active"] is True

    def test_get_me_no_token(self):
        response = client.get("/auth/me")
        assert response.status_code == 401

    def test_get_me_invalid_token(self):
        response = client.get("/auth/me", headers={
            "Authorization": "Bearer invalidtoken123",
        })
        assert response.status_code == 401
