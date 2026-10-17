# Auditoría de Storage y seguridad — SOI El Sistema PC

Fecha: 2026-10-17 · Proyecto Supabase: `SOI_DDBB_EL_SISTEMAPC` (`zmhmdvmyeyswunurcyow`) · Rama: `claude/storage-privado-urls-firmadas`

**Estado: nada de esto está aplicado en producción.** La rama contiene el código, la migración, el
script de reversión y las pruebas. Aplicar la migración, fusionar con la rama principal y desplegar
requieren autorización explícita.

## 1. Hallazgos

Todos verificados contra producción en modo solo lectura (políticas, buckets, funciones) y contra el código.

| # | Sev. | Hallazgo | Estado |
|---|------|----------|--------|
| 1 | Alta | Bucket `documentos` **público**, pero el código guardaba URLs públicas permanentes de justificaciones médicas, ausencias y contratos de comodato. Hoy tiene 0 objetos, así que no hubo fuga, pero cualquier archivo subido habría sido accesible sin sesión. | Corregido en rama |
| 2 | Alta | Políticas de `justificaciones/` demasiado amplias: **cualquier maestro** podía leer y borrar la evidencia de todos los alumnos (`es_admin() OR maestro_actual() IS NOT NULL`). | Corregido en rama |
| 3 | Media | Las subidas a `ausencias/`, `planning/` y `comodatos/` eran rechazadas por RLS (sin políticas); fotos de instrumentos sin política de escritura. | Corregido en rama |
| 4 | Media | El código apunta a buckets inexistentes (`planificacion-docs`, `tareas`, `inventario`). | Corregido en rama |
| 5 | Media | `es_admin()` incluye el rol `inventarista` y se usa en **194 políticas de 122 tablas**. El CHECK de `profiles.rol` **no admite** ese rol (0 filas, no asignable), pero el portal de inventario lo trata como válido. Riesgo latente, no explotable hoy. | Mitigado en Storage; decisión pendiente |
| 6 | Media | Funciones `SECURITY DEFINER` (`es_admin`, `maestro_actual`) sin `search_path` fijado. | Corregido en rama |
| 7 | Info | `20260915110000_signage_storage_rls_fix.sql` está en el repo pero **no** en producción y es **más permisiva** (permite escribir a cualquier autenticado). **No aplicar.** | Documentado |
| 8 | **Crítica** | **Escritura anónima** en 8 tablas (`class_events`, `class_event_methodology`, `homework_assignments`, `horarios`, `planned_content`, `programas`, `salones`, `notificaciones_asistencia`): políticas `USING/CHECK true` para el rol `public` más permisos de tabla para `anon`. Deducido de la configuración, no probado escribiendo. | **Fuera de alcance — propuesta lista** |
| 9 | Alta | `tareas_institucionales` con política `ALL … true` para cualquier usuario autenticado. En total 51 tablas tienen 64 políticas de escritura abiertas a `authenticated`. | Fuera de alcance — propuesta |
| 10 | Media | `is_super_admin()` concede acceso por un email fijo en el JWT. Hoy es seguro (el email existe y está confirmado; 31/31 usuarios confirmados), pero depende de que nadie pueda registrar ese email. | Pendiente |
| 11 | Baja | Avisos del asesor de Supabase: 1 vista `SECURITY DEFINER`, protección de contraseñas filtradas desactivada, 1 extensión en `public`. | Pendiente |

## 2. Correcciones realizadas

### Base de datos — `supabase/migrations/20261017200000_storage_buckets_privados_y_politicas.sql`
- `documentos` pasa a **privado**, 10 MB, lista blanca de tipos MIME.
- Nueva `es_admin_estricto()` (solo `profiles.rol = 'admin'`, `search_path` fijo, sin acceso para `anon`). Las políticas sensibles no dependen de `es_admin()`.
- `justificaciones/<auth.uid()>/<archivo>`: subir y borrar solo el maestro propietario o admin estricto; leer además el maestro **titular o suplente de la clase** de la justificación que referencia el archivo (`maestro_en_clase()`).
- `ausencias/<maestro_id>/` y `planning/<maestro_id>/`: solo el maestro dueño o admin estricto.
- `comodatos/`, `instrumentos-fotos`: personal de inventario (`es_admin()`, que es la intención del portal).
- Nuevos buckets privados `planificacion-docs` (carpeta por usuario) y `tareas` (solo admin estricto: hoy no hay flujo de subida en el frontend).
- `signage`: **sigue público** (lectura sin sesión para la Raspberry Pi), con límites de 50 MB y tipos de imagen/vídeo; la escritura pasa a admin estricto.
- `search_path` fijado en `es_admin()` y `maestro_actual()` (todas sus referencias ya estaban calificadas: sin cambio de comportamiento) e índice sobre `justificaciones(evidencia_url)`.

