from __future__ import annotations

from datetime import datetime

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from fastapi import Depends

from app.db.session import get_session
from app.models.content import (
    ContentCategory,
    ContentItem,
    ContentMedia,
    ContentVersion,
    ContentWorkflowState,
)


class ContentService:
    def __init__(self, session: AsyncSession) -> None:
        self.session = session

    def _default_options(self):
        return (
            selectinload(ContentItem.versions),
            selectinload(ContentItem.categories),
            selectinload(ContentItem.media_links).selectinload(ContentMedia.media),
        )

    async def list_content(self) -> list[ContentItem]:
        stmt = select(ContentItem).options(*self._default_options())
        return list((await self.session.scalars(stmt)).all())

    async def get_content(self, content_id: int) -> ContentItem | None:
        return await self.session.get(ContentItem, content_id, options=self._default_options())

    async def get_content_by_slug(self, slug: str) -> ContentItem | None:
        stmt = (
            select(ContentItem)
            .where(ContentItem.slug == slug)
            .options(*self._default_options())
        )
        return await self.session.scalar(stmt)

    async def create_content(
        self,
        *,
        type: str,
        title: str,
        slug: str,
        body: str,
        created_by: int | None,
        status: str = "draft",
        workflow_state: ContentWorkflowState = ContentWorkflowState.draft,
        category_ids: list[int] | None = None,
        media_links: list[tuple[int, str | None]] | None = None,
    ) -> ContentItem:
        item = ContentItem(
            type=type,
            title=title,
            slug=slug,
            status=status,
            workflow_state=workflow_state,
            created_by=created_by,
            updated_by=created_by,
        )
        version = ContentVersion(content=item, version_number=1, body=body)
        item.versions.append(version)
        if category_ids:
            categories = list(
                (await self.session.scalars(select(ContentCategory).where(ContentCategory.id.in_(category_ids)))).all()
            )
            item.categories = categories
        if media_links:
            item.media_links = [
                ContentMedia(media_id=media_id, role=role)
                for media_id, role in media_links
            ]
        self.session.add(item)
        await self.session.flush()
        return item

    async def update_content(
        self,
        item: ContentItem,
        *,
        title: str | None = None,
        slug: str | None = None,
        status: str | None = None,
        workflow_state: ContentWorkflowState | None = None,
        updated_by: int | None = None,
        category_ids: list[int] | None = None,
        media_links: list[tuple[int, str | None]] | None = None,
        new_body: str | None = None,
        diff: dict | None = None,
    ) -> ContentItem:
        if title is not None:
            item.title = title
        if slug is not None:
            item.slug = slug
        if status is not None:
            item.status = status
        if workflow_state is not None:
            item.workflow_state = workflow_state
        if updated_by is not None:
            item.updated_by = updated_by
        item.updated_at = datetime.utcnow()

        if category_ids is not None:
            categories = list(
                (await self.session.scalars(select(ContentCategory).where(ContentCategory.id.in_(category_ids)))).all()
            )
            item.categories = categories
        if media_links is not None:
            item.media_links = [
                ContentMedia(media_id=media_id, role=role)
                for media_id, role in media_links
            ]
        if new_body is not None:
            version_number = (item.versions[-1].version_number + 1) if item.versions else 1
            version = ContentVersion(
                content=item,
                version_number=version_number,
                body=new_body,
                diff=diff,
            )
            item.versions.append(version)
        self.session.add(item)
        await self.session.flush()
        return item

    async def publish_content(self, item: ContentItem, *, published_by: int | None = None) -> ContentItem:
        item.status = "published"
        item.workflow_state = ContentWorkflowState.published
        item.published_at = datetime.utcnow()
        item.updated_by = published_by
        self.session.add(item)
        await self.session.flush()
        return item


async def get_content_service(session: AsyncSession = Depends(get_session)) -> ContentService:
    return ContentService(session)
