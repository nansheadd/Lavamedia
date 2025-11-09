from __future__ import annotations

from datetime import datetime

from pydantic import ConfigDict

from app.schemas.base import ORMBaseModel, StrictBaseModel


class WebhookCreate(StrictBaseModel):
    name: str
    target_url: str
    secret: str | None = None
    status: str = "active"


class WebhookUpdate(StrictBaseModel):
    status: str


class WebhookRead(ORMBaseModel):
    id: int
    name: str
    target_url: str
    secret: str | None = None
    status: str
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
