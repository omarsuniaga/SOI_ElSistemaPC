#!/usr/bin/env bash
# Pruebas de integración de las políticas de Storage contra un PostgreSQL AISLADO.
#
# Crea una base temporal, carga una réplica del estado de producción
# (supabase/tests/storage/00_baseline_prod_like.sql), muestra las sondas de riesgo previas,
# aplica la migración DOS veces (debe ser idempotente) y ejecuta las pruebas por rol.
#
# Uso (cualquier PostgreSQL >= 14 desechable; NUNCA apuntar a Supabase/producción):
#   PGHOST=127.0.0.1 PGPORT=5432 PGUSER=postgres bash scripts/test-storage-policies.sh
set -euo pipefail

: "${PGHOST:?Define PGHOST (servidor PostgreSQL de pruebas)}"
case "$PGHOST" in
  *supabase.co*|*supabase.com*|*pooler*) echo "Rechazado: PGHOST parece apuntar a Supabase." >&2; exit 2 ;;
esac

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
DIR="$ROOT/supabase/tests/storage"
MIGRATION="${MIGRATION_FILE:-$ROOT/supabase/migrations/20261017200000_storage_buckets_privados_y_politicas.sql}"
DB="soi_storage_test_$$"

psql -d postgres -v ON_ERROR_STOP=1 -qc "create database $DB"
trap 'psql -d postgres -qc "drop database if exists $DB with (force)" >/dev/null 2>&1 || true' EXIT

run() { psql -d "$DB" -v ON_ERROR_STOP=1 -q "$@"; }

run -f "$DIR/00_baseline_prod_like.sql"
run -f "$DIR/10_fixtures_and_helpers.sql"
run -f "$DIR/20_baseline_probes.sql"
echo "--- Aplicando migración (1/2) ---"; run -f "$MIGRATION"
echo "--- Aplicando migración (2/2, idempotencia) ---"; run -f "$MIGRATION"
run -f "$DIR/30_storage_policies.test.sql"
echo "--- Verificando la reversión ---"
run -f "$ROOT/docs/storage-security/rollback_20261017200000.sql"
run -f "$DIR/40_rollback_check.test.sql"
