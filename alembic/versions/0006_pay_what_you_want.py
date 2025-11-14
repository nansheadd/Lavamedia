"""Add pay-what-you-want configurations and intents."""

from __future__ import annotations

import sqlalchemy as sa
from alembic import op

# revision identifiers, used by Alembic.
revision = "0006"
down_revision = "0005"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "pay_what_you_want_configs",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("scope", sa.String(length=50), nullable=False),
        sa.Column("slug", sa.String(length=255), nullable=False),
        sa.Column("label", sa.String(length=255), nullable=True),
        sa.Column("datawall_enabled", sa.Boolean(), nullable=False, server_default=sa.true()),
        sa.Column("pay_what_you_want_enabled", sa.Boolean(), nullable=False, server_default=sa.true()),
        sa.Column("disable_datawall_until", sa.DateTime(timezone=True), nullable=True),
        sa.Column("min_amount_cents", sa.Integer(), nullable=False, server_default="200"),
        sa.Column("max_amount_cents", sa.Integer(), nullable=False, server_default="2500"),
        sa.Column("default_amount_cents", sa.Integer(), nullable=False, server_default="500"),
        sa.Column("step_amount_cents", sa.Integer(), nullable=False, server_default="50"),
        sa.Column("suggested_amounts", sa.JSON(), nullable=True),
        sa.Column("created_by_id", sa.Integer(), sa.ForeignKey("users.id", ondelete="SET NULL"), nullable=True),
        sa.Column("updated_by_id", sa.Integer(), sa.ForeignKey("users.id", ondelete="SET NULL"), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.UniqueConstraint("scope", "slug", name="uq_pay_what_you_want_configs_scope_slug"),
    )
    op.create_index(
        "ix_pay_what_you_want_configs_scope",
        "pay_what_you_want_configs",
        ["scope"],
    )
    op.create_index(
        "ix_pay_what_you_want_configs_slug",
        "pay_what_you_want_configs",
        ["slug"],
    )

    op.create_table(
        "pay_what_you_want_intents",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("scope", sa.String(length=50), nullable=False),
        sa.Column("slug", sa.String(length=255), nullable=False),
        sa.Column("email", sa.String(length=255), nullable=False),
        sa.Column("preferred_amount_cents", sa.Integer(), nullable=False),
        sa.Column("last_checkout_amount_cents", sa.Integer(), nullable=True),
        sa.Column("checkout_started_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
    )
    op.create_index(
        "ix_pay_what_you_want_intents_scope",
        "pay_what_you_want_intents",
        ["scope"],
    )
    op.create_index(
        "ix_pay_what_you_want_intents_slug",
        "pay_what_you_want_intents",
        ["slug"],
    )
    op.create_index(
        "ix_pay_what_you_want_intents_email",
        "pay_what_you_want_intents",
        ["email"],
    )

    with op.batch_alter_table("subscriptions", recreate="always") as batch_op:
        batch_op.add_column(sa.Column("lead_email", sa.String(length=255), nullable=True))
        batch_op.add_column(sa.Column("paywall_intent_id", sa.Integer(), nullable=True))
        batch_op.alter_column("user_id", existing_type=sa.Integer(), nullable=True)
        batch_op.create_index("ix_subscriptions_lead_email", ["lead_email"])
        batch_op.create_foreign_key(
            "fk_subscriptions_paywall_intent_id",
            "pay_what_you_want_intents",
            ["paywall_intent_id"],
            ["id"],
            ondelete="SET NULL",
        )


def downgrade() -> None:
    with op.batch_alter_table("subscriptions", recreate="always") as batch_op:
        batch_op.drop_constraint("fk_subscriptions_paywall_intent_id", type_="foreignkey")
        batch_op.drop_index("ix_subscriptions_lead_email")
        batch_op.alter_column("user_id", existing_type=sa.Integer(), nullable=False)
        batch_op.drop_column("paywall_intent_id")
        batch_op.drop_column("lead_email")

    op.drop_index("ix_pay_what_you_want_intents_email", table_name="pay_what_you_want_intents")
    op.drop_index("ix_pay_what_you_want_intents_slug", table_name="pay_what_you_want_intents")
    op.drop_index("ix_pay_what_you_want_intents_scope", table_name="pay_what_you_want_intents")
    op.drop_table("pay_what_you_want_intents")

    op.drop_index("ix_pay_what_you_want_configs_slug", table_name="pay_what_you_want_configs")
    op.drop_index("ix_pay_what_you_want_configs_scope", table_name="pay_what_you_want_configs")
    op.drop_table("pay_what_you_want_configs")
