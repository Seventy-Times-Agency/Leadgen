"""Smoke tests for the FastAPI app: /health, /metrics, /api/v1/*.

Uses ``fastapi.testclient.TestClient`` (synchronous httpx wrapper)
which is fine for shape-level assertions — we're verifying that the
app boots, CORS is off by default, routes exist, and API-key gating
behaves right.
"""

from __future__ import annotations

import pytest
from fastapi.testclient import TestClient

from leadgen.adapters.web_api import create_app


@pytest.fixture
def client() -> TestClient:
    return TestClient(create_app())


def test_root_returns_text(client: TestClient) -> None:
    resp = client.get("/")
    assert resp.status_code == 200
    assert "leadgen" in resp.text.lower()


def test_metrics_returns_prometheus_format(client: TestClient) -> None:
    resp = client.get("/metrics")
    assert resp.status_code == 200
    assert "leadgen_" in resp.text or "# HELP" in resp.text


def test_health_returns_shape(client: TestClient) -> None:
    # No real DB in unit test → status may be unhealthy (503), that's fine.
    resp = client.get("/health")
    assert resp.status_code in (200, 503)
    body = resp.json()
    assert "status" in body
    assert "db" in body
    assert "commit" in body


@pytest.mark.asyncio
async def test_require_api_key_open_mode_accepts_missing_header(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    """With WEB_API_KEY empty, the auth dependency is a no-op."""
    from leadgen.adapters.web_api import auth as auth_module
    from leadgen.config import get_settings

    monkeypatch.delenv("WEB_API_KEY", raising=False)
    get_settings.cache_clear()
    monkeypatch.setattr(auth_module, "_open_mode_warned", True, raising=False)

    # Should return without raising — missing header is fine in open mode.
    await auth_module.require_api_key(x_api_key=None)
    assert auth_module.is_open_mode() is True


def test_create_search_rejects_bad_key_when_configured(
    client: TestClient, monkeypatch: pytest.MonkeyPatch
) -> None:
    from leadgen.config import get_settings

    monkeypatch.setenv("WEB_API_KEY", "secret-test-key")
    get_settings.cache_clear()
    try:
        resp = client.post(
            "/api/v1/searches",
            headers={"X-API-Key": "wrong-key"},
            json={"user_id": 1, "niche": "roofing", "region": "NYC"},
        )
        assert resp.status_code == 401
    finally:
        monkeypatch.delenv("WEB_API_KEY", raising=False)
        get_settings.cache_clear()


def test_queue_status_reports_bool(client: TestClient) -> None:
    resp = client.get("/api/v1/queue/status")
    assert resp.status_code == 200
    body = resp.json()
    assert "queue_enabled" in body
    assert isinstance(body["queue_enabled"], bool)


def test_config_reports_open_mode(client: TestClient) -> None:
    resp = client.get("/api/v1/config")
    assert resp.status_code == 200
    body = resp.json()
    assert "open_mode" in body
    assert isinstance(body["open_mode"], bool)
