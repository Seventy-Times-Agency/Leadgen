"""arq worker settings.

Run with ``arq leadgen.queue.worker.WorkerSettings`` in a dedicated
Railway service. The worker uses the existing Telegram Bot client to
build its ProgressSink + DeliverySink so live updates keep flowing
during a queued run; the web-sink variant lives in the web_api
adapter (commit E/F).
"""

from __future__ import annotations

import logging
import uuid
from typing import Any

from arq.connections import RedisSettings

from leadgen.config import get_settings
from leadgen.pipeline.search import run_search

logger = logging.getLogger(__name__)


async def run_search_job(
    ctx: dict[str, Any],
    query_id_str: str,
    chat_id: int | None,
    user_profile: dict[str, Any] | None,
) -> None:
    """arq entry point — rebuilds the Bot handle and delegates.

    For MVP we still target a Telegram chat: the job carries a
    ``chat_id`` and we construct an aiogram Bot from ``BOT_TOKEN`` on
    the worker side. Later we'll branch on a ``target`` discriminator
    to pick Telegram vs web sinks.
    """
    query_id = uuid.UUID(query_id_str)
    if chat_id is None:
        logger.warning("run_search_job: called without chat_id, skipping")
        return

    from aiogram import Bot
    from aiogram.client.default import DefaultBotProperties
    from aiogram.enums import ParseMode

    settings = get_settings()
    bot = Bot(
        token=settings.bot_token,
        default=DefaultBotProperties(parse_mode=ParseMode.HTML),
    )
    try:
        await run_search(query_id, chat_id, bot, user_profile=user_profile)
    finally:
        await bot.session.close()


class WorkerSettings:
    """arq ``WorkerSettings`` — discovered via the ``arq`` CLI."""

    functions = [run_search_job]  # noqa: RUF012 — arq API requires a list attr
    # Lazy Redis settings: allows the worker to boot even if REDIS_URL
    # is formatted oddly — arq will error out loudly during .on_startup.
    redis_settings = RedisSettings.from_dsn(
        get_settings().redis_url or "redis://localhost:6379"
    )
    max_jobs = 5
    job_timeout = 15 * 60
    keep_result = 3600
