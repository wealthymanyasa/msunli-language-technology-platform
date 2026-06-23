from sqlalchemy import Column, String, Text, ForeignKey, UUID as SQLUUID
from sqlalchemy.orm import relationship
import uuid

from .base import Base, TimestampMixin


class TextProcess(Base, TimestampMixin):
    __tablename__ = "text_processes"

    user_id = Column(SQLUUID(as_uuid=True), ForeignKey("users.id"), nullable=True, index=True)
    input_text = Column(Text, nullable=False)
    cleaned_text = Column(Text, nullable=True)
    language = Column(String(50), nullable=False, index=True)
    detected_language = Column(String(50), nullable=True)
    detection_confidence = Column(String(10), nullable=True)
    processing_type = Column(String(50), nullable=False, index=True)
    token_count = Column(String(10), nullable=True)
    execution_time_ms = Column(String(10), nullable=True)

    user = relationship("User", back_populates="text_processes")
