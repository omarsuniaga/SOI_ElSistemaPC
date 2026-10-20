# Funciones SECURITY DEFINER ejecutables por `anon` — inventario y grupo 1

Proyecto Supabase `zmhmdvmyeyswunurcyow`. Fecha: 2026-10-20. Rama: `claude/secdef-anon-audit-41edbb` (parte de `claude/authenticated-wide-open-tables-8c6153`).
Producción: **solo lectura** (SELECT a `pg_catalog`, `cron.job` y logs de API). Nada aplicado, ningún dato personal leído.

## 1. Veredicto

| | |
|---|---|
| Riesgo | **Alto y real.** Una persona con solo la clave pública `anon` puede llamar por `/rest/v1/rpc` funciones que corren como `postgres` y se saltan toda RLS: generar cuotas, disparar notificaciones/push, reescribir alumnos y postulantes. |
| Grupo 1 (esta entrega) | **Listo para aplicar con autorización**: migración + rollback + 537 comprobaciones por rol + mutación 10/10. No aplicado en producción. |
| Pendiente antes de aplicar | Confirmar con quien opera Hermes que las 4 funciones `fn_hermes_*` / `fn_registrar_alerta_enviada` no se llaman con la clave `anon` (sin consumidor en el repo; ver §5). |
| Resto del inventario | Plan por fases en §7. Incluye **12 vistas definer legibles por anon** (alumnos críticos por ausentismo, estado familiar, mora) que el brief no pedía pero son el mismo riesgo. |

## 2. Inventario real (pg_catalog)

Esquemas `public` y `soi_security`, `prokind='f'`:

| Clase | Funciones |
|---|---|
| SECURITY DEFINER ejecutables por **anon** | **131** (todas en `public`) |
| …de ellas con INSERT/UPDATE/DELETE en el cuerpo | **68** (30 no-trigger sin guarda + 24 funciones de trigger + 3 con secreto + 11 con guarda de rol/uid; el recuento incluye falsos positivos) |
| …sin `search_path` fijado | 50 |
| SECURITY DEFINER solo `authenticated` | 57 + 3 en `soi_security` (helpers de RLS) |
| SECURITY DEFINER sin acceso API | 9 |
| SECURITY INVOKER ejecutables por anon | 92 (8 escriben; quedan sujetas a RLS) |
| Vistas sin `security_invoker` | 14 (12 con SELECT para anon) |

El diagnóstico previo hablaba de ~128 funciones y 13 vistas; la medición de hoy es 131 y 14. Todas pertenecen a `postgres`. El ACL por defecto de Supabase (`anon=X, authenticated=X, service_role=X`, y en la mayoría además `PUBLIC=X`) es la causa: toda función nueva nace expuesta.

Cron (11 jobs, todos dueño `postgres`): `fn_generate_class_start_reminders` (cada 2 min), `generate_pending_class_notifications` (×3 al día), `fn_check_and_notify_pending_asistencias` (L-V 19:00, sáb 13:00), `fn_hermes_escalar_tareas_bloqueadas` (cada 4 h), `fn_generar_ciclo_cuotas` (día 1, 06:00) y 4 jobs `net.http_post` a edge functions.

## 3. Clasificación de las 68 funciones que escriben

