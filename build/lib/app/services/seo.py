from __future__ import annotations

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from fastapi import Depends

from app.db.session import get_session
from app.models.content import ContentItem
from app.models.seo import SEOMetadata


class SEOService:
    def __init__(self, session: AsyncSession) -> None:
        self.session = session

    async def get_metadata(self, content_id: int) -> SEOMetadata | None:
        return await self.session.scalar(select(SEOMetadata).where(SEOMetadata.content_id == content_id))

    async def generate_sitemap(self) -> list[dict[str, str | None]]:
        stmt = select(ContentItem).where(ContentItem.status == "published")
        items = (await self.session.scalars(stmt)).all()
        sitemap: list[dict[str, str | None]] = []
        for item in items:
            sitemap.append(
                {
                    "slug": item.slug,
                    "type": item.type,
                    "last_modified": item.updated_at.isoformat() if item.updated_at else None,
                }
            )
        return sitemap

    async def recalculate_for_content(self, content: ContentItem) -> SEOMetadata:
        metadata = await self.get_metadata(content.id)
        if not metadata:
            metadata = SEOMetadata(content=content)
        metadata.meta_title = content.title[:255]
        metadata.meta_description = (content.versions[-1].body[:255] if content.versions else None)
        metadata.canonical_url = f"/content/{content.slug}"
        self.session.add(metadata)
        await self.session.flush()
        return metadata


async def get_seo_service(session: AsyncSession = Depends(get_session)) -> SEOService:
    return SEOService(session)
