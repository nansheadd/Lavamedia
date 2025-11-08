from __future__ import annotations

from datetime import datetime
from io import BytesIO
from zipfile import ZIP_DEFLATED, ZipFile

from fastapi import Depends
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from xml.sax.saxutils import escape

from app.db.session import get_session
from app.models.content import (
    ContentChangeRequest,
    ContentChangeRequestStatus,
    ContentItem,
    ContentVersion,
    ContentWorkflowState,
)
from app.services.content import ContentService


class EditorialWorkflowService:
    """High-level utilities orchestrating editorial workflows."""

    def __init__(self, session: AsyncSession) -> None:
        self.session = session
        self.content_service = ContentService(session)

    async def _get_content(self, content_id: int) -> ContentItem:
        content = await self.content_service.get_content(content_id)
        if not content:
            raise LookupError("Content not found")
        return content

    async def list_change_requests(self, content_id: int) -> list[ContentChangeRequest]:
        stmt = (
            select(ContentChangeRequest)
            .where(ContentChangeRequest.content_id == content_id)
            .order_by(ContentChangeRequest.created_at)
        )
        return list((await self.session.scalars(stmt)).all())

    async def create_change_request(
        self,
        *,
        content_id: int,
        base_version_id: int,
        summary: str,
        proposed_changes: dict,
        comment: str | None,
        proposed_by_id: int | None,
    ) -> ContentChangeRequest:
        content = await self._get_content(content_id)
        base_version = await self.session.get(ContentVersion, base_version_id)
        if not base_version or base_version.content_id != content.id:
            raise ValueError("Base version mismatch")
        change = ContentChangeRequest(
            content=content,
            base_version=base_version,
            summary=summary,
            comment=comment,
            proposed_changes=proposed_changes,
            proposed_by_id=proposed_by_id,
        )
        self.session.add(change)
        await self.session.flush()
        return change

    async def decide_change_request(
        self,
        *,
        content_id: int,
        change_id: int,
        status: ContentChangeRequestStatus,
        resolver_id: int | None,
        notes: str | None,
    ) -> ContentChangeRequest:
        change = await self.session.get(ContentChangeRequest, change_id)
        if not change or change.content_id != content_id:
            raise LookupError("Change request not found")
        if change.status is not ContentChangeRequestStatus.pending:
            raise ValueError("Change request already resolved")
        content = await self.content_service.get_content(content_id)
        if not content:
            raise LookupError("Content not found")
        change.status = status
        change.resolved_at = datetime.utcnow()
        change.resolved_by_id = resolver_id
        change.decision_notes = notes
        if status is ContentChangeRequestStatus.approved:
            updates = change.proposed_changes or {}
            workflow_state = updates.get("workflow_state")
            if isinstance(workflow_state, str):
                try:
                    workflow_state = ContentWorkflowState(workflow_state)
                except ValueError:
                    workflow_state = None
            category_ids = updates.get("category_ids")
            media_links = updates.get("media_links")
            diff = updates.get("diff")
            await self.content_service.update_content(
                content,
                title=updates.get("title"),
                slug=updates.get("slug"),
                workflow_state=workflow_state,
                updated_by=resolver_id,
                category_ids=category_ids,
                media_links=media_links,
                new_body=updates.get("body"),
                diff=diff,
            )
        self.session.add(change)
        await self.session.flush()
        return change

    async def export_content_as_docx(self, content_id: int) -> bytes:
        content = await self._get_content(content_id)
        await self.session.refresh(content, attribute_names=["categories", "versions"])
        categories = [category.name for category in content.categories] if content.categories else []
        latest_version = content.versions[-1] if content.versions else None
        document_xml = _build_document_xml(
            title=content.title,
            workflow=content.workflow_state.value if content.workflow_state else "draft",
            published_at=content.published_at.isoformat() if content.published_at else None,
            categories=categories,
            version_body=latest_version.body if latest_version else "",
            version_diff=latest_version.diff if latest_version else {},
        )
        buffer = BytesIO()
        with ZipFile(buffer, "w", compression=ZIP_DEFLATED) as archive:
            archive.writestr("[Content_Types].xml", _CONTENT_TYPES_XML)
            archive.writestr("_rels/.rels", _ROOT_RELS_XML)
            archive.writestr("word/_rels/document.xml.rels", _DOC_RELS_XML)
            archive.writestr("word/document.xml", document_xml)
        return buffer.getvalue()


