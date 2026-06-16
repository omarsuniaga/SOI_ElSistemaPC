# Planificación → Bitácora Unification (Árbol A) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Remove all broken árbol-B (indicator_sessions / route_version_id / node_id) code from the Planificación view and redirect its semáforo + "Promover" flows to the existing bitácora module (árbol A).

**Architecture:** The "Semáforo" tab and its backing functions (`getIndicatorsWithStatus`, `getIndicatorHistory`, `createIndicatorObservation`) referenced dropped DB columns and are deleted. The "Bitácora" tab (which already calls `renderBitacoraView`) becomes the first/default tab. The Historial tab keeps its observaciones list but the "Promover" button now opens `RegistrarContenidoModal` (bitácora) instead of writing to `indicator_sessions`. `historialService.js` is patched to drop the `fetchIndicadores` query. `RegistrarContenidoModal` gains optional `prefillFecha`/`prefillObservacion` props.

**Tech Stack:** Vanilla JS, Vitest, Supabase. No framework. Mirror existing component style.

---

## File Map

| Action | Path | Reason |
|--------|------|--------|
| **Modify** | `src/portal-maestros/views/planificacionView.js` | Remove semáforo tab + dead imports; make Bitácora first/default |
| **Modify** | `src/modules/planning/services/planningService.js` | Delete 3 broken exports |
| **Delete** | `src/portal-maestros/components/PlanningRegistroModal.js` | Replaced by bitácora modal |
| **Delete** | `src/portal-maestros/components/PlanningDetailsModal.js` | Replaced by bitácora modal |
| **Modify** | `src/portal-maestros/components/PlanningHistorialPane.js` | Rewire "Promover" to bitácora |
| **Modify** | `src/modules/planning/services/historialService.js` | Remove broken `fetchIndicadores` |
| **Modify** | `src/modules/bitacora/components/RegistrarContenidoModal.js` | Add optional prefill props |
| **Modify** | `src/modules/bitacora/__tests__/RegistrarContenidoModal.test.js` | Add tests for prefill path |

---

## Task 1: Extend `RegistrarContenidoModal` with optional prefill props

Write the failing test first, then add the props, keeping backward compat.

**Files:**
- Modify: `src/modules/bitacora/__tests__/RegistrarContenidoModal.test.js`
- Modify: `src/modules/bitacora/components/RegistrarContenidoModal.js`

- [ ] **Step 1: Write the failing tests for prefill**

Append to `src/modules/bitacora/__tests__/RegistrarContenidoModal.test.js` inside the existing `describe` block:

```js
  it('prefills fecha when prefillFecha prop is provided', () => {
    const container = document.createElement('div')
    renderRegistrarContenidoModal(container, { ...PROPS, prefillFecha: '2026-05-10' })
    const fechaInput = container.querySelector('#modal-fecha')
    expect(fechaInput?.value).toBe('2026-05-10')
  })

  it('prefills observacion when prefillObservacion prop is provided', () => {
    const container = document.createElement('div')
    renderRegistrarContenidoModal(container, { ...PROPS, prefillObservacion: 'Clase muy buena' })
    const obs = container.querySelector('#modal-observacion')
    expect(obs?.value).toBe('Clase muy buena')
  })

  it('keeps today as default fecha when prefillFecha is not provided', () => {
    const container = document.createElement('div')
    renderRegistrarContenidoModal(container, PROPS) // no prefillFecha
    const fechaInput = container.querySelector('#modal-fecha')
    expect(fechaInput?.value).toBe(TODAY)
  })
```

- [ ] **Step 2: Run tests to see them fail**

```
npx vitest run src/modules/bitacora/__tests__/RegistrarContenidoModal.test.js
```

Expected: 2 new tests fail — `prefillFecha` and `prefillObservacion` not recognized yet.

- [ ] **Step 3: Add prefill props to `RegistrarContenidoModal.js`**

In `src/modules/bitacora/components/RegistrarContenidoModal.js`, update the destructuring in `renderRegistrarContenidoModal`:

```js
export function renderRegistrarContenidoModal(container, props = {}) {
  const {
    claseId,
    objetivoId,
    objetivoDescripcion = '',
    alumnos = [],
    onSaved = null,
    onCancel = null,
    prefillFecha = null,       // NEW: optional ISO date string
    prefillObservacion = null, // NEW: optional string
  } = props

  const today = new Date().toISOString().slice(0, 10)
  const fechaValue = prefillFecha ?? today
```

