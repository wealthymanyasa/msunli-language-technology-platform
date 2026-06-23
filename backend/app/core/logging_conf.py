import json
import logging
import sys
import uuid
from datetime import datetime
from typing import Optional


class StructuredJsonFormatter(logging.Formatter):
    def format(self, record: logging.LogRecord) -> str:
        log_entry = {
            "timestamp": datetime.utcnow().isoformat(),
            "level": record.levelname,
            "logger": record.name,
            "message": record.getMessage(),
        }
        if hasattr(record, "request_id"):
            log_entry["request_id"] = record.request_id
        if hasattr(record, "correlation_id"):
            log_entry["correlation_id"] = record.correlation_id
        if hasattr(record, "user_id"):
            log_entry["user_id"] = record.user_id
        if hasattr(record, "execution_time"):
            log_entry["execution_time"] = record.execution_time
        if record.exc_info and record.exc_info[0]:
            log_entry["exception"] = self.formatException(record.exc_info)
        return json.dumps(log_entry)


def setup_logging(level: str = "INFO", fmt: str = "json") -> None:
    root_logger = logging.getLogger()
    root_logger.setLevel(getattr(logging, level.upper(), logging.INFO))

    handler = logging.StreamHandler(sys.stdout)
    if fmt == "json":
        handler.setFormatter(StructuredJsonFormatter())
    else:
        handler.setFormatter(logging.Formatter(
            "%(asctime)s - %(name)s - %(levelname)s - %(message)s"
        ))
    root_logger.addHandler(handler)

    for lib in ["uvicorn", "uvicorn.access", "sqlalchemy.engine"]:
        logging.getLogger(lib).setLevel(logging.WARNING)


def get_request_logger(
    logger_name: str,
    request_id: Optional[str] = None,
    correlation_id: Optional[str] = None,
    user_id: Optional[int] = None,
) -> logging.Logger:
    logger = logging.getLogger(logger_name)
    if request_id:
        logger = logging.LoggerAdapter(logger, {
            "request_id": request_id,
            "correlation_id": correlation_id or request_id,
            "user_id": user_id,
        })
    return logger
