"""Add stripe customer id and seed core roles"""

from __future__ import annotations

import sqlalchemy as sa
from alembic import op


# revision identifiers, used by Alembic.
revision = "0003"
down_revision = "0002"
branch_labels = None
depends_on = None


def upgrade() -> None:
    bind = op.get_bind()
    inspector = sa.inspect(bind)

    user_columns = {column["name"] for column in inspector.get_columns("users")}
    if "stripe_customer_id" not in user_columns:
        with op.batch_alter_table("users", recreate="auto") as batch_op:
            batch_op.add_column(
                sa.Column("stripe_customer_id", sa.String(length=255), nullable=True),
            )

    existing_uniques = {uc["name"] for uc in inspector.get_unique_constraints("users")}
    if "uq_users_stripe_customer_id" not in existing_uniques:
        with op.batch_alter_table("users", recreate="auto") as batch_op:
            batch_op.create_unique_constraint(
                "uq_users_stripe_customer_id", ["stripe_customer_id"]
            )

    existing_indexes = {idx["name"] for idx in inspector.get_indexes("users")}
    if "ix_users_stripe_customer_id" not in existing_indexes:
        op.create_index(
            "ix_users_stripe_customer_id", "users", ["stripe_customer_id"], unique=False
        )

    roles_table = sa.table(
        "roles",
        sa.column("id", sa.Integer),
        sa.column("name", sa.String(length=100)),
        sa.column("description", sa.String(length=255)),
    )

    existing_roles = {
        row.name for row in bind.execute(sa.select(roles_table.c.name)).all()
    }
    for name, description in (
        ("user", "Compte lecteur Lavamedia"),
        ("journalist", "Rédacteur et créateur de contenu"),
        ("admin", "Administrateur de la plateforme"),
    ):
        if name not in existing_roles:
            bind.execute(roles_table.insert().values(name=name, description=description))


def downgrade() -> None:
    bind = op.get_bind()
    inspector = sa.inspect(bind)

    for name in ("admin", "journalist", "user"):
        bind.execute(
            sa.text("DELETE FROM roles WHERE name = :name"),
            {"name": name},
        )

    existing_indexes = {idx["name"] for idx in inspector.get_indexes("users")}
    if "ix_users_stripe_customer_id" in existing_indexes:
        op.drop_index("ix_users_stripe_customer_id", table_name="users")

    existing_uniques = {uc["name"] for uc in inspector.get_unique_constraints("users")}
    if "uq_users_stripe_customer_id" in existing_uniques:
        with op.batch_alter_table("users", recreate="auto") as batch_op:
            batch_op.drop_constraint("uq_users_stripe_customer_id", type_="unique")

    user_columns = {column["name"] for column in inspector.get_columns("users")}
    if "stripe_customer_id" in user_columns:
        with op.batch_alter_table("users", recreate="auto") as batch_op:
            batch_op.drop_column("stripe_customer_id")
