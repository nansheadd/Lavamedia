from __future__ import annotations

from __future__ import annotations

from datetime import datetime

from pydantic import ConfigDict, EmailStr

from app.models.user import UserRole
from app.schemas.base import ORMBaseModel, StrictBaseModel


class UserBase(StrictBaseModel):
    email: EmailStr
    full_name: str | None = None
    role: UserRole = UserRole.author


class UserCreate(UserBase):
    password: str
    mfa_enabled: bool = False


class UserUpdate(StrictBaseModel):
    full_name: str | None = None
    role: UserRole | None = None
    is_active: bool | None = None


class UserRead(UserBase, ORMBaseModel):
    id: int
    is_active: bool
    is_superuser: bool
    created_at: datetime
    updated_at: datetime
    mfa_enabled: bool

    model_config = ConfigDict(from_attributes=True)
