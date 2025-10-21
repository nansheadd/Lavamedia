from __future__ import annotations

import secrets
from datetime import datetime, timedelta

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select

from app.api.deps.auth import get_current_user, require_roles
from app.core.security import (
    create_access_token,
    create_mfa_secret,
    generate_mfa_uri,
    get_password_hash,
    verify_access_token,
    verify_mfa_token,
    verify_password,
)
from app.models.user import Role, User
from app.schemas.auth import (
    LoginRequest,
    PasswordRecoveryRequest,
    PasswordReset,
    RefreshRequest,
    SignupResponse,
    Token,
)
from app.schemas.user import (
    RoleCreate,
    RoleRead,
    RoleUpdate,
    UserCreate,
    UserRead,
    UserUpdate,
)
from app.services.auth import AuthService, get_auth_service

router = APIRouter(tags=["auth"])


def _user_to_schema(user: User) -> UserRead:
    return UserRead.model_validate(
        user,
        from_attributes=True,
        update={"mfa_enabled": bool(user.mfa_secret)},
    )


@router.post("/auth/signup", response_model=SignupResponse, status_code=status.HTTP_201_CREATED)
async def signup(
    user_in: UserCreate,
    auth_service: AuthService = Depends(get_auth_service),
) -> SignupResponse:
    existing = await auth_service.get_user_by_email(user_in.email)
    if existing:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Email already registered")
    hashed_password = get_password_hash(user_in.password)
    mfa_secret = create_mfa_secret() if user_in.mfa_enabled else None
    user = await auth_service.create_user(
        email=user_in.email,
        hashed_password=hashed_password,
        full_name=user_in.full_name,
        status=user_in.status,
        role_ids=user_in.role_ids or None,
    )
    user.mfa_secret = mfa_secret
    auth_service.session.add(user)
    await auth_service.session.commit()
    await auth_service.session.refresh(user)

    mfa_uri = generate_mfa_uri(mfa_secret, user.email) if mfa_secret else None
    return SignupResponse(user_id=user.id, mfa_uri=mfa_uri)


@router.post("/auth/login", response_model=Token)
async def login(
    request: LoginRequest,
    auth_service: AuthService = Depends(get_auth_service),
) -> Token:
    user = await auth_service.get_user_by_email(request.email)
    if not user or not verify_password(request.password, user.hashed_password):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")
    if not user.is_active or user.status != "active":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="User inactive")
    if user.mfa_secret:
        if not request.mfa_token or not verify_mfa_token(user.mfa_secret, request.mfa_token):
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="MFA required")
    token = create_access_token(str(user.id))
    await auth_service.record_login(user)
    await auth_service.session.commit()
    return Token(access_token=token)


@router.post("/auth/refresh", response_model=Token)
async def refresh_token(payload: RefreshRequest) -> Token:
    user_id = verify_access_token(payload.refresh_token)
    if not user_id:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid refresh token")
    token = create_access_token(user_id)
    return Token(access_token=token)


@router.post("/auth/logout", status_code=status.HTTP_204_NO_CONTENT)
async def logout() -> None:
    return None


@router.post("/auth/recover", status_code=status.HTTP_202_ACCEPTED)
async def request_password_recovery(
    payload: PasswordRecoveryRequest,
    auth_service: AuthService = Depends(get_auth_service),
) -> dict:
    user = await auth_service.get_user_by_email(payload.email)
    if user:
        user.reset_token = secrets.token_urlsafe(32)
        user.reset_token_expires = datetime.utcnow() + timedelta(hours=1)
        auth_service.session.add(user)
        await auth_service.session.commit()
    return {"message": "If the email exists, recovery instructions were sent."}


@router.post("/auth/reset", status_code=status.HTTP_200_OK)
async def reset_password(
    payload: PasswordReset,
    auth_service: AuthService = Depends(get_auth_service),
) -> dict:
    user = await auth_service.session.scalar(select(User).where(User.reset_token == payload.token))
    if not user or not user.reset_token_expires or user.reset_token_expires < datetime.utcnow():
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid or expired token")
    user.hashed_password = get_password_hash(payload.new_password)
    user.reset_token = None
    user.reset_token_expires = None
    auth_service.session.add(user)
    await auth_service.session.commit()
    return {"message": "Password updated"}


