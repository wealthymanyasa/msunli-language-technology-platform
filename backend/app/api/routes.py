from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.orm import Session
from typing import List, Optional
import logging

from app.models.base import get_db
from app.schemas.text import (
    CleanRequest, CleanResponse,
    TokenizeRequest, TokenizeResponse,
    BatchTokenizeRequest, BatchTokenizeResponse,
    ProcessRequest, ProcessResponse,
    DetectLanguageRequest, DetectLanguageResponse,
    StatisticsResponse, HealthResponse, ErrorResponse,
)
from app.services.processor import text_processor
from app.services.cleaner import TextCleaner
from app.core.dependencies import get_current_user, get_optional_user
from app.repositories.text_repository import TextRepository
from app.cache.redis import redis_cache

router = APIRouter(prefix="/api/v1", tags=["text-processing"])
logger = logging.getLogger(__name__)


@router.post("/clean", response_model=CleanResponse)
async def clean_text(
    request: CleanRequest,
    user=Depends(get_optional_user),
    db: Session = Depends(get_db),
):
    try:
        cleaner = TextCleaner(
            remove_diacritics=request.remove_diacritics,
            remove_numbers=request.remove_numbers,
            remove_emojis=request.remove_emojis,
        )
        cleaned_text, stats = cleaner.clean(request.text, return_stats=True)

        if user:
            repo = TextRepository(db)
            repo.create(
                user_id=user.id,
                input_text=request.text,
                cleaned_text=cleaned_text,
                language="auto",
                processing_type="clean",
            )

        return CleanResponse(
            cleaned_text=cleaned_text,
            original_length=stats["original_length"],
            cleaned_length=stats["cleaned_length"],
            removed_characters=stats["removed_characters"],
        )
    except Exception as e:
        logger.error(f"Clean error: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Cleaning failed: {str(e)}")


@router.post("/tokenize", response_model=TokenizeResponse)
async def tokenize_text(
    request: TokenizeRequest,
    user=Depends(get_optional_user),
    db: Session = Depends(get_db),
):
    try:
        cache_key = f"tokenize:{request.language or 'auto'}:{hash(request.text)}"
        cached = await redis_cache.get_json(cache_key)
        if cached:
            return TokenizeResponse(**cached)

        result = text_processor.tokenize(
            text=request.text,
            language=request.language,
            remove_stopwords=request.remove_stopwords,
        )

        response = TokenizeResponse(
            cleaned_text=result["cleaned_text"],
            tokens=result["tokens"],
            token_count=result["token_count"],
            language=result["language"],
            language_code=result["language_code"],
            detected_language=result.get("detected_language"),
            detection_confidence=result.get("detection_confidence"),
            execution_time_ms=result["execution_time_ms"],
        )

        await redis_cache.set_json(cache_key, response.model_dump(), expire=300)

        if user:
            repo = TextRepository(db)
            repo.create(
                user_id=user.id,
                input_text=request.text,
                cleaned_text=result["cleaned_text"],
                language=result["language_code"],
                detected_language=result.get("detected_language"),
                detection_confidence=str(result.get("detection_confidence", "")),
                processing_type="tokenize",
                token_count=str(result["token_count"]),
                execution_time_ms=str(result["execution_time_ms"]),
            )

        return response
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Tokenize error: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Tokenization failed: {str(e)}")


