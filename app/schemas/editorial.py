from __future__ import annotations

from datetime import datetime

from pydantic import ConfigDict, Field

from app.models.content import ContentChangeRequestStatus
from app.schemas.base import ORMBaseModel, StrictBaseModel


class ContentChangeRequestCreate(StrictBaseModel):
    base_version_id: int
    summary: str = Field(..., max_length=255)
    proposed_changes: dict
    comment: str | None = Field(default=None, max_length=2000)


class ContentChangeRequestDecision(StrictBaseModel):
    status: ContentChangeRequestStatus
    notes: str | None = Field(default=None, max_length=2000)


class ContentChangeRequestRead(ORMBaseModel):
    id: int
    content_id: int
    base_version_id: int
    proposed_by_id: int | None = None
    resolved_by_id: int | None = None
    status: ContentChangeRequestStatus
    summary: str
    comment: str | None = None
    proposed_changes: dict
    decision_notes: str | None = None
    created_at: datetime
    resolved_at: datetime | None = None

    model_config = ConfigDict(from_attributes=True)


__all__ = [
    "ContentChangeRequestCreate",
    "ContentChangeRequestDecision",
    "ContentChangeRequestRead",
]