| Grupo | n | Criterio | Decisión |
|---|---|---|---|
| **Grupo 1 · A** interna (cron / service_role / cadena de triggers) | 13 | Sin consumidor en `src/`; llamadas por cron, edge function con `SERVICE_ROLE_KEY` o por función de trigger definer | EXECUTE solo `service_role` (+ dueño) |
| **Grupo 1 · B** pantallas con sesión o Hermes | 17 | Llamadas desde `src/` con usuario autenticado, o sin consumidor conocido | quitar `anon`/`PUBLIC`; mantener `authenticated` + `service_role` |
| **Grupo 1 · C** `backfill_alumnos_desde_postulantes` | 1 | Cuerpo sin ninguna validación de identidad; escribe `alumnos`/`postulantes` y devuelve nombres también en `dry_run` | envoltorio con guarda `admin`/`superadmin`/`service_role`; original renombrado a `_impl`, solo dueño |
| Con secreto compartido (`hermes_internal_lookup_secret`) | 3 | `fn_actualizar_contacto`, `fn_actualizar_estado_postulante`, `fn_marcar_asistencia`. Verificado: la guarda **falla cerrada** (`secret IS NULL OR p_secret IS NULL OR p_secret <> secret` → `unauthorized`) | Sin cambio ahora; fase 2 |
| Funciones de trigger | 24 | Devuelven `trigger`, no se pueden invocar por RPC | Sin riesgo directo; fase 3 (higiene) |
| Guarda de rol/uid, anon aún ejecuta | 11 | `cambiar_estado_activo`, `cambiar_estado_reparacion`, `crear_reparacion`, `renovar_comodato`, `intercambiar_instrumentos`, `retirar_maestro_seguro`, `reactivar_maestro_seguro`, `set_user_portales`, `update_profile`, `clone_route_version_as_draft`, `preview_retiro_maestro` (esta última solo lee) | Fase 2: quitar `anon` |

Grupo 1 = 31 funciones (30 definer + `generate_pending_class_notifications`, INVOKER, ejecutable por anon).

### Las funciones nombradas en el encargo

| Función | Hallazgo | Tratamiento |
|---|---|---|
| `backfill_alumnos_desde_postulantes(boolean)` | Sin guarda; filtra nombres con `dry_run` | C: guarda admin |
| `fn_actualizar_contacto(...)`, `fn_actualizar_estado_postulante(...)` | Guardadas por secreto, fail-closed | Fase 2 (mover a service_role cuando Hermes use esa clave) |
| `fn_check_and_notify_pending_asistencias()` | Cron L-V/sáb; inserta en `notificaciones` → dispara push | A |
| `fn_generate_class_start_reminders()` | Cron cada 2 min; mismo efecto | A |
| `generate_pending_class_notifications()` | INVOKER, cron ×3; sin RLS de por medio para postgres | A |

## 4. Consumidores y evidencia

Búsqueda en `src/`, `supabase/functions/`, `supabase/cron-jobs.sql`, `cron.job`, `pg_trigger`, `pg_policies`, `pg_views` y cuerpos de otras funciones.

- **Cron / postgres** (A): ver §2. No necesitan GRANT: ejecutan como dueño.
- **Edge functions con `SERVICE_ROLE_KEY`** (A): `refresh-service-balances` → `fn_fin_acquire_service_refresh_lock`, `fn_fin_complete_service_refresh`; `soi-pattern-analyzer` → `fn_calcular_pulso_score` (B conserva `service_role`).
- **Cadena de trigger** (A): `trg_evaluacion_indicador_gamificacion` → `fn_trigger_evaluacion_gamificacion` (SECURITY DEFINER) → `fn_actualizar_racha_alumno`, `fn_evaluar_logros_alumno`. Un trigger definer ejecuta con los permisos del dueño, así que revocar a `authenticated` no la rompe (probado en la suite, fase `flows`).
- **Pantallas autenticadas** (B): `postulantesSupabase.js` (backfill), `calendarApi.js` (`fn_crear_evento_calendario`, `fn_actualizar_tarea`), `tareasSupabase.js` (`fn_calcular_pulso_score`), `luteriaDiagnosticoWizard.js`, `alumnosCriticosService.js`/`seguimientoAusentesService.js` (`justificar_alumno_por_dia`), `plantillasPlanificacionSupabase.js`, `repertoireAdapter.js`, `FinanceContext.tsx` (`fn_generar_instancias_gastos_fijos`).
- **Sin consumidor en el repo** (B, requiere confirmación): `fn_hermes_orquestar_protocolo`, `fn_hermes_register_response`, `fn_hermes_update_notif`, `fn_registrar_alerta_enviada`, `fn_upsert_protocolo`, `clonar_plantilla_a_clase`, `ensure_session_and_save_evaluation`, `fn_generar_tareas_calendario`. Se les quita `anon`; conservan `authenticated`.
- **Falso consumidor**: `supabaseManager.ts` lista `fn_generar_ciclo_cuotas` en `REQUIRED_RPCS`, pero el diagnóstico marca `passed` con valor fijo, no invoca la función.
- **Logs de API** (edge_logs, ventanas ≤12 h; la de 24 h falla): 2026-10-16 14:00Z–10-17 02:00Z, 10-19 02:00Z–14:00Z, 10-19 14:00Z–10-20 02:00Z y 10-20 04:00Z–14:00Z. Solo aparecen `has_portal_access`, `fn_estado_asistencia_maestro` y `admin_last_sign_in`. **Ninguna función del grupo 1 fue llamada por RPC en esas ventanas.** `track_functions=none`, así que no hay contadores. Es ausencia de evidencia de uso, no prueba de no uso (el día laboral 15 de octubre no respondió).

