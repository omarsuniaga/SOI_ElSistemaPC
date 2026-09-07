# shellcheck shell=bash
# Shared helpers for external-agent delegation wrappers (codex-run.sh, gemini-run.sh).
# Not executable on its own — sourced by the wrappers.

set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
AI_OUT_DIR="${REPO_ROOT}/scratch/ai"
mkdir -p "${AI_OUT_DIR}"

# Timestamp for output file names.
ai_ts() { date -u +%Y%m%dT%H%M%SZ; }

# Context paths that must never be handed to an external model.
# Applied to any --context file the caller passes. The agent's own filesystem
# access is fenced separately by .codexignore / .geminiignore at the repo root.
AI_DENY_REGEX='(^|/)\.env($|\.)|\.local$|\.pem$|\.key$|\.p12$|\.pfx$|(^|/)auth\.json$|auth_info_baileys|\.baileys-store\.json$|\.pdf$|(^|/)listado-alumnos-|(^|/)postulados-|mojibake-log-.*\.csv$'

# check_deny <path...> — abort if any path looks sensitive.
ai_check_deny() {
  local p
  for p in "$@"; do
    if printf '%s\n' "$p" | grep -Eiq "${AI_DENY_REGEX}"; then
      echo "ai-run: refusing to send sensitive path to external model: $p" >&2
      exit 3
    fi
  done
}

# Guardrail preamble prepended to every delegated task.
ai_guardrails() {
  cat <<'EOF'
[ROLE] You are an external specialist working under a Claude Code orchestrator on
the SOI_ElSistemaPC repository. Your output is a DRAFT that the orchestrator will
review before anything is merged or executed.

[HARD RULES]
- Never read, echo, summarize, or transmit: .env / .env.* / *.local files, API
  keys, tokens, auth.json, WhatsApp/Baileys session files, or any PDF/CSV that
  contains personal data about students or applicants. If a task seems to need
  them, stop and say so instead.
- Stay strictly inside the task scope below. Do not refactor, rename, or "improve"
  unrelated code or files.
- Follow existing repo conventions and patterns. Write prose in the language of
  the surrounding docs (Spanish unless told otherwise).
- Be explicit about assumptions, uncertainties, and anything you could not verify.

[TASK]
EOF
}
