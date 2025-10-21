from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps.auth import require_roles
from app.db.session import get_session
from app.models.notification import Webhook
from app.schemas.notification import WebhookCreate, WebhookRead, WebhookUpdate
from app.services.notification import NotificationService

router = APIRouter(tags=["notifications"])


def _webhook_to_schema(webhook: Webhook) -> WebhookRead:
    return WebhookRead.model_validate(webhook, from_attributes=True)


@router.get(
    "/notifications/webhooks",
    response_model=list[WebhookRead],
    dependencies=[Depends(require_roles("editor", "admin"))],
)
async def list_webhooks(session: AsyncSession = Depends(get_session)) -> list[WebhookRead]:
    service = NotificationService(session)
    webhooks = await service.list_webhooks()
    return [_webhook_to_schema(webhook) for webhook in webhooks]


@router.post(
    "/notifications/webhooks",
    response_model=WebhookRead,
    status_code=status.HTTP_201_CREATED,
    dependencies=[Depends(require_roles("editor", "admin"))],
)
async def create_webhook(
    payload: WebhookCreate,
    session: AsyncSession = Depends(get_session),
) -> WebhookRead:
    service = NotificationService(session)
    webhook = await service.create_webhook(
        name=payload.name,
        target_url=payload.target_url,
        secret=payload.secret,
        status=payload.status,
    )
    await session.commit()
    await session.refresh(webhook)
    return _webhook_to_schema(webhook)


@router.patch(
    "/notifications/webhooks/{webhook_id}",
    response_model=WebhookRead,
    dependencies=[Depends(require_roles("editor", "admin"))],
)
async def update_webhook(
    webhook_id: int,
    payload: WebhookUpdate,
    session: AsyncSession = Depends(get_session),
) -> WebhookRead:
    service = NotificationService(session)
    webhook = await session.get(Webhook, webhook_id)
    if not webhook:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Webhook not found")
    webhook = await service.update_status(webhook, status=payload.status)
    await session.commit()
    await session.refresh(webhook)
    return _webhook_to_schema(webhook)


@router.delete(
    "/notifications/webhooks/{webhook_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    dependencies=[Depends(require_roles("editor", "admin"))],
)
async def delete_webhook(webhook_id: int, session: AsyncSession = Depends(get_session)) -> None:
    service = NotificationService(session)
    webhook = await session.get(Webhook, webhook_id)
    if not webhook:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Webhook not found")
    await service.delete_webhook(webhook)
    await session.commit()
