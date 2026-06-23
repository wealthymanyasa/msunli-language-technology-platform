import logging
from typing import Callable

from fastapi import Request, HTTPException, status
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.responses import Response

from app.cache.redis import redis_cache
from app.core.config import settings

logger = logging.getLogger(__name__)


class RateLimitMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        if request.url.path in ("/health", "/version"):
            return await call_next(request)

        client_ip = request.client.host if request.client else "unknown"
        key = f"ratelimit:{client_ip}:{request.url.path}"

        allowed = await redis_cache.rate_limit(
            key,
            settings.api_rate_limit,
            settings.api_rate_limit_window,
        )

        if not allowed:
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail=f"Rate limit exceeded. Max {settings.api_rate_limit} requests per {settings.api_rate_limit_window} seconds.",
            )

        return await call_next(request)
