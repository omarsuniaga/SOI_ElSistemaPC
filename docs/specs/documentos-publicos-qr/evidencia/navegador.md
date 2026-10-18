# Evidencia de la validación en navegador (pila local aislada, 2026-10-17/18)

Entorno: navegador integrado de la app · pila Supabase local `docqr` (GoTrue + PostgREST + Storage reales, puertos 54420+) ·
panel admin servido por `supabase/tests/documentos-qr/browser/` (Vite) · página pública servida por `serve_dist.mjs`
(emulador de Netlify con las reglas y la CSP reales de `netlify.toml`). Las acciones se hicieron con los controles reales de la UI
(modal "Nueva publicación", `<input type=file>`, botones Subir/Publicar/Despublicar/PNG/SVG) disparados por script.

| # | Escenario | Resultado observado |
|---|---|---|
| 1 | Admin inicia sesión y crea "Programa de mano — Concierto de Navidad" (categoría Boletín) | Se crea en Borrador; URL `…/d/0f5dadd809`; fecha mostrada = hoy local (17 oct) |
| 2 | Sube PDF (`programa-v1.pdf`) con la UI | Versión v1 vigente, 192 B; bitácora "Subió una nueva versión" |
| 3 | Publica | Estado Publicado; RPC pública devuelve la fila |
| 4 | Descarga QR PNG (26 641 B) y SVG (1 584 B) con los botones | Blobs `image/png` e `image/svg+xml` generados localmente |
| 5 | Escaneo de ambos con un decodificador independiente (jsQR), ver `qr_scan.txt` | PNG (nativo, 512, 256, 128 px) y SVG (256–1024 px) decodifican **exactamente** `http://127.0.0.1:4180/d/0f5dadd809` |
| 6 | Reemplaza por `programa-v2.pdf` con motivo | v2 vigente, v1 en historial; **URL y QR no cambian**; RPC pública sirve v2 |
| 7 | Visitante sin sesión abre `/d/0f5dadd809` (apertura directa y recarga) | Título, descripción, Abrir/Descargar; el PDF descargado contiene el texto de la v2; sin claves de sesión en el navegador |
| 8 | Admin despublica | Estado Borrador; botones Publicar/Archivar |
| 9 | Visitante recarga `/d/0f5dadd809` | "Documento no disponible" |
| 10 | `POST /object/sign` como anon sobre la ruta de v2 | 400 `Object not found` (firma nueva falla) |
| 11 | `/object/authenticated/…` con anon key y `/object/public/…` | 400 / 400 |
| 12 | URL firmada **emitida antes** de despublicar | Sigue respondiendo 200 (riesgo residual R2, ≤ 300 s) |
| 13 | Maestro autenticado: abre el panel, "Nueva publicación" | Lista vacía (RLS); toast "No autorizado" |
| 14 | Maestro: `storage.upload` directo | `new row violates row-level security policy` |
| 15 | Admin crea publicación con imagen (`afiche.png`), publica | v1 vigente PNG; página pública la muestra |
| 16 | Admin intenta subir un ejecutable llamado `falso.pdf` desde la UI | Rechazado en cliente; no se crea versión |

Capturas: `panel-admin-detalle-qr.jpg` (detalle con QR, URL, historial y bitácora), `pagina-publica-imagen.jpg`.
Hallazgo del entorno (no del módulo): `localStorage.demo_mode = 'true'` fuerza el modo Demo también en la página pública
(un visitante normal no lo tiene; en producción solo actúa `VITE_DEMO_MODE`).
