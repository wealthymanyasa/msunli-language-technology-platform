from datetime import datetime
from sqlalchemy import Column, String, Boolean, DateTime
from sqlalchemy.orm import relationship

from .base import Base, TimestampMixin


class User(Base, TimestampMixin):
    __tablename__ = "users"

    email = Column(String(255), unique=True, nullable=False, index=True)
    username = Column(String(100), unique=True, nullable=False, index=True)
    hashed_password = Column(String(255), nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)
    is_superuser = Column(Boolean, default=False, nullable=False)
    role = Column(String(50), default="user", nullable=False)
    api_key = Column(String(255), unique=True, nullable=True, index=True)
    last_login_at = Column(DateTime, nullable=True)

    text_processes = relationship("TextProcess", back_populates="user")
