from __future__ import annotations

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from fastapi import Depends

from app.db.session import get_session
from app.models.notification import Webhook


class NotificationService:
    def __init__(self, session: AsyncSession) -> None:
        self.session = session

    async def list_webhooks(self) -> list[Webhook]:
        return list((await self.session.scalars(select(Webhook))).all())

    async def create_webhook(
        self,
        *,
        name: str,
        target_url: str,
        secret: str | None = None,
        status: str = "active",
    ) -> Webhook:
        webhook = Webhook(name=name, target_url=target_url, secret=secret, status=status)
        self.session.add(webhook)
        await self.session.flush()
        return webhook

    async def update_status(self, webhook: Webhook, *, status: str) -> Webhook:
        webhook.status = status
        self.session.add(webhook)
        await self.session.flush()
        return webhook

    async def delete_webhook(self, webhook: Webhook) -> None:
        await self.session.delete(webhook)
        await self.session.flush()


async def get_notification_service(session: AsyncSession = Depends(get_session)) -> NotificationService:
    return NotificationService(session)