## 5. Riesgos de la solución y mitigación

| Riesgo | Mitigación |
|---|---|
| Un bot de Hermes llama `fn_hermes_*` con clave `anon` | No hay llamadas en las ventanas observadas ni código en el repo. **Confirmar antes de aplicar.** Rollback de una transacción. |
| `service_role` pierde una RPC | Probado: matriz con `service_role` y mutante M7 |
| El cron se rompe | Los jobs corren como `postgres` (dueño); probado con el actor `postgres_cron` |
| El DBA ya no puede llamar `backfill` desde el SQL editor | Por diseño: la guarda exige `service_role` o admin activo. Puede llamar `backfill_alumnos_desde_postulantes_impl` como `postgres` |
| Una función nueva reabre la superficie | Fuera de alcance de este PR: ver `ALTER DEFAULT PRIVILEGES` en §7 |

La migración no cambia cuerpos de funciones, `search_path`, vistas, políticas ni los privilegios por defecto.

## 6. Entregables

- Migración: `supabase/migrations/20261020130000_revoke_anon_execute_secdef_group1.sql` — transaccional, idempotente, aborta si falta alguna función (deriva de esquema) y se autoverifica (ACL exacto por grupo, sin `PUBLIC`, envoltorio definer con `search_path`, `_impl` solo dueño).
- Rollback exacto: `supabase/rollback/20261020130000_revoke_anon_execute_secdef_group1.rollback.sql` (restaura el ACL original capturado, con y sin entrada `PUBLIC`, y devuelve el nombre original a `backfill`).
- Pruebas: `supabase/tests/secdef-anon/` (`run_tests.mjs`, `mutation_check.mjs`, `functions.mjs`). PostgreSQL 17 en Docker, línea base = subconjunto de producción de `anon-write-fix` + `authenticated-wide-open`, con las funciones modeladas por firma real (cuerpo reducido a su efecto: fila de prueba y, en notificadoras, inserción en `notificaciones` con el trigger de push). **Límite honesto:** se prueba la capa de privilegios y la guarda del envoltorio, no la lógica de negocio de cada cuerpo.

### Resultados

```
before 61/61   after 429/429   effect 2/2   flows 2/2   acl 35/35
idempotency 2/2   self-check 2/2   rollback 4/4        537 checks, 0 FAILURES
```

Matriz `after`: 13 actores (anon, user, alumno, maestro titular, maestro con `activo=false`, coordinación, dirección, finanzas, admin, admin inactivo, superadmin, service_role, postgres/cron) × 30 funciones, más el envoltorio con `dry_run` true/false y `_impl`. Grupo A: solo `service_role` y `postgres`. Grupo B: ningún `anon`. Backfill: solo admin/superadmin activos y `service_role`.

