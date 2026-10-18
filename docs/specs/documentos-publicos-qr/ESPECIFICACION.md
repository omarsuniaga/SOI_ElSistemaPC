# Documentos públicos y códigos QR — Especificación técnica y plan por etapas

Estado: MVP implementado en la rama `feat/documentos-qr-publicos` (partida de `master` @ `34bbcfe6`). **Nada aplicado en producción.**
Informe de estado y dependencias: [`INFORME_ESTADO.md`](./INFORME_ESTADO.md).

## 1. Alcance del MVP

| # | Funcionalidad | Dónde |
|---|---|---|
| 1 | Subir PDF / JPG / PNG / WebP | `lib/fileValidation.js`, `api/documentosPublicosSupabase.js#subirVersion` |
| 2 | Bucket exclusivo para contenido institucional | bucket `soi-publico` (migración §5) |
| 3 | Publicación con título, descripción, fecha, categoría, estado | tabla `publicaciones_documentos` |
| 4 | QR descargable PNG y SVG, generado localmente | `lib/qr.js` (librería empaquetada `qrcode`, sin red) |
| 5 | URL pública permanente | `/d/<slug>` (slug de 10 caracteres, inmutable) |
| 6 | Reemplazar documento sin cambiar URL ni QR | nueva fila en `..._versiones` + `version_actual_id` |
| 7 | Página pública responsiva | `d.html` → `views/documentoPublicoView.js` |
| 8 | Publicar, despublicar, archivar, historial de versiones | RPC `cambiar_estado_…`, `activar_version_…` |
| 9 | Registro de quién creó/modificó | `created_by/updated_by` + bitácora `..._eventos` |
| 10 | Autorización estricta | RPC `SECURITY DEFINER` + RLS + políticas de Storage |

Fuera del MVP: analítica de visitas, expiración programada, categorías administrables, multi-institución (ver §9), incrustar PDF en la página (la CSP actual solo permite `frame-src 'self' blob: data:`).

## 2. Decisión de rama y dependencias

**Base: `master`.** El módulo no necesita ninguna de las ramas de seguridad:

* Usa `soi_security.has_role(text[])`, creada por `20260911020424_f0_security_containment.sql` (ya en master). Definición en producción verificada por lectura de `pg_proc` el 2026-10-17: exige `profiles.estado='activo'` y `activo IS TRUE`.
* **No** usa `tiene_capacidad_academica` (rama `anon-write…`, solo por rol y sin aplicar) ni `es_admin_estricto` (rama `storage-privado…`, sin aplicar): ambas son prerrequisitos que no están en producción.
* **No** lee `permisos_maestros` (auto-editable por cada maestro; la rama R9 aún no está integrada).

Detalle de colisiones y orden en el informe de estado.

## 3. Modelo de datos (migración `20261018120000_documentos_publicos_qr.sql`)

```
publicaciones_documentos            1 ── N  publicaciones_documentos_versiones
  id, slug UNIQUE (^[a-z0-9]{10}$)             id, publicacion_id, numero, storage_path UNIQUE,
  titulo (3–160), descripcion (≤2000)          mime_type, extension, size_bytes (≤10 MB), sha256,
  fecha_documento, categoria                   nombre_original, motivo, created_by, created_at
  estado: borrador|publicado|archivado         (append-only: trigger bloquea UPDATE/DELETE)
  version_actual_id → versiones                
  published_at, archived_at                   publicaciones_documentos_eventos  (append-only)
  created_by/updated_by/…_at                    id, publicacion_id, accion, actor_id, detalle jsonb, created_at
  CHECK publicado ⇒ version_actual_id
```

* `slug` se genera en servidor y **nunca cambia**: es la identidad pública. El QR codifica solo `https://<dominio>/d/<slug>`.
* Reemplazar el archivo = nueva versión (`numero+1`) + `version_actual_id`; el objeto anterior se conserva (historial, vuelta atrás con `activar_version_documento`).
* Ruta de objeto obligatoria: `<publicacion_id>/<uuid>.<pdf|jpg|png|webp>`; sin sobrescritura (no hay política UPDATE ni upsert).

## 4. Autorización

| Acción | anon | user / alumno / representante | maestro | coordinacion_academica | direccion | admin | superadmin | service_role |
|---|---|---|---|---|---|---|---|---|
| Ver página pública y descargar de lo **publicado** | ✔ | ✔ | ✔ | ✔ | ✔ | ✔ | ✔ | n/a |
| Ver borradores, versiones antiguas, historial, auditoría | ✘ | ✘ | ✘ | ✘ | ✘ | ✔ | ✔ | (BYPASSRLS) |
| Crear / editar / publicar / archivar / reemplazar / activar versión | ✘ | ✘ | ✘ | ✘ | ✘ | ✔ | ✔ | ✘ (RPC exige `auth.uid()` admin) |
| Subir objeto al bucket | ✘ | ✘ | ✘ | ✘ | ✘ | ✔ (ruta válida, publicación existente) | ✔ | n/a |
| Sobrescribir objeto | ✘ | ✘ | ✘ | ✘ | ✘ | ✘ | ✘ | n/a |
| Borrar objeto | ✘ | ✘ | ✘ | ✘ | ✘ | ✘ | solo **huérfanos** (sin versión registrada) | n/a |
| Borrar/alterar versiones o bitácora | ✘ | ✘ | ✘ | ✘ | ✘ | ✘ | ✘ | ✘ (trigger append-only) |

