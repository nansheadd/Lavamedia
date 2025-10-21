from __future__ import annotations

import enum
from datetime import datetime
from typing import TYPE_CHECKING, Optional

from sqlalchemy import (
    Column,
    DateTime,
    Enum,
    ForeignKey,
    Integer,
    String,
    Table,
    Text,
    UniqueConstraint,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.types import JSON

from app.db.session import Base

if TYPE_CHECKING:  # pragma: no cover - only used for type checking
    from app.models.media import MediaAsset
    from app.models.user import User


content_category_links = Table(
    "content_category_links",
    Base.metadata,
    Column("content_id", ForeignKey("content_items.id", ondelete="CASCADE"), primary_key=True),
    Column("category_id", ForeignKey("content_categories.id", ondelete="CASCADE"), primary_key=True),
    UniqueConstraint("content_id", "category_id", name="uq_content_category_links_content_id_category_id"),
)


class ContentWorkflowState(str, enum.Enum):
    draft = "draft"
    review = "review"
    published = "published"
    archived = "archived"


class ContentItem(Base):
    __tablename__ = "content_items"
    __table_args__ = (UniqueConstraint("slug", name="uq_content_items_slug"),)

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    type: Mapped[str] = mapped_column(String(50), nullable=False)
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    slug: Mapped[str] = mapped_column(String(255), nullable=False, index=True)
    status: Mapped[str] = mapped_column(String(50), default="draft", nullable=False)
    published_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    created_by: Mapped[int | None] = mapped_column(ForeignKey("users.id", ondelete="SET NULL"))
    updated_by: Mapped[int | None] = mapped_column(ForeignKey("users.id", ondelete="SET NULL"))
    workflow_state: Mapped[ContentWorkflowState] = mapped_column(
        Enum(ContentWorkflowState), default=ContentWorkflowState.draft, nullable=False
    )
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.utcnow, nullable=False)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False
    )

    versions: Mapped[list["ContentVersion"]] = relationship(
        back_populates="content", cascade="all, delete-orphan", order_by="ContentVersion.version_number"
    )
    categories: Mapped[list["ContentCategory"]] = relationship(
        secondary=content_category_links, back_populates="content_items"
    )
    media_links: Mapped[list["ContentMedia"]] = relationship(
        back_populates="content", cascade="all, delete-orphan"
    )


class ContentVersion(Base):
    __tablename__ = "content_versions"
    __table_args__ = (
        UniqueConstraint(
            "content_id", "version_number", name="uq_content_versions_content_id_version_number"
        ),
    )

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    content_id: Mapped[int] = mapped_column(ForeignKey("content_items.id", ondelete="CASCADE"), nullable=False)
    version_number: Mapped[int] = mapped_column(Integer, nullable=False)
    body: Mapped[str] = mapped_column(Text, nullable=False)
    diff: Mapped[dict | None] = mapped_column(JSON, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.utcnow, nullable=False)

    content: Mapped[ContentItem] = relationship(back_populates="versions")


class ContentCategory(Base):
    __tablename__ = "content_categories"
    __table_args__ = (UniqueConstraint("slug", name="uq_content_categories_slug"),)

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    slug: Mapped[str] = mapped_column(String(150), nullable=False, index=True)
    parent_id: Mapped[int | None] = mapped_column(ForeignKey("content_categories.id", ondelete="SET NULL"))

    parent: Mapped[Optional["ContentCategory"]] = relationship(remote_side="ContentCategory.id", backref="children")
    content_items: Mapped[list[ContentItem]] = relationship(
        secondary=content_category_links, back_populates="categories"
    )


class ContentMedia(Base):
    __tablename__ = "content_media"
    __table_args__ = (
        UniqueConstraint("content_id", "media_id", "role", name="uq_content_media_content_id_media_id_role"),
    )

    content_id: Mapped[int] = mapped_column(
        ForeignKey("content_items.id", ondelete="CASCADE"), primary_key=True
    )
    media_id: Mapped[int] = mapped_column(
        ForeignKey("media_assets.id", ondelete="CASCADE"), primary_key=True
    )
    role: Mapped[str | None] = mapped_column(String(50))

    content: Mapped[ContentItem] = relationship(back_populates="media_links")
    media: Mapped["MediaAsset"] = relationship(back_populates="content_links")
