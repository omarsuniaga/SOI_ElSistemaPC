#!/usr/bin/env bash
#
# codex-run.sh — delegate a task to Codex (GPT-5).
#
# Best for: precise multi-file code edits against a clear spec, debugging concrete
# failures, writing tests / running the TDD red->green loop, second-opinion code
# review. Codex has its own sandbox and verifies its own changes.
#
# Usage:
#   scripts/ai/codex-run.sh [options] <task-file>
#   echo "task text" | scripts/ai/codex-run.sh [options] -
#
# Options:
#   --write              Allow file edits (sandbox: workspace-write). Default: read-only.
#   --model <id>         Override model (default: Codex config, currently gpt-5).
#   --context <path>     Extra file to inline into the prompt (repeatable, deny-checked).
#   --schema <file>      JSON Schema for the agent's final structured response.
#   -h, --help           Show this help.
#
# Output: streamed to stdout; final message also saved to scratch/ai/codex-<ts>.md
set -euo pipefail
# shellcheck source=scripts/ai/_common.sh
source "$(dirname "${BASH_SOURCE[0]}")/_common.sh"

SANDBOX="read-only"
MODEL=""
SCHEMA=""
CONTEXT_FILES=()
TASK_SRC=""

while [ $# -gt 0 ]; do
  case "$1" in
    --write)   SANDBOX="workspace-write"; shift ;;
    --model)   MODEL="$2"; shift 2 ;;
    --schema)  SCHEMA="$2"; shift 2 ;;
    --context) ai_check_deny "$2"; CONTEXT_FILES+=("$2"); shift 2 ;;
    -h|--help) sed -n '2,25p' "$0"; exit 0 ;;
    -)         TASK_SRC="-"; shift ;;
    -*)        echo "codex-run: unknown option $1" >&2; exit 2 ;;
    *)         TASK_SRC="$1"; shift ;;
  esac
done

[ -n "${TASK_SRC}" ] || { echo "codex-run: no task file given (use a path or - for stdin)" >&2; exit 2; }

TASK_TEXT="$( [ "${TASK_SRC}" = "-" ] && cat || cat "${TASK_SRC}" )"

OUT="${AI_OUT_DIR}/codex-$(ai_ts).md"
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

echo "codex-run: sandbox=${SANDBOX} model=${MODEL:-<config>} -> ${OUT}" >&2

# shellcheck disable=SC2086
codex exec \
  --sandbox "${SANDBOX}" \
  --skip-git-repo-check \
  -C "${REPO_ROOT}" \
  ${MODEL:+-m "${MODEL}"} \
  ${SCHEMA:+--output-schema "${SCHEMA}"} \
  -o "${OUT}" \
  - < "${PROMPT_FILE}"

echo "codex-run: final message saved to ${OUT}" >&2
