# DSL Progress Foundation — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Allow teachers to write free-text observations; AI extracts structured progress records per student into the `progresos` table, with a confirmation preview panel before saving.

**Architecture:** Natural language input → `analyzeObservation()` (Groq with full class context) → `ProgressPreviewPanel` confirmation → `progressAggregatorService` upserts to `progresos`. Manual DSL `!STATE` tokens provide a power-user shortcut through the same aggregator. The existing observation save pipeline is not broken.

**Tech Stack:** Vanilla JS ES Modules, Supabase JS v2, Groq via `groq-proxy` Edge Function, jsPDF (not used here), Bootstrap Icons

---

## File Map

| File | Status | Responsibility |
|------|--------|---------------|
| `supabase/migrations/20260525_progresos_dsl_columns.sql` | **Create** | Add `contenido_dsl` + `objetivo_id` to `progresos` |
| `src/portal-maestros/utils/dslParser.js` | **Modify** | Add `!STATE` token: pattern, colors, extraction, highlight |
| `src/portal-maestros/services/groqService.js` | **Modify** | Add `analyzeObservation()` with context-aware system prompt |
| `src/portal-maestros/services/progressAggregatorService.js` | **Create** | `saveProgressFromAI()` + `saveProgressFromDSL()` |
| `src/portal-maestros/components/ProgressPreviewPanel.js` | **Create** | Preview/confirmation UI for extracted progress records |
| `src/portal-maestros/styles/05-views.css` | **Modify** | `.pm-progress-preview` + `.pm-progress-feedback` styles |
| `src/portal-maestros/components/dslToolbar.js` | **Modify** | Add `#btn-analizar-progreso` button + `onAnalyzeClick` callback |
| `src/portal-maestros/views/asistenciaView.js` | **Modify** | Wire `onAnalyzeClick`, build context, show panel, show badge |

---

## Task 1: DB Migration

**Files:**
- Create: `supabase/migrations/20260525_progresos_dsl_columns.sql`

- [ ] **Step 1: Create the migration file**

```sql
-- supabase/migrations/20260525_progresos_dsl_columns.sql
ALTER TABLE public.progresos
  ADD COLUMN IF NOT EXISTS contenido_dsl  text,
  ADD COLUMN IF NOT EXISTS objetivo_id    uuid
    REFERENCES public.plan_objetivos(id) ON DELETE SET NULL;

COMMENT ON COLUMN public.progresos.contenido_dsl IS
  'Contenido libre extraído por IA o por token DSL manual. Linkeable retroactivamente a objetivo_id cuando exista plan curricular.';
COMMENT ON COLUMN public.progresos.objetivo_id IS
  'FK opcional a plan_objetivos. NULL = estado libre sin plan. Poblar retroactivamente al aceptar un plan al fin del semestre.';
```

- [ ] **Step 2: Apply the migration**

```bash
cd C:\Users\omare\OneDrive\Documentos\SOI_Sistema_Operativo_Institucional\09_SOI_WEB_PORTAL\sistema-academico-pwa
npx supabase db push
```

Expected: `Applied 1 migration` with no errors.

- [ ] **Step 3: Verify columns exist**

```bash
npx supabase db diff --linked
```

Expected: No diff (migration was applied). Alternatively open Supabase Studio → Table Editor → `progresos` → verify `contenido_dsl` and `objetivo_id` columns appear.

- [ ] **Step 4: Commit**

```bash
git add supabase/migrations/20260525_progresos_dsl_columns.sql
git commit -m "feat(db): add contenido_dsl and objetivo_id columns to progresos"
```

---

## Task 2: DSL Parser — `!STATE` token

**Files:**
- Modify: `src/portal-maestros/utils/dslParser.js`

- [ ] **Step 1: Add `estados` to TOKEN_PATTERNS**

In `dslParser.js`, find the `TOKEN_PATTERNS` object (line 1) and add the new pattern:

```js
const TOKEN_PATTERNS = {
  alumnos: /#(todos\b|[A-ZÁÉÍÓÚÑ][a-záéíóúñ]+(?:\s+(?:de|la|las|los|del|y|el)\b)?(?:\s+[A-ZÁÉÍÓÚÑ][a-záéíóúñ]+)*|[A-Za-zÁÉÍÓÚáéíóúÑñ]+)/g,
  contenido: /\[([^\]]+)\]/g,
  sugerencias: /\(([^)]+)\)/g,
  tareas: /\{([^}]+)\}/g,
  medidas: /\$([^\s$]+)/g,
  objetivos: />([A-Z]{1,3}(?:-[A-Za-z]+)?-[0-9]+(?:\.[0-9]+)?)/g,
  niveles: />NIVEL-(\d{1,2})/g,
  nodos: />NODO:([A-Z_]+)/g,
  capas: /:::CAPA:\s*([A-Z_]+)/g,
  calificacion: /(\d)\/(\d)/g,
  estados: /!(LOGRADO|EN_PROGRESO|INICIADO)/gi,   // ← ADD THIS LINE
}
```

- [ ] **Step 2: Add `estados` colors to TOKEN_COLORS**

Find the `TOKEN_COLORS` export and add:

```js
export const TOKEN_COLORS = {
  alumnos: '#0d6efd',
  contenido: '#198754',
  sugerencias: '#fd7e14',
  tareas: '#9333ea',
  medidas: '#6dd5ed',
  calificacion: '#dc3545',
  objetivos: '#6c757d',
  niveles: '#5856d6',
  nodos: '#af52de',
  capas: '#ff9500',
  estados: { LOGRADO: '#198754', EN_PROGRESO: '#0d6efd', INICIADO: '#6c757d' },  // ← ADD
}
```

