# Proposal: Session Summary Grouped

## Intent

El `SessionSummaryPanel` actual muestra una tarjeta por cada registro de `progresos`. Si 5 alumnos comparten el mismo `contenido_dsl`, se renderizan 5 cards idénticas — ruido visual que esconde el panorama pedagógico. Además, el sistema no entiende secciones orquestales ("maderas", "cuerdas", "tutti"), forzando al maestro a etiquetar alumnos uno por uno.

## Scope

### In Scope
- **Section Registry** (`src/portal-maestros/data/seccionesOrquestales.js`): mapa estático de secciones → instrumentos + función `expandirSeccion(seccion, roster)`.
- **Enhanced Groq prompt**: inyectar contexto de secciones con nombres de alumnos en `ANALYZE_OBSERVATION_PROMPT`.
- **Post-Groq expansion**: función que recorre `items[]` y donde hay `seccion` expande a `alumnos` individuales.
- **SessionSummaryPanel v2**: reescritura con agrupación por `contenido_dsl`, formato visual agrupado (tabla/cards), contenido mostrado una vez.
- **SaveProgress con secciones**: `saveProgressFromEvaluaciones` acepta `seccion` como alternativa a `alumno_id` y expande antes de upsert.

### Out of Scope
- Edición inline de estados (se elimina el cycle click — se reemplaza por acción batch).
- Exportar a PDF (solo copia a texto plano y link WhatsApp).
- Visualización diferenciada por clase (el mismo panel sirve para instrumento y orquesta).

## Capabilities

### New Capabilities
- `orchestral-section-registry`: Mapa secciones-instrumentos + expansión a alumnos del roster.

### Modified Capabilities
- `student-observation-tracking`: El flujo de análisis de observaciones ahora entiende secciones orquestales. `SessionSummaryPanel` agrupa por contenido compartido. `saveProgressFromEvaluaciones` acepta `seccion`.

## Approach

4 capas independientes:

1. **seccionesOrquestales.js** — diccionario puro + función `expandir(seccion, alumnos)`. Sin dependencias. Testeable en aislamiento.
2. **groqService.js** — en el `ANALYZE_OBSERVATION_PROMPT`, agregar bloque `ALUMNOS_POR_SECCION: {...}`. Post-procesar items: donde `item.seccion` exista, reemplazar `item.alumnos` con el resultado de `expandirSeccion()`. 
3. **SessionSummaryPanel.js** — reescribir `_renderRecords()`: agrupar por `contenido_dsl` usando `Map<contenido, alumnos[]>`. Cada grupo = 1 card con listado de alumnos. Nuevo diseño con cabecera de contenido + badges de alumnos + estado + observaciones + tarea.
4. **progressAggregatorService.js** — en `saveProgressFromEvaluaciones`, si algún `ev` tiene `seccion` en lugar de `alumno_id`, resolver contra el roster antes de armar rows.

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `src/portal-maestros/data/seccionesOrquestales.js` | New | Mapa secciones + función expandir |
| `src/portal-maestros/services/groqService.js` | Modified | Prompt enriquecido + post-expansión secciones |
| `src/portal-maestros/components/SessionSummaryPanel.js` | Modified | Agrupación por contenido, HTML responsivo |
| `src/portal-maestros/services/progressAggregatorService.js` | Modified | `saveProgressFromEvaluaciones` acepta `seccion` |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Groq alucina secciones que no existen en el registro | Medium | Post-expansión solo actúa si `seccion` existe en el mapa + tiene alumnos en roster |
| La agrupación por contenido pierde registros con contenido vacío | Low | Contenido vacío → grupo "Sin contenido", visible pero colapsable |
| Se rompe el ciclo de estados (click para cambiar) | Med | Reemplazar con dropdown o botón batch; no perder funcionalidad |

## Rollback Plan

Revertir commits de `SessionSummaryPanel.js` y `progressAggregatorService.js`. El archivo nuevo `seccionesOrquestales.js` se elimina. El prompt de Groq vuelve al anterior (no hay breaking change en la API de Groq — solo se agrega contexto).

## Dependencies

Ninguna externa. Interna: el roster de alumnos debe tener `instrumento_principal` poblado para que la expansión de secciones funcione.

## Success Criteria

- [ ] 5 registros con mismo `contenido_dsl` se muestran como 1 card agrupada con 5 alumnos listados
- [ ] Maestro escribe "maderas trabajó c.23-49" y Groq etiqueta a flautas, oboes y clarinetes del roster
- [ ] `saveProgressFromEvaluaciones({ seccion: "cuerdas", ... })` crea N rows (uno por violinista, violista, cellista, contrabajista)
- [ ] Tests existentes de groqService siguen pasando (`npm run test:run`)
