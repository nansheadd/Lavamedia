from __future__ import annotations

from app.core.config import settings

try:
    import httpx
except ImportError:  # pragma: no cover - optional dependency
    httpx = None  # type: ignore


async def trigger_newsletter_webhook(payload: dict) -> None:
    if not settings.newsletter_webhook_url or httpx is None:
        return
    async with httpx.AsyncClient() as client:
        await client.post(settings.newsletter_webhook_url, json=payload, timeout=10)
