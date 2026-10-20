# Escritura abierta a cualquier cuenta autenticada — inventario, clasificación y plan

**Fecha:** 20 de octubre de 2026 · **Rama:** `claude/authenticated-wide-open-tables-8c6153`
**Alcance de producción:** solo lectura (`pg_catalog`, agregados, estadísticas). Nada aplicado, nada fusionado.

## 1. Lista real confirmada

El escáner `supabase/tests/anon-write-fix/01_effective_write_exposure.sql` (versión condensada) se volvió a ejecutar en producción el 20-oct-2026: **47 tablas** con escritura abierta a `authenticated` y **ninguna** con escritura abierta a `anon`. Coincide exactamente con la lista del encargo. El ledger de producción termina en `20261018042037 restrict_write_access_academic_catalog_and_class_records` (las ocho tablas). R9 (`20261017190000`) y Storage (`20261017200000`) **no** están en el ledger. La migración de este trabajo usa la versión `20261020120000`: no solapa con nada.

Perfiles reales: 6 `admin` (todos activos; el encargo decía 5), 25 `maestro` (17 activos; 6 con `estado=activo` pero `activo=false`; 1 inactivo; 1 rechazado). Ningún otro rol.

## 2. Clasificación y prioridad

Filas = `count(*)` agregado. «Escrit. cliente» = sentencias de escritura encontradas en `src/` y `supabase/functions/` (aproximado). «anon lee» = `anon` tiene SELECT con alguna política que lo deja pasar o sin RLS efectiva (verificar por tabla en su bloque).

| Bloque | Tabla | Filas | Dominio / sensibilidad | Observaciones |
|---|---|---:|---|---|
| **1** | postulantes | 404 | PII de aspirantes (teléfonos de madres/padres) | escritura: UI admin, edge functions (service_role), asistente del portal de maestros |
| **1** | alumnos_programas | 456 | matrícula + `calificacion` | **lectura anónima** (política `TO public USING true`) |
| **1** | notificaciones | 526 | mensajes a usuarios; cada INSERT dispara push | INSERT abierto = spam/phishing por push |
| **1** | student_cases / _actions / _alerts / _events | 2 / 0 / 5 / 4 | seguimiento pedagógico con nivel de riesgo (R6) | solo módulo admin `pedagogico` |
| **1** | comunicaciones_seguimiento | 2 | teléfonos y notas de contacto | módulos `pedagogico` y `comunicaciones` |
| **1** | registros_pendientes | 8 | pendientes de asistencia por maestro | ningún cliente escribe |
| **1** | alumno_escolaridad | 0 | datos escolares del alumno | vacía |
| **1** | tarea_comentarios | 1 | comentarios de tareas institucionales | |
| 2 | progresos | 266 | progreso académico del alumno | además políticas `TO public` (INSERT/UPDATE/SELECT); 2 triggers; 39 archivos lo usan |
| 2 | alumnos_logros, logros, rachas | 0 / 3 / 0 | gamificación del alumno | anon lee |
| 2 | contenidos_sesion | 0 | contenido de clases | 7 políticas solapadas, maestro dueño |
| 2 | academic_plans, class_session_content_snapshots | 0 / 0 | planes y copias de contenido | INSERT abierto; anon lee |
| 2 | tareas_institucionales | 524 | tareas de departamentos (Hermes) | 6 triggers, 18 escrituras cliente: bloque propio, el más delicado |
| 2 | hermes_process_cases | 11 | casos Hermes | 3 escrituras cliente |
| 3 | document_templates, document_batches, generated_documents | 11 / 0 / 0 | documentos institucionales | hoy sin clientes de lectura públicos |
| 3 | plan_clases, plan_indicadores, plan_niveles, plan_objetivos, plan_temas | 2 / 15 / 3 / 10 / 7 | planificación académica | 3–5 escrituras cliente cada una; RLS por comando |
| 4 | departamentos, instrumentos, modulos, niveles, unidades, ejercicios | 7 / 3 / 1 / 3 / 1 / 2 | catálogos institucionales | lectura amplia legítima; escritura solo admin/capacidad |
| 4 | configuracion_recordatorios, seguimiento_reglas, soi_process_contracts | 1 / 5 / 4 | configuración | escritura solo admin |
| 5 | lut_diagnosticos, lut_evidencias, lut_insumos, lut_movimientos_insumos, lut_ordenes_reparacion, lut_presupuestos, lut_solicitudes_compra | 0 salvo `lut_ordenes_reparacion` (1) | lutería (inventario/reparación) | `anon` sin SELECT; 1 tabla con datos |
| 5 | sim_calendario, sim_runs, schedule_runs | 39 / 1 / 0 | simulador y planificador | `sim_runs` 127 updates: lo escribe un proceso, identificar quién |

## 3. Orden recomendado de bloques

1. **Bloque 1 (este PR):** datos personales de alumnos y notificaciones.
2. **Bloque 2:** progreso y gamificación del alumno + `contenidos_sesion`, `academic_plans`, snapshots. Requiere análisis de propiedad (`maestro_actual()`, titular/suplente) y del conjunto de políticas `TO public` de `progresos`.
3. **Bloque 3:** `tareas_institucionales` y `hermes_process_cases` (triggers Hermes, 18 escrituras cliente; mayor riesgo de ruptura, por eso aislado).
4. **Bloque 4:** documentos y planificación (`plan_*`, `document_*`, `generated_documents`).
5. **Bloque 5:** catálogos y configuración (escritura por capacidad `catalogo:escribir` ya existente).
6. **Bloque 6:** lutería y simulador (escritores por identificar con logs; riesgo bajo por tablas vacías).

Cada bloque repite el método: subconjunto de esquema capturado en solo lectura, migración transaccional con autoverificación, rollback exacto, suite por rol con mutación.

## 4. Hallazgos laterales (fuera de alcance, para seguimiento)

| # | Hallazgo | Severidad |
|---|---|---|
| L1 | `alumnos_programas` es legible por `anon` (456 filas con `calificacion`). **Cerrado en el bloque 1.** | Alta |
| L2 | Funciones `SECURITY DEFINER` ejecutables por `anon` que escriben datos de alumnos/aspirantes: `backfill_alumnos_desde_postulantes` (el cuerpo visible no valida identidad), `fn_actualizar_contacto` y `fn_actualizar_estado_postulante` (protegidas por un secreto compartido en `system_config`), `fn_check_and_notify_pending_asistencias`, `fn_generate_class_start_reminders`. Cerrar RLS no las afecta. | Alta (R2 del informe anterior) |
| L3 | `adminNotifApi.sendNotificacionToMaestros` inserta `tipo='aviso_admin'`, que viola `notificaciones_tipo_check`: ese flujo ya falla hoy. No se tocó. | Media (funcional) |
| L4 | `generate_pending_class_notifications()` es `SECURITY INVOKER` y ejecutable por `anon`/`authenticated` por RPC; solo el cron (dueño) la ejecuta con éxito tras este cambio. | Baja |
| L5 | Los 5/6 `admin` y los maestros con `profiles.activo=false`: tratados como en la migración anterior (`maestro_actual()`). | Informativo |
| L6 | `on_notification_inserted` incluye la clave publicable en el cuerpo de la función. Es la clave pública (anon), pero conviene moverla a configuración. | Baja |
