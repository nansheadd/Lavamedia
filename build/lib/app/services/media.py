from __future__ import annotations

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from fastapi import Depends

from app.db.session import get_session
from app.models.media import MediaAsset, MediaVariant


class MediaService:
    def __init__(self, session: AsyncSession) -> None:
        self.session = session

    async def list_media(self) -> list[MediaAsset]:
        stmt = select(MediaAsset).options(selectinload(MediaAsset.variants))
        return list((await self.session.scalars(stmt)).all())

    async def get_asset(self, asset_id: int) -> MediaAsset | None:
        return await self.session.get(MediaAsset, asset_id, options=(selectinload(MediaAsset.variants),))

    async def create_asset(
        self,
        *,
        type: str,
        filename: str,
        storage_url: str,
        checksum: str | None = None,
        width: int | None = None,
        height: int | None = None,
        duration: float | None = None,
        metadata: dict | None = None,
        uploaded_by: int | None = None,
    ) -> MediaAsset:
        asset = MediaAsset(
            type=type,
            filename=filename,
            storage_url=storage_url,
            checksum=checksum,
            width=width,
            height=height,
            duration=duration,
            _metadata=metadata,
            uploaded_by=uploaded_by,
        )
        self.session.add(asset)
        await self.session.flush()
        return asset

    async def delete_asset(self, asset: MediaAsset) -> None:
        await self.session.delete(asset)
        await self.session.flush()

    async def create_variant(
        self,
        asset: MediaAsset,
        *,
        format: str,
        url: str,
        width: int | None = None,
        height: int | None = None,
        bitrate: int | None = None,
    ) -> MediaVariant:
        variant = MediaVariant(
            media=asset,
            format=format,
            url=url,
            width=width,
            height=height,
            bitrate=bitrate,
        )
        self.session.add(variant)
        await self.session.flush()
        return variant


async def get_media_service(session: AsyncSession = Depends(get_session)) -> MediaService:
    return MediaService(session)
