# Runbook — despliegue de los dos sitios sin interrumpir el SOI

Estado: **procedimiento preparado, NADA ejecutado.** Cada paso marcado 🔒 requiere autorización expresa del titular (crea recursos, toca producción o publica). Arquitectura y evidencia: [`PORTAL_PUBLICO_DOS_SITIOS.md`](./PORTAL_PUBLICO_DOS_SITIOS.md).

Principios: (1) el sitio admin no cambia de configuración; (2) el sitio público se crea y se prueba **antes** de que exista ningún QR; (3) nada de subidas hasta que la validación de contenido en servidor esté activa; (4) cada paso tiene verificación y marcha atrás.

> **Estado de ejecución (2026-10-18), todo con autorización expresa del titular:**
> - **Supabase producción (`zmhmdvmyeyswunurcyow`):** Edge Function `registrar-version-documento` desplegada (v1, ACTIVE, `verify_jwt=true`); migraciones aplicadas con el conector, en este orden y en la misma ventana: `documentos_publicos_qr` (= `20261018120000`) y `documentos_publicos_verificacion_servidor` (= staged `20261018130000`; el historial de Supabase las registra con la marca de tiempo de aplicación, no con la del archivo).
> - **Verificación de solo lectura posterior:** `directa_abierta=false`, `verificada_service_role=true`, `verificada_authenticated=false`, `anon_crea=false`, `anon_lista=true`, `anon_obtiene=true`, anon sin `SELECT`/authenticated sin `INSERT` en tablas, bucket `soi-publico` privado de 10 MB, 4 políticas nuevas, 8 políticas previas de `storage.objects` intactas, `documentos/signage/instrumentos-fotos/db-backups` sin cambios, 0 filas. Con la clave anónima real: `listar_publicaciones_publicas` → `[]`; `crear_publicacion_documento` → 401; lectura de la tabla → 42501; firmar un objeto inexistente → 404; la función rechaza peticiones sin ruta válida.
> - **Netlify:** sitio público `elsistemapc` con `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY`; sitio admin con `VITE_PUBLIC_BASE_URL=https://elsistemapc.netlify.app` y `VITE_DOCS_SERVER_VERIFY=true` (producción, solo build; **sin efecto hasta el próximo deploy del admin**).
> - **Pendiente:** (1) *redeploy* del sitio público (las variables se añadieron después de su último build; hasta entonces `/qr-code` no puede leer la API); (2) merge a `master` para publicar el panel en el admin (decisión del titular; despliega el admin automáticamente); (3) smoke test con un documento de prueba creado desde el panel (§5) y lectura del QR con dos teléfonos; (4) logotipo oficial. **No se creó ninguna publicación de prueba en producción** (requiere una sesión de administrador).

## 0. Antes de empezar (solo lectura)

- [ ] Confirmar en la interfaz de Netlify la configuración REAL del sitio admin (comando de build, directorio de publicación, variables). Se asume `npm run build` → `dist` (coincide con `netlify.toml`). Anotar las variables existentes.
- [ ] `git fetch` y comprobar que la rama está al día con `master`. **Recordatorio: el sitio admin despliega solo cada commit a `master`.**
- [ ] Revisar el estado de las ramas de seguridad (`anon-write` `…17180000`, R9 `…17190000`, storage `…17200000`): este módulo es independiente de ellas (sin objetos en común); si ya se integraron, repetir `npm run test:db:documentos-qr`.
- [ ] Ejecutar localmente: `npm run build:public` (incluye la auditoría de aislamiento), `npx vite build`, `npx vitest run src/modules/documentos-publicos apps src/core src/portales`, `node supabase/tests/documentos-qr/run_tests.mjs` (+ `--mutate 1..11`).

## 1. Sitio público — CREADO (2026-10-18), falta configurarlo

> El sitio `elsistemapc` (id `f8578881-…`) ya existe y su URL `https://elsistemapc.netlify.app` quedó reservada; está vacío (sin repo, variables ni deploy). Pendiente de este paso: 1.3, 1.4 y 1.5 en la interfaz de Netlify. Los puntos 1.1 y 1.2 quedaron resueltos.

> **Rama de producción del sitio B (hallazgo del primer intento de deploy, 2026-10-18):** el sitio se enlazó a `master`, donde todavía NO existe `apps/public`; Netlify falla en «Reading and parsing configuration files … Base directory does not exist» (no es un error de sintaxis del `netlify.toml`). Mientras el código no esté en `master`, configurar el sitio B con **Branch to deploy = `feat/documentos-qr-publicos`** (Site configuration → Build & deploy → Branches) y volver a `master` tras el merge autorizado. **No** hacer merge a `master` solo para esto: despliega el sitio admin automáticamente.

