"""Pydantic models for the web API's request/response bodies."""

from __future__ import annotations

import uuid
from datetime import datetime

from pydantic import BaseModel, Field


class HealthResponse(BaseModel):
    status: str
    db: bool
    commit: str


class SearchCreate(BaseModel):
    user_id: int = Field(
        ...,
        description="Telegram user id that owns the query. For agency-internal "
        "use this is just the bot user; later we switch to the web-session "
        "user id.",
    )
    niche: str = Field(..., min_length=2, max_length=256)
    region: str = Field(..., min_length=2, max_length=256)
    language_code: str | None = Field(
        default=None,
        description="BCP-47 language hint for Google Places (e.g. 'en', 'uk').",
    )


class SearchSummary(BaseModel):
    id: uuid.UUID
    user_id: int
    niche: str
    region: str
    status: str
    created_at: datetime
    finished_at: datetime | None
    leads_count: int
    avg_score: float | None
    hot_leads_count: int | None
    error: str | None


class SearchCreateResponse(BaseModel):
    id: uuid.UUID
    queued: bool = Field(
        ...,
        description="True if the job went onto the arq queue; False means the "
        "row was created but execution must be triggered by a worker that "
        "picks it up (e.g. Telegram bot on Railway).",
    )
