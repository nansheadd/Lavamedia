from __future__ import annotations

from datetime import datetime

from pydantic import BaseModel

from app.models.content import ArticleWorkflowState


class SectionBase(BaseModel):
    name: str
    description: str | None = None


class SectionCreate(SectionBase):
    pass


class SectionRead(SectionBase):
    id: int

    class Config:
        from_attributes = True


class TagBase(BaseModel):
    name: str


class TagCreate(TagBase):
    pass


class TagRead(TagBase):
    id: int

    class Config:
        from_attributes = True


class ArticleBase(BaseModel):
    title: str
    slug: str
    content: str
    excerpt: str | None = None
    section_id: int | None = None
    hero_media_id: int | None = None
    tag_ids: list[int] = []


class ArticleCreate(ArticleBase):
    status_id: int | None = None


class ArticleUpdate(BaseModel):
    title: str | None = None
    slug: str | None = None
    content: str | None = None
    excerpt: str | None = None
    section_id: int | None = None
    hero_media_id: int | None = None
    status_id: int | None = None
    workflow_state: ArticleWorkflowState | None = None
    tag_ids: list[int] | None = None


class ArticleRead(ArticleBase):
    id: int
    workflow_state: ArticleWorkflowState
    status_id: int | None
    author_id: int | None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class MediaAssetBase(BaseModel):
    url: str
    media_type: str
    description: str | None = None
    metadata: str | None = None


class MediaAssetCreate(MediaAssetBase):
    pass


class MediaAssetRead(MediaAssetBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True


class ArticleStatusBase(BaseModel):
    name: str
    workflow_state: ArticleWorkflowState


class ArticleStatusCreate(ArticleStatusBase):
    pass


class ArticleStatusRead(ArticleStatusBase):
    id: int

    class Config:
        from_attributes = True
