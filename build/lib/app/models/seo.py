from __future__ import annotations

from sqlalchemy import ForeignKey, Integer, String
from sqlalchemy.orm import Mapped, backref, mapped_column, relationship

from app.db.types import JSONType
from app.db.session import Base


class SEOMetadata(Base):
    __tablename__ = "seo_metadata"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    content_id: Mapped[int] = mapped_column(ForeignKey("content_items.id", ondelete="CASCADE"), unique=True)
    meta_title: Mapped[str | None] = mapped_column(String(255))
    meta_description: Mapped[str | None] = mapped_column(String(255))
    canonical_url: Mapped[str | None] = mapped_column(String(512))
    og_tags: Mapped[dict | None] = mapped_column(JSONType)
    schema_markup: Mapped[dict | None] = mapped_column(JSONType)

    content = relationship("ContentItem", backref=backref("seo_metadata", uselist=False))
