from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, status

from app.api.deps.auth import require_roles
from app.models.billing import PayWhatYouWantConfig
from app.schemas.paywall import (
    PaywallConfigCreate,
    PaywallConfigRead,
    PaywallConfigUpdate,
    PaywallDashboardResponse,
    PaywallIntentCreate,
    PaywallIntentRead,
)
from app.services.paywall import PayWhatYouWantService, get_paywall_service

router = APIRouter(prefix="/paywall", tags=["paywall"])


@router.get("/configs/{scope}/{slug}", response_model=PaywallConfigRead)
async def get_paywall_config(
    scope: str,
    slug: str,
    service: PayWhatYouWantService = Depends(get_paywall_service),
) -> PaywallConfigRead:
    config = await service.get_or_create_config(scope, slug)
    await service.session.commit()
    return config  # type: ignore[return-value]


@router.get(
    "/admin/configs",
    response_model=list[PaywallConfigRead],
    dependencies=[Depends(require_roles("admin"))],
)
async def list_paywall_configs(
    service: PayWhatYouWantService = Depends(get_paywall_service),
) -> list[PaywallConfigRead]:
    configs = await service.list_configs()
    return configs  # type: ignore[return-value]


@router.post(
    "/configs",
    response_model=PaywallConfigRead,
    status_code=status.HTTP_201_CREATED,
    dependencies=[Depends(require_roles("admin"))],
)
async def create_paywall_config(
    payload: PaywallConfigCreate,
    service: PayWhatYouWantService = Depends(get_paywall_service),
) -> PaywallConfigRead:
    config = await service.get_or_create_config(payload.scope, payload.slug)
    await service.update_config(
        config,
        {
            "label": payload.label,
            "datawall_enabled": payload.datawall_enabled,
            "pay_what_you_want_enabled": payload.pay_what_you_want_enabled,
            "disable_datawall_until": payload.disable_datawall_until,
            "min_amount_cents": payload.min_amount_cents,
            "max_amount_cents": payload.max_amount_cents,
            "default_amount_cents": payload.default_amount_cents,
            "step_amount_cents": payload.step_amount_cents,
            "suggested_amounts": payload.suggested_amounts,
        },
    )
    await service.session.commit()
    return config  # type: ignore[return-value]


@router.patch(
    "/configs/{config_id}",
    response_model=PaywallConfigRead,
    dependencies=[Depends(require_roles("admin"))],
)
async def update_paywall_config(
    config_id: int,
    payload: PaywallConfigUpdate,
    service: PayWhatYouWantService = Depends(get_paywall_service),
) -> PaywallConfigRead:
    config = await service.session.get(PayWhatYouWantConfig, config_id)
    if not config:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Configuration introuvable.")
    await service.update_config(
        config,
        {
            k: v
            for k, v in payload.model_dump(exclude_unset=True).items()
            if v is not None or k in {"label", "disable_datawall_until", "suggested_amounts"}
        },
    )
    await service.session.commit()
    return config  # type: ignore[return-value]


@router.post("/intents", response_model=PaywallIntentRead, status_code=status.HTTP_201_CREATED)
async def create_paywall_intent(
    payload: PaywallIntentCreate,
    service: PayWhatYouWantService = Depends(get_paywall_service),
) -> PaywallIntentRead:
    config = await service.get_or_create_config(payload.scope, payload.slug)
    min_amount = config.min_amount_cents
    max_amount = config.max_amount_cents
    preferred = min(max(payload.preferred_amount_cents, min_amount), max_amount)
    intent = await service.create_intent(
        scope=payload.scope,
        slug=payload.slug,
        email=payload.email,
        preferred_amount_cents=preferred,
    )
    await service.session.commit()
    return intent  # type: ignore[return-value]


@router.get(
    "/admin/dashboard",
    response_model=PaywallDashboardResponse,
    dependencies=[Depends(require_roles("admin"))],
)
async def paywall_dashboard(
    service: PayWhatYouWantService = Depends(get_paywall_service),
) -> PaywallDashboardResponse:
    data = await service.get_dashboard()
    return data  # type: ignore[return-value]
