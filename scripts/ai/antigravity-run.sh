#!/usr/bin/env bash
#
# antigravity-run.sh — delegate a task to Antigravity (the `agy` CLI).
#
# Uses your existing Antigravity Pro login (no API key). Best for: large-context
# reads (whole repo, bbdd.md, big reports), long-form text generation (docs,
# READMEs, ADRs, migration guides, SDD proposal/spec/design/tasks drafts),
# codebase-wide analysis, translations, Spanish prose. Fast and cheap on tokens.
# Everything it produces is a DRAFT the orchestrator reviews before use.
#
# Usage:
#   scripts/ai/antigravity-run.sh [options] <task-file>
#   echo "task text" | scripts/ai/antigravity-run.sh [options] -
#
# Options:
#   --write             Allow file edits (--mode accept-edits). Default: plan (read-only).
#   --model <id>        Model id (default: gemini-3.1-pro-high). `agy models` lists them.
#   --effort <lvl>      low|medium|high (default: high).
#   --context <path>    Extra file to inline into the prompt (repeatable, deny-checked).
#   --json              Structured output (--output-format json).
#   --schema <file>     JSON schema to enforce on the final result.
#   --timeout <dur>     agy print-timeout (default: 8m).
#   -h, --help          Show this help.
#
# Output: streamed to stdout; also saved to scratch/ai/antigravity-<ts>.md
set -euo pipefail
# shellcheck source=scripts/ai/_common.sh
source "$(dirname "${BASH_SOURCE[0]}")/_common.sh"

AGY_BIN="${AGY_BIN:-agy}"
command -v "${AGY_BIN}" >/dev/null 2>&1 || AGY_BIN="/c/Users/omare/AppData/Local/agy/bin/agy.exe"
command -v "${AGY_BIN}" >/dev/null 2>&1 || { echo "antigravity-run: 'agy' CLI not found (install Antigravity)" >&2; exit 4; }

MODE="plan"
MODEL="gemini-3.1-pro-high"
EFFORT="high"
OUTFMT="text"
SCHEMA=""
PTIMEOUT="8m"
CONTEXT_FILES=()
TASK_SRC=""

while [ $# -gt 0 ]; do
  case "$1" in
    --write)    MODE="accept-edits"; shift ;;
    --model)    MODEL="$2"; shift 2 ;;
    --effort)   EFFORT="$2"; shift 2 ;;
    --json)     OUTFMT="json"; shift ;;
    --schema)   SCHEMA="$2"; shift 2 ;;
    --timeout)  PTIMEOUT="$2"; shift 2 ;;
    --context)  ai_check_deny "$2"; CONTEXT_FILES+=("$2"); shift 2 ;;
    -h|--help)  sed -n '2,27p' "$0"; exit 0 ;;
    -)          TASK_SRC="-"; shift ;;
    -*)         echo "antigravity-run: unknown option $1" >&2; exit 2 ;;
    *)          TASK_SRC="$1"; shift ;;
  esac
done

[ -n "${TASK_SRC}" ] || { echo "antigravity-run: no task file given (use a path or - for stdin)" >&2; exit 2; }

TASK_TEXT="$( [ "${TASK_SRC}" = "-" ] && cat || cat "${TASK_SRC}" )"

OUT="${AI_OUT_DIR}/antigravity-$(ai_ts).md"
PROMPT_FILE="$(mktemp)"
trap 'rm -f "${PROMPT_FILE}"' EXIT

{
  ai_guardrails
  printf '%s\n' "${TASK_TEXT}"
  for f in "${CONTEXT_FILES[@]:-}"; do
    [ -n "$f" ] || continue
    printf '\n\n--- context: %s ---\n' "$f"
    cat "$f"
  done
} > "${PROMPT_FILE}"

echo "antigravity-run: model=${MODEL} effort=${EFFORT} mode=${MODE} -> ${OUT}" >&2

cd "${REPO_ROOT}"
# `agy`: --prompt is the alias for --print and puts it in non-interactive mode.
# Keep --prompt LAST and attach its value with '=' so the flag parser can't
# swallow a following flag as the prompt text.
AGY_ARGS=(
  --mode "${MODE}"
  --model "${MODEL}"
  --effort "${EFFORT}"
  --add-dir "${REPO_ROOT}"
  --print-timeout "${PTIMEOUT}"
  --output-format "${OUTFMT}"
)
[ -n "${SCHEMA}" ] && AGY_ARGS+=(--json-schema "${SCHEMA}")
"${AGY_BIN}" "${AGY_ARGS[@]}" --prompt="$(cat "${PROMPT_FILE}")" | tee "${OUT}"

echo "antigravity-run: output saved to ${OUT}" >&2