Then in the template, update the fecha input value and the observacion textarea value:

```js
          <input type="date" class="form-control input-dense" id="modal-fecha"
                 name="fecha" value="${fechaValue}" max="${today}" required>
```

And the textarea:

```js
          <textarea class="form-control input-dense" id="modal-observacion"
                    name="observacion" rows="2"
                    placeholder="Opcional — comentarios sobre la sesión">${prefillObservacion ? _escape(prefillObservacion) : ''}</textarea>
```

- [ ] **Step 4: Run tests to confirm they pass**

```
npx vitest run src/modules/bitacora/__tests__/RegistrarContenidoModal.test.js
```

Expected: all tests pass (original 7 + 3 new = 10 total).

- [ ] **Step 5: Commit**

```bash
git add src/modules/bitacora/components/RegistrarContenidoModal.js src/modules/bitacora/__tests__/RegistrarContenidoModal.test.js
git commit -m "feat(bitacora): add optional prefillFecha/prefillObservacion props to RegistrarContenidoModal"
```

---

## Task 2: Delete broken `planningService` functions

**Files:**
- Modify: `src/modules/planning/services/planningService.js`

- [ ] **Step 1: Delete `getIndicatorsWithStatus`, `getIndicatorHistory`, `createIndicatorObservation`**

In `src/modules/planning/services/planningService.js`, keep only `getRouteVersionHierarchy` and the private helpers `_groupBy`, `_getEstado`, `_getTotalAlumnosPorClase`, `_getTodosLosAlumnosPorClase`.

The file after editing must start with:

```js
/**
 * planningService.js
 * Responsabilidad: Lógica de negocio para Planificación Académica
 * - Jerarquía de rutas (árbol de contenidos)
 */

import { supabase } from '../../../lib/supabaseClient.js'
```

Delete lines 18–279 (the three exported async functions and their associated code). Keep `getRouteVersionHierarchy` (starts at current line 288) and the helpers section from line 341 onward.

The final exported surface should be:

```js
export async function getRouteVersionHierarchy(routeVersionId) { ... }
```

- [ ] **Step 2: Verify no remaining imports of deleted functions**

```bash
grep -r "getIndicatorsWithStatus\|getIndicatorHistory\|createIndicatorObservation" src/
```

Expected: matches only in `PlanningHistorialPane.js` and `planificacionView.js` (we fix those in later tasks). No other files should import them.

- [ ] **Step 3: Commit**

```bash
git add src/modules/planning/services/planningService.js
git commit -m "refactor(planning): remove broken árbol-B functions from planningService"
```

---

## Task 3: Delete broken components

**Files:**
- Delete: `src/portal-maestros/components/PlanningRegistroModal.js`
- Delete: `src/portal-maestros/components/PlanningDetailsModal.js`

There are no test files for these components (confirmed by `find` — no test files found under `src/portal-maestros/components/__tests__/` for Planning*Modal). We just delete them.

- [ ] **Step 1: Delete the files**

```bash
rm src/portal-maestros/components/PlanningRegistroModal.js
rm src/portal-maestros/components/PlanningDetailsModal.js
```

- [ ] **Step 2: Commit**

```bash
git add -A src/portal-maestros/components/PlanningRegistroModal.js src/portal-maestros/components/PlanningDetailsModal.js
git commit -m "refactor(planning): delete broken PlanningRegistroModal and PlanningDetailsModal (árbol B)"
```

---

## Task 4: Fix `historialService.js` — remove broken `fetchIndicadores`

The `fetchIndicadores` function queries `indicator_sessions` (árbol B, dropped columns). The Historial tab only needs observaciones. The `mapIndicadores` path and its type in `HistorialItem` can be pruned.

**Files:**
- Modify: `src/modules/planning/services/historialService.js`

- [ ] **Step 1: Edit `historialService.js`**

Replace the `getHistorial` function body to only use observaciones:

