# Reconciliación del ledger de migraciones

**Fecha:** 26 de julio de 2026 · **Proyecto:** `zmhmdvmyeyswunurcyow` (SOI_DDBB_EL_SISTEMAPC)

`supabase db push` falla porque el historial local y el remoto divergieron. Este documento
resuelve esa divergencia **verificando contra la base**, no asumiendo.

## Por qué no sirve un `repair` masivo

Marcar los 54 archivos huérfanos como `applied` registraría una mentira: de esos, **44 sí se
aplicaron a mano** y **10 nunca se aplicaron**. Si se marcan todos, las 10 pendientes quedan
registradas como hechas y nadie vuelve a mirarlas — el mismo mecanismo que mantuvo el módulo
de planificación roto durante cuatro días.

## Cómo se determinó

El ledger guarda `version` y `name`. Los archivos se cruzaron por ambos campos (el diff por
versión sola sobre-reporta: los archivos aplicados vía MCP quedan con versión de timestamp,
distinta del prefijo del nombre). Para los 54 realmente ausentes se extrajo cada
`CREATE TABLE / FUNCTION / VIEW` y se verificó su existencia en producción.

---

## ✅ Aplicadas — marcar como `applied`

Sus objetos existen en producción. Solo falta el registro.

```bash
supabase migration repair --status applied 20260530   # 9 archivos comparten esta versión
supabase migration repair --status applied 20260604000001
supabase migration repair --status applied 20260604000002
supabase migration repair --status applied 20260605000001
supabase migration repair --status applied 20260605000002
supabase migration repair --status applied 20260606
supabase migration repair --status applied 20260607
supabase migration repair --status applied 20260608
supabase migration repair --status applied 20260615000001
supabase migration repair --status applied 20260618000001
supabase migration repair --status applied 20260622
supabase migration repair --status applied 20260623
supabase migration repair --status applied 20260625
supabase migration repair --status applied 20260626
supabase migration repair --status applied 20260627
supabase migration repair --status applied 20260630
supabase migration repair --status applied 20260704
supabase migration repair --status applied 20260707
supabase migration repair --status applied 20260714
supabase migration repair --status applied 20260714203000
supabase migration repair --status applied 20260715   # solo rls_close_gaps
supabase migration repair --status applied 20260719
```

Objetos confirmados en producción, entre otros: `audiciones`, `calendario_institucional`,
`campanias_*`, `conversaciones_whatsapp`, `document_templates`, `evaluations`,
`hermes_process_cases`, `hermes_whatsapp_queue`, `indicator_sessions`, `instrumentos`,
`lut_ordenes_reparacion`, `objetivos`, `periodos_cierre_auditoria`, `repertoire_items`,
`rutas_contenido`, `sections`, `seguimiento_reglas`, `sim_runs`, `soi_process_contracts`,
`solicitudes_necesidades`, `student_cases`, `tareas_institucionales`, `telegram_allowed_users`,
`whatsapp_optout`, más las funciones `analizar_seguimiento_alumnos`,
`clone_route_version_as_draft`, `diagnose_profiles_schema`,
`fn_check_and_notify_pending_asistencias`, `generate_pending_class_notifications`, y las vistas
`student_results`, `v_semaforo_contenidos`, `vw_cupos_iniciacion`.

> **Cuidado con las versiones compartidas.** Nueve archivos usan `20260530` y varios comparten
> `20260622`, `20260626`, `20260630`, `20260704`, `20260715`. Un `repair` sobre esa versión los
> cubre a todos, incluidos los que **no** están aplicados. Ver la sección siguiente.

---

## ❌ No aplicadas — NO marcar como `applied`

Sus objetos **no existen** en producción. Verificado uno por uno.

