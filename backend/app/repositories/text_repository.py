from typing import Optional, List
from uuid import UUID
from datetime import datetime, timedelta

from sqlalchemy.orm import Session
from sqlalchemy import func, desc

from app.models.text_process import TextProcess
from .base_repository import BaseRepository


class TextRepository(BaseRepository[TextProcess]):
    def __init__(self, db: Session):
        super().__init__(db, TextProcess)

    def get_by_user(self, user_id: UUID, skip: int = 0, limit: int = 50) -> List[TextProcess]:
        return self.db.query(TextProcess).filter(
            TextProcess.user_id == user_id,
            TextProcess.is_deleted == False
        ).order_by(desc(TextProcess.created_at)).offset(skip).limit(limit).all()

    def get_by_language(self, language: str, skip: int = 0, limit: int = 50) -> List[TextProcess]:
        return self.db.query(TextProcess).filter(
            TextProcess.language == language,
            TextProcess.is_deleted == False
        ).order_by(desc(TextProcess.created_at)).offset(skip).limit(limit).all()

    def get_by_processing_type(self, proc_type: str, skip: int = 0, limit: int = 50) -> List[TextProcess]:
        return self.db.query(TextProcess).filter(
            TextProcess.processing_type == proc_type,
            TextProcess.is_deleted == False
        ).order_by(desc(TextProcess.created_at)).offset(skip).limit(limit).all()

    def get_recent(self, minutes: int = 60, limit: int = 100) -> List[TextProcess]:
        since = datetime.utcnow() - timedelta(minutes=minutes)
        return self.db.query(TextProcess).filter(
            TextProcess.created_at >= since,
            TextProcess.is_deleted == False
        ).order_by(desc(TextProcess.created_at)).limit(limit).all()

    def count_by_language(self) -> List[dict]:
        results = self.db.query(
            TextProcess.language,
            func.count(TextProcess.id).label("count")
        ).filter(
            TextProcess.is_deleted == False
        ).group_by(TextProcess.language).all()
        return [{"language": r[0], "count": r[1]} for r in results]

    def count_by_type(self) -> List[dict]:
        results = self.db.query(
            TextProcess.processing_type,
            func.count(TextProcess.id).label("count")
        ).filter(
            TextProcess.is_deleted == False
        ).group_by(TextProcess.processing_type).all()
        return [{"type": r[0], "count": r[1]} for r in results]

    def get_total_count(self) -> int:
        return self.db.query(func.count(TextProcess.id)).filter(
            TextProcess.is_deleted == False
        ).scalar() or 0

    def get_user_count(self) -> int:
        return self.db.query(func.count(func.distinct(TextProcess.user_id))).filter(
            TextProcess.user_id.isnot(None),
            TextProcess.is_deleted == False
        ).scalar() or 0
