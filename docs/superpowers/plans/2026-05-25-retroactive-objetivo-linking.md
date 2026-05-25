# Retroactive objetivo_id Linking — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix the wrong FK on `progresos.objetivo_id` and auto-link existing progress records to the newly adopted curriculum on adopt.

**Architecture:** DB migration fixes FK → `curriculo_objetivos`. `adoptarPropuesta` returns flat `allObjetivos[]`. `linkProgresosToObjetivos` fetches unlinked progresos, fuzzy-matches client-side, batch-updates. `onAdopt` in `asistenciaView.js` calls both and shows a combined toast.

**Tech Stack:** Vanilla JS ES Modules, Supabase JS v2, PostgreSQL migration files

---

## CRITICAL CONTEXT (read before starting)

- **No TypeScript, no bundler, no framework** — vanilla JS ES Modules only
- **Never push to GitHub** — local only
- **Conventional commits only** — no "Co-Authored-By" or AI attribution
- **Spanish neutro in any user-facing strings** — no voseo, no Rioplatense
- **Supabase JS v2 syntax**: `supabase.from('table').select/update/insert` with `{ data, error }` returns

### Key file locations
- `src/portal-maestros/services/progressAggregatorService.js` — add `linkProgresosToObjetivos` here
- `src/modules/planificacion/api/curriculoApi.js` — modify `adoptarPropuesta` return shape
- `src/portal-maestros/views/asistenciaView.js` — update `onAdopt` callback
- `supabase/migrations/` — new migration file goes here

### Existing `normalize()` in progressAggregatorService.js (do NOT redefine it)
```js
function normalize(str) {
  return (str || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .trim()
}
```

### `adoptarPropuesta` current signature (curriculoApi.js)
Currently returns the `curriculo` row directly (`return curriculo`).
After Phase 3 it must return `{ curriculo, allObjetivos }`.

### `onAdopt` location in asistenciaView.js
Search for `adoptarPropuesta` — it's inside the `onAdopt:` callback passed to
`createCurriculumProposalPanel`. (Phase 2 added this. If Phase 2 was not yet executed,
`onAdopt` uses the placeholder from the Phase 2 plan.)

---

## Task 1 — DB Migration: fix progresos.objetivo_id FK

**Files:**
- Create: `supabase/migrations/20260525_fix_progresos_objetivo_fk.sql`

- [ ] **Step 1: Verify the current constraint name**

  Read `supabase/migrations/20260525_progresos_dsl_columns.sql` to confirm the constraint name.
  PostgreSQL auto-names it `progresos_objetivo_id_fkey` when you use the inline `REFERENCES` syntax.
  That is what we drop.

- [ ] **Step 2: Create the migration file**

  Create `supabase/migrations/20260525_fix_progresos_objetivo_fk.sql` with this content:

  ```sql
  -- Fix: progresos.objetivo_id was referencing plan_objetivos (wrong table).
  -- Correct target is curriculo_objetivos (curriculum catalog).

  ALTER TABLE public.progresos
    DROP CONSTRAINT IF EXISTS progresos_objetivo_id_fkey;

  ALTER TABLE public.progresos
    ADD CONSTRAINT progresos_objetivo_id_fkey
    FOREIGN KEY (objetivo_id)
    REFERENCES public.curriculo_objetivos(id)
    ON DELETE SET NULL;

  COMMENT ON COLUMN public.progresos.objetivo_id IS
    'FK opcional a curriculo_objetivos. NULL = registro libre sin objetivo asignado. Se vincula automáticamente al adoptar un plan curricular.';
  ```

- [ ] **Step 3: Verify file exists and content is correct**

  ```bash
  cat supabase/migrations/20260525_fix_progresos_objetivo_fk.sql
  ```

  Expected: the three SQL statements above.

- [ ] **Step 4: Commit**

  ```bash
  git add supabase/migrations/20260525_fix_progresos_objetivo_fk.sql
  git commit -m "fix(db): fix progresos.objetivo_id FK — point to curriculo_objetivos"
  ```

---

## Task 2 — `linkProgresosToObjetivos` in progressAggregatorService.js

**Files:**
- Modify: `src/portal-maestros/services/progressAggregatorService.js`

- [ ] **Step 1: Read the file to understand current structure**

  Read `src/portal-maestros/services/progressAggregatorService.js`.
  Confirm `normalize()` exists (do NOT add it again). Confirm the imports at the top.

