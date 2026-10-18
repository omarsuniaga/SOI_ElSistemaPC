# Portal público institucional — arquitectura de dos sitios (informe de fase)

Fecha: 2026-10-18 (UTC) · Rama `feat/documentos-qr-publicos` · Producción (Supabase `zmhmdvmyeyswunurcyow` y Netlify): **sin cambios**. No se creó ningún sitio Netlify, no se aplicó ninguna migración, no hubo merge ni despliegue, no se crearon recursos facturables.
Documentos relacionados: [`RUNBOOK_DESPLIEGUE_DOS_SITIOS.md`](./RUNBOOK_DESPLIEGUE_DOS_SITIOS.md) · [`INFORME_PILOTO.md`](./INFORME_PILOTO.md) (fase anterior; las referencias a `/d/<slug>` en el dominio admin quedan **sustituidas** por este documento) · [`ESPECIFICACION.md`](./ESPECIFICACION.md) · evidencia en [`evidencia/`](./evidencia/).

## 1. Diagnóstico de la infraestructura actual (solo lectura)

Fuentes: conector Netlify (solo operaciones de lectura), peticiones HTTP públicas y el repositorio. **No se leyeron variables de entorno** (la única operación del conector que las expone está en la herramienta de escritura; no se usó).

| Dato | Valor observado |
|---|---|
| Sitio admin | `soi-el-sistema-pc` (id `886e6f59-…`), `https://soi-el-sistema-pc.netlify.app`, plan `nf_team_dev`, equipo `5fe939dd…` |
| Origen del despliegue | Rama `master` de `github.com/omarsuniaga/SOI_ElSistemaPC`, contexto `production`; último deploy `6acc55a3…` del 2026-10-12, commit `e1c50618` (= `master` actual), `deploy_time` 15 s |
| Framework | Vite |
| Reglas procesadas | 23 redirects, 4 reglas de cabeceras, sin funciones ni edge functions; escaneo de secretos limpio (2 803 archivos) |
| Cabeceras reales (HTTP) | CSP `default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; … connect-src 'self' https://*.supabase.co …`, `X-Frame-Options: SAMEORIGIN`, `Referrer-Policy: strict-origin-when-cross-origin`, HSTS, `X-Content-Type-Options: nosniff`, `Cache-Control: public,max-age=0,must-revalidate` en HTML: **coinciden con `netlify.toml`** |
| Comportamiento de rutas | `/fin`, `/adm/…`, `/signage/`, `/sw.js`, `/manifest.json` responden 200; una ruta desconocida (`/d/xx`) cae en el catch-all `/* → /index.html` |
| Otros sitios del equipo | `elsistemapc-audiciones`, `elsistemapc-demo`, `elsistemapc-demo-2` |
| No verificable con las herramientas disponibles | comando de build, directorio de publicación y variables del sitio admin en la configuración de Netlify (se asume que coinciden con `netlify.toml`: `npm run build`, `dist`; **hay que confirmarlo en la interfaz de Netlify antes de tocar nada**) |

Consecuencia importante: el sitio admin **despliega automáticamente cada commit a `master`**. Por eso esta rama no modifica nada del despliegue admin (§6) y cualquier merge debe hacerse sabiendo que se publica solo.

## 2. Disponibilidad de `elsistemapc.netlify.app`

Evidencia exacta:

1. `get-projects` con búsqueda `elsistemapc` en el equipo: solo `elsistemapc-audiciones`, `elsistemapc-demo`, `elsistemapc-demo-2`. **Ningún sitio llamado `elsistemapc`** en el equipo.
2. `GET https://elsistemapc.netlify.app/` → `404 text/plain` «Not Found - Request ID: …» servido por `Server: Netlify`. Idéntico a un nombre de control inexistente (`this-name-should-not-exist-zz9.netlify.app`) y distinto de los sitios existentes (200 `text/html`).
3. Mismo resultado en `/d/x`.

