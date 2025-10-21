from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps.auth import get_current_user, require_roles
from app.db.session import get_session
from app.models.content import ContentCategory, ContentItem
from app.models.user import User
from app.schemas.content import (
    ContentCategoryCreate,
    ContentCategoryRead,
    ContentCreate,
    ContentPublish,
    ContentRead,
    ContentUpdate,
)
from app.services.content import ContentService
from app.services.seo import SEOService

router = APIRouter(tags=["content"])


def _content_to_schema(item: ContentItem) -> ContentRead:
    return ContentRead.model_validate(item, from_attributes=True)


@router.get("/content", response_model=list[ContentRead])
async def list_content(session: AsyncSession = Depends(get_session)) -> list[ContentRead]:
    service = ContentService(session)
    items = await service.list_content()
    return [_content_to_schema(item) for item in items]


@router.post(
    "/content",
    response_model=ContentRead,
    status_code=status.HTTP_201_CREATED,
    dependencies=[Depends(require_roles("author", "editor", "admin"))],
)
async def create_content(
    payload: ContentCreate,
    session: AsyncSession = Depends(get_session),
    current_user: User = Depends(get_current_user),
) -> ContentRead:
    service = ContentService(session)
    item = await service.create_content(
        type=payload.type,
        title=payload.title,
        slug=payload.slug,
        body=payload.body,
        created_by=current_user.id if current_user else None,
        status=payload.status,
        workflow_state=payload.workflow_state,
        category_ids=payload.category_ids or None,
        media_links=[(link.media_id, link.role) for link in payload.media_links],
    )
    await session.commit()
    await session.refresh(item)
    return _content_to_schema(item)


@router.get("/content/{slug}", response_model=ContentRead)
async def get_content(slug: str, session: AsyncSession = Depends(get_session)) -> ContentRead:
    service = ContentService(session)
    item = await service.get_content_by_slug(slug)
    if not item:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Content not found")
    return _content_to_schema(item)


@router.patch(
    "/content/{content_id}",
    response_model=ContentRead,
    dependencies=[Depends(require_roles("author", "editor", "admin"))],
)
async def update_content(
    content_id: int,
    payload: ContentUpdate,
    session: AsyncSession = Depends(get_session),
    current_user: User = Depends(get_current_user),
) -> ContentRead:
    service = ContentService(session)
    item = await service.get_content(content_id)
    if not item:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Content not found")
    media_links = None
    if payload.media_links is not None:
        media_links = [(link.media_id, link.role) for link in payload.media_links]
    await service.update_content(
        item,
        title=payload.title,
        slug=payload.slug,
        status=payload.status,
        workflow_state=payload.workflow_state,
        updated_by=current_user.id if current_user else None,
        category_ids=payload.category_ids,
        media_links=media_links,
        new_body=payload.body,
        diff=payload.diff,
    )
    await session.commit()
    await session.refresh(item)
    return _content_to_schema(item)


@router.post(
    "/content/{content_id}/publish",
    response_model=ContentRead,
    dependencies=[Depends(require_roles("editor", "admin"))],
)
async def publish_content(
    content_id: int,
    session: AsyncSession = Depends(get_session),
    current_user: User = Depends(get_current_user),
) -> ContentRead:
    service = ContentService(session)
    item = await service.get_content(content_id)
    if not item:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Content not found")
    await service.publish_content(item, published_by=current_user.id if current_user else None)
    seo_service = SEOService(session)
    await seo_service.recalculate_for_content(item)
    await session.commit()
    await session.refresh(item)
    return _content_to_schema(item)


@router.post(
    "/content/categories",
    response_model=ContentCategoryRead,
    status_code=status.HTTP_201_CREATED,
    dependencies=[Depends(require_roles("editor", "admin"))],
)
async def create_category(
    payload: ContentCategoryCreate,
    session: AsyncSession = Depends(get_session),
) -> ContentCategoryRead:
    category = ContentCategory(**payload.model_dump())
    session.add(category)
    await session.commit()
    await session.refresh(category)
    return ContentCategoryRead.model_validate(category, from_attributes=True)


@router.get("/content/categories", response_model=list[ContentCategoryRead])
async def list_categories(session: AsyncSession = Depends(get_session)) -> list[ContentCategoryRead]:
    result = (await session.execute(select(ContentCategory))).scalars().all()
    return [ContentCategoryRead.model_validate(category, from_attributes=True) for category in result]
