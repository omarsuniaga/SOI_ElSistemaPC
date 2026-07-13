# Exploration: Curriculo Tres Planos — Capa de Servicios

Este documento detalla el análisis de la capa de servicios de datos de planificación (`weeklyPlanSupabase.js` y `routeSupabase.js`) y el plan de migración para erradicar las tablas fantasma `acm_*` en producción.

---

## 1. ESTADO ACTUAL

### 1.1 El problema de las tablas fantasmas (`acm_*`)
El portal del maestro y el ACM leen datos históricos de planificación a partir de un conjunto de tablas denominadas `acm_weekly_plans`, `acm_active_routes` y `acm_teacher_week_adjustments`. Estas tablas **no existen** en la base de datos de producción (`SOI_DDBB_EL_SISTEMAPC`), lo que provoca que las consultas fallen en silencio (atrapadas por `isMissingSchemaTableError`) y devuelvan colecciones vacías en el portal del maestro real.

### 1.2 La solución del DataAdapter
Ya existe una columna vertebral de datos en producción: `routes -> route_versions -> levels -> nodes -> objetivos -> indicators`. 
*   `routeSupabase.js` ya fue refactorizado exitosamente para consultar esta jerarquía real.
*   En `weeklyPlanSupabase.js`, la función `obtenerGuiaHeredadaPorClase(claseId)` ya consulta la ruta publicada de la clase en `route_versions`.
*   Sin embargo, el resto de funciones del servicio (`obtenerRutaActivaPorGrupo`, `obtenerPlanSemanalPorId`, `obtenerProgresoGrupo`, etc.) siguen intentando leer de las tablas fantasma `acm_*` y `student_indicator_progress`.

---

## 2. ÁREAS AFECTADAS

*   **[weeklyPlanSupabase.js](file:///C:/Users/omare/OneDrive/Documentos/SOI_Sistema_Operativo_Institucional/09_SOI_WEB_PORTAL/sistema-academico-pwa/src/modules/planificacion/api/weeklyPlanSupabase.js)**: Reemplazar el acceso a tablas `acm_*` y `student_indicator_progress` por derivaciones dinámicas desde `route_versions` e `indicator_attempts` (la tabla de progreso real).
*   **[weeklyPlanMock.js](file:///C:/Users/omare/OneDrive/Documentos/SOI_Sistema_Operativo_Institucional/09_SOI_WEB_PORTAL/sistema-academico-pwa/src/modules/planificacion/api/weeklyPlanMock.js)**: Asegurar que el mock en modo Demo retorne estructuras equivalentes para mantener la paridad del DataAdapter.

---

## 3. ENFOQUES DE MIGRACIÓN

### Enfoque A: Re-escribir los Componentes del Frontend (Rechazado)
*   **Descripción**: Modificar vistas como `PlanificationCard.js` y `mapaPedagogicoPanel.js` para llamar directamente a nuevas APIs basadas en `route_versions`.
*   **Pros**: Arquitectura de UI más directa y limpia a largo plazo.
*   **Cons**: Altísimo riesgo de regresión en la SPA, impacto en múltiples archivos complejos de UI, viola el límite de 400 líneas por cambio de forma garantizada.
*   **Complejidad**: Alta.

### Enfoque B: Adaptar la Capa de Servicios mediante Adapter/Facade (Recomendado)
*   **Descripción**: Mantener las firmas de las funciones existentes en `weeklyPlanSupabase.js` pero reescribir su lógica interna.
    *   `obtenerRutaActivaPorGrupo(groupId)`: Busca la última versión de ruta en estado `'published'` para esa clase en `route_versions`. Retorna un objeto simulado con forma de `activeRoute` compatible.
    *   `obtenerPlanSemanalPorId(planId)` y `obtenerPlanSemanalPorNivel(levelId)`: Resuelven la versión de ruta y aplanan su jerarquía al formato esperado de plan semanal.
    *   `obtenerProgresoGrupo(groupId)`: Consulta la tabla de progreso real `indicator_attempts` filtrando por `covered_by_clase_id = groupId`.
    *   `registrarProgresoIndicador(...)`: Resuelve el maestro autenticado (`created_by`) e inserta/upserta en `indicator_attempts`.
*   **Pros**: Cero impacto en el código visual de la SPA, cambios estrictamente encapsulados en el servicio de datos, alineado con el patrón DataAdapter del proyecto.
*   **Cons**: Agrega una pequeña capa de adaptación en JS (mantenida en el servicio).
*   **Complejidad**: Baja-Media.

---

## 4. RECOMENDACIÓN

**Implementar el Enfoque B (DataAdapter / Facade)**. Esto nos permite estabilizar la planificación en producción de forma inmediata, sin arriesgar la UI de asistencia y planificación que ya funciona en modo Demo, manteniendo un volumen de cambios controlado y seguro.

---

## 5. RIESGOS Y MITIGACIÓN

*   **Riesgo de `created_by` en Calificación**: La tabla `indicator_attempts` exige un `created_by` (UUID de maestro) obligatorio, pero el método de UI no lo provee.
    *   *Mitigación*: Implementar un helper interno `_obtenerMaestroIdActual()` que consulte `supabase.auth.getUser()` y la tabla `maestros` para resolver el UUID del docente al guardar la calificación.
*   **Riesgo de Conflicto en Upsert**: La clave única de `indicator_attempts` puede colisionar si no se gestiona bien.
    *   *Mitigación*: Utilizar el constraint `onConflict: 'session_id,indicator_id,student_id'` tal como lo hace `evaluationService.js` en producción.

---

## 6. READY FOR PROPOSAL

**SÍ**. Estamos listos para avanzar a la fase de **Propuesta formal (`/sdd-propose`)** y diseño detallado de estos dos servicios en el bloque de cambios.