**Conclusión de la comprobación previa: no había un sitio activo con ese nombre; probablemente libre, sin confirmar.** (Confirmado después por la creación autorizada, ver abajo.) Límite: los subdominios `*.netlify.app` son un espacio global de nombres; un 404 de Netlify no distingue un nombre libre de uno reservado, de un sitio de otro equipo sin deploy publicado o de un nombre recién liberado. **Solo la creación del sitio lo confirma** (puede fallar por «nombre no disponible»).

Decisión: **no se creó el sitio ni se eligió otro nombre.** Hasta que el titular autorice la creación y esta resulte exitosa, **no hay QR definitivos** (el panel los bloquea por diseño, §5). Si el nombre no estuviera disponible, alternativas institucionales a proponer al titular (sin elegir): `elsistemapuntacana`, `elsistema-puntacana`, `sistemapuntacana`, o un dominio propio. Cambiar el nombre solo exige actualizar `VITE_PUBLIC_BASE_URL`/`VITE_PUBLIC_ALLOWED_ORIGINS` del sitio admin y el `connect-src`/`img-src` **no** (dependen de Supabase, no del dominio).

**Actualización — sitio creado con autorización del titular (2026-10-18):** el conector Netlify creó el sitio `elsistemapc` (id `f8578881-f51b-4724-9458-bbbaf07d1df3`, equipo `omareduardo74`, plan `nf_team_dev`). **El nombre estaba disponible: la URL `https://elsistemapc.netlify.app` queda reservada para este sitio.** Estado actual del sitio: **vacío** — sin repositorio enlazado, sin variables, sin ningún deploy (la URL aún no sirve contenido). El conector solo permite crear el proyecto; el enlace al repositorio, el *base directory* y las variables se configuran en la interfaz de Netlify (pasos 1.3–1.5 del runbook). No se publicó nada y **siguen sin existir QR definitivos** hasta cumplir el runbook (deploy del sitio B, migraciones, Edge Function y smoke test).

## 3. Arquitectura final: un repositorio, dos despliegues

```
repo SOI_ElSistemaPC
├─ netlify.toml, vite.config.js, public/, src/…        ← Sitio A (admin): SIN CAMBIOS de despliegue
├─ apps/public/                                         ← Sitio B (público)
│   ├─ netlify.toml  (base directory = apps/public)
│   ├─ vite.config.mjs, *.html (4), src/ (≈9 archivos), static/ (_headers, _redirects, robots.txt)
│   └─ dist/  (artefacto publicado, 13 archivos, ≈17 KB)
├─ src/modules/documentos-publicos/lib/{slug,format,categorias}.js   ← utilidades puras compartidas
└─ supabase/ …  mismo proyecto, tablas, políticas y bucket `soi-publico`
```

Opciones evaluadas:

| Opción | Veredicto |
|---|---|
| **A. Un `vite.config` por sitio + directorios de publicación distintos + Netlify *base directory*** | **Elegida.** Artefactos físicamente distintos; el público tiene su propio punto de entrada, CSP, redirects y variables; el build admin no se toca |
| B. Un único build con dos entradas y publicar un subconjunto | Descartada: mismo artefacto y misma CSP; riesgo de que una regla de copia filtre archivos admin |
| C. Paquetes/workspaces separados | Descartada: duplicaría dependencias y tooling para ≈ 9 archivos; contradice «sin duplicar código» |

Por qué es seguro (no basta con ocultar el login): el build público **ni siquiera compila** el código admin. Es un conjunto de páginas estáticas con `fetch` a tres operaciones de solo lectura; **no incluye `supabase-js`** (sin cliente de auth, sin sesión), ni `qrcode`, ni módulos del SOI. `scripts/verify-public-bundle.mjs` (parte de `npm run build:public`) **falla el build** si: aparece un archivo fuera de la lista permitida, un módulo fuente fuera de `apps/public/src` + 3 utilidades puras, cualquier dependencia de `node_modules`, o cualquiera de ~35 marcadores administrativos en el texto (rutas `adm/admin/fin…`, `sb-soi-auth`, `signInWithPassword`, `service_role`, RPC de escritura, tablas internas, `accessControl`, `qrcode`, `supabase-js`…). Una prueba inyecta contaminación en una copia del artefacto y comprueba que la auditoría **falla**.

