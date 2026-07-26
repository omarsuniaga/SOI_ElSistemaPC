/**
 * curriculumLinkerPanel.js — Panel to link a planification with a curriculum route.
 *
 * Shows a route selector filtered by instrument, then displays a tree of
 * levels → nodes → indicators with checkboxes. Selected indicators are
 * saved as clase_objetivos linked to the planification and bridge record.
 *
 * @module components/curriculumLinkerPanel
 */

import { agregarObjetivos } from '../services/claseObjetivosService.js'

/**
 * Render the curriculum linker panel into a container.
 *
 * @param {HTMLElement} container - DOM container
 * @param {object} options
 * @param {string} options.claseId - Class ID
 * @param {Array<object>} options.rutas - Available routes with nested levels/nodes/indicators
 * @param {string} [options.planificacionId] - Planificacion to link objectives to
 * @param {string} [options.classCurriculumPlanId] - Bridge record ID
 * @param {string} [options.instrumento] - Filter routes by instrument
 * @param {function} [options.onLinked] - Callback after successful linking
 */
export function renderCurriculumLinkerPanel(
  container,
  { claseId, rutas = [], planificacionId = null, classCurriculumPlanId = null, instrumento = null, onLinked = null },
) {
  // Inject styles
  if (!document.getElementById('cl-panel-styles')) {
    const style = document.createElement('style')
    style.id = 'cl-panel-styles'
    style.textContent = _getStyles()
    document.head.appendChild(style)
  }

  // Filter routes by instrument if provided
  const filteredRutas = instrumento
    ? rutas.filter((r) => {
        const routeInstrumento = (r.instrumento || '').toLowerCase()
        return routeInstrumento.includes(instrumento.toLowerCase())
      })
    : rutas

  container.innerHTML = _buildPanelHTML(filteredRutas)
  container._rutas = filteredRutas
  _wireEvents(container, { claseId, planificacionId, classCurriculumPlanId, onLinked })
}

// ── Private ────────────────────────────────────────────────────────────────────

function _buildPanelHTML(rutas) {
  if (rutas.length === 0) {
    return `
      <div class="cl-panel">
        <div class="cl-panel-header">
          <i class="bi bi-link-45deg me-1"></i>Vincular con Ruta Curricular
        </div>
        <div class="text-center text-muted py-4">
          <i class="bi bi-diagram-3 d-block mb-2" style="font-size: 2rem; opacity: 0.3;"></i>
          <p class="mb-0">Sin rutas curriculares disponibles.</p>
          <small class="text-muted">Asigná una ruta a esta clase desde ACM primero.</small>
        </div>
      </div>`
  }

  const routeOptions = rutas
    .map((r) => `<option value="${r.id}">${esc(r.name || r.id)}${r.instrumento ? ` (${esc(r.instrumento)})` : ''}</option>`)
    .join('')

  return `
    <div class="cl-panel">
      <div class="cl-panel-header">
        <i class="bi bi-link-45deg me-1"></i>Vincular con Ruta Curricular
      </div>
      <div class="cl-panel-body">
        <div class="cl-route-select-wrapper mb-3">
          <label class="form-label small fw-bold" for="cl-route-select">Ruta disponible</label>
          <select class="form-select form-select-sm" id="cl-route-select">
            <option value="">Seleccionar ruta...</option>
            ${routeOptions}
          </select>
        </div>

        <div class="cl-route-tree" id="cl-route-tree">
          <div class="text-muted small text-center py-3">Seleccioná una ruta para ver sus indicadores.</div>
        </div>

        <div class="cl-actions d-flex justify-content-between align-items-center mt-3 pt-3 border-top" style="display:none" id="cl-actions">
          <div>
            <span class="cl-selected-count small text-muted">0 seleccionados</span>
            <button class="btn btn-sm btn-outline-secondary ms-2" id="cl-select-all">Seleccionar todos</button>
            <button class="btn btn-sm btn-outline-secondary ms-1" id="cl-deselect-all">Limpiar</button>
          </div>
          <button class="btn btn-sm btn-primary cl-save-btn" id="cl-save">
            <i class="bi bi-link me-1"></i>Vincular
          </button>
        </div>
      </div>
    </div>`
}

