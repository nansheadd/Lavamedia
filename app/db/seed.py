"""Database seed helpers executed during application startup."""

from __future__ import annotations

import logging

from sqlalchemy import select
from sqlalchemy.orm import selectinload

from app.core.security import get_password_hash, verify_password
from app.db.session import AsyncSessionLocal
from app.models.user import Role, User

logger = logging.getLogger(__name__)


ROLE_DEFINITIONS: dict[str, str] = {
    "admin": "Administrateur de la plateforme",
    "journalist": "Rédacteur et créateur de contenu",
    "user": "Compte lecteur Lavamedia",
}


async def ensure_seed_data() -> None:
    """Ensure core roles and the default admin user exist."""

    async with AsyncSessionLocal() as session:
        roles: dict[str, Role] = {}
        for name, description in ROLE_DEFINITIONS.items():
            role = await session.scalar(select(Role).where(Role.name == name))
            if not role:
                logger.info("Seeding missing role: %s", name)
                role = Role(name=name, description=description)
                session.add(role)
                await session.flush()
            roles[name] = role

        admin_role = roles["admin"]

        result = await session.execute(
            select(User)
            .options(selectinload(User.roles))
            .where(User.email == "admin@lava.com")
        )
        user = result.scalar_one_or_none()

        if not user:
            logger.info("Creating default admin user")
            user = User(
                email="admin@lava.com",
                full_name="Administrateur Lavamedia",
                hashed_password=get_password_hash("password"),
                is_active=True,
                is_superuser=True,
                status="active",
            )
            user.roles.append(admin_role)
            session.add(user)
        else:
            updated = False

            if not verify_password("password", user.hashed_password):
                user.hashed_password = get_password_hash("password")
                updated = True

            if not user.is_superuser:
                user.is_superuser = True
                updated = True

            if not user.is_active:
                user.is_active = True
                updated = True

            if user.status != "active":
                user.status = "active"
                updated = True

            if admin_role.id not in {role.id for role in user.roles}:
                user.roles.append(admin_role)
                updated = True

            if updated:
                logger.info("Updating default admin user to ensure access")
                session.add(user)

        await session.commit()

