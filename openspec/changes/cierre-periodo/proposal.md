# Proposal: Cierre de Período Académico (Aislamiento de Analíticas)

## Intent
Implementar un sistema de aislamiento por periodos en el portal académico (`sistema-academico-pwa`). El objetivo es evitar el borrado físico de la base de datos de producción al finalizar el ciclo escolar, archivando el historial académico bajo un identificador único de periodo y asegurando que las analíticas y tableros operacionales del nuevo año se inicialicen en blanco sin contaminar los datos históricos.

## Scope

### In Scope
- Creación de la tabla `periodos` en Supabase con estados `'active'` (activo) y `'closed'` (cerrado).
- Vinculación relacional mediante `periodo_id` en las tablas operacionales clave: `clases`, `indicator_attempts` (calificaciones) y `asistencias`.
- Implementación de un Endpoint en la API y DataAdapter para alternar el periodo activo global de la institución.
- Refactorización de las consultas operacionales en el portal de maestros y tableros de analítica para filtrar por defecto por el `periodo_id` del periodo activo.
- Creación de una interfaz administrativa para que la Dirección Ejecutiva ejecute el proceso de cierre y cree el nuevo año escolar.
- Regla de negocio de bloqueo: impedir mutaciones de asistencia o calificaciones pertenecientes a periodos cerrados.

### Out of Scope
- Gestión de facturación o cobros anuales de alumnos (mantenido en el módulo de Caja, fuera de este ciclo de notas/asistencias).
- Reinscripción automática masiva de alumnos (se maneja de forma manual o mediante el resolvedor de postulantes).

## Capabilities

### New Capabilities
- `academic-period-archiving`: Capacidad de cerrar periodos lectivos y aislar analíticas.
- `historical-record-preservation`: Acceso a promedios e inasistencias de periodos anteriores en modo lectura.

## Approach
Introducir el concepto de "Período Escolar Activo" en el cliente PWA. Cuando la dirección crea un nuevo periodo, este se marca como el único activo en la base de datos. Todas las llamadas del DataAdapter a `clases`, `indicator_attempts` y `asistencias` se reescriben para inyectar automáticamente el filtro del periodo activo, aislando los datos visuales de inmediato. Se implementará un trigger/restricción RLS en Supabase para bloquear la escritura en registros asociados a periodos cerrados.

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `src/modules/planificacion/api/` | Modified | Adaptadores y persistencia filtrados por periodo activo. |
| `src/modules/clases/api/` | Modified | Consulta de clases filtrada por periodo activo. |
| `src/portal-maestros/services/` | Modified | Servicios de evaluación y asistencias vinculados al periodo. |
| `supabase/migrations/` | New | Nueva tabla `periodos` y migración de llaves foráneas. |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Pérdida de relación en datos huérfanos | Medium | La migración asignará un `periodo_id` por defecto (Periodo Inicial) a los registros huérfanos existentes en producción. |
| Bloqueo accidental de maestros | Low | La UI advertirá claramente antes de realizar el corte y bloquear los periodos. |

## Rollback Plan
Revertir la migración de base de datos y restaurar la lógica del DataAdapter que omitía el filtro de periodo activo.

## Success Criteria
- [ ] Base de datos con la tabla `periodos` y las FKs enlazadas.
- [ ] La creación de un periodo nuevo inicializa todas las vistas de maestros y analíticas en blanco.
- [ ] Los registros del periodo cerrado quedan bloqueados ante intentos de inserción o edición.
- [ ] Los tests de Vitest validan el cambio de periodo activo.
