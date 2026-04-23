"""Tests that the client-agnostic sink protocols are satisfied by both the
default NullSink and the Telegram adapter.

We don't talk to Telegram here — we're checking the shape of the
protocol. The `isinstance` calls below only work because the protocols
are `runtime_checkable`; if somebody later removes a method, this
suite catches it.
"""

from __future__ import annotations

from unittest.mock import AsyncMock, MagicMock

import pytest

from leadgen.adapters.telegram.sinks import TelegramDeliverySink, TelegramProgressSink
from leadgen.core.services import DeliverySink, NullSink, ProgressSink


def test_null_sink_implements_both_protocols() -> None:
    sink = NullSink()
    assert isinstance(sink, ProgressSink)
    assert isinstance(sink, DeliverySink)


def test_telegram_progress_sink_implements_protocol() -> None:
    # We don't need a real ProgressReporter for structural checks —
    # a MagicMock with the same attribute surface is enough.
    reporter = MagicMock()
    sink = TelegramProgressSink(reporter)
    assert isinstance(sink, ProgressSink)


def test_telegram_delivery_sink_implements_protocol() -> None:
    bot = MagicMock()
    sink = TelegramDeliverySink(bot, chat_id=123)
    assert isinstance(sink, DeliverySink)


@pytest.mark.asyncio
async def test_null_sink_all_methods_are_awaitable_and_silent() -> None:
    # Exercises every protocol method to catch any future addition that
    # forgets to update NullSink — the test runner will AttributeError
    # before CI ever hits real Telegram / web traffic.
    sink = NullSink()
    await sink.phase("x")
    await sink.update(1, 10)
    await sink.finish("y")
    await sink.deliver_stats("n", "r", stats=object())
    await sink.deliver_insights("insights")
    await sink.deliver_top_leads([])
    await sink.deliver_excel([], "n", "r")


@pytest.mark.asyncio
async def test_telegram_progress_sink_forwards_to_reporter() -> None:
    # Each ProgressSink call should delegate 1:1 to the wrapped reporter;
    # that's the contract the search pipeline will lean on.
    reporter = MagicMock()
    reporter.phase = AsyncMock()
    reporter.update = AsyncMock()
    reporter.finish = AsyncMock()

    sink = TelegramProgressSink(reporter)
    await sink.phase("title", "sub")
    await sink.update(3, 10)
    await sink.finish("done")

    reporter.phase.assert_awaited_once_with("title", "sub")
    reporter.update.assert_awaited_once_with(3, 10)
    reporter.finish.assert_awaited_once_with("done")
