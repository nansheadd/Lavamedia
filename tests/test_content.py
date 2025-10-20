from __future__ import annotations

from fastapi.testclient import TestClient

from app.models.content import ArticleWorkflowState


def authenticate(client: TestClient, email: str, password: str, role: str) -> str:
    response = client.post(
        "/api/auth/signup",
        json={"email": email, "password": password, "role": role},
    )
    assert response.status_code == 201
    response = client.post(
        "/api/auth/login",
        json={"email": email, "password": password},
    )
    assert response.status_code == 200
    return response.json()["access_token"]


def test_article_workflow(client: TestClient) -> None:
    editor_token = authenticate(client, "editor@example.com", "password123", "editor")
    author_token = authenticate(client, "author@example.com", "password123", "author")

    response = client.post(
        "/api/content/sections",
        headers={"Authorization": f"Bearer {editor_token}"},
        json={"name": "Tech", "description": "Technology"},
    )
    assert response.status_code == 201
    section_id = response.json()["id"]

    response = client.post(
        "/api/content/tags",
        headers={"Authorization": f"Bearer {editor_token}"},
        json={"name": "fastapi"},
    )
    assert response.status_code == 201
    tag_id = response.json()["id"]

    response = client.post(
        "/api/content/articles",
        headers={"Authorization": f"Bearer {author_token}"},
        json={
            "title": "Building APIs",
            "slug": "building-apis",
            "content": "Initial draft",
            "section_id": section_id,
            "tag_ids": [tag_id],
        },
    )
    assert response.status_code == 201
    article_id = response.json()["id"]
    assert response.json()["workflow_state"] == ArticleWorkflowState.draft.value

    response = client.put(
        f"/api/content/articles/{article_id}",
        headers={"Authorization": f"Bearer {author_token}"},
        json={"content": "Updated content"},
    )
    assert response.status_code == 200

    response = client.post(
        f"/api/content/articles/{article_id}/workflow",
        headers={"Authorization": f"Bearer {editor_token}"},
        json={"workflow_state": ArticleWorkflowState.review.value},
    )
    assert response.status_code == 200

    response = client.post(
        f"/api/content/articles/{article_id}/workflow",
        headers={"Authorization": f"Bearer {editor_token}"},
        json={"workflow_state": ArticleWorkflowState.published.value},
    )
    assert response.status_code == 200
    assert response.json()["workflow_state"] == ArticleWorkflowState.published.value

    response = client.get("/api/content/search", params={"query": "Building"})
    assert response.status_code == 200
    assert len(response.json()) >= 1
