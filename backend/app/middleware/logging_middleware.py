import time
import uuid
import logging
from typing import Callable

from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import Response


logger = logging.getLogger(__name__)


class RequestLoggingMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        request_id = str(uuid.uuid4())
        correlation_id = request.headers.get("X-Correlation-ID", request_id)
        start_time = time.time()

        request.state.request_id = request_id
        request.state.correlation_id = correlation_id

        response: Response = await call_next(request)

        execution_time = round((time.time() - start_time) * 1000, 2)
        response.headers["X-Request-ID"] = request_id
        response.headers["X-Correlation-ID"] = correlation_id
        response.headers["X-Execution-Time-Ms"] = str(execution_time)

        user_id = getattr(request.state, "user_id", None)
        extra = {
            "request_id": request_id,
            "correlation_id": correlation_id,
            "execution_time": execution_time,
            "method": request.method,
            "path": request.url.path,
            "status_code": response.status_code,
            "user_id": user_id,
        }
        if response.status_code >= 500:
            logger.error(f"{request.method} {request.url.path} -> {response.status_code}", extra=extra)
        elif response.status_code >= 400:
            logger.warning(f"{request.method} {request.url.path} -> {response.status_code}", extra=extra)
        else:
            logger.info(f"{request.method} {request.url.path} -> {response.status_code}", extra=extra)

        return response
