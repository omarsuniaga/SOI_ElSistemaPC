# Academic Module Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Enable teachers to record structured observations via DSL, evaluate students per indicator with a semaphore-powered route tree, and view individual student progress — all from the attendance view.

**Architecture:** Extend the existing DSL pipeline (dslParser → dslEditor → dslToolbar → AutocompletePopup) with `/nota` resolution and `#todos` expansion. Add a collapsible route tree component above the editor in asistenciaView. Extend alumnoPerfilView with evaluation history timeline. Add auto-draft via debounced Supabase writes.

**Tech Stack:** Vanilla JS ES modules, Supabase JS v2 + PostgREST, Vitest, existing CSS design system (`--pm-*` variables).

**Spec:** `docs/superpowers/specs/2026-05-07-academic-module-design.md`

---

## File Structure

### New Files

| File | Responsibility |
|------|----------------|
| `src/portal-maestros/services/evaluationService.js` | Resolve DSL → evaluations, persist to Supabase, calculate semaphore |
| `src/portal-maestros/services/autoDraftService.js` | Debounced auto-save of observation drafts |
| `src/portal-maestros/components/routeTreeBar.js` | Collapsible route tree with semaphore badges |
| `src/portal-maestros/components/studentProgressPanel.js` | Lateral panel with student route map + evaluation timeline |
| `tests/portal-maestros/evaluationService.test.js` | Tests for DSL resolution, #todos expansion, precedence rules |
| `tests/portal-maestros/dslParserAcademic.test.js` | Tests for new /nota token and #todos token in parser |
| `tests/portal-maestros/routeTreeBar.test.js` | Tests for semaphore calculation and tree state |
| `tests/portal-maestros/autoDraftService.test.js` | Tests for debounce, UPSERT, recovery |

### Modified Files

| File | Changes |
|------|---------|
| `src/portal-maestros/utils/dslParser.js` | Add `/N` nota token to TOKEN_PATTERNS, update parseDSL to extract nota per block |
| `src/portal-maestros/services/catalogService.js` | Add `getIndicadoresByNodo()` with semaphore data, add `getRouteTree()` for full tree |
| `src/portal-maestros/views/asistenciaView.js` | Integrate routeTreeBar above editor, wire save button to evaluationService, add student tap → progress panel |
| `src/portal-maestros/views/alumnoPerfilView.js` | Add evaluation history timeline, route map with individual semaphore |
| `src/portal-maestros/views/metricasView.js` | Add student search → navigate to alumnoPerfilView |
| `src/portal-maestros/components/dslEditor.js` | Wire `#todos` autocomplete trigger, pass presentes context |
| `src/portal-maestros/services/aiService.js` | Add `structureDSL()` method for text→DSL conversion, add `validateCompleteness()` |
| `src/portal-maestros/styles/portal.css` | Add route tree styles, semaphore badges, progress panel styles |

---

## Task 1: Database — Create `indicadores` table

**Files:**
- Create: `supabase/migrations/20260507_create_indicadores.sql`

- [ ] **Step 1: Write the migration SQL**

```sql
-- supabase/migrations/20260507_create_indicadores.sql
CREATE TABLE IF NOT EXISTS indicadores (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nodo_id uuid NOT NULL REFERENCES nodos(id) ON DELETE CASCADE,
  nombre text NOT NULL,
  descripcion text,
  orden smallint NOT NULL DEFAULT 0,
  activo boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_indicadores_nodo ON indicadores(nodo_id);

-- RLS: maestros can read indicators for routes they teach
ALTER TABLE indicadores ENABLE ROW LEVEL SECURITY;

CREATE POLICY "indicadores_select_all" ON indicadores
  FOR SELECT USING (true);

COMMENT ON TABLE indicadores IS 'Evaluation indicators, children of academic nodes. Each node has N indicators that teachers evaluate per student.';
```

- [ ] **Step 2: Apply migration via Supabase MCP**

Run the SQL via the Supabase MCP `execute_sql` tool against project `zmhmdvmyeyswunurcyow`.

- [ ] **Step 3: Verify table exists**

Run: `SELECT count(*) FROM indicadores;` — Expected: 0 rows, no error.

- [ ] **Step 4: Commit**

```bash
git add supabase/migrations/20260507_create_indicadores.sql
git commit -m "feat: create indicadores table for academic evaluation"
```

---

## Task 2: Database — Create `evaluaciones` table

**Files:**
- Create: `supabase/migrations/20260507_create_evaluaciones.sql`

- [ ] **Step 1: Write the migration SQL**

```sql
-- supabase/migrations/20260507_create_evaluaciones.sql
CREATE TABLE IF NOT EXISTS evaluaciones (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sesion_id uuid NOT NULL REFERENCES sesiones(id) ON DELETE CASCADE,
  indicador_id uuid NOT NULL REFERENCES indicadores(id) ON DELETE CASCADE,
  alumno_id uuid NOT NULL REFERENCES alumnos(id) ON DELETE CASCADE,
  nota smallint NOT NULL CHECK (nota BETWEEN 1 AND 5),
  observacion text,
  tarea text,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(sesion_id, indicador_id, alumno_id)
);

CREATE INDEX idx_evaluaciones_sesion ON evaluaciones(sesion_id);
CREATE INDEX idx_evaluaciones_indicador ON evaluaciones(indicador_id);
CREATE INDEX idx_evaluaciones_alumno ON evaluaciones(alumno_id);
CREATE INDEX idx_evaluaciones_alumno_indicador ON evaluaciones(alumno_id, indicador_id);

ALTER TABLE evaluaciones ENABLE ROW LEVEL SECURITY;

CREATE POLICY "evaluaciones_select_maestro" ON evaluaciones
  FOR SELECT USING (true);

CREATE POLICY "evaluaciones_insert_maestro" ON evaluaciones
  FOR INSERT WITH CHECK (true);

CREATE POLICY "evaluaciones_update_maestro" ON evaluaciones
  FOR UPDATE USING (true);

COMMENT ON TABLE evaluaciones IS 'Per-student evaluation of an indicator within a session. nota 1-5, with optional observation and task.';
```

- [ ] **Step 2: Apply migration via Supabase MCP**

Run the SQL via the Supabase MCP `execute_sql` tool against project `zmhmdvmyeyswunurcyow`.

- [ ] **Step 3: Verify table exists**

Run: `SELECT count(*) FROM evaluaciones;` — Expected: 0 rows, no error.

- [ ] **Step 4: Commit**

```bash
git add supabase/migrations/20260507_create_evaluaciones.sql
git commit -m "feat: create evaluaciones table for student indicator grades"
```

---

## Task 3: Database — Create `observaciones_sesion` table

**Files:**
- Create: `supabase/migrations/20260507_create_observaciones_sesion.sql`

- [ ] **Step 1: Write the migration SQL**

```sql
-- supabase/migrations/20260507_create_observaciones_sesion.sql
CREATE TABLE IF NOT EXISTS observaciones_sesion (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sesion_id uuid NOT NULL REFERENCES sesiones(id) ON DELETE CASCADE,
  maestro_id uuid NOT NULL REFERENCES maestros(id) ON DELETE CASCADE,
  contenido_raw text NOT NULL DEFAULT '',
  contenido_parsed jsonb,
  es_borrador boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_obs_sesion ON observaciones_sesion(sesion_id);
CREATE INDEX idx_obs_maestro ON observaciones_sesion(maestro_id);
CREATE INDEX idx_obs_borrador ON observaciones_sesion(sesion_id, es_borrador) WHERE es_borrador = true;

ALTER TABLE observaciones_sesion ENABLE ROW LEVEL SECURITY;

CREATE POLICY "obs_select_maestro" ON observaciones_sesion
  FOR SELECT USING (true);

CREATE POLICY "obs_insert_maestro" ON observaciones_sesion
  FOR INSERT WITH CHECK (true);

CREATE POLICY "obs_update_maestro" ON observaciones_sesion
  FOR UPDATE USING (true);

CREATE POLICY "obs_delete_maestro" ON observaciones_sesion
  FOR DELETE USING (es_borrador = true);

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER observaciones_sesion_updated_at
  BEFORE UPDATE ON observaciones_sesion
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

COMMENT ON TABLE observaciones_sesion IS 'Raw DSL observations per session. es_borrador=true for auto-drafts, false for confirmed saves.';
```

- [ ] **Step 2: Apply migration via Supabase MCP**

Run the SQL via the Supabase MCP `execute_sql` tool against project `zmhmdvmyeyswunurcyow`.

- [ ] **Step 3: Verify table and trigger**

Run: `SELECT count(*) FROM observaciones_sesion;` — Expected: 0 rows.
Run: `SELECT tgname FROM pg_trigger WHERE tgrelid = 'observaciones_sesion'::regclass;` — Expected: `observaciones_sesion_updated_at`.

- [ ] **Step 4: Commit**

```bash
git add supabase/migrations/20260507_create_observaciones_sesion.sql
git commit -m "feat: create observaciones_sesion table with auto-draft support"
```

---

## Task 4: Extend DSL Parser — Add `/N` nota token and `#todos` keyword

**Files:**
- Modify: `src/portal-maestros/utils/dslParser.js`
- Create: `tests/portal-maestros/dslParserAcademic.test.js`

- [ ] **Step 1: Write failing tests for new tokens**

