# AI Curriculum Proposal — Design Spec

**Date:** 2026-05-25
**Feature:** DSL Progress Foundation — Phase 2 (Curriculum Proposal)

---

## Goal

Allow teachers to generate a structured curriculum proposal (pilares + objetivos) from accumulated progress records, review and edit it inline, and adopt it as a real curriculum with one click.

---

## Architecture

```
Button "✨ Proponer plan"
  → progressInsightService.fetchInsights(claseId, semanas)
  → groqService.proposeCurriculum(insights, context)
  → CurriculumProposalPanel.open(proposal)   ← teacher reviews/edits
  → "Adoptar plan" → curriculoApi.adoptarPropuesta(data)
  → AppToast.success / AppToast.error
```

---

## File Map

| File | Status | Responsibility |
|------|--------|---------------|
| `src/portal-maestros/services/progressInsightService.js` | **Create** | Query + aggregate `progresos` for a class over N weeks |
| `src/portal-maestros/services/groqService.js` | **Modify** | Add `proposeCurriculum(insights, context)` |
| `src/portal-maestros/components/CurriculumProposalPanel.js` | **Create** | Inline review/edit UI for pilares + objetivos |
| `src/modules/planificacion/api/curriculoApi.js` | **Modify** | Add `adoptarPropuesta({ instrumento, nivel, descripcion, pilares })` |
| `src/portal-maestros/styles/05-views.css` | **Modify** | `.cpp-*` panel styles |
| `src/modules/planificacion/views/planificacionView.js` | **Modify** | Add "✨ Proponer plan" button + wire-up |
| `src/portal-maestros/views/asistenciaView.js` | **Modify** | Add button inside `#pm-planificacion-card` + wire-up |

---

## 1. progressInsightService.js

### `fetchInsights(claseId, semanas = 12)`

Queries `progresos` for the given class over the last N weeks. Groups records with identical or near-identical `contenido_dsl` to reduce token waste before sending to Groq.

**Query:**
```js
supabase
  .from('progresos')
  .select('contenido_dsl, tipo, estado_cualitativo, alumno_id, fecha_evaluacion, alumnos(nombre_completo)')
  .eq('clase_id', claseId)
  .eq('evaluacion_tipo', 'observacion')
  .gte('fecha_evaluacion', fechaDesde)   // today - semanas * 7 days
  .not('contenido_dsl', 'is', null)
  .neq('contenido_dsl', '')
  .order('fecha_evaluacion', { ascending: false })
```

**Aggregation logic:**
- Group rows by `contenido_dsl` (exact match after trim + lowercase)
- For each group: count unique `fecha_evaluacion` values as `frecuencia` (sessions where this appeared)
- Collect unique alumno names
- Keep the most recent `estado_cualitativo` as representative estado

**Returns:**
```js
{
  totalSesiones: number,       // distinct session dates in the period
  fechaDesde: string,          // ISO date string
  registros: [
    {
      contenido_dsl: string,   // what was worked on
      tipo: string,            // tecnica|repertorio|teoria|interpretacion|otro
      estado: string,          // most recent: LOGRADO|EN_PROGRESO|INICIADO
      frecuencia: number,      // how many sessions this appeared in
      alumnos: string[],       // names of students who worked on this
    }
  ]
}
```

Returns `{ totalSesiones: 0, fechaDesde, registros: [] }` if no data found — caller shows a "no hay registros suficientes" message.

---

## 2. groqService.js — `proposeCurriculum(insights, context)`

### Parameters
- `insights` — result of `fetchInsights()`
- `context` — `{ instrumento: string, nivel: string, nombreClase: string }`

### Prompt — `PROPOSE_CURRICULUM_PROMPT`

