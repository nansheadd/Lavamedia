from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps.auth import require_roles
from app.db.session import get_session
from app.schemas.seo import SEOMetadataRead, SEORecalculateRequest, SitemapEntry
from app.services.content import ContentService
from app.services.seo import SEOService

router = APIRouter(tags=["seo"])


@router.get("/seo/sitemaps", response_model=list[SitemapEntry])
async def get_sitemaps(session: AsyncSession = Depends(get_session)) -> list[SitemapEntry]:
    service = SEOService(session)
    sitemap = await service.generate_sitemap()
    return [SitemapEntry.model_validate(entry) for entry in sitemap]


@router.post(
    "/seo/recalculate",
    response_model=SEOMetadataRead,
    dependencies=[Depends(require_roles("editor", "admin"))],
)
async def recalculate_metadata(
    payload: SEORecalculateRequest,
    session: AsyncSession = Depends(get_session),
) -> SEOMetadataRead:
    content_service = ContentService(session)
    content = await content_service.get_content(payload.content_id)
    if not content:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Content not found")
    service = SEOService(session)
    metadata = await service.recalculate_for_content(content)
    await session.commit()
    await session.refresh(metadata)
    return SEOMetadataRead.model_validate(metadata, from_attributes=True)


@router.get(
    "/seo/{content_id}",
    response_model=SEOMetadataRead,
    dependencies=[Depends(require_roles("editor", "admin"))],
)
async def get_metadata(content_id: int, session: AsyncSession = Depends(get_session)) -> SEOMetadataRead:
    service = SEOService(session)
    metadata = await service.get_metadata(content_id)
    if not metadata:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Metadata not found")
    return SEOMetadataRead.model_validate(metadata, from_attributes=True)
