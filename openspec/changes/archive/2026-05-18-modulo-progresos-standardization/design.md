# Design: Estandarización Módulo Progresos

## Technical Approach
Refactorizar el módulo de Progresos para centralizar la inteligencia académica en un servicio de negocio (`progresoDataService.js`) y normalizar la comunicación con la base de datos mediante el modelo `Progreso`. Se eliminará la lógica de cálculo dispersa en la vista y se estandarizará el diseño de los boletines institucionales.

## Architecture Decisions

### Decision: Servicio de Negocio para Lógica Académica
**Choice**: Crear `src/modules/progresos/services/progresoDataService.js`.
**Rationale**: El cálculo de promedios y la detección de riesgos es lógica de negocio, no de UI. Centralizarlo permite que sea testeable unitariamente y garantiza que el mismo promedio se muestre en la vista, en el reporte y en el boletín PDF.

### Decision: Normalización de Campos en el Modelo
**Choice**: Refactorizar `Progreso.model.js` para usar `tipo_evaluacion` (DB style) y normalizar el setter de `calificacion`.
**Rationale**: Elimina la fricción entre el código de frontend y el esquema de Supabase, asegurando que el motor de validación siempre opere sobre datos limpios.

## Data Flow
1. **Carga**: `renderProgresosView` -> solicita datos enriquecidos a `progresoDataService`.
2. **Servicio**: Consulta `progresosApi` -> genera instancias -> calcula promedios -> determina estado de riesgo -> retorna estructura para UI.
3. **Guardado**: Form Modal -> `new Progreso(data).validate()` -> `progresosApi.actualizar/crear(model.toJSON())`.
4. **Boletín**: `progresoDataService.prepareBulletinData(alumnoId)` -> `progresosApi.exportarBoletinPDF(data)`.

## File Changes

| File | Action | Description |
|------|--------|-------------|
| `src/modules/progresos/models/progreso.model.js` | Modify | Sincronización de campos y validación estricta 0-5. |
| `src/modules/progresos/services/progresoDataService.js` | Create | Nuevo servicio para cálculos, riesgos y preparación de boletines. |
| `src/modules/progresos/api/progresosApi.js` | Modify | Simplificación CRUD y estandarización de retornos. |
| `src/modules/progresos/views/progresosView.js` | Modify | Refactorización visual ("Core Refinement") y delegación al servicio. |
| `src/modules/progresos/__tests__/progreso.model.test.js` | Create | Tests unitarios de validación y normalización. |

## Interfaces / Contracts

### Progreso Object (Normalized)
```javascript
{
  id: "uuid",
  alumno_id: "uuid",
  clase_id: "uuid",
  tipo_evaluacion: "parcial" | "final" | "continua",
  calificacion: number (0.0 - 5.0),
  estado: "en_progreso" | "completado" | "pendiente",
  observaciones: "string"
}
```

## Testing Strategy
| Layer | What to Test | Approach |
|-------|-------------|----------|
| Unit | `Progreso.model` | Validar rangos de nota y campos obligatorios. |
| Unit | `progresoDataService` | Verificar promedios con diferentes juegos de datos (incluyendo ceros y nulls). |
| Integration | Flow Boletín | Simular generación de PDF y verificar estructura del payload. |

## Migration / Rollout
No requiere migración de datos. Es una refactorización de lógica de aplicación.

## Open Questions
- ¿Deseamos configurar diferentes pesos por tipo de evaluación (ej. Final vale 40%)? (Postergado si no se solicita).