```
Eres un pedagogo musical especializado en diseño curricular.

Analizas registros reales de clase de las últimas {semanas} semanas y propones
un plan curricular estructurado en pilares y objetivos.

CONTEXTO:
- Clase: {nombreClase}
- Instrumento: {instrumento}
- Nivel estimado: {nivel}
- Total sesiones analizadas: {totalSesiones}
- Período: {fechaDesde} → hoy

REGISTROS (agrupados por frecuencia de aparición en sesiones):
{registros como JSON compacto}

REGLAS DE CONSTRUCCIÓN:
- Máximo 4 pilares — usa solo los tipos que aparecen en los datos
- De 2 a 6 objetivos por pilar
- Los registros con estado LOGRADO sugieren consolidación — inclúyelos como base ya alcanzada
- Los EN_PROGRESO son el foco principal del próximo período — dales prioridad "alta"
- Los INICIADO son objetivos emergentes — inclúyelos solo si frecuencia >= 2
- Nombres de objetivos: concisos, pedagógicamente precisos (máximo 60 caracteres)
- El campo "descripcion" de cada objetivo debe ser el nombre del objetivo (no una explicación larga)
- No inventes contenidos que no estén en los registros

FORMATO DE RESPUESTA (JSON válido, sin texto adicional):
{
  "pilares": [
    {
      "nombre": "Nombre del pilar",
      "tipo": "tecnica|repertorio|teoria|interpretacion",
      "objetivos": [
        {
          "descripcion": "Nombre conciso del objetivo",
          "prioridad": "alta|media|consolidacion"
        }
      ]
    }
  ],
  "resumen": "Una frase que describe el foco pedagógico detectado (máx 120 chars)"
}
```

### Implementation notes
- Temperature: `0.2` (structured output, avoid hallucination)
- Strip markdown code blocks before JSON.parse (same pattern as `analyzeObservation`)
- Returns `{ pilares: [], resumen: '' }` shape — throw descriptive error on failure
- Log raw response to console.debug for debugging

---

## 3. CurriculumProposalPanel.js

### API
```js
export function createCurriculumProposalPanel(container, { onAdopt, onCancel })
// Returns { open({ pilares, resumen, instrumento, nivel }), close() }
```

### Behavior

- Mounts a single DOM element with class `cpp-panel` into `container` (created once, reused)
- `open()` shallow-copies pilares so edits don't mutate the original
- `close()` hides and empties the panel

### Editable fields

**Pilar names:** click on the name → becomes an `<input>` inline. On blur or Enter → saves back to `_pilares[i].nombre`. Re-renders on Enter.

**Objetivo descriptions:** same pattern — click → inline input → blur/Enter saves.

**Remove pilar:** `✕` button on each pilar card — splices from `_pilares`, re-renders.

**Remove objetivo:** `✕` button on each objetivo row — splices from `pilar.objetivos`, re-renders.

**Instrumento / Nivel fields:** always-visible inputs at the bottom of the panel, pre-filled from context. Required for `adoptarPropuesta`.

### "Adoptar plan" button
- Disabled if: no pilares, or any pilar has 0 objetivos, or instrumento is empty
- On click: calls `onAdopt({ instrumento, nivel, resumen, pilares })` then `close()`

### Pilar colors by tipo
```js
const TIPO_COLORS = {
  tecnica:        { color: '#0d6efd', bg: '#0d6efd18' },
  repertorio:     { color: '#198754', bg: '#19875418' },
  teoria:         { color: '#fd7e14', bg: '#fd7e1418' },
  interpretacion: { color: '#6f42c1', bg: '#6f42c118' },
  otro:           { color: '#6c757d', bg: '#6c757d18' },
}
```

### Prioridad badge colors
```js
const PRIORIDAD_COLORS = {
  alta:          { label: 'Foco',         color: '#dc3545' },
  media:         { label: 'Secundario',   color: '#fd7e14' },
  consolidacion: { label: 'Consolidar',   color: '#198754' },
}
```

### XSS safety
All teacher-editable and AI-derived strings injected into innerHTML must go through an `esc()` helper (same as ProgressPreviewPanel).

---

## 4. curriculoApi.js — `adoptarPropuesta()`

```js
export async function adoptarPropuesta({ instrumento, nivel, descripcion, pilares }) {
  // 1. Create curriculo
  const curriculo = await crearCurriculo({ instrumento, nivel, descripcion })

  // 2. Create pilares in order
  for (let i = 0; i < pilares.length; i++) {
    const pilar = await crearPilar(curriculo.id, pilares[i].nombre, i)

    // 3. Create objetivos for this pilar in order
    for (let j = 0; j < pilares[i].objetivos.length; j++) {
      await crearObjetivo(pilar.id, pilares[i].objetivos[j].descripcion, j)
    }
  }

  return curriculo
}
```

