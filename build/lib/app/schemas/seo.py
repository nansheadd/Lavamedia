from __future__ import annotations

from pydantic import ConfigDict

from app.schemas.base import ORMBaseModel, StrictBaseModel


class SEOMetadataRead(ORMBaseModel):
    id: int
    content_id: int
    meta_title: str | None = None
    meta_description: str | None = None
    canonical_url: str | None = None
    og_tags: dict | None = None
    schema_markup: dict | None = None

    model_config = ConfigDict(from_attributes=True)


class SEORecalculateRequest(StrictBaseModel):
    content_id: int


class SitemapEntry(StrictBaseModel):
    slug: str
    type: str | None = None
    last_modified: str | None = None
