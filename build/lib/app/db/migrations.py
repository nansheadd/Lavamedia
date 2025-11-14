"""Utilities for managing database migrations at application startup."""

from __future__ import annotations

import asyncio
import logging
from pathlib import Path

from alembic import command
from alembic.config import Config

from app.core.config import settings

logger = logging.getLogger(__name__)


def _discover_project_root() -> Path:
    """Locate the project root containing alembic.ini.

    When the app package is installed (site-packages/app/...), the previous
    static parent lookup pointed to the site-packages directory and Alembic
    could not find its env.py. We now walk up the filesystem until we find
    the repository root (where alembic.ini lives).
    """

    current = Path(__file__).resolve()
    for parent in current.parents:
        if (parent / "alembic.ini").exists():
            return parent

    # Fallback to the previous behaviour (useful in tests even if it fails later)
    return current.parents[2]


_PROJECT_ROOT = _discover_project_root()


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
