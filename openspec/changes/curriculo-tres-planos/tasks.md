# Tasks: Curriculo Tres Planos (Capa de Servicios)

## Phase 1: Foundation (Database Schema — Completada)

- [x] 1.1 Crear tabla `objetivos`, índices y políticas RLS asociadas.
- [x] 1.2 Migrar datos de `nodes.objective` a la nueva tabla `objetivos` y remapear indicadores.
- [x] 1.3 Extender enum `route_status` con estados `propuesta` y `devuelta` y agregar columnas a `route_versions`.

---

## Phase 2: Core Implementation (Refactor de Servicios — Pendiente)

- [x] 2.1 Refactorizar `src/modules/planificacion/api/weeklyPlanSupabase.js`:
  - `obtenerRutaActivaPorGrupo(groupId)`: Consultar la última versión de ruta `'published'` en `route_versions`.
  - `obtenerPlanSemanalPorId(planId)` y `obtenerPlanSemanalPorNivel(levelId)`: Mapear la jerarquía curricular de `route_versions` al formato esperado de plan semanal.
- [x] 2.2 Redirigir el progreso curricular en `weeklyPlanSupabase.js`:
  - `registrarProgresoIndicador(...)`: Hacer upsert en `indicator_attempts` usando `onConflict: 'session_id,indicator_id,student_id'`.
  - `obtenerProgresoGrupo(groupId)`: Leer de `indicator_attempts` filtrando por `covered_by_clase_id = groupId`.
- [x] 2.3 Implementar helper `_obtenerMaestroIdActual()` en `weeklyPlanSupabase.js` usando la sesión de `supabase.auth.getUser()`.
- [x] 2.4 Refactorizar `src/modules/planificacion/api/weeklyPlanMock.js`:
  - Modificar los mocks de datos para replicar de forma idéntica las nuevas firmas y el comportamiento de las consultas.

---

## Phase 3: Verification (Pruebas Unitarias — Pendiente)

- [x] 3.1 RED: Escribir pruebas en `src/modules/planificacion/__tests__/weeklyPlan.adapter.test.js` para asegurar que las nuevas firmas de fachada funcionen en ambos modos (Supabase y Demo).
- [x] 3.2 GREEN: Ejecutar la suite de pruebas unitarias (`npm run test:run`) y certificar el 100% de éxito en verde.
