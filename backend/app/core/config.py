from pydantic_settings import BaseSettings
from typing import Optional, List
import os


class Settings(BaseSettings):
    app_name: str = "MSUNLI Language Technology Platform"
    app_version: str = "1.0.0"
    debug: bool = False

    database_url: str = "postgresql://user:password@localhost:5432/zilp"
    redis_url: str = "redis://localhost:6379"

    jwt_secret: str = "change-this-secret-in-production"
    jwt_algorithm: str = "HS256"
    jwt_expiration_minutes: int = 30
    jwt_refresh_expiration_days: int = 7

    api_rate_limit: int = 100
    api_rate_limit_window: int = 60

    cors_origins: List[str] = ["*"]

    log_level: str = "INFO"
    log_format: str = "json"

    test_mode: bool = False

    class Config:
        env_file = ".env"
        case_sensitive = False


settings = Settings()
