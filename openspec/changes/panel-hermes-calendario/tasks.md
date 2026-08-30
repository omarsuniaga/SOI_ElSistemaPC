# Tasks: Panel Hermes Proactivo — Calendario Institucional

## Phase 1: Infraestructura / Migración SQL

- [ ] 1.1 Crear `supabase/migrations/xxxx_fn_hermes_resolver_caso.sql` copiando el RPC final de `design.md` (Interfaces/Contracts): fail-closed `owner_department IS NULL` (primero), guard estado `status='open'` (vocabulario real del CHECK `hermes_process_cases_status_check`; no existen 'pending'/'approved'/'rejected' en el esquema), `EXISTS` N:M sobre `usuario_departamentos`/`departamentos`, remapeo `p_decision` ('approve'→`status='closed'`, 'reject'→`status='cancelled'`) con `closure_summary` describiendo quién/desde qué departamento, `UPDATE ... WHERE status='open'`, `REVOKE EXECUTE FROM PUBLIC` + `GRANT ... TO authenticated`.
- [ ] 1.2 Aplicar la migración en un branch de test de Supabase (`apply_migration`) y confirmar creación sin errores de sintaxis/permmisos.

## Phase 2: Backend / API (`calendarioUnificadoApi.js`)

- [ ] 2.1 Agregar `fetchCasosHermes()`: `SELECT *` sobre `hermes_process_cases`, solo lectura, todos los roles.
- [ ] 2.2 Agregar `resolverCasoHermes(caseId, decision)`: invoca `supabase.rpc('fn_hermes_resolver_caso', {p_case_id, p_decision})`, propaga el error (incl. `42501`) al caller sin manejarlo como autorización local.
- [ ] 2.3 Agregar `fetchVistaAnticipacion(rango)`: 3 queries encadenadas (`calendario_institucional` por rango → `tareas_institucionales` por `event_id` → `hermes_process_cases` por `entity_id`), agrupar por `departamento` y ordenar ascendente por `fecha_vencimiento` en JS (evento sin tareas → lista vacía, sin error).

## Phase 3: Frontend / Componentes

- [ ] 3.1 Crear `src/modules/calendario/components/PanelHermes.jsx`: lista de casos vía `fetchCasosHermes`, botones approve/reject que llaman `resolverCasoHermes` (sin lógica de autorización en cliente); si `metadata.automationLevel` existe, renderizar solo como badge informativo (sin condicionar UI/negocio).
- [ ] 3.2 Crear `src/modules/calendario/components/VistaAnticipacion.jsx`: render agrupado por departamento/vencimiento vía `fetchVistaAnticipacion`, solo lectura, sin controles que editen `tareas_institucionales`.
- [ ] 3.3 Registrar ambos componentes en el router de Calendario (feature flag si aplica), sin tocar RLS de lectura existentes.

## Phase 4: Monitoreo / Cron Externo

- [ ] 4.1 Crear `supabase/scan-vencimientos.js` (patrón `analyze-risk.js`, cliente service role): filtrar `tareas_institucionales` en `[hoy, hoy+N]` con `estado <> 'completado'`; upsert idempotente en `hermes_process_cases` por `metadata->>'source_task_id'`; **nunca** `UPDATE tareas_institucionales`, **nunca** llamada externa.
- [ ] 4.2 Configurar cron externo (Hermes cronjob) para ejecutar `scan-vencimientos.js` diariamente; validar con corrida manual antes de activar el schedule.

## Phase 5: Operativo (no-código)

- [ ] 5.1 Documentar/ejecutar seed manual de `usuario_departamentos` (mapeo `user_id` → `departamento_id`) — prerrequisito para que `fn_hermes_resolver_caso` autorice a cualquier usuario; sin esto, todo approve/reject falla por diseño (fail-closed).

## Phase 6: Testing (TDD — `npm run test:run`, Vitest)

- [ ] 6.1 RED: test unit `fn_hermes_resolver_caso` lógica de matching (mock cliente Supabase) — casos: mismo depto aprueba, cross-depto rechaza, sin depto asignado rechaza.
- [ ] 6.2 GREEN: confirmar que el mock pasa contra la implementación de 2.2.
- [ ] 6.3 RED: test unit `fetchVistaAnticipacion` agrupación/orden — fixtures evento+tareas multi-departamento, orden ascendente por `fecha_vencimiento` dentro de cada grupo.
- [ ] 6.4 GREEN: confirmar contra 2.3.
- [ ] 6.5 RED: test unit `scan-vencimientos.js` idempotencia — segunda corrida sobre misma tarea → `update`, no `insert` duplicado.
- [ ] 6.6 GREEN: confirmar contra 4.1.
- [ ] 6.7 Integration SQL (branch Supabase): caso `owner_department='FIN'` + usuario `ACM` → excepción `42501`, `status` intacto (permanece `open`).
- [ ] 6.8 Integration SQL: caso con `owner_department IS NULL` → CUALQUIER usuario (con o sin depto) falla con `42501` — verifica el fix crítico #1 (NULL bypass), `status` permanece `open`.
- [ ] 6.9 Integration SQL: guard de estado — caso ya `closed`/`cancelled` (o `in_progress`/`blocked`) → segunda invocación falla con "caso no está en estado open".
- [ ] 6.10 Integration SQL: usuario con filas N:M en `usuario_departamentos` (ACM y FIN) resuelve con éxito un caso `owner_department='FIN'` — verificar `status='closed'` con decision `approve` y `status='cancelled'` con decision `reject`, ambos con `closure_summary` no NULL.
- [ ] 6.11 Ejecutar `npm run test:run` completo; suite en verde antes de pasar a sdd-verify.

---

## Review Workload Forecast

Estimación de líneas por área (código nuevo/modificado, incluye comentarios donde aplica):

| Área | Líneas est. |
|---|---|
| Migración SQL (`fn_hermes_resolver_caso` completo + REVOKE/GRANT + comentarios) | 70–90 |
| `calendarioUnificadoApi.js` (3 funciones nuevas) | 90–120 |
| `PanelHermes.jsx` | 150–220 |
| `VistaAnticipacion.jsx` | 150–220 |
| `scan-vencimientos.js` | 70–100 |
| Config cron externo | 10–20 |
| Tests unitarios (3 archivos Vitest) | 150–250 |
| Tests integración SQL (4 escenarios) | 100–150 |
| **Total estimado** | **~790–1170** |

El total (~980 líneas en el punto medio) excede ampliamente el budget de revisión de 400 líneas por PR si se entrega como un solo PR. Las fases del breakdown ya son slices naturales con alcance autónomo, verificación propia (tests por fase) y rollback simple (`DROP FUNCTION`, remover ruta/componente, remover cron):

- PR1 = Phase 1 (migración SQL) → ~75–90 líneas
- PR2 = Phase 2 (API) + tests 6.1–6.4 → ~250–370 líneas
- PR3 = Phase 3.1 (`PanelHermes.jsx`) → ~150–220 líneas
- PR4 = Phase 3.2–3.3 (`VistaAnticipacion.jsx` + router) → ~160–230 líneas
- PR5 = Phase 4 (`scan-vencimientos.js` + cron) + tests 6.5–6.6 → ~220–350 líneas
- PR6 = Phase 6.7–6.10 (integration SQL) → ~100–150 líneas

Cada slice individual queda bajo o cerca del budget de 400 líneas; el conjunto completo no.

**Decision needed before apply: Yes**
**Chained PRs recommended: Yes**
**400-line budget risk: High**
