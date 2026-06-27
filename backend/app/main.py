from contextlib import asynccontextmanager
import logging
import json

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from starlette.exceptions import HTTPException as StarletteHTTPException

from app.core.config import settings
from app.core.logging_conf import setup_logging
from app.models.base import init_db, engine
from app.cache.redis import redis_cache
from app.middleware.logging_middleware import RequestLoggingMiddleware
from app.middleware.rate_limit_middleware import RateLimitMiddleware
from app.api.auth import router as auth_router
from app.api.routes import router as api_router
from app.api.admin import router as admin_router
from app.services.processor import text_processor

setup_logging(level=settings.log_level, fmt=settings.log_format)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info(f"Starting {settings.app_name} v{settings.app_version}")

    try:
        init_db(engine)
        logger.info("Database tables initialized")
    except Exception as e:
        logger.error(f"Database initialization failed: {e}")

    await redis_cache.initialize()

    langs = text_processor.supported_languages
    logger.info(f"Text processor loaded with {len(langs)} languages: {[l['code'] for l in langs]}")

    yield

    await redis_cache.close()
    logger.info("Application shutdown complete")


app = FastAPI(
    title=settings.app_name,
    description="Production-grade text processing platform for Zimbabwean indigenous languages (Shona, Ndebele, Tonga, Nambya) with support for English.",
    version=settings.app_version,
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc",
    contact={
        "name": "MSUNLI Language Technology Platform",
        "url": "https://github.com/wealthymanyasa/msunli-language-technology-platform",
    },
    license_info={
        "name": "MIT",
    },
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.add_middleware(RequestLoggingMiddleware)

if redis_cache.available:
    app.add_middleware(RateLimitMiddleware)


@app.exception_handler(StarletteHTTPException)
async def http_exception_handler(request: Request, exc: StarletteHTTPException):
    return JSONResponse(
        status_code=exc.status_code,
        content={"error": exc.detail, "status_code": exc.status_code},
    )


@app.exception_handler(Exception)
async def general_exception_handler(request: Request, exc: Exception):
    logger.error(f"Unhandled error: {exc}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={"error": "Internal server error", "status_code": 500},
    )


app.include_router(auth_router)
app.include_router(api_router)
app.include_router(admin_router)


@app.get("/", tags=["system"])
async def root():
    return {
        "name": settings.app_name,
        "version": settings.app_version,
        "documentation": "/docs",
        "health": "/health",
        "version_endpoint": "/version",
    }


@app.get("/health", tags=["system"])
async def health_check():
    db_ready = False
    try:
        from sqlalchemy import text
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
            db_ready = True
    except Exception:
        pass

    return {
        "status": "healthy" if db_ready else "degraded",
        "version": settings.app_version,
        "database_ready": db_ready,
        "redis_ready": redis_cache.available,
        "supported_languages": text_processor.supported_languages,
    }


@app.get("/version", tags=["system"])
async def version():
    return {
        "app_name": settings.app_name,
        "app_version": settings.app_version,
        "python": __import__("sys").version,
        "languages_supported": text_processor.supported_languages,
        "framework": "FastAPI",
    }
