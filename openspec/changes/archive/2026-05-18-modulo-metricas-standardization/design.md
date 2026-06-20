# Design: Estandarización Módulo Métricas

## Technical Approach
Refactorizar el módulo de Métricas transformándolo en un "Institutional Analytics Hub". Se consolidarán las 9 sub-vistas fragmentadas en un único punto de entrada (`dashboardMetricasView.js`) que actuará como orquestador. Se estandarizará la comunicación con las vistas SQL de Supabase mediante un servicio de normalización y se introducirán componentes visuales de alto nivel (`MetricCard`) para asegurar consistencia visual y responsividad.

## Architecture Decisions

### Decision: Orquestación mediante Pestañas en Memoria
**Choice**: Unificar las vistas en un solo archivo con gestión de estado local para las pestañas.
**Rationale**: Las métricas comparten muchos datos de contexto (período activo, clase seleccionada). Mantenerlas en una sola vista orquestada permite reciclar datos y evita recargas innecesarias del router, mejorando la fluidez percibida.

### Decision: Componente Stándar `MetricCard`
**Choice**: Crear un componente funcional `renderMetricCard(props)`.
**Rationale**: Actualmente cada vista pinta sus propios cuadros de resumen. Estandarizar esto asegura que los colores de los estados (Rojo/Verde/Gris) y las tipografías sean idénticos en todo el portal.

## Data Flow
1. **Init**: `renderPlanificacionView` (Dashboard) -> `metricsApi.getEstadisticasGlobales()`.
2. **Normalización**: API recibe resultados de `vw_*` -> mapea a objetos limpios -> retorna al dashboard.
3. **Pestañas**: Usuario cambia sección -> Dashboard renderiza sub-componente (Alertas, Riesgo, IA) sin nueva carga de red (si los datos están cacheados).
4. **IA Flow**: Datos de métricas -> `groqService.generateNarrative(data)` -> Renderiza reporte narrativo.

## File Changes

| File | Action | Description |
|------|--------|-------------|
| `src/modules/metricas/views/dashboardMetricasView.js` | Modify | Transformación en Orquestador Central (Hub). |
| `src/modules/metricas/api/metricsApi.js` | Modify | Normalización atómica y manejo de errores estandarizado. |
| `src/modules/metricas/components/MetricCard.js` | Create | Nuevo componente para KPIs. |
| `src/modules/metricas/views/alertasView.js` | Delete | Integrada como sub-sección del Hub. |
| `src/modules/metricas/views/destacadosView.js` | Delete | Integrada como sub-sección del Hub. |
| `src/modules/metricas/views/riesgoAbandonoView.js` | Delete | Integrada como sub-sección del Hub. |
| `src/modules/metricas/views/iaAnalisisView.js` | Delete | Integrada como sub-sección del Hub. |

## Interfaces / Contracts

### Metric Props
```javascript
{
  label: "string",
  value: "number|string",
  color: "success|danger|warning|primary",
  icon: "bi-*",
  trend: { value: "+5%", direction: "up" } (optional)
}
```

## Testing Strategy
| Layer | What to Test | Approach |
|-------|-------------|----------|
| Unit | `metricsApi` | Verificar que el mapeo de `vw_resumen_alumno` es correcto. |
| Unit | `MetricCard` | Verificar que renderiza los colores correctos según el tipo de alerta. |
| Integration | Dashboard Flow | Simular navegación entre pestañas y verificar que el contenido se actualiza. |

## Migration / Rollout
No requiere migración de datos. Se realizará una consolidación de archivos eliminando los redundantes una vez verificado el Hub.

## Open Questions
- ¿Deseamos persistir la última pestaña visitada en `localStorage`? (Elegido: SÍ).