| archivo | objeto ausente | decisión |
|---|---|---|
| `20260605000003_create_plantillas_dsl.sql` | `plantillas_dsl` | pendiente de decisión |
| `20260605000004_create_plantillas_planificacion.sql` | `plantillas_planificacion` | pendiente de decisión |
| `20260617000000_add_genero_to_alumnos.sql` | `alumnos.genero` | pendiente de decisión |
| `20260530_add_contenido_ia_mejorado_to_observaciones_sesion.sql` | columna homónima | pendiente de decisión |
| `20260704_000003_fn_objetivo_actual_alumno.sql` | `fn_objetivo_actual_alumno` | pendiente de decisión |
| `20260708_tool_catalog_core.sql` | `soi_tool_catalog`, `soi_tool_log` | pendiente de decisión |
| `20260715_internal_fn_key_auth.sql` | `get_internal_fn_key` | pendiente de decisión |
| `20260715_pedagogical_evaluations_dashboard.sql` | `fn_evaluacion_cobertura`, `view_evaluaciones_pedagogicas` | pendiente de decisión |
| `20260722000001_planificacion_rediseño_tablas.sql` | `class_curriculum_plan`, `clase_objetivos`, `evaluacion_indicador` | **archivada, no desplegar** |
| `20260722000003_planificacion_rediseño_rpcs.sql` | 3 RPCs del bridge | **archivada, no desplegar** |

**Conflicto de versión compartida:** `20260715` agrupa tres archivos —
`rls_close_gaps` (aplicada), `internal_fn_key_auth` (no) y
`pedagogical_evaluations_dashboard` (no). Renombrar los dos no aplicados con timestamp propio
antes del `repair`, o el registro quedará falso.

---

## ⏸️ Sin objetos creables — requieren verificación individual

Solo hacen `ALTER`, `CREATE POLICY` o inserción de datos, así que no se pueden verificar por
existencia de objeto. Estado conocido:

| archivo | verificación | estado |
|---|---|---|
| `20260530_emergente_id_sesiones.sql` | `sesiones_clase.emergente_id` existe | ✅ aplicada |
| `20260630_001_extend_hermes_inbox_for_telegram.sql` | `hermes_inbox.telegram_user_id` existe | ✅ aplicada |
| `20260713_000001_add_classifier_models_to_system_config.sql` | clave de clasificador presente | ✅ aplicada |
| `20260711_sim_config_tool_gateway.sql` | `sim_config` existe | ✅ aplicada |
| `20260705_000001_add_route_versions_admin_update_policy.sql` | hay policy UPDATE en `route_versions` | ⚠️ existe una, con otro nombre — revisar |
| `20260704_000002_route_status_enum.sql` | sin CHECK en `route_versions` | ❌ probablemente no aplicada |
| `20260530_fix_postulantes_rls.sql` | — | pendiente |
| `20260622_hermes_tasks_extension.sql` | — | pendiente |
| `20260702_telegram_cron_jobs.sql` | — | pendiente |
| `20260709_tool_gateway_entidad_tipo.sql` | depende de `soi_tool_catalog`, que no existe | ❌ no aplicable |
| `20260710_tool_gateway_handler_types_backfill.sql` | ídem | ❌ no aplicable |
| `20260722000000_planificacion_rediseño_limpieza.sql` | las tablas `plan_*` siguen existiendo | ❌ **no aplicada — desplegar** |
| `20260722000002_planificacion_rediseño_modificaciones.sql` | `planificaciones.route_version_id` no existe | ❌ archivada, no desplegar |

---

## Orden de ejecución recomendado

1. **Separar las versiones compartidas.** Renombrar con timestamp propio los archivos no
   aplicados que comparten versión con una aplicada — al menos los dos de `20260715`.
2. **Correr los `repair --status applied`** de la primera sección.
3. **Desplegar únicamente `20260722000000_planificacion_rediseño_limpieza.sql`.** Es la única
   del rediseño que conviene aplicar: elimina siete tablas zombie, ya usa `RESTRICT` en vez de
   `CASCADE`, y se verificó que **cero vistas y cero funciones dependen de ellas**.
4. **Decidir caso por caso** las ocho pendientes de la segunda sección. Ninguna es urgente.

## Qué NO hacer

- `supabase migration repair` sobre todo el rango sin discriminar.
- Desplegar `_tablas`, `_modificaciones` o `_rpcs` del rediseño de planificación: están
  marcadas `📦 ARCHIVADO / OMITIDO DE DESPLIEGUE` por RLS permisiva sin `WITH CHECK`, matcheo
  por instrumento con `ILIKE` que falla con plurales y acentos, y `DISTINCT ON` sin `ORDER BY`.
  El vínculo clase↔ruta ya se resuelve por `clases.route_version_id`.

## Cómo evitar que vuelva a pasar

La divergencia se produjo por aplicar SQL a mano contra producción sin registrar la migración.
Mientras el equipo trabaje así, el ledger seguirá mintiendo. Aplicar siempre por el pipeline
—o registrar inmediatamente después— es más barato que auditar 172 archivos.