Throws on any step failure — caller shows `AppToast.error`. No rollback (partial curriculo can be cleaned up via existing curriculo editor).

---

## 5. CSS — `05-views.css`

New classes to append:

- `.cpp-panel` — outer wrapper, same style as `.pm-progress-preview`
- `.cpp-header` — title row with icon + resumen
- `.cpp-pilar` — pilar card with left border colored by tipo
- `.cpp-pilar-title` — editable pilar name (cursor: text on hover)
- `.cpp-objetivo-row` — objetivo row with prioridad badge + remove button
- `.cpp-objetivo-text` — editable objetivo description
- `.cpp-footer` — instrumento/nivel inputs + action buttons
- `.cpp-empty` — "no hay registros suficientes" state

---

## 6. Entry Points

### planificacionView.js

Button added to `planificacion-header-actions` div (teacher mode only, not admin):

```html
<button class="btn btn-sm btn-outline-primary" id="btn-proponer-curriculo">
  <i class="bi bi-stars"></i> Proponer plan
</button>
```

The panel mounts below the header. Context:
- `instrumento`: not available directly — use empty string, let teacher fill it
- `nivel`: empty string, let teacher fill it
- `claseId`: not available in planificacionView (it shows all plans) — the button is ONLY shown when the teacher has filtered to a single class, OR always shown with a note "selecciona una clase primero"

**Decision:** In `planificacionView`, the button always appears but requires the teacher to fill instrumento + nivel manually (they are editable in the panel). No `claseId` context means `fetchInsights` is called without class filter — show a class selector or disable button with tooltip "Abre este plan desde la vista de Asistencias para analizar una clase específica".

**Simpler approach (YAGNI):** Remove the button from `planificacionView` for now. Wire it only in `asistenciaView` where `claseId` is always known. Add it to `planificacionView` in a future iteration.

### asistenciaView.js

Button added inside `#pm-planificacion-card`, after the plan dropdown content:

```html
<button class="pm-btn pm-btn-outline" id="btn-proponer-curriculo" style="margin-top:0.5rem">
  <i class="bi bi-stars"></i> Proponer plan curricular
</button>
```

Wire-up:
```js
document.querySelector('#btn-proponer-curriculo').onclick = async () => {
  // show loading state
  const insights = await progressInsightService.fetchInsights(claseId, 12)
  if (insights.registros.length === 0) {
    AppToast.error('No hay registros de progreso suficientes para generar una propuesta.')
    return
  }
  const proposal = await groqService.proposeCurriculum(insights, {
    instrumento: clase.instrumento || '',
    nivel: '',
    nombreClase: clase.nombre || '',
  })
  curriculumPanel.open({
    pilares: proposal.pilares,
    resumen: proposal.resumen,
    instrumento: clase.instrumento || '',
    nivel: '',
  })
}
```

`onAdopt` callback:
```js
onAdopt: async ({ instrumento, nivel, resumen, pilares }) => {
  try {
    await adoptarPropuesta({
      instrumento,
      nivel,
      descripcion: resumen,
      pilares,
    })
    AppToast.success('Plan curricular creado correctamente.')
  } catch (err) {
    AppToast.error('Error al crear el plan: ' + err.message)
  }
}
```

---

## Error States

| Condition | Behavior |
|-----------|----------|
| No progresos in period | `AppToast.error` + panel doesn't open |
| Groq API error | `AppToast.error('No se pudo generar la propuesta. Verifica la conexión.')` |
| Groq returns 0 pilares | Panel opens with empty state message |
| `adoptarPropuesta` fails mid-way | `AppToast.error` with message; partial curriculo left in DB |

---

## Out of Scope (Phase 3)

- Retroactive `objetivo_id` linking on existing `progresos` rows
- Proposing plan from `planificacionView` with class selector
- Editing existing curricula from this panel (use existing `curriculoModal`)
- Week range selector UI (defaults to 12, not user-configurable in this phase)
