# DSL Progress Foundation — Design Spec
**Date:** 2026-05-25  
**Project:** SOI Sistema Académico PWA — Portal Maestros  
**Phase:** Fase 1 — Output estructurado (fundación del historial de progreso)

---

## Goal

Enable teachers to declare student progress states directly inside the DSL observation field using a new `!STATE` token. The aggregator captures every `#Alumno [Contenido] !Estado` triplet into the existing `progresos` table, creating a queryable historical record per student per content item — without requiring a curriculum plan to exist first.

## Architecture

```
DSL text (asistenciaView save)
        ↓
progressAggregatorService.extractAndSaveProgress()
        ↓
progresos table (upsert, evaluacion_tipo='observacion')
        ↓
Feedback badge in editor UI (4 seconds)
        ↓
Student profile already reads progresos → history appears automatically
```

The aggregator runs **after** the session save succeeds, in parallel with the existing `promocionarObservacionesAlumnos` call. A failure in the aggregator logs a warning but never blocks the session save.

At semester end, all free-state progress rows can be read by AI to propose a structured curriculum plan. The `objetivo_id` column (nullable FK) allows retroactive linking to `plan_objetivos` without migrating data.

## Tech Stack

- Vanilla JS ES Modules (no framework)
- Supabase JS v2 — upsert into `progresos`
- Existing `dslParser.js` — extended with `!STATE` token
- Existing `dslEditor.js` — extended with highlight color for `!STATE`
- New `progressAggregatorService.js`

---

## Section 1: DSL Token

**Syntax:**
```
#Nombre [Contenido] !ESTADO
#Nombre [Contenido] !ESTADO N/5
#todos [Contenido] !ESTADO
```

**Valid states:** `!LOGRADO` · `!EN_PROGRESO` · `!INICIADO`

**Rules:**
- The `!STATE` token must appear on the same line as a `#Nombre` and a `[Contenido]` token to be captured by the aggregator. A lone `!LOGRADO` with no alumno or contenido is ignored.
- `#todos` expands to all students in the class array passed to the aggregator.
- The token is optional. Observations without `!` work exactly as today — no breaking change.
- A `N/5` calificación on the same line is also captured into `progresos.calificacion`.
- Case-insensitive match: `!logrado`, `!Logrado`, `!LOGRADO` all parse to `'LOGRADO'`.

**Highlight colors in editor:**
- `!LOGRADO` → green (`#198754`)
- `!EN_PROGRESO` → blue (`#0d6efd`)
- `!INICIADO` → gray (`#6c757d`)

**Parser changes — `dslParser.js`:**

Add to `TOKEN_PATTERNS`:
```js
estados: /!(LOGRADO|EN_PROGRESO|INICIADO)/gi
```

Add to `TOKEN_COLORS`:
```js
estados: { LOGRADO: '#198754', EN_PROGRESO: '#0d6efd', INICIADO: '#6c757d' }
```

Add `estados: []` to the parsed result of `parseDSLSection()`.

Add highlight block in `highlightDSL()`:
```js
result = result.replace(/!(LOGRADO|EN_PROGRESO|INICIADO)/gi, (_, estado) => {
  const color = TOKEN_COLORS.estados[estado.toUpperCase()]
  return pushPlaceholder(`<span class="dsl-token dsl-estado" style="color:${color};font-weight:700">!${estado.toUpperCase()}</span>`)
})
```

---

## Section 2: DB Schema

**Migration file:** `supabase/migrations/20260525_progresos_dsl_columns.sql`

```sql
ALTER TABLE public.progresos
  ADD COLUMN IF NOT EXISTS contenido_dsl  text,
  ADD COLUMN IF NOT EXISTS objetivo_id    uuid
    REFERENCES public.plan_objetivos(id) ON DELETE SET NULL;

COMMENT ON COLUMN public.progresos.contenido_dsl IS
  'Contenido libre extraído del token [texto] del DSL. Nullable FK objetivo_id allows retroactive curriculum linking.';
COMMENT ON COLUMN public.progresos.objetivo_id IS
  'FK opcional a plan_objetivos. NULL cuando el progreso fue registrado como estado libre (sin plan).';
```

**Upsert conflict key:** `(alumno_id, clase_id, sesion_clase_id, contenido_dsl)`  
→ Re-saving a session updates the existing row instead of duplicating.

**Row values written by aggregator:**

| Column | Value |
|--------|-------|
| `alumno_id` | resolved from name match in `alumnos[]` |
| `clase_id` | from session context |
| `sesion_clase_id` | from session context |
| `maestro_id` | from session context |
| `fecha_evaluacion` | session date (`fechaHoy`) |
| `evaluacion_tipo` | `'observacion'` |
| `estado_cualitativo` | `'LOGRADO'` / `'EN_PROGRESO'` / `'INICIADO'` |
| `calificacion` | from `N/5` on the same line, or `null` |
| `contenido_dsl` | text inside `[...]` on the same line |
| `objetivo_id` | `null` (free state, linkable later) |

---

## Section 3: Progress Aggregator Service

**File:** `src/portal-maestros/services/progressAggregatorService.js`

