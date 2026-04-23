"""Thin client-specific layers on top of ``core``.

Each sub-package plugs core services into one delivery surface:
- ``telegram`` — aiogram handlers + Bot API wrappers (existing bot)
- ``web_api`` — FastAPI endpoints + SSE (coming in commit E/F)

Adapters know about their framework. ``core`` never does.
"""
