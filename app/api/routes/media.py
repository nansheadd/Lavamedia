from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps.auth import require_roles
from app.db.session import get_session
from app.schemas.media import MediaAssetCreate, MediaAssetRead
from app.services.media import MediaService

router = APIRouter(tags=["media"])


def _asset_to_schema(asset) -> MediaAssetRead:
    return MediaAssetRead.model_validate(asset, from_attributes=True)


@router.get("/media", response_model=list[MediaAssetRead], dependencies=[Depends(require_roles("author", "editor", "admin"))])
async def list_media(session: AsyncSession = Depends(get_session)) -> list[MediaAssetRead]:
    service = MediaService(session)
    assets = await service.list_media()
    return [_asset_to_schema(asset) for asset in assets]


@router.post(
    "/media/upload",
    response_model=MediaAssetRead,
    status_code=status.HTTP_201_CREATED,
    dependencies=[Depends(require_roles("author", "editor", "admin"))],
)
async def upload_media(
    payload: MediaAssetCreate,
    session: AsyncSession = Depends(get_session),
) -> MediaAssetRead:
    service = MediaService(session)
    asset = await service.create_asset(
        type=payload.type,
        filename=payload.filename,
        storage_url=payload.storage_url,
        checksum=payload.checksum,
        width=payload.width,
        height=payload.height,
        duration=payload.duration,
        metadata=payload.metadata,
        uploaded_by=payload.uploaded_by,
    )
    for variant_payload in payload.variants:
        await service.create_variant(
            asset,
            format=variant_payload.format,
            url=variant_payload.url,
            width=variant_payload.width,
            height=variant_payload.height,
            bitrate=variant_payload.bitrate,
        )
    await session.commit()
    await session.refresh(asset)
    return _asset_to_schema(asset)


@router.get(
    "/media/{media_id}",
    response_model=MediaAssetRead,
    dependencies=[Depends(require_roles("author", "editor", "admin"))],
)
async def get_media(media_id: int, session: AsyncSession = Depends(get_session)) -> MediaAssetRead:
    service = MediaService(session)
    asset = await service.get_asset(media_id)
    if not asset:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Media not found")
    return _asset_to_schema(asset)


@router.delete(
    "/media/{media_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    dependencies=[Depends(require_roles("editor", "admin"))],
)
async def delete_media(media_id: int, session: AsyncSession = Depends(get_session)) -> None:
    service = MediaService(session)
    asset = await service.get_asset(media_id)
    if not asset:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Media not found")
    await service.delete_asset(asset)
    await session.commit()
