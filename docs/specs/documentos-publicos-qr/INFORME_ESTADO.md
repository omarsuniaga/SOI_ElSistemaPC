# Documentos públicos y QR — Informe de estado y dependencias

Fecha: 2026-10-17 · Rama: `feat/documentos-qr-publicos` (base `master` @ `34bbcfe6`) · Producción (`zmhmdvmyeyswunurcyow`): **sin cambios**. Solo se hicieron lecturas de catálogo (`pg_proc`, `pg_policies`, `storage.buckets`, `information_schema`); no se leyeron datos personales.

## 1. Funcionalidades terminadas (en código, probadas en aislado)

| Función | Estado |
|---|---|
| Subida PDF/JPG/PNG/WebP con validación de extensión, tamaño y firma | ✔ |
| Bucket exclusivo `soi-publico` (privado + lectura anónima solo de lo publicado) | ✔ migración |
| Publicación con título, descripción, fecha, categoría, estado | ✔ |
| QR PNG (1024 px) y SVG generados localmente (`qrcode` ya era dependencia del proyecto) | ✔ |
| URL permanente `/d/<slug>`; reemplazo sin cambiar URL/QR (versionado, vuelta atrás) | ✔ |
| Página pública responsiva (`d.html`), mensaje único para no disponible | ✔ |
| Publicar / despublicar / archivar / restaurar; historial de versiones | ✔ |
| Auditoría de creación/modificación (columnas + bitácora append-only) | ✔ |
| Autorización estricta (admin/superadmin) en RPC, RLS y Storage; ruta admin solo-admin en `accessControl.js` | ✔ |
| Modo Demo con mocks JSON | ✔ |
| Registro: `allRegistrars`, `moduleCatalog`, nav de ADM, Netlify/Vite/`_redirects` | ✔ |

**No verificado / pendiente:** comportamiento contra el **servicio Storage real** (firma de URL como `anon`, subida con el cliente JS); visual en navegador de la vista admin y de la página pública (se compiló con `vite build` y `d.html` se emite, pero no se recorrió la UI contra un backend); Edge Function de firma de contenido (Etapa 2); `institucion_id` (exención R3).

## 2. Pruebas

| Suite | Resultado |
|---|---|
| `node supabase/tests/documentos-qr/run_tests.mjs` (PostgreSQL 17 aislado) | **138 / 138** |
| Mutaciones 1–9 (política sin chequeo admin, lectura abierta, helper siempre verdadero, DML directo, anon con SELECT, borrado de versiones, ignorar estado en Storage y en RPC, sin validación de ruta) | **9 / 9 detectadas** |
| Rollback → estado previo → reaplicación | ✔ (incluido en la suite, sección H) |
| `npx vitest run src/modules/documentos-publicos` | **33 / 33** |
| `npx vitest run src/core src/portales/_shared` | 74 / 74 (se actualizó el conteo esperado de `portalModuleMatrix.test.js`: 37→38 módulos cubiertos, por el módulo nuevo) |
| `npx vite build` | OK (emite `dist/d.html`) |
| `npm run policy:check` | Falla **por deuda preexistente** (29 tablas sin escritor, la misma lista sin las tres nuevas); las tres tablas nuevas no aparecen. Antes de añadir la API aparecían (32 entradas) — evidencia de que R1 queda cerrada |

La suite construye un subconjunto mínimo (perfiles, `soi_security.has_role` copiada literalmente de producción, y las **8 políticas de `storage.objects` reales de producción** con sus helpers forzados a "siempre verdadero" para demostrar que están acotadas por bucket). No reutiliza el esquema completo de `anon-write-fix` porque el módulo no depende de él.

## 3. Dependencias respecto a la auditoría de seguridad actual

| Elemento | ¿Dependencia? | Detalle |
|---|---|---|
| `soi_security.has_role` | **Sí (única real)** | Ya en master y en producción (F0, migración `20260911020424`). Si alguien la cambiara, cambia quién administra este módulo. Punto único: `puede_gestionar_documentos_publicos()` |
| Rama `anon-write…` (`20261017180000`, `tiene_capacidad_academica`) | No | No usa el helper (es solo por rol y aún sin aplicar). Esa migración no toca `storage.*`, ni el módulo QR ("NOT TOUCHED" en su cabecera). Sin objetos en común |
| Rama `storage-privado…` (`20261017200000`) | No | Sus políticas están acotadas a `documentos`, `justificaciones`, `ausencias`, `planning`, `comodatos`, `instrumentos-fotos`, `planificacion-docs`, `tareas`, `signage`; las nuevas llevan prefijo `docs_publicos_` y bucket `soi-publico`. No usa `es_admin_estricto` (a propósito: no está en producción). Tampoco la modifica |
| Rama R9 (`permisos_maestros`) | No | El módulo no lee esa tabla. (La rama local R9 no tiene commits propios sobre la de anon-write al momento de la revisión) |
| Orden de migraciones | Neutral | `20261018120000` ordena después de `…17180000` y `…17200000`; aplicables en cualquier orden entre sí |
| Colisiones de nombres | Ninguna | Tablas `publicaciones_documentos*`; funciones `crear_publicacion_documento`, etc.; sin choque con ramas ni con producción (verificado: ninguna tabla `publicaciones%`) |
| Conflictos textuales de merge | Menor | `package.json` (script `test:db:…` junto al `test:db:anon-write` de la otra rama): conflicto trivial de línea adyacente |
| Políticas actuales de `storage.objects` en producción (8) | Compatibles | Todas con `bucket_id = '<bucket>'`; probado que ninguna abre `soi-publico` |
| Cartelera (`signage`) | Intacta | No se modifica bucket, políticas ni vistas |

Interacción a vigilar: la migración de Storage endurece `signage` (límites y escritura solo `es_admin_estricto`); no afecta a `soi-publico`.

## 4. Orden de despliegue sugerido (requiere autorización expresa; nada ejecutado)

1. Crear una rama/instancia **staging** de Supabase (mostrar coste y pedir autorización) o usar el stack local; aplicar la migración.
2. Lista de verificación en staging con la API real:
   * `anon` ejecuta `rpc('obtener_publicacion_publica', {p_slug})` → fila solo si `publicado`.
   * `anon` `storage.from('soi-publico').createSignedUrl(path, 60)` → éxito solo para la versión vigente publicada; error para borrador/antigua/archivada.
   * `anon` `upload`/`remove`/`list` → denegado.
   * `maestro` autenticado `upload` → denegado; `admin` → éxito con ruta `<id>/<uuid>.pdf`; segundo `upload` a la misma ruta → denegado (sin upsert).
   * Tras `despublicar`, una URL firmada nueva falla.
   * Descargar PDF e imagen; ver cabecera `Content-Type`.
3. Fijar `VITE_PUBLIC_BASE_URL` en Netlify; desplegar frontend; aplicar migración a producción; crear la primera publicación.
4. Rollback: `supabase/rollback/20261018120000_documentos_publicos_qr.rollback.sql` (destructivo para las publicaciones; vaciar el bucket por API antes).

## 5. Decisiones que quedan para el titular

1. ¿`coordinacion_academica` (o Comunicaciones) debe poder publicar? Hoy solo `admin`/`superadmin`.
2. Aceptar el bucket **privado con URL firmada** en lugar de `public=true` (justificación en la especificación §5).
3. Aprobar coste/uso de una rama de Supabase para staging.
4. Priorizar la Edge Function de verificación de firma (Etapa 2).
