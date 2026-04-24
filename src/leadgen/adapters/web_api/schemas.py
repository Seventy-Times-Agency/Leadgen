"""Pydantic models for the web API's request/response bodies."""

from __future__ import annotations

import uuid
from datetime import datetime
from typing import Any

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
    display_name: str | None = Field(
        default=None,
        max_length=64,
        description="Optional display name persisted on the user row when we "
        "auto-create them on first search.",
    )
    profession: str | None = Field(
        default=None,
        max_length=200,
        description="What the requesting agency sells. Feeds the AI scoring "
        "prompt so 'good lead for X' matches the user's actual offer.",
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
    insights: str | None = None


class SearchCreateResponse(BaseModel):
    id: uuid.UUID
    queued: bool = Field(
        ...,
        description="True if the job went onto the arq queue; False means the "
        "search is running in-process via asyncio.create_task on the same "
        "container that serves the API.",
    )
    running: bool = Field(
        default=True,
        description="True when the pipeline has been started (queued or in-"
        "process). Always True on success — kept for symmetry with `queued`.",
    )


class LeadOut(BaseModel):
    id: uuid.UUID
    name: str
    website: str | None = None
    phone: str | None = None
    address: str | None = None
    category: str | None = None
    rating: float | None = None
    reviews_count: int | None = None
    latitude: float | None = None
    longitude: float | None = None
    enriched: bool = False
    score_ai: float | None = None
    tags: list[str] | None = None
    summary: str | None = None
    advice: str | None = None
    strengths: list[str] | None = None
    weaknesses: list[str] | None = None
    red_flags: list[str] | None = None
    social_links: dict[str, str] | None = None
    reviews_summary: str | None = None


class SearchDetail(SearchSummary):
    stats: dict[str, Any] | None = None
    leads: list[LeadOut] = Field(default_factory=list)
