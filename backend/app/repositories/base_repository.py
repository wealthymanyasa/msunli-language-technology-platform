from typing import TypeVar, Generic, Type, Optional, List, Any
from uuid import UUID
from datetime import datetime

from sqlalchemy.orm import Session
from sqlalchemy import desc

from app.models.base import Base

ModelType = TypeVar("ModelType", bound=Base)


class BaseRepository(Generic[ModelType]):
    def __init__(self, db: Session, model: Type[ModelType]):
        self.db = db
        self.model = model

    def get(self, id: UUID) -> Optional[ModelType]:
        return self.db.query(self.model).filter(
            self.model.id == id,
            self.model.is_deleted == False
        ).first()

    def get_all(self, skip: int = 0, limit: int = 100) -> List[ModelType]:
        return self.db.query(self.model).filter(
            self.model.is_deleted == False
        ).offset(skip).limit(limit).all()

    def create(self, **kwargs) -> ModelType:
        obj = self.model(**kwargs)
        self.db.add(obj)
        self.db.commit()
        self.db.refresh(obj)
        return obj

    def update(self, id: UUID, **kwargs) -> Optional[ModelType]:
        obj = self.get(id)
        if obj is None:
            return None
        for key, value in kwargs.items():
            if hasattr(obj, key):
                setattr(obj, key, value)
        obj.updated_at = datetime.utcnow()
        self.db.commit()
        self.db.refresh(obj)
        return obj

    def soft_delete(self, id: UUID) -> bool:
        obj = self.get(id)
        if obj is None:
            return False
        obj.is_deleted = True
        obj.updated_at = datetime.utcnow()
        self.db.commit()
        return True

    def hard_delete(self, id: UUID) -> bool:
        obj = self.db.query(self.model).filter(self.model.id == id).first()
        if obj is None:
            return False
        self.db.delete(obj)
        self.db.commit()
        return True

    def count(self) -> int:
        return self.db.query(self.model).filter(
            self.model.is_deleted == False
        ).count()
