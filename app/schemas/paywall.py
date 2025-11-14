from __future__ import annotations

from datetime import datetime
from typing import Literal

from pydantic import EmailStr, Field, field_validator
from pydantic_core.core_schema import FieldValidationInfo

from app.schemas.base import ORMBaseModel, StrictBaseModel
from app.schemas.billing import SubscriptionRead

PaywallScopeLiteral = Literal["article", "newsletter"]


class PaywallConfigBase(StrictBaseModel):
    scope: PaywallScopeLiteral
    slug: str
    label: str | None = None
    datawall_enabled: bool = True
    pay_what_you_want_enabled: bool = True
    disable_datawall_until: datetime | None = None
    min_amount_cents: int = Field(default=200, ge=100)
    max_amount_cents: int = Field(default=2500, ge=200)
    default_amount_cents: int = Field(default=500, ge=100)
    step_amount_cents: int = Field(default=50, ge=10)
    suggested_amounts: list[int] | None = None

    @field_validator("slug")
    @classmethod
    def normalize_slug(cls, value: str) -> str:
        slug = value.strip().lower()
        if not slug:
            raise ValueError("Le slug est obligatoire.")
        return slug

    @field_validator("default_amount_cents")
    @classmethod
    def validate_default(cls, value: int, info: FieldValidationInfo):
        data = info.data
        min_value = data.get("min_amount_cents", 200)
        max_value = data.get("max_amount_cents", 2500)
        if value < min_value or value > max_value:
            raise ValueError("Le montant par défaut doit être compris entre le minimum et le maximum.")
        return value

    @field_validator("max_amount_cents")
    @classmethod
    def validate_max(cls, value: int, info: FieldValidationInfo):
        min_value = info.data.get("min_amount_cents", 200)
        if value < min_value:
            raise ValueError("Le montant maximum doit être supérieur au minimum.")
        return value


class PaywallConfigCreate(PaywallConfigBase):
    pass


class PaywallConfigUpdate(StrictBaseModel):
    label: str | None = None
    datawall_enabled: bool | None = None
    pay_what_you_want_enabled: bool | None = None
    disable_datawall_until: datetime | None = None
    min_amount_cents: int | None = Field(default=None, ge=100)
    max_amount_cents: int | None = Field(default=None, ge=200)
    default_amount_cents: int | None = Field(default=None, ge=100)
    step_amount_cents: int | None = Field(default=None, ge=10)
    suggested_amounts: list[int] | None = None


class PaywallConfigRead(ORMBaseModel):
    id: int
    scope: str
    slug: str
    label: str | None = None
    datawall_enabled: bool
    pay_what_you_want_enabled: bool
    disable_datawall_until: datetime | None = None
    min_amount_cents: int
    max_amount_cents: int
    default_amount_cents: int
    step_amount_cents: int
    suggested_amounts: list[int] | None = None
    created_at: datetime
    updated_at: datetime


class PaywallIntentCreate(StrictBaseModel):
    email: EmailStr
    scope: PaywallScopeLiteral
    slug: str
    preferred_amount_cents: int = Field(ge=100)


class PaywallIntentRead(ORMBaseModel):
    id: int
    scope: str
    slug: str
    email: EmailStr
    preferred_amount_cents: int
    last_checkout_amount_cents: int | None = None
    checkout_started_at: datetime | None = None
    created_at: datetime
    updated_at: datetime


class PaywallDashboardStats(StrictBaseModel):
    supporters: int
    total_amount_cents: int
    monthly_amount_cents: int
    annual_amount_cents: int
    leads: int


class PaywallDashboardResponse(StrictBaseModel):
    configs: list[PaywallConfigRead]
    intents: list[PaywallIntentRead]
    subscriptions: list[SubscriptionRead]
    stats: PaywallDashboardStats