Rutas del sitio público: `/` inicio · `/qr-code` biblioteca · `/d/<slug>` visualizador (acceso directo y recarga por rewrite 200) · cualquier otra → **404 real** (`404.html`, sin catch-all). El sitio admin deja de servir `/d/*` (el visualizador vive solo en el público).

**Biblioteca (`/qr-code`) — cómo se expone el listado de forma segura:** RPC pública `listar_publicaciones_publicas(p_limit, p_offset)` (`SECURITY DEFINER`, `search_path=''`, ejecutable por `anon`): une la publicación con su **versión vigente**, filtra `estado='publicado'`, ordena por fecha, **no devuelve** `storage_path`, `sha256`, `created_by`, versiones anteriores, borradores ni archivadas, y acota `limit` a 100 (valores negativos se sanean). Las tablas siguen sin `SELECT` para `anon`. Alternativas descartadas: dar `SELECT` a `anon` sobre una vista (superficie mayor, acopla el esquema) o publicar un índice JSON estático (queda desfasado al despublicar). Verificado en la suite PostgreSQL con todos los roles (sección K).

**Slug permanente legible:** `p_slug` opcional al crear (3–60 caracteres, minúsculas/números/guiones; único; inmutable porque no hay DML directo ni RPC para cambiarlo). Sin slug se genera uno aleatorio de 10 caracteres. Ejemplo verificado en navegador: `/d/concierto-navidad-2026`.

## 4. Configuración Netlify de ambos sitios

| | Sitio A — admin (existente) | Sitio B — público (**por crear, requiere autorización**) |
|---|---|---|
| Nombre / URL | `soi-el-sistema-pc` · `https://soi-el-sistema-pc.netlify.app` | `elsistemapc` · `https://elsistemapc.netlify.app` (**no confirmado**) |
| Repositorio / rama | el mismo / `master` | el mismo / `master` |
| Base directory | (vacío = raíz) | `apps/public` |
| Archivo de configuración | `netlify.toml` de la raíz (sin cambios) | `apps/public/netlify.toml` |
| Build command | `npm run build` | `npm --prefix ../.. ci --no-audit --no-fund && npm --prefix ../.. run build:public` (ya en el toml) |
| Publish directory | `dist` | `dist` (relativo a la base: `apps/public/dist`) |
| Ignore (evita builds inútiles) | el existente | cambios en `apps/public`, `documentos-publicos/lib`, el script de auditoría y `package*.json` |
| Redirects | `netlify.toml` raíz + `public/_redirects` (catch-all del SOI) | `static/_redirects`: `/qr-code`, `/d/*` → 200; **sin catch-all** |
| Cabeceras | `netlify.toml` raíz (CSP del SOI) | `static/_headers` (ver abajo) |
| Variables | las actuales + `VITE_PUBLIC_BASE_URL`, `VITE_PUBLIC_ALLOWED_ORIGINS` (opcional), `VITE_DOCS_SERVER_VERIFY` (cuando exista la función) | `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `VITE_INSTITUTIONAL_URL` (opcional, https) |
| Claves privilegiadas | ninguna en el navegador | ninguna (solo la clave anónima pública) |

**CSP del público (`static/_headers`):** `default-src 'none'; script-src 'self'; style-src 'self'; img-src 'self' data: https://zmhmdvmyeyswunurcyow.supabase.co; font-src 'self'; connect-src 'self' https://zmhmdvmyeyswunurcyow.supabase.co; manifest-src 'self'; base-uri 'none'; form-action 'none'; frame-ancestors 'none'` — sin `unsafe-inline` ni `unsafe-eval`; más `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `Referrer-Policy: no-referrer`, `Permissions-Policy` restrictiva, COOP. **Caché:** HTML `max-age=0, must-revalidate`; `/assets/*` inmutable 1 año (nombres con hash); `/d/*` `no-store` y `X-Robots-Tag: noindex, nofollow`.

