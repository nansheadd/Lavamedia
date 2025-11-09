from __future__ import annotations

from datetime import datetime

from pydantic import AliasChoices, ConfigDict, Field

from app.schemas.base import ORMBaseModel, StrictBaseModel


class MediaVariantCreate(StrictBaseModel):
    format: str
    url: str
    width: int | None = None
    height: int | None = None
    bitrate: int | None = None


class MediaVariantRead(MediaVariantCreate, ORMBaseModel):
    id: int
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class MediaAssetBase(StrictBaseModel):
    type: str
    filename: str
    storage_url: str
    checksum: str | None = None
    width: int | None = None
    height: int | None = None
    duration: float | None = None
    metadata: dict | None = Field(
        default=None,
        validation_alias=AliasChoices("metadata", "_metadata"),
        serialization_alias="metadata",
    )


class MediaAssetCreate(MediaAssetBase):
    uploaded_by: int | None = None
    variants: list[MediaVariantCreate] = []


class MediaAssetRead(MediaAssetBase, ORMBaseModel):
    id: int
    uploaded_by: int | None = None
    created_at: datetime
    updated_at: datetime
    variants: list[MediaVariantRead] = []

    model_config = ConfigDict(from_attributes=True)
