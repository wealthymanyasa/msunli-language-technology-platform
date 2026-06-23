import uuid
from datetime import datetime
from typing import Generator

from sqlalchemy import create_engine, Column, DateTime, Boolean
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import declarative_base, Session
from sqlalchemy.engine import Engine

from app.core.config import settings


engine = create_engine(settings.database_url, pool_pre_ping=True)
Base = declarative_base()


class TimestampMixin:
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False, index=True)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
    is_deleted = Column(Boolean, default=False, index=True)


def get_db() -> Generator[Session, None, None]:
    db = Session(engine)
    try:
        yield db
    finally:
        db.close()


def init_db(engine: Engine) -> None:
    Base.metadata.create_all(bind=engine)
