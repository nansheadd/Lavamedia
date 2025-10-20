from __future__ import annotations

import logging
from typing import Any

from app.core.config import settings

try:
    import httpx
except ImportError:  # pragma: no cover - optional dependency
    httpx = None  # type: ignore[assignment]


class AlertManager:
    """Dispatch operational alerts to external systems."""

    def __init__(self, webhook_url: str | None = None) -> None:
        self.webhook_url = webhook_url
        self.logger = logging.getLogger("app.alerts")

    async def notify(self, message: str, *, severity: str, context: dict[str, Any] | None = None) -> None:
        payload = {
            "message": message,
            "severity": severity,
            "context": context or {},
        }
        level = (
            logging.WARNING
            if severity == "warning"
            else logging.ERROR
            if severity == "error"
            else logging.CRITICAL
        )
        self.logger.log(level, message, extra={"severity": severity, **payload["context"]})
        if not self.webhook_url:
            return
        if httpx is None:
            self.logger.warning(
                "alert.httpx_missing",
                extra={"severity": severity, "webhook_url": self.webhook_url},
            )
            return
        try:
            async with httpx.AsyncClient(timeout=5) as client:
                await client.post(self.webhook_url, json=payload)
        except Exception:  # pragma: no cover - logging fallback
            self.logger.exception("alert.dispatch_failed", extra={"webhook_url": self.webhook_url})


alert_manager = AlertManager(settings.alert_webhook_url)
