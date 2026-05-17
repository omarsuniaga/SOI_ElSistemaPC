# Proposal: Estandarización Módulo Métricas (Fase 9)

## Intent
Finalizar y unificar el Módulo de Métricas y Estadísticas. El objetivo es consolidar el ecosistema de visualización (Dashboard, Alertas, Riesgo, IA) en una experiencia coherente y responsiva, asegurando que la información estratégica sea accionable para los maestros y administradores, siguiendo los estándares institucionales de arquitectura.

## Scope

### In Scope
- Consolidar las 9 sub-vistas de métricas en un Dashboard único e inteligente con navegación interna fluida.
- Refactorizar `metricsApi.js` para estandarizar el manejo de errores y normalización de datos provenientes de vistas SQL.
- Implementar el componente `MetricCard` institucional para estandarizar la visualización de KPI (Key Performance Indicators).
- Asegurar que todas las vistas de métricas utilicen el patrón de "Refinamiento Core" (tablas compactas, estados visuales).
- Optimizar el generador de reportes de IA para que sea 100% responsivo y consistente con el diseño del portal.
- Implementar suite de tests para verificar la correcta integración de datos entre las vistas SQL y el UI.

### Out of Scope
- Rediseño de las vistas SQL de base de datos (se asumen securizadas y correctas).
- Integración con herramientas de Business Intelligence externas (ej. PowerBI).

## Capabilities

### New Capabilities
- `institutional-analytics-hub`: Centro de comando unificado para el seguimiento del rendimiento académico, asistencia y alertas de riesgo.

### Modified Capabilities
- None

## Approach
Transformar el módulo de métricas en un "Hub" centralizado. Utilizar el patrón de componentes compartidos para asegurar consistencia visual. La API actuará como un puente hacia las vistas estadísticas securizadas (`vw_*`), normalizando los resultados para un renderizado inmediato. Se mantendrá el enfoque de "Mobile First" dada la importancia del acceso rápido desde dispositivos táctiles.

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `src/modules/metricas/views/` | Modified | Consolidación masiva de 9 archivos en una arquitectura modular. |
| `src/modules/metricas/api/` | Modified | Limpieza de redundancias y estandarización de retornos. |
| `src/modules/metricas/components/` | New | Creación de componentes visuales estandarizados (KpiCard, ChartPlaceholder). |
| `src/modules/metricas/__tests__/` | New | Suite de pruebas de integración de datos. |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Sobrecarga de información (Cognitive Load) | High | Usar jerarquía visual clara y dashboards por pestañas/roles. |
| Performance en dispositivos móviles | Medium | Implementar carga perezosa (Lazy Load) de sub-componentes pesados. |

## Rollback Plan
Revertir mediante Git. Los archivos eliminados se restauran del histórico. No hay impacto en datos.

## Dependencies
- `rls-permisos-maestros`: Ya completado (asegura que el `security_invoker` funcione en las vistas).
- `modulo-progresos-standardization`: Ya completado (provee los datos fuente de calificaciones).

## Success Criteria
- [ ] Dashboard unificado funcionando con 4 secciones principales (Resumen, Alertas, Riesgo, IA).
- [ ] Todas las tablas de métricas usando el estilo `table-compact` responsivo.
- [ ] Carga fluida (< 1s) de los KPI principales del período activo.
- [ ] Generador de reportes IA operativo y estéticamente alineado.