### Código
- `src/lib/storageFiles.js` (reescrito): lista de buckets privados; validación de rutas (sin `..`, `.`, segmentos vacíos, `\`, caracteres de control, esquemas como `javascript:`); rechazo de URLs de Supabase con ruta manipulada; solo se aceptan URLs firmadas `http(s)`; enlaces con esquemas seguros (`data:text/html`, `javascript:` → `href="#"`); apertura en pestaña nueva con `opener = null`; evento cancelable `storage:error`.
- Las subidas guardan **la ruta**, no una URL pública; `justificaciones/` ahora incluye el uid del propietario y la extensión sale del tipo MIME.
- Siete puntos de visualización firman la URL al abrir. Los datos antiguos (URLs públicas, base64) siguen funcionando.
- Fotos de activos de inventario → `instrumentos-fotos` (público, solo imágenes); la ruta de planificación incluye el uid.

## 3. Pruebas y resultados

| Prueba | Resultado |
|---|---|
| Suite completa (Vitest) | **535 archivos / 4650 tests aprobados**, 0 fallos (2 archivos y 7 tests omitidos ya existentes) |
| ESLint en archivos modificados | 0 errores |
| Build de producción (Vite) | Correcto |
| **Integración de políticas** (`npm run test:storage`, PostgreSQL 18 aislado) | **79/79 aprobadas** |
| Idempotencia (migración aplicada dos veces) | Correcta |
| **Reversión** verificada (8 comprobaciones) | **8/8 aprobadas**: vuelve al estado original de producción |
| Pruebas de mutación (debilitar `es_admin_estricto`; reabrir la lectura entre maestros) | Detectadas: fallan 7 y 3 pruebas respectivamente |

El entorno aislado carga una réplica del estado de producción (funciones y políticas reales de `es_admin`,
`maestro_actual`, `is_super_admin`, `maestro_en_clase`, RLS de `justificaciones`, políticas de Storage vigentes) y
prueba, por rol (admin, maestro propietario, maestro ajeno, suplente, usuario sin ficha, inventarista, anon,
superadmin), subir, leer, reemplazar y borrar en cada bucket. Las sondas previas confirman en la réplica los
riesgos 1, 2 y 5. **Una de las pruebas encontró un fallo en mi primer diseño** (el inventarista leía evidencia por
herencia de la política de la tabla), corregido con `maestro_en_clase()` explícito.

**Limitaciones:** es una réplica, no Supabase real (falta la API de Storage, sus triggers y el límite de tamaño/MIME,
que Storage aplica en la subida). No hay una rama de Supabase ni un proyecto de staging; crear una rama tiene coste
y no lo hice sin tu autorización. Las pruebas de navegador/PWA no se ejecutaron; el recorrido manual (sección 4, paso 5) es obligatorio.

## 4. Plan de despliegue

**Principio:** primero el frontend (compatible con el estado actual), después la migración.

1. **Preparación.** Confirmar un respaldo reciente de la base de datos. Revisar este informe y las propuestas.
2. **Verificación previa (solo lectura)** — todo debe dar 0:
   ```sql
   select (select count(*) from storage.objects where bucket_id='documentos') as objetos_documentos,
          (select count(*) from public.justificaciones where evidencia_url is not null) as justif_con_archivo,
          (select count(*) from public.ausencias_maestros where archivo_url is not null) as ausencias_con_archivo,
          (select count(*) from public.comodatos_activos where contrato_firmado_url is not null) as comodatos_con_archivo,
          (select count(*) from public.planning_documents) as planificaciones;
   ```
   Si algún valor es mayor que 0 hay datos que migrar: convertir cada URL a ruta con
   `regexp_replace(url, '^.*/storage/v1/object/(public|sign|authenticated)/[^/]+/', '')` antes de hacer privado el bucket
   (el frontend ya acepta ambas formas). Las rutas planas antiguas de `justificaciones/` seguirán siendo legibles
   por admin y por el maestro de la clase, pero no borrables por el maestro.
3. **Vista previa del frontend.** Desplegar la rama como *Deploy Preview* de Netlify (no producción). Sin la migración
   funciona igual que hoy: las subidas a ausencias/planning/comodatos ya fallaban antes por falta de políticas.
4. **Fusionar el frontend** (con tu autorización). Sin la migración no hay regresión.
5. **Aplicar la migración** (con tu autorización), idealmente primero en una rama de Supabase. Una sola transacción.
6. **Verificación posterior**:
   ```sql
   select id, public, file_size_limit from storage.buckets order by id;           -- documentos=false; signage=true
   select policyname, cmd from pg_policies where schemaname='storage' and tablename='objects' order by 1;
   select proconfig from pg_proc where proname in ('es_admin','maestro_actual','es_admin_estricto');
   ```
   Recorrido manual (cada punto con el rol indicado):
   - Maestro: justificar una ausencia con foto → verla → reabrirla; **otro maestro no** puede verla.
   - Maestro: crear una solicitud de ausencia con comprobante; Admin: abrirlo desde aprobaciones.
   - Admin: subir y reemplazar una imagen en la cartelera; abrir `/signage/` **sin sesión** y comprobar que carga.
   - Inventario: foto de activo y contrato de comodato (PDF); planificación con archivo.
   - Revisar en los registros de Supabase (24 h) errores 400/403 de Storage.
7. **Criterios de reversión:** cualquier flujo crítico bloqueado que no se corrija hacia delante en el día, o la cartelera
   sin cargar. Ejecutar `docs/storage-security/rollback_20261017200000.sql` (probado). Si ya hay archivos sensibles
   subidos **no reabrir `documentos`**; corregir las políticas en su lugar.
8. **Después:** valorar `propuestas_rls_fuera_de_alcance.sql` (**sección A es urgente e independiente de esta rama**).

## 5. Riesgos pendientes

1. **Crítico — escritura anónima en 8 tablas** (hallazgo 8). SQL listo en `propuestas_rls_fuera_de_alcance.sql` (sección A): solo cambia el rol de las políticas de escritura a `authenticated`; reversible. Verificar antes que ningún flujo sin sesión escriba en ellas.
2. **Alto — políticas `true` para `authenticated`** en 51 tablas, incluida `tareas_institucionales`. Requiere rediseño por rol.
3. **Medio — decisión sobre `inventarista`**: eliminarlo de `es_admin()` (no-op hoy) o formalizarlo con su propia función. No añadirlo al CHECK mientras `es_admin()` lo incluya.
4. **Medio — `is_super_admin()` por email fijo.** Preferible un claim en `app_metadata` o un rol en `profiles`; mantener la confirmación de email obligatoria.
5. **Medio — URLs firmadas** válidas 5 minutos: quien copie el enlace lo puede reutilizar ese tiempo.
6. **Bajo** — avisos del asesor de Supabase (hallazgo 11). `npm run test:storage` no está en CI.
7. **Validación en Supabase real pendiente** (rama de Supabase / staging).

## 6. Preparación para el módulo de documentos públicos y QR

La infraestructura queda lista, sin implementar el módulo:
- `documentos` **permanece privado**; no reutilizarlo para contenido público.
- Para el módulo: bucket separado (p. ej. `documentos-publicos`, público, escritura solo `es_admin_estricto()`, límites de tamaño/MIME) más una tabla de registro con un `slug` permanente.
- El QR debe codificar una URL estable de la aplicación (`/d/<slug>`), no la URL de Storage, para poder reemplazar o revocar el archivo sin reimprimir códigos.
- `storageFiles.js` ya distingue buckets públicos y privados, y el harness de pruebas se puede extender con el nuevo bucket.
