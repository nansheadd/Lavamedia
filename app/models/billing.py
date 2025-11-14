"""Stripe billing models."""

from __future__ import annotations

from datetime import datetime
from typing import Optional

from sqlalchemy import Boolean, DateTime, ForeignKey, Integer, String, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.session import Base
from app.db.types import JSONType
from app.utils.datetime import utcnow


class PayWhatYouWantConfig(Base):
    """Stores configuration for pay-what-you-want flows per scope/slug."""

    __tablename__ = "pay_what_you_want_configs"
    __table_args__ = (
        UniqueConstraint("scope", "slug", name="uq_pay_what_you_want_configs_scope_slug"),
    )

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    scope: Mapped[str] = mapped_column(String(50), nullable=False, index=True)
    slug: Mapped[str] = mapped_column(String(255), nullable=False, index=True)
    label: Mapped[str | None] = mapped_column(String(255), nullable=True)
    datawall_enabled: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    pay_what_you_want_enabled: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    disable_datawall_until: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    min_amount_cents: Mapped[int] = mapped_column(Integer, default=200, nullable=False)
    max_amount_cents: Mapped[int] = mapped_column(Integer, default=2500, nullable=False)
    default_amount_cents: Mapped[int] = mapped_column(Integer, default=500, nullable=False)
    step_amount_cents: Mapped[int] = mapped_column(Integer, default=50, nullable=False)
    suggested_amounts: Mapped[list[int] | None] = mapped_column(JSONType, nullable=True)
    created_by_id: Mapped[int | None] = mapped_column(ForeignKey("users.id", ondelete="SET NULL"))
    updated_by_id: Mapped[int | None] = mapped_column(ForeignKey("users.id", ondelete="SET NULL"))
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow, nullable=False)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=utcnow, onupdate=utcnow, nullable=False
    )

    created_by = relationship("User", foreign_keys=[created_by_id])
    updated_by = relationship("User", foreign_keys=[updated_by_id])


class PayWhatYouWantIntent(Base):
    """Represents a datawall intent collected via the pay-what-you-want flow."""

    __tablename__ = "pay_what_you_want_intents"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    scope: Mapped[str] = mapped_column(String(50), nullable=False, index=True)
    slug: Mapped[str] = mapped_column(String(255), nullable=False, index=True)
    email: Mapped[str] = mapped_column(String(255), nullable=False, index=True)
    preferred_amount_cents: Mapped[int] = mapped_column(Integer, nullable=False)
    last_checkout_amount_cents: Mapped[int | None] = mapped_column(Integer, nullable=True)
    checkout_started_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow, nullable=False)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=utcnow, onupdate=utcnow, nullable=False
    )

    subscription: Mapped[Optional["Subscription"]] = relationship(
        "Subscription", back_populates="paywall_intent", uselist=False
    )


class Subscription(Base):
    """Represents a Stripe subscription tied to a user account or paywall intent."""

    __tablename__ = "subscriptions"
    __table_args__ = (
        UniqueConstraint("stripe_subscription_id", name="uq_subscriptions_stripe_subscription_id"),
    )

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    user_id: Mapped[int | None] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"), nullable=True, index=True
    )
    plan_slug: Mapped[str] = mapped_column(String(50), nullable=False, index=True)
    interval: Mapped[str] = mapped_column(String(32), nullable=False)
    status: Mapped[str] = mapped_column(String(32), nullable=False, index=True)
    amount_cents: Mapped[int | None] = mapped_column(Integer, nullable=True)
    currency: Mapped[str] = mapped_column(String(10), default="eur", nullable=False)
    stripe_subscription_id: Mapped[str | None] = mapped_column(String(255), nullable=True)
    stripe_customer_id: Mapped[str | None] = mapped_column(String(255), nullable=True, index=True)
    stripe_price_id: Mapped[str | None] = mapped_column(String(255), nullable=True)
    current_period_end: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    cancel_at_period_end: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    last_payment_error: Mapped[str | None] = mapped_column(String(255), nullable=True)
    latest_invoice_id: Mapped[str | None] = mapped_column(String(255), nullable=True)
    lead_email: Mapped[str | None] = mapped_column(String(255), nullable=True, index=True)
    paywall_intent_id: Mapped[int | None] = mapped_column(
        ForeignKey("pay_what_you_want_intents.id", ondelete="SET NULL"), nullable=True
    )
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow, nullable=False)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=utcnow, onupdate=utcnow, nullable=False
    )

    user: Mapped[Optional["User"]] = relationship("User", back_populates="subscriptions")
    paywall_intent: Mapped[Optional["PayWhatYouWantIntent"]] = relationship(
        "PayWhatYouWantIntent", back_populates="subscription"
    )
