# Ruta de Contenidos — Player View Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the "Ruta de Contenidos" tab — a full-page, Duolingo-style academic route tree that shows class-wide semaphore progress per indicator and lets the maestro assign any topic directly into today's class session editor.

**Architecture:** Three new files handle data (`rutaService.js`), topic handoff (`rutaTopicStore.js`), and UI (`rutaPlayerView.js`); one existing file (`asistenciaView.js`) is modified to auto-inject a pre-selected topic on mount. The player view reuses the existing semaphore logic from `evaluationService.js` — no new DB queries invented. Topic handoff uses `sessionStorage` so the selection survives navigation between views without a global state bus.

**Tech Stack:** Vanilla JS ES modules, Supabase JS v2, `sessionStorage` for cross-view state, existing `evaluationService.getSemaphoreForNode`, existing `getMisClases` cache, Bootstrap Icons (already loaded).

---

## Codebase Context (read this before touching any file)

This is a Vite PWA. No test runner — verification is done by opening the browser at `http://localhost:5173` (run `npm run dev` if not running). The dev server supports HMR; every file save hot-reloads.

### DB — Supabase project `zmhmdvmyeyswunurcyow`

Route hierarchy (all use `route_version_id` to scope):
```
blocks        → id, nombre, order_index, route_version_id
  levels      → id, block_id, nombre, order_index, route_version_id
    nodes     → id, level_id, nombre, order_index, route_version_id
      indicators → id, node_id, nombre, activo, order_index, description
```

Evaluation data:
```
indicator_attempts → id, student_id, indicator_id, session_id, node_id, nota (smallint), result (text), observations (text)
alumnos_clases     → alumno_id, clase_id, activo
```

### Published route version
`bd25b7b2-987f-4dd7-be73-cde4e9f78606` — "Ruta Integral de Violín por Nodos" — 10 levels, 160 nodes, 643 indicators.

### Semaphore logic (from `evaluationService.calculateSemaphore`)
- **green**: `attempts.length >= totalAlumnos` AND every attempt has `nota >= 4`
- **yellow**: at least one attempt exists but not fully green
- **gray**: zero attempts for the node

### Route resolution for a class
```js
// From asistenciaView.js lines 94-115 — use this same pattern:
const claseRow = misClases.find(c => c.id === claseId)
const instrumento = claseRow?.instrumento              // e.g. "Violín, Viola"
const primerInstrumento = instrumento.split(',')[0].trim().toLowerCase()  // "violín"
const { data } = await supabase
  .from('routes')
  .select('id, route_versions!inner(id)')
  .ilike('instrument', `%${primerInstrumento}%`)
  .eq('route_versions.status', 'published')
  .limit(1)
  .maybeSingle()
const rutaId = data?.route_versions?.[0]?.id || data?.route_versions?.id || null
```

### Key existing files (DO NOT restructure them)
```
src/portal-maestros/services/evaluationService.js   — exports getSemaphoreForNode, calculateSemaphore
src/portal-maestros/services/maestroDataService.js  — exports getMisClases() (cached)
src/portal-maestros/components/routeTreeBar.js      — collapsible bar used inside asistencia (DO NOT MODIFY)
src/portal-maestros/views/asistenciaView.js         — has DSL editor with editor.insertText()
src/portal-maestros/views/rutaView.js               — OLD file we created today (will be REPLACED by rutaPlayerView.js)
src/main-maestros.js                                — router, imports, MAESTRO_TABS
src/portal-maestros/utils/portalUtils.js            — exports escHTML()
```

### Navigation in this app
```js
// Navigate programmatically — this is the correct pattern (from main-maestros.js):
window.location.hash = '#/hoy'
```

---

## File Map

| Action | Path | Responsibility |
|--------|------|----------------|
| **Create** | `src/portal-maestros/services/rutaService.js` | Load full route tree with semaphore per node for a given (routeVersionId, claseId) |
| **Create** | `src/portal-maestros/services/rutaTopicStore.js` | sessionStorage wrapper — set/get/clear pre-selected topic |
| **Create** | `src/portal-maestros/views/rutaPlayerView.js` | Full-page tree UI: class selector → tree → indicator detail panel |
| **Modify** | `src/portal-maestros/views/asistenciaView.js` | On mount: check rutaTopicStore, auto-insert topic into editor |
| **Modify** | `src/main-maestros.js` | Swap `renderRutaView` import for `renderRutaPlayerView` |
| **Delete** | `src/portal-maestros/views/rutaView.js` | Old prototype — replaced entirely |

---

## Task 1: `rutaService.js` — Route tree data loader

**Files:**
- Create: `src/portal-maestros/services/rutaService.js`

