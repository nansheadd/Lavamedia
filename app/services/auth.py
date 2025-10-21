from __future__ import annotations

from datetime import datetime

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from fastapi import Depends

from app.db.session import get_session
from app.models.user import Permission, Role, User


class AuthService:
    def __init__(self, session: AsyncSession) -> None:
        self.session = session

    def _user_options(self):
        return (
            selectinload(User.roles).selectinload(Role.permissions),
        )

    async def get_user_by_email(self, email: str) -> User | None:
        stmt = select(User).options(*self._user_options()).where(User.email == email)
        return await self.session.scalar(stmt)

    async def get_user(self, user_id: int) -> User | None:
        return await self.session.get(User, user_id, options=self._user_options())

    async def list_users(self) -> list[User]:
        stmt = select(User).options(*self._user_options())
        return list((await self.session.scalars(stmt)).all())

    async def create_user(
        self,
        *,
        email: str,
        hashed_password: str,
        full_name: str | None = None,
        status: str = "active",
        role_ids: list[int] | None = None,
    ) -> User:
        roles = []
        if role_ids:
            stmt = select(Role).options(selectinload(Role.permissions)).where(Role.id.in_(role_ids))
            roles = list((await self.session.scalars(stmt)).all())
        user = User(
            email=email,
            full_name=full_name,
            hashed_password=hashed_password,
            status=status,
        )
        user.roles = roles
        self.session.add(user)
        await self.session.flush()
        return user

    async def update_user(
        self,
        user: User,
        *,
        full_name: str | None = None,
        status: str | None = None,
        is_active: bool | None = None,
        role_ids: list[int] | None = None,
    ) -> User:
        if full_name is not None:
            user.full_name = full_name
        if status is not None:
            user.status = status
        if is_active is not None:
            user.is_active = is_active
        if role_ids is not None:
            stmt = select(Role).options(selectinload(Role.permissions)).where(Role.id.in_(role_ids))
            roles = list((await self.session.scalars(stmt)).all())
            user.roles = roles
        self.session.add(user)
        await self.session.flush()
        return user

    async def delete_user(self, user: User) -> None:
        await self.session.delete(user)
        await self.session.flush()

    async def record_login(self, user: User) -> None:
        user.last_login_at = datetime.utcnow()
        self.session.add(user)
        await self.session.flush()

    async def list_roles(self) -> list[Role]:
        stmt = select(Role).options(selectinload(Role.permissions))
        return list((await self.session.scalars(stmt)).all())

    async def create_role(
        self,
        *,
        name: str,
        description: str | None = None,
        permission_codes: list[str] | None = None,
    ) -> Role:
        permissions: list[Permission] = []
        if permission_codes:
            permissions = list(
                (await self.session.scalars(select(Permission).where(Permission.code.in_(permission_codes)))).all()
            )
        role = Role(name=name, description=description)
        role.permissions = permissions
        self.session.add(role)
        await self.session.flush()
        return role

    async def update_role(
        self,
        role: Role,
        *,
        description: str | None = None,
        permission_codes: list[str] | None = None,
    ) -> Role:
        if description is not None:
            role.description = description
        if permission_codes is not None:
            permissions = list(
                (await self.session.scalars(select(Permission).where(Permission.code.in_(permission_codes)))).all()
            )
            role.permissions = permissions
        self.session.add(role)
        await self.session.flush()
        return role

    async def list_permissions(self) -> list[Permission]:
        return list((await self.session.scalars(select(Permission))).all())


async def get_auth_service(session: AsyncSession = Depends(get_session)) -> AuthService:
    return AuthService(session)
