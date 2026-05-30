# Design: Session Summary Grouped

## Technical Approach

4 capas independientes con expansión por sección orquestal en el pipeline post-Groq. Sin cambios de schema, sin nuevas dependencias. El panel agrupa por `contenido_dsl` usando un `Map` interno.

## Architecture Decisions

### Decision: Section expansion en post-Groq, no en el prompt

| Opción | Tradeoff |
|--------|----------|
| Expandir en prompt (Groq resuelve nombres) | + Preciso, - Caro, - Groq puede alucinar nombres |
| **Expandir post-Groq con JS puro** | + Determinista, + Barato, + Testeable, - Requiere mapeo sección→instrumentos |

Decisión: JS puro. `expandSeccionItems()` se ejecuta después de `applyGuardas()`, antes de `expandColectivos()`.

### Decision: Instrument normalization reusa patrón NFD existente

El codebase ya usa `normalize('NFD').replace(/[\u0300-\u036f]/g, '')` en `progressAggregatorService.js` y `observationParser.js`. Reusamos el mismo patrón en lugar de una lib externa. El matching es `includes` bidireccional (instrumento_alumno incluye instrumento_sección, o viceversa).

### Decision: Guarda 5 condicional para items con seccion

Guarda 5 actual: `esColectivo = alumnos.length === 0`. Cambio: `esColectivo = alumnos.length === 0 && !item.seccion`. Items con `seccion` pero sin `alumnos` NO se marcan como colectivos — la expansión ocurre post-guardas.

### Decision: SessionSummaryPanel elimina ciclo inline de estados

El spec elimina el botón de ciclo de estado individual. Los estados se muestran como badges informativos con color (LOGRADO/EN_PROGRESO/INICIADO/MIXTO). La edición batch se posterga (out of scope).

## Data Flow

```
Teacher text → analyzeObservation()
  │
  ├─ payload.secciones = buildSeccionContext(alumnos, presentes)
  ├─ Groq → items[] con { contenido, seccion, alumnos, ... }
  ├─ applyGuardas(items, presentes)   ← Guarda 5 modificada
  ├─ expandSeccionItems(items, alumnos, presentes)  ← NUEVO
  ├─ expandColectivos(items, presentes)
  └─ buildDSL(items, presentes)

SessionSummaryPanel.open()
  │
  ├─ fetch progresos WHERE sesion_clase_id
  ├─ fetch alumnos names
  ├─ _normalizeRecords() → Map<contenido_dsl, group>
  └─ _render() → HTML agrupado
```

## File Changes

| File | Action | Description |
|------|--------|-------------|
| `src/portal-maestros/data/seccionesOrquestales.js` | **Create** | Mapa sección→instrumentos + getAlumnosBySeccion, expandSeccionItems, buildSeccionContext |
| `src/portal-maestros/services/groqService.js` | **Modify** | Inyectar secciones en prompt, ajustar Guarda 5, agregar expandSeccionItems al pipeline |
| `src/portal-maestros/components/SessionSummaryPanel.js` | **Modify** | Agrupar por contenido_dsl, nuevo layout HTML, eliminar ciclo inline de estados |
| `src/portal-maestros/services/progressAggregatorService.js` | **Modify** | saveProgressFromEvaluaciones acepta `seccion`, expande antes de upsert |
| `src/portal-maestros/data/__tests__/seccionesOrquestales.test.js` | **Create** | Tests unitarios del registry (mock-free, 100% pure JS) |
| `src/portal-maestros/services/__tests__/groqService.test.js` | **Modify** | Tests: Guarda 5 condicional, expandSeccionItems en pipeline |

## Interfaces / Contracts

### seccionesOrquestales.js

```js
SECCION_MAP: {
  cuerdas:      ['violín', 'viola', 'violonchelo', 'contrabajo'],
  violines:     ['violín'],
  violas:       ['viola'],
  cellos:       ['violonchelo'],
  contrabajos:  ['contrabajo'],
  maderas:      ['flauta', 'oboe', 'clarinete'],
  vientos_madera: ['flauta', 'oboe', 'clarinete'],
  flautas:      ['flauta'],
  oboes:        ['oboe'],
  clarinetes:   ['clarinete'],
  // tutti/general → expansión total, individual → vacío
}
```

### _normalizeRecords() — internal contract

```js
_groups = [
  {
    contenido: string,        // contenido_dsl único (trim + lowercase como key)
    estado: string | 'mixto', // común o 'mixto' si difieren
    alumnos: [{ id, nombre, estado_cualitativo }],
    seccion: string | null,
    observaciones: string | null,
    tarea: string | null,
  }
]
```

## Testing Strategy

| Layer | What | How |
|-------|------|-----|
| Unit | `getAlumnosBySeccion` — filtering, tutti, individual, unknown section | Vitest, sin mocks |
| Unit | `expandSeccionItems` — items mixtos (alumnos pre-resueltos + sección) | Vitest |
| Unit | Normalización: acentos, plurales, case | Vitest |
| Unit | Guarda 5 condicional: item con seccion no se marca colectivo | Vitest con mocks de Groq |
| Unit | SessionSummaryPanel grouping: Map agrupa contenido idéntico | Vitest, mock supabase |
| Unit | WhatsApp text builder con formato agrupado | Vitest |
| Integration | `saveProgressFromEvaluaciones` con `seccion` en evaluaciones | Vitest, mock supabase |

## Migration / Rollout

No migration required. Los datos existentes en `progresos` tienen `contenido_dsl` ya definido. El SessionSummaryPanel v2 agrupa sin modificar la BD. Rollback: revertir commits de SessionSummaryPanel.js, groqService.js, progressAggregatorService.js; eliminar seccionesOrquestales.js.

## Open Questions

- [ ] El spec elimina el ciclo inline de estados. ¿El maestro pierde la capacidad de corregir estados desde el panel? Se posterga a edición batch (out of scope).
- [ ] ¿`seccion` en Groq items debe ser string libre o controlado contra SECCION_MAP? Post-expansión filtra contra el mapa, así que el item original puede traer cualquier string.
