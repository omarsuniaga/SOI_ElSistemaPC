# Design: Estandarización Módulo Asistencias

## Technical Approach
Refactorizar el módulo de Asistencias para centralizar la lógica de datos y normalización de estados. Se introducirá un servicio de datos (`asistenciaDataService.js`) para manejar las consultas complejas y agrupamientos, liberando a la vista (`asistenciasView.js`) de responsabilidades pesadas. El modelo `Asistencia` actuará como el normalizador bidireccional entre la UI y Supabase.

## Architecture Decisions

### Decision: Servicio de Datos para el Timeline
**Choice**: Crear `src/modules/asistencias/services/asistenciaDataService.js`.
**Rationale**: La lógica actual de agrupar por fecha y calcular conteos P/A/J vive en la API o en la Vista. Mover esto a un servicio permite que la API sea puramente CRUD y que la vista solo se encargue de pintar el DOM, facilitando el mantenimiento y permitiendo futuras optimizaciones como el cacheo en memoria.

### Decision: Mapeo de Estados Bidireccional
**Choice**: Implementar un getter `dbState` y un setter `uiState` en el modelo `Asistencia`.
**Rationale**: Permite mantener la compatibilidad con el código legacy mientras se migra a los nombres completos requeridos por la base de datos. El modelo garantiza que nunca se envíe un estado inválido (`P`, `A`, `J`) a Supabase.

## Data Flow
1. **Vista**: `asistenciasView` -> solicita timeline a `asistenciaDataService`.
2. **Servicio**: Consulta API -> recibe objetos planos -> genera instancias de `Asistencia` -> agrupa por fecha -> retorna estructura lista para renderizar.
3. **Registro (Bulk)**: UI captura estados -> crea array de modelos -> `asistenciasApi.registrarAsistenciaBulk(asistencias.map(a => a.toJSON()))`.
4. **Handoff**: Al iniciar toma de asistencia -> `consumeRutaTema()` -> si existe, inyecta tema en el estado local de la vista.

## File Changes

| File | Action | Description |
|------|--------|-------------|
| `src/modules/asistencias/models/asistencia.model.js` | Modify | Actualizar estados a 'presente', 'ausente', 'justificado'. Añadir normalizador legacy. |
| `src/modules/asistencias/services/asistenciaDataService.js` | Create | Nuevo servicio para procesar el timeline y reportes detallados. |
| `src/modules/asistencias/api/asistenciasApi.js` | Modify | Limpiar lógica de agrupamiento (movida al servicio) y asegurar normalización. |
| `src/modules/asistencias/views/asistenciasView.js` | Modify | Refactorización de UI: tablas compactas, banners informativos y delegación al servicio. |
| `src/modules/asistencias/__tests__/asistencia.model.test.js` | Create | Tests unitarios para el mapeo de estados. |

## Interfaces / Contracts

### Asistencia Model (Core)
```javascript
{
  id: "uuid",
  clase_id: "uuid",
  alumno_id: "uuid",
  sesion_clase_id: "uuid",
  fecha: "YYYY-MM-DD",
  estado: "presente" | "ausente" | "justificado",
  justificacion_texto: "string",
  observaciones: "string"
}
```

## Testing Strategy
| Layer | What to Test | Approach |
|-------|-------------|----------|
| Unit | `Asistencia.model` | Verificar que 'P' se convierte en 'presente' y viceversa. |
| Unit | `asistenciaDataService` | Probar la lógica de agrupamiento por fecha con datos mock. |
| Integration | Flow Registro Bulk | Verificar que el payload enviado a Supabase es atómico y correcto. |

## Migration / Rollout
Se implementará un "Soft Update": el código nuevo enviará nombres completos, pero la base de datos ya los soporta. No hay cambios de esquema, solo de datos en vuelo.

## Open Questions
- ¿Deseamos implementar el registro de "Llegada Tarde" en esta fase? (Postergado si no se solicita).
