# Tasks: Planificación DataAdapter — Migración de consumidores restantes

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | ~350 (150 adapter/mock + 100 lecturas + 100 planClaseApi) |
| 400-line budget risk | Low-Medium |
| Chained PRs recommended | Yes |
| Suggested split | PR #1 (adapter) → PR #2 (lecturas) → PR #3 (planClaseApi) |
| Delivery strategy | auto-chain |

Decision needed before apply: No
Chained PRs recommended: Yes
Chain strategy: stacked-to-main
400-line budget risk: Low-Medium

## Phase 1: Extender el Adapter (PR #1)

- [ ] 1.1 Leer completo `src/portal-maestros/api/planClaseApi.js` (líneas 37-160) para confirmar el shape exacto de `obtenerPlanDeClase`, `guardarPlanDeClase` y `duplicarPlanParaPeriodo` antes de diseñar sus equivalentes en el adapter — en particular si `guardarPlanDeClase` hace upsert condicional (update si existe, insert si no) o siempre insert.
- [ ] 1.2 Añadir a `planificacionSupabase.js`: `obtenerPlanificacionesPorMaestroYEstado`, `obtenerPlanDeClaseActual`, `guardarPlanDeClaseSupabase`, `duplicarPlanificacionParaPeriodo`, `contarPlanificacionesDesde`, `obtenerEstadoPlanificacionReciente` — implementación real contra Supabase, replicando exactamente los filtros que hoy están inline en cada consumidor.
- [ ] 1.3 Añadir las mismas 6 funciones a `planificacionMock.js` — sobre el seed existente en `planificaciones.json`, filtrando/ordenando en memoria.
- [ ] 1.4 Revisar `planificaciones.json`: si ningún registro tiene `estado='ejecutado'` con `created_at`/`fecha_inicio` dentro de los últimos 7 y 56 días desde "hoy" simulado, añadir 2-3 filas nuevas (no crear un seed paralelo).
- [ ] 1.5 Añadir las 6 funciones a `planificacionAdapter.js` como dispatcher `config.isDemoMode ? mock : supabase`, re-exportadas con las mismas firmas de la tabla del proposal.
- [ ] 1.6 Test unitario por función nueva en modo mock (mínimo: devuelve datos, respeta filtro de `estado`, respeta `limit`).

**Verification**: las 6 funciones nuevas existen en ambos backends y el adapter las expone. Ningún consumidor las usa todavía — nada debe romperse. `npm run test:run` verde.

## Phase 2: Migrar lecturas puras (PR #2)

- [ ] 2.1 `src/modules/planificacion/components/asistentePedagogicoPanel.js:234` — reemplazar el `supabase.from('planificaciones')...` por `obtenerPlanificacionesPorMaestroYEstado(state.maestroId, 'ejecutado', { limit: 3, ordenarPor: 'created_at desc' })`; mapear el resultado a `{ tema }` si el consumidor solo usa ese campo.
- [ ] 2.2 `src/modules/planificacion/components/asistentePedagogicoPanel.js:298` — mismo reemplazo, esta vez con filtro de fecha (`gte('created_at', since)`, 56 días) y selección de `tema, contenido, objetivos, instrumento`. Si el adapter no soporta filtro por fecha explícito, extender `obtenerPlanificacionesPorMaestroYEstado` con parámetro opcional `desde`.
- [ ] 2.3 `src/modules/pedagogico/views/dashboardPedagogicoView.js:44` — reemplazar por `contarPlanificacionesDesde(fechaISO)` dentro del mismo `Promise.all`; verificar que el shape devuelto (`{ id, estado }[]`) siga sirviendo al cálculo de KPI que sigue en las líneas posteriores.
- [ ] 2.4 `src/modules/guidance/context/dataSnapshot.js:106` (`getPlanningStatus`) — reemplazar por `obtenerEstadoPlanificacionReciente(20)`; mantener el manejo de error existente (`if (error) throw error` → adaptar al contrato del adapter, que probablemente ya lanza en vez de devolver `error`).
- [ ] 2.5 Quitar imports de `supabase` que queden huérfanos en estos 3 archivos tras el reemplazo (verificar que no se use para otra tabla en el mismo archivo antes de borrar el import).
- [ ] 2.6 `VITE_DEMO_MODE=true`: abrir manualmente el panel de asistente pedagógico, el dashboard pedagógico y disparar el snapshot de guidance — confirmar que cargan sin error de red ni consola.

**Verification**: `grep -rn "from('planificaciones')" src/modules/planificacion/components/asistentePedagogicoPanel.js src/modules/pedagogico/views/dashboardPedagogicoView.js src/modules/guidance/context/dataSnapshot.js` no devuelve nada. `npm run test:run` verde.

## Phase 3: Migrar `planClaseApi.js` (PR #3 — mayor riesgo, tiene escritura)

- [ ] 3.1 Reescribir `obtenerPlanDeClase(claseId, periodoNombre)` (línea 37) para delegar en `obtenerPlanDeClaseActual` del adapter, preservando el contrato "devuelve `null` si no hay plan, no es un error".
- [ ] 3.2 Reescribir `guardarPlanDeClase(plan)` (línea 77) para delegar en `guardarPlanDeClaseSupabase`/adapter — **atención especial**: confirmar en 1.1 si esto es upsert condicional; si el adapter genérico (`actualizarPlanificacion`/`crearPlanificacion`) no replica esa condicional, resolverla en la nueva función del adapter, no en `planClaseApi.js`.
- [ ] 3.3 Reescribir `duplicarPlanParaPeriodo(planId, opts)` (línea 131) para delegar en `duplicarPlanificacionParaPeriodo` del adapter.
- [ ] 3.4 Quitar el import directo de `supabase` en `planClaseApi.js` si ya no queda ningún uso (las funciones `obtenerApoyoCurricular` y `listarPeriodos` — confirmar si tocan otras tablas; si sí, el import se queda, si no, se elimina).
- [ ] 3.5 Test de integración manual: en `PlanClasePanel.js` (único consumidor), crear un plan nuevo, guardarlo, duplicarlo a otro período — confirmar en Supabase real que el payload persistido es idéntico al que se producía antes del cambio (mismo set de columnas, mismos valores).
- [ ] 3.6 `VITE_DEMO_MODE=true`: repetir el mismo flujo (crear → guardar → duplicar) contra el mock y confirmar que persiste en `localStorage` igual que el resto del adapter.

**Verification**: `grep -n "from('planificaciones')" src/portal-maestros/api/planClaseApi.js` no devuelve nada. Flujo completo de `PlanClasePanel.js` probado en ambos modos. `npm run test:run` verde.

## Phase 4: Cierre

- [ ] 4.1 `grep -rn "from('planificaciones')" src --include="*.js" | grep -v planificacionSupabase.js` → debe devolver vacío. Si algo aparece, no es un false-positive: es un consumidor no detectado en el diagnóstico original y hay que decidir si entra en este change o se abre uno nuevo.
- [ ] 4.2 `npm run test:run` completo en verde.
- [ ] 4.3 `npm run policy:check` — confirmar que no sube el baseline (este change no crea tablas).
- [ ] 4.4 Actualizar `AGENTS.md` §2 si con este change el DataAdapter de `planificaciones` queda 100% cerrado (quitar o matizar la nota "trabajo en progreso" — pero solo para esta tabla, no para el patrón general que sigue abierto en otros dominios).
