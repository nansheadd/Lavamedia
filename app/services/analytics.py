from __future__ import annotations

from sqlalchemy.ext.asyncio import AsyncSession

from app.models.analytics import AnalyticsEvent


class AnalyticsService:
    def __init__(self, session: AsyncSession) -> None:
        self.session = session

    async def log_event(self, *, article_id: int | None, event_type: str, metadata: dict | None = None) -> AnalyticsEvent:
        event = AnalyticsEvent(article_id=article_id, event_type=event_type, metadata=metadata)
        self.session.add(event)
        await self.session.flush()
        return event


async def get_analytics_service(session: AsyncSession) -> AnalyticsService:
    return AnalyticsService(session)