* Punto único de cambio: `public.puede_gestionar_documentos_publicos()` = `soi_security.has_role(ARRAY['admin','superadmin'])`. Para delegar en `coordinacion_academica` basta ampliar esa función (decisión de negocio; no incluida por mínimo privilegio). `inventarista` queda excluido a propósito (por eso no se usa `es_admin()`).
* Los roles API no tienen INSERT/UPDATE/DELETE sobre las tablas (`REVOKE ALL … FROM PUBLIC, anon, authenticated`; solo `SELECT` bajo RLS para admin). Toda escritura pasa por RPC `SECURITY DEFINER` con `search_path=''`, que además escriben la bitácora (R2).
* Las RPC administrativas no son ejecutables por `anon`/`PUBLIC`.

## 5. Storage: por qué el bucket es privado

El requisito pide un bucket "público para contenido institucional" pero con "lectura pública únicamente de materiales autorizados (publicados)". Son incompatibles si `public = true`: Supabase sirve cualquier objeto de un bucket público en `/storage/v1/object/public/…` **sin consultar RLS**, de modo que un borrador, una versión reemplazada o una publicación despublicada seguirían siendo accesibles para quien conozca la ruta.

Diseño adoptado: bucket `soi-publico` **privado** + política `SELECT` para `anon` y `authenticated` limitada a la versión vigente de publicaciones `publicado` (`public.storage_objeto_publicado(name)`, `SECURITY DEFINER` para que anon no necesite acceso a las tablas). La página pública obtiene una **URL firmada de 300 s** (`createSignedUrl`, permitido por la política). Efectos:

* Despublicar/archivar/reemplazar cierra el acceso a nuevas URLs de inmediato. Una URL firmada ya emitida vive hasta 5 min (riesgo aceptado, §10).
* Los objetos no son enumerables por anónimos más allá de lo publicado.
* Límites del bucket: 10 MB; MIME `application/pdf, image/jpeg, image/png, image/webp` (sin SVG ni HTML).
* No se tocan `documentos`, `signage` ni `instrumentos-fotos`; todas las políticas nuevas llevan prefijo `docs_publicos_` y están acotadas a `bucket_id='soi-publico'`.

## 6. Subida y validación

1. **Cliente** (`validateFile`): tamaño 1 B–10 MB; extensión en lista; **firma real** (`%PDF-`, `FF D8 FF`, firma PNG de 8 bytes, `RIFF…WEBP`); la firma debe coincidir con la extensión; el MIME declarado, si existe, debe coincidir con la firma. SHA-256 con Web Crypto.
2. **Storage**: límite de tamaño y lista de MIME del bucket; la política `INSERT` exige admin, ruta `<uuid>/<uuid>.<ext>` y que la publicación exista.
3. **RPC `registrar_version_documento`** (tras subir): verifica que el objeto exista en `storage.objects`, que `metadata.size` y `metadata.mimetype` coincidan con lo declarado, que extensión↔MIME sean coherentes, que la ruta pertenezca a la publicación y que no esté archivada. Falla ⇒ el cliente intenta borrar el objeto (solo superadmin puede; si no, queda huérfano inocuo).
4. **Límite conocido:** Postgres no puede leer los bytes de un objeto, por lo que la comprobación de firma es del cliente. Un administrador que eluda el cliente (llamada directa a la API) podría subir un archivo con MIME/extensión permitidos pero contenido distinto. Mitigaciones: solo administradores suben; el bucket no admite HTML/SVG; el navegador recibe el `Content-Type` guardado; la página pública no incrusta documentos. **Etapa 2 recomendada:** Edge Function que lea los primeros bytes y registre la versión (no implementada para no desplegar funciones sin autorización).

## 7. Ruta pública y QR

* `d.html` es una entrada Vite independiente (sin shell administrativo, sin sesión). Netlify: `[[redirects]] /d/* → /d.html 200` antes del catch-all; espejo en `public/_redirects` y en el middleware de desarrollo de `vite.config.js`.
* `obtener_publicacion_publica(slug)` (ejecutable por anon) devuelve metadatos solo si `estado='publicado'`, sin `created_by`, `sha256` ni versiones anteriores. Slug inexistente, borrador, archivado o error de red muestran **el mismo mensaje** (no revela existencia).
* Imágenes se muestran en línea; PDF mediante "Abrir" y "Descargar" (la CSP del sitio no permite `<iframe>` de otro origen).
* QR: `qrcode` (nivel de corrección M, margen 2). SVG vectorial y PNG de 1024 px generados en el navegador. `VITE_PUBLIC_BASE_URL` (opcional) fija el dominio codificado para no imprimir QR con un dominio de vista previa; la URL se muestra al administrador para verificarla.