- [ ] **Step 3: Add `estados` extraction to `parseDSLSection`**

Find the `parseDSLSection` function and add `estados` to the returned object:

```js
function parseDSLSection(text) {
  return {
    alumnos: extractTokens(text, TOKEN_PATTERNS.alumnos),
    contenido: extractTokens(text, TOKEN_PATTERNS.contenido),
    sugerencias: extractTokens(text, TOKEN_PATTERNS.sugerencias),
    tareas: extractTokens(text, TOKEN_PATTERNS.tareas),
    medidas: extractTokens(text, TOKEN_PATTERNS.medidas),
    calificacion: extractCalificacion(text),
    objetivos: extractTokens(text, TOKEN_PATTERNS.objetivos),
    niveles: extractTokens(text, TOKEN_PATTERNS.niveles),
    nodos: extractTokens(text, TOKEN_PATTERNS.nodos),
    capas: extractTokens(text, TOKEN_PATTERNS.capas),
    estados: extractTokens(text, TOKEN_PATTERNS.estados).map(e => e.toUpperCase()),  // ← ADD
  }
}
```

Also update `parseDSL` to include `estados: []` in the empty fallback object (the `if (!text...)` branch at line ~98):

```js
return {
  alumnos: [], contenido: [], sugerencias: [], tareas: [], medidas: [],
  calificacion: null, objetivos: [], niveles: [], nodos: [], capas: [],
  estados: [],      // ← ADD
  por_capas: {}
}
```

- [ ] **Step 4: Add highlight for `!STATE` in `highlightDSL`**

Find the `highlightDSL` function. Add this block **before** the `// Calificación` block:

```js
// Estados de progreso
result = result.replace(/!(LOGRADO|EN_PROGRESO|INICIADO)/gi, (_, estado) => {
  const estadoUp = estado.toUpperCase()
  const color = TOKEN_COLORS.estados[estadoUp] ?? '#6c757d'
  return pushPlaceholder(
    `<span class="dsl-token dsl-estado" style="color:${color};font-weight:700;background:${color}18;padding:1px 4px;border-radius:3px">!${estadoUp}</span>`
  )
})
```

- [ ] **Step 5: Update `getTokenSummary` to include estados**

Find `getTokenSummary` and add after the calificacion line:

```js
if (parsed.estados && parsed.estados.length > 0) summary.push(`${parsed.estados.length} estado(s)`)
```

- [ ] **Step 6: Manual test in browser**

Open the app → go to any Asistencia view → type in the DSL editor:
```
#Isabella [Sol Mayor] !LOGRADO 4/5
#todos [Compás 3/4] !EN_PROGRESO
```
Expected: `!LOGRADO` renders green, `!EN_PROGRESO` renders blue.

- [ ] **Step 7: Commit**

```bash
git add src/portal-maestros/utils/dslParser.js
git commit -m "feat(dsl): add !STATE token (LOGRADO/EN_PROGRESO/INICIADO) to parser and highlighter"
```

---

## Task 3: Groq Service — `analyzeObservation()`

**Files:**
- Modify: `src/portal-maestros/services/groqService.js`

- [ ] **Step 1: Add the system prompt constant**

After the existing `STRUCTURE_TO_DSL_PROMPT` constant (around line 140), add:

```js
const ANALYZE_OBSERVATION_PROMPT = `
Sos un asistente pedagógico musical especializado en análisis de registros de clase.

Recibís una observación libre de un maestro de música y un contexto de la clase.
Tu tarea es analizar el texto y devolver ÚNICAMENTE un JSON válido con tres campos, sin texto extra.

FORMATO DE RESPUESTA:
{
  "dsl": "texto en formato DSL usando tokens #Nombre [contenido] !ESTADO (sugerencia) {tarea} N/5",
  "progreso": [
    {
      "alumnos": ["nombre completo según lista del contexto"],
      "contenido": "qué se trabajó (conciso, máx 60 chars)",
      "tipo": "tecnica | repertorio | teoria | interpretacion | otro",
      "estado": "LOGRADO | EN_PROGRESO | INICIADO",
      "nota": null,
      "tarea": null,
      "observacion": "descripción del nivel actual (máx 100 chars)",
      "es_colectivo": false
    }
  ],
  "resumen": "Una frase que resume el foco pedagógico de la sesión (máx 120 chars)"
}

REGLAS DE INFERENCIA DE ESTADO:
- "lograron", "alcanzaron", "dominaron", "ya saben", "lo hicieron bien" → LOGRADO
- "avanzando", "mejorando", "progresando", "casi", "van bien", "muestran progreso" → EN_PROGRESO
- "empezaron", "conocieron", "introdujeron", "por primera vez", "vieron" → INICIADO
- Sin indicador claro → EN_PROGRESO (default conservador)

REGLAS DE TIPO (usar tipoClase del contexto):
- tipoClase "instrumento": progreso es ejecución del instrumento → tipo preferido "tecnica" o "repertorio"
- tipoClase "ensayo_general": progreso colectivo → tipo "repertorio"; mención individual → también tipo "interpretacion"
- tipoClase "teoria": tipo "teoria"
- Obras musicales con nombre propio (Danzón, Minueto, Sonata, etc.) → tipo "repertorio"
- Escalas, posiciones, arco, digitación → tipo "tecnica"
- Ritmo, compás, armonía, lectura → tipo "teoria"

