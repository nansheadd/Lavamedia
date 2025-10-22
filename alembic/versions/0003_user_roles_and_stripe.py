"""Add stripe customer id and seed core roles"""

from __future__ import annotations

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = "0003"
down_revision = "0002"
branch_labels = None
depends_on = None


def upgrade() -> None:
    bind = op.get_bind()

    op.add_column(
        "users",
        sa.Column("stripe_customer_id", sa.String(length=255), nullable=True),
    )
    op.create_unique_constraint(
        "uq_users_stripe_customer_id", "users", ["stripe_customer_id"]
    )
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

    for name in ("admin", "journalist", "user"):
        bind.execute(
            sa.text("DELETE FROM roles WHERE name = :name"),
            {"name": name},
        )

    op.drop_index("ix_users_stripe_customer_id", table_name="users")
    op.drop_constraint("uq_users_stripe_customer_id", "users", type_="unique")
    op.drop_column("users", "stripe_customer_id")
