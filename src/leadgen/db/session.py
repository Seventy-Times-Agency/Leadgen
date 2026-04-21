from __future__ import annotations

from collections.abc import AsyncIterator
from contextlib import asynccontextmanager

from sqlalchemy import text
from sqlalchemy.ext.asyncio import (
    AsyncSession,
    async_sessionmaker,
    create_async_engine,
)

from leadgen.config import settings

engine = create_async_engine(
    settings.sqlalchemy_url,
    echo=False,
    pool_pre_ping=True,
)

session_factory: async_sessionmaker[AsyncSession] = async_sessionmaker(
    engine, expire_on_commit=False, class_=AsyncSession
)


SCHEMA_COMPAT_QUERIES: dict[str, list[str]] = {
    "search_queries": [
        "ALTER TABLE search_queries ADD COLUMN IF NOT EXISTS avg_score DOUBLE PRECISION",
        "ALTER TABLE search_queries ADD COLUMN IF NOT EXISTS hot_leads_count INTEGER",
        "ALTER TABLE search_queries ADD COLUMN IF NOT EXISTS analysis_summary JSONB",
    ],
    "leads": [
        "ALTER TABLE leads ADD COLUMN IF NOT EXISTS enriched BOOLEAN NOT NULL DEFAULT FALSE",
        "ALTER TABLE leads ADD COLUMN IF NOT EXISTS score_ai DOUBLE PRECISION",
        "ALTER TABLE leads ADD COLUMN IF NOT EXISTS tags JSONB",
        "ALTER TABLE leads ADD COLUMN IF NOT EXISTS summary TEXT",
        "ALTER TABLE leads ADD COLUMN IF NOT EXISTS advice TEXT",
        "ALTER TABLE leads ADD COLUMN IF NOT EXISTS strengths JSONB",
        "ALTER TABLE leads ADD COLUMN IF NOT EXISTS weaknesses JSONB",
        "ALTER TABLE leads ADD COLUMN IF NOT EXISTS red_flags JSONB",
        "ALTER TABLE leads ADD COLUMN IF NOT EXISTS website_meta JSONB",
        "ALTER TABLE leads ADD COLUMN IF NOT EXISTS social_links JSONB",
        "ALTER TABLE leads ADD COLUMN IF NOT EXISTS reviews_summary TEXT",
    ],
}



async def init_db() -> None:
    """Validate connectivity and patch legacy schemas safely.

    Primary schema management is Alembic-based, but this compatibility patch helps
    existing deployments that were created before migrations were introduced.
    """
    async with engine.begin() as conn:
        await conn.execute(text("SELECT 1"))
        for table_name, queries in SCHEMA_COMPAT_QUERIES.items():
            exists = await conn.execute(
                text("SELECT to_regclass(:table_name) IS NOT NULL"),
                {"table_name": table_name},
            )
            if not bool(exists.scalar()):
                continue
            for sql in queries:
                await conn.execute(text(sql))


@asynccontextmanager
async def get_session() -> AsyncIterator[AsyncSession]:
    async with session_factory() as session:
        yield session