This service loads the full route tree (blocks → levels → nodes → indicators) with semaphore colors calculated per node using the existing `getSemaphoreForNode` from `evaluationService.js`. It also resolves the `routeVersionId` from a class id.

- [ ] **Step 1: Create the file with the resolveRutaId function**

```js
// src/portal-maestros/services/rutaService.js

import { supabase } from '../../lib/supabaseClient.js'
import { getSemaphoreForNode } from './evaluationService.js'
import { getMisClases } from './maestroDataService.js'

/**
 * Resolve the published route_version_id for a given clase.
 * Matches the class instrumento against routes.instrument (case-insensitive).
 * Returns null if not found.
 *
 * @param {string} claseId
 * @returns {Promise<string|null>}
 */
export async function resolveRutaIdForClase(claseId) {
  const misClases = await getMisClases()
  const claseRow  = misClases?.find(c => c.id === claseId)
  const instrumento = claseRow?.instrumento
  if (!instrumento) return null

  const primerInstrumento = instrumento.split(',')[0].trim().toLowerCase()

  const { data, error } = await supabase
    .from('routes')
    .select('id, route_versions!inner(id)')
    .ilike('instrument', `%${primerInstrumento}%`)
    .eq('route_versions.status', 'published')
    .limit(1)
    .maybeSingle()

  if (error) {
    console.warn('[rutaService] resolveRutaIdForClase error:', error.message)
    return null
  }

  return data?.route_versions?.[0]?.id || data?.route_versions?.id || null
}
```

- [ ] **Step 2: Add `loadRouteTree` — the main data function**

Append this to the same file:

```js
/**
 * Load the full route tree for a route version + class, with semaphore per node.
 *
 * Returns:
 * Block[] where:
 *   block.levels[].nodes[].semaphore = 'green'|'yellow'|'gray'
 *   block.levels[].semaphore         = aggregated from nodes
 *   block.levels[].locked            = true if previous level < 80% green indicators
 *
 * @param {string} routeVersionId
 * @param {string} claseId
 * @returns {Promise<Block[]>}
 */
export async function loadRouteTree(routeVersionId, claseId) {
  // ── 1. Blocks ──────────────────────────────────────────────────────────────
  const { data: blocks, error: bErr } = await supabase
    .from('blocks')
    .select('id, nombre, order_index')
    .eq('route_version_id', routeVersionId)
    .order('order_index', { ascending: true })

  if (bErr) throw new Error('[rutaService] blocks: ' + bErr.message)
  if (!blocks || blocks.length === 0) return []

  // ── 2. Levels ──────────────────────────────────────────────────────────────
  const blockIds = blocks.map(b => b.id)
  const { data: levels, error: lErr } = await supabase
    .from('levels')
    .select('id, block_id, nombre, order_index')
    .in('block_id', blockIds)
    .eq('route_version_id', routeVersionId)
    .order('order_index', { ascending: true })

  if (lErr) throw new Error('[rutaService] levels: ' + lErr.message)

  // ── 3. Nodes ───────────────────────────────────────────────────────────────
  const levelIds = (levels ?? []).map(l => l.id)
  if (levelIds.length === 0) return blocks.map(b => ({ ...b, levels: [] }))

  const { data: nodes, error: nErr } = await supabase
    .from('nodes')
    .select('id, level_id, nombre, order_index')
    .in('level_id', levelIds)
    .eq('route_version_id', routeVersionId)
    .order('order_index', { ascending: true })

  if (nErr) throw new Error('[rutaService] nodes: ' + nErr.message)

  // ── 4. Indicators ──────────────────────────────────────────────────────────
  const nodeIds = (nodes ?? []).map(n => n.id)
  const { data: indicators, error: iErr } = nodeIds.length > 0
    ? await supabase
        .from('indicators')
        .select('id, node_id, nombre, description, order_index')
        .in('node_id', nodeIds)
        .eq('activo', true)
        .order('order_index', { ascending: true })
    : { data: [], error: null }

  if (iErr) throw new Error('[rutaService] indicators: ' + iErr.message)

  // ── 5. Semaphore per node (parallel) ───────────────────────────────────────
  const semaphoreResults = await Promise.all(
    (nodes ?? []).map(n =>
      getSemaphoreForNode(n.id, claseId)
        .then(r => ({ nodeId: n.id, semaphore: r.semaphore }))
        .catch(() => ({ nodeId: n.id, semaphore: 'gray' }))
    )
  )
  const semMap = new Map(semaphoreResults.map(s => [s.nodeId, s.semaphore]))

  // ── 6. Group indicators by node ────────────────────────────────────────────
  const indByNode = new Map()
  for (const ind of indicators ?? []) {
    if (!indByNode.has(ind.node_id)) indByNode.set(ind.node_id, [])
    indByNode.get(ind.node_id).push({ ...ind, semaphore: semMap.get(ind.node_id) ?? 'gray' })
  }

  // ── 7. Group nodes by level ────────────────────────────────────────────────
  const nodesByLevel = new Map()
  for (const node of nodes ?? []) {
    if (!nodesByLevel.has(node.level_id)) nodesByLevel.set(node.level_id, [])
    nodesByLevel.get(node.level_id).push({
      ...node,
      semaphore: semMap.get(node.id) ?? 'gray',
      indicators: indByNode.get(node.id) ?? [],
    })
  }

  // ── 8. Group levels by block + compute level semaphore + lock state ────────
  const levelsByBlock = new Map()
  for (const [blockId] of blockIds.map(id => [id])) {
    levelsByBlock.set(blockId, [])
  }

  const levelsSortedByBlock = new Map()
  for (const level of levels ?? []) {
    if (!levelsSortedByBlock.has(level.block_id)) levelsSortedByBlock.set(level.block_id, [])
    levelsSortedByBlock.get(level.block_id).push(level)
  }

  for (const [blockId, blockLevels] of levelsSortedByBlock) {
    const enriched = blockLevels.map((level, idx, arr) => {
      const levelNodes = nodesByLevel.get(level.id) ?? []
      const nodeSems   = levelNodes.map(n => n.semaphore)
      const levelSem   = nodeSems.every(s => s === 'green') && nodeSems.length > 0
        ? 'green'
        : nodeSems.every(s => s === 'gray') || nodeSems.length === 0
        ? 'gray'
        : 'yellow'

      // Lock: previous level must have ≥80% of its indicators green
      let locked = false
      if (idx > 0) {
        const prev = arr[idx - 1]
        const prevNodes = nodesByLevel.get(prev.id) ?? []
        const allInds = prevNodes.flatMap(n => indByNode.get(n.id) ?? [])
        const greenCount = allInds.filter(i => (semMap.get(i.node_id) ?? 'gray') === 'green').length
        locked = allInds.length > 0 && greenCount / allInds.length < 0.8
      }

      return { ...level, semaphore: levelSem, locked, nodes: levelNodes }
    })
    levelsByBlock.set(blockId, enriched)
  }

  return blocks.map(b => ({ ...b, levels: levelsByBlock.get(b.id) ?? [] }))
}
```