```js
export async function getHistorial(maestroId, opts = {}) {
  const { claseId = null, desde = null, hasta = null, limit = 50 } = opts

  const observacionesResult = await fetchObservaciones(maestroId, { claseId, desde, hasta })

  if (observacionesResult.error) throw observacionesResult.error

  const merged = mapObservaciones(observacionesResult.data ?? [], { claseId, desde, hasta })

  merged.sort((a, b) => {
    const dateDiff = b.fecha.localeCompare(a.fecha)
    if (dateDiff !== 0) return dateDiff
    return b.created_at.localeCompare(a.created_at)
  })

  return merged.slice(0, limit)
}
```

Delete the `fetchIndicadores` function (lines 86-101) and the `mapIndicadores` function (lines 148-170). Also remove the `type: 'indicador'` branch from the `HistorialItem` typedef — the only type now is `'observacion'`.

Update the typedef comment:

```js
/**
 * @typedef {Object} HistorialItem
 * @property {string} id
 * @property {'observacion'} type
 * @property {string} fecha                 - ISO date string
 * @property {string} clase_id
 * @property {string} clase_nombre
 * @property {string} clase_instrumento
 * @property {string|null} contenido_raw
 * @property {string|null} contenido_ia_dsl
 * @property {'sin_planificar'} estado
 * @property {string} created_at
 */
```

Note: `node_id`, `node_name`, `node_type`, `descripcion`, `calificacion` props can be kept in the typedef as nullable for backward compat with any consumers that might expect them, but they will always be `null`.

- [ ] **Step 2: Run vitest to confirm no regressions**

```
npx vitest run
```

Expected: all previously-passing tests still pass. (There are no direct tests for `historialService.js` itself — the `historialContenidosPanel.test.js` mocks `sesionesApi`, not `historialService`.)

- [ ] **Step 3: Commit**

```bash
git add src/modules/planning/services/historialService.js
git commit -m "fix(historial): remove broken indicator_sessions query from historialService"
```

---

## Task 5: Rewrite `PlanningHistorialPane.js` — Promover → árbol A

Replace the `_openPromoverModal` implementation. Keep the observaciones list (unchanged). Remove imports of deleted functions. The "Promover" button now opens `RegistrarContenidoModal` prefilled with `fecha` and observación text, and calls `registrarSesion` via bitácora.

**Files:**
- Modify: `src/portal-maestros/components/PlanningHistorialPane.js`

- [ ] **Step 1: Update imports at top of file**

Replace the current import block:

```js
import { getHistorial } from '../../modules/planning/services/historialService.js'
import {
  getRouteVersionHierarchy,
  createIndicatorObservation,
} from '../../modules/planning/services/planningService.js'
import { addNode, getOrCreateDraftVersion } from '../../modules/planning/services/curriculumAdminService.js'
import { escHTML } from '../utils/portalUtils.js'
import { AppModal } from '../../shared/components/AppModal.js'
import { AppToast } from '../../shared/components/AppToast.js'
```

With:

```js
import { getHistorial } from '../../modules/planning/services/historialService.js'
import { escHTML } from '../utils/portalUtils.js'
import { AppToast } from '../../shared/components/AppToast.js'
import { getContenidosDeClase, getAlumnosByClase } from '../../modules/bitacora/index.js'
import { renderRegistrarContenidoModal } from '../../modules/bitacora/components/RegistrarContenidoModal.js'
```

- [ ] **Step 2: Update the function signature — remove unused `publishedRouteVersionId` dependency from "Promover"**

The function signature stays the same to avoid breaking the caller in `planificacionView.js`:

```js
export async function renderPlanningHistorialPane(
  container,
  { maestroId, claseId, publishedRouteVersionId, onPromoted },
)
```

`publishedRouteVersionId` is no longer needed for Promover. It can stay in the signature for backward compat but will be unused.

- [ ] **Step 3: Replace `_openPromoverModal` with the new árbol-A implementation**

Delete the entire existing `_openPromoverModal` function (lines ~393-559) and the helper `_nodesListHtml`. Replace with:

