"""Add tables to support the editorial workflow.

Revision ID: 0004
Revises: 0003
Create Date: 2024-06-08 00:00:00.000000
"""

from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op

from app.models.content import ContentChangeRequestStatus

# revision identifiers, used by Alembic.
revision: str = "0004"
down_revision: str = "0003"
branch_labels: Sequence[str] | None = None
depends_on: Sequence[str] | None = None


def upgrade() -> None:
    op.create_table(
        'content_change_requests',
        sa.Column('id', sa.Integer(), primary_key=True),
        sa.Column('content_id', sa.Integer(), sa.ForeignKey('content_items.id', ondelete='CASCADE'), nullable=False),
        sa.Column('base_version_id', sa.Integer(), sa.ForeignKey('content_versions.id', ondelete='CASCADE'), nullable=False),
        sa.Column('proposed_by_id', sa.Integer(), sa.ForeignKey('users.id', ondelete='SET NULL'), nullable=True),
        sa.Column('resolved_by_id', sa.Integer(), sa.ForeignKey('users.id', ondelete='SET NULL'), nullable=True),
        sa.Column('status', sa.Enum(ContentChangeRequestStatus, name='contentchangerequeststatus'), nullable=False, server_default=ContentChangeRequestStatus.pending.value),
        sa.Column('summary', sa.String(length=255), nullable=False),
        sa.Column('comment', sa.Text(), nullable=True),
        sa.Column('proposed_changes', sa.JSON(), nullable=False),
        sa.Column('decision_notes', sa.Text(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.Column('resolved_at', sa.DateTime(timezone=True), nullable=True),
    )
    op.create_index(
        'ix_content_change_requests_content_id',
        'content_change_requests',
        ['content_id'],
    )
    op.create_index(
        'ix_content_change_requests_status',
        'content_change_requests',
        ['status'],
    )


def downgrade() -> None:
    op.drop_index('ix_content_change_requests_status', table_name='content_change_requests')
    op.drop_index('ix_content_change_requests_content_id', table_name='content_change_requests')
    op.drop_table('content_change_requests')
    op.execute("DROP TYPE IF EXISTS contentchangerequeststatus")
