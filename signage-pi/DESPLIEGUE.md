# Despliegue de la cartelera

La cartelera tiene **una sola fuente** (`public/signage/`) y **dos destinos**.

## 1. Netlify (portal SOI + vista previa del Estudio)

Automático. Al hacer merge de la rama a la que apunta Netlify, se publica:
- El player en `https://<sitio>/signage/`
- El Estudio en el portal ADM → Sistema & Accesos → **Cartelera / Pantalla**
  (embebe `/signage/?preview=1` en un iframe)

`public/_headers` incluye una regla para `/signage/*`:
`X-Frame-Options: SAMEORIGIN` (el portal necesita embeberlo; sigue bloqueando
otros orígenes vía `frame-ancestors 'self'`).

## 2. Raspberry Pi del vestíbulo

Manual, con un comando:

```bash
bash scripts/deploy-signage-pi.sh            # destino por defecto: omarviolin@10.0.0.21
bash scripts/deploy-signage-pi.sh user@host  # otro destino
```

Hace:
1. `rsync public/signage/` → `pi:~/signage/public/`
2. `rsync signage-pi/`     → `pi:~/signage/deploy/`
3. reinicia el navegador del kiosco (el watchdog lo relanza en ~5 s)

La primera carga tras reiniciar tarda 1–3 min (hardware Pi Zero W).

### Primera vez en la Pi (una sola vez, con sudo)

```bash
bash ~/signage/deploy/install.sh        # autostart LXDE + cron modo nocturno
bash ~/signage/deploy/instalar-web.sh   # servidor de vista previa en :8080
sudo apt-get install -y unclutter
```

## Qué NO se despliega manualmente

El **horario** y el **calendario** que muestra la pantalla salen de las vistas
`signage_v_*` de Supabase (datos vivos de SOI). No hay que tocar nada.
