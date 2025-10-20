#!/usr/bin/env bash
set -euo pipefail

if [ -z "${DATABASE_URL:-}" ]; then
  echo "DATABASE_URL is not set. Please configure it in Render before deploying." >&2
  exit 1
fi

# Render provides a postgres:// URL by default. Convert it to the asyncpg driver
# expected by SQLAlchemy if necessary.
if [[ "${DATABASE_URL}" == postgres://* ]]; then
  export DATABASE_URL="postgresql+asyncpg://${DATABASE_URL#postgres://}"
fi

# Ensure Alembic uses the same connection string as the application unless a
# dedicated one is provided via ALEMBIC_DATABASE_URL.
export ALEMBIC_DATABASE_URL="${ALEMBIC_DATABASE_URL:-${DATABASE_URL}}"

# Run database migrations before starting the API.
alembic upgrade head

# Launch the FastAPI application.
exec uvicorn app.main:app --host 0.0.0.0 --port "${PORT:-8000}"
