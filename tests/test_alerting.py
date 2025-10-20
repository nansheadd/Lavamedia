from __future__ import annotations

import asyncio
import types

from app.services import alerting
from app.services.alerting import AlertManager


def test_notify_without_httpx(monkeypatch) -> None:
    manager = AlertManager("https://example.com/webhook")
    monkeypatch.setattr(alerting, "httpx", None)

    monkeypatch.setattr(manager.logger, "log", lambda *args, **kwargs: None)
    captured: dict[str, object] = {}

    def fake_warning(message, *args, **kwargs) -> None:
        captured["message"] = message
        captured["kwargs"] = kwargs

    monkeypatch.setattr(manager.logger, "warning", fake_warning)

    asyncio.run(manager.notify("Test", severity="warning"))

    assert captured["message"] == "alert.httpx_missing"
    assert captured["kwargs"]["extra"]["webhook_url"] == "https://example.com/webhook"


def test_notify_uses_httpx_when_available(monkeypatch) -> None:
    calls: dict[str, object] = {}

    class DummyAsyncClient:
        def __init__(self, *args, **kwargs) -> None:
            calls["init_kwargs"] = kwargs

        async def __aenter__(self) -> DummyAsyncClient:
            return self

        async def __aexit__(self, exc_type, exc, tb) -> None:  # type: ignore[override]
            return None

        async def post(self, url: str, *, json: dict, timeout: int | None = None) -> None:
            calls["url"] = url
            calls["json"] = json
            calls["timeout"] = timeout

    dummy_httpx = types.SimpleNamespace(AsyncClient=DummyAsyncClient)
    monkeypatch.setattr(alerting, "httpx", dummy_httpx)

    manager = AlertManager("https://example.com/webhook")
    asyncio.run(manager.notify("Test", severity="error", context={"foo": "bar"}))

    assert calls["url"] == "https://example.com/webhook"
    payload = calls["json"]
    assert isinstance(payload, dict)
    assert payload["message"] == "Test"
    assert payload["severity"] == "error"
    assert payload["context"] == {"foo": "bar"}
    assert calls["timeout"] is None
    assert calls["init_kwargs"]["timeout"] == 5
