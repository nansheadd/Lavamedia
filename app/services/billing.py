from __future__ import annotations

import json
from datetime import datetime, timezone
from typing import Any, Literal, cast

import anyio
import stripe
from fastapi import Depends
from sqlalchemy import Select, exists, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.core.config import settings
from app.db.session import get_session
from app.models.billing import PayWhatYouWantIntent, Subscription
from app.models.user import Role, User

PlanSlug = Literal["classic", "digital", "supporter", "pay_what_you_want"]
BillingInterval = Literal["monthly", "annual"]

ACTIVE_STATUSES = {"active", "trialing"}
PROBLEM_STATUSES = {"past_due", "unpaid", "incomplete", "incomplete_expired"}

PLAN_PRICE_FIELDS: dict[tuple[PlanSlug, BillingInterval], str] = {
    ("classic", "monthly"): "stripe_price_classic_monthly",
    ("classic", "annual"): "stripe_price_classic_annual",
    ("digital", "monthly"): "stripe_price_digital_monthly",
    ("digital", "annual"): "stripe_price_digital_annual",
    ("supporter", "monthly"): "stripe_price_supporter_monthly",
    ("supporter", "annual"): "stripe_price_supporter_annual",
}


class BillingConfigurationError(RuntimeError):
    """Raised when billing is not properly configured."""


