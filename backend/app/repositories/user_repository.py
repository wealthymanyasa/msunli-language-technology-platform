from typing import Optional
from uuid import UUID

from sqlalchemy.orm import Session

from app.models.user import User
from .base_repository import BaseRepository


class UserRepository(BaseRepository[User]):
    def __init__(self, db: Session):
        super().__init__(db, User)

    def get_by_email(self, email: str) -> Optional[User]:
        return self.db.query(User).filter(
            User.email == email,
            User.is_deleted == False
        ).first()

    def get_by_username(self, username: str) -> Optional[User]:
        return self.db.query(User).filter(
            User.username == username,
            User.is_deleted == False
        ).first()

    def get_by_api_key(self, api_key: str) -> Optional[User]:
        return self.db.query(User).filter(
            User.api_key == api_key,
            User.is_deleted == False,
            User.is_active == True
        ).first()

    def email_exists(self, email: str) -> bool:
        return self.db.query(User).filter(
            User.email == email,
            User.is_deleted == False
        ).first() is not None

    def username_exists(self, username: str) -> bool:
        return self.db.query(User).filter(
            User.username == username,
            User.is_deleted == False
        ).first() is not None

    def record_login(self, user_id: UUID) -> None:
        from datetime import datetime
        user = self.get(user_id)
        if user:
            user.last_login_at = datetime.utcnow()
            self.db.commit()