```javascript
// tests/portal-maestros/dslParserAcademic.test.js
import { describe, it, expect } from 'vitest'
import { parseDSL } from '../../src/portal-maestros/utils/dslParser.js'

describe('DSL Parser — Academic extensions', () => {

  describe('/N nota token', () => {
    it('should extract nota from /N syntax', () => {
      const result = parseDSL('#Isabella [Agarre del arco] /4')
      expect(result.calificacion).toBe(4)
    })

    it('should extract nota /1 through /5', () => {
      for (let n = 1; n <= 5; n++) {
        const result = parseDSL(`#todos /\${n}`)
        expect(result.calificacion).toBe(n)
      }
    })

    it('should ignore /0 and /6 as invalid', () => {
      const r0 = parseDSL('#todos /0')
      expect(r0.calificacion).toBeNull()
      const r6 = parseDSL('#todos /6')
      expect(r6.calificacion).toBeNull()
    })
  })

  describe('#todos keyword', () => {
    it('should detect #todos as a special alumno token', () => {
      const result = parseDSL('#todos [Postura de Pie] /3')
      expect(result.alumnos).toContain('todos')
    })

    it('should include #todos alongside specific names', () => {
      const result = parseDSL('#todos /2 #Isabella /4')
      expect(result.alumnos).toContain('todos')
      expect(result.alumnos).toContain('Isabella')
    })
  })

  describe('multi-line block parsing', () => {
    it('should parse multi-line observation into blocks', () => {
      const text = '#todos [Agarre del arco] /2\n#Isabella #Martin /4 (mejor presión) {practicar espejo 10min}'
      const result = parseDSL(text)
      expect(result.alumnos).toContain('todos')
      expect(result.alumnos).toContain('Isabella')
      expect(result.alumnos).toContain('Martin')
      expect(result.contenido).toContain('Agarre del arco')
      expect(result.sugerencias).toContain('mejor presión')
      expect(result.tareas).toContain('practicar espejo 10min')
    })
  })
})
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run tests/portal-maestros/dslParserAcademic.test.js`
Expected: FAIL — calificacion extraction may partially work (existing parser has `/N` as `calificacion`) but `#todos` as special keyword likely not handled.

- [ ] **Step 3: Update dslParser.js — ensure /N extracts 1-5 and #todos is recognized**

Open `src/portal-maestros/utils/dslParser.js` and make these changes:

In the `TOKEN_PATTERNS` object, verify the calificacion pattern covers `/1` through `/5`:
```javascript
// Existing pattern should already match /N/5 or /N — verify it extracts the number
// If the existing pattern is: /(\d+)\/5/g or similar, update to also match bare /N:
calificacion: /\/([1-5])(?:\/5)?/g,
```

In `parseDSL()`, ensure `calificacion` returns null for values outside 1-5:
```javascript
// After extracting calificacion matches:
const notaMatch = text.match(/\/([1-5])(?:\/5)?/)
parsed.calificacion = notaMatch ? parseInt(notaMatch[1], 10) : null
```

For `#todos`, no parser change needed — `#todos` naturally gets extracted as alumno "todos" by the existing `#(\w+)` pattern. Verify this works.

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx vitest run tests/portal-maestros/dslParserAcademic.test.js`
Expected: ALL PASS

- [ ] **Step 5: Commit**

```bash
git add src/portal-maestros/utils/dslParser.js tests/portal-maestros/dslParserAcademic.test.js
git commit -m "feat: extend DSL parser with /N nota validation and #todos keyword"
```

---

## Task 5: Evaluation Service — Resolve DSL to evaluations

**Files:**
- Create: `src/portal-maestros/services/evaluationService.js`
- Create: `tests/portal-maestros/evaluationService.test.js`

- [ ] **Step 1: Write failing tests for DSL resolution**

```javascript
// tests/portal-maestros/evaluationService.test.js
import { describe, it, expect, vi } from 'vitest'
import { resolveDSL, expandTodos } from '../../src/portal-maestros/services/evaluationService.js'

const PRESENTES = [
  { id: 'a1', nombre_completo: 'Isabella Rodríguez' },
  { id: 'a2', nombre_completo: 'Martin López' },
  { id: 'a3', nombre_completo: 'Pedro García' },
  { id: 'a4', nombre_completo: 'Ana Martínez' },
]

describe('expandTodos', () => {
  it('should replace #todos with all presentes not individually mentioned', () => {
    const blocks = [
      { alumnos: ['todos'], nota: 2, observacion: null, tarea: null },
      { alumnos: ['Isabella'], nota: 4, observacion: 'mejor presión', tarea: 'practicar espejo 10min' },
    ]
    const result = expandTodos(blocks, PRESENTES)
    // Isabella gets 4 (specific), Martin/Pedro/Ana get 2 (#todos)
    expect(result).toHaveLength(4)
    expect(result.find(e => e.alumno_id === 'a1').nota).toBe(4)
    expect(result.find(e => e.alumno_id === 'a2').nota).toBe(2)
    expect(result.find(e => e.alumno_id === 'a3').nota).toBe(2)
    expect(result.find(e => e.alumno_id === 'a4').nota).toBe(2)
  })

  it('should give specific mention precedence over #todos regardless of order', () => {
    const blocks = [
      { alumnos: ['Martin'], nota: 5, observacion: null, tarea: null },
      { alumnos: ['todos'], nota: 3, observacion: null, tarea: null },
    ]
    const result = expandTodos(blocks, PRESENTES)
    expect(result.find(e => e.alumno_id === 'a2').nota).toBe(5) // Martin keeps 5
    expect(result.find(e => e.alumno_id === 'a3').nota).toBe(3) // Pedro gets 3
  })

  it('should return only mentioned students when no #todos', () => {
    const blocks = [
      { alumnos: ['Isabella', 'Martin'], nota: 4, observacion: null, tarea: null },
    ]
    const result = expandTodos(blocks, PRESENTES)
    expect(result).toHaveLength(2)
  })
})

describe('resolveDSL', () => {
  it('should parse raw text and return resolved evaluations', () => {
    const raw = '#todos [Agarre del arco] /2\n#Isabella /4 (mejor presión) {practicar espejo}'
    const indicadorId = 'ind-001'
    const result = resolveDSL(raw, indicadorId, PRESENTES)

    expect(result.indicador_id).toBe('ind-001')
    expect(result.evaluaciones).toHaveLength(4)
    expect(result.evaluaciones.find(e => e.alumno_id === 'a1').nota).toBe(4)
    expect(result.evaluaciones.find(e => e.alumno_id === 'a1').tarea).toBe('practicar espejo')
    expect(result.evaluaciones.find(e => e.alumno_id === 'a3').nota).toBe(2)
  })

  it('should detect missing students when no #todos and not all mentioned', () => {
    const raw = '#Isabella /4'
    const result = resolveDSL(raw, 'ind-001', PRESENTES)
    expect(result.missing).toEqual(['Martin López', 'Pedro García', 'Ana Martínez'])
  })

  it('should return empty missing when #todos covers everyone', () => {
    const raw = '#todos /3'
    const result = resolveDSL(raw, 'ind-001', PRESENTES)
    expect(result.missing).toEqual([])
  })
})
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run tests/portal-maestros/evaluationService.test.js`
Expected: FAIL — module does not exist yet.

- [ ] **Step 3: Implement evaluationService.js**

```javascript
// src/portal-maestros/services/evaluationService.js
import { parseDSL } from '../utils/dslParser.js'
import { getClient } from '../../lib/supabaseClient.js'

/**
 * Parse raw DSL text into evaluation blocks.
 * Each line can have: #alumnos [indicador] /nota (obs) {tarea}
 * Returns array of { alumnos: string[], nota, observacion, tarea }
 */
export function parseToBlocks(raw) {
  const lines = raw.split('\n').filter(l => l.trim())
  const blocks = []

  for (const line of lines) {
    const parsed = parseDSL(line)
    if (parsed.alumnos.length === 0 && parsed.calificacion === null) continue

    blocks.push({
      alumnos: parsed.alumnos.map(a => a.toLowerCase()),
      nota: parsed.calificacion,
      observacion: parsed.sugerencias.length > 0 ? parsed.sugerencias.join('; ') : null,
      tarea: parsed.tareas.length > 0 ? parsed.tareas.join('; ') : null,
    })
  }
  return blocks
}

/**
 * Expand #todos and resolve precedence.
 * Specific mentions ALWAYS win over #todos.
 * Returns flat array of { alumno_id, nota, observacion, tarea }
 */
export function expandTodos(blocks, presentes) {
  // First pass: collect specific (non-todos) evaluations
  const specific = new Map() // alumno_id → { nota, observacion, tarea }
  const todosBlock = { nota: null, observacion: null, tarea: null }
  let hasTodos = false

  for (const block of blocks) {
    const isTodos = block.alumnos.includes('todos')
    if (isTodos) {
      hasTodos = true
      todosBlock.nota = block.nota
      todosBlock.observacion = block.observacion
      todosBlock.tarea = block.tarea
      continue
    }
    // Match alumno names to presentes
    for (const nombreRaw of block.alumnos) {
      const match = presentes.find(p =>
        p.nombre_completo.toLowerCase().includes(nombreRaw)
      )
      if (match) {
        specific.set(match.id, {
          alumno_id: match.id,
          nota: block.nota,
          observacion: block.observacion,
          tarea: block.tarea,
        })
      }
    }
  }

  const result = []

  if (hasTodos) {
    // Everyone gets todosBlock unless they have a specific override
    for (const alumno of presentes) {
      if (specific.has(alumno.id)) {
        result.push(specific.get(alumno.id))
      } else {
        result.push({
          alumno_id: alumno.id,
          nota: todosBlock.nota,
          observacion: todosBlock.observacion,
          tarea: todosBlock.tarea,
        })
      }
    }
  } else {
    // Only mentioned students
    for (const entry of specific.values()) {
      result.push(entry)
    }
  }

  return result
}

/**
 * Full DSL resolution: parse → expand → detect missing.
 */