class BillingService:
    """Service helpers around Stripe billing."""

    def __init__(self, session: AsyncSession) -> None:
        self.session = session
        self._role_cache: dict[str, Role | None] = {}
        if settings.stripe_api_key:
            stripe.api_key = settings.stripe_api_key

    async def create_checkout_session(
        self,
        *,
        user: User | None,
        plan_slug: PlanSlug,
        interval: BillingInterval,
        success_url: str,
        cancel_url: str,
        custom_amount_cents: int | None = None,
        paywall_intent: PayWhatYouWantIntent | None = None,
        customer_email: str | None = None,
    ) -> stripe.checkout.Session:
        self._ensure_stripe_is_configured()
        if plan_slug == "pay_what_you_want" and not (user or paywall_intent or customer_email):
            raise BillingConfigurationError(
                "Une adresse e-mail est requise pour lancer un soutien Pay What You Want."
            )
        if plan_slug != "pay_what_you_want" and custom_amount_cents is not None:
            raise BillingConfigurationError(
                "Le montant personnalisé n'est disponible que pour Pay What You Want."
            )

        customer_id = None
        if user:
            customer_id = await self._ensure_customer(user)

        metadata: dict[str, str] = {"plan_slug": plan_slug, "interval": interval}
        if user:
            metadata["user_id"] = str(user.id)
        if paywall_intent:
            metadata["paywall_intent_id"] = str(paywall_intent.id)
            metadata["lead_email"] = paywall_intent.email
        elif customer_email:
            metadata["lead_email"] = customer_email

        line_item = self._build_line_item(plan_slug, interval, custom_amount_cents)
        try:
            session = await anyio.to_thread.run_sync(
                lambda: stripe.checkout.Session.create(
                    mode="subscription",
                    customer=customer_id,
                    customer_email=None
                    if customer_id
                    else (paywall_intent.email if paywall_intent else customer_email),
                    success_url=success_url,
                    cancel_url=cancel_url,
                    billing_address_collection="required",
                    allow_promotion_codes=True,
                    subscription_data={"metadata": metadata},
                    metadata=metadata,
                    line_items=[line_item],
                )
            )
        except stripe.error.StripeError as exc:
            raise BillingConfigurationError(str(exc.user_message or exc)) from exc

        return session

    async def create_paywall_checkout_session(
        self,
        *,
        intent: PayWhatYouWantIntent,
        amount_cents: int,
        interval: BillingInterval,
        success_url: str,
        cancel_url: str,
    ) -> stripe.checkout.Session:
        return await self.create_checkout_session(
            user=None,
            plan_slug="pay_what_you_want",
            interval=interval,
            success_url=success_url,
            cancel_url=cancel_url,
            custom_amount_cents=amount_cents,
            paywall_intent=intent,
        )

    async def list_subscriptions(self) -> list[Subscription]:
        stmt: Select[tuple[Subscription]] = (
            select(Subscription)
            .options(selectinload(Subscription.user).selectinload(User.roles))
            .order_by(Subscription.created_at.desc())
        )
        results = await self.session.scalars(stmt)
        return list(results.all())

    async def get_active_subscription_for_user(self, user_id: int) -> Subscription | None:
        stmt = (
            select(Subscription)
            .options(selectinload(Subscription.user))
            .where(
                Subscription.user_id == user_id,
                Subscription.status.in_(ACTIVE_STATUSES),
            )
            .order_by(Subscription.updated_at.desc())
        )
        return await self.session.scalar(stmt)

    async def handle_checkout_session_completed(self, payload: dict[str, Any]) -> None:
        subscription_obj = payload.get("subscription")
        if isinstance(subscription_obj, dict):
            await self.sync_subscription_from_event(subscription_obj)
            return
        if isinstance(subscription_obj, str):
            subscription = await self._retrieve_subscription(subscription_obj)
            if subscription:
                await self.sync_subscription_from_event(subscription)

    async def handle_subscription_event(self, payload: dict[str, Any]) -> None:
        await self.sync_subscription_from_event(payload)

    async def sync_subscription_from_event(self, payload: dict[str, Any]) -> Subscription | None:
        """Create or update a local subscription based on a Stripe event payload."""

        subscription_data = await self._normalize_subscription_payload(payload)
        if not subscription_data:
            return None

        stripe_subscription_id = subscription_data["id"]
        user = await self._resolve_user(payload=subscription_data)
        if not user and subscription_data["plan_slug"] != "pay_what_you_want":
            return None

        subscription_stmt = (
            select(Subscription)
            .options(selectinload(Subscription.user).selectinload(User.roles))
            .where(Subscription.stripe_subscription_id == stripe_subscription_id)
        )
        subscription = await self.session.scalar(subscription_stmt)
        if not subscription:
            subscription = Subscription(
                user_id=user.id if user else None,
                stripe_subscription_id=stripe_subscription_id,
                plan_slug=subscription_data["plan_slug"],
                interval=subscription_data["interval"],
                status=subscription_data["status"],
            )
            if user:
                subscription.user = user

        subscription.plan_slug = subscription_data["plan_slug"]
        subscription.interval = subscription_data["interval"]
        subscription.status = subscription_data["status"]
        subscription.amount_cents = subscription_data.get("amount_cents")
        subscription.currency = subscription_data.get("currency") or subscription.currency
        subscription.stripe_price_id = subscription_data.get("stripe_price_id")
        subscription.stripe_customer_id = subscription_data.get("stripe_customer_id")
        subscription.latest_invoice_id = subscription_data.get("latest_invoice_id")
        subscription.cancel_at_period_end = subscription_data.get("cancel_at_period_end", False)
        subscription.last_payment_error = subscription.last_payment_error if subscription.status in PROBLEM_STATUSES else None
        subscription.lead_email = subscription_data.get("lead_email") or subscription.lead_email
        subscription.paywall_intent_id = subscription_data.get("paywall_intent_id")

        subscription.current_period_end = subscription_data.get("current_period_end")

        self.session.add(subscription)
        await self.session.flush()
        if user:
            await self._refresh_user_subscription_role(user)
        await self._sync_paywall_intent(subscription, subscription_data)
        return subscription

    async def handle_invoice_payment_failed(self, payload: dict[str, Any]) -> None:
        subscription_id = payload.get("subscription")
        if not subscription_id:
            return
        subscription_stmt = (
            select(Subscription)
            .options(selectinload(Subscription.user).selectinload(User.roles))
            .where(Subscription.stripe_subscription_id == subscription_id)
        )
        subscription = await self.session.scalar(subscription_stmt)
        if not subscription:
            return
        message = self._extract_payment_error(payload)
        subscription.last_payment_error = message
        subscription.status = "past_due"
        subscription.latest_invoice_id = payload.get("id") or subscription.latest_invoice_id
        self.session.add(subscription)
        if subscription.user:
            await self._refresh_user_subscription_role(subscription.user)

    async def handle_invoice_payment_succeeded(self, payload: dict[str, Any]) -> None:
        subscription_id = payload.get("subscription")
        if not subscription_id:
            return
        subscription_stmt = (
            select(Subscription)
            .options(selectinload(Subscription.user).selectinload(User.roles))
            .where(Subscription.stripe_subscription_id == subscription_id)
        )
        subscription = await self.session.scalar(subscription_stmt)
        if not subscription:
            return
        subscription.last_payment_error = None
        subscription.latest_invoice_id = payload.get("id") or subscription.latest_invoice_id
        self.session.add(subscription)
        if subscription.user:
            await self._refresh_user_subscription_role(subscription.user)

    async def construct_event(self, payload: bytes, signature: str | None) -> stripe.Event:
        self._ensure_stripe_is_configured()
        body = payload.decode()
        if settings.stripe_webhook_secret:
            if not signature:
                raise BillingConfigurationError("Signature Stripe manquante.")
            try:
                return stripe.Webhook.construct_event(body, signature, settings.stripe_webhook_secret)
            except stripe.error.SignatureVerificationError as exc:
                raise BillingConfigurationError("Signature Stripe invalide.") from exc
        data = json.loads(body)
        return stripe.Event.construct_from(data, stripe.api_key)  # type: ignore[arg-type]

    def _resolve_price_id(self, plan_slug: PlanSlug, interval: BillingInterval) -> str | None:
        field = PLAN_PRICE_FIELDS.get((plan_slug, interval))
        if not field:
            return None
        return getattr(settings, field, None)

    def _build_line_item(
        self,
        plan_slug: PlanSlug,
        interval: BillingInterval,
        custom_amount_cents: int | None,
    ) -> dict[str, Any]:
        if plan_slug == "pay_what_you_want":
            product_id = settings.stripe_pay_what_you_want_product_id
            if not product_id:
                raise BillingConfigurationError(
                    "Aucun produit Stripe configuré pour Pay What You Want."
                )
            if not custom_amount_cents or custom_amount_cents < 100:
                raise BillingConfigurationError("Le montant minimum est de 1 €.")
            return {
                "price_data": {
                    "currency": "eur",
                    "product": product_id,
                    "recurring": {"interval": interval},
                    "unit_amount": custom_amount_cents,
                },
                "quantity": 1,
            }
        price_id = self._resolve_price_id(plan_slug, interval)
        if not price_id:
            raise BillingConfigurationError("Aucun prix Stripe configuré pour cette formule.")
        return {"price": price_id, "quantity": 1}

    def _ensure_stripe_is_configured(self) -> None:
        if not settings.stripe_api_key:
            raise BillingConfigurationError("Stripe n'est pas configuré.")

    async def _ensure_customer(self, user: User) -> str:
        if user.stripe_customer_id:
            return user.stripe_customer_id

        customer = await anyio.to_thread.run_sync(
            lambda: stripe.Customer.create(
                email=user.email,
                name=user.full_name or user.email,
            )
        )
        user.stripe_customer_id = customer["id"]
        self.session.add(user)
        await self.session.flush()
        return user.stripe_customer_id  # type: ignore[return-value]

    async def _normalize_subscription_payload(self, payload: dict[str, Any]) -> dict[str, Any] | None:
        subscription_id = payload.get("id")
        if not subscription_id:
            return None

        metadata = payload.get("metadata") or {}
        plan_slug = metadata.get("plan_slug") or "classic"
        interval = "annual"
        amount_cents: int | None = None
        currency: str | None = None
        price_id: str | None = None
        items = payload.get("items")

        if isinstance(items, dict):
            data = items.get("data") or []
            if data:
                price = data[0].get("price") if isinstance(data[0], dict) else None
                if isinstance(price, dict):
                    price_id = price.get("id")
                    currency = price.get("currency", "eur")
                    amount_cents = price.get("unit_amount")
                    recurring = price.get("recurring")
                    if isinstance(recurring, dict):
                        interval = recurring.get("interval", interval)

        interval_metadata = metadata.get("interval")
        if isinstance(interval_metadata, str):
            interval = interval_metadata

        current_period_end = payload.get("current_period_end")
        current_period_end_dt = (
            datetime.fromtimestamp(current_period_end, tz=timezone.utc) if current_period_end else None
        )

        latest_invoice = payload.get("latest_invoice")
        latest_invoice_id = None
        if isinstance(latest_invoice, dict):
            latest_invoice_id = latest_invoice.get("id")
        elif isinstance(latest_invoice, str):
            latest_invoice_id = latest_invoice

        paywall_intent_id = metadata.get("paywall_intent_id")
        lead_email = metadata.get("lead_email")

        return {
            "id": subscription_id,
            "plan_slug": plan_slug,
            "interval": interval,
            "status": payload.get("status", "incomplete"),
            "amount_cents": amount_cents,
            "currency": currency,
            "current_period_end": current_period_end_dt,
            "stripe_price_id": price_id,
            "stripe_customer_id": payload.get("customer"),
            "latest_invoice_id": latest_invoice_id,
            "cancel_at_period_end": payload.get("cancel_at_period_end", False),
            "paywall_intent_id": paywall_intent_id,
            "lead_email": lead_email,
            "metadata": metadata,
        }

    async def _resolve_user(self, payload: dict[str, Any]) -> User | None:
        metadata = payload.get("metadata") or {}
        user_id = metadata.get("user_id")
        customer_id = payload.get("customer")
        stmt = select(User).options(selectinload(User.roles))

        if user_id:
            try:
                user_id_int = int(user_id)
            except (TypeError, ValueError):
                user_id_int = None
            if user_id_int:
                user = await self.session.scalar(stmt.where(User.id == user_id_int))
                if user:
                    return user

        lead_email = metadata.get("lead_email")
        if lead_email:
            user = await self.session.scalar(
                stmt.where(User.email == str(lead_email).strip().lower())
            )
            if user:
                return user

        if customer_id:
            user = await self.session.scalar(stmt.where(User.stripe_customer_id == customer_id))
            if user:
                return user
        return None

    async def _refresh_user_subscription_role(self, user: User) -> None:
        subscriber_role = await self._get_role("subscriber")
        patron_role = await self._get_role("patron")
        if not subscriber_role:
            return

        assigned_roles = {role.id for role in user.roles}

        active_stmt = select(
            exists().where(
                Subscription.user_id == user.id,
                Subscription.status.in_(ACTIVE_STATUSES),
            )
        )
        active = await self.session.scalar(active_stmt)

        paywall_stmt = select(
            exists().where(
                Subscription.user_id == user.id,
                Subscription.status.in_(ACTIVE_STATUSES),
                Subscription.plan_slug == "pay_what_you_want",
            )
        )
        is_paywall_supporter = await self.session.scalar(paywall_stmt)

        if active and subscriber_role.id not in assigned_roles:
            user.roles.append(subscriber_role)
        elif not active and subscriber_role.id in assigned_roles:
            user.roles = [role for role in user.roles if role.id != subscriber_role.id]

        if patron_role:
            assigned_roles = {role.id for role in user.roles}
            if is_paywall_supporter and patron_role.id not in assigned_roles:
                user.roles.append(patron_role)
            elif not is_paywall_supporter and patron_role.id in assigned_roles:
                user.roles = [role for role in user.roles if role.id != patron_role.id]

        self.session.add(user)

    async def _retrieve_subscription(self, subscription_id: str) -> dict[str, Any] | None:
        try:
            subscription = await anyio.to_thread.run_sync(
                lambda: stripe.Subscription.retrieve(
                    subscription_id,
                    expand=["latest_invoice.payment_intent", "items.data.price"],
                )
            )
        except stripe.error.StripeError:
            return None
        if hasattr(subscription, "to_dict_recursive"):
            return cast(dict[str, Any], subscription.to_dict_recursive())
        return cast(dict[str, Any], subscription)

    async def _get_role(self, name: str) -> Role | None:
        if name in self._role_cache:
            return self._role_cache[name]
        role = await self.session.scalar(select(Role).where(Role.name == name))
        self._role_cache[name] = role
        return role

    def _extract_payment_error(self, payload: dict[str, Any]) -> str:
        payment_intent = payload.get("payment_intent")
        if isinstance(payment_intent, dict):
            last_error = payment_intent.get("last_payment_error")
            if isinstance(last_error, dict):
                message = last_error.get("message")
                if isinstance(message, str):
                    return message
        last_error = payload.get("last_payment_error")
        if isinstance(last_error, dict):
            message = last_error.get("message")
            if isinstance(message, str):
                return message
        return "Paiement refusé. Merci de mettre à jour votre moyen de paiement."

    async def _sync_paywall_intent(
        self,
        subscription: Subscription,
        payload: dict[str, Any],
    ) -> None:
        intent_id = subscription.paywall_intent_id or payload.get("paywall_intent_id")
        if not intent_id:
            return
        try:
            intent_id_int = int(intent_id)
        except (TypeError, ValueError):
            return
        intent = await self.session.get(PayWhatYouWantIntent, intent_id_int)
        if not intent:
            return
        subscription.paywall_intent = intent
        intent.subscription = subscription
        intent.last_checkout_amount_cents = subscription.amount_cents or intent.last_checkout_amount_cents
        intent.checkout_started_at = intent.checkout_started_at or subscription.created_at
        self.session.add(intent)


async def get_billing_service(session: AsyncSession = Depends(get_session)) -> BillingService:
    return BillingService(session)
