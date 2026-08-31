# Delta for Planificación y Progreso (Servicios)

## ADDED Requirements

### Requirement: Lectura curricular desde route_versions
El sistema MUST obtener la guía y planeación semanal de clases derivándola dinámicamente de `route_versions` en estado `'published'`, eliminando la dependencia de tablas `acm_*` inexistentes en producción.

#### Scenario: Guía institucional obtenida con éxito
- GIVEN una clase con una versión de ruta con `status = 'published'` en la base de datos
- WHEN se solicita la guía semanal de la clase (`obtenerRutaActivaPorGrupo` y `obtenerPlanSemanalPorId`)
- THEN el sistema devuelve el plan aplanado mapeando niveles, nodos, objetivos e indicadores de esa versión
- AND no se realiza ninguna llamada a tablas `acm_*`

#### Scenario: Clase sin guía asignada
- GIVEN una clase sin ninguna versión de ruta en estado `'published'`
- WHEN se solicita la guía semanal de la clase
- THEN el sistema devuelve `null` de forma segura (sin errores de base de datos)

---

### Requirement: Persistencia del progreso en indicator_attempts
El sistema MUST registrar y consultar las calificaciones e hitos de avance directamente sobre la tabla canónica `indicator_attempts`, mapeando la autoría del docente de forma dinámica.

#### Scenario: Registro de calificación con autoría
- GIVEN un maestro autenticado en el portal
- WHEN califica un indicador para un alumno (`registrarProgresoIndicador`)
- THEN el sistema resuelve el ID del maestro desde la sesión
- AND realiza un upsert en `indicator_attempts` con `student_id`, `indicator_id`, `created_by` (maestro) y `covered_by_clase_id` (clase)

#### Scenario: Consulta de progreso del grupo
- GIVEN una clase que contiene alumnos calificados
- WHEN se solicita el progreso acumulado (`obtenerProgresoGrupo`)
- THEN el sistema consulta `indicator_attempts` filtrando por `covered_by_clase_id` igual al ID de la clase
- AND retorna el mapa de estado por alumno e indicador