### (histórico) Confirmar y crear el sitio público

1. Autorización del titular para crear el sitio Netlify `elsistemapc` (equipo `5fe939dd…`). Netlify confirma o rechaza el nombre en ese momento.
2. Si el nombre **no está disponible**: detenerse y pedir decisión (alternativas en el informe). **No** improvisar otro nombre ni generar QR.
3. Configuración del sitio B (ver tabla del informe §4): mismo repositorio y rama; **Base directory `apps/public`**; el resto lo aporta `apps/public/netlify.toml`.
4. Variables del sitio B: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` (la clave **anónima**; nunca `service_role`), y opcionalmente `VITE_INSTITUTIONAL_URL` (https). **Contexto Production y Deploy Preview.**
5. Desactivar el despliegue automático del sitio B hasta terminar los pasos 2–4 (publicar manualmente el primer deploy) para evitar publicar antes de tiempo.

## 2. Deploy Preview del sitio B (sin publicar)

- [ ] El build termina con «✔ Artefacto público aislado» y publica `apps/public/dist` (13 archivos). **Si Netlify no lee `apps/public/netlify.toml` o resuelve mal `publish`, corregir aquí** (alternativa: fijar comando y publish en la interfaz).
- [ ] `https://<preview>/` carga; `/qr-code` lista vacío o «Todavía no hay documentos publicados»; `/d/lo-que-sea` → «Documento no disponible»; `/ruta-inexistente` → **404 real**; `/admin`, `/sw.js` → 404.
- [ ] Cabeceras: CSP `default-src 'none'` sin `unsafe-inline`; `X-Frame-Options: DENY`; `/d/*` con `no-store` y `noindex`.
- [ ] La consola del navegador no muestra violaciones de CSP (el `connect-src` solo permite el host de Supabase del proyecto).

## 3. 🔒 Base de datos (producción) — orden exacto

> Aplicar **fuera de horario de uso del SOI**. Cada migración con su rollback a mano. Hacer los pasos 3.1–3.4 en la **misma ventana**.

1. **Edge Function** `registrar-version-documento` (despliegue en el proyecto `zmhmdvmyeyswunurcyow`; no necesita secretos propios). Aún no la usa nadie.
2. Migración `20261018120000_documentos_publicos_qr.sql` (tablas, RPC, bucket privado `soi-publico`, políticas `docs_publicos_*`). Rollback: `supabase/rollback/20261018120000_…rollback.sql`.
3. **Inmediatamente después**, la migración staged: mover `supabase/staged/20261018130000_documentos_publicos_verificacion_servidor.sql` a `supabase/migrations/` y aplicarla (revoca la RPC directa). Rollback: `supabase/rollback/20261018130000_…rollback.sql` (siempre **antes** que el de la 2).
4. Verificación de solo lectura (todo debe cumplirse antes de continuar):
   ```sql
   select has_function_privilege('authenticated','public.registrar_version_documento(uuid,text,text,bigint,text,text,text)','execute') as directa_abierta,  -- debe ser false
          has_function_privilege('service_role','public.registrar_version_documento_verificada(uuid,uuid,text,text,bigint,text,text,text)','execute') as verificada_service_role, -- true
          has_function_privilege('anon','public.crear_publicacion_documento(text,text,date,text,text)','execute') as anon_crea, -- false
          has_function_privilege('anon','public.listar_publicaciones_publicas(integer,integer)','execute') as anon_lista, -- true
          (select public from storage.buckets where id='soi-publico') as bucket_publico, -- false
          (select count(*) from pg_policies where schemaname='storage' and policyname like 'docs_publicos_%') as politicas; -- 4
   ```
   *(Esta consulta se ejecutó contra el PostgreSQL aislado con ambas migraciones aplicadas y devolvió: `false, true, false, true, false, 4`.)*
5. Comprobar que `documentos`, `signage` e `instrumentos-fotos` no cambiaron (mismas políticas que antes del paso 2).

Si algo falla: rollback inverso (3, luego 2) y Edge Function sin uso; el SOI no depende de ninguna de estas piezas.

## 4. 🔒 Sitio admin (SOI) — publicar el panel

Este paso es el único que toca el sitio existente, y solo mediante variables nuevas + el merge:

