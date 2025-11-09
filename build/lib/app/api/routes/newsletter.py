from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps.auth import require_roles
from app.db.session import get_session
from app.models.newsletter import NewsletterSubscription
from app.schemas.newsletter import NewsletterSubscriptionCreate, NewsletterSubscriptionRead
from app.services.newsletter import trigger_newsletter_webhook

router = APIRouter(prefix="/newsletter", tags=["newsletter"])


@router.post("/subscribe", response_model=NewsletterSubscriptionRead, status_code=status.HTTP_201_CREATED)
async def subscribe(payload: NewsletterSubscriptionCreate, session: AsyncSession = Depends(get_session)) -> NewsletterSubscription:
    subscription = await session.scalar(select(NewsletterSubscription).where(NewsletterSubscription.email == payload.email))
    if subscription:
        if not subscription.is_active:
            subscription.is_active = True
            session.add(subscription)
            await session.commit()
            await session.refresh(subscription)
        return subscription
    subscription = NewsletterSubscription(**payload.model_dump())
    session.add(subscription)
    await session.commit()
    await session.refresh(subscription)
    await trigger_newsletter_webhook({"event": "subscribed", "email": subscription.email})
    return subscription


@router.post(
    "/unsubscribe",
    status_code=status.HTTP_200_OK,
)
async def unsubscribe(payload: NewsletterSubscriptionCreate, session: AsyncSession = Depends(get_session)) -> dict:
    subscription = await session.scalar(select(NewsletterSubscription).where(NewsletterSubscription.email == payload.email))
    if not subscription:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Subscription not found")
    subscription.is_active = False
    session.add(subscription)
    await session.commit()
    await trigger_newsletter_webhook({"event": "unsubscribed", "email": subscription.email})
    return {"message": "Unsubscribed"}


@router.get(
    "/subscribers",
    response_model=list[NewsletterSubscriptionRead],
    dependencies=[Depends(require_roles("editor", "admin"))],
)
async def list_subscribers(session: AsyncSession = Depends(get_session)) -> list[NewsletterSubscription]:
    return list((await session.scalars(select(NewsletterSubscription))).all())
