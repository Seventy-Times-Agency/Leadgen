"""Search orchestrator.

Executed as a background task after the user confirms a search query.
Runs the collector(s), persists leads, and delivers the result to the user.
"""

from __future__ import annotations

import logging
import uuid
from datetime import datetime, timezone
from html import escape as html_escape

from aiogram import Bot
from aiogram.types import BufferedInputFile
from sqlalchemy import select, update

from leadgen.collectors import GooglePlacesCollector, RawLead
from leadgen.db import Lead, SearchQuery, session_factory
from leadgen.export.excel import build_excel

logger = logging.getLogger(__name__)


async def run_search(query_id: uuid.UUID, chat_id: int, bot: Bot) -> None:
    """Execute a lead-generation search and deliver results to the user."""
    try:
        async with session_factory() as session:
            query = await session.get(SearchQuery, query_id)
            if query is None:
                logger.error("run_search: query %s not found", query_id)
                return
            query.status = "running"
            await session.commit()
            niche, region = query.niche, query.region

        collector = GooglePlacesCollector()
        raw_leads: list[RawLead] = await collector.search(niche=niche, region=region)

        async with session_factory() as session:
            seen: set[str] = set()
            rows: list[Lead] = []
            for r in raw_leads:
                if not r.source_id or r.source_id in seen:
                    continue
                seen.add(r.source_id)
                rows.append(
                    Lead(
                        query_id=query_id,
                        name=r.name,
                        website=r.website,
                        phone=r.phone,
                        address=r.address,
                        category=r.category,
                        rating=r.rating,
                        reviews_count=r.reviews_count,
                        latitude=r.latitude,
                        longitude=r.longitude,
                        source=r.source,
                        source_id=r.source_id,
                        raw=r.raw,
                    )
                )
            session.add_all(rows)
            await session.execute(
                update(SearchQuery)
                .where(SearchQuery.id == query_id)
                .values(
                    status="done",
                    finished_at=datetime.now(timezone.utc),
                    leads_count=len(rows),
                )
            )
            await session.commit()

            # Re-fetch ordered leads for delivery (highest rated first)
            result = await session.execute(
                select(Lead)
                .where(Lead.query_id == query_id)
                .order_by(Lead.rating.is_(None), Lead.rating.desc().nullslast())
            )
            leads = list(result.scalars().all())

        await _deliver_results(bot, chat_id, niche, region, leads)

    except Exception as exc:  # noqa: BLE001
        logger.exception("run_search: failed for query %s", query_id)
        async with session_factory() as session:
            await session.execute(
                update(SearchQuery)
                .where(SearchQuery.id == query_id)
                .values(status="failed", error=str(exc)[:1000])
            )
            await session.commit()
        try:
            await bot.send_message(
                chat_id,
                f"❌ Не удалось выполнить поиск: {html_escape(str(exc)[:300])}",
            )
        except Exception:  # noqa: BLE001
            logger.exception("run_search: failed to notify user")


async def _deliver_results(
    bot: Bot,
    chat_id: int,
    niche: str,
    region: str,
    leads: list[Lead],
) -> None:
    if not leads:
        await bot.send_message(
            chat_id,
            (
                f"По запросу «{html_escape(niche)} — {html_escape(region)}» "
                "ничего не найдено.\nПопробуй другую формулировку или более "
                "крупный регион."
            ),
        )
        return

    preview_count = min(5, len(leads))
    header = (
        f"✅ Нашли <b>{len(leads)}</b> компаний по запросу\n"
        f"«{html_escape(niche)} — {html_escape(region)}»\n\n"
        f"Ниже — первые {preview_count} карточек, полный список в файле."
    )
    await bot.send_message(chat_id, header)

    for lead in leads[:preview_count]:
        await bot.send_message(chat_id, _format_lead(lead), disable_web_page_preview=True)

    excel_bytes = build_excel(leads)
    filename = _safe_filename(f"leads_{niche}_{region}.xlsx")
    await bot.send_document(
        chat_id,
        document=BufferedInputFile(excel_bytes, filename=filename),
        caption=f"Всего лидов: {len(leads)}",
    )


def _format_lead(lead: Lead) -> str:
    parts: list[str] = [f"<b>{html_escape(lead.name)}</b>"]
    if lead.category:
        parts.append(f"🏷 {html_escape(lead.category)}")
    if lead.rating is not None:
        reviews = f" ({lead.reviews_count} отзывов)" if lead.reviews_count else ""
        parts.append(f"⭐ {lead.rating}{reviews}")
    if lead.address:
        parts.append(f"📍 {html_escape(lead.address)}")
    if lead.phone:
        parts.append(f"📞 {html_escape(lead.phone)}")
    if lead.website:
        parts.append(f"🌐 {html_escape(lead.website)}")
    return "\n".join(parts)


def _safe_filename(name: str) -> str:
    allowed = "-_.() "
    cleaned = "".join(c if c.isalnum() or c in allowed else "_" for c in name)
    return cleaned.replace(" ", "_")
