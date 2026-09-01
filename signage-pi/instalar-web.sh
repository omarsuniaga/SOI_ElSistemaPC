#!/bin/bash
# Instala el servidor de vista previa de la cartelera (puerto 8080, sin root).
# Ejecutar EN la Raspberry:  bash ~/signage/deploy/instalar-web.sh
set -e
sudo cp ~/signage/deploy/signage-web.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable --now signage-web
sleep 2
systemctl is-active signage-web
IP=$(hostname -I | awk '{print $1}')
echo
echo "Vista previa de la cartelera en:"
echo "   http://$IP:8080"
echo "   http://raspberrypi.local:8080"
