from __future__ import annotations

from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker
from sqlalchemy.future import select

from app.models.user import User


def test_signup_login_password_reset(
    client,
    session_factory: async_sessionmaker[AsyncSession],
    event_loop,
) -> None:
    response = client.post(
        "/api/auth/signup",
        json={"email": "user@example.com", "password": "password123", "full_name": "Test User", "role": "author"},
    )
    assert response.status_code == 201
    user_id = response.json()["user_id"]

    response = client.post(
        "/api/auth/login",
        json={"email": "user@example.com", "password": "password123"},
    )
    assert response.status_code == 200
    token = response.json()["access_token"]

    response = client.post("/api/auth/recover", json={"email": "user@example.com"})
    assert response.status_code == 202

    async def fetch_user() -> User:
        async with session_factory() as session:
            result = await session.execute(select(User).where(User.id == user_id))
            return result.scalar_one()

    user = event_loop.run_until_complete(fetch_user())
    assert user.reset_token is not None

    response = client.post(
        "/api/auth/reset",
        json={"token": user.reset_token, "new_password": "newpassword456"},
    )
    assert response.status_code == 200

    response = client.post(
        "/api/auth/login",
        json={"email": "user@example.com", "password": "newpassword456"},
    )
    assert response.status_code == 200
    assert response.json()["access_token"] != token
