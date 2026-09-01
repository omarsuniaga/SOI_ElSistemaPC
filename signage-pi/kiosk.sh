#!/bin/bash
# Lanza la cartelera en modo kiosco. Watchdog: si el navegador muere, reinicia.
# Arranca desde el autostart de LXDE.
#
# Notas Pi Zero W:
#  - Chromium NO (binario armv7 → Illegal instruction). Se usa surf/WebKitGTK.
#  - WEBKIT_DISABLE_COMPOSITING_MODE=1 o la pantalla sale en blanco (GPU 64/128MB).
#  - No hay window manager fiable → surf no se pone fullscreen solo. Forzamos el
#    tamaño de ventana con xdotool a la resolución de la pantalla.
set -u

URL="file:///home/omarviolin/signage/public/index.html"
LOG="/home/omarviolin/signage/kiosk.log"
MODE="1024x768"          # modo HDMI a forzar (la TV lo escala; 4:3 = pillarbox)
OUT="HDMI-1"

export DISPLAY="${DISPLAY:-:0}"
export WEBKIT_DISABLE_COMPOSITING_MODE=1
export WEBKIT_DISABLE_DMABUF_RENDERER=1

xset s off; xset s noblank; xset -dpms
command -v unclutter >/dev/null && (unclutter -idle 0.5 -root &) || true

# fija el modo de salida (si el modo no existe, no pasa nada)
xrandr --output "$OUT" --mode "$MODE" 2>/dev/null || true
read -r SW SH < <(xrandr | awk '/\*/{split($1,a,"x"); print a[1], a[2]; exit}')
SW="${SW:-1024}"; SH="${SH:-768}"

# espera red (máx ~60 s)
for i in $(seq 1 30); do
  ping -c1 -W2 zmhmdvmyeyswunurcyow.supabase.co >/dev/null 2>&1 && break
  sleep 2
done

echo "$(date '+%F %T') kiosk arrancando (surf) ${SW}x${SH}" >> "$LOG"

# ajusta la ventana de surf a pantalla completa cada pocos segundos (sin WM)
fit_window() {
  for _ in $(seq 1 30); do
    W=$(xdotool search --name "Cartelera" 2>/dev/null | tail -1)
    if [ -n "$W" ]; then
      xdotool windowsize "$W" "$SW" "$SH" 2>/dev/null
      xdotool windowmove "$W" 0 0 2>/dev/null
    fi
    sleep 4
  done
}

while true; do
  surf -F -K -N "$URL" >> "$LOG" 2>&1 &
  SURF=$!
  fit_window &
  FIT=$!
  wait "$SURF"
  kill "$FIT" 2>/dev/null
  echo "$(date '+%F %T') surf salió, reiniciando en 5 s" >> "$LOG"
  sleep 5
done
