"""Tiny aiohttp server that runs alongside the Telegram polling loop.

Exposes:
- ``GET /health`` — JSON with the current liveness / DB status. Returns
  503 if the DB is unreachable so Railway can recycle the container.
- ``GET /metrics`` — Prometheus text format, scraped by any monitoring
  stack that speaks Prometheus.

The server binds to ``PORT`` (Railway injects it) and ``0.0.0.0``.
"""

from __future__ import annotations

import logging
import os

from aiohttp import web
from prometheus_client import CONTENT_TYPE_LATEST, REGISTRY, generate_latest
from sqlalchemy import text

from leadgen.db.session import _get_engine

logger = logging.getLogger(__name__)


async def _check_db() -> bool:
    try:
        engine = _get_engine()
        async with engine.connect() as conn:
            result = await conn.execute(text("SELECT 1"))
            return result.scalar() == 1
    except Exception:  # noqa: BLE001
        logger.exception("health: db check failed")
        return False


async def health_handler(_request: web.Request) -> web.Response:
    db_ok = await _check_db()
    body = {
        "status": "healthy" if db_ok else "unhealthy",
        "db": db_ok,
        "commit": os.environ.get("RAILWAY_GIT_COMMIT_SHA", "unknown")[:12],
    }
    return web.json_response(body, status=200 if db_ok else 503)


async def metrics_handler(_request: web.Request) -> web.Response:
    payload = generate_latest(REGISTRY)
    return web.Response(body=payload, content_type=CONTENT_TYPE_LATEST.split(";")[0])


async def root_handler(_request: web.Request) -> web.Response:
    return web.Response(text="leadgen-bot alive. /health and /metrics available.\n")


def create_app() -> web.Application:
    app = web.Application()
    app.router.add_get("/", root_handler)
    app.router.add_get("/health", health_handler)
    app.router.add_get("/metrics", metrics_handler)
    return app


async def start_health_server() -> web.AppRunner:
    """Bind and start the health server in-process. Caller owns cleanup."""
    port = int(os.environ.get("PORT", "8080"))
    runner = web.AppRunner(create_app(), handle_signals=False)
    await runner.setup()
    site = web.TCPSite(runner, host="0.0.0.0", port=port)  # noqa: S104
    await site.start()
    logger.info("health+metrics server listening on 0.0.0.0:%d", port)
    return runner
