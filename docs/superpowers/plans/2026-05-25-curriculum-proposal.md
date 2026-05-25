# AI Curriculum Proposal — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Allow teachers to generate a structured curriculum proposal (pilares + objetivos) from accumulated progress records, review/edit it inline, and adopt it as a real curriculum with one click.

**Architecture:** `progressInsightService` fetches and aggregates `progresos` rows → `groqService.proposeCurriculum` sends to Groq → `CurriculumProposalPanel` shows editable pilares+objetivos → `curriculoApi.adoptarPropuesta` creates records in DB. Entry point is a single button inside the planificación card in `asistenciaView.js`.

**Tech Stack:** Vanilla JS ES Modules, Supabase JS v2, Groq via `groq-proxy` Edge Function, no test framework (manual browser testing only)

---

## CRITICAL CONTEXT FOR GEMINI

### Project root
```
C:\Users\omare\OneDrive\Documentos\SOI_Sistema_Operativo_Institucional\09_SOI_WEB_PORTAL\sistema-academico-pwa
```

### Key rules
- **DO NOT push to GitHub.** Work locally only. Commit to local git only.
- Vanilla JS ES Modules — no bundler, no TypeScript, no JSX.
- All Groq calls go through `proxyChat()` in `src/portal-maestros/services/groqService.js` — never call Groq API directly.
- Supabase client is at `src/lib/supabaseClient.js` — import as `import { supabase } from '../../lib/supabaseClient.js'` (adjust relative path as needed).
- Use `AppToast.error(msg)` / `AppToast.success(msg)` from `src/shared/components/AppToast.js` for user feedback.
- Follow the exact same component pattern as `src/portal-maestros/components/ProgressPreviewPanel.js` — factory function, single DOM element, `.onclick` (not addEventListener) for event wiring.
- All user/AI text injected into `innerHTML` must be escaped with an `esc()` helper (see ProgressPreviewPanel.js lines 22-29 for the exact implementation).
- Prompts to Groq must use **Spanish neutro** (no voseo, no "sos", no "usás" — use "eres", "analizas", "propones").
- Conventional commits: `feat(scope):`, `fix(scope):`, `docs:` — no "Co-Authored-By".

### Existing API to reuse — `src/modules/planificacion/api/curriculoApi.js`
```js
// Creates a curriculum record. Returns { id, instrumento, nivel, ... }
export async function crearCurriculo({ instrumento, nivel, descripcion })

// Creates a pilar under a curriculo. Returns { id, curriculo_id, nombre, orden }
export async function crearPilar(curriculo_id, nombre, orden = 0)

// Creates an objective under a pilar. Returns { id, pilar_id, descripcion, orden }
export async function crearObjetivo(pilar_id, descripcion, orden = 0)
```

### Existing Groq pattern — `src/portal-maestros/services/groqService.js`
```js
// proxyChat is already defined — call it directly, don't redefine it.
// Signature: proxyChat(messages, temperature = 0.2) → Promise<string>
// messages = [{ role: 'system', content: '...' }, { role: 'user', content: '...' }]

// Strip markdown from JSON responses (Groq sometimes wraps in ```json blocks):
const cleaned = raw.replace(/^\s*```(?:json)?\s*/i, '').replace(/\s*```\s*$/i, '').trim()
const parsed = JSON.parse(cleaned)
```

### Where to insert the button in asistenciaView.js
Find this comment in the HTML template (around line 582):
```html
<div id="pm-route-tree-container" class="pm-route-tree-dropdown-box"></div>
        </div>
      </div>
```
Insert the "Proponer plan" button AFTER `</div></div>` (the closing of pm-planificacion-dropdown and pm-planificacion-card), BEFORE `<div class="pm-asist-dsl-section"`.

Actually — insert it inside `#pm-planificacion-dropdown`, after `#pm-route-tree-container`:
```html
<div id="pm-curriculo-proposal-trigger" style="padding:0.5rem 0.75rem 0.75rem;">
  <button class="pm-btn pm-btn-outline" id="btn-proponer-curriculo" style="width:100%;font-size:0.82rem;">
    <i class="bi bi-stars"></i> Proponer plan curricular con IA
  </button>
</div>
```

### Variables in scope in asistenciaView.js `_renderVista` function
These are available: `claseId`, `clase` (object with `.instrumento`, `.nombre`), `maestro` (object with `.id`), `alumnos` (array), `estado` (object keyed by alumno id), `AppToast`, `supabase`.

---

## File Map

