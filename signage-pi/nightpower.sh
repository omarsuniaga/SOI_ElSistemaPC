#!/bin/bash
# Apaga / enciende el panel por la noche. Se llama desde cron.
#   nightpower.sh off   |   nightpower.sh on
export DISPLAY="${DISPLAY:-:0}"
LOG="/home/omarviolin/signage/kiosk.log"

case "${1:-}" in
  off)
    xset dpms force off 2>/dev/null || true
    vcgencmd display_power 0 2>/dev/null || true
    echo "$(date '+%F %T') pantalla OFF" >> "$LOG"
    ;;
  on)
    vcgencmd display_power 1 2>/dev/null || true
    xset dpms force on 2>/dev/null || true
    xset s reset 2>/dev/null || true
    echo "$(date '+%F %T') pantalla ON" >> "$LOG"
    ;;
  *)
    echo "uso: $0 off|on"; exit 1;;
esac