- [ ] **Step 3: Verify the file has no syntax errors**

Open a terminal in the project root and run:
```bash
node --input-type=module < /dev/null 2>&1 || true
npx vite build --mode development 2>&1 | head -30
```

Expected: no "SyntaxError" lines. (Build warnings about unused variables are OK.)

- [ ] **Step 4: Commit**

```bash
cd "C:\Users\omare\OneDrive\Documentos\SOI_Sistema_Operativo_Institucional\09_SOI_WEB_PORTAL\sistema-academico-pwa"
git add src/portal-maestros/services/rutaService.js
git commit -m "feat(ruta): add rutaService — route tree loader with semaphore"
```

---

## Task 2: `rutaTopicStore.js` — Session-level topic handoff

**Files:**
- Create: `src/portal-maestros/services/rutaTopicStore.js`

This tiny module uses `sessionStorage` to pass a pre-selected indicator from the Ruta player view into `asistenciaView`. It's a one-shot read: once consumed it is cleared.

- [ ] **Step 1: Create the file**

```js
// src/portal-maestros/services/rutaTopicStore.js

const KEY = 'soi_ruta_tema_pendiente'

/**
 * Store a selected topic so asistenciaView can auto-inject it on next open.
 *
 * @param {{
 *   indicatorId: string,
 *   nombre: string,
 *   nodeNombre: string,
 *   levelNombre: string,
 *   blockNombre: string,
 *   claseId: string,
 * }} tema
 */
export function setRutaTema(tema) {
  sessionStorage.setItem(KEY, JSON.stringify(tema))
}

/**
 * Retrieve and immediately clear the pending topic.
 * Returns null if nothing is stored.
 *
 * @returns {{ indicatorId: string, nombre: string, nodeNombre: string, levelNombre: string, blockNombre: string, claseId: string } | null}
 */
export function consumeRutaTema() {
  const raw = sessionStorage.getItem(KEY)
  if (!raw) return null
  sessionStorage.removeItem(KEY)
  try {
    return JSON.parse(raw)
  } catch {
    return null
  }
}

/**
 * Peek at the pending topic without clearing it.
 * Used by rutaPlayerView to show "topic pending" indicator.
 *
 * @returns {{ indicatorId: string, nombre: string, claseId: string } | null}
 */
export function peekRutaTema() {
  const raw = sessionStorage.getItem(KEY)
  if (!raw) return null
  try {
    return JSON.parse(raw)
  } catch {
    return null
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add src/portal-maestros/services/rutaTopicStore.js
git commit -m "feat(ruta): add rutaTopicStore — sessionStorage topic handoff"
```

