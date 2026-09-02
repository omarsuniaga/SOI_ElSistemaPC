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

# Sello de versión que esta copia lleva a la Pi (lo muestra el overlay ?debug=1).
SHA="$(git -C "$ROOT" rev-parse --short HEAD 2>/dev/null || echo nogit)"
BRANCH="$(git -C "$ROOT" rev-parse --abbrev-ref HEAD 2>/dev/null || echo '')"
STAMP="$(date -u '+%Y-%m-%d %H:%M')Z"
VER="$SHA${BRANCH:+ ($BRANCH)} · pi"

echo "==> Desplegando cartelera a $TARGET  [$VER]"

# device.js y build.js los genera la Pi (abajo): se excluyen del rsync para que
# --delete no los borre ni los pise con la copia del repo.
rsync -az --delete --exclude 'device.js' --exclude 'build.js' "$ROOT/public/signage/" "$TARGET:~/signage/public/"
rsync -az --delete "$ROOT/signage-pi/"     "$TARGET:~/signage/deploy/"

ssh "$TARGET" "
  # marca esta copia como 'dispositivo' (habilita las consultas a Supabase).
  # Sin este archivo, el player asume modo web y no consulta nada.
  printf 'window.SIGNAGE_CONFIG.mode = \"device\";\n' > ~/signage/public/device.js
  # sello de versión para el overlay de diagnóstico
  printf 'window.SIGNAGE_BUILD = { ver: \"%s\", at: \"%s\" };\n' '$VER' '$STAMP' > ~/signage/public/build.js
  chmod +x ~/signage/deploy/*.sh 2>/dev/null || true
  # reinicia el navegador del kiosco (el watchdog lo relanza en ~5 s)
  P=\$(pgrep -x surf || true); [ -n \"\$P\" ] && kill \"\$P\" || true
  echo 'kiosco reiniciando…'
"

echo "==> Listo. La pantalla recarga en unos segundos."
echo "    Vista previa web (si signage-web está activo): http://${TARGET#*@}:8080"
