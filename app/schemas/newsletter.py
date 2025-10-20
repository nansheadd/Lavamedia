from __future__ import annotations

from datetime import datetime

from pydantic import BaseModel, EmailStr


class NewsletterSubscriptionCreate(BaseModel):
    email: EmailStr
    source: str | None = None


class NewsletterSubscriptionRead(NewsletterSubscriptionCreate):
    id: int
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True
