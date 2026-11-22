"""migrate_interview_to_interviewing

Revision ID: c3a1b8e9d2f4
Revises: f15bf79ab4e5
Create Date: 2026-11-22 13:10:00.000000

"""
from typing import Sequence, Union
from alembic import op

# revision identifiers, used by Alembic.
revision: str = 'c3a1b8e9d2f4'
down_revision: Union[str, Sequence[str], None] = 'f15bf79ab4e5'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Migrate historical 'Interview' review stages to canonical 'Interviewing'."""
    op.execute("UPDATE applications SET review_stage = 'Interviewing' WHERE review_stage = 'Interview'")
    op.execute("UPDATE application_status_history SET to_stage = 'Interviewing' WHERE to_stage = 'Interview'")
    op.execute("UPDATE application_status_history SET from_stage = 'Interviewing' WHERE from_stage = 'Interview'")


def downgrade() -> None:
    """Revert 'Interviewing' review stages to 'Interview'."""
    op.execute("UPDATE applications SET review_stage = 'Interview' WHERE review_stage = 'Interviewing'")
    op.execute("UPDATE application_status_history SET to_stage = 'Interview' WHERE to_stage = 'Interviewing'")
    op.execute("UPDATE application_status_history SET from_stage = 'Interview' WHERE from_stage = 'Interviewing'")
