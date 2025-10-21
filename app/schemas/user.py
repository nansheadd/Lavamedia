from __future__ import annotations

from datetime import datetime

from pydantic import ConfigDict, EmailStr

from app.schemas.base import ORMBaseModel, StrictBaseModel


class PermissionRead(ORMBaseModel):
    id: int
    code: str
    description: str | None = None

    model_config = ConfigDict(from_attributes=True)


class RoleBase(StrictBaseModel):
    name: str
    description: str | None = None
    permission_codes: list[str] = []


class RoleCreate(RoleBase):
    pass


class RoleUpdate(StrictBaseModel):
    description: str | None = None
    permission_codes: list[str] | None = None


class RoleRead(ORMBaseModel):
    id: int
    name: str
    description: str | None = None
    permissions: list[PermissionRead] = []

    model_config = ConfigDict(from_attributes=True)


class UserBase(StrictBaseModel):
    email: EmailStr
    full_name: str | None = None
    status: str = "active"
    role_ids: list[int] = []


class UserCreate(UserBase):
    password: str
    mfa_enabled: bool = False


class UserUpdate(StrictBaseModel):
    full_name: str | None = None
    status: str | None = None
    is_active: bool | None = None
    role_ids: list[int] | None = None


class UserRead(ORMBaseModel):
    id: int
    email: EmailStr
    full_name: str | None = None
    status: str
    is_active: bool
    is_superuser: bool
    created_at: datetime
    updated_at: datetime
    last_login_at: datetime | None = None
    roles: list[RoleRead] = []
    mfa_enabled: bool

    model_config = ConfigDict(from_attributes=True)
