#!/usr/bin/env bash
set -euo pipefail

repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd -P)"
cd "$repo_root"

fail() { echo "SAFE ABORT: $*" >&2; exit 2; }
command -v supabase >/dev/null || fail "Supabase CLI is required."
command -v docker >/dev/null || fail "Docker is required for an isolated local stack."
[[ -f supabase/config.toml ]] || fail "supabase/config.toml is missing."

# Fail before creating or starting anything when remote-oriented configuration
# is present. The actual run happens in a fresh, deliberately unlinked copy.
for name in SUPABASE_ACCESS_TOKEN SUPABASE_DB_URL DATABASE_URL PGHOST SUPABASE_URL VITE_SUPABASE_URL SUPABASE_SERVICE_ROLE_KEY VITE_SUPABASE_SERVICE_ROLE_KEY SUPABASE_ANON_KEY VITE_SUPABASE_ANON_KEY; do
  [[ -z "${!name:-}" ]] || fail "$name must be unset."
done
docker info >/dev/null 2>&1 || fail "Docker daemon is unavailable."

work_dir="$(mktemp -d)"
stack_started=0
cleanup() {
  if [[ "$stack_started" == 1 && -d "$work_dir/repo" ]]; then
    (cd "$work_dir/repo" && supabase stop --no-backup >/dev/null 2>&1) || true
  fi
  rm -rf -- "$work_dir"
}
trap cleanup EXIT INT TERM

mkdir -p "$work_dir/repo/supabase"
cp supabase/config.toml "$work_dir/repo/supabase/config.toml"
cp -R supabase/migrations "$work_dir/repo/supabase/migrations"
cp -R supabase/tests "$work_dir/repo/supabase/tests"
cd "$work_dir/repo"

# Give the disposable stack a unique identity and non-default ports so it
# cannot attach to or reset an existing developer stack.
unique_id="soi-shadow-test-$$"
sed -i -E "s/^project_id = .*/project_id = \"$unique_id\"/" supabase/config.toml
sed -i -E '0,/^port = 54321$/s//port = 55321/' supabase/config.toml
sed -i -E '0,/^port = 54322$/s//port = 55322/' supabase/config.toml
sed -i -E '0,/^shadow_port = 54320$/s//shadow_port = 55320/' supabase/config.toml
[[ ! -e supabase/.temp/project-ref ]] || fail "Disposable copy unexpectedly contains a project link."

export SUPABASE_TELEMETRY_DISABLED=1
stack_started=1
supabase start
status_output="$(supabase status --output json)"
node -e '
  const value = JSON.parse(process.argv[1]);
  const strings = [];
  const visit = x => {
    if (typeof x === "string") strings.push(x);
    else if (Array.isArray(x)) x.forEach(visit);
    else if (x && typeof x === "object") Object.values(x).forEach(visit);
  };
  visit(value);
  const endpoints = strings.filter(x => /^(https?|postgres(?:ql)?):\/\//.test(x));
  if (!endpoints.length || endpoints.some(x => {
    try { const h = new URL(x).hostname; return h !== "127.0.0.1" && h !== "localhost" && h !== "::1"; }
    catch { return true; }
  })) process.exit(2);
' "$status_output" || fail "Every Supabase endpoint must be loopback-only."
supabase db reset --local
supabase test db --local