| File | Status | Responsibility |
|------|--------|----------------|
| `src/portal-maestros/services/progressInsightService.js` | **Create** | Query + aggregate `progresos` for a class over N weeks |
| `src/portal-maestros/services/groqService.js` | **Modify** | Add `proposeCurriculum(insights, context)` |
| `src/portal-maestros/components/CurriculumProposalPanel.js` | **Create** | Inline review/edit UI for pilares + objetivos |
| `src/modules/planificacion/api/curriculoApi.js` | **Modify** | Add `adoptarPropuesta({ instrumento, nivel, descripcion, pilares })` |
| `src/portal-maestros/styles/05-views.css` | **Modify** | `.cpp-*` panel styles |
| `src/portal-maestros/views/asistenciaView.js` | **Modify** | Button in planificación card + full wire-up |

---

## Task 1: progressInsightService.js

**Files:**
- Create: `src/portal-maestros/services/progressInsightService.js`

- [ ] **Step 1: Create the file**

```js
/**
 * progressInsightService.js
 *
 * Fetches and aggregates progress records (progresos) for a class
 * over a rolling N-week window. Prepares structured data for Groq analysis.
 */

import { supabase } from '../../lib/supabaseClient.js'

/**
 * Fetches and aggregates progresos for the given class over the last N weeks.
 *
 * @param {string} claseId
 * @param {number} semanas - Number of weeks to look back (default 12)
 * @returns {Promise<{
 *   totalSesiones: number,
 *   fechaDesde: string,
 *   registros: Array<{
 *     contenido_dsl: string,
 *     tipo: string,
 *     estado: string,
 *     frecuencia: number,
 *     alumnos: string[]
 *   }>
 * }>}
 */
export async function fetchInsights(claseId, semanas = 12) {
  const fechaDesde = new Date()
  fechaDesde.setDate(fechaDesde.getDate() - semanas * 7)
  const fechaDesdeStr = fechaDesde.toISOString().split('T')[0]

  const { data, error } = await supabase
    .from('progresos')
    .select(`
      contenido_dsl,
      tipo,
      estado_cualitativo,
      fecha_evaluacion,
      alumnos ( nombre_completo )
    `)
    .eq('clase_id', claseId)
    .eq('evaluacion_tipo', 'observacion')
    .gte('fecha_evaluacion', fechaDesdeStr)
    .not('contenido_dsl', 'is', null)
    .neq('contenido_dsl', '')
    .order('fecha_evaluacion', { ascending: false })

  if (error) throw new Error('Error al obtener registros de progreso: ' + error.message)
  if (!data || data.length === 0) {
    return { totalSesiones: 0, fechaDesde: fechaDesdeStr, registros: [] }
  }

  // Count unique session dates for totalSesiones
  const sesionesUnicas = new Set(data.map(r => r.fecha_evaluacion))

  // Group rows by contenido_dsl (normalized: trim + lowercase)
  const groups = new Map()
  for (const row of data) {
    const key = (row.contenido_dsl || '').trim().toLowerCase()
    if (!key) continue

    if (!groups.has(key)) {
      groups.set(key, {
        contenido_dsl: row.contenido_dsl.trim(),
        tipo: row.tipo || 'otro',
        estados: [],
        fechas: new Set(),
        alumnos: new Set(),
      })
    }
    const group = groups.get(key)
    group.estados.push(row.estado_cualitativo || 'EN_PROGRESO')
    group.fechas.add(row.fecha_evaluacion)
    const nombreAlumno = row.alumnos?.nombre_completo
    if (nombreAlumno) group.alumnos.add(nombreAlumno)
  }

  // Build registros: most recent estado wins, frecuencia = unique session count
  const registros = Array.from(groups.values()).map(g => ({
    contenido_dsl: g.contenido_dsl,
    tipo: g.tipo,
    estado: g.estados[0] || 'EN_PROGRESO', // first = most recent (sorted desc)
    frecuencia: g.fechas.size,
    alumnos: Array.from(g.alumnos),
  }))

  // Sort by frecuencia descending — most recurring content first
  registros.sort((a, b) => b.frecuencia - a.frecuencia)

  return {
    totalSesiones: sesionesUnicas.size,
    fechaDesde: fechaDesdeStr,
    registros,
  }
}
```

- [ ] **Step 2: Verify the import path for supabaseClient**

The file is at `src/portal-maestros/services/progressInsightService.js`.
Path to supabaseClient from there: `../../lib/supabaseClient.js` ✓ (same as other services in that folder — confirmed by checking `progressAggregatorService.js` line 10).

- [ ] **Step 3: Commit**

```bash
git add src/portal-maestros/services/progressInsightService.js
git commit -m "feat(insights): add progressInsightService to aggregate progresos for AI analysis"
```

---

## Task 2: groqService.js — `proposeCurriculum()`

**Files:**
- Modify: `src/portal-maestros/services/groqService.js`

- [ ] **Step 1: Add the system prompt constant**

Open `src/portal-maestros/services/groqService.js`. After the existing `ANALYZE_OBSERVATION_PROMPT` constant (around line 196), add:

