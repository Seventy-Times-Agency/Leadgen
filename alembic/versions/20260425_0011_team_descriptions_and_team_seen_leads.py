"""team descriptions + per-member descriptions + cross-team lead dedup

Revision ID: 20260425_0011
Revises: 20260425_0010
Create Date: 2026-04-25 23:30:00

Three additions to support the team-context Henry persona and the
hard "no lead twice in one team" rule:

- ``teams.description`` — short purpose text the owner sets so
  Henry knows what the team is for and members understand the scope.
- ``team_memberships.description`` — owner-curated short note
  about each member ("Анна — закрывает стоматологии в EU").
- ``team_seen_leads`` — every lead returned to anyone in a team is
  fingerprinted here. The pipeline filters incoming Google Maps
  results against this table when a team-mode search runs, so the
  same place never appears twice across teammates.
"""

from __future__ import annotations

import sqlalchemy as sa
from alembic import op


revision = "20260425_0011"
down_revision = "20260425_0010"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column("teams", sa.Column("description", sa.Text(), nullable=True))
    op.add_column(
        "team_memberships",
        sa.Column("description", sa.Text(), nullable=True),
    )

    op.create_table(
        "team_seen_leads",
        sa.Column("team_id", sa.CHAR(length=36), nullable=False),
        sa.Column("source", sa.String(length=32), nullable=False),
        sa.Column("source_id", sa.String(length=256), nullable=False),
        sa.Column("first_user_id", sa.BigInteger(), nullable=False),
        sa.Column(
            "first_seen_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.PrimaryKeyConstraint("team_id", "source", "source_id"),
        sa.ForeignKeyConstraint(["team_id"], ["teams.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(
            ["first_user_id"], ["users.id"], ondelete="CASCADE"
        ),
    )
    op.create_index(
        "ix_team_seen_leads_team_id",
        "team_seen_leads",
        ["team_id"],
        unique=False,
    )

    # Postgres only: convert team_id from CHAR(36) to UUID so it
    # matches teams.id (which migration 0010 converted). SQLite path
    # leaves the column as CHAR(36) — _UUID decorator handles it.
    bind = op.get_bind()
    if bind.dialect.name == "postgresql":
        op.execute(
            'ALTER TABLE team_seen_leads DROP CONSTRAINT IF EXISTS '
            '"team_seen_leads_team_id_fkey"'
        )
        op.execute(
            "ALTER TABLE team_seen_leads "
            "ALTER COLUMN team_id TYPE UUID USING team_id::uuid"
        )
        op.execute(
            'ALTER TABLE team_seen_leads ADD CONSTRAINT '
            '"team_seen_leads_team_id_fkey" '
            'FOREIGN KEY (team_id) REFERENCES teams (id) ON DELETE CASCADE'
        )


def downgrade() -> None:
    op.drop_index("ix_team_seen_leads_team_id", table_name="team_seen_leads")
    op.drop_table("team_seen_leads")
    op.drop_column("team_memberships", "description")
    op.drop_column("teams", "description")
