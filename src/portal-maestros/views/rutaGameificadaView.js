import { getMaestroLocal as _getMaestroLocal } from '../auth/maestroAuth.js'
import { getMisClases as _getMisClases, invalidateClasesCache } from '../services/maestroDataService.js'
import { loadRouteTree as _loadRouteTree, resolveRutaIdForClase } from '../services/rutaService.js'
import { rutaEvents } from '../../lib/rutaEventEmitter.js'

// Allow test overrides via globals
const getMaestroLocal = () => (typeof global !== 'undefined' && global.getMaestroLocal ? global.getMaestroLocal() : _getMaestroLocal())
const getMisClases = (...args) => (typeof global !== 'undefined' && global.getMisClases ? global.getMisClases(...args) : _getMisClases(...args))
const loadRouteTree = (...args) => (typeof global !== 'undefined' && global.loadRouteTree ? global.loadRouteTree(...args) : _loadRouteTree(...args))

let _state = {
  clases: [],
  activeClaseId: null,
  rutaId: null,
  blocks: [],
  loading: false,
}

let _globalListenersAttached = false

/**
 * Main entry point for gamified ruta view
 * @param {HTMLElement} container
 */
export async function renderRutaGameificadaView(container) {
  _state = { clases: [], activeClaseId: null, rutaId: null, blocks: [], loading: false }

  container.innerHTML = '<div class="pm-ruta-gamificada"><div class="pm-loading"><div class="pm-spinner"></div></div></div>'

  const maestro = getMaestroLocal()
  if (!maestro) {
    container.innerHTML = '<div class="pm-ruta-gamificada"><p class="pm-empty">No hay sesión activa.</p></div>'
    return
  }

  try {
    invalidateClasesCache()
    _state.clases = await getMisClases(true)

    if (!_state.clases?.length) {
      container.innerHTML = '<div class="pm-ruta-gamificada"><p class="pm-empty">No tenés clases asignadas.</p></div>'
      return
    }

    _state.activeClaseId = _state.clases[0].id
    await _loadTreeForActiveClass()
    _renderFull(container)
    _attachDropdownListener(container)
    _attachGlobalListenersOnce(container)
  } catch (err) {
    console.error('[rutaGameificadaView]', err)
    container.innerHTML = `<div style="color:red;padding:20px;"><i class="bi bi-exclamation"></i> Error: ${err.message}</div>`
  }
}

async function _loadTreeForActiveClass() {
  _state.loading = true
  _state.rutaId = await resolveRutaIdForClase(_state.activeClaseId)
  if (_state.rutaId) {
    _state.blocks = await loadRouteTree(_state.rutaId, _state.activeClaseId)
  } else {
    _state.blocks = []
  }
  _state.loading = false
}

function _renderFull(container) {
  container.innerHTML = `
    <div class="pm-ruta-gamificada"><div class="pm-ruta-gamificada-container">
      <div id="ruta-header"></div>
      <div id="ruta-tree-area"></div>
      <div id="ruta-detail-panel"></div>
    </div></div>
  `

  container.querySelector('#ruta-header').innerHTML = `
    <div style="padding: 16px; border-bottom: 1px solid #e2e8f0;">
      <h2 style="margin: 0 0 12px 0; font-size: 1.2rem;">Ruta de Contenidos</h2>
      <select id="ruta-clase-select" style="padding: 8px; border-radius: 6px; border: 1px solid #e2e8f0;">
        ${_state.clases.map(c => `<option value="${c.id}" ${c.id === _state.activeClaseId ? 'selected' : ''}>${c.nombre}</option>`).join('')}
      </select>
    </div>
  `

  container.querySelector('#ruta-tree-area').innerHTML = _state.rutaId
    ? '<div style="padding:16px;">Cargando...</div>'
    : '<div style="padding:40px; text-align:center; color:#94a3b8;">No se encontró ruta publicada.</div>'
}

/**
 * Attach dropdown listener to the current select element.
 * Called each time the select is re-rendered; old element is GC'd with its listeners.
 */
function _attachDropdownListener(container) {
  container.querySelector('#ruta-clase-select')?.addEventListener('change', async (e) => {
    _state.activeClaseId = e.target.value
    container.innerHTML = '<div class="pm-loading"><div class="pm-spinner"></div></div>'
    await _loadTreeForActiveClass()
    _renderFull(container)
    _attachDropdownListener(container) // attach to the newly rendered select
    // NOTE: do NOT call renderRutaGameificadaView() — that resets state and re-fetches clases
  })
}

/**
 * Attach global event listeners exactly once for the lifetime of this view.
 * Uses a module-level flag to prevent duplication across class changes.
 */
function _attachGlobalListenersOnce(container) {
  if (_globalListenersAttached) return
  _globalListenersAttached = true

  // Listen for node-covered events from clase view
  rutaEvents.on('node-covered', () => {
    // Reload tree to show updates
    _loadTreeForActiveClass().then(() => {
      _renderFull(container)
      _attachDropdownListener(container)
    })
  })
}