```js
const PROPOSE_CURRICULUM_PROMPT = `
Eres un pedagogo musical especializado en diseño curricular.

Analizas registros reales de clase de un período determinado y propones
un plan curricular estructurado en pilares y objetivos.

FORMATO DE RESPUESTA (JSON válido, sin texto adicional):
{
  "pilares": [
    {
      "nombre": "Nombre del pilar",
      "tipo": "tecnica|repertorio|teoria|interpretacion",
      "objetivos": [
        {
          "descripcion": "Nombre conciso del objetivo (máximo 60 caracteres)",
          "prioridad": "alta|media|consolidacion"
        }
      ]
    }
  ],
  "resumen": "Una frase que describe el foco pedagógico detectado (máximo 120 caracteres)"
}

REGLAS DE CONSTRUCCIÓN:
- Máximo 4 pilares — usa solo los tipos que aparecen en los datos
- De 2 a 6 objetivos por pilar
- Los registros con estado LOGRADO indican consolidación — inclúyelos con prioridad "consolidacion"
- Los registros EN_PROGRESO son el foco principal — asígnales prioridad "alta"
- Los registros INICIADO son objetivos emergentes — inclúyelos solo si frecuencia >= 2, prioridad "media"
- Nombres de objetivos: concisos, pedagógicamente precisos, máximo 60 caracteres
- No inventes contenidos que no estén presentes en los registros
- Si no hay suficientes datos para un pilar, omítelo
`
```

- [ ] **Step 2: Add the `proposeCurriculum` function**

After the `analyzeObservation` function (around line 306), add:

```js
/**
 * Proposes a structured curriculum plan from aggregated progress insights.
 *
 * @param {object} insights - Result of progressInsightService.fetchInsights()
 * @param {number} insights.totalSesiones
 * @param {string} insights.fechaDesde
 * @param {Array}  insights.registros
 * @param {object} context
 * @param {string} context.instrumento
 * @param {string} context.nivel
 * @param {string} context.nombreClase
 * @returns {Promise<{ pilares: Array, resumen: string }>}
 */
export async function proposeCurriculum(insights, context = {}) {
  const contextBlock = `
CONTEXTO:
- Clase: ${context.nombreClase || 'no especificado'}
- Instrumento: ${context.instrumento || 'no especificado'}
- Nivel estimado: ${context.nivel || 'no especificado'}
- Total sesiones analizadas: ${insights.totalSesiones}
- Período desde: ${insights.fechaDesde}

REGISTROS (ordenados por frecuencia de aparición en sesiones):
${JSON.stringify(insights.registros, null, 2)}
`

  const systemPrompt = PROPOSE_CURRICULUM_PROMPT + '\n\n' + contextBlock

  try {
    const raw = await proxyChat(
      [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: 'Genera la propuesta curricular basada en estos registros.' },
      ],
      0.2
    )

    // Strip markdown code blocks — Groq sometimes wraps response in ```json
    const cleaned = raw.replace(/^\s*```(?:json)?\s*/i, '').replace(/\s*```\s*$/i, '').trim()
    console.debug('[GROQ] proposeCurriculum cleaned:', cleaned)
    const parsed = JSON.parse(cleaned)

    return {
      pilares: Array.isArray(parsed.pilares) ? parsed.pilares : [],
      resumen: parsed.resumen || '',
    }
  } catch (err) {
    console.error('[GROQ] Error en proposeCurriculum:', err, '| raw:', typeof raw !== 'undefined' ? raw : '(no response)')
    throw new Error('No se pudo generar la propuesta curricular. Verifica la conexión con el servicio de IA.')
  }
}
```

- [ ] **Step 3: Commit**

```bash
git add src/portal-maestros/services/groqService.js
git commit -m "feat(groq): add proposeCurriculum() for AI curriculum generation"
```

---

## Task 3: curriculoApi.js — `adoptarPropuesta()`

**Files:**
- Modify: `src/modules/planificacion/api/curriculoApi.js`

- [ ] **Step 1: Add `adoptarPropuesta` at the end of the file**

Open `src/modules/planificacion/api/curriculoApi.js` and append after `eliminarObjetivo`:

```js
// ── Adopt AI Proposal ────────────────────────────────────────────────────────

