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

from app.db.session import Base
from app.db.types import JSONType
from app.utils.datetime import utcnow

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


class ContentChangeRequestStatus(str, enum.Enum):
    pending = "pending"
    approved = "approved"
    rejected = "rejected"


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
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow, nullable=False)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=utcnow, onupdate=utcnow, nullable=False
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
    change_requests: Mapped[list["ContentChangeRequest"]] = relationship(
        back_populates="content",
        cascade="all, delete-orphan",
        order_by="ContentChangeRequest.created_at",
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
    diff: Mapped[dict | None] = mapped_column(JSONType, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow, nullable=False)

    content: Mapped[ContentItem] = relationship(back_populates="versions")
    change_requests: Mapped[list["ContentChangeRequest"]] = relationship(
        back_populates="base_version",
        cascade="all, delete-orphan",
    )


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


class ContentChangeRequest(Base):
    __tablename__ = "content_change_requests"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    content_id: Mapped[int] = mapped_column(
        ForeignKey("content_items.id", ondelete="CASCADE"), nullable=False
    )
    base_version_id: Mapped[int] = mapped_column(
        ForeignKey("content_versions.id", ondelete="CASCADE"), nullable=False
    )
    proposed_by_id: Mapped[int | None] = mapped_column(
        ForeignKey("users.id", ondelete="SET NULL"), nullable=True
    )
    resolved_by_id: Mapped[int | None] = mapped_column(
        ForeignKey("users.id", ondelete="SET NULL"), nullable=True
    )
    status: Mapped[ContentChangeRequestStatus] = mapped_column(
        Enum(ContentChangeRequestStatus),
        default=ContentChangeRequestStatus.pending,
        nullable=False,
    )
    summary: Mapped[str] = mapped_column(String(255), nullable=False)
    comment: Mapped[str | None] = mapped_column(Text)
    proposed_changes: Mapped[dict] = mapped_column(JSONType, nullable=False)
    decision_notes: Mapped[str | None] = mapped_column(Text)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=utcnow, nullable=False
    )
    resolved_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))

    content: Mapped[ContentItem] = relationship(back_populates="change_requests")
    base_version: Mapped[ContentVersion] = relationship(back_populates="change_requests")
    proposed_by: Mapped[Optional["User"]] = relationship(
        "User", foreign_keys=[proposed_by_id]
    )
    resolved_by: Mapped[Optional["User"]] = relationship(
        "User", foreign_keys=[resolved_by_id]
    )
