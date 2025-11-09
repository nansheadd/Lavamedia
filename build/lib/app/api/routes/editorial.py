from __future__ import annotations

from fastapi import APIRouter, Depends, File, HTTPException, Response, UploadFile, status

from app.api.deps.auth import get_current_user, require_roles
from app.models.user import User
from app.schemas.editorial import (
    ContentChangeRequestCreate,
    ContentChangeRequestDecision,
    ContentChangeRequestRead,
    ContentTranslationRequest,
    ContentTranslationResponse,
)
from app.services.editorial import EditorialWorkflowService, get_editorial_workflow_service

router = APIRouter(prefix="/editorial", tags=["editorial"])


def _change_to_schema(change) -> ContentChangeRequestRead:
    return ContentChangeRequestRead.model_validate(change, from_attributes=True)


@router.get(
    "/content/{content_id}/changes",
    response_model=list[ContentChangeRequestRead],
    dependencies=[Depends(require_roles("author", "editor", "admin"))],
)
async def list_change_requests(
    content_id: int,
    service: EditorialWorkflowService = Depends(get_editorial_workflow_service),
) -> list[ContentChangeRequestRead]:
    changes = await service.list_change_requests(content_id)
    return [_change_to_schema(change) for change in changes]


@router.post(
    "/content/{content_id}/changes",
    response_model=ContentChangeRequestRead,
    status_code=status.HTTP_201_CREATED,
    dependencies=[Depends(require_roles("author", "editor", "admin"))],
)
async def create_change_request(
    content_id: int,
    payload: ContentChangeRequestCreate,
    service: EditorialWorkflowService = Depends(get_editorial_workflow_service),
    current_user: User = Depends(get_current_user),
) -> ContentChangeRequestRead:
    try:
        change = await service.create_change_request(
            content_id=content_id,
            base_version_id=payload.base_version_id,
            summary=payload.summary,
            proposed_changes=payload.proposed_changes,
            comment=payload.comment,
            proposed_by_id=current_user.id if current_user else None,
        )
    except LookupError:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Content not found")
    except ValueError as exc:  # pragma: no cover - defensive
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc))
    await service.session.commit()
    await service.session.refresh(change)
    return _change_to_schema(change)


@router.post(
    "/content/{content_id}/changes/{change_id}/decision",
    response_model=ContentChangeRequestRead,
    dependencies=[Depends(require_roles("editor", "admin"))],
)
async def decide_change_request(
    content_id: int,
    change_id: int,
    payload: ContentChangeRequestDecision,
    service: EditorialWorkflowService = Depends(get_editorial_workflow_service),
    current_user: User = Depends(get_current_user),
) -> ContentChangeRequestRead:
    try:
        change = await service.decide_change_request(
            content_id=content_id,
            change_id=change_id,
            status=payload.status,
            resolver_id=current_user.id if current_user else None,
            notes=payload.notes,
        )
    except LookupError:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Change request not found")
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc))
    await service.session.commit()
    await service.session.refresh(change)
    return _change_to_schema(change)


@router.post(
    "/content/import/docx",
    dependencies=[Depends(require_roles("author", "editor", "admin"))],
)
async def import_content_docx(
    file: UploadFile = File(...),
    service: EditorialWorkflowService = Depends(get_editorial_workflow_service),
) -> dict:
    allowed_types = {
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "application/msword",
    }
    content_type = (file.content_type or "").lower()
    if content_type not in allowed_types:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Un fichier .docx est requis.")
    data = await file.read()
    if not data:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Le fichier est vide.")
    try:
        payload = service.import_docx_payload(data)
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc))
    return payload


@router.post(
    "/content/{content_id}/export/docx",
    status_code=status.HTTP_200_OK,
    dependencies=[Depends(require_roles("author", "editor", "admin"))],
)
async def export_content_docx(
    content_id: int,
    service: EditorialWorkflowService = Depends(get_editorial_workflow_service),
    current_user: User = Depends(get_current_user),
) -> Response:
    try:
        document_bytes = await service.export_content_as_docx(content_id)
    except LookupError:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Content not found")
    filename = f"content-{content_id}.docx"
    return Response(
        content=document_bytes,
        media_type="application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        headers={"Content-Disposition": f"attachment; filename=\"{filename}\""},
    )


@router.post(
    "/content/{content_id}/translate",
    response_model=ContentTranslationResponse,
    dependencies=[Depends(require_roles("author", "editor", "admin"))],
    status_code=status.HTTP_202_ACCEPTED,
)
async def translate_content(
    content_id: int,
    payload: ContentTranslationRequest,
    service: EditorialWorkflowService = Depends(get_editorial_workflow_service),
) -> ContentTranslationResponse:
    try:
        data = await service.translate_content(content_id=content_id, target_language=payload.target_language)
    except LookupError:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Content not found")
    except RuntimeError as exc:
        raise HTTPException(status_code=status.HTTP_501_NOT_IMPLEMENTED, detail=str(exc))
    return ContentTranslationResponse(**data)