export function resolveDSL(raw, indicadorId, presentes) {
  const blocks = parseToBlocks(raw)
  const evaluaciones = expandTodos(blocks, presentes)

  const evaluatedIds = new Set(evaluaciones.map(e => e.alumno_id))
  const missing = presentes
    .filter(p => !evaluatedIds.has(p.id))
    .map(p => p.nombre_completo)

  return {
    indicador_id: indicadorId,
    evaluaciones,
    missing,
  }
}

/**
 * Persist evaluations to Supabase (UPSERT by sesion+indicador+alumno).
 */
export async function saveEvaluaciones(sesionId, indicadorId, evaluaciones) {
  const supabase = getClient()
  const rows = evaluaciones.map(e => ({
    sesion_id: sesionId,
    indicador_id: indicadorId,
    alumno_id: e.alumno_id,
    nota: e.nota,
    observacion: e.observacion,
    tarea: e.tarea,
  }))

  const { data, error } = await supabase
    .from('evaluaciones')
    .upsert(rows, { onConflict: 'sesion_id,indicador_id,alumno_id' })
    .select()

  if (error) throw new Error(`Error saving evaluaciones: ${error.message}`)
  return data
}

/**
 * Calculate semaphore for an indicator within a class.
 * Returns 'green' | 'yellow' | 'gray'
 */
export function calculateSemaphore(evaluaciones, totalAlumnos) {
  if (!evaluaciones || evaluaciones.length === 0) return 'gray'
  const allAbove4 = evaluaciones.length === totalAlumnos &&
    evaluaciones.every(e => e.nota >= 4)
  return allAbove4 ? 'green' : 'yellow'
}

/**
 * Get semaphore data for all indicators of a node, for a given class.
 */
export async function getSemaphoreForNode(nodoId, claseId) {
  const supabase = getClient()

  // Get indicators for this node
  const { data: indicadores } = await supabase
    .from('indicadores')
    .select('id, nombre, orden')
    .eq('nodo_id', nodoId)
    .eq('activo', true)
    .order('orden')

  if (!indicadores || indicadores.length === 0) return []

  // Get all evaluations for these indicators in sessions of this class
  const indicadorIds = indicadores.map(i => i.id)
  const { data: evaluaciones } = await supabase
    .from('evaluaciones')
    .select('indicador_id, alumno_id, nota')
    .in('indicador_id', indicadorIds)

  // Get enrolled student count
  const { count: totalAlumnos } = await supabase
    .from('alumnos_clases')
    .select('*', { count: 'exact', head: true })
    .eq('clase_id', claseId)
    .eq('activo', true)

  // Group evaluations by indicator
  const evalsByIndicador = {}
  for (const e of (evaluaciones || [])) {
    if (!evalsByIndicador[e.indicador_id]) evalsByIndicador[e.indicador_id] = []
    evalsByIndicador[e.indicador_id].push(e)
  }

  return indicadores.map(ind => ({
    id: ind.id,
    nombre: ind.nombre,
    orden: ind.orden,
    semaphore: calculateSemaphore(evalsByIndicador[ind.id] || [], totalAlumnos),
    evaluatedCount: (evalsByIndicador[ind.id] || []).length,
    totalAlumnos,
  }))
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx vitest run tests/portal-maestros/evaluationService.test.js`
Expected: ALL PASS

- [ ] **Step 5: Commit**

```bash
git add src/portal-maestros/services/evaluationService.js tests/portal-maestros/evaluationService.test.js
git commit -m "feat: add evaluationService with DSL resolution, #todos expansion, and semaphore calculation"
```

---

## Task 6: Auto-Draft Service

**Files:**
- Create: `src/portal-maestros/services/autoDraftService.js`
- Create: `tests/portal-maestros/autoDraftService.test.js`

- [ ] **Step 1: Write failing tests**

```javascript
// tests/portal-maestros/autoDraftService.test.js
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { createAutoDraft } from '../../src/portal-maestros/services/autoDraftService.js'

describe('AutoDraft Service', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })
  afterEach(() => {
    vi.useRealTimers()
  })

  it('should call saveFn after 30s of inactivity', async () => {
    const saveFn = vi.fn().mockResolvedValue({ id: 'draft-1' })
    const draft = createAutoDraft({ saveFn, debounceMs: 30000 })

    draft.onInput('hello')
    expect(saveFn).not.toHaveBeenCalled()

    vi.advanceTimersByTime(30000)
    await vi.runAllTimersAsync()

    expect(saveFn).toHaveBeenCalledWith('hello')
  })

  it('should reset timer on each input', async () => {
    const saveFn = vi.fn().mockResolvedValue({ id: 'draft-1' })
    const draft = createAutoDraft({ saveFn, debounceMs: 30000 })

    draft.onInput('he')
    vi.advanceTimersByTime(20000)
    draft.onInput('hello')
    vi.advanceTimersByTime(20000)
    expect(saveFn).not.toHaveBeenCalled()

    vi.advanceTimersByTime(10000)
    await vi.runAllTimersAsync()
    expect(saveFn).toHaveBeenCalledWith('hello')
  })

  it('should not save empty content', () => {
    const saveFn = vi.fn()
    const draft = createAutoDraft({ saveFn, debounceMs: 30000 })

    draft.onInput('')
    vi.advanceTimersByTime(30000)
    expect(saveFn).not.toHaveBeenCalled()
  })

  it('should expose destroy to cancel pending timer', () => {
    const saveFn = vi.fn()
    const draft = createAutoDraft({ saveFn, debounceMs: 30000 })

    draft.onInput('hello')
    draft.destroy()
    vi.advanceTimersByTime(30000)
    expect(saveFn).not.toHaveBeenCalled()
  })
})
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run tests/portal-maestros/autoDraftService.test.js`
Expected: FAIL — module does not exist.

- [ ] **Step 3: Implement autoDraftService.js**

```javascript
// src/portal-maestros/services/autoDraftService.js
import { getClient } from '../../lib/supabaseClient.js'

const DEFAULT_DEBOUNCE_MS = 30000 // 30 seconds

/**
 * Create an auto-draft manager for observation text.
 * Saves draft to Supabase after debounceMs of inactivity.
 */
export function createAutoDraft({ saveFn, debounceMs = DEFAULT_DEBOUNCE_MS } = {}) {
  let _timer = null
  let _lastContent = ''
  let _onSaved = null

  function onInput(content) {
    _lastContent = content
    if (_timer) clearTimeout(_timer)
    if (!content || !content.trim()) return

    _timer = setTimeout(async () => {
      try {
        const result = await saveFn(content)
        if (_onSaved) _onSaved(result)
      } catch (err) {
        console.error('[AutoDraft] Save error:', err)
      }
    }, debounceMs)
  }

  function destroy() {
    if (_timer) clearTimeout(_timer)
    _timer = null
  }

  function onSaved(callback) {
    _onSaved = callback
  }

  return { onInput, destroy, onSaved }
}

/**
 * Save/update draft in observaciones_sesion table.
 * UPSERT: one active draft per sesion_id.
 */
export async function saveDraft(sesionId, maestroId, contenidoRaw) {
  const supabase = getClient()

  // Check for existing draft
  const { data: existing } = await supabase
    .from('observaciones_sesion')
    .select('id')
    .eq('sesion_id', sesionId)
    .eq('maestro_id', maestroId)
    .eq('es_borrador', true)
    .limit(1)
    .maybeSingle()

  if (existing) {
    const { data, error } = await supabase
      .from('observaciones_sesion')
      .update({ contenido_raw: contenidoRaw })
      .eq('id', existing.id)
      .select()
      .single()
    if (error) throw error
    return data
  }

  const { data, error } = await supabase
    .from('observaciones_sesion')
    .insert({
      sesion_id: sesionId,
      maestro_id: maestroId,
      contenido_raw: contenidoRaw,
      es_borrador: true,
    })
    .select()
    .single()
  if (error) throw error
  return data
}

/**
 * Load existing draft for a session.
 * Returns { id, contenido_raw, updated_at } or null.
 */
export async function loadDraft(sesionId, maestroId) {
  const supabase = getClient()
  const { data } = await supabase
    .from('observaciones_sesion')
    .select('id, contenido_raw, updated_at')
    .eq('sesion_id', sesionId)
    .eq('maestro_id', maestroId)
    .eq('es_borrador', true)
    .limit(1)
    .maybeSingle()
  return data || null
}

/**
 * Discard a draft.
 */
export async function discardDraft(draftId) {
  const supabase = getClient()
  const { error } = await supabase
    .from('observaciones_sesion')
    .delete()
    .eq('id', draftId)
  if (error) throw error
}

/**
 * Save final observation (mark borrador = false).
 */
