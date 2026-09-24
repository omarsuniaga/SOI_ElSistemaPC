# Proposal: Planificación DataAdapter — Migración de consumidores restantes

## Problem Statement

El change archivado `2026-08-31-planificacion-dataadapter` migró 5 consumidores
puntuales (`usePlanificacion.js`, `planificacionView.js`,
`aprobacionPlanificacionesModal.js`, `asistenciaView.js`, `index.js`) al patrón
`planificacionAdapter.js`, y quedó correctamente cerrado dentro de ese scope
(21/21 tareas). Pero fuera de ese scope declarado, **9 llamadas directas a
`supabase.from('planificaciones')` siguen vivas en 4 archivos** que nunca
pasaron por el adapter. Violan la regla de AGENTS.md §2 ("No se permiten
llamadas directas a Supabase desde la UI") y rompen el modo Demo para quien
navegue esas pantallas: en `VITE_DEMO_MODE=true` estas llamadas fallan o
devuelven vacío en silencio, porque no hay mock detrás.

El caso más grave es `planClaseApi.js`: no es solo una llamada suelta, es un
**segundo API completo** para la misma tabla `planificaciones`, con su propia
superficie de 5 funciones exportadas y un consumidor propio
(`PlanClasePanel.js`), totalmente invisible para el adapter existente.

## Scope

**In — 4 archivos, 9 call sites:**

| Archivo | Líneas | Uso de `planificaciones` |
|---|---|---|
| `src/portal-maestros/api/planClaseApi.js` | 41, 101, 114, 136, 147 (5 calls) | API paralelo completo: `obtenerPlanDeClase`, `guardarPlanDeClase`, `duplicarPlanParaPeriodo` — lee y escribe la tabla directamente |
| `src/modules/planificacion/components/asistentePedagogicoPanel.js` | 234, 298 (2 calls) | Lecturas de solo-lectura: últimos temas del maestro, planes ejecutados últimos 56 días (para sugerencias IA) |
| `src/modules/pedagogico/views/dashboardPedagogicoView.js` | 44 (1 call) | Lectura agregada para KPI de planes creados en 7 días, parte de un `Promise.all` con otras 3 tablas |
| `src/modules/guidance/context/dataSnapshot.js` | 106 (1 call, función `getPlanningStatus`) | Lectura de estado de planificación para snapshot de contexto de Hermes/guidance |

**Out (no tocar en este change):**
- El propio `planificacionAdapter.js` / `planificacionSupabase.js` / `planificacionMock.js` — ya están correctos, solo se **reutilizan**.
- Cualquier lógica de negocio nueva. Este change es un re-cableado, no un rediseño.
- Las otras 3 tablas que `dashboardPedagogicoView.js` consulta en el mismo `Promise.all` (`alumnos`, `clases`, `asistencias`) — fuera de scope, otro dominio.
- `planClaseApi.js` funciones que no tocan `planificaciones`: `lineasAArreglo`, `arregloALineas`, `obtenerApoyoCurricular`, `listarPeriodos` (helpers/otras tablas).

## Approach

El adapter (`planificacionAdapter.js`) ya expone 9 funciones CRUD, pero
**ninguna cubre las consultas específicas** que estos 4 archivos necesitan
(filtro por `maestro_id` + `estado='ejecutado'` + rango de fechas, o
`periodo_nombre`, etc.). No forzar estos call sites a las 9 funciones
genéricas existentes — eso degradaría los filtros. En su lugar:

1. **Extender el adapter** con las funciones de lectura/escritura que estos
   4 archivos necesitan, cada una con su contraparte en `planificacionSupabase.js`
   y `planificacionMock.js` (mismo patrón `config.isDemoMode` ya establecido).
2. **Reemplazar las llamadas directas** en los 4 archivos por las nuevas
   funciones del adapter, sin cambiar su comportamiento observable.
3. **`planClaseApi.js`** es el caso especial: sus 3 funciones que tocan
   `planificaciones` (`obtenerPlanDeClase`, `guardarPlanDeClase`,
   `duplicarPlanParaPeriodo`) deben reescribirse para delegar en el adapter en
   vez de importar `supabase` directamente. El archivo puede seguir existiendo
   como capa de conveniencia del portal-maestros (nombres de función
   específicos del dominio "plan de clase"), pero por debajo debe llamar al
   adapter, no a Supabase.

## New Adapter Functions (contrato propuesto)

| Función | Reemplaza en | Firma |
|---|---|---|
| `obtenerPlanificacionesPorMaestroYEstado(maestroId, estado, { limit, ordenarPor })` | `asistentePedagogicoPanel.js` (2 sitios), `planClaseApi.js` | `Planificacion[]` |
| `obtenerPlanDeClaseActual(claseId, periodoNombre)` | `planClaseApi.js:obtenerPlanDeClase` | `Planificacion \| null` |
| `guardarPlanDeClase(plan)` | `planClaseApi.js:guardarPlanDeClase` | `Planificacion` (upsert) |
| `duplicarPlanificacionParaPeriodo(planId, { periodoNombre, fechaInicio, fechaFin })` | `planClaseApi.js:duplicarPlanParaPeriodo` | `Planificacion` |
| `contarPlanificacionesDesde(fechaISO)` | `dashboardPedagogicoView.js` | `{ id, estado }[]` (o count si se puede resolver con `head: true` en mock también) |
| `obtenerEstadoPlanificacionReciente(limit=20)` | `dataSnapshot.js:getPlanningStatus` | `Planificacion[]` (subset de campos: `id, estado, fecha_inicio, fecha_fin`) |

## Mock Strategy

Reutilizar `src/assets/data/mocks/planificaciones.json` (ya existe con
`estado`/`instrumento`/`maestro_id` variados). Si los escenarios de prueba de
estos 4 archivos necesitan filas con `estado='ejecutado'` y fechas dentro de
los últimos 7/56 días, **verificar primero** si el seed actual las cubre;
si no, añadir 2-3 filas nuevas al mismo JSON (no crear un segundo seed).

## Release Boundaries (sugerido, seguir convención de PRs chained del repo)

| PR | Contenido | Riesgo |
|----|-----------|--------|
| #1 | Nuevas funciones en adapter + supabase + mock (sin tocar consumidores) | Bajo — aditivo, nada roto si no se usa aún |
| #2 | Migrar `asistentePedagogicoPanel.js` + `dashboardPedagogicoView.js` + `dataSnapshot.js` (lecturas puras, bajo riesgo) | Bajo |
| #3 | Migrar `planClaseApi.js` (lectura + escritura + duplicación) — mayor superficie, probar el flujo completo de guardar/duplicar plan | Medio — es el único con escritura fuera del adapter |

Cada PR revertible independientemente. Sin cambios de esquema/DB.

## Risk Treatment

| Riesgo | Probabilidad | Mitigación |
|---|---|---|
| `planClaseApi.js` tiene lógica de merge/upsert propia que el adapter no replica exactamente | Media | Leer `guardarPlanDeClase` completo antes de migrar; si el upsert difiere del `actualizarPlanificacion` del adapter, extender el adapter en vez de forzar el encaje |
| Los filtros de `asistentePedagogicoPanel.js` (`maestro_id` + `estado` + `order/limit`) no calzan 1:1 con funciones existentes | Media | Cubierto por la nueva función `obtenerPlanificacionesPorMaestroYEstado`, diseñada explícitamente para ese caso |
| Modo Demo sin filas suficientes para los rangos de fecha usados (7 días / 56 días) | Media | Verificar seed antes de PR #2; el criterio de éxito exige demo mode funcional para estas 4 pantallas |
| Regresión silenciosa en KPI del dashboard pedagógico (cuenta mal) | Baja | Test que compara el resultado de la función nueva contra la query directa original antes de eliminarla |

## Success

- [ ] Cero ocurrencias de `supabase.from('planificaciones')` fuera de
      `planificacionSupabase.js` (verificable con
      `grep -rn "from('planificaciones')" src --include="*.js" | grep -v planificacionSupabase.js`)
- [ ] `VITE_DEMO_MODE=true`: las 4 pantallas/paneles afectados
      (asistente pedagógico, dashboard pedagógico, guidance/Hermes snapshot,
      plan de clase del maestro) cargan sin error y muestran datos del mock
- [ ] `guardarPlanDeClase` y `duplicarPlanParaPeriodo` producen el mismo
      resultado observable en Supabase real que antes de la migración
      (comparar payload enviado)
- [ ] `npm run test:run` en verde
- [ ] `npm run policy:check` no empeora el baseline (este change no toca
      tablas nuevas, así que no debería moverlo)
