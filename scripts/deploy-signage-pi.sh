#!/bin/bash
# Despliega el player de la cartelera a la Raspberry Pi del vestíbulo.
#
#   El player (public/signage/) es la MISMA fuente que sirve Netlify en /signage/.
#   Aquí solo se copia a la Pi + se sincronizan los scripts del kiosco.
#
# Uso:  bash scripts/deploy-signage-pi.sh [usuario@host]
set -euo pipefail

TARGET="${1:-omarviolin@10.0.0.21}"
ROOT="$(cd "$(dirname "$0")/.." && pwd)"

echo "==> Desplegando cartelera a $TARGET"

rsync -az --delete "$ROOT/public/signage/" "$TARGET:~/signage/public/"
rsync -az --delete "$ROOT/signage-pi/"     "$TARGET:~/signage/deploy/"

ssh "$TARGET" '
  chmod +x ~/signage/deploy/*.sh 2>/dev/null || true
  # reinicia el navegador del kiosco (el watchdog lo relanza en ~5 s)
  P=$(pgrep -x surf || true); [ -n "$P" ] && kill "$P" || true
  echo "kiosco reiniciando…"
'

echo "==> Listo. La pantalla recarga en unos segundos."
echo "    Vista previa web (si signage-web está activo): http://${TARGET#*@}:8080"
