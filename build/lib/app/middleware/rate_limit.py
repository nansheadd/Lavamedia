from __future__ import annotations

import asyncio
import time
from collections import defaultdict, deque
from typing import Deque

from fastapi import Request, Response
from starlette.middleware.base import BaseHTTPMiddleware


class RateLimitMiddleware(BaseHTTPMiddleware):
    """Simple in-memory rate limiting per client IP."""

    def __init__(self, app, *, limit: int, window_seconds: int) -> None:  # type: ignore[override]
        super().__init__(app)
        self.limit = limit
        self.window_seconds = window_seconds
        self._hits: dict[str, Deque[float]] = defaultdict(deque)
        self._lock = asyncio.Lock()

    async def dispatch(self, request: Request, call_next) -> Response:  # type: ignore[override]
        client_ip = request.client.host if request.client else "anonymous"
        allowed, retry_after, remaining = await self._check_rate_limit(client_ip)
        if not allowed:
            response = Response(status_code=429, content="Too Many Requests")
            if retry_after is not None:
                response.headers["Retry-After"] = str(int(retry_after))
            response.headers["X-RateLimit-Limit"] = str(self.limit)
            response.headers["X-RateLimit-Remaining"] = "0"
            return response
        response = await call_next(request)
        response.headers["X-RateLimit-Limit"] = str(self.limit)
        response.headers["X-RateLimit-Remaining"] = str(max(0, remaining))
        return response

    async def _check_rate_limit(self, key: str) -> tuple[bool, float | None, int]:
        async with self._lock:
            now = time.monotonic()
            window_start = now - self.window_seconds
            hits = self._hits[key]
            while hits and hits[0] < window_start:
                hits.popleft()
            if len(hits) >= self.limit:
                retry_after = max(0, self.window_seconds - (now - hits[0]))
                return False, retry_after, 0
            hits.append(now)
            remaining = self.limit - len(hits)
            return True, None, remaining
