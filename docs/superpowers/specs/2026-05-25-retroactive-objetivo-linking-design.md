# Retroactive objetivo_id Linking — Design Spec

**Date:** 2026-05-25
**Feature:** DSL Progress Foundation — Phase 3 (Retroactive Linking)

---

## Goal

When a teacher adopts an AI-proposed curriculum, automatically link existing `progresos` records
(whose `objetivo_id` is NULL) to the newly created `curriculo_objetivos`, using local fuzzy
matching on `contenido_dsl` vs `objetivo.descripcion`. No extra Groq call needed.

---

## Background / Problem

`progresos.objetivo_id` was added in migration `20260525_progresos_dsl_columns.sql` with a FK
that references `plan_objetivos(id)` — the wrong table. The correct target is
`curriculo_objetivos(id)` (the curriculum catalog, not the planning tree).

Progress records accumulate as free-floating entries (`objetivo_id = NULL`). Once a teacher
adopts a curriculum, those records can be retroactively linked to the matching objectives,
enabling curriculum coverage analytics in future phases.

---

## Architecture

```
adoptarPropuesta(...)                        ← curriculoApi.js
  → returns { curriculo, allObjetivos }
    ↓
linkProgresosToObjetivos({                   ← progressAggregatorService.js (new fn)
  claseId,
  objetivos: [{ id, descripcion }]           ← flat list from all pilares
})
  → for each progreso where objetivo_id IS NULL AND clase_id = claseId
    → fuzzy match contenido_dsl vs objetivo.descripcion
    → batch UPDATE matched rows
  → returns { linked: number }
    ↓
AppToast.success('Plan creado · N registros vinculados')
```

Trigger: automatic, on every successful `adoptarPropuesta` call inside `asistenciaView.js`.

---

## File Map

| File | Status | Responsibility |
|------|--------|----------------|
| `supabase/migrations/20260525_fix_progresos_objetivo_fk.sql` | **Create** | Drop wrong FK, add correct FK to `curriculo_objetivos` |
| `src/portal-maestros/services/progressAggregatorService.js` | **Modify** | Add `linkProgresosToObjetivos({ claseId, objetivos })` |
| `src/modules/planificacion/api/curriculoApi.js` | **Modify** | `adoptarPropuesta` returns flat `allObjetivos[]` alongside `curriculo` |
| `src/portal-maestros/views/asistenciaView.js` | **Modify** | `onAdopt` callback calls `linkProgresosToObjetivos`, shows combined toast |

---

## 1. DB Migration

**File:** `supabase/migrations/20260525_fix_progresos_objetivo_fk.sql`

PostgreSQL does not support `ALTER COLUMN … REFERENCES` — you must drop the old FK constraint and
add the new one.

```sql
-- Step 1: Find and drop the existing FK constraint
ALTER TABLE public.progresos
  DROP CONSTRAINT IF EXISTS progresos_objetivo_id_fkey;

-- Step 2: Add correct FK to curriculo_objetivos
ALTER TABLE public.progresos
  ADD CONSTRAINT progresos_objetivo_id_fkey
  FOREIGN KEY (objetivo_id)
  REFERENCES public.curriculo_objetivos(id)
  ON DELETE SET NULL;

-- Update comment to reflect correct reference
COMMENT ON COLUMN public.progresos.objetivo_id IS
  'FK opcional a curriculo_objetivos. NULL = registro libre sin objetivo asignado. Se vincula automáticamente al adoptar un plan curricular.';
```

**RLS note:** `progresos` already has UPDATE policies for maestros (own rows). This migration does
not touch RLS.

---

## 2. `linkProgresosToObjetivos` — matching algorithm

**File:** `src/portal-maestros/services/progressAggregatorService.js`

### Function signature

```js
/**
 * Retroactively links progresos records (objetivo_id IS NULL) to curriculo_objetivos
 * using local fuzzy matching on contenido_dsl vs objetivo.descripcion.
 *
 * @param {object} opts
 * @param {string} opts.claseId
 * @param {Array<{id: string, descripcion: string}>} opts.objetivos — flat list from all pilares
 * @returns {Promise<{ linked: number }>}
 */
export async function linkProgresosToObjetivos({ claseId, objetivos }) { ... }
```

### Matching logic

Uses the existing `normalize()` helper already in the file.

```
For each (progreso, objetivo) pair:
  normP = normalize(progreso.contenido_dsl)
  normO = normalize(objetivo.descripcion)

  match if ANY of:
    1. normP === normO                              (exact after normalize)
    2. normP.length >= 5 && normO.includes(normP)  (objetivo contains progreso text)
    3. normO.length >= 5 && normP.includes(normO)  (progreso text contains objetivo)
```

Length guard `>= 5` (not 3) — `contenido_dsl` and `descripcion` are longer strings than names,
so a stricter threshold avoids false positives on short words like "arco" or "ritmo".

**Tie-breaking:** if `contenido_dsl` matches more than one objetivo, take the first exact match;
if no exact match, take the first substring match. This is deterministic given a fixed `objetivos`
array order (insertion order from `adoptarPropuesta`).

### DB operation

Fetch unlinked progresos, match client-side, batch update:

