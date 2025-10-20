from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps.auth import get_current_user, require_roles
from app.db.session import get_session
from app.models.content import Article, ArticleStatus, ArticleWorkflowState, MediaAsset, Section, Tag
from app.models.user import User, UserRole
from app.schemas.content import (
    ArticleCreate,
    ArticleRead,
    ArticleStatusCreate,
    ArticleStatusRead,
    ArticleUpdate,
    ArticleWorkflowUpdate,
    MediaAssetCreate,
    MediaAssetRead,
    SectionCreate,
    SectionRead,
    TagCreate,
    TagRead,
)
from app.services.search import SearchService, get_search_service

router = APIRouter(prefix="/content", tags=["content"])


async def _ensure_tags(session: AsyncSession, tag_ids: list[int]) -> list[Tag]:
    if not tag_ids:
        return []
    tags = list((await session.scalars(select(Tag).where(Tag.id.in_(tag_ids)))).all())
    if len(tags) != len(set(tag_ids)):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Tag not found")
    return tags


@router.post("/sections", response_model=SectionRead, status_code=status.HTTP_201_CREATED, dependencies=[Depends(require_roles("editor", "admin"))])
async def create_section(payload: SectionCreate, session: AsyncSession = Depends(get_session)) -> Section:
    section = Section(**payload.model_dump())
    session.add(section)
    await session.commit()
    await session.refresh(section)
    return section


@router.get("/sections", response_model=list[SectionRead])
async def list_sections(session: AsyncSession = Depends(get_session)) -> list[Section]:
    sections = (await session.scalars(select(Section))).all()
    return list(sections)


@router.post("/tags", response_model=TagRead, status_code=status.HTTP_201_CREATED, dependencies=[Depends(require_roles("editor", "admin"))])
async def create_tag(payload: TagCreate, session: AsyncSession = Depends(get_session)) -> Tag:
    tag = Tag(**payload.model_dump())
    session.add(tag)
    await session.commit()
    await session.refresh(tag)
    return tag


@router.get("/tags", response_model=list[TagRead])
async def list_tags(session: AsyncSession = Depends(get_session)) -> list[Tag]:
    return list((await session.scalars(select(Tag))).all())


@router.post("/statuses", response_model=ArticleStatusRead, status_code=status.HTTP_201_CREATED, dependencies=[Depends(require_roles("editor", "admin"))])
async def create_status(payload: ArticleStatusCreate, session: AsyncSession = Depends(get_session)) -> ArticleStatus:
    status_obj = ArticleStatus(**payload.model_dump())
    session.add(status_obj)
    await session.commit()
    await session.refresh(status_obj)
    return status_obj


@router.get("/statuses", response_model=list[ArticleStatusRead])
async def list_statuses(session: AsyncSession = Depends(get_session)) -> list[ArticleStatus]:
    return list((await session.scalars(select(ArticleStatus))).all())


@router.post(
    "/media",
    response_model=MediaAssetRead,
    status_code=status.HTTP_201_CREATED,
    dependencies=[Depends(require_roles("author", "editor", "admin"))],
)
async def upload_media(payload: MediaAssetCreate, session: AsyncSession = Depends(get_session)) -> MediaAsset:
    media = MediaAsset(**payload.model_dump())
    session.add(media)
    await session.commit()
    await session.refresh(media)
    return media


@router.get("/media", response_model=list[MediaAssetRead])
async def list_media(session: AsyncSession = Depends(get_session)) -> list[MediaAsset]:
    return list((await session.scalars(select(MediaAsset))).all())


@router.post(
    "/articles",
    response_model=ArticleRead,
    status_code=status.HTTP_201_CREATED,
    dependencies=[Depends(require_roles("author", "editor", "admin"))],
)
async def create_article(
    payload: ArticleCreate,
    session: AsyncSession = Depends(get_session),
    current_user: User = Depends(get_current_user),
    search_service: SearchService = Depends(get_search_service),
) -> Article:
    tags = await _ensure_tags(session, payload.tag_ids)
    article = Article(
        title=payload.title,
        slug=payload.slug,
        content=payload.content,
        excerpt=payload.excerpt,
        section_id=payload.section_id,
        hero_media_id=payload.hero_media_id,
        status_id=payload.status_id,
        author_id=current_user.id,
    )
    article.tags = tags
    session.add(article)
    await session.commit()
    await session.refresh(article)
    if article.workflow_state == ArticleWorkflowState.published:
        await search_service.index_article({"id": article.id, "title": article.title, "content": article.content})
    return article


