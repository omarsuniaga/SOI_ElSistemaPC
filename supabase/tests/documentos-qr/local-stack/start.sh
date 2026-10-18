#!/usr/bin/env bash
# Starts an ISOLATED local Supabase stack (project_id "docqr", ports 54420-54439) with the real GoTrue,
# PostgREST and Storage API, and applies the module migration. Never touches production.
# Needs Docker. First run pulls images. Stop with: supabase stop --workdir <this dir> --no-backup
set -eu
HERE="$(cd "$(dirname "$0")" && pwd)"
ROOT="$(cd "$HERE/../../../.." && pwd)"
WORK="${DOCQR_STACK_DIR:-${TMPDIR:-/tmp}/docqr-stack}"
rm -rf "$WORK"; mkdir -p "$WORK/supabase/migrations"
cp "$HERE/supabase/config.toml" "$WORK/supabase/config.toml"
cp "$HERE/supabase/migrations/"*.sql "$WORK/supabase/migrations/"
cp "$ROOT/supabase/migrations/20261018120000_documentos_publicos_qr.sql" "$WORK/supabase/migrations/"
npx supabase start --workdir "$WORK" -x studio,imgproxy,vector,mailpit,postgres-meta,logflare,edge-runtime,realtime,supavisor
echo "Stack dir: $WORK  (API http://127.0.0.1:54421). Export SUPABASE_URL/ANON/SERVICE keys from 'supabase status --workdir $WORK -o env'."
