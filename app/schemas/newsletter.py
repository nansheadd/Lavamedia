from __future__ import annotations

from datetime import datetime

from pydantic import ConfigDict, EmailStr

from app.schemas.base import StrictBaseModel


class NewsletterSubscriptionCreate(StrictBaseModel):
    email: EmailStr
    source: str | None = None


class NewsletterSubscriptionRead(NewsletterSubscriptionCreate):
    id: int
    is_active: bool
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
