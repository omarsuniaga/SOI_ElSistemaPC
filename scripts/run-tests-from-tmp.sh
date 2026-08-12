#!/usr/bin/env bash
set -u

if [[ "${1:-}" == "--help" || "${1:-}" == "-h" ]]; then
  cat <<'EOF'
Usage: npm run test:safe -- [vitest paths/options]

Runs Vitest from an isolated Linux temporary directory. The repository is
copied without generated/dependency folders and reuses the installed
node_modules through a symlink. The temporary directory is removed on success
and retained on failure for diagnosis.

Example:
  npm run test:safe -- src/core/router/__tests__/router.test.js
EOF
  exit 0
fi

repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd -P)"
temp_parent="${TMPDIR:-/tmp}"
temp_root="$(mktemp -d "${temp_parent%/}/soi-vitest-XXXXXXXX")"
temp_repo="$temp_root/repo"
mkdir -p "$temp_repo"

cleanup_on_success() {
  rm -rf -- "$temp_root"
}

if [[ ! -x "$repo_root/node_modules/.bin/vitest" ]]; then
  echo "Error: Vitest is not installed at $repo_root/node_modules." >&2
  echo "Temporary directory retained: $temp_root" >&2
  exit 2
fi

echo "Preparing isolated test workspace: $temp_root"
if ! rsync -a \
  --exclude '/node_modules/' \
  --exclude '/dist/' \
  --exclude '/.git/' \
  --exclude '/.claude/' \
  --exclude '/coverage/' \
  "$repo_root/" "$temp_repo/"; then
  echo "Error: repository copy failed." >&2
  echo "Temporary directory retained: $temp_root" >&2
  exit 2
fi

ln -s "$repo_root/node_modules" "$temp_repo/node_modules"

# Importing the repository config through a dependency symlink makes Vitest 4
# workers exit without a summary on this OneDrive mount. Keep it available for
# inspection, but disable auto-loading in the isolated workspace. CLI options
# remain authoritative; DOM suites should pass `--environment=jsdom`.
if [[ -f "$temp_repo/vitest.config.js" ]]; then
  mv "$temp_repo/vitest.config.js" "$temp_repo/vitest.config.repo.js"
fi
if [[ -f "$temp_repo/vite.config.js" ]]; then
  mv "$temp_repo/vite.config.js" "$temp_repo/vite.config.repo.js"
fi

cd "$temp_repo"
result_log="$temp_root/vitest-output.log"
set -o pipefail
"$temp_repo/node_modules/.bin/vitest" run \
  --configLoader runner \
  "$@" 2>&1 | tee "$result_log"
status=$?

# Vitest can terminate workers silently with exit 0 on some OneDrive/WSL
# combinations. A run is only trustworthy when its reporter emits a summary.
if [[ $status -eq 0 ]] && ! grep -Eq 'Test Files|Tests[[:space:]]+[0-9]+' "$result_log"; then
  echo "Vitest returned success without a test summary; treating the run as invalid." >&2
  status=3
fi

if [[ $status -eq 0 ]]; then
  cleanup_on_success
else
  echo "Vitest failed with exit code $status." >&2
  echo "Temporary directory retained: $temp_root" >&2
fi

exit "$status"