export async function saveObservation(sesionId, maestroId, contenidoRaw, contenidoParsed) {
  const supabase = getClient()

  // Delete any active draft for this session
  await supabase
    .from('observaciones_sesion')
    .delete()
    .eq('sesion_id', sesionId)
    .eq('maestro_id', maestroId)
    .eq('es_borrador', true)

  // Insert final observation
  const { data, error } = await supabase
    .from('observaciones_sesion')
    .insert({
      sesion_id: sesionId,
      maestro_id: maestroId,
      contenido_raw: contenidoRaw,
      contenido_parsed: contenidoParsed,
      es_borrador: false,
    })
    .select()
    .single()
  if (error) throw error
  return data
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx vitest run tests/portal-maestros/autoDraftService.test.js`
Expected: ALL PASS

- [ ] **Step 5: Commit**

```bash
git add src/portal-maestros/services/autoDraftService.js tests/portal-maestros/autoDraftService.test.js
git commit -m "feat: add autoDraftService with debounced save and draft recovery"
```

---

## Task 7: Route Tree Bar Component

**Files:**
- Create: `src/portal-maestros/components/routeTreeBar.js`
- Create: `tests/portal-maestros/routeTreeBar.test.js`

- [ ] **Step 1: Write failing tests for semaphore and tree rendering**

```javascript
// tests/portal-maestros/routeTreeBar.test.js
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { calculateSemaphore } from '../../src/portal-maestros/services/evaluationService.js'

describe('Route Tree — Semaphore Calculation', () => {
  it('should return gray when no evaluations', () => {
    expect(calculateSemaphore([], 12)).toBe('gray')
  })

  it('should return green when all students >= 4', () => {
    const evals = [
      { nota: 4 }, { nota: 5 }, { nota: 4 }, { nota: 5 },
    ]
    expect(calculateSemaphore(evals, 4)).toBe('green')
  })

  it('should return yellow when some evaluated but not all >= 4', () => {
    const evals = [
      { nota: 4 }, { nota: 3 }, { nota: 5 },
    ]
    expect(calculateSemaphore(evals, 4)).toBe('yellow')
  })

  it('should return yellow when all >= 4 but not all students evaluated', () => {
    const evals = [{ nota: 5 }, { nota: 4 }]
    expect(calculateSemaphore(evals, 4)).toBe('yellow')
  })
})
```

- [ ] **Step 2: Run tests to verify they pass (semaphore already implemented in Task 5)**

Run: `npx vitest run tests/portal-maestros/routeTreeBar.test.js`
Expected: PASS (calculateSemaphore was already implemented)

- [ ] **Step 3: Implement routeTreeBar component**

```javascript
// src/portal-maestros/components/routeTreeBar.js
import { getClient } from '../../lib/supabaseClient.js'
import { getSemaphoreForNode } from '../services/evaluationService.js'

const SEMAPHORE_ICONS = {
  green: '🟢',
  yellow: '🟡',
  gray: '⚫',
}

const SEMAPHORE_COLORS = {
  green: '#22c55e',
  yellow: '#eab308',
  gray: '#334155',
}

/**
 * Create a collapsible route tree bar component.
 *
 * @param {HTMLElement} container - Parent element
 * @param {Object} opts
 * @param {string} opts.claseId - Active class ID
 * @param {string} opts.rutaId - Route ID for this class instrument
 * @param {Function} opts.onIndicadorSelect - Called with { id, nombre } when user taps an indicator
 * @returns {{ refresh(), destroy(), getActiveIndicador() }}
 */
export function createRouteTreeBar(container, { claseId, rutaId, onIndicadorSelect }) {
  let _expanded = false
  let _tree = null // { niveles: [{ id, nombre, nodos: [{ id, nombre, indicadores: [...] }] }] }
  let _activeIndicadorId = null
  let _el = null

  async function _loadTree() {
    const supabase = getClient()

    // Load full tree: niveles → nodos → indicadores with semaphore
    const { data: niveles } = await supabase
      .from('niveles')
      .select('id, nombre, orden, bloques!inner(ruta_id)')
      .eq('bloques.ruta_id', rutaId)
      .order('orden')

    if (!niveles || niveles.length === 0) return null

    const tree = { niveles: [] }

    for (const nivel of niveles) {
      const { data: nodos } = await supabase
        .from('nodos')
        .select('id, nombre, orden')
        .eq('nivel_id', nivel.id)
        .order('orden')

      const nodosWithIndicadores = []
      for (const nodo of (nodos || [])) {
        const indicadores = await getSemaphoreForNode(nodo.id, claseId)
        nodosWithIndicadores.push({ ...nodo, indicadores })
      }

      tree.niveles.push({
        id: nivel.id,
        nombre: nivel.nombre,
        orden: nivel.orden,
        nodos: nodosWithIndicadores,
      })
    }

    return tree
  }

  function _getSugerido() {
    if (!_tree) return null
    for (const nivel of _tree.niveles) {
      for (const nodo of nivel.nodos) {
        for (const ind of nodo.indicadores) {
          if (ind.semaphore === 'gray') return ind
        }
      }
    }
    return null
  }

  function _isNivelLocked(nivelIndex) {
    if (nivelIndex === 0) return false
    const prevNivel = _tree.niveles[nivelIndex - 1]
    let totalIndicadores = 0
    let greenCount = 0
    for (const nodo of prevNivel.nodos) {
      for (const ind of nodo.indicadores) {
        totalIndicadores++
        if (ind.semaphore === 'green') greenCount++
      }
    }
    return totalIndicadores === 0 || (greenCount / totalIndicadores) < 0.8
  }

  function _renderCollapsed() {
    const sugerido = _getSugerido()
    const breadcrumb = sugerido ? sugerido.nombre : 'Seleccionar indicador'

    return `
      <div class="pm-route-bar pm-route-bar--collapsed" data-action="toggle">
        <div class="pm-route-bar__info">
          <span class="pm-route-bar__label">Tema activo</span>
          <div class="pm-route-bar__breadcrumb">${_escHTML(breadcrumb)}</div>
        </div>
        <span class="pm-route-bar__chevron">${_expanded ? '▴' : '▾'}</span>
      </div>
    `
  }

  function _renderExpanded() {
    if (!_tree) return '<div class="pm-route-tree__empty">Cargando árbol...</div>'

    const sugeridoId = _getSugerido()?.id

    let html = '<div class="pm-route-tree">'

    _tree.niveles.forEach((nivel, nivelIdx) => {
      const locked = _isNivelLocked(nivelIdx)
      const completados = nivel.nodos.reduce((sum, n) =>
        sum + n.indicadores.filter(i => i.semaphore === 'green').length, 0)
      const total = nivel.nodos.reduce((sum, n) => sum + n.indicadores.length, 0)

      html += `
        <div class="pm-route-nivel ${locked ? 'pm-route-nivel--locked' : ''}" data-nivel-id="${nivel.id}">
          <div class="pm-route-nivel__header" data-action="toggle-nivel" data-nivel="${nivelIdx}">
            <span class="pm-route-nivel__chevron">▾</span>
            <span class="pm-route-nivel__name">${_escHTML(nivel.nombre)}</span>
            ${locked
              ? '<span class="pm-route-nivel__badge pm-route-nivel__badge--locked">🔒 Bloqueado</span>'
              : `<span class="pm-route-nivel__badge">${completados}/${total} completados</span>`
            }
          </div>
      `

      if (!locked) {
        html += '<div class="pm-route-nivel__body">'
        for (const nodo of nivel.nodos) {
          html += `
            <div class="pm-route-nodo">
              <div class="pm-route-nodo__header" data-action="toggle-nodo" data-nodo-id="${nodo.id}">
                <span class="pm-route-nodo__chevron">▾</span>
                <span class="pm-route-nodo__name">${_escHTML(nodo.nombre)}</span>
              </div>
              <div class="pm-route-nodo__body">
          `
          for (const ind of nodo.indicadores) {
            const isSugerido = ind.id === sugeridoId
            const isActive = ind.id === _activeIndicadorId
            html += `
              <div class="pm-route-indicador pm-route-indicador--${ind.semaphore} ${isActive ? 'pm-route-indicador--active' : ''}"
                   data-action="select-indicador" data-indicador-id="${ind.id}" data-indicador-nombre="${_escHTML(ind.nombre)}">
                <span class="pm-route-indicador__icon">${SEMAPHORE_ICONS[ind.semaphore]}</span>
                <div class="pm-route-indicador__info">
                  <span class="pm-route-indicador__name">${_escHTML(ind.nombre)}</span>
                  <span class="pm-route-indicador__stats">${ind.evaluatedCount}/${ind.totalAlumnos} evaluados</span>
                </div>
                ${isSugerido ? '<span class="pm-route-indicador__sugerido">← Sugerido</span>' : ''}
              </div>
            `
          }
          html += '</div></div>'
        }
        html += '</div>'
      }
      html += '</div>'
    })

    html += '</div>'
    return html
  }

  function _render() {
    if (!_el) {
      _el = document.createElement('div')
      _el.className = 'pm-route-bar-wrapper'
      container.prepend(_el)
    }

    _el.innerHTML = _renderCollapsed() + (_expanded ? _renderExpanded() : '')
  }

  function _handleClick(e) {
    const action = e.target.closest('[data-action]')
    if (!action) return

    const type = action.dataset.action

    if (type === 'toggle') {
      _expanded = !_expanded
      _render()
    }

    if (type === 'select-indicador') {
      const id = action.dataset.indicadorId
      const nombre = action.dataset.indicadorNombre
      _activeIndicadorId = id
      _expanded = false
      _render()
      if (onIndicadorSelect) onIndicadorSelect({ id, nombre })
    }
  }

  function _escHTML(str) {
    const div = document.createElement('div')
    div.textContent = str
    return div.innerHTML
  }

  // Public API
  async function refresh() {
    _tree = await _loadTree()
    _render()
  }

  function destroy() {
    if (_el) {
      _el.removeEventListener('click', _handleClick)
      _el.remove()
      _el = null
    }
  }

  function getActiveIndicador() {
    return _activeIndicadorId
  }

  // Init
  _el = document.createElement('div')
  _el.className = 'pm-route-bar-wrapper'
  _el.addEventListener('click', _handleClick)
  container.prepend(_el)

  refresh()

  return { refresh, destroy, getActiveIndicador }
}
```

- [ ] **Step 4: Commit**

```bash
git add src/portal-maestros/components/routeTreeBar.js tests/portal-maestros/routeTreeBar.test.js
git commit -m "feat: add routeTreeBar component with collapsible tree and semaphore"
```

---

## Task 8: Route Tree CSS Styles

**Files:**
- Modify: `src/portal-maestros/styles/portal.css`

- [ ] **Step 1: Add route tree styles at the end of portal.css**

```css
/* ── Route Tree Bar ── */
.pm-route-bar-wrapper {
  border-bottom: 1px solid var(--pm-border);
}

.pm-route-bar--collapsed {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 1rem;
  cursor: pointer;
  background: var(--pm-surface);
  transition: background 0.15s;
}
.pm-route-bar--collapsed:hover {
  background: var(--pm-surface-2);
}
.pm-route-bar__label {
  font-size: 0.7rem;
  color: var(--pm-text-muted);
  text-transform: uppercase;
  letter-spacing: 1px;
}
.pm-route-bar__breadcrumb {
  font-weight: 700;
  font-size: 0.95rem;
  margin-top: 2px;
  color: var(--pm-primary);
}
.pm-route-bar__chevron {
  color: var(--pm-text-muted);
  font-size: 1.2rem;
}

/* Expanded tree */
.pm-route-tree {
  background: var(--pm-bg);
  border-bottom: 2px solid rgba(99, 102, 241, 0.3);
  padding: 0.75rem;
  max-height: 400px;
  overflow-y: auto;
}

/* Nivel */
.pm-route-nivel__header {
  padding: 0.5rem;
  border-radius: var(--pm-radius-sm);
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  background: var(--pm-surface);
}
.pm-route-nivel__header:hover {
  background: var(--pm-surface-2);
}
.pm-route-nivel__chevron {
  color: var(--pm-text-muted);
  font-size: 0.8rem;
}
.pm-route-nivel__name {
  font-weight: 700;
  font-size: 0.9rem;
}
.pm-route-nivel__badge {
  margin-left: auto;
  font-size: 0.7rem;
  background: rgba(34, 197, 94, 0.15);
  color: #22c55e;
  padding: 2px 8px;
  border-radius: 10px;
}
.pm-route-nivel__badge--locked {
  background: rgba(100, 116, 139, 0.15);
  color: var(--pm-text-muted);
}
.pm-route-nivel--locked {
  opacity: 0.5;
  pointer-events: none;
}
.pm-route-nivel__body {
  padding-left: 1.25rem;
}

/* Nodo */
.pm-route-nodo__header {
  padding: 0.4rem 0.5rem;
  border-radius: 6px;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  margin: 0.25rem 0;
}
.pm-route-nodo__header:hover {
  background: var(--pm-surface);
}
.pm-route-nodo__chevron {
  color: var(--pm-text-muted);
  font-size: 0.75rem;
}
.pm-route-nodo__name {
  font-weight: 600;
  font-size: 0.85rem;
}
.pm-route-nodo__body {
  padding-left: 1.25rem;
}

/* Indicador */
.pm-route-indicador {
  padding: 0.5rem 0.75rem;
  margin: 3px 0;
  border-radius: var(--pm-radius-sm);
  display: flex;
  align-items: center;
  gap: 0.75rem;
  cursor: pointer;
  border-left: 3px solid var(--pm-border);
  transition: all 0.15s;
}
.pm-route-indicador:hover {
  background: var(--pm-surface);
}
.pm-route-indicador--green {
  background: rgba(34, 197, 94, 0.08);
  border-left-color: #22c55e;
}
.pm-route-indicador--yellow {
  background: rgba(234, 179, 8, 0.08);
  border-left-color: #eab308;
}
.pm-route-indicador--gray {
  border-left-color: var(--pm-border);
}
.pm-route-indicador--active {
  border-left-color: var(--pm-primary);
  background: rgba(99, 102, 241, 0.08);
}
.pm-route-indicador__icon {
  font-size: 0.85rem;
}
.pm-route-indicador__info {
  flex: 1;
}
.pm-route-indicador__name {
  font-size: 0.85rem;
  font-weight: 600;
}
.pm-route-indicador__stats {
  font-size: 0.7rem;
  color: var(--pm-text-muted);
}
.pm-route-indicador__sugerido {
  font-size: 0.65rem;
  color: var(--pm-text-muted);
  font-style: italic;
}

/* Student Progress Panel */
.pm-student-panel {
  position: fixed;
  right: 0;
  top: 0;
  bottom: 0;
  width: min(400px, 90vw);
  background: var(--pm-bg);
  border-left: 1px solid var(--pm-border);
  z-index: 1000;
  overflow-y: auto;
  transform: translateX(100%);
  transition: transform 0.25s ease-out;
  box-shadow: -4px 0 20px rgba(0,0,0,0.2);
}
.pm-student-panel--open {
  transform: translateX(0);
}
.pm-student-panel__header {
  padding: 1rem;
  border-bottom: 1px solid var(--pm-border);
  display: flex;
  align-items: center;
  gap: 0.75rem;
}
.pm-student-panel__avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: var(--pm-primary);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 1.2rem;
}
.pm-student-panel__name {
  font-weight: 700;
  font-size: 1rem;
}
.pm-student-panel__meta {
  font-size: 0.8rem;
  color: var(--pm-text-muted);
}
.pm-student-panel__progress-bar {
  height: 6px;
  background: var(--pm-border);
  border-radius: 3px;
  margin: 0.5rem 1rem;
  overflow: hidden;
}
.pm-student-panel__progress-fill {
  height: 100%;
  background: var(--pm-primary);
  border-radius: 3px;
  transition: width 0.3s;
}
.pm-student-panel__close {
  margin-left: auto;
  background: none;
  border: none;
  font-size: 1.5rem;
  color: var(--pm-text-muted);
  cursor: pointer;
}

