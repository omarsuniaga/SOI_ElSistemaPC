# Cartelera — Sede Punta Cana (player)

SPA de señalética para la pantalla del vestíbulo. HTML/CSS/JS plano, **sin build
ni dependencias**, pensada para correr en Chromium modo kiosco sobre una
**Raspberry Pi Zero W** (ARMv6, ~430 MB RAM).

## Estructura

```
public/
  index.html   layout de 3 zonas (banner · medios 70% · sidebar horario)
  style.css     tema institucional oscuro, 1280×720, sin fuentes web
  app.js        polling a Supabase + caché localStorage + loop de medios
  config.js     URL/anon key de Supabase, slug de pantalla, intervalos
deploy/
  kiosk.sh      lanza Chromium kiosco con watchdog
  autostart     líneas para el autostart de LXDE
  nightpower.sh apaga/enciende el panel (cron 21:00 / 06:00)
  install.sh    instalador idempotente (se corre EN la Pi)
agent/          (pendiente) agente Python para cachear vídeos de YouTube
```

## Datos (Supabase, proyecto `zmhmdvmyeyswunurcyow`)

Lee **solo** con la anon key, de:
- `signage_v_horario_hoy` / `signage_v_horario_manana` — vistas adaptador
- `signage_v_calendario_mes` — eventos del mes para el banner
- `signage_pantallas` (por `slug`) — layout y modo nocturno
- `signage_media` — playlist; imágenes/vídeos del bucket público `signage`

Sin realtime: refresca por polling (3–15 min). Un corte de red **no** deja la
pantalla en blanco (caché en localStorage).

## Desplegar / actualizar

Desde el equipo de desarrollo:

```bash
rsync -az --delete public deploy omarviolin@10.0.0.21:~/signage/
ssh omarviolin@10.0.0.21 'bash ~/signage/deploy/install.sh'
```

Primera vez, en la Pi (sudo, una sola vez):

```bash
sudo apt-get install -y unclutter
echo 'gpu_mem=128' | sudo tee -a /boot/config.txt
sudo reboot
```

## Probar sin reiniciar

```bash
ssh omarviolin@10.0.0.21 'DISPLAY=:0 bash ~/signage/deploy/kiosk.sh &'
```

## Sembrar contenido de prueba

Mientras no exista el panel admin, se insertan filas a mano en `signage_media`
(ver comentarios en la tabla).
