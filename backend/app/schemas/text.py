from pydantic import BaseModel, Field
from typing import List, Dict, Optional
from datetime import datetime
import uuid


class CleanRequest(BaseModel):
    text: str = Field(..., description="Text to clean")
    remove_diacritics: bool = Field(False, description="Remove diacritical marks")
    remove_numbers: bool = Field(False, description="Remove numeric characters")
    remove_emojis: bool = Field(True, description="Remove emoji characters")

    class Config:
        json_schema_extra = {
            "example": {
                "text": "Hello, this is a sample text with numbers 123 and emojis! 😊",
                "remove_diacritics": False,
                "remove_numbers": True,
                "remove_emojis": True,
            }
        }


class CleanResponse(BaseModel):
    cleaned_text: str
    original_length: int
    cleaned_length: int
    removed_characters: int


class TokenizeRequest(BaseModel):
    text: str = Field(..., description="Text to tokenize")
    language: Optional[str] = Field(None, description="Language code (sn, nd, en, to, nm). Auto-detect if omitted.")
    remove_stopwords: bool = Field(False, description="Remove stopwords from tokens")

    class Config:
        json_schema_extra = {
            "example": {
                "text": "Mhuri yese yakaungana pamba pavakuru.",
                "language": "sn",
                "remove_stopwords": False,
            }
        }


class TokenizeResponse(BaseModel):
    cleaned_text: str
    tokens: List[str]
    token_count: int
    language: str
    language_code: str
    detected_language: Optional[str] = None
    detection_confidence: Optional[float] = None
    execution_time_ms: float


class BatchTokenizeRequest(BaseModel):
    texts: List[str] = Field(..., description="List of texts to tokenize")
    language: Optional[str] = Field(None, description="Language code. Auto-detect if omitted.")
    remove_stopwords: bool = Field(False, description="Remove stopwords")

    class Config:
        json_schema_extra = {
            "example": {
                "texts": [
                    "Mhuri yese yakaungana.",
                    "Vana vaitamba panze."
                ],
                "language": "sn",
                "remove_stopwords": False,
            }
        }


class BatchTokenizeResponse(BaseModel):
    results: List[TokenizeResponse]


class ProcessRequest(BaseModel):
    text: str = Field(..., description="Text to process through full pipeline")
    language: Optional[str] = Field(None, description="Language code. Auto-detect if omitted.")

    class Config:
        json_schema_extra = {
            "example": {
                "text": "Ndiri kuenda kuchikoro nhasi.",
                "language": None,
            }
        }


class ProcessResponse(BaseModel):
    original_text: str
    cleaned_text: str
    language: str
    language_code: str
    detected_language: str
    detection_confidence: float
    tokens: List[str]
    tokens_without_stopwords: List[str]
    token_count: int
    token_count_without_stopwords: int
    unique_words: int
    word_frequency: Dict[str, int]
    execution_time_ms: float


class DetectLanguageRequest(BaseModel):
    text: str = Field(..., description="Text to detect language for")

    class Config:
        json_schema_extra = {
            "example": {
                "text": "Ndiri kuenda kuchikoro nhasi.",
            }
        }


class DetectLanguageResponse(BaseModel):
    language: str
    language_code: str
    confidence: float


class StatisticsResponse(BaseModel):
    language: str
    language_code: str
    total_words: int
    unique_words: int
    total_characters: int
    cleaned_characters: int
    words_without_stopwords: int
    stopwords_removed: int
    word_frequency: Dict[str, int]
    execution_time_ms: float


class HealthResponse(BaseModel):
    status: str
    version: str
    database_ready: bool
    redis_ready: bool
    supported_languages: List[Dict[str, str]]


class ErrorResponse(BaseModel):
    error: str
    detail: Optional[str] = None