/* Timeline */
.pm-eval-timeline {
  padding: 0.5rem 1rem;
}
.pm-eval-timeline__item {
  display: flex;
  gap: 0.5rem;
  padding: 0.5rem 0;
  border-bottom: 1px solid var(--pm-border);
}
.pm-eval-timeline__date {
  font-size: 0.75rem;
  color: var(--pm-text-muted);
  min-width: 60px;
}
.pm-eval-timeline__nota {
  font-weight: 700;
  font-size: 0.85rem;
}
.pm-eval-timeline__detail {
  font-size: 0.8rem;
  color: var(--pm-text-muted);
}

/* Draft indicator */
.pm-draft-indicator {
  font-size: 0.75rem;
  color: var(--pm-text-muted);
  padding: 0.25rem 0.5rem;
  opacity: 0;
  transition: opacity 0.3s;
}
.pm-draft-indicator--visible {
  opacity: 1;
}

/* Completeness warning */
.pm-completeness-warning {
  background: rgba(234, 179, 8, 0.1);
  border: 1px solid rgba(234, 179, 8, 0.3);
  border-radius: var(--pm-radius-sm);
  padding: 0.75rem;
  margin: 0.5rem 0;
  font-size: 0.85rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}
.pm-completeness-warning__actions {
  display: flex;
  gap: 0.5rem;
  margin-top: 0.5rem;
}
```

- [ ] **Step 2: Commit**

```bash
git add src/portal-maestros/styles/portal.css
git commit -m "feat: add CSS for route tree, student panel, semaphore, and auto-draft"
```

---

## Task 9: Student Progress Panel Component

**Files:**
- Create: `src/portal-maestros/components/studentProgressPanel.js`

- [ ] **Step 1: Implement the lateral panel**

```javascript
// src/portal-maestros/components/studentProgressPanel.js
import { getClient } from '../../lib/supabaseClient.js'

/**
 * Create a lateral panel showing student progress in the route.
 *
 * @param {Object} opts
 * @param {Object} opts.alumno - { id, nombre_completo }
 * @param {string} opts.rutaId - Route ID
 * @returns {{ open(), close(), destroy() }}
 */
