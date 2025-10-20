from __future__ import annotations

from datetime import datetime

from pydantic import ConfigDict, Field

from app.models.content import ArticleWorkflowState
from app.schemas.base import ORMBaseModel, StrictBaseModel


class SectionBase(StrictBaseModel):
    name: str
    description: str | None = None


class SectionCreate(SectionBase):
    pass


class SectionRead(SectionBase, ORMBaseModel):
    id: int

    model_config = ConfigDict(from_attributes=True)


class TagBase(StrictBaseModel):
    name: str


class TagCreate(TagBase):
    pass


class TagRead(TagBase, ORMBaseModel):
    id: int

    model_config = ConfigDict(from_attributes=True)


class ArticleBase(StrictBaseModel):
    title: str
    slug: str
    content: str
    excerpt: str | None = None
    section_id: int | None = None
    hero_media_id: int | None = None
    tag_ids: list[int] = Field(default_factory=list)


class ArticleCreate(ArticleBase):
    status_id: int | None = None


class ArticleUpdate(StrictBaseModel):
    title: str | None = None
    slug: str | None = None
    content: str | None = None
    excerpt: str | None = None
    section_id: int | None = None
    hero_media_id: int | None = None
    status_id: int | None = None
    workflow_state: ArticleWorkflowState | None = None
    tag_ids: list[int] | None = None


class ArticleRead(ArticleBase, ORMBaseModel):
    id: int
    workflow_state: ArticleWorkflowState
    status_id: int | None
    author_id: int | None
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class MediaAssetBase(StrictBaseModel):
    url: str
    media_type: str
    description: str | None = None
    metadata: str | None = None


class MediaAssetCreate(MediaAssetBase):
    pass


class MediaAssetRead(MediaAssetBase, ORMBaseModel):
    id: int
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class ArticleStatusBase(StrictBaseModel):
    name: str
    workflow_state: ArticleWorkflowState


class ArticleStatusCreate(ArticleStatusBase):
    pass


class ArticleStatusRead(ArticleStatusBase, ORMBaseModel):
    id: int

    model_config = ConfigDict(from_attributes=True)