## 8. Modo Demo (AGENTS.md §2)

`api/documentosPublicosApi.js` elige `documentosPublicosMock.js` (JSON `src/assets/data/mocks/documentosPublicos.json` + memoria de sesión) cuando `config.isDemoMode`. Misma interfaz y mismas reglas de transición/validación; los archivos subidos viven como `blob:` hasta recargar.

## 9. Política estructural (R1–R6)

* **R1** — Escritores en la misma migración/PR: RPC `crear_/actualizar_/cambiar_estado_/registrar_version_/activar_version_` + módulo `src/modules/documentos-publicos`. `npm run policy:check` deja de listar las tres tablas al incorporar la API (32→29 entradas, todas preexistentes). **Primera fila real:** la crea un `admin`/`superadmin` al registrar la primera publicación desde la ruta `documentos-publicos` tras desplegar frontend y migración (responsable propuesto: Dirección/Comunicaciones; fecha: el día del despliegue).
* **R2** — Cada acción deja evento; lo público queda atado al estado; despublicar corta el acceso.
* **R3** — Exención declarada en las tres tablas: producción no tiene tabla `instituciones` ni columna `institucion_id` en ninguna tabla (verificado). Plan: cuando exista el modelo multi-institución, añadir `institucion_id` + política y backfill con la institución única.
* **R4** — Categorías: lista en código; el CHECK de BD acepta cualquier código `[a-z0-9_]{2,40}` para poder pasarlas a configuración sin migrar.
* **R5** — Cada versión guarda `sha256`, tamaño, autor, fecha y motivo; la bitácora guarda actor y detalle.
* **R6** — No aplica a Hermes; el módulo no automatiza comunicaciones: publicar es siempre una acción humana explícita.

## 10. Riesgos

| Riesgo | Impacto | Mitigación / estado |
|---|---|---|
| Firma de archivo validada solo en cliente | Admin malicioso/eludiendo UI sube contenido distinto al declarado | Solo admin; bucket sin HTML/SVG; nosniff; Etapa 2 (Edge Function) |
| URL firmada emitida antes de despublicar sigue viva ≤5 min | Acceso residual breve | TTL de 300 s; documentado; reducible |
| `createSignedUrl` como `anon` depende de la API real de Storage + política `SELECT` | La suite usa PostgreSQL aislado, no el servicio Storage | **Verificar en staging antes de producción** (ver informe, lista de verificación) |
| QR impreso con dominio equivocado | QR inservible | `VITE_PUBLIC_BASE_URL` + URL visible en el panel |
| Objetos huérfanos por fallo tras subir | Coste de almacenamiento mínimo | Política de borrado de huérfanos para superadmin; objeto no público |
| Cualquier URL firmada puede reenviarse mientras vive | Es contenido público por definición | n/a |
| Cambio futuro de `soi_security.has_role` | Cambia quién administra | Punto único `puede_gestionar_documentos_publicos()`; pruebas por rol |
| Sin `institucion_id` | No replicable multi-institución aún | Exención R3 con plan |

## 11. Plan por etapas

1. **Etapa 1 (hecha en la rama):** migración + rollback + suite PostgreSQL (138 comprobaciones, 9 mutaciones) → API/adaptador/mock → panel admin + página pública + QR → pruebas Vitest (33).
2. **Etapa 2 (previa a producción, requiere autorización):** aplicar en una rama/instancia de staging de Supabase (el costo de una rama de pago debe aprobarse antes); ejecutar la lista de verificación del informe con la API real de Storage; fijar `VITE_PUBLIC_BASE_URL` en Netlify.
3. **Etapa 3 (producción):** aplicar migración → desplegar frontend (o al revés: el frontend es inerte sin la migración, la ruta admin mostraría error de RPC) → crear primera publicación → imprimir QR.
4. **Etapa 4 (mejoras):** Edge Function de verificación de firma, delegación a `coordinacion_academica`, categorías configurables, `institucion_id`, métricas de visitas con consentimiento.

## 12. Pruebas

* `npm run test:db:documentos-qr` — PostgreSQL 17 en Docker (`soi-pg-docqr`, puerto 54331): 138 comprobaciones por rol (anon, user, alumno, representante, maestro, coordinacion_academica, direccion, inventarista, admin, superadmin, admin pendiente/inactivo, service_role), subida/reemplazo/borrado en `storage.objects`, bucket solo lectura de lo publicado, repetición de las 8 políticas de storage de producción con helpers "siempre verdadero", rollback + reaplicación. `node supabase/tests/documentos-qr/run_tests.mjs --mutate N` (N=1..9): cada mutación debe ser detectada.
* `npx vitest run src/modules/documentos-publicos` — 33 pruebas.