- [ ] **Step 2: Add `linkProgresosToObjetivos` at the end of the file**

  Append after `saveProgressFromDSL`:

  ```js
  /**
   * Retroactively links progresos records (objetivo_id IS NULL) to curriculo_objetivos
   * using local fuzzy matching on contenido_dsl vs objetivo.descripcion.
   *
   * Matching rules (in priority order):
   *   1. Exact match after normalize()
   *   2. objetivo.descripcion contains contenido_dsl (both >= 5 chars)
   *   3. contenido_dsl contains objetivo.descripcion (both >= 5 chars)
   *
   * @param {object} opts
   * @param {string} opts.claseId
   * @param {Array<{id: string, descripcion: string}>} opts.objetivos - flat list from all pilares
   * @returns {Promise<{ linked: number }>}
   */
  export async function linkProgresosToObjetivos({ claseId, objetivos }) {
    if (!claseId || !objetivos || objetivos.length === 0) return { linked: 0 }

    // 1. Fetch unlinked progresos for this class
    const { data: progresos, error: fetchError } = await supabase
      .from('progresos')
      .select('id, contenido_dsl')
      .eq('clase_id', claseId)
      .is('objetivo_id', null)
      .not('contenido_dsl', 'is', null)
      .neq('contenido_dsl', '')

    if (fetchError) {
      console.warn('[Progress] linkProgresosToObjetivos fetch error:', fetchError.message)
      return { linked: 0 }
    }
    if (!progresos || progresos.length === 0) return { linked: 0 }

    // 2. Normalize objetivos once
    const normObjetivos = objetivos.map(o => ({
      id: o.id,
      norm: normalize(o.descripcion),
      raw: o.descripcion,
    }))

    // 3. Build map: objetivoId → matched progreso ids[]
    const matchMap = new Map()  // objetivoId → string[]

    for (const progreso of progresos) {
      const normP = normalize(progreso.contenido_dsl)
      if (!normP) continue

      // Try exact match first, then substring
      let matched = normObjetivos.find(o => o.norm === normP)
      if (!matched && normP.length >= 5) {
        matched = normObjetivos.find(o => o.norm.length >= 5 && o.norm.includes(normP))
      }
      if (!matched && normP.length >= 5) {
        matched = normObjetivos.find(o => o.norm.length >= 5 && normP.includes(o.norm))
      }

      if (matched) {
        const ids = matchMap.get(matched.id) || []
        ids.push(progreso.id)
        matchMap.set(matched.id, ids)
      }
    }

    if (matchMap.size === 0) return { linked: 0 }

    // 4. Batch update — one UPDATE per matched objetivo
    let linked = 0
    for (const [objetivoId, ids] of matchMap.entries()) {
      const { error: updateError } = await supabase
        .from('progresos')
        .update({ objetivo_id: objetivoId })
        .in('id', ids)

      if (updateError) {
        console.warn('[Progress] linkProgresosToObjetivos update error:', updateError.message)
      } else {
        linked += ids.length
      }
    }

    console.debug(`[Progress] linkProgresosToObjetivos: linked ${linked} records`)
    return { linked }
  }
  ```

- [ ] **Step 3: Verify the file compiles (no syntax errors)**

  ```bash
  node --input-type=module < src/portal-maestros/services/progressAggregatorService.js 2>&1 | head -5
  ```

  Expected: exits with no error output (the imports will fail at runtime without Supabase but
  the module should parse without syntax errors). If you see `SyntaxError`, fix before continuing.

  Alternative check — count exports:
  ```bash
  grep "^export async function" src/portal-maestros/services/progressAggregatorService.js
  ```
  Expected: `saveProgressFromAI`, `saveProgressFromDSL`, `linkProgresosToObjetivos` — 3 lines.

- [ ] **Step 4: Commit**

  ```bash
  git add src/portal-maestros/services/progressAggregatorService.js
  git commit -m "feat(progress): add linkProgresosToObjetivos with fuzzy matching"
  ```

---

## Task 3 — Modify `adoptarPropuesta` to return `allObjetivos`

**Files:**
- Modify: `src/modules/planificacion/api/curriculoApi.js`

- [ ] **Step 1: Read the current `adoptarPropuesta` implementation**

  Read `src/modules/planificacion/api/curriculoApi.js`.
  Find the `adoptarPropuesta` function (around line 142). Note that it currently ends with
  `return curriculo` (returns the row directly).

- [ ] **Step 2: Modify `adoptarPropuesta` to collect and return `allObjetivos`**

  Replace the body of `adoptarPropuesta` (from `// Step 1` down to and including `return curriculo`):

  ```js
  export async function adoptarPropuesta({ instrumento, nivel, descripcion, pilares }) {
    if (!instrumento || instrumento.trim() === '') {
      throw new Error('El instrumento es obligatorio para crear el plan.')
    }
    if (!pilares || pilares.length === 0) {
      throw new Error('La propuesta debe tener al menos un pilar.')
    }

    // Step 1: create curriculo
    const curriculo = await crearCurriculo({
      instrumento: instrumento.trim(),
      nivel: nivel?.trim() || '',
      descripcion: descripcion?.trim() || 'Plan generado por IA',
    })

    // Step 2: create pilares and their objetivos in order; collect all objetivos
    const allObjetivos = []

    for (let i = 0; i < pilares.length; i++) {
      const pilarData = pilares[i]
      const pilar = await crearPilar(curriculo.id, pilarData.nombre || `Pilar ${i + 1}`, i)

      const objetivos = pilarData.objetivos || []
      for (let j = 0; j < objetivos.length; j++) {
        const objetivo = await crearObjetivo(pilar.id, objetivos[j].descripcion || `Objetivo ${j + 1}`, j)
        allObjetivos.push({ id: objetivo.id, descripcion: objetivo.descripcion })
      }
    }

    return { curriculo, allObjetivos }
  }
  ```