**Supuesto no verificado con Netlify real:** que Netlify lea `apps/public/netlify.toml` y resuelva `publish` relativo a la base; la documentación de Netlify para monorepos lo describe así, pero **la primera comprobación debe ser un Deploy Preview del sitio B** antes de publicar (checklist del runbook).

## 5. QR: dominio autorizado

* `VITE_PUBLIC_BASE_URL` debe pertenecer a la **lista blanca** (`VITE_PUBLIC_ALLOWED_ORIGINS`, separada por comas; por defecto solo `https://elsistemapc.netlify.app`).
* Se **bloquea** la exportación (el panel no genera el QR, deshabilita PNG/SVG/copiar y muestra el motivo) si: falta la variable (**sin respaldo en `window.location`**, que sería el dominio admin), no es https (salvo un origen local explícitamente listado, solo para pruebas), contiene ruta/query/credenciales, es un alias de rama o Deploy Preview (`--`), o no está en la lista.
* El QR codifica exclusivamente `<base>/d/<slug>`; nunca URL de Storage, token, URL firmada, enlace admin ni preview. Pruebas: `qrDomain.test.js` (≈ 25 casos), `adminQrGate.test.js`, `qrPayload.test.js`; escaneo independiente (jsQR) de los PNG/SVG descargados desde el panel, sin cambios al reemplazar el PDF (SVG idéntico byte a byte).
* **Mientras el subdominio no esté confirmado y la variable no se configure en el sitio admin, el panel no emite QR definitivos.**

## 6. Archivos modificados / creados en esta fase

* **Nuevos:** `apps/public/` (4 HTML, `vite.config.mjs`, `netlify.toml`, `src/` — `api.js`, `dom.js`, `layout.js`, `styles.css`, 3 páginas, 3 entradas —, `static/_headers|_redirects|robots.txt`, 2 suites de pruebas), `scripts/verify-public-bundle.mjs`, `src/modules/documentos-publicos/lib/{slug,format,categorias,qrDomain}.js`, evidencia y estos documentos.
* **Modificados (módulo):** `lib/qr.js` (sin respaldo `window.location`; `buildDefinitiveQrUrl`), `lib/fileValidation.js`, `lib/estados.js`, `views/documentosPublicosView.js` (campo de slug, bloqueo de QR, subidas en producción), `api/*` (slug), migración `20261018120000` (slug legible + RPC de biblioteca) y su rollback, suite PostgreSQL, scripts `e2e_*`/`seed`/`serve_dist`.
* **Eliminados:** `d.html` y `src/modules/documentos-publicos/public/`, `views/documentoPublicoView.js` (el visualizador pasó a `apps/public`).
* **Repositorio (impacto mínimo):** `package.json` (3 scripts), `vitest.config.js` (incluye `apps/**`), `.gitignore`.
* **Sin cambios respecto de `master`:** `vite.config.js`, `netlify.toml`, `public/_redirects`, `public/sw.js`, `public/manifest.json` (comprobado con `git diff`, `evidencia/build_admin_integridad.txt`). El build admin publica los mismos 13 HTML de siempre y ya no contiene `d.html`.

## 7. Estado de la Edge Function (verificación de contenido en servidor)

* **Implementada** (`supabase/functions/registrar-version-documento`), con su RPC `registrar_version_documento_verificada` (solo `service_role`) y la migración **staged** `supabase/staged/20261018130000_…` que revoca la RPC directa para `authenticated`.
* **Verificada en el runtime real de Edge Functions local, con la migración staged aplicada: 16/16** (`evidencia/e2e_stage2.txt`): sin token 401, maestro 403, ruta ajena 400, objeto inexistente 404; PDF real → 200 con SHA-256 calculado en servidor y actor = admin autenticado; ejecutable con extensión `.pdf` → **422 y objeto borrado**; PNG bajo ruta `.pdf` → 422; la RPC directa del admin → `42501`. Más las comprobaciones de la sección J de la suite PostgreSQL de que solo `service_role` con un actor admin activo registra.
* **No desplegada.** Garantías para que un admin no eluda la validación con llamadas directas: (1) la migración staged revoca la RPC directa; (2) el panel **deshabilita las subidas en producción** salvo `VITE_DOCS_SERVER_VERIFY=true`; (3) la lista de verificación previa del runbook comprueba el privilegio antes de la primera publicación.
* **Brecha de ventana (documentada):** entre aplicar la migración principal y la staged, la RPC directa existe. Se cierra aplicando ambas en la misma ventana de mantenimiento y **sin habilitar subidas** hasta confirmarlo (§ Runbook). Un objeto subido y no registrado nunca es público.

