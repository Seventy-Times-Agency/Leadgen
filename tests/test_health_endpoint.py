"""Smoke tests for the /health and /metrics HTTP endpoints."""

from __future__ import annotations

import pytest
import pytest_asyncio
from aiohttp.test_utils import TestClient, TestServer

from leadgen.web.health import create_app


@pytest_asyncio.fixture
async def client() -> TestClient:
    app = create_app()
    server = TestServer(app)
    async with TestClient(server) as c:
        yield c


@pytest.mark.asyncio
async def test_root_returns_text(client: TestClient) -> None:
    resp = await client.get("/")
    assert resp.status == 200
    text = await resp.text()
    assert "leadgen" in text.lower()


@pytest.mark.asyncio
async def test_metrics_returns_prometheus_format(client: TestClient) -> None:
    resp = await client.get("/metrics")
    assert resp.status == 200
    body = await resp.text()
    # Every Prometheus exposition includes HELP/TYPE metadata; our custom
    # counters live in the body too.
    assert "leadgen_searches_total" in body or "# HELP" in body


@pytest.mark.asyncio
async def test_health_reports_db_status(client: TestClient) -> None:
    # The test has no real DB, so the probe will return 503 — that's expected,
    # what we're asserting is the shape of the response, not the verdict.
    resp = await client.get("/health")
    assert resp.status in (200, 503)
    body = await resp.json()
    assert "status" in body
    assert "db" in body
