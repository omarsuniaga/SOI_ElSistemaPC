# Proposal: Finalización Módulo Programas (Fase 4)

## Intent
Completar y estandarizar el Módulo de Programas siguiendo el patrón de arquitectura del proyecto (API -> Model -> View -> Modal -> Router). Actualmente, el módulo tiene una API y Vista básicas, pero carece de un modelo formal, validaciones robustas y pruebas unitarias/integración.

## Scope

### In Scope
- Crear `src/modules/programas/models/programa.model.js` con validaciones de negocio.
- Refactorizar `src/modules/programas/views/programasView.js` para usar el nuevo modelo y el estilo "Core Refinement".
- Implementar suite de pruebas unitarias para el modelo y la API (Modo Mock).
- Asegurar consistencia visual con el resto de los módulos core (tablas responsivas, botones compactos).
- Integrar exportación PDF robusta usando el nuevo modelo.

### Out of Scope
- Gestión de dependencias complejas entre programas (ej. programas que requieren otros programas).
- Reportes estadísticos avanzados (pertenecen al módulo de Métricas).

## Capabilities

### New Capabilities
- `academic-program-management`: Gestión completa de programas académicos con validaciones y auditoría.

### Modified Capabilities
- None

## Approach
Implementar el modelo `Programa` con métodos de validación y normalización. Migrar la lógica de la vista hacia este modelo para desacoplar el UI de los datos. Seguir el flujo Strict TDD para asegurar que cada nueva funcionalidad esté respaldada por pruebas automáticas.

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `src/modules/programas/models/` | New | Creación del modelo de datos. |
| `src/modules/programas/views/` | Modified | Refactorización de UI y eventos. |
| `src/modules/programas/__tests__/` | New | Suite de pruebas unitarias e integración. |
| `src/modules/programas/api/` | Modified | Ajustes menores para alineación con el modelo. |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Regresión en vistas existentes | Low | Cobertura de tests del 100% en lógica de negocio. |
| Inconsistencia visual | Low | Seguir los patrones de `alumnosView.js` y `maestrosView.js`. |

## Rollback Plan
Revertir cambios en `views/` y `api/` mediante Git. El nuevo modelo y tests no afectan al funcionamiento actual si no se instancian.

## Dependencies
- Ninguna. El esquema de base de datos para `programas` ya existe.

## Success Criteria
- [ ] Modelo `Programa` creado con validaciones para nombre, nivel y duración.
- [ ] Vista de Programas totalmente responsiva y alineada al estilo "Core".
- [ ] 100% de las pruebas unitarias y de integración pasando en verde.
- [ ] Exportación PDF operativa y con formato estandarizado.
