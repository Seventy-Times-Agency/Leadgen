"""Minimal API-key auth.

Good enough for the agency-internal stage: a single secret lives in
``WEB_API_KEY`` and every mutating request carries it as ``X-API-Key``.
When the key is unset the API refuses writes entirely (safer default
than "open to the internet"). Magic-link + session cookies come when
public sign-up is opened.
"""

from __future__ import annotations

from fastapi import Header, HTTPException, status

from leadgen.config import get_settings


async def require_api_key(x_api_key: str | None = Header(default=None)) -> None:
    expected = get_settings().web_api_key
    if not expected:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=(
                "Web API is not configured: WEB_API_KEY is empty. "
                "Set it in the Railway service vars to enable write endpoints."
            ),
        )
    if x_api_key != expected:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="invalid or missing X-API-Key header",
        )
