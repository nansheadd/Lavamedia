from __future__ import annotations

from datetime import datetime
from typing import Literal

from pydantic import AnyHttpUrl

from app.schemas.base import ORMBaseModel, StrictBaseModel

PlanLiteral = Literal["classic", "digital", "supporter"]
IntervalLiteral = Literal["monthly", "annual"]


class CheckoutSessionRequest(StrictBaseModel):
    plan: PlanLiteral
    interval: IntervalLiteral
    success_url: AnyHttpUrl
    cancel_url: AnyHttpUrl


class CheckoutSessionResponse(StrictBaseModel):
    checkout_url: AnyHttpUrl


class SubscriptionUserRead(ORMBaseModel):
    id: int
    email: str
    full_name: str | None = None


class SubscriptionRead(ORMBaseModel):
    id: int
    user: SubscriptionUserRead
    plan_slug: str
    interval: str
    status: str
    currency: str
    amount_cents: int | None = None
    cancel_at_period_end: bool = False
    current_period_end: datetime | None = None
    last_payment_error: str | None = None
    latest_invoice_id: str | None = None
    created_at: datetime
    updated_at: datetime


class SubscriptionStats(StrictBaseModel):
    total: int
    active: int
    past_due: int
    canceling: int
    issues: int


class AdminSubscriptionsResponse(StrictBaseModel):
    stats: SubscriptionStats
    items: list[SubscriptionRead]


class SubscriptionStatusResponse(StrictBaseModel):
    has_active_subscription: bool
    status: str | None = None
    plan_slug: str | None = None
    interval: str | None = None
    renewal_date: datetime | None = None
    last_payment_error: str | None = None
