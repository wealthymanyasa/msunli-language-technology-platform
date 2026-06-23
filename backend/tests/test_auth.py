import pytest
from app.auth.jwt import create_access_token, create_refresh_token, decode_access_token, decode_refresh_token
from app.auth.security import hash_password, verify_password, generate_api_key


class TestJWTAuth:
    def test_create_access_token(self):
        token = create_access_token({"sub": "testuser"})
        assert isinstance(token, str)
        assert len(token) > 0

    def test_decode_access_token(self):
        token = create_access_token({"sub": "testuser"})
        payload = decode_access_token(token)
        assert payload is not None
        assert payload["sub"] == "testuser"

    def test_decode_invalid_token(self):
        payload = decode_access_token("invalid-token")
        assert payload is None

    def test_create_refresh_token(self):
        token = create_refresh_token({"sub": "testuser"})
        assert isinstance(token, str)

    def test_decode_refresh_token(self):
        token = create_refresh_token({"sub": "testuser"})
        payload = decode_refresh_token(token)
        assert payload is not None
        assert payload["type"] == "refresh"

    def test_access_token_not_valid_as_refresh(self):
        access = create_access_token({"sub": "testuser"})
        payload = decode_refresh_token(access)
        assert payload is None


class TestPasswordSecurity:
    def test_hash_password(self):
        hashed = hash_password("testpassword")
        assert isinstance(hashed, str)
        assert hashed != "testpassword"

    def test_verify_password_correct(self):
        hashed = hash_password("testpassword")
        assert verify_password("testpassword", hashed) is True

    def test_verify_password_incorrect(self):
        hashed = hash_password("testpassword")
        assert verify_password("wrongpassword", hashed) is False

    def test_generate_api_key(self):
        key = generate_api_key()
        assert key.startswith("zilp_")
        assert len(key) > 10
