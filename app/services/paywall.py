from __future__ import annotations

from datetime import datetime
from typing import Any, Literal

from fastapi import Depends
from sqlalchemy import Select, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.db.session import get_session
from app.models.billing import PayWhatYouWantConfig, PayWhatYouWantIntent, Subscription
from app.services.billing import ACTIVE_STATUSES

PaywallScope = Literal["article", "newsletter"]


def _normalize_slug(value: str) -> str:
    slug = value.strip().lower()
    if not slug:
        raise ValueError("Le slug est obligatoire.")
    return slug


def _normalize_scope(value: str) -> PaywallScope:
    normalized = value.strip().lower()
    if normalized not in {"article", "newsletter"}:
        raise ValueError("Scope paywall invalide.")
    return normalized  # type: ignore[return-value]


class PayWhatYouWantService:
    """Data helpers for pay-what-you-want settings and intents."""

    def __init__(self, session: AsyncSession) -> None:
        self.session = session

    async def get_or_create_config(self, scope: str, slug: str) -> PayWhatYouWantConfig:
        normalized_scope = _normalize_scope(scope)
        normalized_slug = _normalize_slug(slug)
        stmt: Select[tuple[PayWhatYouWantConfig]] = select(PayWhatYouWantConfig).where(
            PayWhatYouWantConfig.scope == normalized_scope,
            PayWhatYouWantConfig.slug == normalized_slug,
        )
        config = await self.session.scalar(stmt)
        if config:
            return config
        config = PayWhatYouWantConfig(scope=normalized_scope, slug=normalized_slug)
        self.session.add(config)
        await self.session.flush()
        return config

    async def list_configs(self) -> list[PayWhatYouWantConfig]:
        stmt: Select[tuple[PayWhatYouWantConfig]] = select(PayWhatYouWantConfig).order_by(
            PayWhatYouWantConfig.scope.asc(), PayWhatYouWantConfig.slug.asc()
        )
        results = await self.session.scalars(stmt)
        return list(results.all())

    async def update_config(
        self,
        config: PayWhatYouWantConfig,
        payload: dict[str, Any],
    ) -> PayWhatYouWantConfig:
        for field, value in payload.items():
            if value is None and field in {"label", "disable_datawall_until", "suggested_amounts"}:
                setattr(config, field, None)
                continue
            if hasattr(config, field) and value is not None:
                setattr(config, field, value)
        self.session.add(config)
        await self.session.flush()
        return config

    async def get_intent(self, intent_id: int) -> PayWhatYouWantIntent | None:
        stmt: Select[tuple[PayWhatYouWantIntent]] = select(PayWhatYouWantIntent).where(
            PayWhatYouWantIntent.id == intent_id
        )
        return await self.session.scalar(stmt)

    async def create_intent(
        self,
        *,
        scope: str,
        slug: str,
        email: str,
        preferred_amount_cents: int,
    ) -> PayWhatYouWantIntent:
        normalized_scope = _normalize_scope(scope)
        normalized_slug = _normalize_slug(slug)
        intent = PayWhatYouWantIntent(
            scope=normalized_scope,
            slug=normalized_slug,
            email=email.strip().lower(),
            preferred_amount_cents=preferred_amount_cents,
        )
        self.session.add(intent)
        await self.session.flush()
        return intent

    async def record_checkout(
        self,
        intent: PayWhatYouWantIntent,
        *,
        amount_cents: int,
        started_at: datetime,
    ) -> None:
        intent.last_checkout_amount_cents = amount_cents
        intent.checkout_started_at = started_at
        self.session.add(intent)

    async def attach_subscription(
        self,
        intent_id: int,
        subscription: Subscription,
    ) -> None:
        intent = await self.get_intent(intent_id)
        if not intent:
            return
        intent.subscription = subscription
        intent.last_checkout_amount_cents = subscription.amount_cents or intent.last_checkout_amount_cents
        intent.checkout_started_at = intent.checkout_started_at or subscription.created_at
        self.session.add(intent)

    async def list_intents(self, limit: int = 50) -> list[PayWhatYouWantIntent]:
        stmt: Select[tuple[PayWhatYouWantIntent]] = (
            select(PayWhatYouWantIntent)
            .order_by(PayWhatYouWantIntent.created_at.desc())
            .limit(limit)
        )
        results = await self.session.scalars(stmt)
        return list(results.all())

    async def get_dashboard(self) -> dict[str, Any]:
        configs = await self.list_configs()
        intents = await self.list_intents(limit=100)
        subscriptions_stmt: Select[tuple[Subscription]] = (
            select(Subscription)
            .options(selectinload(Subscription.user))
            .where(Subscription.plan_slug == "pay_what_you_want")
            .order_by(Subscription.created_at.desc())
        )
        subscriptions_result = await self.session.scalars(subscriptions_stmt)
        subscriptions = list(subscriptions_result.all())
        supporters = sum(1 for sub in subscriptions if sub.status in ACTIVE_STATUSES)
        monthly_amount = sum(
            sub.amount_cents or 0 for sub in subscriptions if sub.interval == "monthly"
        )
        annual_amount = sum(
            sub.amount_cents or 0 for sub in subscriptions if sub.interval == "annual"
        )
        return {
            "configs": configs,
            "intents": intents,
            "subscriptions": subscriptions,
            "stats": {
                "supporters": supporters,
                "total_amount_cents": sum(sub.amount_cents or 0 for sub in subscriptions),
                "monthly_amount_cents": monthly_amount,
                "annual_amount_cents": annual_amount,
                "leads": len(intents),
            },
        }


def get_paywall_service(session: AsyncSession = Depends(get_session)) -> PayWhatYouWantService:
    return PayWhatYouWantService(session)