export function createStudentProgressPanel({ alumno, rutaId }) {
  let _el = null
  let _data = null

  async function _loadProgress() {
    const supabase = getClient()

    // Get all evaluations for this student
    const { data: evaluaciones } = await supabase
      .from('evaluaciones')
      .select(`
        id, nota, observacion, tarea, created_at,
        indicadores!inner(id, nombre, orden, nodos!inner(id, nombre, niveles!inner(id, nombre)))
      `)
      .eq('alumno_id', alumno.id)
      .order('created_at', { ascending: false })

    // Get total indicators in route
    const { data: allIndicadores } = await supabase
      .from('indicadores')
      .select('id, nodos!inner(niveles!inner(bloques!inner(ruta_id)))')
      .eq('nodos.niveles.bloques.ruta_id', rutaId)

    const totalIndicadores = allIndicadores?.length || 0

    // Group by indicator, keep latest evaluation per indicator
    const byIndicador = new Map()
    for (const e of (evaluaciones || [])) {
      const indId = e.indicadores.id
      if (!byIndicador.has(indId)) {
        byIndicador.set(indId, {
          indicador: e.indicadores,
          latest: e,
          history: [],
        })
      }
      byIndicador.get(indId).history.push(e)
    }

    // Calculate mastery
    let dominados = 0
    for (const entry of byIndicador.values()) {
      if (entry.latest.nota >= 4) dominados++
    }

    return {
      evaluaciones: byIndicador,
      totalIndicadores,
      dominados,
      avance: totalIndicadores > 0 ? Math.round((dominados / totalIndicadores) * 100) : 0,
    }
  }

  function _semaphoreIndividual(nota) {
    if (nota >= 4) return { icon: '🟢', color: '#22c55e' }
    if (nota >= 2) return { icon: '🟡', color: '#eab308' }
    if (nota === 1) return { icon: '🔴', color: '#ef4444' }
    return { icon: '⚫', color: '#334155' }
  }

  function _escHTML(str) {
    const div = document.createElement('div')
    div.textContent = str || ''
    return div.innerHTML
  }

  function _formatDate(isoStr) {
    const d = new Date(isoStr)
    return d.toLocaleDateString('es', { day: 'numeric', month: 'short' })
  }

  function _render() {
    if (!_data) return

    const initials = alumno.nombre_completo.split(' ').map(w => w[0]).join('').slice(0, 2)

    let timelineHTML = ''
    for (const [, entry] of _data.evaluaciones) {
      const s = _semaphoreIndividual(entry.latest.nota)
      timelineHTML += `
        <div class="pm-route-indicador pm-route-indicador--${entry.latest.nota >= 4 ? 'green' : entry.latest.nota >= 2 ? 'yellow' : 'gray'}"
             data-action="expand-history" data-indicador-id="${entry.indicador.id}">
          <span class="pm-route-indicador__icon">${s.icon}</span>
          <div class="pm-route-indicador__info">
            <span class="pm-route-indicador__name">${_escHTML(entry.indicador.nombre)}</span>
            <span class="pm-route-indicador__stats">Última nota: ${entry.latest.nota}/5</span>
          </div>
        </div>
        <div class="pm-eval-timeline" data-history-for="${entry.indicador.id}" style="display:none;">
          ${entry.history.map(h => `
            <div class="pm-eval-timeline__item">
              <span class="pm-eval-timeline__date">📅 ${_formatDate(h.created_at)}</span>
              <span class="pm-eval-timeline__nota">/\${h.nota}</span>
              <span class="pm-eval-timeline__detail">
                ${h.observacion ? _escHTML(h.observacion) : ''}
                ${h.tarea ? `<br>📋 ${_escHTML(h.tarea)}` : ''}
              </span>
            </div>
          `).join('')}
        </div>
      `
    }

    // Pending tasks
    const pendingTasks = []
    for (const [, entry] of _data.evaluaciones) {
      if (entry.latest.tarea) {
        pendingTasks.push(entry.latest.tarea)
      }
    }

    _el.innerHTML = `
      <div class="pm-student-panel__header">
        <div class="pm-student-panel__avatar">${initials}</div>
        <div>
          <div class="pm-student-panel__name">${_escHTML(alumno.nombre_completo)}</div>
          <div class="pm-student-panel__meta">${_data.avance}% avance · ${_data.dominados}/${_data.totalIndicadores} dominados</div>
        </div>
        <button class="pm-student-panel__close" data-action="close">&times;</button>
      </div>
      <div class="pm-student-panel__progress-bar">
        <div class="pm-student-panel__progress-fill" style="width:${_data.avance}%"></div>
      </div>
      <div style="padding:0.75rem;">
        ${timelineHTML || '<div class="pm-empty">Sin evaluaciones aún</div>'}
      </div>
      ${pendingTasks.length > 0 ? `
        <div style="padding:0.75rem; border-top:1px solid var(--pm-border);">
          <strong style="font-size:0.85rem;">📋 Tareas pendientes (${pendingTasks.length})</strong>
          <ul style="margin:0.5rem 0; padding-left:1.25rem; font-size:0.85rem;">
            ${pendingTasks.map(t => `<li>${_escHTML(t)}</li>`).join('')}
          </ul>
        </div>
      ` : ''}
    `
  }

  function _handleClick(e) {
    const action = e.target.closest('[data-action]')
    if (!action) return

    if (action.dataset.action === 'close') {
      close()
    }

    if (action.dataset.action === 'expand-history') {
      const id = action.dataset.indicadorId
      const histEl = _el.querySelector(`[data-history-for="${id}"]`)
      if (histEl) {
        histEl.style.display = histEl.style.display === 'none' ? 'block' : 'none'
      }
    }
  }

  // Create element
  _el = document.createElement('div')
  _el.className = 'pm-student-panel'
  _el.addEventListener('click', _handleClick)
  document.body.appendChild(_el)

  async function open() {
    _data = await _loadProgress()
    _render()
    requestAnimationFrame(() => {
      _el.classList.add('pm-student-panel--open')
    })
  }

  function close() {
    _el.classList.remove('pm-student-panel--open')
    setTimeout(() => {
      if (_el) _el.innerHTML = ''
    }, 300)
  }

  function destroy() {
    if (_el) {
      _el.removeEventListener('click', _handleClick)
      _el.remove()
      _el = null
    }
  }

  return { open, close, destroy }
}
```

- [ ] **Step 2: Commit**

```bash
git add src/portal-maestros/components/studentProgressPanel.js
git commit -m "feat: add studentProgressPanel with route map, timeline, and pending tasks"
```

---

## Task 10: Integrate Route Tree + Evaluation into Attendance View

**Files:**
- Modify: `src/portal-maestros/views/asistenciaView.js`

This is the main integration task. The attendance view needs:
1. Route tree bar above the editor
2. "Guardar observación" button that runs the evaluation pipeline
3. Completeness warning when students are missing
4. Auto-draft wired to editor changes
5. Student name tap → progress panel
6. Draft recovery on session reopen

- [ ] **Step 1: Add imports at the top of asistenciaView.js**

After the existing imports, add:
```javascript
import { createRouteTreeBar } from '../components/routeTreeBar.js'
import { createStudentProgressPanel } from '../components/studentProgressPanel.js'
import { resolveDSL, saveEvaluaciones } from '../services/evaluationService.js'
import { createAutoDraft, saveDraft, loadDraft, discardDraft, saveObservation } from '../services/autoDraftService.js'
```

- [ ] **Step 2: After the attendance list renders, initialize the route tree bar**

Find the section where the DSL editor is created (after attendance list renders). Add before the editor:

```javascript
// ── Route Tree Bar ──
let _routeTree = null
let _activeIndicadorId = null
let _activeIndicadorNombre = null

// Get the route for this class's instrument
const claseData = misClases.find(c => c.id === claseId)
const rutaId = claseData?.ruta_id

if (rutaId) {
  const treeContainer = document.createElement('div')
  editorWrapper.parentElement.insertBefore(treeContainer, editorWrapper)

  _routeTree = createRouteTreeBar(treeContainer, {
    claseId,
    rutaId,
    onIndicadorSelect: ({ id, nombre }) => {
      _activeIndicadorId = id
      _activeIndicadorNombre = nombre
      // Insert [indicador] into the DSL editor
      if (dslEditorRef) {
        dslEditorRef.insertText(`[${nombre}] `, 0, false)
      }
    },
  })
}
```

- [ ] **Step 3: Add "Guardar observación" button and evaluation pipeline**

After the existing save button for attendance, add a new section:

```javascript
// ── Save Observation Button ──
const saveObsBtn = document.createElement('button')
saveObsBtn.className = 'pm-btn pm-btn-primary'
saveObsBtn.textContent = '💾 Guardar observación'
saveObsBtn.style.marginTop = '0.5rem'

const warningEl = document.createElement('div')
warningEl.className = 'pm-completeness-warning'
warningEl.style.display = 'none'

const draftIndicator = document.createElement('div')
draftIndicator.className = 'pm-draft-indicator'

editorWrapper.appendChild(warningEl)
editorWrapper.appendChild(saveObsBtn)
editorWrapper.appendChild(draftIndicator)

saveObsBtn.addEventListener('click', async () => {
  const raw = dslEditorRef.getValue()
  if (!raw.trim()) return

  if (!_activeIndicadorId) {
    warningEl.textContent = '⚠️ Seleccioná un indicador del árbol antes de guardar.'
    warningEl.style.display = 'flex'
    return
  }

  const result = resolveDSL(raw, _activeIndicadorId, presentesList)

  // Check for missing students
  if (result.missing.length > 0) {
    warningEl.innerHTML = `
      ⚠️ ${result.missing.join(', ')} no tienen nota.
      <div class="pm-completeness-warning__actions">
        <button class="pm-btn pm-btn-secondary pm-btn--sm" data-action="accept-missing">Guardar así</button>
        <button class="pm-btn pm-btn-outline pm-btn--sm" data-action="dismiss-warning">Editar</button>
      </div>
    `
    warningEl.style.display = 'flex'

    warningEl.querySelector('[data-action="accept-missing"]').onclick = () => _doSave(raw, result)
    warningEl.querySelector('[data-action="dismiss-warning"]').onclick = () => {
      warningEl.style.display = 'none'
    }
    return
  }

  await _doSave(raw, result)
})

async function _doSave(raw, result) {
  try {
    saveObsBtn.disabled = true
    saveObsBtn.textContent = 'Guardando...'
    warningEl.style.display = 'none'

    // Save evaluations
    await saveEvaluaciones(sesionId, result.indicador_id, result.evaluaciones)

    // Save observation record
    const parsed = { ...result, raw }
    await saveObservation(sesionId, maestroId, raw, parsed)

    // Refresh semaphore
    if (_routeTree) await _routeTree.refresh()

    // Clear editor
    if (dslEditorRef) dslEditorRef.insertText('', 0, false)
    _activeIndicadorId = null
    _activeIndicadorNombre = null

    // Toast
    _showToast(`✅ Observación guardada. ${result.evaluaciones.length} alumnos evaluados en ${_activeIndicadorNombre || 'indicador'}`)
  } catch (err) {
    console.error('[Asistencia] Save error:', err)
    _showToast('❌ Error al guardar: ' + err.message)
  } finally {
    saveObsBtn.disabled = false
    saveObsBtn.textContent = '💾 Guardar observación'
  }
}
```

- [ ] **Step 4: Wire auto-draft to the editor**

```javascript
// ── Auto-Draft ──
const autoDraft = createAutoDraft({
  saveFn: (content) => saveDraft(sesionId, maestroId, content),
  debounceMs: 30000,
})
autoDraft.onSaved(() => {
  const now = new Date().toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit' })
  draftIndicator.textContent = `💾 Borrador guardado ${now}`
  draftIndicator.classList.add('pm-draft-indicator--visible')
  setTimeout(() => draftIndicator.classList.remove('pm-draft-indicator--visible'), 3000)
})