RESOLUCIÓN DE NOMBRES:
- Resolvé nombres parciales usando la lista "alumnos" del contexto: "Yereni" → nombre completo de la lista
- "todos" en el texto = SOLO los alumnos de la lista "presentes" (no toda la clase)
- Si presentes está vacío → usar lista completa "alumnos"
- Si no podés resolver un nombre → usá el nombre tal como lo escribió el maestro

PASAJES Y DETALLES:
- "compases 333 al 348" → incluílo en contenido: "Danzón c.333-348"
- Detalles técnicos del pasaje van en observacion

CAMPO DSL:
- Usá los tokens estándar del DSL
- Incluí !LOGRADO / !EN_PROGRESO / !INICIADO para los estados extraídos
- Las calificaciones van al final: "4/5"

Si el texto no contiene información de progreso evaluable → devolvé progreso: [] y resumen: "Registro general de clase sin evaluaciones individuales detectadas"
`
```

- [ ] **Step 2: Add the `analyzeObservation` function**

After the existing `structureTextToDSL` function (around line 195), add:

```js
/**
 * Analyzes a free-text observation with full class context.
 * Extracts structured progress records per student.
 *
 * @param {string} text - Teacher's free-text observation
 * @param {object} context
 * @param {Array<{id,nombre,nombreCorto}>} context.alumnos - All students in class
 * @param {Array<{id,nombre,nombreCorto}>} context.presentes - Students present today
 * @param {string} context.tipoClase - 'instrumento' | 'ensayo_general' | 'teoria'
 * @param {string} context.instrumento - e.g. 'Violín'
 * @param {string[]} context.sesionesRecientes - Last 2 session contents as plain text
 * @param {string} [context.indicadorActivo] - Active plan indicator if any
 * @returns {Promise<{dsl: string, progreso: Array, resumen: string}>}
 */
export async function analyzeObservation(text, context = {}) {
  const alumnosStr = (context.alumnos || []).map(a => `${a.nombre} (${a.nombreCorto})`).join(', ')
  const presentesStr = (context.presentes || []).map(a => a.nombre).join(', ')
  const recientesStr = (context.sesionesRecientes || []).join('\n---\n')

  const contextBlock = `
