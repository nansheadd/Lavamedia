from __future__ import annotations

from datetime import datetime

from pydantic import EmailStr

from app.schemas.base import StrictBaseModel


class Token(StrictBaseModel):
    access_token: str
    token_type: str = "bearer"


class TokenPayload(StrictBaseModel):
    sub: str | None = None
    exp: datetime | None = None


class LoginRequest(StrictBaseModel):
    email: EmailStr
    password: str
    mfa_token: str | None = None


class RefreshRequest(StrictBaseModel):
    refresh_token: str


class SignupResponse(StrictBaseModel):
    user_id: int
    mfa_uri: str | None = None


class PasswordRecoveryRequest(StrictBaseModel):
    email: EmailStr


class PasswordReset(StrictBaseModel):
    token: str
    new_password: str