// Wire to editor onChange
// In the dslEditor creation, add the autoDraft.onInput call:
// onChange: (content) => { autoDraft.onInput(content); /* existing onChange logic */ }
```

- [ ] **Step 5: Add draft recovery on session load**

```javascript
// ── Draft Recovery ──
const existingDraft = await loadDraft(sesionId, maestroId)
if (existingDraft) {
  const ts = new Date(existingDraft.updated_at).toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit' })
  const modal = document.createElement('div')
  modal.className = 'pm-completeness-warning'
  modal.innerHTML = `
    💾 Tenés un borrador de las ${ts}. ¿Recuperar?
    <div class="pm-completeness-warning__actions">
      <button class="pm-btn pm-btn-primary pm-btn--sm" data-action="recover">Recuperar</button>
      <button class="pm-btn pm-btn-outline pm-btn--sm" data-action="discard">Descartar</button>
    </div>
  `
  editorWrapper.prepend(modal)
  modal.querySelector('[data-action="recover"]').onclick = () => {
    if (dslEditorRef) dslEditorRef.insertText(existingDraft.contenido_raw, 0, false)
    modal.remove()
  }
  modal.querySelector('[data-action="discard"]').onclick = async () => {
    await discardDraft(existingDraft.id)
    modal.remove()
  }
}
```

- [ ] **Step 6: Add student name tap → progress panel**

In the attendance list rendering, where each student row is created, add a click handler:

```javascript
// When rendering each student row in the attendance list,
// add data attribute and click handler:
// <div class="alumno-row" data-alumno-id="${alumno.id}" data-alumno-nombre="${alumno.nombre_completo}">

// Add event listener on the list container:
attendanceList.addEventListener('click', (e) => {
  const alumnoRow = e.target.closest('[data-alumno-id]')
  if (!alumnoRow) return
  // Don't open panel if clicking on toggle buttons
  if (e.target.closest('.pm-btn') || e.target.closest('[data-action]')) return

  const panel = createStudentProgressPanel({
    alumno: {
      id: alumnoRow.dataset.alumnoId,
      nombre_completo: alumnoRow.dataset.alumnoNombre,
    },
    rutaId,
  })
  panel.open()
})
```

- [ ] **Step 7: Clean up on view destroy**

```javascript
// In the view cleanup/destroy logic:
if (_routeTree) _routeTree.destroy()
if (autoDraft) autoDraft.destroy()
```

- [ ] **Step 8: Commit**

```bash
git add src/portal-maestros/views/asistenciaView.js
git commit -m "feat: integrate route tree, evaluation pipeline, auto-draft, and student panel into attendance view"
```

---

## Task 11: Extend Student Profile View with Evaluation History

**Files:**
- Modify: `src/portal-maestros/views/alumnoPerfilView.js`

- [ ] **Step 1: Add evaluation history section after existing content**

In `renderAlumnoPerfilView`, after the session timeline section, add:

```javascript
// ── Evaluation History (Route Progress) ──
const { data: evaluaciones } = await supabase
  .from('evaluaciones')
  .select(`
    id, nota, observacion, tarea, created_at,
    indicadores!inner(id, nombre, nodos!inner(id, nombre, niveles!inner(id, nombre)))
  `)
  .eq('alumno_id', alumnoId)
  .order('created_at', { ascending: false })

if (evaluaciones && evaluaciones.length > 0) {
  // Group by indicator
  const byIndicador = new Map()
  for (const e of evaluaciones) {
    const indId = e.indicadores.id
    if (!byIndicador.has(indId)) {
      byIndicador.set(indId, {
        indicador: e.indicadores,
        latest: e,
        history: [],
      })
    }
    byIndicador.get(indId).history.push(e)
  }

  const totalIndicadores = byIndicador.size
  const dominados = [...byIndicador.values()].filter(e => e.latest.nota >= 4).length
  const avance = totalIndicadores > 0 ? Math.round((dominados / totalIndicadores) * 100) : 0

  const evalSection = document.createElement('div')
  evalSection.className = 'pm-section'
  evalSection.innerHTML = `
    <h3 class="pm-section__title">🎯 Progreso Académico — ${avance}% avance</h3>
    <div class="pm-student-panel__progress-bar" style="margin:0.5rem 0 1rem;">
      <div class="pm-student-panel__progress-fill" style="width:${avance}%"></div>
    </div>
  `

  for (const [, entry] of byIndicador) {
    const semIcon = entry.latest.nota >= 4 ? '🟢' : entry.latest.nota >= 2 ? '🟡' : entry.latest.nota === 1 ? '🔴' : '⚫'
    const indEl = document.createElement('div')
    indEl.className = 'pm-route-indicador pm-route-indicador--' +
      (entry.latest.nota >= 4 ? 'green' : entry.latest.nota >= 2 ? 'yellow' : 'gray')
    indEl.style.cursor = 'pointer'
    indEl.innerHTML = `
      <span class="pm-route-indicador__icon">${semIcon}</span>
      <div class="pm-route-indicador__info">
        <span class="pm-route-indicador__name">${escHTML(entry.indicador.nombre)}</span>
        <span class="pm-route-indicador__stats">
          ${entry.indicador.nodos.nombre} · Última nota: ${entry.latest.nota}/5 · ${entry.history.length} evaluaciones
        </span>
      </div>
    `

    const histEl = document.createElement('div')
    histEl.className = 'pm-eval-timeline'
    histEl.style.display = 'none'
    histEl.innerHTML = entry.history.map(h => {
      const date = new Date(h.created_at).toLocaleDateString('es', { day: 'numeric', month: 'short' })
      return `
        <div class="pm-eval-timeline__item">
          <span class="pm-eval-timeline__date">📅 ${date}</span>
          <span class="pm-eval-timeline__nota">/${h.nota}</span>
          <span class="pm-eval-timeline__detail">
            ${h.observacion ? escHTML(h.observacion) : ''}
            ${h.tarea ? `<br>📋 ${escHTML(h.tarea)}` : ''}
          </span>
        </div>
      `
    }).join('')

    indEl.addEventListener('click', () => {
      histEl.style.display = histEl.style.display === 'none' ? 'block' : 'none'
    })

    evalSection.appendChild(indEl)
    evalSection.appendChild(histEl)
  }

  container.appendChild(evalSection)
}
```

- [ ] **Step 2: Commit**

```bash
git add src/portal-maestros/views/alumnoPerfilView.js
git commit -m "feat: add evaluation history timeline to student profile view"
```

---

## Task 12: Add Student Search to Metrics View

**Files:**
- Modify: `src/portal-maestros/views/metricasView.js`

- [ ] **Step 1: Add student search bar at the top of metrics view**

After the metrics header renders, add:

```javascript
// ── Student Search ──
const searchContainer = document.createElement('div')
searchContainer.style.cssText = 'padding:0.75rem 1rem; border-bottom:1px solid var(--pm-border);'
searchContainer.innerHTML = `
  <label style="font-size:0.8rem; color:var(--pm-text-muted); font-weight:600;">Buscar alumno</label>
  <input type="search" class="pm-input" placeholder="Nombre del alumno..."
         style="width:100%; margin-top:0.25rem; padding:0.5rem 0.75rem; border-radius:var(--pm-radius-sm); border:1px solid var(--pm-border); background:var(--pm-surface); color:var(--pm-text);"
         id="metricas-alumno-search" />
  <div id="metricas-alumno-results" style="margin-top:0.5rem;"></div>
`
container.prepend(searchContainer)

const searchInput = searchContainer.querySelector('#metricas-alumno-search')
const resultsDiv = searchContainer.querySelector('#metricas-alumno-results')

let searchTimeout = null
searchInput.addEventListener('input', () => {
  clearTimeout(searchTimeout)
  const query = searchInput.value.trim()
  if (query.length < 2) {
    resultsDiv.innerHTML = ''
    return
  }
  searchTimeout = setTimeout(async () => {
    const supabase = getClient()
    const { data: alumnos } = await supabase
      .from('alumnos')
      .select('id, nombre_completo')
      .ilike('nombre_completo', `%${query}%`)
      .limit(5)

    resultsDiv.innerHTML = (alumnos || []).map(a => `
      <div style="padding:0.5rem; cursor:pointer; border-radius:var(--pm-radius-sm); display:flex; align-items:center; gap:0.5rem;"
           class="pm-surface-hover"
           data-alumno-search-id="${a.id}">
        <span>👤</span>
        <span style="font-weight:600;">${escHTML(a.nombre_completo)}</span>
      </div>
    `).join('') || '<div class="pm-empty">Sin resultados</div>'
  }, 300)
})

resultsDiv.addEventListener('click', (e) => {
  const row = e.target.closest('[data-alumno-search-id]')
  if (!row) return
  const alumnoId = row.dataset.alumnoSearchId
  // Navigate to student profile
  window.dispatchEvent(new CustomEvent('navigate', {
    detail: { route: 'alumno-perfil', params: { alumnoId } }
  }))
})
```

- [ ] **Step 2: Commit**

```bash
git add src/portal-maestros/views/metricasView.js
git commit -m "feat: add student search in metrics view navigating to profile"
```

---

## Task 13: Extend AI Service — Structured DSL and Completeness Validation

**Files:**
- Modify: `src/portal-maestros/services/aiService.js`

- [ ] **Step 1: Add `structureDSL` method to the AI service factory**

Inside `createAiService()`, add these methods to the returned object:

```javascript
/**
 * Convert freeform text or transcription into structured DSL.
 * Context: student names, active indicator, DSL syntax rules.
 */
async function structureDSL({ rawText, presentes, indicadorActivo, indicadoresDisponibles }) {
  const studentNames = presentes.map(p => p.nombre_completo.split(' ')[0])
  const prompt = `Sos un asistente de un sistema de evaluación musical. Convertí este texto en DSL estructurado.

SINTAXIS DSL:
- #nombre → mencionar alumno (nombres disponibles: ${studentNames.join(', ')})
- #todos → todos los presentes
- [indicador] → indicador evaluado (disponibles: ${indicadoresDisponibles.map(i => i.nombre).join(', ')})
- /N → nota del 1 al 5
- (texto) → observación pedagógica
- {texto} → tarea asignada
- $texto → medida técnica

INDICADOR ACTIVO: ${indicadorActivo || 'ninguno seleccionado'}

TEXTO DEL MAESTRO:
${rawText}

Respondé SOLO con el DSL estructurado, sin explicaciones. Cada línea es un bloque de evaluación.`

  return chat(prompt, { role: 'dsl-structurer' })
}

