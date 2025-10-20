from __future__ import annotations

from datetime import datetime

from pydantic import ConfigDict

from app.schemas.base import StrictBaseModel


class AnalyticsEventCreate(StrictBaseModel):
    article_id: int | None = None
    event_type: str
    metadata: dict | None = None


class AnalyticsEventRead(AnalyticsEventCreate):
    id: int
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
