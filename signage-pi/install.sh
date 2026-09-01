#!/bin/bash
# Instala / actualiza la cartelera en la Raspberry.
# Ejecutar EN la Raspberry:  bash ~/signage/deploy/install.sh
set -e

DEST="/home/omarviolin/signage"
AUTOSTART="/home/omarviolin/.config/lxsession/LXDE-pi/autostart"

echo "==> permisos de scripts"
chmod +x "$DEST"/deploy/*.sh

echo "==> autostart de LXDE"
mkdir -p "$(dirname "$AUTOSTART")"
touch "$AUTOSTART"
add() { grep -qxF "$1" "$AUTOSTART" || echo "$1" >> "$AUTOSTART"; }
add "@xset s off"
add "@xset s noblank"
add "@xset -dpms"
add "@bash $DEST/deploy/kiosk.sh"

echo "==> cron modo nocturno (21:00 off / 06:00 on)"
CRON_OFF="0 21 * * * DISPLAY=:0 $DEST/deploy/nightpower.sh off"
CRON_ON="0 6 * * * DISPLAY=:0 $DEST/deploy/nightpower.sh on"
( crontab -l 2>/dev/null | grep -v 'nightpower.sh' ; echo "$CRON_OFF" ; echo "$CRON_ON" ) | crontab -

echo
echo "== FALTA (requiere sudo, hazlo a mano una vez): =="
echo "  sudo apt-get install -y unclutter"
echo "  # subir la RAM de la GPU para vídeo (Zero W):"
echo "  echo 'gpu_mem=128' | sudo tee -a /boot/config.txt"
echo "  sudo reboot"
echo
echo "Listo. Tras el reboot arranca sola en modo kiosco."