/**
 * Creates a complete curriculum from an AI proposal in a single transaction.
 * Calls crearCurriculo → crearPilar (per pilar) → crearObjetivo (per objetivo).
 * Throws on any step failure — no rollback (partial curriculo can be deleted via editor).
 *
 * @param {object} opts
 * @param {string} opts.instrumento
 * @param {string} opts.nivel
 * @param {string} opts.descripcion - AI-generated summary used as curriculo description
 * @param {Array}  opts.pilares - [{ nombre, tipo, objetivos: [{ descripcion }] }]
 * @returns {Promise<{ id: string }>} - the created curriculo
 */
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

  // Step 2: create pilares and their objetivos in order
  for (let i = 0; i < pilares.length; i++) {
    const pilarData = pilares[i]
    const pilar = await crearPilar(curriculo.id, pilarData.nombre || `Pilar ${i + 1}`, i)

    const objetivos = pilarData.objetivos || []
    for (let j = 0; j < objetivos.length; j++) {
      await crearObjetivo(pilar.id, objetivos[j].descripcion || `Objetivo ${j + 1}`, j)
    }
  }

  return curriculo
}
```

- [ ] **Step 2: Commit**

```bash
git add src/modules/planificacion/api/curriculoApi.js
git commit -m "feat(curriculo): add adoptarPropuesta() for one-click curriculum creation from AI"
```

---

## Task 4: CurriculumProposalPanel.js

**Files:**
- Create: `src/portal-maestros/components/CurriculumProposalPanel.js`

This follows the EXACT same factory-function pattern as `src/portal-maestros/components/ProgressPreviewPanel.js`. Read that file first to understand the pattern before implementing.

- [ ] **Step 1: Create the file**

```js
/**
 * CurriculumProposalPanel.js
 *
 * Shows AI-proposed curriculum (pilares + objetivos) for teacher review and editing
 * before adopting as a real curriculum record.
 *
 * Usage:
 *   const panel = createCurriculumProposalPanel(container, { onAdopt, onCancel })
 *   panel.open({ pilares, resumen, instrumento, nivel })
 *   panel.close()
 */

const TIPO_COLORS = {
  tecnica:        { color: '#0d6efd', bg: '#0d6efd15' },
  repertorio:     { color: '#198754', bg: '#19875415' },
  teoria:         { color: '#fd7e14', bg: '#fd7e1415' },
  interpretacion: { color: '#6f42c1', bg: '#6f42c115' },
  otro:           { color: '#6c757d', bg: '#6c757d15' },
}

const PRIORIDAD_LABELS = {
  alta:          { label: 'Foco',       color: '#dc3545' },
  media:         { label: 'Secundario', color: '#fd7e14' },
  consolidacion: { label: 'Consolidar', color: '#198754' },
}