- [ ] **Step 3: Verify export count and no syntax errors**

  ```bash
  grep "^export async function\|^export function" src/modules/planificacion/api/curriculoApi.js
  ```

  Expected: `obtenerCurriculo`, `listarCurriculos`, `crearCurriculo`, `actualizarCurriculo`,
  `toggleActivoCurriculo`, `crearPilar`, `actualizarPilar`, `eliminarPilar`, `crearObjetivo`,
  `actualizarObjetivo`, `eliminarObjetivo`, `adoptarPropuesta` — 12 lines.

- [ ] **Step 4: Commit**

  ```bash
  git add src/modules/planificacion/api/curriculoApi.js
  git commit -m "feat(curriculo): adoptarPropuesta returns { curriculo, allObjetivos }"
  ```

---

## Task 4 — Update `onAdopt` callback in asistenciaView.js

**Files:**
- Modify: `src/portal-maestros/views/asistenciaView.js`

- [ ] **Step 1: Find the `onAdopt` callback and the `linkProgresosToObjetivos` import site**

  ```bash
  grep -n "adoptarPropuesta\|linkProgresosToObjetivos\|onAdopt" src/portal-maestros/views/asistenciaView.js | head -20
  ```

  Note the line numbers for:
  1. The import of `adoptarPropuesta` (or the full import block from `curriculoApi`)
  2. The `onAdopt:` callback definition

- [ ] **Step 2: Add `linkProgresosToObjetivos` to the import from progressAggregatorService**

  Find the existing import line that imports from `progressAggregatorService.js`. It currently
  imports `saveProgressFromAI` and `saveProgressFromDSL`. Add `linkProgresosToObjetivos`.

  Old import line (approximate):
  ```js
  import { saveProgressFromAI, saveProgressFromDSL } from '../services/progressAggregatorService.js'
  ```

  New import line:
  ```js
  import { saveProgressFromAI, saveProgressFromDSL, linkProgresosToObjetivos } from '../services/progressAggregatorService.js'
  ```

- [ ] **Step 3: Update the `onAdopt` callback**

  Find the `onAdopt:` block. It currently calls `await adoptarPropuesta(...)` and shows a success
  toast. Replace the body:

  Old body (approximate — match what's actually in the file):
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

  New body:
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

  **Important:** `claseId` must be in scope. Search above the `onAdopt` definition for where
  `claseId` is set (it's from the outer render context — something like `const claseId = clase.id`
  or a parameter). It is already in scope from the existing code — do NOT change its declaration.

- [ ] **Step 4: Verify imports are consistent**

  ```bash
  grep -n "progressAggregatorService\|curriculoApi" src/portal-maestros/views/asistenciaView.js | head -10
  ```

  Expected: one import line per file, with `linkProgresosToObjetivos` now present in the
  progressAggregatorService import.

- [ ] **Step 5: Commit**

  ```bash
  git add src/portal-maestros/views/asistenciaView.js
  git commit -m "feat(asistencia): link progresos to objetivos on curriculum adopt"
  ```

---

## Task 5 — Manual end-to-end smoke test

No automated test framework is wired in this project. Perform a manual smoke test.

- [ ] **Step 1: Confirm migration file exists and is correct**

  ```bash
  cat supabase/migrations/20260525_fix_progresos_objetivo_fk.sql
  ```

  Confirm the DROP CONSTRAINT and ADD CONSTRAINT lines are present.

- [ ] **Step 2: Confirm 3 exports in progressAggregatorService**

  ```bash
  grep "^export async function" src/portal-maestros/services/progressAggregatorService.js
  ```

  Expected output: exactly 3 lines with `saveProgressFromAI`, `saveProgressFromDSL`, `linkProgresosToObjetivos`.

- [ ] **Step 3: Confirm `adoptarPropuesta` returns `{ curriculo, allObjetivos }`**

  ```bash
  grep -A 5 "return {" src/modules/planificacion/api/curriculoApi.js
  ```

  Expected: `return { curriculo, allObjetivos }` line visible.

- [ ] **Step 4: Confirm import in asistenciaView includes `linkProgresosToObjetivos`**

  ```bash
  grep "linkProgresosToObjetivos" src/portal-maestros/views/asistenciaView.js
  ```

  Expected: 2 lines — one import, one usage inside `onAdopt`.

- [ ] **Step 5: Final commit (if any last fixes needed)**

  If everything looks correct, no additional commit needed. If you made any fixes during
  smoke test, commit them:

  ```bash
  git add -p
  git commit -m "fix(phase3): smoke test corrections"
  ```

---

## Summary of All Files Changed

| File | Change |
|------|--------|
| `supabase/migrations/20260525_fix_progresos_objetivo_fk.sql` | **Created** — fixes FK |
| `src/portal-maestros/services/progressAggregatorService.js` | **Modified** — adds `linkProgresosToObjetivos` |
| `src/modules/planificacion/api/curriculoApi.js` | **Modified** — `adoptarPropuesta` returns `{ curriculo, allObjetivos }` |
| `src/portal-maestros/views/asistenciaView.js` | **Modified** — `onAdopt` calls linking, shows combined toast |
