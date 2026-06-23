"""Initial schema - users and text_processes tables

Revision ID: 001
Revises:
Create Date: 2026-06-23
"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import UUID
import uuid


revision: str = "001"
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "users",
        sa.Column("id", UUID(as_uuid=True), primary_key=True, default=uuid.uuid4),
        sa.Column("email", sa.String(255), unique=True, nullable=False, index=True),
        sa.Column("username", sa.String(100), unique=True, nullable=False, index=True),
        sa.Column("hashed_password", sa.String(255), nullable=False),
        sa.Column("is_active", sa.Boolean(), default=True, nullable=False),
        sa.Column("is_superuser", sa.Boolean(), default=False, nullable=False),
        sa.Column("role", sa.String(50), default="user", nullable=False),
        sa.Column("api_key", sa.String(255), unique=True, nullable=True, index=True),
        sa.Column("last_login_at", sa.DateTime(), nullable=True),
        sa.Column("created_at", sa.DateTime(), default=sa.func.now(), nullable=False, index=True),
        sa.Column("updated_at", sa.DateTime(), default=sa.func.now(), onupdate=sa.func.now(), nullable=False),
        sa.Column("is_deleted", sa.Boolean(), default=False, index=True),
    )

    op.create_table(
        "text_processes",
        sa.Column("id", UUID(as_uuid=True), primary_key=True, default=uuid.uuid4),
        sa.Column("user_id", UUID(as_uuid=True), sa.ForeignKey("users.id"), nullable=True, index=True),
        sa.Column("input_text", sa.Text(), nullable=False),
        sa.Column("cleaned_text", sa.Text(), nullable=True),
        sa.Column("language", sa.String(50), nullable=False, index=True),
        sa.Column("detected_language", sa.String(50), nullable=True),
        sa.Column("detection_confidence", sa.String(10), nullable=True),
        sa.Column("processing_type", sa.String(50), nullable=False, index=True),
        sa.Column("token_count", sa.String(10), nullable=True),
        sa.Column("execution_time_ms", sa.String(10), nullable=True),
        sa.Column("created_at", sa.DateTime(), default=sa.func.now(), nullable=False, index=True),
        sa.Column("updated_at", sa.DateTime(), default=sa.func.now(), onupdate=sa.func.now(), nullable=False),
        sa.Column("is_deleted", sa.Boolean(), default=False, index=True),
    )


def downgrade() -> None:
    op.drop_table("text_processes")
    op.drop_table("users")
