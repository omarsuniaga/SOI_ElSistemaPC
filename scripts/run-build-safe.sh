#!/usr/bin/env bash
set -u

if [[ "${1:-}" == "--help" || "${1:-}" == "-h" ]]; then
  cat <<'EOF'
Usage: npm run build:safe -- [vite build options]

Builds with Vite's runner config loader and writes output to a unique temporary
directory. Successful output is removed; failed output is retained for diagnosis.
EOF
  exit 0
fi

repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd -P)"
temp_parent="${TMPDIR:-/tmp}"
output_dir="$(mktemp -d "${temp_parent%/}/soi-build-XXXXXXXX")"

cd "$repo_root"
"$repo_root/node_modules/.bin/vite" build \
  --configLoader runner \
  --outDir "$output_dir" \
  --emptyOutDir \
  "$@"
status=$?

if [[ $status -eq 0 ]]; then
  rm -rf -- "$output_dir"
else
  echo "Build failed with exit code $status." >&2
  echo "Build output retained: $output_dir" >&2
fi

exit "$status"
