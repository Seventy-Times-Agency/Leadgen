"""Minimal API-key auth with an open-mode fallback.

Two modes, toggled by whether ``WEB_API_KEY`` is set in the environment:

- **Key configured** — every write request must carry a matching
  ``X-API-Key`` header, otherwise 401.
- **Key empty (default for internal-use stage)** — requests are
  accepted without a key. Lets the user put the app live and click
  around before they've set up a shared secret. A warning is logged
  once per process so this never goes unnoticed in production.

Magic-link + session cookies come when public sign-up is opened.
"""

from __future__ import annotations

import logging

from fastapi import Header, HTTPException, status

from leadgen.config import get_settings

logger = logging.getLogger(__name__)

_open_mode_warned = False


def is_open_mode() -> bool:
    """True when the API runs without an API key gate (see module docstring)."""
    return not get_settings().web_api_key


def _warn_open_mode_once() -> None:
    global _open_mode_warned
    if _open_mode_warned:
        return
    _open_mode_warned = True
    logger.warning(
        "Web API is running in OPEN MODE: WEB_API_KEY is empty. Anyone who "
        "can reach the service can create searches. Set WEB_API_KEY in the "
        "Railway service vars to lock it down."
    )


async def require_api_key(x_api_key: str | None = Header(default=None)) -> None:
    expected = get_settings().web_api_key
    if not expected:
        _warn_open_mode_once()
        return
    if x_api_key != expected:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="invalid or missing X-API-Key header",
        )