function _wireEvents(container, { claseId, planificacionId, classCurriculumPlanId, onLinked }) {
  const select = container.querySelector('#cl-route-select')
  if (!select) return

  select.addEventListener('change', () => {
    const routeId = select.value
    if (!routeId) {
      container.querySelector('#cl-route-tree').innerHTML =
        '<div class="text-muted small text-center py-3">Seleccioná una ruta para ver sus indicadores.</div>'
      container.querySelector('#cl-actions').style.display = 'none'
      return
    }

    const ruta = (container._rutas || []).find((r) => r.id === routeId)
    if (!ruta) return

    _renderRouteTree(container, ruta)
    container.querySelector('#cl-actions').style.display = 'flex'
  })

  // Select all / deselect all
  container.querySelector('#cl-select-all')?.addEventListener('click', () => {
    container.querySelectorAll('.cl-indicator-checkbox').forEach((cb) => {
      cb.checked = true
    })
    _updateSelectedCount(container)
  })

  container.querySelector('#cl-deselect-all')?.addEventListener('click', () => {
    container.querySelectorAll('.cl-indicator-checkbox').forEach((cb) => {
      cb.checked = false
    })
    _updateSelectedCount(container)
  })

  // Save
  container.querySelector('#cl-save')?.addEventListener('click', async () => {
    if (!planificacionId || !classCurriculumPlanId) {
      console.warn('[curriculumLinkerPanel] Missing planificacionId or classCurriculumPlanId')
      return
    }

    const selected = []
    container.querySelectorAll('.cl-indicator-checkbox:checked').forEach((cb) => {
      selected.push({
        planificacion_id: planificacionId,
        class_curriculum_plan_id: classCurriculumPlanId,
        node_id: cb.dataset.nodeId,
        indicator_id: cb.dataset.indicatorId,
      })
    })

    if (selected.length === 0) return

    const saveBtn = container.querySelector('#cl-save')
    saveBtn.disabled = true
    saveBtn.textContent = 'Vinculando...'

    try {
      await agregarObjetivos(selected)
      if (onLinked) onLinked(selected)
    } catch (err) {
      console.error('[curriculumLinkerPanel] Error:', err)
    } finally {
      saveBtn.disabled = false
      saveBtn.innerHTML = '<i class="bi bi-link me-1"></i>Vincular'
    }
  })
}

function _renderRouteTree(container, ruta) {
  const treeEl = container.querySelector('#cl-route-tree')
  if (!treeEl) return

  const levels = ruta.levels || []
  if (levels.length === 0) {
    treeEl.innerHTML = '<div class="text-muted small text-center py-3">Esta ruta no tiene niveles definidos.</div>'
    return
  }

  treeEl.innerHTML = levels
    .map((level) => {
      const nodes = level.nodes || []
      return `
      <div class="cl-level">
        <div class="cl-level-header">
          <i class="bi bi-folder2 me-1"></i>${esc(level.name || level.id)}
        </div>
        ${nodes
          .map((node) => {
            const indicators = node.indicators || []
            return `
          <div class="cl-node">
            <div class="cl-node-header">
              <i class="bi bi-file-earmark-text me-1"></i>${esc(node.name || node.id)}
            </div>
            <div class="cl-indicators">
              ${indicators
                .map(
                  (ind) => `
                <label class="cl-indicator-item">
                  <input type="checkbox" class="cl-indicator-checkbox"
                         data-node-id="${node.id}"
                         data-indicator-id="${ind.id}">
                  <span class="cl-indicator-text">${esc(ind.description || ind.id)}</span>
                </label>`,
                )
                .join('')}
            </div>
          </div>`
          })
          .join('')}
      </div>`
    })
    .join('')

  // Wire checkbox changes
  treeEl.querySelectorAll('.cl-indicator-checkbox').forEach((cb) => {
    cb.addEventListener('change', () => _updateSelectedCount(container))
  })
}

function _updateSelectedCount(container) {
  const count = container.querySelectorAll('.cl-indicator-checkbox:checked').length
  const countEl = container.querySelector('.cl-selected-count')
  if (countEl) countEl.textContent = `${count} seleccionado${count !== 1 ? 's' : ''}`
}

function esc(str) {
  if (!str) return ''
  return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}

function _getStyles() {
  return `
    .cl-panel { border: 1px solid var(--bs-border-color, #dee2e6); border-radius: 8px; overflow: hidden; }
    .cl-panel-header { padding: 0.6rem 0.8rem; background: var(--bs-tertiary-bg, #f8f9fa); font-weight: 600; font-size: 0.85rem; border-bottom: 1px solid var(--bs-border-color, #dee2e6); }
    .cl-panel-body { padding: 0.75rem; }
    .cl-level { margin-bottom: 0.75rem; }
    .cl-level-header { font-weight: 600; font-size: 0.8rem; color: var(--bs-primary, #0d6efd); padding: 0.3rem 0; }
    .cl-node { margin-left: 1rem; margin-bottom: 0.5rem; }
    .cl-node-header { font-size: 0.78rem; font-weight: 500; color: var(--bs-secondary-color, #6c757d); padding: 0.2rem 0; }
    .cl-indicators { margin-left: 1.5rem; }
    .cl-indicator-item { display: flex; align-items: center; gap: 0.4rem; padding: 0.2rem 0; cursor: pointer; font-size: 0.8rem; }
    .cl-indicator-item:hover { color: var(--bs-primary, #0d6efd); }
    .cl-indicator-text { line-height: 1.3; }
  `
}
