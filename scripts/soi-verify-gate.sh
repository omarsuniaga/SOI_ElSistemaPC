#!/usr/bin/env bash
# soi-verify-gate.sh — Gate de verificación para el Carril B (desarrollo autónomo).
#
# Una card del Kanban NO entra a `review` hasta que este script sale con código 0.
# El repo tiene deuda de baseline (tests/lint ya rojos en partes), así que el gate
# mide "¿esta card empeoró algo?", no "¿está todo perfecto?".
#
#   1. Solo-aditivo en rutas protegidas    → .env*, migraciones, edge functions
#   2. Build (vite)                         → debe pasar SIEMPRE (absoluto)
#   3. Lint SOLO de los archivos cambiados  → cero errores nuevos
#   4. Tests del blast-radius               → solo fallos NUEVOS vs baseline bloquean
#
# Uso:
#   scripts/soi-verify-gate.sh [BASE_REF]        # gate normal
#   scripts/soi-verify-gate.sh --record-baseline # regraba scripts/.gate-baseline.txt
set -uo pipefail
cd "$(dirname "$0")/.."

BASELINE_FILE="scripts/.gate-baseline.txt"

# ── modo: regrabar baseline ──────────────────────────────────────────────────
if [ "${1:-}" = "--record-baseline" ]; then
  echo "Corriendo la suite completa para grabar el baseline de fallos conocidos…"
  npx vitest run 2>&1 | grep -E '^ ?(FAIL|×)' | sed -E 's/^[[:space:]]*(FAIL|×)[[:space:]]*//' | sort -u > "$BASELINE_FILE"
  echo "Grabado $BASELINE_FILE ($(wc -l < "$BASELINE_FILE") fallos conocidos). Revisá y commiteá."
  exit 0
fi

BASE_REF="${1:-}"
if [ -z "$BASE_REF" ]; then
  # El trunk de facto es feat/planificacion-clases-rediseño (= producción / Netlify).
  # `origin/master` sigue existiendo pero divergió ~1300 archivos hace >1 mes, así que
  # un merge-base contra master marca como violación todo el historial del trunk.
  # Orden de preferencia: trunk real → default remoto (origin/HEAD) → master → HEAD~1.
  TRUNK_REF="origin/feat/planificacion-clases-rediseño"
  if git rev-parse --verify -q "$TRUNK_REF" >/dev/null; then
    BASE_REF="$(git merge-base HEAD "$TRUNK_REF" 2>/dev/null || echo HEAD~1)"
  elif git rev-parse --verify -q origin/HEAD >/dev/null; then
    BASE_REF="$(git merge-base HEAD origin/HEAD 2>/dev/null || echo HEAD~1)"
  elif git rev-parse --verify -q origin/master >/dev/null; then
    BASE_REF="$(git merge-base HEAD origin/master 2>/dev/null || echo HEAD~1)"
  else
    BASE_REF="HEAD~1"
  fi
fi

FAIL=0
step() { printf '\n\033[1m▶ %s\033[0m\n' "$1"; }
ok()   { printf '  \033[32m✔ %s\033[0m\n' "$1"; }
bad()  { printf '  \033[31mx %s\033[0m\n' "$1"; FAIL=1; }
warn() { printf '  \033[33m! %s\033[0m\n' "$1"; }

CHANGED=$(git diff --name-only --diff-filter=ACMR "$BASE_REF"...HEAD -- 'src/*' | grep -E '\.(js|ts|jsx|tsx|mjs|cjs)$' || true)

# ── 1. Solo-aditivo ──────────────────────────────────────────────────────────
step "Solo-aditivo (base: ${BASE_REF:0:12})"
git diff --name-only "$BASE_REF"...HEAD -- '.env*' | grep -q . \
  && bad ".env* modificado — prohibido" || ok "sin cambios en .env*"

MIG_MOD=$(git diff --name-status "$BASE_REF"...HEAD -- 'supabase/migrations/' | grep -E '^(M|D|R)' || true)
[ -n "$MIG_MOD" ] \
  && { bad "migración existente modificada/borrada:"; echo "$MIG_MOD" | sed 's/^/      /'; } \
  || ok "migraciones: solo archivos nuevos (o ninguno)"

FN_DEL=$(git diff --numstat "$BASE_REF"...HEAD -- 'supabase/functions/' | awk '$2>0 {print $3" (-"$2")"}' || true)
[ -n "$FN_DEL" ] && { warn "edge functions con líneas borradas — revisar a mano:"; echo "$FN_DEL" | sed 's/^/      /'; } \
                 || ok "edge functions: sin borrados"

# ── 2. Build (absoluto) ──────────────────────────────────────────────────────
step "Build (vite)"
npm run build >/tmp/soi-gate-build.log 2>&1 \
  && ok "build OK" \
  || { bad "build falló — /tmp/soi-gate-build.log"; tail -20 /tmp/soi-gate-build.log | sed 's/^/      /'; }

# ── 3. Lint de los archivos cambiados ────────────────────────────────────────
step "Lint (solo archivos cambiados)"
if [ -z "$CHANGED" ]; then
  ok "sin archivos .js/.ts cambiados en src/"
else
  if npx eslint $CHANGED >/tmp/soi-gate-lint.log 2>&1; then
    ok "lint limpio en $(echo "$CHANGED" | wc -l) archivo(s)"
  else
    bad "$(grep -cE '  error  ' /tmp/soi-gate-lint.log || echo '?') error(es) de lint en archivos cambiados"
    grep -E '  error  ' /tmp/soi-gate-lint.log | head -15 | sed 's/^/      /'
  fi
fi

# ── 4. Tests del blast-radius (solo fallos nuevos bloquean) ───────────────────
step "Tests (blast-radius; solo fallos nuevos vs baseline)"
if [ -z "$CHANGED" ]; then
  ok "sin código cambiado — nada que testear"
else
  npx vitest run --changed "$BASE_REF" --passWithNoTests >/tmp/soi-gate-test.log 2>&1 || true
  FAILED=$(grep -E '^ ?(FAIL|×) ' /tmp/soi-gate-test.log | sed -E 's/^[[:space:]]*(FAIL|×)[[:space:]]*//' | sort -u)
  if [ -z "$FAILED" ]; then
    ok "$(grep -oE '[0-9]+ passed' /tmp/soi-gate-test.log | tail -1 || echo 'tests OK')"
  else
    NEW=$(comm -23 <(echo "$FAILED") <(sort -u "$BASELINE_FILE" 2>/dev/null || true))
    KNOWN=$(comm -12 <(echo "$FAILED") <(sort -u "$BASELINE_FILE" 2>/dev/null || true))
    [ -n "$KNOWN" ] && warn "$(echo "$KNOWN" | wc -l) fallo(s) preexistente(s) (en baseline, no bloquean)"
    if [ -n "$NEW" ]; then
      bad "FALLOS NUEVOS introducidos por esta card:"
      echo "$NEW" | sed 's/^/      /'
    else
      ok "sin fallos nuevos (los que hay son baseline conocido)"
    fi
  fi
fi

# ── Resultado ────────────────────────────────────────────────────────────────
printf '\n\033[1m════════════════════════════════\033[0m\n'
[ "$FAIL" -eq 0 ] \
  && printf '\033[32m\033[1m  GATE: PASS — la card puede ir a review\033[0m\n' \
  || printf '\033[31m\033[1m  GATE: FAIL — la card NO entra a review\033[0m\n'
exit "$FAIL"
