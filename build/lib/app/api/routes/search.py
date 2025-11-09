from __future__ import annotations

from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_session
from app.models.content import ContentItem
from app.schemas.content import ContentRead
from app.services.content import ContentService
from app.services.search import SearchService

router = APIRouter(tags=["search"])


def _content_to_schema(item: ContentItem) -> ContentRead:
    return ContentRead.model_validate(item, from_attributes=True)


@router.get("/search", response_model=list[ContentRead])
async def search_content(query: str, session: AsyncSession = Depends(get_session)) -> list[ContentRead]:
    search_service = SearchService()
    service = ContentService(session)
    options = service._default_options()
    results = await search_service.search_articles(query)
    if results:
        ids = [result.get("id") for result in results if result.get("id")]
        if ids:
            stmt = select(ContentItem).where(ContentItem.id.in_(ids)).options(*options)
            items = (await session.scalars(stmt)).all()
            return [_content_to_schema(item) for item in items]
    stmt = select(ContentItem).where(ContentItem.title.ilike(f"%{query}%")).options(*options)
    items = (await session.scalars(stmt)).all()
    return [_content_to_schema(item) for item in items]