CONTEXTO DE LA CLASE:
- Instrumento / tipo: ${context.instrumento || 'no especificado'} (tipoClase: ${context.tipoClase || 'instrumento'})
- Alumnos en clase: ${alumnosStr || 'no especificados'}
- Alumnos presentes hoy: ${presentesStr || alumnosStr || 'todos'}
- Indicador activo del plan: ${context.indicadorActivo || 'ninguno'}
- Sesiones recientes:
${recientesStr || 'sin sesiones previas registradas'}
`

  const systemPrompt = ANALYZE_OBSERVATION_PROMPT + '\n\n' + contextBlock

  try {
    const raw = await proxyChat(
      [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: text },
      ],
      0.1  // low temperature for deterministic JSON output
    )

    // Parse JSON response — Groq sometimes wraps in markdown code blocks
    const cleaned = raw.replace(/^```(?:json)?\n?/m, '').replace(/\n?```$/m, '').trim()
    const parsed = JSON.parse(cleaned)

    return {
      dsl: parsed.dsl || '',
      progreso: Array.isArray(parsed.progreso) ? parsed.progreso : [],
      resumen: parsed.resumen || '',
    }
  } catch (err) {
    console.error('[GROQ] Error en analyzeObservation:', err)
    throw new Error('No se pudo analizar la observación. Verificá la conexión con el servicio IA.')
  }
}
```

- [ ] **Step 3: Manual test**

Open browser DevTools console on the app. Import and test:
```js
// In DevTools:
const { analyzeObservation } = await import('/src/portal-maestros/services/groqService.js')
const result = await analyzeObservation(
  'Yereni y Santa van mejorando el cambio de posición. 4/5. Todos trabajaron el Danzón.',
  {
    alumnos: [
      { id: '1', nombre: 'Yereni Michel', nombreCorto: 'Yereni' },
      { id: '2', nombre: 'Santa Castillo', nombreCorto: 'Santa' },
      { id: '3', nombre: 'Pedro López', nombreCorto: 'Pedro' },
    ],
    presentes: [
      { id: '1', nombre: 'Yereni Michel', nombreCorto: 'Yereni' },
      { id: '2', nombre: 'Santa Castillo', nombreCorto: 'Santa' },
      { id: '3', nombre: 'Pedro López', nombreCorto: 'Pedro' },
    ],
    tipoClase: 'instrumento',
    instrumento: 'Violín',
    sesionesRecientes: [],
  }
)
console.log(JSON.stringify(result, null, 2))
```
Expected: object with `dsl` string, `progreso` array with 2 records (Yereni+Santa and todos), `resumen` string.

- [ ] **Step 4: Commit**

```bash
git add src/portal-maestros/services/groqService.js
git commit -m "feat(groq): add analyzeObservation() with class context and progress extraction"
```

---

## Task 4: Progress Aggregator Service

**Files:**
- Create: `src/portal-maestros/services/progressAggregatorService.js`

- [ ] **Step 1: Create the file**

```js
/**
 * progressAggregatorService.js
 *
 * Saves structured progress records to the `progresos` table.
 * Two entry points:
 *   saveProgressFromAI()  — from AI analysis preview (main flow)
 *   saveProgressFromDSL() — from manual !STATE tokens in DSL (power-user flow)
 */

import { supabase } from '../../lib/supabaseClient.js'
import { parseDSL } from '../utils/dslParser.js'

// ---------------------------------------------------------------------------
// Name resolution helpers
// ---------------------------------------------------------------------------

/**
 * Normalizes a string for fuzzy matching: lowercase, remove accents, trim.
 */
function normalize(str) {
  return (str || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .trim()
}

/**
 * Resolves a name string to an alumno object from the class list.
 * Matches full name or first name (nombreCorto).
 * Returns null if no match found.
 */
function resolveAlumno(name, alumnos) {
  const n = normalize(name)
  return alumnos.find(a =>
    normalize(a.nombre) === n ||
    normalize(a.nombreCorto || a.nombre.split(' ')[0]) === n ||
    normalize(a.nombre).includes(n) ||
    n.includes(normalize(a.nombreCorto || a.nombre.split(' ')[0]))
  ) ?? null
}

/**
 * Expands ["todos"] to all alumnos. Resolves all other names.
 * Returns { resolved: alumno[], errors: string[] }
 */
function resolveAlumnos(alumnoNames, alumnos) {
  const resolved = []
  const errors = []

  for (const name of alumnoNames) {
    if (normalize(name) === 'todos') {
      resolved.push(...alumnos)
      continue
    }
    const match = resolveAlumno(name, alumnos)
    if (match) {
      resolved.push(match)
    } else {
      errors.push(`No se encontró el alumno: "${name}"`)
    }
  }

  // Deduplicate by id
  const seen = new Set()
  const deduped = resolved.filter(a => {
    if (seen.has(a.id)) return false
    seen.add(a.id)
    return true
  })

  return { resolved: deduped, errors }
}

// ---------------------------------------------------------------------------
// DB upsert
// ---------------------------------------------------------------------------

async function upsertProgressRows(rows) {
  if (rows.length === 0) return { data: [], error: null }

  const { data, error } = await supabase
    .from('progresos')
    .upsert(rows, {
      onConflict: 'alumno_id,clase_id,sesion_clase_id,contenido_dsl',
      ignoreDuplicates: false,
    })
    .select('id, alumno_id, contenido_dsl, estado_cualitativo')

  return { data, error }
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Saves progress records from AI analysis.
 * Called after teacher confirms the ProgressPreviewPanel.
 *
 * @param {object} opts
 * @param {string} opts.sesionId
 * @param {string} opts.claseId
 * @param {string} opts.maestroId
 * @param {string} opts.fechaHoy  — 'YYYY-MM-DD'
 * @param {Array}  opts.progressRecords — validated records from preview panel
 * @param {Array}  opts.alumnos — [{id, nombre, nombreCorto}] all class students
 * @returns {Promise<{saved: Array, errors: string[]}>}
 */
export async function saveProgressFromAI({ sesionId, claseId, maestroId, fechaHoy, progressRecords, alumnos }) {
  if (!progressRecords || progressRecords.length === 0) return { saved: [], errors: [] }

  const rows = []
  const errors = []

  for (const record of progressRecords) {
    const { resolved, errors: nameErrors } = resolveAlumnos(record.alumnos || [], alumnos)
    errors.push(...nameErrors)

    for (const alumno of resolved) {
      rows.push({
        alumno_id: alumno.id,
        clase_id: claseId,
        sesion_clase_id: sesionId,
        maestro_id: maestroId,
        fecha_evaluacion: fechaHoy,
        evaluacion_tipo: 'observacion',
        estado_cualitativo: record.estado || 'EN_PROGRESO',
        calificacion: record.nota ?? null,
        contenido_dsl: record.contenido || null,
        observaciones: record.observacion || null,
        indicadores: {
          tipo: record.tipo || 'otro',
          es_colectivo: record.es_colectivo ?? false,
          tarea: record.tarea || null,
        },
        objetivo_id: null,
      })
    }
  }

  try {
    const { data, error } = await upsertProgressRows(rows)
    if (error) throw error

    const saved = (data || []).map(r => ({
      alumnoId: r.alumno_id,
      contenido: r.contenido_dsl,
      estado: r.estado_cualitativo,
    }))

    return { saved, errors }
  } catch (err) {
    console.warn('[Progress] Error al guardar progreso:', err.message)
    return { saved: [], errors: [err.message] }
  }
}

/**
 * Saves progress from manual !STATE tokens in DSL text.
 * Power-user shortcut — no AI needed.
 * Parses triplets: #Nombre [contenido] !ESTADO on the same line.
 *
 * @param {object} opts
 * @param {string} opts.sesionId
 * @param {string} opts.claseId
 * @param {string} opts.maestroId
 * @param {string} opts.fechaHoy
 * @param {string} opts.dslText
 * @param {Array}  opts.alumnos
 * @returns {Promise<{saved: Array, errors: string[]}>}
 */
export async function saveProgressFromDSL({ sesionId, claseId, maestroId, fechaHoy, dslText, alumnos }) {
  if (!dslText || !dslText.trim()) return { saved: [], errors: [] }

  const lines = dslText.split('\n')
  const records = []

  for (const line of lines) {
    const parsed = parseDSL(line)
    if (!parsed.estados || parsed.estados.length === 0) continue
    if (!parsed.contenido || parsed.contenido.length === 0) continue

    const estado = parsed.estados[0]  // first !STATE on the line
    const contenido = parsed.contenido[0]  // first [contenido] on the line
    const alumnoNames = parsed.alumnos.length > 0 ? parsed.alumnos : ['todos']
    const nota = parsed.calificacion?.valor ?? null

    records.push({
      alumnos: alumnoNames,
      contenido,
      tipo: 'tecnica',
      estado,
      nota,
      tarea: parsed.tareas[0] || null,
      observacion: parsed.sugerencias[0] || null,
      es_colectivo: alumnoNames.includes('todos'),
    })
  }

  if (records.length === 0) return { saved: [], errors: [] }

  return saveProgressFromAI({ sesionId, claseId, maestroId, fechaHoy, progressRecords: records, alumnos })
}
```

- [ ] **Step 2: Verify import path for supabaseClient**

Check that `../../lib/supabaseClient.js` resolves correctly from `src/portal-maestros/services/`. Open another service in the same folder (e.g. `observationPromotionService.js`) and confirm it uses the same path.

Expected: Line 7 of `observationPromotionService.js` shows `import { supabase } from '../../lib/supabaseClient.js'` — same path. ✓

- [ ] **Step 3: Commit**

```bash
git add src/portal-maestros/services/progressAggregatorService.js
git commit -m "feat(progress): add progressAggregatorService with AI and DSL paths"
```

---

## Task 5: ProgressPreviewPanel Component

**Files:**
- Create: `src/portal-maestros/components/ProgressPreviewPanel.js`

- [ ] **Step 1: Create the component file**

```js
/**
 * ProgressPreviewPanel.js
 *
 * Shows AI-extracted progress records for teacher confirmation before saving.
 * Teachers can remove individual records or change their state.
 *
 * Usage:
 *   const panel = createProgressPreviewPanel(container, { onConfirm, onCancel })
 *   panel.open({ progreso: [...], resumen: '...' })
 *   panel.close()
 */

const ESTADO_LABELS = {
  LOGRADO:     { label: 'Logrado',      color: 'var(--pm-success, #198754)',  bg: '#19875418' },
  EN_PROGRESO: { label: 'En Progreso',  color: 'var(--pm-primary, #0d6efd)',  bg: '#0d6efd18' },
  INICIADO:    { label: 'Iniciado',     color: 'var(--pm-muted,   #6c757d)',  bg: '#6c757d18' },
}

const ESTADOS_CYCLE = ['LOGRADO', 'EN_PROGRESO', 'INICIADO']

/**
 * @param {HTMLElement} container — element to append the panel into
 * @param {object} opts
 * @param {function} opts.onConfirm — called with final records array
 * @param {function} [opts.onCancel]
 */
export function createProgressPreviewPanel(container, { onConfirm, onCancel }) {
  let _records = []
  let _panelEl = null

  function _renderRecord(rec, idx) {
    const alumnosStr = (rec.alumnos || []).join(', ')
    const estadoInfo = ESTADO_LABELS[rec.estado] ?? ESTADO_LABELS.EN_PROGRESO
    const notaStr = rec.nota ? `· ${rec.nota}/5` : ''
    const tareaStr = rec.tarea ? `<div class="ppp-tarea">📝 ${rec.tarea}</div>` : ''

    return `
      <div class="ppp-card" data-idx="${idx}">
        <div class="ppp-card-header">
          <span class="ppp-alumnos">${alumnosStr}</span>
          <button class="ppp-remove" data-idx="${idx}" title="Quitar este registro">✕</button>
        </div>
        <div class="ppp-card-body">
          <span class="ppp-contenido">${rec.contenido || '—'}</span>
          <span class="ppp-sep">·</span>
          <button
            class="ppp-estado-btn"
            data-idx="${idx}"
            style="color:${estadoInfo.color};background:${estadoInfo.bg};border-color:${estadoInfo.color}"
            title="Click para cambiar estado"
          >${estadoInfo.label}${notaStr}</button>
        </div>
        ${rec.observacion ? `<div class="ppp-obs">${rec.observacion}</div>` : ''}
        ${tareaStr}
      </div>
    `
  }

  function _render(resumen) {
    if (!_panelEl) return
    const hasRecords = _records.length > 0

    _panelEl.innerHTML = `
      <div class="ppp-header">
        <span class="ppp-icon">🎯</span>
        <div class="ppp-header-text">
          <strong>La IA detectó estos avances</strong>
          ${resumen ? `<div class="ppp-resumen">${resumen}</div>` : ''}
        </div>
      </div>
      <div class="ppp-cards">
        ${hasRecords
          ? _records.map((r, i) => _renderRecord(r, i)).join('')
          : '<div class="ppp-empty">No se detectaron registros de progreso en este texto.</div>'
        }
      </div>
      <div class="ppp-footer">
        <button class="pm-btn pm-btn-outline ppp-btn-cancel" id="ppp-cancel">Cancelar</button>
        <button class="pm-btn pm-btn-primary ppp-btn-confirm" id="ppp-confirm" ${!hasRecords ? 'disabled' : ''}>
          ✓ Confirmar y guardar (${_records.length})
        </button>
      </div>
    `

    // Wire remove buttons
    _panelEl.querySelectorAll('.ppp-remove').forEach(btn => {
      btn.onclick = () => {
        const idx = parseInt(btn.dataset.idx)
        _records.splice(idx, 1)
        _render(resumen)
      }
    })

    // Wire estado cycle buttons
    _panelEl.querySelectorAll('.ppp-estado-btn').forEach(btn => {
      btn.onclick = () => {
        const idx = parseInt(btn.dataset.idx)
        const current = _records[idx].estado
        const nextIdx = (ESTADOS_CYCLE.indexOf(current) + 1) % ESTADOS_CYCLE.length
        _records[idx].estado = ESTADOS_CYCLE[nextIdx]
        _render(resumen)
      }
    })

    // Wire confirm
    _panelEl.querySelector('#ppp-confirm').onclick = () => {
      onConfirm([..._records])
      close()
    }

    // Wire cancel
    _panelEl.querySelector('#ppp-cancel').onclick = () => {
      if (onCancel) onCancel()
      close()
    }
  }

  function open({ progreso = [], resumen = '' }) {
    _records = progreso.map(r => ({ ...r }))  // shallow copy so edits don't mutate original

    if (!_panelEl) {
      _panelEl = document.createElement('div')
      _panelEl.className = 'pm-progress-preview'
      container.appendChild(_panelEl)
    }

    _panelEl.style.display = 'block'
    _render(resumen)

    // Scroll panel into view
    setTimeout(() => _panelEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' }), 50)
  }

  function close() {
    if (_panelEl) {
      _panelEl.style.display = 'none'
      _panelEl.innerHTML = ''
    }
  }

  return { open, close }
}
```

- [ ] **Step 2: Commit**

```bash
git add src/portal-maestros/components/ProgressPreviewPanel.js
git commit -m "feat(ui): add ProgressPreviewPanel component for progress confirmation"
```

---

## Task 6: CSS Styles

**Files:**
- Modify: `src/portal-maestros/styles/05-views.css`

- [ ] **Step 1: Add styles at end of file**

Open `src/portal-maestros/styles/05-views.css` and append at the very end:

```css
/* ── Progress Preview Panel ──────────────────────────────────── */
.pm-progress-preview {
  margin-top: 0.75rem;
  border: 1px solid var(--pm-border);
  border-radius: var(--pm-radius-md, 8px);
  overflow: hidden;
  background: var(--pm-surface);
}

.ppp-header {
  display: flex;
  align-items: flex-start;
  gap: 0.6rem;
  padding: 0.75rem 1rem;
  background: color-mix(in srgb, var(--pm-primary, #0d6efd) 6%, transparent);
  border-bottom: 1px solid var(--pm-border);
}

.ppp-icon { font-size: 1.1rem; flex-shrink: 0; margin-top: 1px; }

.ppp-header-text strong {
  font-size: 0.85rem;
  color: var(--pm-text);
}

.ppp-resumen {
  font-size: 0.75rem;
  color: var(--pm-text-muted);
  margin-top: 2px;
  font-style: italic;
}

.ppp-cards {
  padding: 0.5rem;
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.ppp-card {
  border: 1px solid var(--pm-border);
  border-radius: 6px;
  padding: 0.5rem 0.65rem;
  background: var(--pm-bg, #0f1923);
  font-size: 0.82rem;
}

.ppp-card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 4px;
}

.ppp-alumnos {
  font-weight: 700;
  color: var(--pm-primary, #0d6efd);
  font-size: 0.8rem;
}

.ppp-remove {
  background: none;
  border: none;
  cursor: pointer;
  color: var(--pm-text-muted);
  font-size: 0.75rem;
  padding: 1px 4px;
  border-radius: 3px;
  line-height: 1;
}
.ppp-remove:hover { color: var(--pm-danger, #dc3545); background: #dc354518; }

.ppp-card-body {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  flex-wrap: wrap;
}

.ppp-contenido {
  color: var(--pm-text);
  font-size: 0.82rem;
}

.ppp-sep { color: var(--pm-text-muted); font-size: 0.75rem; }

.ppp-estado-btn {
  font-size: 0.72rem;
  font-weight: 700;
  padding: 2px 8px;
  border-radius: 20px;
  border: 1px solid;
  cursor: pointer;
  transition: opacity 0.15s;
  text-transform: uppercase;
  letter-spacing: 0.3px;
}
.ppp-estado-btn:hover { opacity: 0.75; }

.ppp-obs {
  font-size: 0.75rem;
  color: var(--pm-text-muted);
  font-style: italic;
  margin-top: 3px;
}

.ppp-tarea {
  font-size: 0.75rem;
  color: var(--pm-text-muted);
  margin-top: 2px;
}

.ppp-empty {
  padding: 1rem;
  text-align: center;
  color: var(--pm-text-muted);
  font-size: 0.82rem;
  font-style: italic;
}

.ppp-footer {
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
  padding: 0.6rem 0.75rem;
  border-top: 1px solid var(--pm-border);
  background: var(--pm-surface);
}

/* ── Progress Feedback Badge ─────────────────────────────────── */
.pm-progress-feedback {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.78rem;
  font-weight: 600;
  color: var(--pm-success, #198754);
  padding: 6px 10px;
  background: color-mix(in srgb, var(--pm-success, #198754) 12%, transparent);
  border-radius: 6px;
  border-left: 3px solid var(--pm-success, #198754);
  margin-top: 0.5rem;
  animation: pmProgressFadeIn 0.3s ease, pmProgressFadeOut 0.4s ease 3.6s forwards;
}

@keyframes pmProgressFadeIn {
  from { opacity: 0; transform: translateY(-4px); }
  to   { opacity: 1; transform: none; }
}

@keyframes pmProgressFadeOut {
  from { opacity: 1; }
  to   { opacity: 0; }
}
```

- [ ] **Step 2: Commit**

```bash
git add src/portal-maestros/styles/05-views.css
git commit -m "feat(css): add ProgressPreviewPanel and feedback badge styles"
```

---

## Task 7: Wire Toolbar Button

**Files:**
- Modify: `src/portal-maestros/components/dslToolbar.js`

- [ ] **Step 1: Add `onAnalyzeClick` to function signature**

Find the function signature (line 21):
```js
export function createDslToolbar(container, { onInsert, onLoading, onIaProposal, getEditorContent, aiService, onImproveClick, onStructureClick }) {
```

Replace with:
```js
export function createDslToolbar(container, { onInsert, onLoading, onIaProposal, getEditorContent, aiService, onImproveClick, onStructureClick, onAnalyzeClick }) {
```

- [ ] **Step 2: Add the new button to the toolbar HTML**

Find the toolbar HTML block. After `<button class="pm-dsl-tool-btn ai" id="btn-ia-magic"...>`:

```html
<button class="pm-dsl-tool-btn ai" id="btn-ia-magic" title="Estructurar con IA">🚀</button>
<button class="pm-dsl-tool-btn ai" id="btn-analizar-progreso" title="Analizar progreso con IA">🎯</button>
```

- [ ] **Step 3: Wire the new button**

After the existing `container.querySelector('#btn-ia-magic').onclick = handleStructure;` line, add:

```js
const analyzeBtn = container.querySelector('#btn-analizar-progreso')
if (analyzeBtn) {
  analyzeBtn.onclick = async () => {
    const rawText = getEditorContent ? getEditorContent() : ''
    if (!rawText.trim()) return
    if (onAnalyzeClick) {
      analyzeBtn.disabled = true
      analyzeBtn.textContent = '⏳'
      try {
        await onAnalyzeClick(rawText)
      } catch (err) {
        // error handled by caller
      } finally {
        analyzeBtn.disabled = false
        analyzeBtn.textContent = '🎯'
      }
    }
  }
}
```

- [ ] **Step 4: Commit**

```bash
git add src/portal-maestros/components/dslToolbar.js
git commit -m "feat(toolbar): add 🎯 Analizar progreso button to DSL toolbar"
```

---

## Task 8: Wire Everything in `asistenciaView.js`

**Files:**
- Modify: `src/portal-maestros/views/asistenciaView.js`

- [ ] **Step 1: Add new imports at top of file**

Find the existing imports block (lines 1-36). Add after the last import:

```js
import { analyzeObservation } from '../services/groqService.js'
import { saveProgressFromAI, saveProgressFromDSL } from '../services/progressAggregatorService.js'
import { createProgressPreviewPanel } from '../components/ProgressPreviewPanel.js'
```

- [ ] **Step 2: Add `_inferirTipoClase` helper**

Find the `// === Helper functions` comment near line 1790. Before it, add:

```js
function _inferirTipoClase(clase) {
  const nombre = (clase?.nombre || '').toLowerCase()
  const instrumento = (clase?.instrumento || '').toLowerCase()
  if (/orquesta|ensamble|ensemble|coro|ensayo/.test(nombre)) return 'ensayo_general'
  if (/teor[ií]a|solfeo|lenguaje\s+musical/.test(nombre)) return 'teoria'
  if (instrumento) return 'instrumento'
  return 'instrumento'
}
```

- [ ] **Step 3: Add `_showProgressFeedback` helper**

Right after `_inferirTipoClase`, add:

```js
function _showProgressFeedback(saved, editorContainer) {
  if (!saved || saved.length === 0) return

  // Remove any existing badge
  editorContainer.parentNode.querySelectorAll('.pm-progress-feedback').forEach(el => el.remove())

  const names = [...new Set(saved.slice(0, 3).map(s => s.contenido || 'progreso'))]
  const label = names.join(' · ') + (saved.length > 3 ? ` y ${saved.length - 3} más` : '')

  const badge = document.createElement('div')
  badge.className = 'pm-progress-feedback'
  badge.innerHTML = `<i class="bi bi-check-circle-fill"></i> <span>${saved.length} registro(s) guardados — ${label}</span>`
  editorContainer.parentNode.insertBefore(badge, editorContainer.nextSibling)

  setTimeout(() => badge.remove(), 4200)
}
```

- [ ] **Step 4: Create the ProgressPreviewPanel instance**

Find the block where `structureModal` is created (around line 635). After it, add:

```js
// === Progress Preview Panel ===
const progressPanel = createProgressPreviewPanel(editorContainer.parentNode, {
  onConfirm: async (records) => {
    try {
      const alumnosConId = alumnos.map(a => ({
        id: a.id,
        nombre: a.nombre_completo || a.nombre || '',
        nombreCorto: (a.nombre_completo || a.nombre || '').split(' ')[0],
      }))
      const { saved, errors } = await saveProgressFromAI({
        sesionId,
        claseId,
        maestroId: maestro.id,
        fechaHoy,
        progressRecords: records,
        alumnos: alumnosConId,
      })
      if (errors.length) console.warn('[Progress] Errores parciales:', errors)
      _showProgressFeedback(saved, editorContainer)
    } catch (err) {
      AppToast.error('Error al guardar progreso: ' + err.message)
    }
  },
  onCancel: () => {},
})
```

- [ ] **Step 5: Add `onAnalyzeClick` to the toolbar initialization**

Find the `const toolbar = createDslToolbar(toolbarContainer, {` block (around line 641). Add `onAnalyzeClick` to the options object:

```js
const toolbar = createDslToolbar(toolbarContainer, {
  onInsert: (text, cursorOffset, triggerAC) => editor.insertText(text, cursorOffset, triggerAC),
  getEditorContent: () => editor.getValue(),
  onLoading: (loading) => {},
  onIaProposal: async (proposal) => {},
  onImproveClick: async (text) => {
    // ... existing code unchanged ...
  },
  onStructureClick: async (text) => {
    // ... existing code unchanged ...
  },
  onAnalyzeClick: async (text) => {
    try {
      // Build class context
      const alumnosPresentes = alumnos.filter(a => estado[a.id] && estado[a.id] !== 'A')
      const alumnosMapped = alumnos.map(a => ({
        id: a.id,
        nombre: a.nombre_completo || a.nombre || '',
        nombreCorto: (a.nombre_completo || a.nombre || '').split(' ')[0],
      }))
      const presentesMapped = alumnosPresentes.map(a => ({
        id: a.id,
        nombre: a.nombre_completo || a.nombre || '',
        nombreCorto: (a.nombre_completo || a.nombre || '').split(' ')[0],
      }))

      const contextoGroq = {
        alumnos: alumnosMapped,
        presentes: presentesMapped,
        tipoClase: _inferirTipoClase(clase),
        instrumento: clase.instrumento || '',
        sesionesRecientes: (snapshots || [])
          .slice(-2)
          .map(s => s.contenido || '')
          .filter(Boolean),
        indicadorActivo: routeTreeBar?.getActiveIndicador()?.nombre || '',
      }

      const result = await analyzeObservation(text, contextoGroq)
      progressPanel.open({ progreso: result.progreso, resumen: result.resumen })

    } catch (err) {
      AppToast.error('Error al analizar con IA: ' + err.message)
    }
  },
})
```

- [ ] **Step 6: Add DSL manual path to observation save handler**

Find the observation save handler (around line 1229 after the existing save logic). After the `await saveObservation(...)` call and before the `const promo = await promocionarObservacionesAlumnos(...)` call, add:

```js
// Auto-save !STATE tokens if present in DSL
const parsedForProgress = parseDSL(raw)
if (parsedForProgress.estados && parsedForProgress.estados.length > 0) {
  const alumnosConId = alumnos.map(a => ({
    id: a.id,
    nombre: a.nombre_completo || a.nombre || '',
    nombreCorto: (a.nombre_completo || a.nombre || '').split(' ')[0],
  }))
  saveProgressFromDSL({
    sesionId,
    claseId,
    maestroId: maestro.id,
    fechaHoy,
    dslText: raw,
    alumnos: alumnosConId,
  }).then(({ saved, errors }) => {
    if (errors.length) console.warn('[Progress DSL] Errores:', errors)
    if (saved.length) _showProgressFeedback(saved, editorContainer)
  }).catch(err => console.warn('[Progress DSL] Error:', err.message))
}
```

Also add the missing `parseDSL` import at the top if not already there — check line 6, it should already be `import { parseDSL } from '../utils/dslParser.js'`. ✓ Already imported.

- [ ] **Step 7: End-to-end manual test**

1. Open the app → go to an Asistencia class view
2. Mark some students as present (P)
3. In the DSL editor, write: `Yereni y Santa van mejorando el cambio de posicion. Todos trabajaron el Danzon en los compases 30 al 45.`
4. Click the new 🎯 button in the toolbar
5. Expected: ProgressPreviewPanel appears below editor with 2 cards (Yereni+Santa, todos)
6. Click "Confirmar y guardar"
7. Expected: Panel disappears, green feedback badge appears for 4 seconds
8. Open Supabase Studio → `progresos` table → verify new rows with `evaluacion_tipo='observacion'`

Test DSL manual path:
1. Write: `#Isabella [Sol Mayor] !LOGRADO 4/5`
2. Click "Guardar observación" (existing button)
3. Expected: Green badge appears, `progresos` row created with `estado_cualitativo='LOGRADO'`

- [ ] **Step 8: Commit**

```bash
git add src/portal-maestros/views/asistenciaView.js
git commit -m "feat(asistencia): wire analyzeObservation, ProgressPreviewPanel, and progress badge"
```

---

## Self-Review

**Spec coverage check:**
- ✅ `analyzeObservation` with full context (alumnos, presentes, tipoClase, sesionesRecientes) — Task 3
- ✅ `#todos` = presentes only — Task 3 system prompt + Task 4 aggregator
- ✅ tipoClase inference from class name/instrument — Task 8 `_inferirTipoClase`
- ✅ Preview panel with remove + state cycle — Task 5
- ✅ `saveProgressFromAI` — Task 4
- ✅ `saveProgressFromDSL` for `!STATE` manual tokens — Task 4 + Task 8 Step 6
- ✅ DB migration — Task 1
- ✅ Feedback badge 4 seconds — Task 8 Step 3
- ✅ Failure does not block observation save — Task 8 Step 6 (async, no await on the DSL path; AI path is separate button)
- ✅ `dslParser.js` — Task 2
- ✅ CSS — Task 6

**Type consistency check:**
- `saveProgressFromAI` and `saveProgressFromDSL` both in `progressAggregatorService.js` — consistent
- `progressPanel.open({ progreso, resumen })` matches `createProgressPreviewPanel` `open()` signature — ✓
- `analyzeObservation` returns `{ dsl, progreso, resumen }` — matches usage in `onAnalyzeClick` — ✓
- `alumnos` shape `{id, nombre, nombreCorto}` used consistently across Task 3, 4, 8 — ✓
