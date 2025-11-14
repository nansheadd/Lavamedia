from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, Request, status

from app.api.deps.auth import get_current_user, require_roles
from app.models.user import User
from app.schemas.billing import (
    AdminSubscriptionsResponse,
    CheckoutSessionRequest,
    CheckoutSessionResponse,
    SubscriptionStatusResponse,
)
from app.services.billing import (
    ACTIVE_STATUSES,
    BillingConfigurationError,
    PROBLEM_STATUSES,
    BillingService,
    get_billing_service,
)

router = APIRouter(tags=["billing"])


@router.post("/billing/checkout", response_model=CheckoutSessionResponse)
async def create_checkout_session(
    payload: CheckoutSessionRequest,
    current_user: User = Depends(get_current_user),
    billing_service: BillingService = Depends(get_billing_service),
) -> CheckoutSessionResponse:
    try:
        session = await billing_service.create_checkout_session(
            user=current_user,
            plan_slug=payload.plan,
            interval=payload.interval,
            success_url=str(payload.success_url),
            cancel_url=str(payload.cancel_url),
        )
    except BillingConfigurationError as exc:
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail=str(exc)) from exc
    await billing_service.session.commit()
    return CheckoutSessionResponse(checkout_url=session.url)  # type: ignore[arg-type]


@router.get("/billing/me", response_model=SubscriptionStatusResponse)
async def get_subscription_status(
    current_user: User = Depends(get_current_user),
    billing_service: BillingService = Depends(get_billing_service),
) -> SubscriptionStatusResponse:
    subscription = await billing_service.get_active_subscription_for_user(current_user.id)
    if not subscription:
        return SubscriptionStatusResponse(has_active_subscription=False)
    return SubscriptionStatusResponse(
        has_active_subscription=True,
        status=subscription.status,
        plan_slug=subscription.plan_slug,
        interval=subscription.interval,
        renewal_date=subscription.current_period_end,
        last_payment_error=subscription.last_payment_error,
    )


@router.get(
    "/billing/admin/subscriptions",
    response_model=AdminSubscriptionsResponse,
    dependencies=[Depends(require_roles("admin"))],
)
async def list_subscriptions(
    billing_service: BillingService = Depends(get_billing_service),
) -> AdminSubscriptionsResponse:
    subscriptions = await billing_service.list_subscriptions()
    stats = {
        "total": len(subscriptions),
        "active": sum(1 for sub in subscriptions if sub.status in ACTIVE_STATUSES),
        "past_due": sum(1 for sub in subscriptions if sub.status == "past_due"),
        "canceling": sum(
            1
            for sub in subscriptions
            if sub.cancel_at_period_end and sub.status in ACTIVE_STATUSES
        ),
        "issues": sum(
            1
            for sub in subscriptions
            if sub.status in PROBLEM_STATUSES or sub.last_payment_error
        ),
    }
    return AdminSubscriptionsResponse(stats=stats, items=subscriptions)  # type: ignore[arg-type]


@router.post("/billing/webhook", include_in_schema=False)
async def stripe_webhook(
    request: Request,
    billing_service: BillingService = Depends(get_billing_service),
) -> dict[str, bool]:
    payload = await request.body()
    signature = request.headers.get("stripe-signature")
    try:
        event = await billing_service.construct_event(payload, signature)
    except BillingConfigurationError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)) from exc

    event_type = event["type"]
    stripe_object = event["data"]["object"]
    if hasattr(stripe_object, "to_dict_recursive"):
        data_object = stripe_object.to_dict_recursive()
    else:
        data_object = stripe_object

    if event_type == "checkout.session.completed":
        await billing_service.handle_checkout_session_completed(data_object)
    elif event_type in {"customer.subscription.created", "customer.subscription.updated", "customer.subscription.deleted"}:
        await billing_service.handle_subscription_event(data_object)
    elif event_type == "invoice.payment_failed":
        await billing_service.handle_invoice_payment_failed(data_object)
    elif event_type == "invoice.payment_succeeded":
        await billing_service.handle_invoice_payment_succeeded(data_object)

    await billing_service.session.commit()
    return {"received": True}
