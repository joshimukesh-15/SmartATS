"""add persistent refresh-token revocations

Revision ID: 9c4d7a1e2f63
Revises: f15bf79ab4e5, c3a1b8e9d2f4
Create Date: 2026-11-22

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "9c4d7a1e2f63"
down_revision: Union[str, Sequence[str], None] = ("f15bf79ab4e5", "c3a1b8e9d2f4")
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "refresh_tokens",
        sa.Column("jti", sa.String(length=36), nullable=False),
        sa.Column("subject", sa.String(length=255), nullable=False),
        sa.Column("expires_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("revoked_at", sa.DateTime(timezone=True), nullable=True),
        sa.PrimaryKeyConstraint("jti"),
    )
    op.create_index("ix_refresh_tokens_subject", "refresh_tokens", ["subject"])
    op.create_index("ix_refresh_tokens_expires_at", "refresh_tokens", ["expires_at"])


def downgrade() -> None:
    op.drop_index("ix_refresh_tokens_expires_at", table_name="refresh_tokens")
    op.drop_index("ix_refresh_tokens_subject", table_name="refresh_tokens")
    op.drop_table("refresh_tokens")
