"""Utilities for managing database migrations at application startup."""

from __future__ import annotations

import asyncio
import logging
from pathlib import Path

from alembic import command
from alembic.config import Config

from app.core.config import settings

logger = logging.getLogger(__name__)

_PROJECT_ROOT = Path(__file__).resolve().parents[2]


def _get_alembic_config() -> Config:
    """Return an Alembic configuration bound to the current settings."""

    config = Config(str(_PROJECT_ROOT / "alembic.ini"))
    config.set_main_option("script_location", str(_PROJECT_ROOT / "alembic"))

    database_url = settings.alembic_database_url or settings.database_url
    config.set_main_option("sqlalchemy.url", database_url)

    return config


def _run_migrations_sync() -> None:
    """Execute Alembic migrations synchronously."""

    config = _get_alembic_config()
    command.upgrade(config, "head")


async def run_migrations() -> None:
    """Run the project's Alembic migrations in a background thread."""

    logger.info("Running database migrations")
    await asyncio.to_thread(_run_migrations_sync)
    logger.info("Database migrations complete")

