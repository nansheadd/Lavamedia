from __future__ import annotations

import secrets
from datetime import datetime, timedelta

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from app.api.deps.auth import get_current_user
from app.core.security import (
    create_access_token,
    create_mfa_secret,
    generate_mfa_uri,
    get_password_hash,
    verify_mfa_token,
    verify_password,
)
from app.db.session import get_session
from app.models.user import User
from app.schemas.auth import (
    LoginRequest,
    PasswordRecoveryRequest,
    PasswordReset,
    SignupResponse,
    Token,
)
from app.schemas.user import UserCreate, UserRead
from app.services.audit import log_event

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/signup", response_model=SignupResponse, status_code=status.HTTP_201_CREATED)
async def signup(user_in: UserCreate, session: AsyncSession = Depends(get_session)) -> SignupResponse:
    if await session.scalar(select(User).where(User.email == user_in.email)):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Email already registered")
    hashed_password = get_password_hash(user_in.password)
    mfa_secret = create_mfa_secret() if user_in.mfa_enabled else None
    user = User(
        email=user_in.email,
        full_name=user_in.full_name,
        hashed_password=hashed_password,
        role=user_in.role,
        mfa_secret=mfa_secret,
    )
    session.add(user)
    await session.commit()
    await session.refresh(user)

    mfa_uri = generate_mfa_uri(mfa_secret, user.email) if mfa_secret else None
    log_event(
        "user.signup",
        actor=str(user.id),
        target=str(user.id),
        extra={"email": user.email, "mfa_enabled": bool(mfa_secret)},
    )
    return SignupResponse(user_id=user.id, mfa_uri=mfa_uri)


@router.post("/login", response_model=Token)
async def login(request: LoginRequest, session: AsyncSession = Depends(get_session)) -> Token:
    user = await session.scalar(select(User).where(User.email == request.email))
    if not user or not verify_password(request.password, user.hashed_password):
        log_event(
            "auth.login_failed",
            actor=request.email,
            extra={"reason": "invalid_credentials"},
        )
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")
    if not user.is_active:
        log_event(
            "auth.login_failed",
            actor=request.email,
            extra={"reason": "inactive"},
        )
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="User inactive")
    if user.mfa_secret:
        if not request.mfa_token or not verify_mfa_token(user.mfa_secret, request.mfa_token):
            log_event(
                "auth.login_failed",
                actor=request.email,
                extra={"reason": "mfa_required"},
            )
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="MFA required")
    token = create_access_token(str(user.id))
    log_event(
        "auth.login_succeeded",
        actor=str(user.id),
        extra={"email": user.email},
    )
    return Token(access_token=token)


@router.post("/recover", status_code=status.HTTP_202_ACCEPTED)
async def request_password_recovery(payload: PasswordRecoveryRequest, session: AsyncSession = Depends(get_session)) -> dict:
    user = await session.scalar(select(User).where(User.email == payload.email))
    if user:
        user.reset_token = secrets.token_urlsafe(32)
        user.reset_token_expires = datetime.utcnow() + timedelta(hours=1)
        session.add(user)
        await session.commit()
        log_event(
            "auth.password_recovery_requested",
            actor=str(user.id),
            target=str(user.id),
            extra={"email": user.email},
        )
    return {"message": "If the email exists, recovery instructions were sent."}


@router.post("/reset", status_code=status.HTTP_200_OK)
async def reset_password(payload: PasswordReset, session: AsyncSession = Depends(get_session)) -> dict:
    user = await session.scalar(select(User).where(User.reset_token == payload.token))
    if not user or not user.reset_token_expires or user.reset_token_expires < datetime.utcnow():
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid or expired token")
    user.hashed_password = get_password_hash(payload.new_password)
    user.reset_token = None
    user.reset_token_expires = None
    session.add(user)
    await session.commit()
    log_event(
        "auth.password_reset",
        actor=str(user.id),
        target=str(user.id),
        extra={"email": user.email},
    )
    return {"message": "Password updated"}


@router.post("/mfa/enable", response_model=SignupResponse)
async def enable_mfa(current_user: User = Depends(get_current_user), session: AsyncSession = Depends(get_session)) -> SignupResponse:
    if current_user.mfa_secret:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="MFA already enabled")
    current_user.mfa_secret = create_mfa_secret()
    session.add(current_user)
    await session.commit()
    await session.refresh(current_user)
    mfa_uri = generate_mfa_uri(current_user.mfa_secret, current_user.email)
    log_event(
        "auth.mfa_enabled",
        actor=str(current_user.id),
        target=str(current_user.id),
    )
    return SignupResponse(user_id=current_user.id, mfa_uri=mfa_uri)


@router.get("/me", response_model=UserRead)
async def read_me(current_user: User = Depends(get_current_user)) -> UserRead:
    return UserRead(
        id=current_user.id,
        email=current_user.email,
        full_name=current_user.full_name,
        role=current_user.role,
        is_active=current_user.is_active,
        is_superuser=current_user.is_superuser,
        created_at=current_user.created_at,
        updated_at=current_user.updated_at,
        mfa_enabled=bool(current_user.mfa_secret),
    )
