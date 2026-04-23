"""Telegram-specific implementations of core service protocols."""

from leadgen.adapters.telegram.sinks import TelegramDeliverySink, TelegramProgressSink

__all__ = ["TelegramDeliverySink", "TelegramProgressSink"]
