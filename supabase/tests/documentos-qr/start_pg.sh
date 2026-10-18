#!/usr/bin/env bash
# Starts (or reuses) the throw-away PostgreSQL used by the documentos-qr suite. Local only.
set -eu
NAME="${PG_CONTAINER:-soi-pg-docqr}"
if ! docker ps --format '{{.Names}}' | grep -qx "$NAME"; then
  docker rm -f "$NAME" >/dev/null 2>&1 || true
  docker run -d --name "$NAME" -e POSTGRES_PASSWORD=test -p "${PGPORT:-54331}:5432" postgres:17 >/dev/null
fi
until docker exec "$NAME" pg_isready -U postgres >/dev/null 2>&1; do sleep 1; done
echo "PostgreSQL ready on 127.0.0.1:${PGPORT:-54331}"
