from __future__ import annotations

from datetime import datetime

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from fastapi import Depends

from app.db.session import get_session
from app.models.analytics import AnalyticsEvent, Dashboard


class AnalyticsService:
    def __init__(self, session: AsyncSession) -> None:
        self.session = session

    async def log_event(
        self,
        *,
        event_type: str,
        user_id: int | None = None,
        session_id: str | None = None,
        payload: dict | None = None,
        occurred_at: datetime | None = None,
    ) -> AnalyticsEvent:
        event = AnalyticsEvent(
            user_id=user_id,
            session_id=session_id,
            event_type=event_type,
            payload=payload,
            occurred_at=occurred_at or datetime.utcnow(),
        )
        self.session.add(event)
        await self.session.flush()
        return event

    async def list_events(self, *, limit: int = 200) -> list[AnalyticsEvent]:
        stmt = select(AnalyticsEvent).order_by(AnalyticsEvent.occurred_at.desc()).limit(limit)
        return list((await self.session.scalars(stmt)).all())

    async def list_dashboards(self) -> list[Dashboard]:
        return list((await self.session.scalars(select(Dashboard))).all())


async def get_analytics_service(session: AsyncSession = Depends(get_session)) -> AnalyticsService:
    return AnalyticsService(session)
