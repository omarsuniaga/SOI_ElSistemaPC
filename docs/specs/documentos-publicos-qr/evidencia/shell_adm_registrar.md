# Evidencia — arreglo del registrar `documentos-publicos` (shell real de ADM, 2026-10-18)

Entorno: build de producción de la app completa (`vite build`, `adm.html`) servido por `serve_dist.mjs` (aplica `_redirects` + `netlify.toml`
reales del dist), contra la pila Supabase local `docqr` (GoTrue, PostgREST, Storage reales). La sesión se inyectó con el endpoint real de
`/auth/v1/token` (el login del portal consulta tablas del SOI ausentes de la pila mínima). Cuentas locales descartables: admin,
coordinación académica y maestro. Perfil `profiles` con la política de lectura propia de producción.

| # | Comprobación | Resultado observado |
|---|---|---|
| 1 | Admin entra a `/adm` | Shell real «SOI · Administración» con 5 grupos de menú; el ítem «Documentos públicos y QR» existe con `data-route="documentos-publicos"` |
| 2 | Clic en el ítem del menú | URL `/adm/documentos-publicos`, vista «Documentos públicos» con «Nueva publicación»; ítem activo en el menú (`shell-adm-menu-documentos-publicos.jpg`) |
| 3 | Deep-link: abrir `/adm/documentos-publicos` directamente (recarga) | Carga la vista |
| 4 | Crear «Prueba desde el shell ADM» con identificador `prueba-shell-adm` | Borrador creado; QR visible con `http://127.0.0.1:4181/d/prueba-shell-adm` (dominio en lista blanca); en build de producción con `VITE_DOCS_SERVER_VERIFY=false` las subidas aparecen **bloqueadas** (`#dpUploadsBlocked`) |
| 5 | Coordinación académica abre `/adm/documentos-publicos` | Ve el shell y el menú del portal ADM; la vista muestra **«Acceso restringido — Solo administradores…»**, sin botón «Nueva publicación» |
| 6 | Maestro abre la misma URL | Portal ADM: **«Sin acceso a SOI · Administración»** (sin menú ni vista) |

Antes del arreglo la ruta no existía: `registerRoutesDocumentosPublicos` estaba importado pero ausente del arreglo `allRegistrars`.
Nota de entorno: el emulador `serve_dist.mjs` se corrigió para aplicar también el `_redirects` del dist (Netlify lo procesa antes que `netlify.toml`),
sin lo cual `/adm` caía en el catch-all del portal de maestros.
