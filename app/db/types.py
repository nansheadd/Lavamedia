"""Custom SQLAlchemy column types shared across the application."""

from sqlalchemy import JSON, Text
from sqlalchemy.dialects.postgresql import JSONB

JSONType = JSON().with_variant(JSONB(astext_type=Text()), "postgresql")

__all__ = ["JSONType"]