/**
 * Generate pedagogical suggestion for an indicator based on history.
 */
async function suggestForIndicator({ indicadorNombre, historial, alumnosRezagados }) {
  const prompt = `Sos un asistente pedagógico musical. Basándote en este contexto, dá UNA sugerencia breve (máx 2 oraciones).

INDICADOR: ${indicadorNombre}
HISTORIAL RECIENTE: ${historial.length} evaluaciones. Promedio: ${historial.length > 0 ? (historial.reduce((s, h) => s + h.nota, 0) / historial.length).toFixed(1) : 'N/A'}/5
ALUMNOS REZAGADOS (nota < 3): ${alumnosRezagados.length > 0 ? alumnosRezagados.join(', ') : 'ninguno'}

Respondé SOLO la sugerencia, sin formato markdown.`

  return chat(prompt, { role: 'pedagogical-advisor' })
}
```

- [ ] **Step 2: Commit**

```bash
git add src/portal-maestros/services/aiService.js
git commit -m "feat: add structureDSL and suggestForIndicator to AI service"
```

---

## Task 14: Wire IA "Mejorar con IA" Button to structureDSL

**Files:**
- Modify: `src/portal-maestros/components/dslToolbar.js`

- [ ] **Step 1: Update the IA button handler**

In the existing `✨ Mejorar con IA` button click handler in `createDslToolbar`, update to call `structureDSL`:

```javascript
// Replace the existing IA button handler with:
iaBtn.addEventListener('click', async () => {
  const raw = getCurrentEditorContent() // Get from editor via callback
  if (!raw || !raw.trim()) return

  onLoading(true)
  try {
    const ai = createAiService()
    const structured = await ai.structureDSL({
      rawText: raw,
      presentes: context.presentes || [],
      indicadorActivo: context.indicadorActivo || null,
      indicadoresDisponibles: context.indicadoresDisponibles || [],
    })
    if (structured) {
      onIaProposal(structured) // Replace editor content with structured DSL
    }
  } catch (err) {
    console.error('[DSL Toolbar] IA error:', err)
  } finally {
    onLoading(false)
  }
})
```

The `context` object needs to be updatable. Add a `setContext(ctx)` method if not already available, and wire it from `asistenciaView` when the route tree selection changes.

- [ ] **Step 2: Commit**

```bash
git add src/portal-maestros/components/dslToolbar.js
git commit -m "feat: wire IA button to structureDSL for freeform text to DSL conversion"
```

---

## Task 15: Extend catalogService — Route Tree Query

**Files:**
- Modify: `src/portal-maestros/services/catalogService.js`

- [ ] **Step 1: Add `getRouteTree` function**

```javascript
/**
 * Get the full route tree for a given ruta_id.
 * Returns: { niveles: [{ id, nombre, nodos: [{ id, nombre, indicadores: [...] }] }] }
 */
export async function getRouteTree(rutaId) {
  const cacheKey = `routeTree_${rutaId}`
  const cached = catalogCacheGet(cacheKey)
  if (cached) return cached

  const supabase = getClient()

  const { data: niveles } = await supabase
    .from('niveles')
    .select(`
      id, nombre, orden,
      bloques!inner(ruta_id)
    `)
    .eq('bloques.ruta_id', rutaId)
    .order('orden')

  if (!niveles) return { niveles: [] }

  const tree = { niveles: [] }
  for (const nivel of niveles) {
    const { data: nodos } = await supabase
      .from('nodos')
      .select(`
        id, nombre, orden,
        indicadores(id, nombre, orden, activo)
      `)
      .eq('nivel_id', nivel.id)
      .order('orden')

    tree.niveles.push({
      id: nivel.id,
      nombre: nivel.nombre,
      orden: nivel.orden,
      nodos: (nodos || []).map(n => ({
        ...n,
        indicadores: (n.indicadores || [])
          .filter(i => i.activo)
          .sort((a, b) => a.orden - b.orden),
      })),
    })
  }

  catalogCacheSet(cacheKey, tree, 'contenidos') // reuse contenidos TTL (7 days)
  return tree
}
```

- [ ] **Step 2: Add `#todos` to autocomplete triggers**

In `getOptionsForTrigger`, add handling for when query starts with `todos`:

```javascript
// In the '#' trigger handler, add #todos as first option:
if (trigger === '#') {
  const options = [{ label: 'todos', value: 'todos', icon: '👥', description: 'Todos los presentes' }]
  const alumnos = await getAlumnos(context.claseId)
  // ... existing alumno mapping
  options.push(...alumnoOptions)
  return fuzzySearch(options, query, 'label')
}
```

- [ ] **Step 3: Commit**

```bash
git add src/portal-maestros/services/catalogService.js
git commit -m "feat: add getRouteTree query and #todos autocomplete to catalogService"
```

---

## Task 16: Seed Test Indicators for Existing Nodes

**Files:**
- Create: `supabase/migrations/20260507_seed_indicadores.sql`

- [ ] **Step 1: Write seed migration**

Since there are 160 nodes but 0 indicators, we need at least a few indicators per node to make the system usable. Seed the first level's nodes with sample indicators:

```sql
-- supabase/migrations/20260507_seed_indicadores.sql
-- Seed indicators for Level 1 nodes (first 3 nodes minimum)
-- This provides initial data for testing. Teachers/admins will add more via the route builder.

-- Get the first 3 nodos of Level 1
DO $$
DECLARE
  v_nodo RECORD;
  v_indicadores TEXT[][] := ARRAY[
    -- Nodo 1 indicators (adjust names to match the actual node content)
    ARRAY['Postura de pie', 'Posición correcta del cuerpo al tocar de pie'],
    ARRAY['Postura sentado', 'Posición correcta del cuerpo al tocar sentado'],
    ARRAY['Agarre del arco', 'Forma correcta de sostener el arco con todos los dedos'],
    ARRAY['Pase del arco — Punto de contacto', 'Control del punto de contacto del arco con la cuerda']
  ];
  v_idx INT;
BEGIN
  -- Insert for the first node of the first level
  FOR v_nodo IN (
    SELECT n.id, n.nombre, n.orden
    FROM nodos n
    JOIN niveles niv ON n.nivel_id = niv.id
    JOIN bloques b ON niv.bloque_id = b.id
    JOIN rutas r ON b.ruta_id = r.id
    WHERE niv.orden = 1
    ORDER BY n.orden
    LIMIT 1
  )
  LOOP
    FOR v_idx IN 1..array_length(v_indicadores, 1)
    LOOP
      INSERT INTO indicadores (nodo_id, nombre, descripcion, orden)
      VALUES (v_nodo.id, v_indicadores[v_idx][1], v_indicadores[v_idx][2], v_idx)
      ON CONFLICT DO NOTHING;
    END LOOP;
  END LOOP;
END $$;
```

- [ ] **Step 2: Apply migration via Supabase MCP**

Run the SQL via the Supabase MCP `execute_sql` tool.

- [ ] **Step 3: Verify**

Run: `SELECT count(*) FROM indicadores;` — Expected: ≥ 4 rows.

- [ ] **Step 4: Commit**

```bash
git add supabase/migrations/20260507_seed_indicadores.sql
git commit -m "feat: seed initial indicators for Level 1 nodes"
```

---

## Task 17: End-to-End Manual Test Checklist

No code changes — this is a verification task.

- [ ] **Step 1: Verify all tests pass**

Run: `npx vitest run`
Expected: ALL PASS (existing + new tests)

- [ ] **Step 2: Manual test — Route tree**

1. Open attendance view for a class with a violin route
2. Verify route tree bar appears above the editor
3. Verify collapsed state shows breadcrumb
4. Tap bar → tree expands with levels, nodes, indicators
5. Verify semaphore colors: all should be gray (no evaluations yet)
6. Verify "Sugerido" label on first indicator
7. Verify locked levels show 🔒

- [ ] **Step 3: Manual test — Evaluation flow**

1. Select an indicator from the tree → verify `[indicator name]` appears in editor
2. Type: `#todos /3`
3. Tap "Guardar observación" → verify evaluations created
4. Verify semaphore updates (should turn yellow — all evaluated but not all ≥ 4)
5. Type: `#todos /5` on same indicator → verify upsert (updates, doesn't duplicate)
6. Verify semaphore turns green

- [ ] **Step 4: Manual test — #todos with exceptions**

1. Type: `#todos [Agarre del arco] /2`
2. Add second line: `#Isabella /4 (buena técnica)`
3. Save → verify Isabella gets 4, everyone else gets 2

- [ ] **Step 5: Manual test — Auto-draft**

1. Type something in editor, wait 30 seconds
2. Verify "💾 Borrador guardado HH:MM" appears
3. Close and reopen the attendance view
4. Verify "Tenés un borrador" modal appears
5. Tap "Recuperar" → verify editor loads draft content

- [ ] **Step 6: Manual test — Student progress panel**

1. Tap a student name in the attendance list
2. Verify lateral panel opens with route map
3. Verify their individual semaphore shows their evaluations
4. Tap an indicator → verify history timeline expands
5. Close panel

- [ ] **Step 7: Manual test — Student search in metrics**

1. Open metrics view
2. Type student name in search bar
3. Select from results → verify navigation to student profile
4. Verify evaluation history section appears in profile

- [ ] **Step 8: Commit any fixes from testing**

```bash
git add -A
git commit -m "fix: adjustments from end-to-end testing"
```
