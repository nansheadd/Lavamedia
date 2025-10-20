from __future__ import annotations

from datetime import datetime

from pydantic import BaseModel


class AnalyticsEventCreate(BaseModel):
    article_id: int | None = None
    event_type: str
    metadata: dict | None = None


class AnalyticsEventRead(AnalyticsEventCreate):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True
