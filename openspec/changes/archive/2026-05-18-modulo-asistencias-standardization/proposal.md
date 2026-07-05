# Proposal: Estandarización Módulo Asistencias (Fase 6)

## Intent
Unificar y estandarizar el Módulo de Asistencias Académicas siguiendo el patrón institucional (API -> Model -> View). Se corregirán las discrepancias entre el modelo local y la base de datos (estados P/A/J vs presente/ausente/justificado) y se reducirá la complejidad de la vista principal mediante la extracción de componentes y servicios de reporte.

## Scope

### In Scope
- Sincronizar el modelo `Asistencia.js` con los estados oficiales de la base de datos (`presente`, `ausente`, `justificado`).
- Extraer la lógica de agregación de datos para el timeline a un servicio dedicado: `src/modules/asistencias/services/asistenciaDataService.js`.
- Refactorizar `asistenciasView.js` para usar `AppModal`, `AppToast` y el nuevo patrón de componentes compactos.
- Implementar suite de pruebas unitarias para el modelo `Asistencia` y el mapeo de estados.
- Asegurar que el registro bulk (masivo) sea atómico y validado por el modelo.

### Out of Scope
- Integración con el sistema de notificaciones automáticas a padres (Fase posterior).
- Gestión de justificaciones médicas detalladas (se mantiene el flujo actual).

## Capabilities

### New Capabilities
- `attendance-tracking-refinement`: Gestión estandarizada de asistencias con validaciones estrictas y reportes optimizados.

### Modified Capabilities
- None

## Approach
Refactorizar el modelo `Asistencia` para que actúe como la única fuente de verdad sobre los estados permitidos. Centralizar la comunicación con Supabase en la API, asegurando que todos los registros pasen por la validación del modelo. Simplificar la UI mediante la extracción de sub-vistas para el `timeline` de sesiones y el `detalle` de asistencia por alumno.

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `src/modules/asistencias/models/` | Modified | Alineación de estados con la BDD. |
| `src/modules/asistencias/api/` | Modified | Limpieza de lógica de negocio y normalización. |
| `src/modules/asistencias/services/` | New | Creación de `asistenciaDataService.js`. |
| `src/modules/asistencias/views/` | Modified | Refactorización de `asistenciasView.js` y `asistenciaReporteView.js`. |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Incompatibilidad con datos históricos | Medium | Implementar un Adapter en el modelo que reconozca tanto 'P' como 'presente' durante la transición. |
| Lentitud en reportes grandes | Low | Usar la lógica de agrupamiento asíncrona ya presente en la API. |

## Rollback Plan
Revertir mediante Git. El esquema de la base de datos es compatible con ambos formatos (el modelo local es el que se está ajustando).

## Dependencies
- `modulo-clases-completion`: Ya completado (las asistencias dependen de las sesiones de clase).

## Success Criteria
- [ ] Modelo `Asistencia` sincronizado con la base de datos (`presente`, `ausente`, `justificado`).
- [ ] Vista principal reducida en complejidad y totalmente responsiva.
- [ ] Registro bulk funcionando correctamente con el nuevo modelo.
- [ ] 100% de tests de lógica de negocio en verde.