@router.get("/articles", response_model=list[ArticleRead])
async def list_articles(
    session: AsyncSession = Depends(get_session),
    workflow_state: ArticleWorkflowState | None = Query(default=None),
) -> list[Article]:
    stmt = select(Article)
    if workflow_state:
        stmt = stmt.where(Article.workflow_state == workflow_state)
    return list((await session.scalars(stmt)).all())


@router.get("/articles/{article_id}", response_model=ArticleRead)
async def get_article(article_id: int, session: AsyncSession = Depends(get_session)) -> Article:
    article = await session.get(Article, article_id)
    if not article:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Article not found")
    return article


@router.put(
    "/articles/{article_id}",
    response_model=ArticleRead,
    dependencies=[Depends(require_roles("author", "editor", "admin"))],
)
async def update_article(
    article_id: int,
    payload: ArticleUpdate,
    session: AsyncSession = Depends(get_session),
    current_user: User = Depends(get_current_user),
    search_service: SearchService = Depends(get_search_service),
) -> Article:
    article = await session.get(Article, article_id)
    if not article:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Article not found")
    if current_user.role not in {UserRole.editor, UserRole.admin} and not current_user.is_superuser:
        if article.author_id != current_user.id:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Cannot modify another author's article")
    update_data = payload.model_dump(exclude_unset=True)
    tag_ids = update_data.pop("tag_ids", None)
    if tag_ids is not None:
        article.tags = await _ensure_tags(session, tag_ids)
    for field, value in update_data.items():
        setattr(article, field, value)
    session.add(article)
    await session.commit()
    await session.refresh(article)
    if article.workflow_state == ArticleWorkflowState.published:
        await search_service.index_article({"id": article.id, "title": article.title, "content": article.content})
    return article


@router.post(
    "/articles/{article_id}/workflow",
    response_model=ArticleRead,
    dependencies=[Depends(require_roles("reviewer", "editor", "admin"))],
)
async def update_workflow_state(
    article_id: int,
    payload: ArticleWorkflowUpdate,
    session: AsyncSession = Depends(get_session),
    search_service: SearchService = Depends(get_search_service),
) -> Article:
    article = await session.get(Article, article_id)
    if not article:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Article not found")
    valid_transitions = {
        ArticleWorkflowState.draft: {ArticleWorkflowState.review},
        ArticleWorkflowState.review: {ArticleWorkflowState.published, ArticleWorkflowState.draft},
        ArticleWorkflowState.published: {ArticleWorkflowState.archived},
        ArticleWorkflowState.archived: set(),
    }
    workflow_state = payload.workflow_state
    if workflow_state not in valid_transitions[article.workflow_state]:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid workflow transition")
    article.workflow_state = workflow_state
    session.add(article)
    await session.commit()
    await session.refresh(article)
    if workflow_state == ArticleWorkflowState.published:
        await search_service.index_article({"id": article.id, "title": article.title, "content": article.content})
    elif workflow_state == ArticleWorkflowState.archived:
        await search_service.remove_articles([article.id])
    return article


@router.delete(
    "/articles/{article_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    dependencies=[Depends(require_roles("editor", "admin"))],
)
async def delete_article(
    article_id: int,
    session: AsyncSession = Depends(get_session),
    search_service: SearchService = Depends(get_search_service),
) -> None:
    article = await session.get(Article, article_id)
    if not article:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Article not found")
    await session.delete(article)
    await session.commit()
    await search_service.remove_articles([article_id])


@router.get("/search", response_model=list[ArticleRead])
async def search_articles(
    query: str,
    session: AsyncSession = Depends(get_session),
    search_service: SearchService = Depends(get_search_service),
) -> list[Article]:
    results = await search_service.search_articles(query)
    if not results:
        stmt = select(Article).where(Article.title.ilike(f"%{query}%"))
        return list((await session.scalars(stmt)).all())
    ids = [item.get("id") for item in results if item.get("id")]
    if not ids:
        return []
    stmt = select(Article).where(Article.id.in_(ids))
    return list((await session.scalars(stmt)).all())
