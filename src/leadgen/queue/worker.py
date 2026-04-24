"""arq worker settings.

Run with ``arq leadgen.queue.worker.WorkerSettings`` in a dedicated
Railway service. The job routes on ``SearchQuery.source``: Telegram
searches still get an aiogram-backed Bot + TelegramProgressSink /
TelegramDeliverySink, web searches get a ``BrokerProgressSink`` +
``WebDeliverySink`` so the SSE endpoint has something to stream.
"""

from __future__ import annotations

import logging
import uuid
from typing import Any

from arq.connections import RedisSettings

from leadgen.config import get_settings
from leadgen.db.models import SearchQuery
from leadgen.db.session import session_factory
from leadgen.pipeline.search import run_search, run_search_with_sinks

logger = logging.getLogger(__name__)


async def run_search_job(
    ctx: dict[str, Any],
    query_id_str: str,
    chat_id: int | None,
    user_profile: dict[str, Any] | None,
) -> None:
    """arq entry point — picks sinks based on SearchQuery.source.

    Web searches: ``chat_id`` is None. We read ``SearchQuery.source``
    off the DB and, when it's "web", run the pure pipeline with the
    progress broker + web delivery sink so the SSE endpoint streams
    phase/update/finish events to the browser.
    """
    query_id = uuid.UUID(query_id_str)

    async with session_factory() as session:
        query = await session.get(SearchQuery, query_id)
        if query is None:
            logger.error("run_search_job: query %s not found", query_id)
            return
        source = query.source or "telegram"

    if source == "web":
        from leadgen.adapters.web_api.sinks import WebDeliverySink
        from leadgen.core.services import default_broker
        from leadgen.core.services.progress_broker import BrokerProgressSink

        progress = BrokerProgressSink(default_broker, query_id)
        delivery = WebDeliverySink(query_id)
        await run_search_with_sinks(
            query_id=query_id,
            progress=progress,
            delivery=delivery,
            user_profile=user_profile,
        )
        return

    # Telegram path — needs a chat to post into.
    if chat_id is None:
        logger.warning(
            "run_search_job: telegram-source query %s has no chat_id, skipping",
            query_id,
        )
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
