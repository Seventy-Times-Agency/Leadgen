"""Telegram implementations of core ``ProgressSink`` and ``DeliverySink``.

Translates the abstract protocol calls from ``core`` into aiogram
operations (edit the progress message, send stats card, send lead
cards, send the Excel document). Keeps all Telegram-specific copy,
HTML formatting and rate-limit handling out of the core pipeline.
"""

from __future__ import annotations

import contextlib
import logging
from html import escape as html_escape

from aiogram import Bot
from aiogram.types import BufferedInputFile

from leadgen.analysis.aggregator import BaseStats
from leadgen.db.models import Lead
from leadgen.export.excel import build_excel
from leadgen.pipeline.progress import ProgressReporter

logger = logging.getLogger(__name__)


class TelegramProgressSink:
    """Wraps ``ProgressReporter`` so it satisfies the core ``ProgressSink`` protocol."""

    def __init__(self, reporter: ProgressReporter) -> None:
        self._reporter = reporter

    async def phase(self, title: str, subtitle: str = "") -> None:
        await self._reporter.phase(title, subtitle)

    async def update(self, done: int, total: int) -> None:
        await self._reporter.update(done, total)

    async def finish(self, text: str) -> None:
        await self._reporter.finish(text)


class TelegramDeliverySink:
    """Sends the final report over Telegram — stats, insights, cards, Excel.

    Each piece is isolated in its own try/except so a failed Excel
    render or a rate-limited lead card doesn't swallow the rest of the
    report. The aggregate success flag (``any_delivered``) is exposed
    on the instance so callers can tell whether the user got anything.
    """

    def __init__(self, bot: Bot, chat_id: int) -> None:
        self.bot = bot
        self.chat_id = chat_id
        self.any_delivered = False

    async def deliver_stats(
        self, niche: str, region: str, stats: BaseStats
    ) -> None:
        try:
            text = _format_stats(niche, region, stats)
            await self.bot.send_message(self.chat_id, text)
            self.any_delivered = True
        except Exception:  # noqa: BLE001
            logger.exception("deliver_stats failed")

    async def deliver_insights(self, insights: str) -> None:
        try:
            body = html_escape(insights or "—")
            await self.bot.send_message(
                self.chat_id,
                f"💡 <b>Что это значит для продаж</b>\n\n{body}",
            )
        except Exception:  # noqa: BLE001
            logger.exception("deliver_insights failed")

    async def deliver_top_leads(self, leads: list[Lead]) -> None:
        hot_leads = [lead for lead in leads if lead.score_ai is not None][:5]
        if not hot_leads:
            return
        with contextlib.suppress(Exception):
            await self.bot.send_message(self.chat_id, "🔥 <b>Топ-5 горячих лидов</b>")
        for lead in hot_leads:
            try:
                await self.bot.send_message(
                    self.chat_id,
                    _format_lead_card(lead),
                    disable_web_page_preview=True,
                )
            except Exception:  # noqa: BLE001
                logger.exception(
                    "deliver_top_leads: lead card failed for %r (id=%s)",
                    lead.name,
                    lead.id,
                )

    async def deliver_excel(
        self, leads: list[Lead], niche: str, region: str
    ) -> None:
        try:
            payload = build_excel(leads)
            filename = _safe_filename(f"leads_{niche}_{region}.xlsx")
            await self.bot.send_document(
                self.chat_id,
                document=BufferedInputFile(payload, filename=filename),
                caption=f"Полная база: {len(leads)} лидов",
            )
        except Exception:  # noqa: BLE001
            logger.exception("deliver_excel failed")
            with contextlib.suppress(Exception):
                await self.bot.send_message(
                    self.chat_id,
                    "⚠️ Excel-файл не сформировался (смотри выше текстовый отчёт).",
                )


def _format_stats(niche: str, region: str, stats: BaseStats) -> str:
    return (
        f"📊 <b>Готово: твоя база лидов собрана</b>\n"
        f"Ниша: <b>{html_escape(niche)}</b>\n"
        f"Регион: <b>{html_escape(region)}</b>\n\n"
        f"Всего компаний: <b>{stats.total}</b>\n"
        f"Проанализировано AI: <b>{stats.enriched}</b>\n"
        f"Средний AI-скор: <b>{stats.avg_score:.0f}/100</b>\n\n"
        f"🔥 Горячих (75+): <b>{stats.hot_count}</b>\n"
        f"🌡 Тёплых (50-74): <b>{stats.warm_count}</b>\n"
        f"❄️ Холодных (&lt;50): <b>{stats.cold_count}</b>\n\n"
        f"С сайтом: <b>{stats.with_website}</b> / {stats.total}\n"
        f"С соцсетями: <b>{stats.with_socials}</b> / {stats.total}\n"
        f"С телефоном: <b>{stats.with_phone}</b> / {stats.total}"
    )


def _format_lead_card(lead: Lead) -> str:
    parts: list[str] = []

    score_str = f" — <b>{int(lead.score_ai)}/100</b>" if lead.score_ai is not None else ""
    parts.append(f"<b>{html_escape(lead.name)}</b>{score_str}")

    if lead.tags:
        emoji_map = {"hot": "🔥", "warm": "🌡", "cold": "❄️"}
        badges = "".join(emoji_map.get(t, "") for t in lead.tags if t in emoji_map)
        tags_text = ", ".join(lead.tags)
        prefix = f"{badges} " if badges else ""
        parts.append(f"{prefix}{html_escape(tags_text)}")

    if lead.summary:
        parts.append(f"📝 <i>{html_escape(lead.summary)}</i>")

    details: list[str] = []
    if lead.category:
        details.append(f"🏷 {html_escape(lead.category)}")
    if lead.rating is not None:
        rev = f" ({lead.reviews_count})" if lead.reviews_count else ""
        details.append(f"⭐ {lead.rating}{rev}")
    if details:
        parts.append(" • ".join(details))

    if lead.address:
        parts.append(f"📍 {html_escape(lead.address)}")
    if lead.phone:
        parts.append(f"📞 {html_escape(lead.phone)}")
    if lead.website:
        parts.append(f"🌐 {html_escape(lead.website)}")
    if lead.social_links:
        social_lines = " | ".join(
            f"{k}: {v}" for k, v in lead.social_links.items() if v
        )
        if social_lines:
            parts.append(f"📱 {html_escape(social_lines)}")

    if lead.advice:
        parts.append(f"\n💡 <b>Как зайти:</b> {html_escape(lead.advice)}")

    if lead.weaknesses:
        weak = ", ".join(lead.weaknesses[:3])
        parts.append(f"📉 <b>Точки роста:</b> {html_escape(weak)}")

    if lead.red_flags:
        flags = ", ".join(lead.red_flags[:3])
        parts.append(f"⚠️ <b>Риски:</b> {html_escape(flags)}")

    return "\n".join(parts)


def _safe_filename(name: str) -> str:
    allowed = "-_.() "
    cleaned = "".join(c if c.isalnum() or c in allowed else "_" for c in name)
    return cleaned.replace(" ", "_")
