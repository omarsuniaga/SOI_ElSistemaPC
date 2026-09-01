# Cartelera / Pantalla informativa — Handoff

**Última actualización:** 2026-09-01
**Rama:** `feat/signage-pantalla-informativa` (aún sin merge a su trunk)
**Estado:** funcionando de punta a punta en el TV real; el Estudio construido y
verificado headless, **falta probarlo visualmente en el portal corriendo**.

Cartelera digital para el vestíbulo de **Sede Punta Cana** ("El Sistema Punta
Cana / FUNEYCA-PC"): un TV de 32" muestra marca + reloj + próximo evento,
una rotación de imágenes/vídeos, y el horario de clases de hoy y mañana.

---

## 1. TL;DR — qué es cada pieza

| Pieza | Dónde | Qué hace |
|---|---|---|
| **Player** | `public/signage/` | La página que se ve en el TV. HTML/CSS/JS **sin build**. Se publica en Netlify en `/signage/` y se copia a la Raspberry. |
| **Estudio** | `src/modules/signage-admin/` | Módulo del portal Admin. `<iframe>` con el player en vivo + panel de edición. |
| **Datos** | Supabase `zmhmdvmyeyswunurcyow`, tablas/vistas `signage_*` | Config de zonas, playlist de medios, y vistas de solo lectura del horario/calendario de SOI. |
| **Raspberry** | Pi Zero W en `10.0.0.21` (`omarviolin`) | Corre `surf` (navegador) en modo kiosco apuntando a la copia local del player. |
| **Deploy Pi** | `scripts/deploy-signage-pi.sh` + `signage-pi/` | rsync del player + scripts del kiosco a la Pi. |

---

## 2. Arquitectura — un solo player, tres modos

El **mismo** `public/signage/index.html` sirve para todo. `app.js` detecta el modo:

```
                    ┌───────────────────────────┐
                    │  Supabase  (signage_*)     │
                    └───┬───────────────┬────────┘
        lee (anon key)  │               │  escribe (sesión admin)
                        │               │
   ┌────────────────────┴───┐    ┌──────┴─────────────────────────┐
   │  PLAYER  (device)      │    │  ESTUDIO  (src/modules/…)      │
   │  Raspberry / Netlify   │    │  portal Admin                  │
   │  file:// en la Pi      │    │  ┌──────────────────────────┐  │
   │  polling cada 2-3 min  │    │  │ <iframe                  │  │
   └───────────────────────-┘    │  │  src="/signage/?preview=1"│ │
                                 │  │  → modo PREVIEW          │  │
   Modos de app.js:              │  │  datos por postMessage   │  │
   · device  → device.js marca   │  └──────────────────────────┘  │
     la copia y habilita consulta│  + panel de edición reactivo   │
   · preview → ?preview=1; layout/│  "Guardar" persiste en la BD  │
     marca/media por postMessage;└────────────────────────────────┘
     horario/calendario reales
   · web     → carga suelta en Netlify: muestra un aviso, NO consulta nada
```

- **`device.js`** lo escribe `deploy-signage-pi.sh` en la Pi (`--exclude device.js`
  para que `rsync --delete` no lo borre). En Netlify da 404 → modo `web`.
- El **horario y el calendario NUNCA se editan** en el Estudio: salen de las
  vistas adaptador (datos vivos de los módulos Clases / Calendario de SOI).

---

## 3. Base de datos (Supabase `zmhmdvmyeyswunurcyow` "SOI_DDBB_EL_SISTEMAPC")

### Migraciones (todas aditivas, ya aplicadas a remoto vía MCP)

| Archivo | Contenido |
|---|---|
| `20260831120000_signage_pantalla_informativa.sql` | Tablas base, vistas adaptador, bucket, RLS, seed, realtime |
| `20260901090000_signage_anon_read_access.sql` | Lectura anónima de vistas/tablas `signage_*`; bucket → público |
| `20260901120000_signage_pantalla_identidad.sql` | Columnas `institucion`, `siglas` |
| `20260901140000_signage_menu_portales.sql` | Columna `menu_portales text[]` |

### Tablas nuevas

- **`signage_pantallas`** — una fila por pantalla (hoy: `slug='punta-cana-vestibulo'`).
  - `layout jsonb` — config de zonas (ver §4).
  - `institucion`, `siglas` — marca de la cabecera.
  - `modo_nocturno jsonb` `{activo, desde, hasta}` — actualmente `activo:false` (fase montaje).
  - `menu_portales text[]` — en qué portales departamentales aparece el menú "Cartelera".
- **`signage_media`** — playlist declarativa. `tipo` (`imagen`|`video`|`youtube`),
  `storage_path` | `youtube_url`, `titulo`, `credito`, `duracion_seg`, `orden`,
  `activo`, `vigente_desde`/`vigente_hasta`. **El caché de YouTube vive en la Pi, no en la BD.**

### Vistas adaptador (SOLO LECTURA — el "contrato" con el player)

- `signage_v_horario_hoy` / `signage_v_horario_manana` — clases del día resueltas
  en `America/Santo_Domingo`. Hoy leen de **`clase_horarios`** (la rejilla semanal
  viva); si el rediseño de horarios migra a la tabla `horarios`, se reescribe
  **solo estas vistas**.
- `signage_v_horario_semana` — la rejilla semanal normalizada (base de las otras).
- `signage_v_calendario_mes` — eventos del mes en curso + siguiente, de
  `calendario_institucional` (estado `'programado'`).
- **`security_invoker = false`** a propósito: las vistas corren como `postgres`
  (BYPASSRLS) para poder mostrar el horario **completo** del colegio; con la
  norma `security_invoker=true` de SOI saldrían vacías (RLS por-maestro).
  El linter marca esto como `security_definer_view` ERROR — es intencional.

### Storage

Bucket **`signage`** — **público**. Imágenes/vídeos subidos en `subidos/`,
slides de prueba en `demo/`.

### RLS

Convención igual que `hermes_kanban_cards`: SELECT `authenticated` + `anon`,
escritura solo `es_admin()`. **`anon` puede leer todo `signage_*`** (era
necesario para que la Pi consulte con la anon key) — ver §8.

---

## 4. El player (`public/signage/`)

**Sin build.** Scripts clásicos, `window.SIG.*`. Corre en WebKitGTK 2.38 (Pi) y
en cualquier navegador moderno (Estudio).

```
public/signage/
  index.html
  css/app.css              réplica del diseño de Claude Design (navy + oro, serif/sans, --u fluido)
  js/
    config.js              URL/anon key de Supabase, screenSlug, intervalos, defaultLayout
    core.js                helpers: $, api (fetch), time (TZ RD), cache, mergeLayout
    components/
      cabecera.js           marca + próximo evento (rota) + reloj
      visualizador.js       slideshow img/video con crossfade + pie de foto
      horario.js            HOY + MAÑANA agrupados por hora, en una columna, con auto-ajuste
    app.js                 orquestador: modo → carga → modelo → component.update(model)
```

### Esquema de `layout` (jsonb en `signage_pantallas.layout`)

```json
{
  "cabecera":     { "visible": true, "marca": true, "reloj": true, "fecha": true, "evento": true },
  "visualizador": { "visible": true, "ajuste": "contain", "pie": true, "pieTexto": "" },
  "horario":      { "visible": true, "anchoPct": 27.5, "hoy": true, "manana": true,
                    "instrumento": false, "meta": false }
}
```

`mergeLayout()` (en `core.js` y en `api/signageAdminApi.js` — **mantener sincronizados**)
fusiona esto sobre `defaultLayout`.

### Contrato postMessage (Estudio ↔ iframe)

```js
// Estudio → iframe
{ type: 'signage:model', model: { layout, marca, media } }
{ type: 'signage:ping' }
// iframe → Estudio
{ type: 'signage:ready' }
{ type: 'signage:zone-click', zone: 'cabecera' | 'visualizador' | 'horario' }
```

### Comportamiento clave

- **Polling** cada 2-3 min (horario/media), 15 min (calendario/pantalla).
- Los refrescos **NO reinician la rotación**: cada componente lleva una firma de
  su contenido y solo reconstruye si algo cambió (bug arreglado en `725e8ccd`).
- **Caché en localStorage**: un corte de red no deja la pantalla en blanco.
- **Recarga completa** una vez al día a las `config.dailyReloadHour` (4 a.m.).
- **Modo nocturno**: overlay de reloj si `modo_nocturno.activo` y hora en ventana.

---

## 5. El Estudio (`src/modules/signage-admin/`)

```
src/modules/signage-admin/
  api/signageAdminApi.js       CRUD signage_pantallas / signage_media / bucket + helpers
  views/signageStudioView.js   <iframe> 16:9 + panel en acordeón
  styles/signage-admin.css
  signage-admin.router.js      registra la ruta 'signage-pantalla'
```

- **Registrado en el portal Admin principal**: `src/main.js` (`MODULES_REGISTRY`
  + `NAV_GROUPS` grupo "Sistema & Configuración").
- **También en `allRegistrars.js`** para que la ruta resuelva en los portales
  departamentales.
- **Autorización por departamento**: `signage_pantallas.menu_portales`. El Estudio
  tiene la sección "Visibilidad del menú" (switches ADM/ACM/COM/FIN/LOG/TECNICO/LUT).
  `adminPortalShell.injectCarteleraNav()` lee esa lista al arrancar cada portal
  de depto y añade el grupo "Cartelera" si corresponde.
- **Pendiente**: catalogarlo en `src/core/moduleCatalog.js` (hoy sale un aviso
  benigno en "Diagnóstico Portales").

### Secciones del panel

Cabecera (institución/siglas + toggles) · Visualizador — contenido (biblioteca
de medios: subir / YouTube / reordenar ▲▼ / editar en modal / activar / vigencia)
· Horario (hoy/mañana, detalle por clase, ancho) · Visualizador — ajustes
(ajuste de imagen, pie de foto) · Visibilidad del menú.

"Guardar" persiste `layout` + `institucion`/`siglas`. Los medios y la visibilidad
se guardan **al momento**.

---

## 6. La Raspberry Pi

| | |
|---|---|
| Modelo | **Raspberry Pi Zero W Rev 1.1** — ARMv6, 1 núcleo 1 GHz, ~365 MB RAM (tras `gpu_mem=64`), SO 32-bit Bullseye |
| Acceso | `ssh omarviolin@10.0.0.21` (llave `claude-code@wsl`) o `omarviolin@raspberrypi.local` |
| Navegador | **`surf`** (WebKitGTK 2.38). **Chromium NO** — el binario es armv7, da `Illegal instruction` |
| Estructura en la Pi | `~/signage/public/` (el player) + `~/signage/deploy/` (scripts) |
| TV | HDMI-1, nativo 1600×900. El kiosco **fuerza 1024×768** (WebKit deja la pantalla en blanco a ≥1280 px) |
| WiFi | `wpa_supplicant` clásico. `country=DO`. Hotspot de rescate `wazoski`/`wazoski2026` a `priority=-1`. "Orquesta punta cana" guardada pero **desactivada** (falta clave nueva) |

### Trampas conocidas (⚠️ importante para el próximo que toque esto)

1. **`surf` necesita `WEBKIT_DISABLE_COMPOSITING_MODE=1`** o la pantalla sale en
   blanco (GPU insuficiente). `kiosk.sh` ya lo exporta.
2. **No hay window manager** en esta sesión LXDE → `surf -F` no se pone fullscreen
   solo. `kiosk.sh` fuerza el tamaño con `xdotool` en bucle.
3. **Nunca** `pkill -f "<patrón>"` si `<patrón>` aparece en tu propio comando SSH
   → te matas la sesión (`rc=255`). Usa PIDs explícitos.
4. Comandos SSH que hacen `nohup … &` y retornan enseguida a veces dan `rc=255`;
   usa un solo comando inline (lanza + sleep + captura).
5. Primera carga tras reiniciar: **1-3 min** (hardware lento). No es que esté colgado.
6. 4× discos USB exFAT de respaldo están conectados por un hub — **no son para la
   cartelera** (`sdb1`/OMAR1 tiene corrupción de fs en dmesg).

### Setup inicial de la Pi (una vez, con sudo)

```bash
bash ~/signage/deploy/install.sh        # autostart LXDE + cron modo nocturno (21:00/06:00)
bash ~/signage/deploy/instalar-web.sh   # servidor de vista previa en :8080
sudo apt-get install -y unclutter zram-tools
```

### Autostart

`~/.config/lxsession/LXDE-pi/autostart` → `@bash /home/omarviolin/signage/deploy/kiosk.sh`.
`kiosk.sh` = watchdog: si `surf` muere, lo relanza en ~5 s.

### Seguridad hecha en la Pi (2026-09-01)

Se **detuvo y deshabilitó apache2** (servía `/var/www/html` con scripts viejos y
un **token de Telegram en texto plano** — ya revocado). Backup en
`~/backups/var-www-html-20260901.tgz`. `/var/www/html` (41 MB) sigue en disco pero
no se sirve. **No hay firewall** (`ufw`) — pendiente.

---

## 7. Despliegue

### Netlify (portal + Estudio) — automático

Al hacer merge de la rama. Publica el player en `/signage/` y el Estudio en el
portal Admin. `public/_headers` tiene reglas para `/signage/*`:
`X-Robots-Tag: noindex` + `X-Frame-Options: SAMEORIGIN` (el iframe del Estudio lo
necesita; el global pasó de `DENY` a `SAMEORIGIN` + `frame-ancestors 'self'`).

### Raspberry — manual

```bash
bash scripts/deploy-signage-pi.sh                 # → omarviolin@10.0.0.21
bash scripts/deploy-signage-pi.sh user@host       # otro destino
```

Hace: rsync `public/signage/` → `~/signage/public/`, rsync `signage-pi/` →
`~/signage/deploy/`, escribe `device.js`, reinicia `surf`.

### Editar contenido a mano (mientras el Estudio no esté en producción)

SQL directo por el MCP de Supabase sobre `signage_media` / `signage_pantallas.layout`.
Subir archivos: al bucket `signage/subidos/`.

---

## 8. Seguridad / exposición de datos

**Opción 1 implementada** (`42a3da78`): `noindex` + el modo `web` no consulta nada,
así que abrir `netlify.app/signage/` a pelo no muestra el horario.

**Lo que NO resuelve:** la anon key está en el JS y las vistas `signage_v_*` +
`signage_media` + el bucket siguen siendo legibles con esa key si alguien la
extrae. Para blindaje real (**opción 2**, pendiente):
- Revocar `anon` de las vistas/tablas.
- Cuenta "signage device" de Supabase; la Pi y el preview se autentican.
- Bucket privado + URLs firmadas.
Se evitó por ahora porque la Pi Zero W tiene poco margen para mantener un token.

---

## 9. Decisiones / contexto

- **Hardware:** el usuario NO va a comprar una Pi mejor; hay que optimizar para
  la Zero W. Por eso: sin build, `file://`, ES5, 1024×768, imágenes-primero.
- **Vídeo en el visualizador:** WebKit sin GPU no lo mueve fluido. Pendiente:
  reproductor nativo (`vlc`/`mpv`) por encima del kiosco, o subir `gpu_mem`.
- **Aislamiento (regla del proyecto):** todo esto es aditivo. Lo único que toca
  código existente de SOI: `main.js` (registro + nav), `allRegistrars.js`,
  `adm.js` (se quitó el ítem), `adminPortalShell.js` (inyección de nav opcional),
  `_headers` + `vite.config.js` (X-Frame-Options DENY→SAMEORIGIN). Todo
  documentado en los commits.
- Hubo un intento paralelo con **Codex** sobre el mismo diseño; se descartó y se
  fusionó la versión de esta sesión (`feat/design-refresh` → `master` del repo
  standalone, ya incorporado aquí).

---

## 10. Pendiente

| Prioridad | Tarea |
|---|---|
| Alta | Probar el Estudio visualmente en el portal corriendo (`npm run dev` → `/adm` → Sistema & Configuración → Cartelera / Pantalla) |
| Alta | Merge de `feat/signage-pantalla-informativa` a su trunk (dispara Netlify) |
| Media | Correr `instalar-web.sh` en la Pi (vista previa `:8080`) |
| Media | IP fija (reserva DHCP) + `ufw` en la Pi |
| Media | Reactivar "Orquesta punta cana" con la clave nueva |
| Media | Vídeo real en el visualizador (reproductor nativo / `gpu_mem=128`) |
| Baja | Catalogar `signage-pantalla` en `src/core/moduleCatalog.js` |
| Baja | Opción 2 de seguridad si se decide blindar los datos |
| Baja | Agente Python en la Pi para cachear vídeos de YouTube con `yt-dlp` |

---

## 11. Commits (rama `feat/signage-pantalla-informativa`)

```
d1334e4  chore(eslint): ignora public/signage/
725e8cc  fix: los refrescos de datos ya no reinician la rotación
91d4438  Cartelera como módulo del portal Admin + autorización por depto
42a3da7  opción 1 — no exponer la cartelera como página pública
b3389de  biblioteca de medios con modales + doc de despliegue
a8b3223  migración institucion/siglas
5ec7ded  Estudio de la cartelera con vista previa en vivo
d95b48a  mover el player al SOI + modo preview
b9c8c1d  panel de control de la cartelera (v1, superado por el Estudio)
299f1ee  lectura anónima para la Pi Zero W
11abfd5  migración base pantalla informativa
```

## Docs relacionadas

- `signage-pi/OPERAR-RASPI.md` — runbook portable de la Pi (para Codex / cualquier agente)
- `signage-pi/DESPLIEGUE.md` — los dos destinos de despliegue
- `signage-pi/README.md` — el player standalone (histórico)
