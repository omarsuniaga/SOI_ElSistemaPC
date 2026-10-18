# Evidencia — validación en navegador del portal público (2026-10-18)

Entorno: navegador integrado de la app · pila Supabase **local** `docqr` (GoTrue + PostgREST + Storage reales) ·
sitio público compilado con `VITE_SUPABASE_URL/ANON_KEY` locales y servido por `serve_dist.mjs --site public`
(aplica los `_redirects` y `_headers` REALES de `apps/public/static`, CSP con el origen local añadido solo a `connect-src`/`img-src`) ·
panel admin servido por `supabase/tests/documentos-qr/browser/` con `VITE_PUBLIC_BASE_URL=http://127.0.0.1:4181` y la misma lista blanca.

## Sitio público (sin sesión)
| # | Comprobación | Resultado observado |
|---|---|---|
| 1 | `/` | Título «Inicio — El Sistema Punta Cana», h1 «El Sistema Punta Cana», lema «Tocamos corazones, cambiamos vidas.», navegación `/` y `/qr-code`, enlace «saltar al contenido», `main#contenido`, `lang=es`; 3 tarjetas de documentos publicados |
| 2 | `/qr-code` | Solo los 3 publicados (ni borrador ni archivado); buscador; `aria-current` en «Documentos» |
| 3 | Clic en una tarjeta | Navega a `/d/concierto-navidad-2026`; título del documento en la pestaña |
| 4 | Acceso directo y recarga en `/d/concierto-navidad-2026` | Se muestra el documento (rewrite 200 a `d.html`) |
| 5 | PDF: «Abrir» / «Descargar» | 200 `application/pdf`, contenido `%PDF-1.4`; descarga con `download=concierto-navidad-2026.pdf`; `rel="noopener noreferrer"` |
| 6 | Borrador, archivado y slug inexistente | Mismo mensaje «Documento no disponible» en los tres |
| 7 | `/ruta-inexistente`, `/admin`, `/adm/clases-hoy`, `/sw.js`, `/manifest.json`, `/signage/`, `/fin` | **404 real** (`404.html`); `/`, `/qr-code`, `/qr-code/`, `/d/<slug>` → 200 |
| 8 | Cabeceras de `/d/x` | `Cache-Control: no-store`, `X-Robots-Tag: noindex, nofollow`; CSP `default-src 'none'`, sin `unsafe-inline` |
| 9 | Móvil 375 px | Sin scroll horizontal; botones a ancho completo (294 px, 50 px de alto) |
| 10 | Almacenamiento del navegador | 0 claves (sin sesión ni tokens) |

Capturas: `portal-publico-inicio.jpg` (escritorio), `portal-publico-visor-movil.jpg` (móvil).

## Panel admin → QR → público
| # | Comprobación | Resultado observado |
|---|---|---|
| 11 | Crear publicación con identificador `gala-primavera-2027` (campo solo al crear) | Se crea en Borrador; URL del QR `http://127.0.0.1:4181/d/gala-primavera-2027`; sin bloqueo (dominio en lista blanca) |
| 12 | Subir PDF v1, publicar, descargar QR PNG (26 740 B) y SVG (1 575 B) | Generados localmente |
| 13 | Escaneo independiente (jsQR) de ambos | PNG nativo/512/256/128 px y SVG 256/512/1024 px → **exactamente** `http://127.0.0.1:4181/d/gala-primavera-2027` (`qr_scan_portal_publico.txt`) |
| 14 | Reemplazar por PDF v2 con motivo | v2 vigente, v1 en historial; URL igual; **SVG del QR idéntico byte a byte** |
| 15 | `/d/gala-primavera-2027` tras el reemplazo | Muestra el título y sirve el contenido de la v2 (no el de la v1) |
| 16 | Despublicar desde el panel | Estado Borrador |
| 17 | `/qr-code` tras despublicar | Ya no lista «Gala de Primavera» |
| 18 | `POST /storage/v1/object/sign` como anon sobre el objeto | 400 (firma nueva falla) |
| 19 | URL firmada **emitida antes** de despublicar | Sigue respondiendo 200 (riesgo residual P5, ≤ 300 s) |

Los rechazos de dominio (variable ausente, otro dominio, http, preview, ruta, credenciales) y el bloqueo visible en el panel se comprueban en las pruebas unitarias `qrDomain.test.js` y `adminQrGate.test.js` (no se repitieron en navegador).
