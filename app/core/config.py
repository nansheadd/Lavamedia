from functools import lru_cache
from typing import List, Optional

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
    allowed_origins: List[str] = ["*"]
    mfa_issuer: str = "Lavamedia"
    search_provider: str = "meilisearch"
    search_url: str | None = None
    search_api_key: str | None = None

    analytics_enabled: bool = True
    newsletter_webhook_url: str | None = None


@lru_cache
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
