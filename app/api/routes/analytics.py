from __future__ import annotations

from fastapi import APIRouter, Depends, status
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps.auth import require_roles
from app.db.session import get_session
from app.models.analytics import AnalyticsEvent
from app.schemas.analytics import AnalyticsEventCreate, AnalyticsEventRead

router = APIRouter(prefix="/analytics", tags=["analytics"])


@router.post(
    "/events",
    response_model=AnalyticsEventRead,
    status_code=status.HTTP_201_CREATED,
)
async def create_event(payload: AnalyticsEventCreate, session: AsyncSession = Depends(get_session)) -> AnalyticsEvent:
    event = AnalyticsEvent(**payload.model_dump())
    session.add(event)
    await session.commit()
    await session.refresh(event)
    return event


@router.get(
    "/summary",
    dependencies=[Depends(require_roles("editor", "admin"))],
)
async def analytics_summary(session: AsyncSession = Depends(get_session)) -> dict:
    total_views = await session.scalar(
        select(func.count()).select_from(AnalyticsEvent).where(AnalyticsEvent.event_type == "page_view")
    )
    event_counts = (await session.execute(select(AnalyticsEvent.event_type, func.count()).group_by(AnalyticsEvent.event_type))).all()
    return {
        "total_page_views": total_views or 0,
        "events": {event_type: count for event_type, count in event_counts},
    }