## 8. Resultados REALES de pruebas (ejecutadas en esta fase)

| Prueba | Resultado | Evidencia |
|---|---|---|
| PostgreSQL 17 aislado (roles, Storage, matriz estado×rol, slug, biblioteca, etapa 2, rollback) | **259 / 259** | `postgres_suite.txt` |
| Mutaciones de la migración | **11 / 11 detectadas** (0 sobrevivientes) | `postgres_suite.txt` |
| Storage real local (GoTrue + PostgREST + Storage) `e2e_storage` | **51 / 51** | `e2e_storage.txt` |
| Edge Function real local + migración staged `e2e_stage2` | **16 / 16** | `e2e_stage2.txt` |
| Vitest: módulo + `apps/public` + `src/core` + `src/portales` | **223 / 223** (35 archivos) | `regresiones.txt` |
| Build ADMIN (`vite build`, config raíz) | OK; mismos 13 HTML; sin `d.html` | `regresiones.txt`, `build_admin_integridad.txt` |
| Build PÚBLICO + auditoría de aislamiento | OK; 13 archivos, ≈17 KB; «Artefacto público aislado» (y la prueba de contaminación falla como debe) | `regresiones.txt` |
| ESLint (módulo, `apps/public`, script de auditoría) | sin hallazgos | `regresiones.txt` |
| Navegador (sitio público servido con las reglas y la CSP reales de `_redirects`/`_headers`; Supabase local): `/` con nombre, lema, navegación, tarjetas; `/qr-code` solo con publicados; acceso directo y **navegación por tarjeta** a `/d/concierto-navidad-2026`; recarga; PDF «Abrir» (200 `application/pdf`) y «Descargar» (`download=<slug>.pdf`); imagen; borrador, archivado e inexistente → mismo mensaje; `/ruta-inexistente`, `/admin`, `/adm/…`, `/sw.js`, `/manifest.json`, `/signage/`, `/fin` → **404 real**; móvil 375 px sin scroll horizontal; sin claves de sesión en el navegador | ✔ | `navegador_portal_publico.md`, capturas |
| Navegador (panel): crear con slug `gala-primavera-2027`, subir PDF, publicar, descargar QR PNG+SVG; **escaneo independiente jsQR**: PNG (1024→128 px) y SVG (256→1024 px) decodifican exactamente `http://127.0.0.1:4181/d/gala-primavera-2027`; reemplazo de PDF → URL y **SVG idénticos**, la página pública sirve el contenido v2; despublicar → desaparece de la biblioteca, firma nueva 400, URL ya emitida sigue viva (riesgo R2) | ✔ | `qr_scan_portal_publico.txt`, `navegador_portal_publico.md` |
| Rechazo de dominios para QR (vacío, otro dominio, http, preview, ruta, credenciales, `javascript:`) | ✔ unitario | `qrDomain.test.js`, `adminQrGate.test.js` |
| Seguridad: anon/maestro sin escritura, admin autorizado, validación en servidor, versiones anteriores protegidas, despublicación efectiva | ✔ | PG 259, `e2e_storage` 51, `e2e_stage2` 16 |

**No ejecutado / no verificable:** despliegue real en Netlify (preview del sitio B y comportamiento de *base directory*), Storage y CDN **alojados**, caducidad real de la URL firmada y caché, lectura del QR con teléfono físico, panel dentro del portal ADM con inicio de sesión real, Edge Function **desplegada**, `policy:check` (sigue fallando por deuda anterior; no se añadieron tablas en esta fase).