```js
async function _openPromoverModal(item) {
  if (!claseId) {
    AppToast.error('Seleccioná una clase para promover este contenido.')
    return
  }

  let contenidos = []
  let alumnos = []
  try {
    ;[contenidos, alumnos] = await Promise.all([
      getContenidosDeClase(claseId),
      getAlumnosByClase(claseId),
    ])
  } catch (err) {
    console.error('[PlanningHistorialPane] Error loading bitácora data:', err)
    AppToast.error('No se pudo cargar los datos de la bitácora. Intentá de nuevo.')
    return
  }

  if (contenidos.length === 0) {
    AppToast.error('Esta clase no tiene objetivos/contenidos registrados en la bitácora.')
    return
  }

  // Build an overlay modal
  const overlay = document.createElement('div')
  overlay.style.cssText = `
    position: fixed; top: 0; left: 0; right: 0; bottom: 0;
    background: rgba(0,0,0,0.5);
    display: flex; align-items: center; justify-content: center;
    z-index: 10000;
  `

  const panel = document.createElement('div')
  panel.style.cssText = `
    background: var(--pm-surface, #fff);
    border-radius: 16px;
    box-shadow: 0 20px 60px rgba(0,0,0,0.3);
    max-width: 560px;
    width: 90%;
    max-height: 90vh;
    overflow-y: auto;
    padding: 1.5rem;
  `

  // Step 1: pick an objetivo
  const raw = item.contenido_raw || item.contenido_ia_dsl || ''
  const excerpt = raw.slice(0, 150) + (raw.length > 150 ? '…' : '')

  panel.innerHTML = `
    <h3 style="margin: 0 0 0.75rem 0; font-size: 1.1rem;">Registrar en bitácora</h3>
    <div style="background: var(--pm-surface-2,#f8f9fa); border-left: 3px solid var(--pm-border,#e2e8f0);
                padding: 0.5rem 0.75rem; border-radius: 0 6px 6px 0; font-size: 0.88rem;
                margin-bottom: 1rem;">
      ${excerpt ? escHTML(excerpt) : '<em>Sin contenido</em>'}
    </div>
    <label style="display:block; font-size:0.82rem; font-weight:600; margin-bottom:0.4rem; text-transform:uppercase; letter-spacing:0.04em; color:var(--pm-text-muted,#64748b);">
      Objetivo / Contenido
    </label>
    <select id="pm-ht-promover-objetivo" style="width:100%; padding:0.5rem 0.7rem; border:1px solid var(--pm-border,#e2e8f0); border-radius:8px; font-size:0.9rem; margin-bottom:1rem; box-sizing:border-box;">
      <option value="">Seleccioná un objetivo…</option>
      ${contenidos.map((c) => `<option value="${escHTML(c.id)}">${escHTML(c.descripcion ?? c.nombre ?? c.id)}</option>`).join('')}
    </select>
    <div id="pm-ht-promover-modal-container"></div>
    <div style="display:flex; justify-content:flex-end; margin-top:0.75rem;">
      <button id="pm-ht-promover-cancel" style="padding:0.5rem 1.2rem; border:1px solid var(--pm-border,#e2e8f0); border-radius:8px; background:var(--pm-surface-2,#f8f9fa); cursor:pointer; font-weight:600;">
        Cancelar
      </button>
    </div>
  `

  overlay.appendChild(panel)
  document.body.appendChild(overlay)

  const modalContainer = panel.querySelector('#pm-ht-promover-modal-container')
  const objetivoSelect = panel.querySelector('#pm-ht-promover-objetivo')

  function _renderInnerModal(objetivoId) {
    const objetivo = contenidos.find((c) => c.id === objetivoId)
    if (!objetivo) {
      modalContainer.innerHTML = ''
      return
    }
    renderRegistrarContenidoModal(modalContainer, {
      claseId,
      objetivoId,
      objetivoDescripcion: objetivo.descripcion ?? objetivo.nombre ?? objetivoId,
      alumnos,
      prefillFecha: item.fecha || null,
      prefillObservacion: raw.slice(0, 400) || null,
      onSaved: () => {
        // Mark item as registered
        const idx = allItems.findIndex((i) => i.id === item.id)
        if (idx !== -1) allItems[idx] = { ...allItems[idx], estado: 'registrado' }

        const card = container.querySelector(`.pm-ht-card[data-id="${CSS.escape(item.id)}"]`)
        if (card) {
          card.classList.remove('sin-planificar')
          card.classList.add('registrado')
          const estadoEl = card.querySelector('.pm-ht-estado')
          if (estadoEl) {
            estadoEl.className = 'pm-ht-estado registrado'
            estadoEl.textContent = '✅ Registrado en bitácora'
          }
          card.querySelector('[data-action="promover"]')?.remove()
        }

        overlay.remove()
        AppToast.success('Contenido registrado en la bitácora.')
        onPromoted?.()
      },
      onCancel: () => {
        overlay.remove()
      },
    })
  }

  objetivoSelect.addEventListener('change', () => {
    _renderInnerModal(objetivoSelect.value)
  })

  panel.querySelector('#pm-ht-promover-cancel').addEventListener('click', () => {
    overlay.remove()
  })
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) overlay.remove()
  })
}
```

- [ ] **Step 4: Update `_cardHtml` for observaciones — change "Registrado en ruta" to "Registrado en bitácora"**

In `_cardHtml`, the `registrado` estado label for `type === 'observacion'` cards should now read "✅ Registrado en bitácora":

```js
${item.estado === 'sin_planificar' ? '○ Sin planificar' : '✅ Registrado en bitácora'}
```

Note: the `indicador` card branch can be removed entirely since `historialService` no longer emits items of `type === 'indicador'`. Simplify `_cardHtml` to only render the `observacion` branch:

```js
function _cardHtml(item) {
  const date = _formatDate(item.fecha)
  const estadoClass = item.estado === 'sin_planificar' ? 'sin-planificar' : 'registrado'
  const raw = item.contenido_raw || item.contenido_ia_dsl || ''
  const excerpt = raw.slice(0, 120) + (raw.length > 120 ? '…' : '')

  return `
    <div class="pm-ht-card ${estadoClass}" data-id="${escHTML(item.id)}">
      <div class="pm-ht-card-header">📅 ${escHTML(date)} · ${escHTML(item.clase_nombre)}</div>
      <div class="pm-ht-card-body">${excerpt ? `"${escHTML(excerpt)}"` : '<em>Sin contenido</em>'}</div>
      <div class="pm-ht-card-footer">
        <span class="pm-ht-estado ${estadoClass}">
          ${item.estado === 'sin_planificar' ? '○ Sin planificar' : '✅ Registrado en bitácora'}
        </span>
        ${
          item.estado === 'sin_planificar'
            ? `<button class="pm-ht-btn-promover" data-action="promover" data-id="${escHTML(item.id)}">+ Promover</button>`
            : ''
        }
      </div>
    </div>
  `
}
```

- [ ] **Step 5: Also remove `filterType` state and the tipo filter UI since only 'observacion' items remain**

In `_render`, remove the `<select id="pm-ht-tipo">` and the `filterType` state variable. Simplify:

```js
// remove: let filterType = 'todos'

function _applyFilters(items) {
  return items.filter((item) => {
    if (filterSinPlanificar && item.estado !== 'sin_planificar') return false
    return true
  })
}
```

In `_render`, remove the `<select id="pm-ht-tipo">` from the filters div. Keep only the "Solo sin planificar" checkbox.

In `_wireFilters`, remove the `#pm-ht-tipo` listener.

- [ ] **Step 6: Run vitest to verify no regressions**

```
npx vitest run
```

Expected: all passing tests stay green. There are no direct tests for `PlanningHistorialPane.js` so nothing new to break.

- [ ] **Step 7: Commit**

```bash
git add src/portal-maestros/components/PlanningHistorialPane.js
git commit -m "feat(historial): migrate Promover button from árbol-B to bitácora registrarSesion"
```

---

## Task 6: Refactor `planificacionView.js` — remove Semáforo tab, make Bitácora first/default

**Files:**
- Modify: `src/portal-maestros/views/planificacionView.js`

- [ ] **Step 1: Remove broken imports**

Delete these 4 import lines from the top of the file:

```js
import {
  getIndicatorsWithStatus,
  getIndicatorHistory,
  createIndicatorObservation,
} from '../../modules/planning/services/planningService.js'
import { createPlanningRegistroModal } from '../components/PlanningRegistroModal.js'
import { createPlanningDetailsModal } from '../components/PlanningDetailsModal.js'
```

Keep only:

```js
import { getMisClases } from '../services/maestroDataService.js'
import { getRutasMaestro } from '../services/maestroDataService.js'
import { announce } from '../utils/a11yUtils.js'
import { AppToast } from '../../shared/components/AppToast.js'
```

- [ ] **Step 2: Remove the semáforo tab button and pane from the HTML template**

In the `.pm-planning-tabs` div, remove:

```html
<button class="pm-planning-tab active" data-tab="semaforo" role="tab" aria-selected="true">
  📊 Semáforo
</button>
```

And make the Bitácora tab the first tab and active by default:

```html
<div class="pm-planning-tabs" role="tablist">
  <button class="pm-planning-tab active" data-tab="bitacora" role="tab" aria-selected="true">
    📊 Semáforo / Bitácora
  </button>
  <button class="pm-planning-tab" data-tab="ruta" role="tab" aria-selected="false">
    🗺️ Ruta
  </button>
  <button class="pm-planning-tab" data-tab="gestionar" role="tab" aria-selected="false">
    ⚙️ Gestionar
  </button>
  <button class="pm-planning-tab" data-tab="historial" role="tab" aria-selected="false">
    📋 Historial
  </button>
</div>
```

Note: the `data-tab="bitacora"` value stays the same so the existing `_loadBitacora()` function is wired correctly without change.

- [ ] **Step 3: Remove the semáforo pane from the HTML**

Remove this entire pane div:

```html
<div class="pm-planning-pane" data-pane="semaforo" role="tabpanel">
  <div id="pm-planning-content">
    <div class="pm-planning-empty">
      <p>Selecciona una clase y ruta para comenzar</p>
    </div>
  </div>
</div>
```

Make the bitácora pane start visible (not hidden):

```html
<div class="pm-planning-pane" data-pane="bitacora" role="tabpanel">
  <div id="pm-planning-bitacora">
    <div class="pm-planning-empty">
      <p>Selecciona una clase para ver la bitácora</p>
    </div>
  </div>
</div>
```

And add `hidden` to the remaining panes (ruta, gestionar, historial) that start inactive.

- [ ] **Step 4: Remove dead state and functions from the JS**

Remove:

- `let _indicators = []` (top of function)
- `contentDiv` variable and `#pm-planning-content` querySelector
- `_loadSemaforo` function (entire async function, ~lines 474-490)
- `_renderIndicators` function
- `_renderIndicatorCard` function
- `_showIndicatorDetails` function
- `_showRegistroModal` function

In `_onTabActivated`, remove the `semaforo` branch:

```js
function _onTabActivated(tabName) {
  if (tabName === 'ruta') return _loadRouteTree()
  if (tabName === 'gestionar') return _loadManager()
  if (tabName === 'historial') return _loadHistorial()
  if (tabName === 'bitacora') return _loadBitacora()
}
```

- [ ] **Step 5: Fix the sessionStorage restore to not restore 'semaforo'**

```js
try {
  const savedTab = sessionStorage.getItem(TAB_KEY)
  if (savedTab && savedTab !== 'semaforo') _activateTab(savedTab)
  // If savedTab was 'semaforo' (old value), fall through to default (bitacora)
} catch {
  /* sessionStorage no disponible */
}
```

This is already in the code. It will naturally fall through to the default active tab (bitacora) when the saved value is 'semaforo'. No change needed here.

- [ ] **Step 6: Update the `claseSelect.addEventListener('change')` handler**

The handler currently references `_loadSemaforo()` indirectly through `_onTabActivated`. After removing `semaforo`, the active tab will be `bitacora` by default, so the bitácora will reload on clase change. Verify no direct calls to `_loadSemaforo` remain in the handler. The existing code already uses `_onTabActivated(activeTab)` pattern so no change needed.

- [ ] **Step 7: Remove the `.pm-planning-indicator-card` CSS styles (dead code)**

Remove the following CSS blocks from the embedded `<style>` tag (they only applied to the removed semáforo pane):

- `.pm-planning-grid`
- `.pm-planning-group`
- `.pm-planning-group-title`
- `.pm-planning-indicator-card` and all its variants (`.estado-completado`, `.estado-parcial`, `.estado-no_iniciado`)
- `.pm-planning-indicator-icon` and its card-variant overrides
- `.pm-planning-indicator-content`
- `.pm-planning-indicator-name`
- `.pm-planning-indicator-progress`
- `.pm-planning-progress-bar`
- `.pm-planning-progress-fill` and its card-variant overrides
- `.pm-planning-indicator-actions`
- `.pm-planning-btn` / `.pm-planning-btn-info`
- The mobile overrides for all of the above

Keep: `.pm-planning-container`, `.pm-planning-header`, `.pm-planning-title`, `.pm-planning-filters`, `.pm-planning-filter`, `.pm-planning-tabs`, `.pm-planning-tab`, `.pm-planning-pane`, `.pm-planning-empty`, and mobile overrides for those.

- [ ] **Step 8: Run vitest to verify nothing is broken**

```
npx vitest run
```

Expected: all tests pass.

- [ ] **Step 9: Commit**

```bash
git add src/portal-maestros/views/planificacionView.js
git commit -m "refactor(planificacion): remove broken Semáforo tab, promote Bitácora to first/default tab"
```

---

## Task 7: Final grep — confirm no árbol-B stragglers

- [ ] **Step 1: Search for remaining árbol-B references in `src/`**

```bash
grep -r "node_id\|route_version_id\|indicator_sessions\|indicator_session_students\|getIndicatorsWithStatus\|getIndicatorHistory\|createIndicatorObservation\|PlanningRegistroModal\|PlanningDetailsModal" src/ --include="*.js" -l
```

Expected output: no files should match (or only `historialService.js` if `node_id` appears in the obsolete typedef comment — that's acceptable since it's a comment).

- [ ] **Step 2: Search for `calificacion` on `indicator_sessions` specifically**

```bash
grep -r "indicator_sessions" src/ --include="*.js"
```

Expected: no matches.

- [ ] **Step 3: Run full test suite**

```
npx vitest run
```

Expected: all 75 bitácora tests pass, no other regressions.

- [ ] **Step 4: Commit (if any cleanup from grep was needed)**

```bash
git add -A
git commit -m "chore: remove last árbol-B references from src/"
```

---

## Self-Review

### Spec Coverage Check

| Requirement | Task |
|-------------|------|
| Remove Semáforo tab (button, pane, all logic) | Task 6 |
| Remove broken imports (`getIndicatorsWithStatus`, etc.) | Task 6 step 1 |
| Remove `_indicators` state | Task 6 step 4 |
| Bitácora becomes first tab and default active | Task 6 steps 2-3 |
| Keep Ruta and Gestionar tabs untouched | Task 6 (only removes semaforo) |
| Keep clase/ruta selectors intact | Task 6 (not touched) |
| Delete `getIndicatorsWithStatus`, `getIndicatorHistory`, `createIndicatorObservation` | Task 2 |
| Keep `getRouteVersionHierarchy` | Task 2 |
| Grep to confirm no stray imports | Task 2 step 2 + Task 7 |
| Delete `PlanningRegistroModal.js` | Task 3 |
| Delete `PlanningDetailsModal.js` | Task 3 |
| Remove/adjust tests that reference them | Task 3 (none exist) |
| Keep observaciones list working in Historial | Task 5 (only `getHistorial` used, unchanged) |
| Migrate Promover to RegistrarContenidoModal (árbol A) | Task 5 step 3 |
| Prefill fecha + observación in modal | Task 1 |
| Test for prefilled path | Task 1 step 1 |
| RegistrarContenidoModal backward compat | Task 1 (optional props, defaults preserved) |
| `historialService` no longer queries indicator_sessions | Task 4 |
| 75 bitácora tests stay green | Task 7 step 3 |
| Final straggler grep | Task 7 |

### Placeholder Scan

No TODOs or TBDs in this plan. All code blocks are complete.

### Type Consistency

- `renderRegistrarContenidoModal` signature with `prefillFecha?` / `prefillObservacion?` defined in Task 1 step 3 and used in Task 5 step 3 — consistent.
- `getContenidosDeClase(claseId)` / `getAlumnosByClase(claseId)` imported from `../../modules/bitacora/index.js` in Task 5 step 1 — these are the exact exports in `src/modules/bitacora/index.js` line 9-15.
- `renderRegistrarContenidoModal` imported from `../../modules/bitacora/components/RegistrarContenidoModal.js` — correct path.
- Contenido item shape: `contenidos.find(c => c.id === objetivoId)` then `.descripcion ?? .nombre ?? .id` — bitácora adapter returns objects with at least `id` and `descripcion` fields (check `getContenidosDeClase` return type in `bitacoraAdapter.js` if uncertain before implementing).