Mutación (`mutation_check.mjs`): **10/10 atrapados** — anon conserva notificadora, authenticated conserva interna, guarda de backfill abierta a cualquier sesión o a maestros, `_impl` ejecutable, anon en función de pantalla, `service_role` pierde RPC de edge function, grant a `PUBLIC`, función olvidada, guarda eliminada.

Reproducir:
```
bash supabase/tests/anon-write-fix/start_pg.sh
node supabase/tests/secdef-anon/run_tests.mjs
node supabase/tests/secdef-anon/mutation_check.mjs
```

## 7. Plan para el resto (orden de aplicación)

1. **Grupo 1** (esta entrega) — tras confirmar Hermes.
2. **Fase 2 — funciones con guarda que aún aceptan anon (14):** las 11 con rol/uid más las 3 con secreto. Quitar `anon` de las 11 (la guarda ya exige sesión). Para las 3 con secreto, migrar Hermes a `service_role` y luego revocar `anon`.
3. **Fase 3 — mínimo privilegio dentro de `authenticated`:** las funciones B hoy las puede llamar cualquier sesión, incluso `alumno` o `user`. Añadir `soi_security.has_role`/capacidad por función (p. ej. `fn_generar_instancias_gastos_fijos` → finanzas/admin; `fn_calcular_pulso_score(true)` → admin; `fn_upsert_protocolo` → admin). Es residual conocido de este PR.
4. **Fase 4 — vistas definer (12 legibles por anon):** `v_alumnos_criticos_ausentismo`, `v_historial_ausencias_detalle`, `v_resumen_alumnos_criticos`, `vw_estado_familiar`, `vw_mora_activa`, `teacher_class_fill_metrics*`, `vw_indice_ensenanza_guiada`, `signage_v_*`. Pasar a `security_invoker=true` o revocar `anon`; las `signage_v_*` pueden ser públicas por diseño (pantallas).
5. **Fase 5 — lectores definer (≈60) sin escritura:** revisar fuga de datos (`fn_alumno_ficha_360`, `fn_resumen_academico_integrado`, `get_informe_academico_semestral`, `fn_resumen_diario_director`, `fn_evaluar_reinscripcion`, `generar_reporte_inventario`, `generar_contrato_pdf`, `fn_list_public_tables`, `diagnose_profiles_schema`). **No revocar a ciegas los predicados de RLS** (`is_admin`, `es_admin`, `maestro_actual`, `has_portal_access`, `get_user_role`…): las políticas los evalúan para `anon` y el log muestra tráfico real a `has_portal_access`.
6. **Fase 6 — causa raíz:** `ALTER DEFAULT PRIVILEGES IN SCHEMA public REVOKE EXECUTE ON FUNCTIONS FROM PUBLIC, anon, authenticated` (y GRANT explícito por función nueva); fijar `search_path` en las 50 sin él; ampliar `policy:check` (R1–R2 de la política) para que una función `SECURITY DEFINER` nueva ejecutable por `anon` falle CI.

## 8. Política de desarrollo (R1–R6)

R1 no aplica (no hay tabla nueva). R2: se cierra la mitad receptora que faltaba (quién puede disparar lo que genera notificaciones). R6: las funciones que notifican y escriben alumnos ya no las dispara un anónimo; la automatización (`fn_check_and_notify…`) sigue siendo cron y no expulsa ni etiqueta. `POLICY-EXCEPTION R2: acceso de cualquier sesión a las funciones B — la guarda por rol llega en la fase 3 — antes de la siguiente ventana de producción`.

## 9. Orden operativo sugerido para quien aplique

1. Confirmar Hermes (§5). 2. Aplicar la migración en una transacción (ya lo es). 3. Probar con la clave anon: `POST /rest/v1/rpc/fn_check_and_notify_pending_asistencias` debe devolver error de permiso (42501). 4. Vigilar `class-start-reminders-cron` (cada 2 min) y la pantalla de calendario 15 min. 5. Si algo rompe: rollback, que reabre solo este grupo.
