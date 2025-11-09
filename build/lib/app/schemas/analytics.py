from __future__ import annotations

from datetime import datetime

from pydantic import ConfigDict, Field

from app.schemas.base import ORMBaseModel, StrictBaseModel


class AnalyticsEventCreate(StrictBaseModel):
    event_type: str
    user_id: int | None = None
    session_id: str | None = None
    payload: dict | None = Field(default=None)
    occurred_at: datetime | None = None


class AnalyticsEventRead(AnalyticsEventCreate, ORMBaseModel):
    id: int

    model_config = ConfigDict(from_attributes=True)


class DashboardRead(ORMBaseModel):
    id: int
    name: str
    definition: dict
    owner_id: int | None = None
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
