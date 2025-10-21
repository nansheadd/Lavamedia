from __future__ import annotations

from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps.auth import require_roles
from app.db.session import get_session
from app.schemas.analytics import AnalyticsEventCreate, AnalyticsEventRead, DashboardRead
from app.services.analytics import AnalyticsService

router = APIRouter(tags=["analytics"])


def _event_to_schema(event) -> AnalyticsEventRead:
    return AnalyticsEventRead.model_validate(event, from_attributes=True)


def _dashboard_to_schema(dashboard) -> DashboardRead:
    return DashboardRead.model_validate(dashboard, from_attributes=True)


@router.post(
    "/analytics/events",
    response_model=AnalyticsEventRead,
    status_code=status.HTTP_201_CREATED,
)
async def create_event(
    payload: AnalyticsEventCreate,
    session: AsyncSession = Depends(get_session),
) -> AnalyticsEventRead:
    service = AnalyticsService(session)
    event = await service.log_event(
        event_type=payload.event_type,
        user_id=payload.user_id,
        session_id=payload.session_id,
        payload=payload.payload,
        occurred_at=payload.occurred_at,
    )
    await session.commit()
    await session.refresh(event)
    return _event_to_schema(event)


@router.get(
    "/analytics/events",
    response_model=list[AnalyticsEventRead],
    dependencies=[Depends(require_roles("editor", "admin"))],
)
async def list_events(session: AsyncSession = Depends(get_session)) -> list[AnalyticsEventRead]:
    service = AnalyticsService(session)
    events = await service.list_events()
    return [_event_to_schema(event) for event in events]


@router.get(
    "/analytics/dashboards",
    response_model=list[DashboardRead],
    dependencies=[Depends(require_roles("editor", "admin"))],
)
async def list_dashboards(session: AsyncSession = Depends(get_session)) -> list[DashboardRead]:
    service = AnalyticsService(session)
    dashboards = await service.list_dashboards()
    return [_dashboard_to_schema(dashboard) for dashboard in dashboards]
