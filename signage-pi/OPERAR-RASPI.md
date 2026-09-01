# Operar la Raspberry de la cartelera (para cualquier agente: Codex, Claude, humano)

Guía portable y autocontenida. Cualquier CLI con acceso a shell en **esta
máquina** puede seguirla — la llave SSH ya está puesta.

## Acceso

```bash
ssh omarviolin@10.0.0.21        # llave ~/.ssh/id_ed25519 (sin contraseña)
```

Si "No route to host": la Pi está apagada / reiniciando / cambió de red.
Reintentar en bucle; si sigue, avisar al usuario (que mire el TV y el router).

## Qué es

- **Raspberry Pi Zero W** (ARMv6, 1 núcleo, ~365 MB RAM). TODO tiene que ser ligero.
- Muestra una cartelera (digital signage) en un TV de 32" por HDMI.
- Navegador: **`surf`** (WebKitGTK). Chromium NO funciona (binario armv7).
- Proyecto en la Pi: `/home/omarviolin/signage/` — `public/` (la web) + `deploy/`.
- Proyecto en dev: `~/projects/signage-player/` (repo git).
- Datos: Supabase proyecto `zmhmdvmyeyswunurcyow`, tablas/vistas `signage_*`.

## Reglas de oro

1. **NUNCA** `pkill -f "<patrón>"` si `<patrón>` está en tu propio comando SSH →
   te matas la sesión (`rc=255`). Usa PIDs (`ps -eo pid,args | grep`) o `pkill -x`.
2. `surf` necesita `WEBKIT_DISABLE_COMPOSITING_MODE=1` (ya está en `kiosk.sh`).
3. No hay window manager → la ventana se dimensiona con `xdotool` (lo hace `kiosk.sh`).
4. Mirar `free -m` después de cada cambio. Si `available` < 40 MB, algo va mal.
5. Cambios de contenido = filas en `signage_media` / `signage_pantallas.layout`.
   NO tocar ninguna otra tabla (es la BD de todo el colegio).

## Desplegar cambios del player

```bash
cd ~/projects/signage-player
rsync -az --delete public deploy omarviolin@10.0.0.21:~/signage/
ssh omarviolin@10.0.0.21 'chmod +x ~/signage/deploy/*.sh'
# reiniciar surf (el watchdog de kiosk.sh lo relanza en ~5 s):
ssh omarviolin@10.0.0.21 'P=$(pgrep -x surf); [ -n "$P" ] && kill $P'
```

## Ver qué se está mostrando (captura)

```bash
ssh omarviolin@10.0.0.21 'DISPLAY=:0 scrot -o /tmp/cartelera.png'
scp omarviolin@10.0.0.21:/tmp/cartelera.png /tmp/cartelera.png
# abrir /tmp/cartelera.png
```

La primera carga tras reiniciar tarda **1–3 min** (hardware lento). Esperar.

## Diagnóstico

```bash
ssh omarviolin@10.0.0.21 'uptime; free -m | head -2; \
  pgrep -af "surf|WebKitWebProcess|kiosk"; tail -20 ~/signage/kiosk.log'
```

## Arrancar el kiosco a mano (si no corre)

```bash
ssh omarviolin@10.0.0.21 'setsid nohup bash ~/signage/deploy/kiosk.sh \
  >/dev/null 2>&1 </dev/null & echo lanzado'
```

## Editar contenido por SQL (mientras no exista el panel admin en producción)

```sql
-- nueva imagen (subirla antes al bucket 'signage')
insert into signage_media (tipo, titulo, storage_path, duracion_seg, orden, activo)
values ('imagen', 'Aviso', 'subidos/mi-archivo.jpg', 12, 50, true);

-- cambiar el diseño de zonas
update signage_pantallas set layout = layout || '{"footer":{"visible":true,"contenido":"texto","texto":"..."}}'::jsonb
where slug = 'punta-cana-vestibulo';
```

## Prompt para pasarle a Codex u otro modelo

> Tengo una Raspberry Pi Zero W que muestra una cartelera en un TV. Entra por
> `ssh omarviolin@10.0.0.21` (llave ya configurada). Lee y sigue el archivo
> `~/projects/signage-player/OPERAR-RASPI.md`. Necesito que [DESCRIBE LA TAREA].
> Es hardware muy limitado (ARMv6, 365 MB RAM): cambios ligeros, verifica con
> `free -m` y con una captura de pantalla. No toques tablas de Supabase que no
> empiecen por `signage_`.
