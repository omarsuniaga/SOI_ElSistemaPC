#!/usr/bin/env bash
# Replays supabase/migrations/*.sql (version order) into an isolated container DB.
# Usage: replay.sh <container> <dbname> [stop_before_version]
set -u
C="${1:?container}"; DB="${2:?db}"; STOP="${3:-}"
ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
docker exec "$C" psql -U postgres -q -c "DROP DATABASE IF EXISTS $DB" -c "CREATE DATABASE $DB" >/dev/null
docker exec -i "$C" psql -U postgres -d "$DB" -q -v ON_ERROR_STOP=1 < "$ROOT/tests/anon-write-fix/00_supabase_bootstrap.sql" >/dev/null || { echo "bootstrap failed"; exit 1; }
: > /tmp/replay_errors.log
ok=0; bad=0
for f in $(ls "$ROOT/migrations" | grep -E '^[0-9]+_.*\.sql$' | sort); do
  v="${f%%_*}"
  if [ -n "$STOP" ] && [[ "$v" > "$STOP" || "$v" == "$STOP" ]]; then break; fi
  out=$(docker exec -i "$C" psql -U postgres -d "$DB" -q -v ON_ERROR_STOP=0 < "$ROOT/migrations/$f" 2>&1 >/dev/null | grep -E "ERROR" )
  if [ -n "$out" ]; then bad=$((bad+1)); { echo "== $f"; echo "$out" | head -5; } >> /tmp/replay_errors.log; else ok=$((ok+1)); fi
done
echo "clean=$ok with_errors=$bad"