async def get_editorial_workflow_service(
    session: AsyncSession = Depends(get_session),
) -> EditorialWorkflowService:
    return EditorialWorkflowService(session)


def _paragraph(text: str) -> str:
    return f"<w:p><w:r><w:t>{escape(text)}</w:t></w:r></w:p>"


def _build_document_xml(
    *,
    title: str,
    workflow: str,
    published_at: str | None,
    categories: list[str],
    version_body: str,
    version_diff: dict | None,
) -> str:
    paragraphs: list[str] = []
    paragraphs.append(_paragraph(title))
    paragraphs.append(_paragraph(f"Statut éditorial : {workflow}"))
    if published_at:
        paragraphs.append(_paragraph(f"Publié le : {published_at}"))
    if categories:
        paragraphs.append(_paragraph(f"Rubriques : {', '.join(categories)}"))

    diff = version_diff or {}
    chapeau = diff.get("chapeau")
    if chapeau:
        paragraphs.append(_paragraph("Chapeau"))
        paragraphs.append(_paragraph(str(chapeau)))
    lead = diff.get("lead")
    if isinstance(lead, dict):
        if lead.get("imageUrl"):
            paragraphs.append(_paragraph(f"Image : {lead['imageUrl']}"))
        legend_bits = [part for part in [lead.get("caption"), lead.get("credit")] if part]
        if legend_bits:
            paragraphs.append(_paragraph(" / ".join(str(bit) for bit in legend_bits)))
    body = version_body.split("\n\n") if version_body else []
    for block in body:
        block = block.strip()
        if block:
            paragraphs.append(_paragraph(block))
    callouts = diff.get("callouts", [])
    if callouts:
        paragraphs.append(_paragraph("Encadrés"))
        for callout in callouts:
            heading = callout.get("title") or "Encadré"
            body_text = callout.get("body") or ""
            paragraphs.append(_paragraph(f"{heading} — {body_text}"))
    footnotes = diff.get("footnotes", [])
    if footnotes:
        paragraphs.append(_paragraph("Notes de bas de page"))
        for index, note in enumerate(footnotes, start=1):
            content_text = note.get("content") or ""
            paragraphs.append(_paragraph(f"[{index}] {content_text}"))

    document_body = "".join(paragraphs) or _paragraph("Document vide")
    return (
        "<?xml version=\"1.0\" encoding=\"UTF-8\" standalone=\"yes\"?>"
        "<w:document xmlns:w=\"http://schemas.openxmlformats.org/wordprocessingml/2006/main\">"
        f"<w:body>{document_body}<w:sectPr/></w:body>"
        "</w:document>"
    )


_CONTENT_TYPES_XML = """<?xml version=\"1.0\" encoding=\"UTF-8\" standalone=\"yes\"?>
<Types xmlns=\"http://schemas.openxmlformats.org/package/2006/content-types\">
  <Default Extension=\"rels\" ContentType=\"application/vnd.openxmlformats-package.relationships+xml\"/>
  <Default Extension=\"xml\" ContentType=\"application/xml\"/>
  <Override PartName=\"/word/document.xml\" ContentType=\"application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml\"/>
</Types>
"""

_ROOT_RELS_XML = """<?xml version=\"1.0\" encoding=\"UTF-8\" standalone=\"yes\"?>
<Relationships xmlns=\"http://schemas.openxmlformats.org/package/2006/relationships\">
  <Relationship Id=\"R1\" Type=\"http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument\" Target=\"word/document.xml\"/>
</Relationships>
"""

_DOC_RELS_XML = """<?xml version=\"1.0\" encoding=\"UTF-8\" standalone=\"yes\"?>
<Relationships xmlns=\"http://schemas.openxmlformats.org/package/2006/relationships\"/>
"""