/** Escapes HTML special chars to prevent XSS in innerHTML. */
function esc(str) {
  return String(str ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

/**
 * @param {HTMLElement} container
 * @param {object} opts
 * @param {function} opts.onAdopt  - called with { instrumento, nivel, resumen, pilares }
 * @param {function} [opts.onCancel]
 */
export function createCurriculumProposalPanel(container, { onAdopt, onCancel }) {
  let _pilares = []
  let _resumen = ''
  let _panelEl = null

  function _renderObjetivo(obj, pilarIdx, objIdx) {
    const prioInfo = PRIORIDAD_LABELS[obj.prioridad] ?? PRIORIDAD_LABELS.media
    return `
      <div class="cpp-objetivo-row" data-pilar="${pilarIdx}" data-obj="${objIdx}">
        <span
          class="cpp-objetivo-text"
          data-pilar="${pilarIdx}"
          data-obj="${objIdx}"
          title="Click para editar"
        >${esc(obj.descripcion)}</span>
        <span class="cpp-prioridad-badge" style="color:${prioInfo.color}">${prioInfo.label}</span>
        <button class="cpp-remove-obj" data-pilar="${pilarIdx}" data-obj="${objIdx}" title="Quitar objetivo">✕</button>
      </div>
    `
  }

  function _renderPilar(pilar, pilarIdx) {
    const tipoInfo = TIPO_COLORS[pilar.tipo] ?? TIPO_COLORS.otro
    const objetivosHtml = (pilar.objetivos || [])
      .map((obj, objIdx) => _renderObjetivo(obj, pilarIdx, objIdx))
      .join('')

    return `
      <div class="cpp-pilar" data-pilar="${pilarIdx}" style="border-left:3px solid ${tipoInfo.color};background:${tipoInfo.bg}">
        <div class="cpp-pilar-header">
          <span
            class="cpp-pilar-title"
            data-pilar="${pilarIdx}"
            title="Click para editar nombre"
          >${esc(pilar.nombre)}</span>
          <button class="cpp-remove-pilar" data-pilar="${pilarIdx}" title="Quitar pilar">✕</button>
        </div>
        <div class="cpp-objetivos">
          ${objetivosHtml || '<div class="cpp-no-obj">Sin objetivos</div>'}
        </div>
      </div>
    `
  }

  function _getInstrumento() {
    return _panelEl?.querySelector('#cpp-instrumento')?.value?.trim() || ''
  }

  function _getNivel() {
    return _panelEl?.querySelector('#cpp-nivel')?.value?.trim() || ''
  }

  function _canAdopt() {
    if (!_getInstrumento()) return false
    if (_pilares.length === 0) return false
    return _pilares.every(p => (p.objetivos || []).length > 0)
  }

  function _render(instrumento, nivel) {
    if (!_panelEl) return

    const hasPilares = _pilares.length > 0

    _panelEl.innerHTML = `
      <div class="cpp-header">
        <span class="cpp-icon">✨</span>
        <div class="cpp-header-text">
          <strong>Propuesta curricular generada por IA</strong>
          ${_resumen ? `<div class="cpp-resumen">${esc(_resumen)}</div>` : ''}
        </div>
      </div>
      <div class="cpp-pilares">
        ${hasPilares
          ? _pilares.map((p, i) => _renderPilar(p, i)).join('')
          : '<div class="cpp-empty">La IA no detectó suficientes datos para generar una propuesta.</div>'
        }
      </div>
      <div class="cpp-footer">
        <div class="cpp-fields">
          <label class="cpp-field-label">Instrumento
            <input type="text" id="cpp-instrumento" class="cpp-input" value="${esc(instrumento)}" placeholder="ej. Violín" />
          </label>
          <label class="cpp-field-label">Nivel
            <input type="text" id="cpp-nivel" class="cpp-input" value="${esc(nivel)}" placeholder="ej. Básico" />
          </label>
        </div>
        <div class="cpp-actions">
          <button class="pm-btn pm-btn-outline" id="cpp-cancel">Cancelar</button>
          <button class="pm-btn pm-btn-primary" id="cpp-adopt" ${!_canAdopt() ? 'disabled' : ''}>
            ✓ Adoptar plan (${_pilares.length} pilares)
          </button>
        </div>
      </div>
    `

    // Wire pilar title click → inline edit
    _panelEl.querySelectorAll('.cpp-pilar-title').forEach(span => {
      span.onclick = () => {
        const pi = parseInt(span.dataset.pilar)
        const input = document.createElement('input')
        input.type = 'text'
        input.className = 'cpp-input cpp-inline-input'
        input.value = _pilares[pi].nombre
        span.replaceWith(input)
        input.focus()
        const save = () => {
          _pilares[pi].nombre = input.value.trim() || _pilares[pi].nombre
          _render(_getInstrumento(), _getNivel())
        }
        input.onblur = save
        input.onkeydown = e => { if (e.key === 'Enter') { e.preventDefault(); save() } }
      }
    })

    // Wire objetivo text click → inline edit
    _panelEl.querySelectorAll('.cpp-objetivo-text').forEach(span => {
      span.onclick = () => {
        const pi = parseInt(span.dataset.pilar)
        const oi = parseInt(span.dataset.obj)
        const input = document.createElement('input')
        input.type = 'text'
        input.className = 'cpp-input cpp-inline-input'
        input.value = _pilares[pi].objetivos[oi].descripcion
        span.replaceWith(input)
        input.focus()
        const save = () => {
          _pilares[pi].objetivos[oi].descripcion = input.value.trim() || _pilares[pi].objetivos[oi].descripcion
          _render(_getInstrumento(), _getNivel())
        }
        input.onblur = save
        input.onkeydown = e => { if (e.key === 'Enter') { e.preventDefault(); save() } }
      }
    })

    // Wire remove objetivo buttons
    _panelEl.querySelectorAll('.cpp-remove-obj').forEach(btn => {
      btn.onclick = () => {
        const pi = parseInt(btn.dataset.pilar)
        const oi = parseInt(btn.dataset.obj)
        _pilares[pi].objetivos.splice(oi, 1)
        _render(_getInstrumento(), _getNivel())
      }
    })

    // Wire remove pilar buttons
    _panelEl.querySelectorAll('.cpp-remove-pilar').forEach(btn => {
      btn.onclick = () => {
        const pi = parseInt(btn.dataset.pilar)
        _pilares.splice(pi, 1)
        _render(_getInstrumento(), _getNivel())
      }
    })

    // Re-validate adopt button on field input
    const instrInput = _panelEl.querySelector('#cpp-instrumento')
    const adoptBtn = _panelEl.querySelector('#cpp-adopt')
    if (instrInput && adoptBtn) {
      instrInput.oninput = () => {
        adoptBtn.disabled = !_canAdopt()
      }
    }

    // Wire adopt button
    if (adoptBtn) {
      adoptBtn.onclick = () => {
        const finalInstrumento = _getInstrumento()
        const finalNivel = _getNivel()
        if (!finalInstrumento) {
          instrInput?.focus()
          return
        }
        onAdopt({
          instrumento: finalInstrumento,
          nivel: finalNivel,
          resumen: _resumen,
          pilares: _pilares,
        })
        close()
      }
    }

    // Wire cancel button
    const cancelBtn = _panelEl.querySelector('#cpp-cancel')
    if (cancelBtn) {
      cancelBtn.onclick = () => {
        if (onCancel) onCancel()
        close()
      }
    }
  }

  function open({ pilares = [], resumen = '', instrumento = '', nivel = '' }) {
    // Deep-copy pilares so edits don't mutate the original
    _pilares = pilares.map(p => ({
      ...p,
      objetivos: (p.objetivos || []).map(o => ({ ...o })),
    }))
    _resumen = resumen

    if (!_panelEl) {
      _panelEl = document.createElement('div')
      _panelEl.className = 'cpp-panel'
      container.appendChild(_panelEl)
    }

    _panelEl.style.display = 'block'
    _render(instrumento, nivel)

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
git add src/portal-maestros/components/CurriculumProposalPanel.js
git commit -m "feat(ui): add CurriculumProposalPanel with inline editing for AI curriculum review"
```

---

## Task 5: CSS Styles

**Files:**
- Modify: `src/portal-maestros/styles/05-views.css`

- [ ] **Step 1: Append styles at the VERY END of the file**

Open `src/portal-maestros/styles/05-views.css` and append this block at the end:

```css
/* ── Curriculum Proposal Panel ───────────────────────────────── */
.cpp-panel {
  margin-top: 0.75rem;
  border: 1px solid var(--pm-border);
  border-radius: var(--pm-radius-md, 8px);
  overflow: hidden;
  background: var(--pm-surface);
}

.cpp-header {
  display: flex;
  align-items: flex-start;
  gap: 0.6rem;
  padding: 0.75rem 1rem;
  background: color-mix(in srgb, #6f42c1 6%, transparent);
  border-bottom: 1px solid var(--pm-border);
}

.cpp-icon { font-size: 1.1rem; flex-shrink: 0; margin-top: 1px; }

.cpp-header-text strong {
  font-size: 0.85rem;
  color: var(--pm-text);
}

.cpp-resumen {
  font-size: 0.75rem;
  color: var(--pm-text-muted);
  margin-top: 2px;
  font-style: italic;
}

.cpp-pilares {
  padding: 0.5rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.cpp-pilar {
  border: 1px solid var(--pm-border);
  border-radius: 6px;
  padding: 0.5rem 0.65rem;
  font-size: 0.82rem;
}

.cpp-pilar-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 6px;
}

.cpp-pilar-title {
  font-weight: 700;
  font-size: 0.83rem;
  color: var(--pm-text);
  cursor: text;
  padding: 1px 3px;
  border-radius: 3px;
}
.cpp-pilar-title:hover { background: rgba(255,255,255,0.07); }

.cpp-remove-pilar,
.cpp-remove-obj {
  background: none;
  border: none;
  cursor: pointer;
  color: var(--pm-text-muted);
  font-size: 0.72rem;
  padding: 1px 4px;
  border-radius: 3px;
  line-height: 1;
}
.cpp-remove-pilar:hover,
.cpp-remove-obj:hover { color: var(--pm-danger, #dc3545); background: #dc354518; }

.cpp-objetivos {
  display: flex;
  flex-direction: column;
  gap: 3px;
  padding-left: 0.25rem;
}

.cpp-objetivo-row {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  flex-wrap: wrap;
  padding: 2px 0;
}

.cpp-objetivo-text {
  color: var(--pm-text);
  font-size: 0.81rem;
  cursor: text;
  flex: 1;
  min-width: 0;
  padding: 1px 3px;
  border-radius: 3px;
}
.cpp-objetivo-text:hover { background: rgba(255,255,255,0.07); }

.cpp-prioridad-badge {
  font-size: 0.68rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.3px;
  flex-shrink: 0;
}

.cpp-no-obj {
  font-size: 0.75rem;
  color: var(--pm-text-muted);
  font-style: italic;
  padding: 2px 0;
}

.cpp-empty {
  padding: 1rem;
  text-align: center;
  color: var(--pm-text-muted);
  font-size: 0.82rem;
  font-style: italic;
}

.cpp-footer {
  border-top: 1px solid var(--pm-border);
  padding: 0.65rem 0.75rem;
  background: var(--pm-surface);
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.cpp-fields {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.cpp-field-label {
  font-size: 0.75rem;
  color: var(--pm-text-muted);
  display: flex;
  flex-direction: column;
  gap: 3px;
  flex: 1;
  min-width: 120px;
}

.cpp-input {
  background: var(--pm-bg, #0f1923);
  border: 1px solid var(--pm-border);
  border-radius: 4px;
  color: var(--pm-text);
  font-size: 0.82rem;
  padding: 4px 8px;
  outline: none;
  width: 100%;
}
.cpp-input:focus { border-color: var(--pm-primary, #0d6efd); }

.cpp-inline-input {
  font-size: inherit;
  padding: 1px 4px;
  width: auto;
  min-width: 120px;
}

.cpp-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
}
```

- [ ] **Step 2: Commit**

```bash
git add src/portal-maestros/styles/05-views.css
git commit -m "feat(css): add CurriculumProposalPanel styles"
```

---

## Task 6: Wire everything in asistenciaView.js

**Files:**
- Modify: `src/portal-maestros/views/asistenciaView.js`

This is the largest task. Read the file carefully before making any change. Make ONE change at a time and verify it doesn't break syntax.

- [ ] **Step 1: Add new imports**

The file has imports at lines 1-41. The last import is currently:
```js
import { createProgressPreviewPanel } from '../components/ProgressPreviewPanel.js'
```

Add these THREE new imports right after it:
```js
import { fetchInsights } from '../services/progressInsightService.js'
import { proposeCurriculum } from '../services/groqService.js'
import { createCurriculumProposalPanel } from '../components/CurriculumProposalPanel.js'
```

Note: `adoptarPropuesta` is imported from the planificacion module — add it to the import line or as a separate import. Check if `curriculoApi` is already imported in the file:

```bash
grep -n "curriculoApi\|adoptarPropuesta" src/portal-maestros/views/asistenciaView.js
```

If NOT already imported, add:
```js
import { adoptarPropuesta } from '../../modules/planificacion/api/curriculoApi.js'
```

If it IS already imported (e.g. `import { crearCurriculo } from '../../modules/planificacion/api/curriculoApi.js'`), add `adoptarPropuesta` to that existing import line.

- [ ] **Step 2: Add the button to the HTML template**

In the HTML template string inside `_renderVista`, find the planificación dropdown section. Look for the line:
```html
<div id="pm-route-tree-container" class="pm-route-tree-dropdown-box"></div>
```

Add the button trigger div AFTER the `<div id="pm-route-tree-container" ...></div>` line and BEFORE the closing `</div>` of `pm-planificacion-dropdown`:

```html
<div id="pm-curriculo-proposal-trigger" style="padding:0.5rem 0.75rem 0.75rem;">
  <button class="pm-btn pm-btn-outline" id="btn-proponer-curriculo" style="width:100%;font-size:0.82rem;">
    <i class="bi bi-stars"></i> Proponer plan curricular con IA
  </button>
</div>
```

The exact location in the HTML string is:
```html
<!-- BEFORE (existing): -->
          <div id="pm-route-tree-container" class="pm-route-tree-dropdown-box"></div>
        </div>
      </div>

<!-- AFTER (with addition): -->
          <div id="pm-route-tree-container" class="pm-route-tree-dropdown-box"></div>
          <div id="pm-curriculo-proposal-trigger" style="padding:0.5rem 0.75rem 0.75rem;">
            <button class="pm-btn pm-btn-outline" id="btn-proponer-curriculo" style="width:100%;font-size:0.82rem;">
              <i class="bi bi-stars"></i> Proponer plan curricular con IA
            </button>
          </div>
        </div>
      </div>
```

- [ ] **Step 3: Create the CurriculumProposalPanel instance**

Find the block where `progressPanel` is created (around line 644 — it's after `structureModal`). After the entire `progressPanel = createProgressPreviewPanel(...)` block (which ends with `})`), add:

```js
// === Curriculum Proposal Panel ===
const curricPanel = createCurriculumProposalPanel(
  container.querySelector('#pm-planificacion-dropdown') || container,
  {
    onAdopt: async ({ instrumento, nivel, resumen, pilares }) => {
      try {
        await adoptarPropuesta({ instrumento, nivel, descripcion: resumen, pilares })
        AppToast.success('¡Plan curricular creado correctamente!')
      } catch (err) {
        AppToast.error('Error al crear el plan: ' + err.message)
      }
    },
    onCancel: () => {},
  }
)
```

- [ ] **Step 4: Wire the button click handler**

Find where other buttons in the planificación card are wired (search for `btn-manage-planning` or the block around line 750 where `planificacionCard` is set up). After those wiring blocks, add:

```js
// Wire "Proponer plan curricular" button
const btnProponerCurriculo = container.querySelector('#btn-proponer-curriculo')
if (btnProponerCurriculo) {
  btnProponerCurriculo.onclick = async () => {
    btnProponerCurriculo.disabled = true
    btnProponerCurriculo.innerHTML = '<i class="bi bi-hourglass-split"></i> Analizando...'

    try {
      const insights = await fetchInsights(claseId, 12)

      if (insights.registros.length === 0) {
        AppToast.error('No hay registros de progreso suficientes en las últimas 12 semanas para generar una propuesta.')
        return
      }

      const proposal = await proposeCurriculum(insights, {
        instrumento: clase?.instrumento || '',
        nivel: '',
        nombreClase: clase?.nombre || '',
      })

      curricPanel.open({
        pilares: proposal.pilares,
        resumen: proposal.resumen,
        instrumento: clase?.instrumento || '',
        nivel: '',
      })

    } catch (err) {
      AppToast.error('Error al generar propuesta: ' + err.message)
    } finally {
      btnProponerCurriculo.disabled = false
      btnProponerCurriculo.innerHTML = '<i class="bi bi-stars"></i> Proponer plan curricular con IA'
    }
  }
}
```

- [ ] **Step 5: Verify no duplicate imports**

Run:
```bash
grep -n "progressInsightService\|proposeCurriculum\|CurriculumProposalPanel\|adoptarPropuesta" src/portal-maestros/views/asistenciaView.js
```

Expected: exactly one line per import, no duplicates.

- [ ] **Step 6: Commit**

```bash
git add src/portal-maestros/views/asistenciaView.js
git commit -m "feat(asistencia): wire AI curriculum proposal button with fetchInsights and CurriculumProposalPanel"
```

---

## Task 7: Manual End-to-End Test

No automated tests — this project has no test framework. Test in browser.

- [ ] **Step 1: Start the dev server**

```bash
npm run dev
```

Open the app in browser (typically `http://localhost:5173`).

- [ ] **Step 2: Seed test data (if progresos table is empty)**

If there are no `progresos` rows with `evaluacion_tipo='observacion'` for any class, go to an Asistencia view and create some:
1. Mark students as present
2. Write a free-text observation like: "Yereni y Santa mejoraron el cambio de posición. Todos trabajaron el Danzón."
3. Click the 🎯 button and confirm the preview panel
4. Repeat 2-3 times with different observations

- [ ] **Step 3: Test the proposal flow**

1. Go to any Asistencia view for a class that has `progresos` rows
2. Click to expand the Planificación card (🗺️ header)
3. Verify the "✨ Proponer plan curricular con IA" button appears at the bottom
4. Click the button
5. Expected: button shows "⏳ Analizando..." while loading
6. Expected: `CurriculumProposalPanel` appears with pilares and objetivos
7. Click a pilar title — expected: becomes an editable input
8. Edit it, press Enter — expected: saves and re-renders with new name
9. Click ✕ on an objetivo — expected: removes it and re-renders
10. Fill in "Instrumento" field if empty
11. Click "✓ Adoptar plan" — expected: AppToast.success appears
12. Verify in Supabase Studio: `curriculos` table has a new row, `curriculo_pilares` has rows linked to it, `curriculo_objetivos` has rows linked to the pilares

- [ ] **Step 4: Test error state**

Test with a class that has NO progresos rows:
1. Go to an Asistencia view for a new class
2. Expand Planificación card
3. Click "Proponer plan curricular con IA"
4. Expected: AppToast.error "No hay registros de progreso suficientes..."
5. Expected: panel does NOT open

---

## Self-Review

**Spec coverage check:**
- ✅ `fetchInsights(claseId, semanas=12)` with aggregation by contenido_dsl — Task 1
- ✅ `proposeCurriculum(insights, context)` with Spanish neutro prompt — Task 2
- ✅ `adoptarPropuesta({ instrumento, nivel, descripcion, pilares })` — Task 3
- ✅ `CurriculumProposalPanel` with inline editing of pilares + objetivos — Task 4
- ✅ Remove pilar / remove objetivo buttons — Task 4
- ✅ Instrumento + nivel fields in panel footer — Task 4
- ✅ "Adoptar plan" disabled when instrumento empty or no pilares — Task 4
- ✅ CSS styles for `.cpp-*` classes — Task 5
- ✅ Button in `#pm-planificacion-dropdown` — Task 6 Step 2
- ✅ Button disabled during loading with spinner text — Task 6 Step 4
- ✅ Error state when 0 registros — Task 6 Step 4
- ✅ onAdopt calls adoptarPropuesta then AppToast.success — Task 6 Step 3
- ✅ XSS: all user/AI text through esc() in CurriculumProposalPanel — Task 4
- ✅ Spanish neutro in prompt (no voseo) — Task 2
- ✅ Deep copy of pilares in open() — Task 4

**Type consistency:**
- `fetchInsights` returns `{ totalSesiones, fechaDesde, registros[] }` — used in `proposeCurriculum` ✓
- `proposeCurriculum` returns `{ pilares[], resumen }` — used in `curricPanel.open()` ✓
- `open({ pilares, resumen, instrumento, nivel })` — matches `onAdopt` callback shape ✓
- `adoptarPropuesta({ instrumento, nivel, descripcion, pilares })` — `descripcion` comes from `resumen` ✓