@router.post("/process", response_model=ProcessResponse)
async def process_text(
    request: ProcessRequest,
    user=Depends(get_optional_user),
    db: Session = Depends(get_db),
):
    try:
        result = text_processor.process(
            text=request.text,
            language=request.language,
        )

        response = ProcessResponse(
            original_text=result["original_text"],
            cleaned_text=result["cleaned_text"],
            language=result["language"],
            language_code=result["language_code"],
            detected_language=result["detected_language"],
            detection_confidence=result["detection_confidence"],
            tokens=result["tokens"],
            tokens_without_stopwords=result["tokens_without_stopwords"],
            token_count=result["token_count"],
            token_count_without_stopwords=result["token_count_without_stopwords"],
            unique_words=result["unique_words"],
            word_frequency=result["word_frequency"],
            execution_time_ms=result["execution_time_ms"],
        )

        if user:
            repo = TextRepository(db)
            repo.create(
                user_id=user.id,
                input_text=request.text,
                cleaned_text=result["cleaned_text"],
                language=result["language_code"],
                detected_language=result["detected_language"],
                detection_confidence=str(result["detection_confidence"]),
                processing_type="process",
                token_count=str(result["token_count"]),
                execution_time_ms=str(result["execution_time_ms"]),
            )

        return response
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Process error: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Processing failed: {str(e)}")


@router.post("/detect-language", response_model=DetectLanguageResponse)
async def detect_language(
    request: DetectLanguageRequest,
    user=Depends(get_optional_user),
):
    try:
        cache_key = f"langdetect:{hash(request.text)}"
        cached = await redis_cache.get_json(cache_key)
        if cached:
            return DetectLanguageResponse(**cached)

        result = text_processor.detect_language(request.text)

        response = DetectLanguageResponse(
            language=result.name,
            language_code=result.code,
            confidence=result.confidence,
        )

        await redis_cache.set_json(cache_key, response.model_dump(), expire=600)

        return response
    except Exception as e:
        logger.error(f"Language detection error: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Language detection failed: {str(e)}")


@router.post("/tokenize/batch", response_model=BatchTokenizeResponse)
async def batch_tokenize_text(
    request: BatchTokenizeRequest,
    user=Depends(get_optional_user),
    db: Session = Depends(get_db),
):
    try:
        results = text_processor.batch_tokenize(
            texts=request.texts,
            language=request.language,
            remove_stopwords=request.remove_stopwords,
        )

        responses = []
        for result in results:
            responses.append(TokenizeResponse(
                cleaned_text=result["cleaned_text"],
                tokens=result["tokens"],
                token_count=result["token_count"],
                language=result["language"],
                language_code=result["language_code"],
                detected_language=result.get("detected_language"),
                detection_confidence=result.get("detection_confidence"),
                execution_time_ms=result["execution_time_ms"],
            ))

        if user:
            repo = TextRepository(db)
            for i, text in enumerate(request.texts):
                repo.create(
                    user_id=user.id,
                    input_text=text,
                    cleaned_text=results[i]["cleaned_text"],
                    language=results[i]["language_code"],
                    processing_type="batch_tokenize",
                    token_count=str(results[i]["token_count"]),
                    execution_time_ms=str(results[i]["execution_time_ms"]),
                )

        return BatchTokenizeResponse(results=responses)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Batch tokenize error: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Batch tokenization failed: {str(e)}")


@router.get("/statistics", response_model=StatisticsResponse)
async def get_text_statistics(
    text: str,
    language: Optional[str] = None,
    user=Depends(get_optional_user),
):
    try:
        cache_key = f"stats:{language or 'auto'}:{hash(text)}"
        cached = await redis_cache.get_json(cache_key)
        if cached:
            return StatisticsResponse(**cached)

        stats = text_processor.get_statistics(text, language)

        response = StatisticsResponse(
            language=stats["language"],
            language_code=stats["language_code"],
            total_words=stats["total_words"],
            unique_words=stats["unique_words"],
            total_characters=stats["total_characters"],
            cleaned_characters=stats["cleaned_characters"],
            words_without_stopwords=stats["words_without_stopwords"],
            stopwords_removed=stats["stopwords_removed"],
            word_frequency=stats["word_frequency"],
            execution_time_ms=stats["execution_time_ms"],
        )

        await redis_cache.set_json(cache_key, response.model_dump(), expire=600)

        return response
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Statistics error: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Statistics failed: {str(e)}")
