from __future__ import annotations

from fastapi.testclient import TestClient


def test_analytics_and_newsletter(client: TestClient) -> None:
    response = client.post(
        "/api/newsletter/subscribe",
        json={"email": "subscriber@example.com", "source": "landing"},
    )
    assert response.status_code == 201

    response = client.get("/api/newsletter/subscribers")
    assert response.status_code == 401

    client.post(
        "/api/auth/signup",
        json={"email": "editor2@example.com", "password": "password123", "role": "editor"},
    )
    editor_login = client.post(
        "/api/auth/login",
        json={"email": "editor2@example.com", "password": "password123"},
    )
    editor_token = editor_login.json()["access_token"]

    response = client.get(
        "/api/newsletter/subscribers",
        headers={"Authorization": f"Bearer {editor_token}"},
    )
    assert response.status_code == 200
    assert len(response.json()) == 1

    response = client.post(
        "/api/analytics/events",
        json={"article_id": None, "event_type": "page_view"},
    )
    assert response.status_code == 201

    response = client.get(
        "/api/analytics/summary",
        headers={"Authorization": f"Bearer {editor_token}"},
    )
    assert response.status_code == 200
    data = response.json()
    assert data["total_page_views"] >= 1
