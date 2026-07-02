# Auditoría PLAN ↔ ACM — Hardening y deuda legacy

Fecha: 2026-06-29

## 1. Qué quedó blindado

- `acm_active_routes` ahora se trata como asignación única por clase.
- `crearRutaActiva(...)` desactiva/archiva cualquier ruta activa previa de la misma clase antes de insertar una nueva.
- Se agregó migración SQL con índice único parcial para impedir dos rutas `active` sobre el mismo `group_id`.
- `AsistenciasView` ya puede abrir el panel de progreso del alumno aunque no exista `route_version_id`, siempre que la clase tenga contexto ACM.

## 2. Qué se auditó y sigue legacy

### Dependencias directas de `route_version_id`

- `src/portal-maestros/views/gamificacionView.js`
- `src/modules/academic-routes/services/academicService.js`
- `src/modules/planning/services/planningService.js`
- `src/portal-maestros/services/rutaService.js`
- `src/portal-maestros/services/maestroDataService.js`
- `src/portal-maestros/services/classEventService.js`
- `src/portal-maestros/components/studentProgressPanel.js` (solo como fallback legacy)

### Flujos todavía no unificados con ACM

- Cierre de sesión y motor de logros en `academicService.processSessionClosure(...)`.
- Gamificación basada en `academic_plans`, `student_node_progress` y snapshots legacy.
- Bitácora y planificación antigua todavía consumen tablas previas (`indicator_sessions`, `indicator_session_students`, etc.).

## 3. Riesgos reales detectados

1. **Duplicidad lógica de ruta activa por clase**  
   Sin constraint de base de datos, cualquier caller distinto de `updateClassRouteAssignment(...)` podía insertar otra ruta activa.

2. **Gate UI legacy en asistencia**  
   El click sobre alumno dependía de `rutaId`, aunque el panel ya soporta ACM por `claseId`.

3. **Cierre de sesión no canónico**  
   El guardado principal de progreso ya puede vivir en `student_indicator_progress`, pero el recálculo post-cierre sigue entrando por servicios legacy.

## 4. Plan ejecutable de unificación del progreso

### Fase 1 — Canonical write path

- Declarar `student_indicator_progress` como escritura oficial para avance individual.
- Mantener `studentProgressPanel` y `PlanificationCard` leyendo primero desde ACM.
- Crear adaptador de compatibilidad para consumers que todavía esperan snapshots o semáforos legacy.

### Fase 2 — Session closure bridge

- Extraer de `academicService.processSessionClosure(...)` la parte de negocio reusable.
- Crear una versión ACM-aware que:
  - lea la clase/ruta activa desde `acm_active_routes`,
  - resuelva indicadores desde `acm_weekly_plan_items`,
  - derive logros desde `student_indicator_progress`.

### Fase 3 — Migración de consumidores

- Migrar `gamificacionView.js`.
- Migrar `planningService.js` y bitácora.
- Reemplazar lecturas de `route_version_id` por `group_id -> acm_active_routes -> weekly_plan`.

### Fase 4 — Retiro controlado del legacy

- Dejar `studentProgressPanel` sin fallback legacy.
- Eliminar resolución de `route_version_id` en asistencia cuando ya no existan dependencias activas.
- Marcar `academic_plans` / `indicator_sessions` como compatibilidad temporal o deprecados.

## 5. Criterio de terminado para esta línea

Se puede considerar “sincronización endurecida” cuando:

- no existan dobles rutas activas por clase,
- asistencia + planificación + progreso operen por ACM,
- y el cierre de sesión/gamificación deje de depender del grafo legacy.
