import pytest
from unittest.mock import Mock, MagicMock
from uuid import uuid4
from datetime import datetime

from app.repositories.user_repository import UserRepository
from app.repositories.text_repository import TextRepository
from app.models.user import User
from app.models.text_process import TextProcess


class TestUserRepository:
    @pytest.fixture
    def mock_db(self):
        return MagicMock()

    def test_get_by_username(self, mock_db):
        mock_query = mock_db.query.return_value
        mock_filter = mock_query.filter.return_value
        mock_filter.first.return_value = User(id=uuid4(), username="testuser")

        repo = UserRepository(mock_db)
        user = repo.get_by_username("testuser")
        assert user is not None
        assert user.username == "testuser"

    def test_get_by_email(self, mock_db):
        mock_query = mock_db.query.return_value
        mock_filter = mock_query.filter.return_value
        mock_filter.first.return_value = User(id=uuid4(), email="test@test.com")

        repo = UserRepository(mock_db)
        user = repo.get_by_email("test@test.com")
        assert user is not None
        assert user.email == "test@test.com"


class TestTextRepository:
    @pytest.fixture
    def mock_db(self):
        return MagicMock()

    def test_get_by_user(self, mock_db):
        user_id = uuid4()
        mock_query = mock_db.query.return_value
        mock_filter = mock_query.filter.return_value
        mock_order = mock_filter.order_by.return_value
        mock_order.offset.return_value.limit.return_value.all.return_value = [
            TextProcess(id=uuid4(), user_id=user_id, input_text="test", language="sn", processing_type="tokenize")
        ]

        repo = TextRepository(mock_db)
        results = repo.get_by_user(user_id)
        assert len(results) == 1
        assert results[0].language == "sn"
