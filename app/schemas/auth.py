from __future__ import annotations

from datetime import datetime

from pydantic import BaseModel, EmailStr


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"


class TokenPayload(BaseModel):
    sub: str | None = None
    exp: datetime | None = None


class LoginRequest(BaseModel):
    email: EmailStr
    password: str
    mfa_token: str | None = None


class SignupResponse(BaseModel):
    user_id: int
    mfa_uri: str | None = None


class PasswordRecoveryRequest(BaseModel):
    email: EmailStr


class PasswordReset(BaseModel):
    token: str
    new_password: str