## 9. Riesgos pendientes

| ID | Riesgo | Mitigación |
|---|---|---|
| P1 | ~~Subdominio no confirmado~~ → **resuelto**: sitio `elsistemapc` creado, URL reservada. Sigue vacío y sin deploy | Completar el runbook §1.3–1.5; QR bloqueados hasta el smoke test |
| P2 | *Base directory* / `publish` relativo / `ignore` del sitio B no probados en Netlify real | Deploy Preview de B antes de publicar (runbook paso 6) |
| P3 | El sitio admin se despliega solo desde `master`; el merge publica de inmediato | Merge solo en ventana acordada; el admin no cambia su despliegue; ver runbook |
| P4 | Edge Function sin desplegar; ventana entre migraciones | Orden y verificación del runbook; subidas bloqueadas en producción por defecto |
| P5 | URL firmada ya emitida vive ≤ 300 s tras despublicar; caché/CDN real sin probar | Verificar en producción con documento de prueba (runbook) |
| P6 | **No hay logotipo institucional verificado en el repositorio** (`favicon.svg` es el logo de Vite; `public/icons/*` son los iconos de la app SOI); el sitio usa solo texto | Pedir el logotipo oficial al titular; no se inventó ninguno |
| P7 | No hay URL institucional verificada | El botón «Información institucional» aparece solo si se define `VITE_INSTITUTIONAL_URL` (https) |
| P8 | Descargas masivas / abuso, sin rate limiting propio | Monitorear egreso; interruptor de emergencia (REVOKE a `anon`); regla de rate limit en el CDN |
| P9 | Versiones reemplazadas permanecen en el bucket; PDF con contenido activo sin antivirus | Regla «sin datos personales»; purga y antivirus en etapa posterior |
| P10 | CSP del público fija el host de Supabase del proyecto | Si cambia el proyecto, actualizar `_headers` (hay una prueba que lo recuerda) |

## 10. Reversión

Ver `RUNBOOK_DESPLIEGUE_DOS_SITIOS.md` §6: sitio B se puede apagar/eliminar sin efecto en el SOI (nadie depende de él salvo los QR impresos); el admin vuelve al commit previo con *Publish deploy* de Netlify; SQL: rollback de etapa 2 y luego del módulo (`supabase/rollback/`), con el interruptor de emergencia previo.

## 11. Rama y commits

Rama `feat/documentos-qr-publicos` (push hecho). Commits de esta fase sobre `36050618`/`9c75f950`: `feat(documentos-publicos): add friendly permanent slug and bounded public library RPC` · `feat(public-portal): add separate public site (apps/public), bundle isolation audit and QR domain whitelist` · `test(public-portal): cover public pages, bundle isolation, routes, QR domain whitelist and admin gates` · `test(public-portal): validate public site in browser…` · `test(public-portal): record regression, admin build integrity and PostgreSQL evidence` · `docs(public-portal): …`. Conventional Commits en inglés, sin atribución de IA.

## 12. Veredicto

**APTO CON CONDICIONES.**

Justificación: el portal público es técnicamente independiente (artefacto de 17 KB sin código admin, auditado automáticamente), el admin conserva su configuración de despliegue (diff vacío), los visitantes consultan sin sesión y solo lo publicado, el QR solo puede codificar el dominio público autorizado y no cambia al reemplazar el archivo, y todo lo ejecutable sin tocar producción pasó. Condiciones: (1) ~~crear el sitio y confirmar el nombre~~ **hecho** (queda enlazar repositorio, base directory y variables); (2) Deploy Preview del sitio B que confirme la lectura de `apps/public/netlify.toml`; (3) desplegar la Edge Function y aplicar la migración staged **antes** de habilitar subidas; (4) smoke test en producción (expiración de URL firmada y caché); (5) aportar el logotipo oficial y, si procede, la URL institucional.
