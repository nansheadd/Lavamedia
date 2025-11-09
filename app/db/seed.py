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
    "admin": "Administrateur/administratrice",
    "editor": "Éditeur/éditrice",
    "author": "Auteur/autrice",
    "contributor": "Contributeur/contributrice",
    "subscriber": "Abonné/abonnée",
    "client": "Client",
    "user": "Compte lecteur Lavamedia",
}

DEFAULT_PASSWORD = "password"

DEFAULT_ROLE_USERS = [
    {
        "email": "admin@lava.com",
        "full_name": "Administrateur Lavamedia",
        "role": "admin",
        "is_superuser": True,
    },
    {
        "email": "editeur@lava.com",
        "full_name": "Éditeur Lavamedia",
        "role": "editor",
    },
    {
        "email": "auteur@lava.com",
        "full_name": "Auteur Lavamedia",
        "role": "author",
    },
    {
        "email": "contributeur@lava.com",
        "full_name": "Contributeur Lavamedia",
        "role": "contributor",
    },
    {
        "email": "abonne@lava.com",
        "full_name": "Abonné Lavamedia",
        "role": "subscriber",
    },
    {
        "email": "client@lava.com",
        "full_name": "Client Lavamedia",
        "role": "client",
    },
]


async def ensure_seed_data() -> None:
    """Ensure core roles and the default admin user exist."""

    async with AsyncSessionLocal() as session:
        roles: dict[str, Role] = {}
        existing_author = await session.scalar(select(Role).where(Role.name == "author"))
        journalist_role = await session.scalar(select(Role).where(Role.name == "journalist"))
        if journalist_role and not existing_author:
            journalist_role.name = "author"
            session.add(journalist_role)
            await session.flush()

        for name, description in ROLE_DEFINITIONS.items():
            role = await session.scalar(select(Role).where(Role.name == name))
            if not role:
                logger.info("Seeding missing role: %s", name)
                role = Role(name=name, description=description)
                session.add(role)
                await session.flush()
            roles[name] = role

        for user_config in DEFAULT_ROLE_USERS:
            role = roles[user_config["role"]]
            await _ensure_default_user(session, role, user_config)

        await session.commit()


async def _ensure_default_user(session: AsyncSessionLocal, role: Role, config: dict[str, str | bool]) -> None:
    """Create or refresh a default user tied to a known role."""

    stmt = select(User).options(selectinload(User.roles)).where(User.email == config["email"])
    user = await session.scalar(stmt)

    if not user:
        logger.info("Creating default %s user", role.name)
        user = User(
            email=config["email"],
            full_name=config["full_name"],
            hashed_password=get_password_hash(DEFAULT_PASSWORD),
            is_active=True,
            is_superuser=bool(config.get("is_superuser")),
            status="active",
        )
        user.roles.append(role)
        session.add(user)
        return

    updated = False
    if not verify_password(DEFAULT_PASSWORD, user.hashed_password):
        user.hashed_password = get_password_hash(DEFAULT_PASSWORD)
        updated = True

    if config.get("is_superuser") and not user.is_superuser:
        user.is_superuser = True
        updated = True

    if not user.is_active:
        user.is_active = True
        updated = True

    if user.status != "active":
        user.status = "active"
        updated = True

    if user.full_name != config["full_name"]:
        user.full_name = config["full_name"]
        updated = True

    if role.id not in {assigned.id for assigned in user.roles}:
        user.roles.append(role)
        updated = True

    if updated:
        logger.info("Updating default %s user", config["email"])
        session.add(user)
