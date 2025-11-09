"""Structured logging helpers for the FastAPI application."""

from __future__ import annotations

import json
import logging
import logging.config
import sys
from datetime import datetime, timezone
from typing import Any


class JsonFormatter(logging.Formatter):
    """Render log records as JSON strings."""

    def format(self, record: logging.LogRecord) -> str:  # noqa: D401
        base: dict[str, Any] = {
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "level": record.levelname,
            "logger": record.name,
            "message": record.getMessage(),
        }
        if record.exc_info:
            base["exc_info"] = self.formatException(record.exc_info)
        for key, value in record.__dict__.items():
            if key.startswith("_"):
                continue
            if key in base or key in {"args", "msg", "message", "exc_info"}:
                continue
            base[key] = value
        return json.dumps(base, ensure_ascii=False)


def setup_logging() -> None:
    """Configure the application-wide logging setup."""

    logging_config = {
        "version": 1,
        "disable_existing_loggers": False,
        "formatters": {
            "json": {
                "()": JsonFormatter,
            }
        },
        "handlers": {
            "console": {
                "class": "logging.StreamHandler",
                "formatter": "json",
                "stream": sys.stdout,
            }
        },
        "loggers": {
            "uvicorn": {"handlers": ["console"], "level": "INFO", "propagate": False},
            "uvicorn.error": {"handlers": ["console"], "level": "INFO", "propagate": False},
            "uvicorn.access": {"handlers": ["console"], "level": "INFO", "propagate": False},
            "app": {"handlers": ["console"], "level": "INFO", "propagate": False},
            "app.http": {"handlers": ["console"], "level": "INFO", "propagate": False},
            "app.audit": {"handlers": ["console"], "level": "INFO", "propagate": False},
            "app.alerts": {"handlers": ["console"], "level": "WARNING", "propagate": False},
        },
        "root": {
            "handlers": ["console"],
            "level": "INFO",
        },
    }

    logging.config.dictConfig(logging_config)
