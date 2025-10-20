from __future__ import annotations

import logging
import time
from typing import Awaitable, Callable

from fastapi import Request, Response
from starlette.middleware.base import BaseHTTPMiddleware

from app.services.alerting import alert_manager


logger = logging.getLogger("app.http")


class RequestLoggingMiddleware(BaseHTTPMiddleware):
    """Emit structured logs for every HTTP request/response pair."""

    async def dispatch(self, request: Request, call_next: Callable[[Request], Awaitable[Response]]) -> Response:
        start = time.perf_counter()
        try:
            response = await call_next(request)
        except Exception:  # pragma: no cover - defensive logging path
            duration = (time.perf_counter() - start) * 1000
            logger.exception(
                "request.failed",
                extra={
                    "path": request.url.path,
                    "method": request.method,
                    "duration_ms": round(duration, 2),
                },
            )
            await alert_manager.notify(
                "Unhandled exception",
                severity="critical",
                context={
                    "path": request.url.path,
                    "method": request.method,
                },
            )
            raise
        duration = (time.perf_counter() - start) * 1000
        extra = {
            "path": request.url.path,
            "method": request.method,
            "status": response.status_code,
            "duration_ms": round(duration, 2),
        }
        logger.info("request.completed", extra=extra)
        if response.status_code >= 500:
            await alert_manager.notify(
                "Server error",
                severity="error",
                context=extra,
            )
        return response
