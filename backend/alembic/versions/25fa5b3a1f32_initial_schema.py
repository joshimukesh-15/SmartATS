"""Initial complete schema for SmartATS

Revision ID: 25fa5b3a1f32
Revises: 
Create Date: 2026-11-14 21:01:14.861115

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '25fa5b3a1f32'
down_revision: Union[str, Sequence[str], None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # 1. jobs table
    op.create_table(
        'jobs',
        sa.Column('job_id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('title', sa.String(length=255), nullable=False),
        sa.Column('description', sa.Text(), nullable=False),
        sa.Column('required_skills', sa.JSON(), nullable=False),
        sa.Column('preferred_skills', sa.JSON(), nullable=False),
        sa.Column('custom_weights', sa.JSON(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=False),
        sa.PrimaryKeyConstraint('job_id')
    )
    op.create_index(op.f('ix_jobs_job_id'), 'jobs', ['job_id'], unique=False)
    op.create_index(op.f('ix_jobs_title'), 'jobs', ['title'], unique=False)

    # 2. candidates table
    op.create_table(
        'candidates',
        sa.Column('candidate_id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('name', sa.String(length=255), nullable=True),
        sa.Column('email', sa.String(length=255), nullable=True),
        sa.Column('phone', sa.String(length=100), nullable=True),
        sa.Column('raw_text', sa.Text(), nullable=True),
        sa.Column('extracted_skills', sa.JSON(), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.PrimaryKeyConstraint('candidate_id')
    )
    op.create_index(op.f('ix_candidates_candidate_id'), 'candidates', ['candidate_id'], unique=False)
    op.create_index(op.f('ix_candidates_email'), 'candidates', ['email'], unique=False)

    # 3. applications table
    op.create_table(
        'applications',
        sa.Column('application_id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('job_id', sa.Integer(), nullable=False),
        sa.Column('candidate_id', sa.Integer(), nullable=False),
        sa.Column('resume_path', sa.String(length=500), nullable=False),
        sa.Column('file_hash', sa.String(length=64), nullable=False),
        sa.Column('processing_status', sa.String(length=50), nullable=False),
        sa.Column('review_stage', sa.String(length=50), nullable=False),
        sa.Column('applied_at', sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(['candidate_id'], ['candidates.candidate_id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['job_id'], ['jobs.job_id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('application_id')
    )
    op.create_index(op.f('ix_applications_application_id'), 'applications', ['application_id'], unique=False)
    op.create_index(op.f('ix_applications_file_hash'), 'applications', ['file_hash'], unique=False)
    op.create_index(op.f('ix_applications_job_id'), 'applications', ['job_id'], unique=False)
    op.create_index(op.f('ix_applications_candidate_id'), 'applications', ['candidate_id'], unique=False)

    # 4. application_status_history table
    op.create_table(
        'application_status_history',
        sa.Column('history_id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('application_id', sa.Integer(), nullable=False),
        sa.Column('from_stage', sa.String(length=50), nullable=True),
        sa.Column('to_stage', sa.String(length=50), nullable=False),
        sa.Column('note', sa.Text(), nullable=True),
        sa.Column('changed_by', sa.String(length=100), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(['application_id'], ['applications.application_id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('history_id')
    )
    op.create_index(op.f('ix_application_status_history_history_id'), 'application_status_history', ['history_id'], unique=False)
    op.create_index(op.f('ix_application_status_history_application_id'), 'application_status_history', ['application_id'], unique=False)

    # 5. application_notes table
    op.create_table(
        'application_notes',
        sa.Column('note_id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('application_id', sa.Integer(), nullable=False),
        sa.Column('content', sa.Text(), nullable=False),
        sa.Column('author', sa.String(length=100), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(['application_id'], ['applications.application_id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('note_id')
    )
    op.create_index(op.f('ix_application_notes_note_id'), 'application_notes', ['note_id'], unique=False)
    op.create_index(op.f('ix_application_notes_application_id'), 'application_notes', ['application_id'], unique=False)

    # 6. match_results table
    op.create_table(
        'match_results',
        sa.Column('match_id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('application_id', sa.Integer(), nullable=False),
        sa.Column('keyword_score', sa.Float(), nullable=False),
        sa.Column('tfidf_score', sa.Float(), nullable=False),
        sa.Column('final_score', sa.Float(), nullable=False),
        sa.Column('matched_skills', sa.JSON(), nullable=False),
        sa.Column('missing_skills', sa.JSON(), nullable=False),
        sa.Column('preferred_matched_skills', sa.JSON(), nullable=False),
        sa.Column('score_explanation', sa.Text(), nullable=True),
        sa.Column('evaluated_at', sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(['application_id'], ['applications.application_id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('match_id')
    )
    op.create_index(op.f('ix_match_results_match_id'), 'match_results', ['match_id'], unique=False)
    op.create_index(op.f('ix_match_results_application_id'), 'match_results', ['application_id'], unique=False)


def downgrade() -> None:
    op.drop_table('match_results')
    op.drop_table('application_notes')
    op.drop_table('application_status_history')
    op.drop_table('applications')
    op.drop_table('candidates')
    op.drop_table('jobs')
