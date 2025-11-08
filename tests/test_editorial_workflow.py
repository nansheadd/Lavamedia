from __future__ import annotations

import pytest
from sqlalchemy import select

from app.models.content import ContentChangeRequestStatus, ContentVersion
from app.services.content import ContentService
from app.services.editorial import EditorialWorkflowService


def test_change_request_approval_creates_new_version(event_loop, session_factory) -> None:
    async def scenario() -> None:
        async with session_factory() as session:
            content_service = ContentService(session)
            content = await content_service.create_content(
                type='article',
                title='Édito IA',
                slug='edito-ia',
                body='Corps initial',
                created_by=None,
            )
            base_version_id = content.versions[-1].id
            await session.commit()
            await session.refresh(content)

            editorial_service = EditorialWorkflowService(session)
            change = await editorial_service.create_change_request(
                content_id=content.id,
                base_version_id=base_version_id,
                summary='Affinement du texte',
                proposed_changes={
                    'body': 'Nouvelle version avec notes',
                    'diff': {
                        'chapeau': 'Synthèse IA 2024',
                        'footnotes': [{'content': 'Source : étude Lavamedia'}],
                        'callouts': [{'title': 'Repère', 'body': '72% des rédactions utilisent l’IA.'}]
                    }
                },
                comment='Pour validation finale',
                proposed_by_id=None,
            )
            await session.commit()
            assert change.status == ContentChangeRequestStatus.pending

            approved = await editorial_service.decide_change_request(
                content_id=content.id,
                change_id=change.id,
                status=ContentChangeRequestStatus.approved,
                resolver_id=None,
                notes='OK pour publication',
            )
            await session.commit()
            assert approved.status == ContentChangeRequestStatus.approved
            latest_version = await session.scalar(
                select(ContentVersion)
                .where(ContentVersion.content_id == content.id)
                .order_by(ContentVersion.version_number.desc())
            )
            assert latest_version is not None
            assert latest_version.body == 'Nouvelle version avec notes'
            assert latest_version.diff['footnotes'][0]['content'] == 'Source : étude Lavamedia'

            docx = await editorial_service.export_content_as_docx(content.id)
            assert docx[:2] == b'PK'

    event_loop.run_until_complete(scenario())


def test_change_request_invalid_base_version(event_loop, session_factory) -> None:
    async def scenario() -> None:
        async with session_factory() as session:
            content_service = ContentService(session)
            content = await content_service.create_content(
                type='article',
                title='Analyse',
                slug='analyse',
                body='Brouillon',
                created_by=None,
            )
            await session.flush()
            await session.commit()

            editorial_service = EditorialWorkflowService(session)
            with pytest.raises(ValueError):
                await editorial_service.create_change_request(
                    content_id=content.id,
                    base_version_id=999,
                    summary='Tentative invalide',
                    proposed_changes={'body': 'Invalide'},
                    comment=None,
                    proposed_by_id=None,
                )

    event_loop.run_until_complete(scenario())
