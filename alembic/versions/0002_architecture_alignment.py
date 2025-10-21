"""Align schema with architecture plan"""

from __future__ import annotations

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = "0002"
down_revision = "0001"
branch_labels = None
depends_on = None


def _is_postgres(bind) -> bool:
    return bind.dialect.name == "postgresql"


JSON_TYPE = sa.JSON().with_variant(
    postgresql.JSONB(astext_type=sa.Text()), "postgresql"
)


def upgrade() -> None:
    bind = op.get_bind()

    is_postgres = _is_postgres(bind)

    # Drop legacy CMS tables
    for table in (
        "article_tags",
        "seo_data",
        "analytics_events",
        "articles",
        "media_assets",
        "article_statuses",
        "tags",
        "sections",
    ):
        try:
            op.drop_table(table)
        except Exception:
            pass

    # Update users table
    with op.batch_alter_table("users") as batch:
        if bind.dialect.name == "sqlite":
            try:
                batch.drop_column("role")
            except Exception:  # pragma: no cover - defensive
                pass
        else:
            batch.drop_column("role")
        batch.add_column(sa.Column("status", sa.String(length=50), nullable=False, server_default="active"))
        batch.add_column(sa.Column("last_login_at", sa.DateTime(timezone=True), nullable=True))
    if bind.dialect.name != "sqlite":
        op.alter_column("users", "status", server_default=None)

    # Drop old enum types on PostgreSQL
    if is_postgres:
        for enum_name in ("articleworkflowstate", "userrole"):
            op.execute(
                sa.text(
                    f"DO $$ BEGIN IF EXISTS (SELECT 1 FROM pg_type WHERE typname = '{enum_name}') THEN DROP TYPE {enum_name}; END IF; END $$;"
                )
            )

    # Permissions and roles
    op.create_table(
        "permissions",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("code", sa.String(length=100), nullable=False, unique=True),
        sa.Column("description", sa.String(length=255), nullable=True),
    )

    op.create_table(
        "roles",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("name", sa.String(length=100), nullable=False, unique=True),
        sa.Column("description", sa.String(length=255), nullable=True),
    )

    op.create_table(
        "role_permissions",
        sa.Column("role_id", sa.Integer(), sa.ForeignKey("roles.id", ondelete="CASCADE"), primary_key=True),
        sa.Column("permission_id", sa.Integer(), sa.ForeignKey("permissions.id", ondelete="CASCADE"), primary_key=True),
        sa.UniqueConstraint("role_id", "permission_id", name="uq_role_permissions_role_id_permission_id"),
    )

    op.create_table(
        "user_roles",
        sa.Column("user_id", sa.Integer(), sa.ForeignKey("users.id", ondelete="CASCADE"), primary_key=True),
        sa.Column("role_id", sa.Integer(), sa.ForeignKey("roles.id", ondelete="CASCADE"), primary_key=True),
        sa.UniqueConstraint("user_id", "role_id", name="uq_user_roles_user_id_role_id"),
    )

    workflow_enum = sa.Enum("draft", "review", "published", "archived", name="contentworkflowstate")

    op.create_table(
        "content_items",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("type", sa.String(length=50), nullable=False),
        sa.Column("title", sa.String(length=255), nullable=False),
        sa.Column("slug", sa.String(length=255), nullable=False),
        sa.Column("status", sa.String(length=50), nullable=False, server_default="draft"),
        sa.Column("published_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("created_by", sa.Integer(), sa.ForeignKey("users.id", ondelete="SET NULL"), nullable=True),
        sa.Column("updated_by", sa.Integer(), sa.ForeignKey("users.id", ondelete="SET NULL"), nullable=True),
        sa.Column("workflow_state", workflow_enum, nullable=False, server_default="draft"),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.UniqueConstraint("slug", name="uq_content_items_slug"),
    )

    op.create_index("ix_content_items_slug", "content_items", ["slug"], unique=False)

    op.create_table(
        "content_categories",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("name", sa.String(length=100), nullable=False),
        sa.Column("slug", sa.String(length=150), nullable=False),
        sa.Column("parent_id", sa.Integer(), sa.ForeignKey("content_categories.id", ondelete="SET NULL"), nullable=True),
        sa.UniqueConstraint("slug", name="uq_content_categories_slug"),
    )

    op.create_index("ix_content_categories_slug", "content_categories", ["slug"], unique=False)

    op.create_table(
        "content_category_links",
        sa.Column("content_id", sa.Integer(), sa.ForeignKey("content_items.id", ondelete="CASCADE"), primary_key=True),
        sa.Column("category_id", sa.Integer(), sa.ForeignKey("content_categories.id", ondelete="CASCADE"), primary_key=True),
        sa.UniqueConstraint("content_id", "category_id", name="uq_content_category_links_content_id_category_id"),
    )

    op.create_table(
        "content_versions",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("content_id", sa.Integer(), sa.ForeignKey("content_items.id", ondelete="CASCADE"), nullable=False),
        sa.Column("version_number", sa.Integer(), nullable=False),
        sa.Column("body", sa.Text(), nullable=False),
        sa.Column("diff", JSON_TYPE, nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.UniqueConstraint("content_id", "version_number", name="uq_content_versions_content_id_version_number"),
    )

    op.create_table(
        "media_assets",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("type", sa.String(length=50), nullable=False),
        sa.Column("filename", sa.String(length=255), nullable=False),
        sa.Column("storage_url", sa.String(length=512), nullable=False),
        sa.Column("checksum", sa.String(length=128), nullable=True),
        sa.Column("width", sa.Integer(), nullable=True),
        sa.Column("height", sa.Integer(), nullable=True),
        sa.Column("duration", sa.Float(), nullable=True),
        sa.Column("metadata", JSON_TYPE, nullable=True),
        sa.Column("uploaded_by", sa.Integer(), sa.ForeignKey("users.id", ondelete="SET NULL"), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
    )

    op.create_table(
        "media_variants",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("media_id", sa.Integer(), sa.ForeignKey("media_assets.id", ondelete="CASCADE"), nullable=False),
        sa.Column("format", sa.String(length=50), nullable=False),
        sa.Column("url", sa.String(length=512), nullable=False),
        sa.Column("width", sa.Integer(), nullable=True),
        sa.Column("height", sa.Integer(), nullable=True),
        sa.Column("bitrate", sa.Integer(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.UniqueConstraint("media_id", "format", name="uq_media_variants_media_id_format"),
    )

    op.create_table(
        "content_media",
        sa.Column("content_id", sa.Integer(), sa.ForeignKey("content_items.id", ondelete="CASCADE"), primary_key=True),
        sa.Column("media_id", sa.Integer(), sa.ForeignKey("media_assets.id", ondelete="CASCADE"), primary_key=True),
        sa.Column("role", sa.String(length=50), nullable=True),
        sa.UniqueConstraint("content_id", "media_id", "role", name="uq_content_media_content_id_media_id_role"),
    )

    op.create_table(
        "seo_metadata",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("content_id", sa.Integer(), sa.ForeignKey("content_items.id", ondelete="CASCADE"), nullable=False, unique=True),
        sa.Column("meta_title", sa.String(length=255), nullable=True),
        sa.Column("meta_description", sa.String(length=255), nullable=True),
        sa.Column("canonical_url", sa.String(length=512), nullable=True),
        sa.Column("og_tags", JSON_TYPE, nullable=True),
        sa.Column("schema_markup", JSON_TYPE, nullable=True),
    )

    op.create_table(
        "analytics_events",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("user_id", sa.Integer(), sa.ForeignKey("users.id", ondelete="SET NULL"), nullable=True),
        sa.Column("session_id", sa.String(length=128), nullable=True),
        sa.Column("event_type", sa.String(length=100), nullable=False),
        sa.Column("payload", JSON_TYPE, nullable=True),
        sa.Column("occurred_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
    )

    op.create_table(
        "dashboards",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("name", sa.String(length=255), nullable=False, unique=True),
        sa.Column("definition", JSON_TYPE, nullable=False),
        sa.Column("owner_id", sa.Integer(), sa.ForeignKey("users.id", ondelete="SET NULL"), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
    )

    op.create_table(
        "webhooks",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("name", sa.String(length=100), nullable=False),
        sa.Column("target_url", sa.String(length=512), nullable=False),
        sa.Column("secret", sa.String(length=255), nullable=True),
        sa.Column("status", sa.String(length=50), nullable=False, server_default="active"),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
    )

    # Create GIN indexes on PostgreSQL
    if _is_postgres(bind):
        op.create_index(
            "ix_seo_metadata_og_tags_gin",
            "seo_metadata",
            ["og_tags"],
            postgresql_using="gin",
            postgresql_ops={"og_tags": "jsonb_path_ops"},
        )
        op.create_index(
            "ix_seo_metadata_schema_markup_gin",
            "seo_metadata",
            ["schema_markup"],
            postgresql_using="gin",
            postgresql_ops={"schema_markup": "jsonb_path_ops"},
        )
        op.create_index(
            "ix_media_assets_metadata_gin",
            "media_assets",
            ["metadata"],
            postgresql_using="gin",
            postgresql_ops={"metadata": "jsonb_path_ops"},
        )
        op.create_index(
            "ix_analytics_events_payload_gin",
            "analytics_events",
            ["payload"],
            postgresql_using="gin",
            postgresql_ops={"payload": "jsonb_path_ops"},
        )
        op.create_index(
            "ix_dashboards_definition_gin",
            "dashboards",
            ["definition"],
            postgresql_using="gin",
            postgresql_ops={"definition": "jsonb_path_ops"},
        )

    # Seed permissions and roles
    permissions_table = sa.table(
        "permissions",
        sa.column("id", sa.Integer),
        sa.column("code", sa.String),
        sa.column("description", sa.String),
    )
    op.bulk_insert(
        permissions_table,
        [
            {"id": 1, "code": "content.read", "description": "Read content items"},
            {"id": 2, "code": "content.write", "description": "Create and update content"},
            {"id": 3, "code": "media.manage", "description": "Manage media assets"},
            {"id": 4, "code": "analytics.view", "description": "View analytics dashboards"},
            {"id": 5, "code": "seo.manage", "description": "Manage SEO metadata"},
            {"id": 6, "code": "notifications.manage", "description": "Manage webhooks and notifications"},
            {"id": 7, "code": "users.manage", "description": "Manage users and roles"},
        ],
    )

    roles_table = sa.table(
        "roles",
        sa.column("id", sa.Integer),
        sa.column("name", sa.String),
        sa.column("description", sa.String),
    )
    op.bulk_insert(
        roles_table,
        [
            {"id": 1, "name": "admin", "description": "Full access to the platform"},
            {"id": 2, "name": "editor", "description": "Manage content and SEO"},
            {"id": 3, "name": "author", "description": "Create and edit content"},
        ],
    )

    role_permissions_table = sa.table(
        "role_permissions",
        sa.column("role_id", sa.Integer),
        sa.column("permission_id", sa.Integer),
    )
    op.bulk_insert(
        role_permissions_table,
        [
            {"role_id": 1, "permission_id": pid} for pid in range(1, 8)
        ]
        + [
            {"role_id": 2, "permission_id": pid} for pid in (1, 2, 3, 4, 5)
        ]
        + [
            {"role_id": 3, "permission_id": pid} for pid in (1, 2)
        ],
    )


def downgrade() -> None:
    bind = op.get_bind()

    if _is_postgres(bind):
        for index in (
            "ix_dashboards_definition_gin",
            "ix_analytics_events_payload_gin",
            "ix_media_assets_metadata_gin",
            "ix_seo_metadata_schema_markup_gin",
            "ix_seo_metadata_og_tags_gin",
        ):
            op.drop_index(index, table_name=None)

    op.drop_table("webhooks")
    op.drop_table("dashboards")
    op.drop_table("analytics_events")
    op.drop_table("seo_metadata")
    op.drop_table("content_media")
    op.drop_table("media_variants")
    op.drop_table("media_assets")
    op.drop_table("content_versions")
    op.drop_table("content_category_links")
    op.drop_table("content_categories")
    op.drop_index("ix_content_items_slug", table_name="content_items")
    op.drop_table("content_items")
    op.drop_table("user_roles")
    op.drop_table("role_permissions")
    op.drop_table("roles")
    op.drop_table("permissions")

    with op.batch_alter_table("users") as batch:
        batch.drop_column("status")
        batch.drop_column("last_login_at")
        batch.add_column(sa.Column("role", sa.Enum("admin", "editor", "author", "reviewer", "contributor", name="userrole"), nullable=False, server_default="author"))

    op.create_table(
        "sections",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("name", sa.String(length=100), nullable=False, unique=True),
        sa.Column("description", sa.String(length=255), nullable=True),
    )
    op.create_table(
        "tags",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("name", sa.String(length=50), nullable=False, unique=True),
    )
    op.create_table(
        "article_statuses",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("name", sa.String(length=50), nullable=False, unique=True),
        sa.Column("workflow_state", sa.Enum("draft", "review", "published", "archived", name="articleworkflowstate"), nullable=False),
    )
    op.create_table(
        "media_assets",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("url", sa.String(length=255), nullable=False),
        sa.Column("media_type", sa.String(length=50), nullable=False),
        sa.Column("description", sa.String(length=255), nullable=True),
        sa.Column("metadata", sa.Text(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
    )
    op.create_table(
        "articles",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("title", sa.String(length=255), nullable=False),
        sa.Column("slug", sa.String(length=255), nullable=False, unique=True),
        sa.Column("content", sa.Text(), nullable=False),
        sa.Column("excerpt", sa.Text(), nullable=True),
        sa.Column("workflow_state", sa.Enum("draft", "review", "published", "archived", name="articleworkflowstate"), nullable=False, server_default="draft"),
        sa.Column("status_id", sa.Integer(), sa.ForeignKey("article_statuses.id"), nullable=True),
        sa.Column("section_id", sa.Integer(), sa.ForeignKey("sections.id"), nullable=True),
        sa.Column("hero_media_id", sa.Integer(), sa.ForeignKey("media_assets.id"), nullable=True),
        sa.Column("author_id", sa.Integer(), sa.ForeignKey("users.id"), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
    )
    op.create_table(
        "analytics_events",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("article_id", sa.Integer(), sa.ForeignKey("articles.id", ondelete="SET NULL"), nullable=True),
        sa.Column("event_type", sa.String(length=50), nullable=False),
        sa.Column("metadata", sa.JSON(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
    )
    op.create_table(
        "newsletter_subscriptions",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("email", sa.String(length=255), nullable=False, unique=True),
        sa.Column("is_active", sa.Boolean(), nullable=False, server_default=sa.true()),
        sa.Column("source", sa.String(length=255), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
    )
    op.create_table(
        "seo_data",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("article_id", sa.Integer(), sa.ForeignKey("articles.id", ondelete="CASCADE"), nullable=False, unique=True),
        sa.Column("meta_title", sa.String(length=255), nullable=True),
        sa.Column("meta_description", sa.String(length=255), nullable=True),
        sa.Column("keywords", sa.String(length=255), nullable=True),
    )
    op.create_table(
        "article_tags",
        sa.Column("article_id", sa.Integer(), sa.ForeignKey("articles.id", ondelete="CASCADE"), primary_key=True),
        sa.Column("tag_id", sa.Integer(), sa.ForeignKey("tags.id", ondelete="CASCADE"), primary_key=True),
    )