**Exported function:**
```js
export async function extractAndSaveProgress({
  sesionId, claseId, maestroId, dslText, alumnos, fechaHoy
})
// Returns: { saved: [{alumnoNombre, contenido, estado, calificacion}], errors: [] }
```

**Internal algorithm:**

1. Split `dslText` by newline. Process each line independently.
2. For each line, run token extraction:
   - `alumnos` tokens → array of names (expand `todos` to all alumnos)
   - `contenido` tokens → array of content strings (first `[...]` on the line)
   - `estados` token → first `!STATE` found on the line
3. Skip lines where estado is missing or contenido is missing.
4. For each (alumno_name × contenido × estado) combination:
   - Resolve `alumno_id` by fuzzy-matching `alumno_name` against `alumnos[].nombre` (case-insensitive, trim). If no match → push to `errors[]`, continue.
   - Extract `calificacion` from `N/5` pattern on the same line.
   - Build upsert row.
5. Batch upsert all rows to `progresos` with conflict key `(alumno_id, clase_id, sesion_clase_id, contenido_dsl)`.
6. Return `{ saved, errors }`.

**Name matching strategy:**
Match the first word or full name — e.g. `#Isabella` matches `"García Torres, Isabella"` or `"Isabella García"`. Normalize: lowercase, remove accents, compare. If multiple students match the same short name, use the first match and log a warning.

**Error handling:**
- Aggregator failure → `console.warn`, return `{ saved: [], errors: [msg] }`. Never throws.
- Partial failure (some rows fail) → save what succeeded, report errors for failed rows.

---

## Section 4: Feedback UI

**Location:** Below the DSL editor, inside `asistenciaView.js`, after the observation save pipeline.

**Trigger:** Called with the `saved[]` array returned by `extractAndSaveProgress`.

**Behavior:**
- If `saved.length === 0` → no badge shown.
- If `saved.length > 0` → render badge for 4 seconds then fade out.

**Badge content:**
```
✓ Progreso registrado — Isabella: Sol Mayor [LOGRADO] · Santiago: Posiciones I-II [EN PROGRESO]
```
For `#todos`: `✓ Progreso registrado — 12 alumnos: Compás 3/4 [INICIADO]`

**Badge HTML (injected after editor container):**
```html
<div class="pm-progress-feedback">
  <i class="bi bi-check-circle-fill"></i>
  <span>{message}</span>
</div>
```

**CSS (in `05-views.css`):**
```css
.pm-progress-feedback {
  display: flex; align-items: center; gap: 6px;
  font-size: 0.78rem; font-weight: 600;
  color: var(--pm-success);
  padding: 6px 10px;
  background: color-mix(in srgb, var(--pm-success) 12%, transparent);
  border-radius: 6px;
  border-left: 3px solid var(--pm-success);
  margin-top: 6px;
  animation: pmProgressFadeIn 0.3s ease, pmProgressFadeOut 0.4s ease 3.6s forwards;
}
@keyframes pmProgressFadeIn  { from { opacity: 0; transform: translateY(-4px); } to { opacity: 1; transform: none; } }
@keyframes pmProgressFadeOut { from { opacity: 1; } to { opacity: 0; } }
```

---

## Integration Point in `asistenciaView.js`

The aggregator is called inside the observation save handler, after `promocionarObservacionesAlumnos` succeeds:

```js
// After existing promotion call:
const { extractAndSaveProgress } = await import('../services/progressAggregatorService.js')
const { saved, errors } = await extractAndSaveProgress({
  sesionId, claseId, maestroId: maestro.id,
  dslText: raw,   // the raw observation text before AI processing
  alumnos,
  fechaHoy,
})
if (errors.length) console.warn('[Progress] Partial errors:', errors)
if (saved.length) _showProgressFeedback(saved, editorContainer)
```

`_showProgressFeedback` is a small helper inside `asistenciaView.js` that builds and injects the badge HTML.

---

## Files Touched

| File | Change |
|------|--------|
| `src/portal-maestros/utils/dslParser.js` | Add `estados` token pattern, colors, extraction, highlight |
| `src/portal-maestros/styles/05-views.css` | Add `.pm-progress-feedback` + keyframe animations |
| `src/portal-maestros/services/progressAggregatorService.js` | **New file** — aggregator |
| `src/portal-maestros/views/asistenciaView.js` | Call aggregator after save, show feedback badge |
| `supabase/migrations/20260525_progresos_dsl_columns.sql` | **New file** — 2 columns on `progresos` |

---

## Out of Scope (Fase 2+)

- Autocomplete of real student names while typing `#`
- Groq receiving historical progress as context
- Retroactive linking of `objetivo_id` to `plan_objetivos`
- AI-generated curriculum proposal from accumulated free states
- Monthly PDF report consuming `progresos` table

---

## Success Criteria

1. Teacher writes `#Isabella [Sol Mayor] !LOGRADO` → saves → badge appears → `progresos` has a row with `estado_cualitativo='LOGRADO'`, `contenido_dsl='Sol Mayor'`, `evaluacion_tipo='observacion'`.
2. Re-saving the same session updates the row, not duplicates.
3. `#todos [Compás 3/4] !INICIADO` creates one row per student in the class.
4. Observations without `!` token work exactly as before — no regression.
5. Aggregator failure does not block session save.
