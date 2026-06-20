# Design: Estandarización Módulo Planificación

## Technical Approach
Unificar la infraestructura del módulo de Planificación bajo el patrón institucional (API -> Model -> View). Se refactorizará la API para centralizar las consultas relacionales y asegurar que los retornos sean instancias del modelo `Planificacion`. La interfaz de usuario se consolidará para reducir la duplicidad de código entre vistas de maestros y administradores, utilizando el patrón de "Refinamiento Core".

## Architecture Decisions

### Decision: Modelo Unificado para Maestro y Admin
**Choice**: Usar la clase `Planificacion` con lógica de permisos basada en el estado.
**Rationale**: Al tener un solo modelo que conozca sus estados (`planificado`, `ejecutado`, `revisado`), podemos bloquear la edición dinámicamente en cualquier vista (Maestro o Admin) sin duplicar la lógica de negocio.

### Decision: Integración de Editor DSL
**Choice**: Componente `DSLEditor` inyectado en el modal de planificación.
**Rationale**: El editor DSL ya existe en otros módulos. Su integración aquí permite que los planes mantengan la riqueza semántica necesaria para la toma de asistencia automática en el futuro.

## Data Flow
1. **Carga**: `renderPlanificacionView` -> `obtenerPlanificacionesConDetalles()` -> Genera instancias enriquecidas -> `state.planes`.
2. **Edición**: Clic en Fila -> Abre `AppModal` con `DSLEditor` -> `new Planificacion(data).validate()`.
3. **Persistencia**: `planificacionApi.actualizarPlanificacion(id, model.toJSON())`.
4. **Aprobación (Admin)**: Selección masiva -> `planificacionApi.marcarRevisadasMasivo(ids)`.

## File Changes

| File | Action | Description |
|------|--------|-------------|
| `src/modules/planificacion/models/planificacion.model.js` | Modify | Refinar reglas de validación y añadir soporte para estados. |
| `src/modules/planificacion/api/planificacionApi.js` | Modify | Estandarizar retornos y simplificar lógica de actualización. |
| `src/modules/planificacion/views/planificacionView.js` | Modify | Consolidación masiva: transformar en la vista principal única y responsiva. |
| `src/modules/planificacion/views/planificacionesMaestrosView.js` | Delete | Fusionada con la vista principal. |
| `src/modules/planificacion/views/plantillasAdminView.js` | Delete | Fusionada con la vista principal como pestaña o filtro. |

## Interfaces / Contracts

### Planificacion Model (Core)
```javascript
{
  id: "uuid",
  clase_id: "uuid",
  maestro_id: "uuid",
  tema: "string (3-200)",
  objetivos: "string",
  contenido: "string",
  estado: "planificado" | "ejecutado" | "revisado",
  recursos: "text[]",
  notas_dsl: "string"
}
```

## Testing Strategy
| Layer | What to Test | Approach |
|-------|-------------|----------|
| Unit | `Planificacion.model` | Validar límites de caracteres y transiciones de estado permitidas. |
| Unit | `planificacionApi` | Verificar que el aplanamiento de datos relacionales (maestro/clase) es correcto. |
| Integration | Flujo de Aprobación | Simular cambio masivo de estado y verificar persistencia en Supabase (Mock). |

## Migration / Rollout
No requiere migración de datos. Se realizará una "limpieza de vistas" eliminando los archivos redundantes una vez que la vista principal sea capaz de manejar todos los roles.

## Open Questions
- ¿Deseamos implementar un historial de revisiones (quién aprobó qué)? (Sugerencia para Phase 2).
