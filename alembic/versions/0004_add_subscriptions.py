"""Add subscriptions table for Stripe billing."""

from __future__ import annotations

import sqlalchemy as sa
from alembic import op

# revision identifiers, used by Alembic.
revision = "0004"
down_revision = "0003"
branch_labels = None
depends_on = None


def upgrade() -> None:
    bind = op.get_bind()
    inspector = sa.inspect(bind)
    tables = set(inspector.get_table_names())

    if "subscriptions" not in tables:
        op.create_table(
            "subscriptions",
            sa.Column("id", sa.Integer(), primary_key=True),
            sa.Column("user_id", sa.Integer(), sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False),
            sa.Column("plan_slug", sa.String(length=50), nullable=False),
            sa.Column("interval", sa.String(length=32), nullable=False),
            sa.Column("status", sa.String(length=32), nullable=False),
            sa.Column("amount_cents", sa.Integer(), nullable=True),
            sa.Column("currency", sa.String(length=10), nullable=False, server_default="eur"),
            sa.Column("stripe_subscription_id", sa.String(length=255), nullable=True),
            sa.Column("stripe_customer_id", sa.String(length=255), nullable=True),
            sa.Column("stripe_price_id", sa.String(length=255), nullable=True),
            sa.Column("current_period_end", sa.DateTime(timezone=True), nullable=True),
            sa.Column("cancel_at_period_end", sa.Boolean(), nullable=False, server_default=sa.false()),
            sa.Column("last_payment_error", sa.String(length=255), nullable=True),
            sa.Column("latest_invoice_id", sa.String(length=255), nullable=True),
            sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
            sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
            sa.UniqueConstraint("stripe_subscription_id", name="uq_subscriptions_stripe_subscription_id"),
        )

    existing_indexes = {index["name"] for index in inspector.get_indexes("subscriptions")} if "subscriptions" in tables else set()
    if "ix_subscriptions_user_id" not in existing_indexes:
        op.create_index("ix_subscriptions_user_id", "subscriptions", ["user_id"])
    if "ix_subscriptions_plan_slug" not in existing_indexes:
        op.create_index("ix_subscriptions_plan_slug", "subscriptions", ["plan_slug"])
    if "ix_subscriptions_status" not in existing_indexes:
        op.create_index("ix_subscriptions_status", "subscriptions", ["status"])
    if "ix_subscriptions_stripe_customer_id" not in existing_indexes:
        op.create_index("ix_subscriptions_stripe_customer_id", "subscriptions", ["stripe_customer_id"])


def downgrade() -> None:
    bind = op.get_bind()
    inspector = sa.inspect(bind)
    existing_indexes = {index["name"] for index in inspector.get_indexes("subscriptions")} if "subscriptions" in inspector.get_table_names() else set()

    for name in (
        "ix_subscriptions_stripe_customer_id",
        "ix_subscriptions_status",
        "ix_subscriptions_plan_slug",
        "ix_subscriptions_user_id",
    ):
        if name in existing_indexes:
            op.drop_index(name, table_name="subscriptions")

    tables = set(inspector.get_table_names())
    if "subscriptions" in tables:
        op.drop_table("subscriptions")
