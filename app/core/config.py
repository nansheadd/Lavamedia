from functools import lru_cache
import json
from typing import List, Optional

from pydantic import Field, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", case_sensitive=False)

    app_name: str = "Lavamedia CMS"
    environment: str = "development"
    debug: bool = True
    secret_key: str = "CHANGE_ME"
    access_token_expire_minutes: int = 30
    refresh_token_expire_minutes: int = 60 * 24 * 14
    database_url: str = "sqlite+aiosqlite:///./lavamedia.db"
    alembic_database_url: Optional[str] = None
    allowed_origins: List[str] = Field(default_factory=lambda: ["*"])
    mfa_issuer: str = "Lavamedia"
    search_provider: str = "meilisearch"
    search_url: str | None = None
    search_api_key: str | None = None

    analytics_enabled: bool = True
    newsletter_webhook_url: str | None = None
    alert_webhook_url: str | None = None
    rate_limit_requests: int = 100
    rate_limit_window_seconds: int = 60
    trusted_hosts: list[str] = ["*"]
    content_security_policy: str = (
        "default-src 'self'; "
        "img-src 'self' data: https:; "
        "script-src 'self'; "
        "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; "
        "font-src 'self' https://fonts.gstatic.com data:;"
    )

    @field_validator("allowed_origins", mode="before")
    @classmethod
    def parse_allowed_origins(cls, value: List[str] | str | None) -> List[str] | str | None:
        if value is None:
            return value
        if isinstance(value, list):
            return value

        value = value.strip()
        if not value:
            return []

        try:
            parsed = json.loads(value)
        except json.JSONDecodeError:
            parsed = None

        if isinstance(parsed, list):
            return parsed

        return [origin.strip() for origin in value.split(",") if origin.strip()]


@lru_cache
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