```js
// Fetch
const { data: progresos } = await supabase
  .from('progresos')
  .select('id, contenido_dsl')
  .eq('clase_id', claseId)
  .is('objetivo_id', null)
  .not('contenido_dsl', 'is', null)
  .neq('contenido_dsl', '')

// Match locally → build map: objetivoId → progreso id[]
// Update in batch using .in('id', ids)
const { error } = await supabase
  .from('progresos')
  .update({ objetivo_id: objetivoId })
  .in('id', matchedIds)
```

One UPDATE call per matched objetivo (not per row). If 0 progresos match, returns `{ linked: 0 }`
silently without error.

---

## 3. `adoptarPropuesta` — return shape change

**File:** `src/modules/planificacion/api/curriculoApi.js`

Currently returns `curriculo` (the `curriculos` row). Phase 3 needs the flat list of created
`curriculo_objetivos` to pass to `linkProgresosToObjetivos`.

Change: `adoptarPropuesta` now returns `{ curriculo, allObjetivos }` where `allObjetivos` is a
flat `[{ id, descripcion }]` array built from the results of each `crearObjetivo` call.

This is a non-breaking change for existing callers in Phase 2 — they only use `curriculo.id`
and the returned value is now an object that still has `.curriculo`.

**Note for Phase 2 Gemini plan:** If Gemini already implemented `adoptarPropuesta` and the caller
in `asistenciaView.js` uses `const curriculo = await adoptarPropuesta(...)`, that call needs to be
updated to `const { curriculo } = await adoptarPropuesta(...)`. The plan below handles this.

---

## 4. `asistenciaView.js` — `onAdopt` callback

Replace:
```js
onAdopt: async ({ instrumento, nivel, resumen, pilares }) => {
  try {
    await adoptarPropuesta({ instrumento, nivel, descripcion: resumen, pilares })
    AppToast.success('Plan curricular creado correctamente.')
  } catch (err) {
    AppToast.error('Error al crear el plan: ' + err.message)
  }
}
```

With:
```js
onAdopt: async ({ instrumento, nivel, resumen, pilares }) => {
  try {
    const { curriculo, allObjetivos } = await adoptarPropuesta({
      instrumento, nivel, descripcion: resumen, pilares,
    })
    const { linked } = await linkProgresosToObjetivos({ claseId, objetivos: allObjetivos })
    const msg = linked > 0
      ? `Plan creado · ${linked} registro${linked !== 1 ? 's' : ''} vinculado${linked !== 1 ? 's' : ''}`
      : 'Plan curricular creado correctamente.'
    AppToast.success(msg)
  } catch (err) {
    AppToast.error('Error al crear el plan: ' + err.message)
  }
}
```

`claseId` is already in scope in the `onAdopt` closure (from the outer `asistenciaView` render
context).

---

## Error States

| Condition | Behavior |
|-----------|----------|
| Migration FK drop fails (constraint not found) | `DROP CONSTRAINT IF EXISTS` is safe — no error |
| `adoptarPropuesta` fails | AppToast.error, linking not attempted |
| Linking fetch fails | Linking silently returns `{ linked: 0 }` — plan is still created, toast shows success |
| No progresos match | `linked = 0` — toast shows "Plan curricular creado correctamente." |
| Partial match (some rows updated, some fail) | Best-effort — update failures are logged, not thrown |

---

## Out of Scope (Phase 4+)

- Re-linking when teacher edits an existing curriculum (update existing `objetivo_id` values)
- UI showing which progresos got linked (coverage dashboard)
- Linking on manual progress save (not on adopt)
- Week range selector for which progresos to consider for linking

---

## CRITICAL CONTEXT FOR GEMINI

(Include this in the implementation plan since Gemini executes without conversation context.)

### Project Rules
- **Vanilla JS ES Modules only** — no TypeScript, no bundler, no framework
- **Supabase JS v2** — use `supabase.from(...).select/insert/update/delete`
- **Never push to GitHub** — work locally only
- **XSS prevention** — all AI/user text in innerHTML must go through `esc()`
- **Conventional commits** — no "Co-Authored-By" or AI attribution
- **Spanish neutro in prompts** — no voseo, no Rioplatense slang

### Key File Locations
- `src/portal-maestros/services/progressAggregatorService.js` — already has `normalize()`, `resolveAlumnos()`, `saveProgressFromAI()`
- `src/modules/planificacion/api/curriculoApi.js` — has `adoptarPropuesta()` returning `curriculo`
- `src/portal-maestros/views/asistenciaView.js` — `onAdopt` callback is around line 298 (search for `adoptarPropuesta`)
- `supabase/migrations/` — new migration files go here with timestamp prefix `20260525_`

### DB Tables
- `progresos` — has `contenido_dsl text`, `objetivo_id uuid` (currently FK to wrong table)
- `curriculo_objetivos` — `id uuid`, `descripcion text`, `pilar_id uuid`
- `curriculo_pilares` — `id uuid`, `curriculo_id uuid`, `nombre text`
- `curriculos` — `id uuid`, `instrumento text`, `nivel text`

### Existing `normalize()` in progressAggregatorService.js
```js
function normalize(str) {
  return (str || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .trim()
}
```