---

## Task 3: `rutaPlayerView.js` — Full-page route tree UI

**Files:**
- Create: `src/portal-maestros/views/rutaPlayerView.js`
- Delete: `src/portal-maestros/views/rutaView.js` (old prototype)

This is the main view rendered at `#/ruta`. It shows:
1. A class selector at the top
2. The full route tree — blocks → levels → nodes → indicators — always expanded
3. Semaphore icons: 🟢 green, 🟡 yellow, ⚫ gray
4. Locked levels show 🔒 and their nodes are hidden
5. Clicking an indicator opens an inline action panel with "📌 Usar como tema de hoy"

- [ ] **Step 1: Create the file — imports and state**

```js
// src/portal-maestros/views/rutaPlayerView.js

import { getMaestroLocal }    from '../auth/maestroAuth.js'
import { getMisClases }       from '../services/maestroDataService.js'
import { loadRouteTree, resolveRutaIdForClase } from '../services/rutaService.js'
import { setRutaTema, peekRutaTema } from '../services/rutaTopicStore.js'
import { escHTML }            from '../utils/portalUtils.js'

const SEM_ICON  = { green: '🟢', yellow: '🟡', gray: '⚫' }
const SEM_COLOR = { green: '#22c55e', yellow: '#f59e0b', gray: '#94a3b8' }
const SEM_BG    = { green: '#f0fdf4', yellow: '#fffbeb', gray: '#f8fafc' }

// Module-level state (lives as long as the tab is mounted)
let _state = {
  clases:         [],    // [{id, nombre, instrumento}]
  activeClaseId:  null,
  rutaId:         null,
  blocks:         [],    // full tree
  selectedInd:    null,  // { id, nombre, nodeNombre, levelNombre, blockNombre }
  loading:        false,
}
```

- [ ] **Step 2: Add the public render function and data loaders**

Append to the same file:

```js
/**
 * Main entry point — called by main-maestros.js for route #/ruta
 * @param {HTMLElement} container
 */
export async function renderRutaPlayerView(container) {
  _state = { clases: [], activeClaseId: null, rutaId: null, blocks: [], selectedInd: null, loading: false }
  container.innerHTML = `<div class="pm-loading"><div class="pm-spinner"></div></div>`

  const maestro = getMaestroLocal()
  if (!maestro) {
    container.innerHTML = `<p class="pm-empty">No hay sesión activa.</p>`
    return
  }

  try {
    _state.clases = await getMisClases()
    if (!_state.clases?.length) {
      container.innerHTML = `<p class="pm-empty">No tenés clases asignadas.</p>`
      return
    }

    // Default to first class
    _state.activeClaseId = _state.clases[0].id
    await _loadTreeForActiveClass()
    _renderFull(container)
  } catch (err) {
    console.error('[rutaPlayerView]', err)
    container.innerHTML = `
      <div style="padding:20px;color:#d32f2f;">
        <i class="bi bi-exclamation-triangle"></i> Error: ${escHTML(err.message)}
      </div>`
  }
}

async function _loadTreeForActiveClass() {
  _state.loading = true
  _state.rutaId  = await resolveRutaIdForClase(_state.activeClaseId)
  if (_state.rutaId) {
    _state.blocks = await loadRouteTree(_state.rutaId, _state.activeClaseId)
  } else {
    _state.blocks = []
  }
  _state.loading = false
}
```

- [ ] **Step 3: Add `_renderFull` — the shell HTML**

Append to the same file:

```js
function _renderFull(container) {
  const pendingTema = peekRutaTema()
  const pendingBanner = pendingTema
    ? `<div style="
        background:#fffbeb;border:1px solid #f59e0b;border-radius:10px;
        padding:10px 14px;margin-bottom:16px;font-size:13px;color:#92400e;
        display:flex;align-items:center;gap:8px;
       ">
        <i class="bi bi-clock-history"></i>
        Tema pendiente de asignar: <strong>${escHTML(pendingTema.nombre)}</strong>
        <button data-action="clear-pending" style="
          margin-left:auto;background:none;border:none;cursor:pointer;
          font-size:12px;color:#92400e;text-decoration:underline;
        ">Cancelar</button>
       </div>`
    : ''

  container.innerHTML = `
    <div style="padding:16px;max-width:800px;margin:0 auto;">

      <!-- Header + class selector -->
      <div style="display:flex;align-items:center;gap:12px;margin-bottom:16px;flex-wrap:wrap;">
        <i class="bi bi-diagram-3-fill" style="font-size:1.4rem;color:var(--pm-accent,#007aff);"></i>
        <h2 style="margin:0;font-size:1.15rem;font-weight:700;color:var(--pm-text-primary,#1e293b);">
          Ruta de Contenidos
        </h2>
        <select id="ruta-clase-select" style="
          margin-left:auto;padding:8px 12px;
          border:1px solid var(--pm-border,#e2e8f0);border-radius:8px;
          background:var(--pm-surface,#fff);color:var(--pm-text-primary,#1e293b);
          font-size:13px;cursor:pointer;
        ">
          ${_state.clases.map(c => `
            <option value="${c.id}" ${c.id === _state.activeClaseId ? 'selected' : ''}>
              ${escHTML(c.nombre)}
            </option>
          `).join('')}
        </select>
      </div>

      ${pendingBanner}

      <!-- Tree area -->
      <div id="ruta-tree-area">
        ${_state.rutaId ? _renderBlocks() : `
          <div style="text-align:center;padding:40px;color:var(--pm-text-muted,#64748b);">
            <i class="bi bi-diagram-3" style="font-size:2rem;"></i>
            <p>No se encontró una ruta publicada para esta clase.</p>
          </div>
        `}
      </div>

      <!-- Selected indicator action panel -->
      <div id="ruta-action-panel"></div>

    </div>
  `

  _attachEvents(container)
}
```

- [ ] **Step 4: Add `_renderBlocks` — tree rendering functions**

Append to the same file:

```js
function _renderBlocks() {
  if (!_state.blocks.length) return `
    <div style="text-align:center;padding:40px;color:#94a3b8;">
      <p>La ruta no tiene contenido cargado aún.</p>
    </div>`

  return _state.blocks.map(block => `
    <div style="margin-bottom:20px;">
      <div style="
        font-size:11px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;
        color:var(--pm-text-muted,#64748b);padding:0 4px;margin-bottom:8px;
      ">${escHTML(block.nombre)}</div>
      ${block.levels.map((level, idx) => _renderLevel(level, idx)).join('')}
    </div>
  `).join('')
}

function _renderLevel(level, idx) {
  if (level.locked) {
    return `
      <div style="
        margin-bottom:8px;border:1px solid #e2e8f0;border-radius:12px;
        background:#f8fafc;opacity:0.6;
      ">
        <div style="
          display:flex;align-items:center;gap:10px;padding:14px 16px;
          color:#94a3b8;
        ">
          <span style="font-size:18px;">🔒</span>
          <div>
            <div style="font-weight:600;font-size:13px;">${escHTML(level.nombre)}</div>
            <div style="font-size:11px;margin-top:2px;">Completá el nivel anterior al 80% para desbloquear</div>
          </div>
        </div>
      </div>`
  }

  const sem = level.semaphore
  const color = SEM_COLOR[sem]
  const pct = _levelPct(level)

  return `
    <div style="
      margin-bottom:8px;border:1px solid ${color}44;border-radius:12px;
      background:var(--pm-surface,#fff);overflow:hidden;
    ">
      <!-- Level header -->
      <div data-action="toggle-level" data-level-id="${level.id}" style="
        display:flex;align-items:center;gap:10px;padding:14px 16px;
        cursor:pointer;user-select:none;
        border-bottom:1px solid ${color}22;
      ">
        <span style="font-size:16px;">${SEM_ICON[sem]}</span>
        <div style="flex:1;min-width:0;">
          <div style="font-weight:600;font-size:13px;color:var(--pm-text-primary,#1e293b);">
            ${escHTML(level.nombre)}
          </div>
          <div style="font-size:11px;color:${color};margin-top:2px;">${pct}% completado</div>
        </div>
        <!-- Progress bar -->
        <div style="width:72px;height:5px;background:#e2e8f0;border-radius:3px;overflow:hidden;flex-shrink:0;">
          <div style="height:100%;width:${pct}%;background:${color};border-radius:3px;"></div>
        </div>
        <span data-chevron="${level.id}" style="color:#94a3b8;transition:transform 0.2s;font-size:14px;">›</span>
      </div>

      <!-- Level body — nodes -->
      <div data-level-body="${level.id}" style="padding:10px 14px;display:none;">
        ${level.nodes.map(node => _renderNode(node, level)).join('')}
      </div>
    </div>`
}

function _renderNode(node, level) {
  const sem = node.semaphore
  const color = SEM_COLOR[sem]

  return `
    <div style="margin-bottom:10px;">
      <div data-action="toggle-node" data-node-id="${node.id}" style="
        display:flex;align-items:center;gap:8px;
        padding:8px 10px;border-radius:8px;
        background:${SEM_BG[sem]};border:1px solid ${color}44;
        cursor:pointer;user-select:none;
      ">
        <span style="font-size:13px;">${SEM_ICON[sem]}</span>
        <span style="font-size:13px;font-weight:600;color:var(--pm-text-primary,#1e293b);flex:1;">
          ${escHTML(node.nombre)}
        </span>
        <span data-chevron="${node.id}" style="color:#94a3b8;font-size:12px;">›</span>
      </div>

      <!-- Indicators list -->
      <div data-node-body="${node.id}" style="display:none;padding:6px 0 0 24px;">
        ${node.indicators.map(ind => _renderIndicator(ind, node, level)).join('')}
        ${node.indicators.length === 0
          ? `<div style="font-size:12px;color:#94a3b8;padding:4px 0;">Sin indicadores</div>`
          : ''}
      </div>
    </div>`
}

function _renderIndicator(ind, node, level) {
  const sem   = ind.semaphore
  const color = SEM_COLOR[sem]
  const isSelected = _state.selectedInd?.id === ind.id

  return `
    <div data-action="select-indicator"
         data-ind-id="${ind.id}"
         data-ind-nombre="${escHTML(ind.nombre)}"
         data-node-nombre="${escHTML(node.nombre)}"
         data-level-nombre="${escHTML(level.nombre)}"
         style="
           display:flex;align-items:center;gap:8px;
           padding:7px 10px;margin-bottom:3px;
           border-radius:8px;cursor:pointer;
           background:${isSelected ? color + '22' : 'transparent'};
           border:1px solid ${isSelected ? color : 'transparent'};
           transition:all 0.15s;
         "
         onmouseover="this.style.background='${color}11'"
         onmouseout="this.style.background='${isSelected ? color + '22' : 'transparent'}'">
      <span style="font-size:12px;">${SEM_ICON[sem]}</span>
      <span style="font-size:12px;color:var(--pm-text-primary,#1e293b);">${escHTML(ind.nombre)}</span>
    </div>`
}

function _levelPct(level) {
  const allInds = level.nodes.flatMap(n => n.indicators)
  if (!allInds.length) return 0
  const green = allInds.filter(i => i.semaphore === 'green').length
  return Math.round((green / allInds.length) * 100)
}
```

- [ ] **Step 5: Add `_renderActionPanel` and `_attachEvents`**

Append to the same file:

```js
function _renderActionPanel(container) {
  const panel = container.querySelector('#ruta-action-panel')
  if (!panel) return

  const ind = _state.selectedInd
  if (!ind) { panel.innerHTML = ''; return }

  panel.innerHTML = `
    <div style="
      position:sticky;bottom:16px;margin-top:16px;
      background:var(--pm-surface,#fff);
      border:1px solid var(--pm-border,#e2e8f0);border-radius:14px;
      padding:16px;box-shadow:0 4px 24px rgba(0,0,0,0.10);
    ">
      <!-- Breadcrumb -->
      <div style="font-size:11px;color:#94a3b8;margin-bottom:6px;">
        ${escHTML(ind.blockNombre)} › ${escHTML(ind.levelNombre)} › ${escHTML(ind.nodeNombre)}
      </div>
      <!-- Indicator name -->
      <div style="font-size:15px;font-weight:700;color:var(--pm-text-primary,#1e293b);margin-bottom:12px;">
        📌 ${escHTML(ind.nombre)}
      </div>
      <!-- Actions -->
      <div style="display:flex;gap:10px;flex-wrap:wrap;">
        <button data-action="usar-tema-hoy" style="
          flex:1;min-width:180px;padding:12px;
          background:var(--pm-accent,#007aff);color:white;
          border:none;border-radius:10px;font-size:14px;font-weight:600;cursor:pointer;
        ">
          <i class="bi bi-send"></i> Usar como tema de hoy
        </button>
        <button data-action="close-panel" style="
          padding:12px 16px;
          background:var(--pm-surface-2,#f1f5f9);
          border:1px solid var(--pm-border,#e2e8f0);border-radius:10px;
          font-size:13px;cursor:pointer;color:var(--pm-text-muted,#64748b);
        ">✕</button>
      </div>
    </div>`
}

function _attachEvents(container) {
  // ── Class selector ────────────────────────────────────────────────────────
  container.querySelector('#ruta-clase-select')?.addEventListener('change', async (e) => {
    _state.activeClaseId = e.target.value
    _state.selectedInd   = null
    container.innerHTML  = `<div class="pm-loading"><div class="pm-spinner"></div></div>`
    await _loadTreeForActiveClass()
    _renderFull(container)
  })

  // ── Tree interaction (event delegation) ───────────────────────────────────
  container.addEventListener('click', (e) => {
    const el = e.target.closest('[data-action]')
    if (!el) return

    switch (el.dataset.action) {

      // Toggle level
      case 'toggle-level': {
        const body    = container.querySelector(`[data-level-body="${el.dataset.levelId}"]`)
        const chevron = container.querySelector(`[data-chevron="${el.dataset.levelId}"]`)
        if (!body) return
        const open = body.style.display !== 'none'
        body.style.display    = open ? 'none' : ''
        if (chevron) chevron.style.transform = open ? '' : 'rotate(90deg)'
        break
      }

      // Toggle node
      case 'toggle-node': {
        const body    = container.querySelector(`[data-node-body="${el.dataset.nodeId}"]`)
        const chevron = container.querySelector(`[data-chevron="${el.dataset.nodeId}"]`)
        if (!body) return
        const open = body.style.display !== 'none'
        body.style.display    = open ? 'none' : ''
        if (chevron) chevron.style.transform = open ? '' : 'rotate(90deg)'
        break
      }

      // Select indicator
      case 'select-indicator': {
        _state.selectedInd = {
          id:          el.dataset.indId,
          nombre:      el.dataset.indNombre,
          nodeNombre:  el.dataset.nodeNombre,
          levelNombre: el.dataset.levelNombre,
          blockNombre: _state.blocks[0]?.nombre ?? '',
        }
        _renderActionPanel(container)
        // Scroll panel into view
        container.querySelector('#ruta-action-panel')?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
        break
      }

      // "Usar como tema de hoy"
      case 'usar-tema-hoy': {
        const ind = _state.selectedInd
        if (!ind) return
        setRutaTema({
          indicatorId: ind.id,
          nombre:      ind.nombre,
          nodeNombre:  ind.nodeNombre,
          levelNombre: ind.levelNombre,
          blockNombre: ind.blockNombre,
          claseId:     _state.activeClaseId,
        })
        window.location.hash = '#/hoy'
        break
      }

      // Clear pending tema
      case 'clear-pending': {
        sessionStorage.removeItem('soi_ruta_tema_pendiente')
        _renderFull(container)
        break
      }

      // Close action panel
      case 'close-panel': {
        _state.selectedInd = null
        _renderActionPanel(container)
        break
      }
    }
  })
}
```

- [ ] **Step 6: Verify in browser**

With `npm run dev` running:
1. Open `http://localhost:5173/#/ruta`
2. Expected: class selector appears, tree loads with blocks → levels → nodes
3. Click a level header → it expands showing nodes
4. Click a node → indicators appear with semaphore icons
5. Click an indicator → sticky action panel appears at bottom with "Usar como tema de hoy"
6. Click "Usar como tema de hoy" → navigates to `#/hoy`

If tree shows "No se encontró una ruta publicada" — the class `instrumento` field doesn't match any route `instrument`. That is a data issue, not a code issue. Check with:
```sql
SELECT id, nombre, instrumento FROM clases LIMIT 5;
SELECT id, name, instrument FROM routes;
```

- [ ] **Step 7: Commit**

```bash
git add src/portal-maestros/views/rutaPlayerView.js
git commit -m "feat(ruta): add rutaPlayerView — full-page Duolingo-style route tree"
```

---

## Task 4: Delete old `rutaView.js`

**Files:**
- Delete: `src/portal-maestros/views/rutaView.js`

- [ ] **Step 1: Delete the file**

```bash
rm "src/portal-maestros/views/rutaView.js"
```

- [ ] **Step 2: Commit**

```bash
git add -A
git commit -m "chore(ruta): remove old rutaView prototype"
```

---

## Task 5: Update `main-maestros.js` — swap import

**Files:**
- Modify: `src/main-maestros.js` (lines ~21-22 — the import block)

- [ ] **Step 1: Replace the import line**

In `src/main-maestros.js`, find:
```js
import { renderRutaView }        from './portal-maestros/views/rutaView.js'
```

Replace with:
```js
import { renderRutaPlayerView }  from './portal-maestros/views/rutaPlayerView.js'
```

- [ ] **Step 2: Replace the switch-case call**

Find in the `switch(baseRoute)` block (around line 460):
```js
      case 'ruta':
        renderRutaView(targetContainer)
        break
```

Replace with:
```js
      case 'ruta':
        renderRutaPlayerView(targetContainer)
        break
```

- [ ] **Step 3: Verify — no other references to rutaView**

```bash
grep -r "rutaView" src/
```

Expected output: no results (or only rutaPlayerView).

- [ ] **Step 4: Commit**

```bash
git add src/main-maestros.js
git commit -m "feat(ruta): wire rutaPlayerView into main router"
```

---

## Task 6: `asistenciaView.js` — auto-inject pre-selected topic

**Files:**
- Modify: `src/portal-maestros/views/asistenciaView.js`

When the maestro navigates from Ruta → "Usar como tema de hoy" → taps a class card → asistencia opens, the pre-selected indicator should automatically be inserted into the DSL editor and a banner shown.

The injection point in `asistenciaView.js` is AFTER both `editor` and `routeTreeBar` are initialized (around line 265, after the `if (rutaId)` block).

- [ ] **Step 1: Add the import at the top of asistenciaView.js**

At the top of `src/portal-maestros/views/asistenciaView.js`, with the other imports, add:

```js
import { consumeRutaTema } from '../services/rutaTopicStore.js'
```

- [ ] **Step 2: Add injection logic after editor + routeTreeBar init**

In `asistenciaView.js`, find the comment that says `// === Auto-Draft ===` (around line 268). Insert the following block IMMEDIATELY BEFORE that comment:

```js
  // === Ruta topic auto-injection ===
  // If the maestro came from the Ruta view via "Usar como tema de hoy", auto-insert
  // the selected indicator into the editor and show a banner.
  const rutaTema = consumeRutaTema()
  if (rutaTema && rutaTema.claseId === claseId) {
    // Only inject if the stored tema was for THIS class
    const temaText = `[${rutaTema.nombre}] `
    editor.insertText(temaText)
    toolbar.setContext({ indicadorActivo: rutaTema.nombre })

    // Show the save button
    const obsBtn = container.querySelector('#btn-guardar-obs')
    if (obsBtn) obsBtn.style.display = ''

    // Inject a dismissible banner above the editor
    const editorContainer = container.querySelector('#pm-dsl-editor-container')
    if (editorContainer) {
      const banner = document.createElement('div')
      banner.style.cssText = `
        background:#eff6ff;border:1px solid #93c5fd;border-radius:8px;
        padding:8px 12px;margin-bottom:8px;font-size:12px;color:#1d4ed8;
        display:flex;align-items:center;gap:8px;
      `
      banner.innerHTML = `
        <i class="bi bi-diagram-3"></i>
        Tema cargado desde Ruta: <strong>${rutaTema.nombre.replace(/</g, '&lt;')}</strong>
        <button onclick="this.parentElement.remove()" style="
          margin-left:auto;background:none;border:none;cursor:pointer;
          font-size:12px;color:#1d4ed8;
        ">✕</button>
      `
      editorContainer.parentElement.insertBefore(banner, editorContainer)
    }
  }
```

- [ ] **Step 3: Verify in browser — full flow**

1. Go to `#/ruta`
2. Expand any level → expand any node → click any indicator
3. In the sticky panel, click "Usar como tema de hoy"
4. You land on `#/hoy` — click any class card to open asistencia
5. Expected: blue banner appears above the editor saying "Tema cargado desde Ruta: [indicator name]", and `[indicator name] ` is pre-inserted in the editor

- [ ] **Step 4: Commit**

```bash
git add src/portal-maestros/views/asistenciaView.js
git commit -m "feat(ruta): auto-inject pre-selected topic into asistencia DSL editor"
```

---

## Self-Review Checklist

**Spec coverage:**
- ✅ Tree view: blocks → levels → nodes → indicators with semaphore colors
- ✅ Locked levels (previous < 80% green)
- ✅ Class selector
- ✅ Click indicator → action panel with "Usar como tema de hoy"
- ✅ Topic handoff → asistencia DSL editor auto-injection with banner
- ✅ Gray = not covered, Yellow = in progress, Green = mastered

**Placeholder scan:** None — all steps contain complete code.

**Type consistency:**
- `rutaTopicStore.setRutaTema({ indicatorId, nombre, nodeNombre, levelNombre, blockNombre, claseId })` ← matches `consumeRutaTema()` return shape ← matches usage in asistenciaView and rutaPlayerView.
- `loadRouteTree(routeVersionId, claseId)` → `Block[]` with `.levels[].nodes[].indicators[].semaphore` ← matches `_renderBlocks()` traversal.
- `resolveRutaIdForClase(claseId)` → `string|null` ← guarded by `if (_state.rutaId)` in `_loadTreeForActiveClass`.

**Known data caveat:** The semaphore computation (`getSemaphoreForNode`) fires one Supabase query per node. A route with 160 nodes will fire 160 parallel requests. This is acceptable for a first version but should be optimized (batch query) in a future pass if loading time exceeds 3s.

---

## What this does NOT include (Phase 2)

The following are intentionally out of scope for this plan:
- **Route Builder** — create/edit levels, nodes, indicators (separate plan)
- **Badges / gamification** — achievements per student (separate plan)
- **AI content improvement** — "Mejorar con IA" per indicator (separate plan)
- **Per-student evaluation modal from Ruta** — evaluation happens via asistencia DSL, not from this view