@router.get(
    "/users",
    response_model=list[UserRead],
    dependencies=[Depends(require_roles("admin"))],
)
async def list_users(
    auth_service: AuthService = Depends(get_auth_service),
) -> list[UserRead]:
    users = await auth_service.list_users()
    return [_user_to_schema(user) for user in users]


@router.post(
    "/users",
    response_model=UserRead,
    status_code=status.HTTP_201_CREATED,
    dependencies=[Depends(require_roles("admin"))],
)
async def create_user(
    payload: UserCreate,
    auth_service: AuthService = Depends(get_auth_service),
) -> UserRead:
    if await auth_service.get_user_by_email(payload.email):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Email already registered")
    user = await auth_service.create_user(
        email=payload.email,
        hashed_password=get_password_hash(payload.password),
        full_name=payload.full_name,
        status=payload.status,
        role_ids=payload.role_ids or None,
    )
    user.mfa_secret = create_mfa_secret() if payload.mfa_enabled else None
    auth_service.session.add(user)
    await auth_service.session.commit()
    await auth_service.session.refresh(user)
    return _user_to_schema(user)


@router.patch(
    "/users/{user_id}",
    response_model=UserRead,
    dependencies=[Depends(require_roles("admin"))],
)
async def update_user(
    user_id: int,
    payload: UserUpdate,
    auth_service: AuthService = Depends(get_auth_service),
) -> UserRead:
    user = await auth_service.get_user(user_id)
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    await auth_service.update_user(
        user,
        full_name=payload.full_name,
        status=payload.status,
        is_active=payload.is_active,
        role_ids=payload.role_ids,
    )
    auth_service.session.add(user)
    await auth_service.session.commit()
    await auth_service.session.refresh(user)
    return _user_to_schema(user)


@router.delete(
    "/users/{user_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    dependencies=[Depends(require_roles("admin"))],
)
async def delete_user(
    user_id: int,
    auth_service: AuthService = Depends(get_auth_service),
) -> None:
    user = await auth_service.get_user(user_id)
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    await auth_service.delete_user(user)
    await auth_service.session.commit()


@router.get("/roles", response_model=list[RoleRead], dependencies=[Depends(require_roles("admin"))])
async def list_roles(auth_service: AuthService = Depends(get_auth_service)) -> list[RoleRead]:
    roles = await auth_service.list_roles()
    return [RoleRead.model_validate(role, from_attributes=True) for role in roles]


@router.post(
    "/roles",
    response_model=RoleRead,
    status_code=status.HTTP_201_CREATED,
    dependencies=[Depends(require_roles("admin"))],
)
async def create_role(
    payload: RoleCreate,
    auth_service: AuthService = Depends(get_auth_service),
) -> RoleRead:
    role = await auth_service.create_role(
        name=payload.name,
        description=payload.description,
        permission_codes=payload.permission_codes,
    )
    auth_service.session.add(role)
    await auth_service.session.commit()
    await auth_service.session.refresh(role)
    return RoleRead.model_validate(role, from_attributes=True)


@router.patch(
    "/roles/{role_id}",
    response_model=RoleRead,
    dependencies=[Depends(require_roles("admin"))],
)
async def update_role(
    role_id: int,
    payload: RoleUpdate,
    auth_service: AuthService = Depends(get_auth_service),
) -> RoleRead:
    role = await auth_service.session.get(Role, role_id)
    if not role:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Role not found")
    await auth_service.update_role(
        role,
        description=payload.description,
        permission_codes=payload.permission_codes,
    )
    auth_service.session.add(role)
    await auth_service.session.commit()
    await auth_service.session.refresh(role)
    return RoleRead.model_validate(role, from_attributes=True)


@router.get(
    "/permissions",
    response_model=list[str],
    dependencies=[Depends(require_roles("admin"))],
)
async def list_permissions(auth_service: AuthService = Depends(get_auth_service)) -> list[str]:
    permissions = await auth_service.list_permissions()
    return [permission.code for permission in permissions]
