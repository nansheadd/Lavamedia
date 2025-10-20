from app.core.config import Settings


def test_database_url_preserves_password() -> None:
    url = "postgres://user:P%40ssword@localhost:5432/db?sslmode=require"
    settings = Settings(database_url=url)

    assert (
        settings.database_url
        == "postgresql+asyncpg://user:P%40ssword@localhost:5432/db?sslmode=require"
    )


def test_alembic_database_url_preserves_password() -> None:
    url = "postgresql://user:S%2Fecret@localhost/db"
    settings = Settings(alembic_database_url=url)

    assert (
        settings.alembic_database_url
        == "postgresql+asyncpg://user:S%2Fecret@localhost/db"
    )
