from __future__ import annotations

from datetime import datetime

from pydantic import ConfigDict, Field

from app.models.content import ContentWorkflowState
from app.schemas.base import ORMBaseModel, StrictBaseModel


class ContentMediaLink(StrictBaseModel):
    media_id: int
    role: str | None = None


class ContentVersionRead(ORMBaseModel):
    id: int
    version_number: int
    body: str
    diff: dict | None = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class ContentCategoryBase(StrictBaseModel):
    name: str
    slug: str
    parent_id: int | None = None


class ContentCategoryCreate(ContentCategoryBase):
    pass


class ContentCategoryRead(ContentCategoryBase, ORMBaseModel):
    id: int

    model_config = ConfigDict(from_attributes=True)


class ContentBase(StrictBaseModel):
    type: str
    title: str
    slug: str
    status: str = "draft"
    workflow_state: ContentWorkflowState = ContentWorkflowState.draft
    category_ids: list[int] = Field(default_factory=list)
    media_links: list[ContentMediaLink] = Field(default_factory=list)


class ContentCreate(ContentBase):
    body: str


class ContentUpdate(StrictBaseModel):
    title: str | None = None
    slug: str | None = None
    status: str | None = None
    workflow_state: ContentWorkflowState | None = None
    category_ids: list[int] | None = None
    media_links: list[ContentMediaLink] | None = None
    body: str | None = None
    diff: dict | None = None


class ContentRead(ContentBase, ORMBaseModel):
    id: int
    published_at: datetime | None = None
    created_at: datetime
    updated_at: datetime
    created_by: int | None = None
    updated_by: int | None = None
    versions: list[ContentVersionRead] = Field(default_factory=list)

    model_config = ConfigDict(from_attributes=True)


class ContentPublish(StrictBaseModel):
    publish: bool = True
