from __future__ import annotations

from datetime import datetime

from pydantic import AliasChoices, ConfigDict, Field

from app.schemas.base import StrictBaseModel


class AnalyticsEventCreate(StrictBaseModel):
    article_id: int | None = None
    event_type: str
    metadata: dict | None = Field(
        default=None,
        validation_alias=AliasChoices("metadata", "_metadata"),
        serialization_alias="metadata",
    )


class AnalyticsEventRead(AnalyticsEventCreate):
    id: int
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