1. Añadir variables al sitio **admin** (Production): `VITE_PUBLIC_BASE_URL=https://elsistemapc.netlify.app` (**solo cuando el nombre esté confirmado y el sitio B creado**), `VITE_DOCS_SERVER_VERIFY=true`. (`VITE_PUBLIC_ALLOWED_ORIGINS` solo si hubiera que autorizar otro dominio.)
2. Merge de `feat/documentos-qr-publicos` a `master` (🔒 decisión del titular) → Netlify despliega el admin automáticamente. El diff de despliegue admin es **nulo** (`vite.config.js`, `netlify.toml`, `public/_redirects` idénticos a `master`); el único cambio visible es el nuevo ítem de menú «Documentos públicos y QR» en el portal ADM.
3. Verificar tras el despliegue: el SOI entra y navega como siempre; el ítem del menú abre el panel; **coordinación académica ve «Acceso restringido»**; con la variable ausente o equivocada el panel muestra «Exportación de QR bloqueada».

## 5. 🔒 Publicar el sitio B y smoke test en producción

1. Publicar el sitio B (primer deploy a producción) y habilitar su despliegue automático.
2. Smoke test con **un documento de prueba no sensible** (creado desde el panel admin):
   - [ ] Crear con identificador legible, subir PDF (pasa por la Edge Function), publicar.
   - [ ] `https://elsistemapc.netlify.app/d/<slug>` en frío, recarga, «Abrir» y «Descargar».
   - [ ] Aparece en `/qr-code` y en `/`.
   - [ ] Descargar el QR PNG/SVG del panel y **escanearlo con un iPhone y un Android**; debe abrir exactamente esa URL.
   - [ ] Reemplazar el PDF: mismo QR, contenido nuevo.
   - [ ] Intentar subir un `.exe` renombrado a `.pdf` desde el panel: rechazado.
   - [ ] Despublicar: la página muestra «no disponible», desaparece de la biblioteca, una URL firmada **nueva** falla.
   - [ ] **Esperar > 5 min** y comprobar que la URL firmada antigua ya no responde (caducidad y caché reales).
   - [ ] Revisar cabeceras reales de la respuesta de Storage (`Content-Type`, `Cache-Control`).
3. Solo después de este smoke test: imprimir el QR definitivo del programa de mano (guía de impresión en `INFORME_PILOTO.md` §3).

## 6. Reversión (por capas, de afuera hacia adentro)

| Qué se quiere deshacer | Cómo | Efecto sobre el SOI |
|---|---|---|
| Retirar un documento | Despublicar desde el panel | Ninguno |
| Cortar la lectura pública ya | `REVOKE EXECUTE ON FUNCTION public.obtener_publicacion_publica(text), public.listar_publicaciones_publicas(integer,integer), public.storage_objeto_publicado(text) FROM anon;` (reversible con `GRANT … TO anon`) | Ninguno |
| Apagar el portal público | Desactivar/eliminar el sitio B (🔒). Los QR ya impresos dejarían de abrir | Ninguno |
| Volver el admin al estado previo | En Netlify (sitio A) *Publish deploy* sobre el deploy `6acc55a3…` (commit `e1c50618`) y quitar las variables nuevas | Vuelve el estado anterior |
| Revertir el esquema | Rollback de la etapa 2, luego el del módulo (`supabase/rollback/`); **destructivo** para publicaciones/versiones/bitácora (exportar antes) y vaciar antes el bucket `soi-publico` por la API | Ninguno (el SOI no depende de estas tablas) |

## 7. Ciclos de publicación independientes

| | Sitio A (admin) | Sitio B (público) |
|---|---|---|
| Se reconstruye cuando cambia | cualquier commit a `master` (comportamiento actual) | `apps/public`, `documentos-publicos/lib`, el script de auditoría o `package*.json` (regla `ignore`) |
| Comando | `npm run build` | `npm --prefix ../.. ci … && npm --prefix ../.. run build:public` |
| Salida | `dist` (13 HTML del SOI) | `apps/public/dist` (4 HTML + 3-4 JS/CSS + `_headers`/`_redirects`/`robots.txt`, ≈17 KB) |
| Variables | las del SOI + `VITE_PUBLIC_BASE_URL`, `VITE_DOCS_SERVER_VERIFY` | `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `VITE_INSTITUTIONAL_URL` |
| Dependencias compartidas | `package.json`/lockfile y 3 utilidades puras (`slug`, `format`, `categorias`) | ídem; nada más |
| Cabeceras / CSP | `netlify.toml` raíz | `apps/public/static/_headers` (más estricta) |
| Caché | HTML `max-age=0, must-revalidate` | HTML igual; `/assets/*` inmutable; `/d/*` `no-store` |

Una publicación de contenido (nuevo documento, reemplazo, despublicación) **no requiere ningún despliegue**: es dato en Supabase.
