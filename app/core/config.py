from functools import lru_cache
import json
from typing import List, Optional

from pydantic import Field, field_validator
from pydantic_settings import BaseSettings, EnvSettingsSource, SettingsConfigDict


class BlankFriendlyEnvSettingsSource(EnvSettingsSource):
    """Custom environment source that tolerates blank complex values."""

    def prepare_field_value(self, field_name, field, field_value, value_is_complex):
        if value_is_complex and isinstance(field_value, (str, bytes)):
            if isinstance(field_value, bytes):
                field_value = field_value.decode()

            if not field_value.strip():
                if field_name == "allowed_origins":
                    return []
                return None

        return super().prepare_field_value(field_name, field, field_value, value_is_complex)

    def decode_complex_value(self, field_name, field, value):
        if isinstance(value, str) and not value.strip():
            if field_name == "allowed_origins":
                return []
            return None

        try:
            return super().decode_complex_value(field_name, field, value)
        except json.JSONDecodeError:
            return value


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
    )

    @classmethod
    def settings_customise_sources(
        cls,
        settings_cls,
        init_settings,
        env_settings,
        dotenv_settings,
        file_secret_settings,
    ):
        return (
            init_settings,
            BlankFriendlyEnvSettingsSource(settings_cls),
            dotenv_settings,
            file_secret_settings,
        )

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
            return []
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
