from __future__ import annotations

import logging
from typing import Any


logger = logging.getLogger("app.audit")


def log_event(event: str, *, actor: str | None, target: str | None = None, extra: dict[str, Any] | None = None) -> None:
    """Record a security-sensitive action for auditing purposes."""

    payload = {
        "event": event,
        "actor": actor,
        "target": target,
    }
    if extra:
        payload.update(extra)
    logger.info(event, extra=payload)
