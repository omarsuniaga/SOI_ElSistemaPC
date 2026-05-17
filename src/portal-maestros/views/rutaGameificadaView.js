import { getMaestroLocal as _getMaestroLocal } from '../auth/maestroAuth.js'
import { getMisClases as _getMisClases, invalidateClasesCache } from '../services/maestroDataService.js'
import { loadRouteTree as _loadRouteTree, resolveRutaIdForClase } from '../services/rutaService.js'
import { rutaEvents } from '../../lib/rutaEventEmitter.js'
import { renderBlockSection } from '../components/BlockSection.js'
import { setRutaTema } from '../services/rutaTopicStore.js'

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
  expandedBlocks: new Set(),
  expandedLevels: new Set(),
  selectedIndicator: null,
  onTopicSelected: null
}

let _globalListenersAttached = false

/**
 * Main entry point for gamified ruta view
 * @param {HTMLElement} container
 * @param {{ onTopicSelected?: (claseId: string) => void }} options
 */
export async function renderRutaGameificadaView(container, { onTopicSelected } = {}) {
  _state = { 
    clases: [], 
    activeClaseId: null, 
    rutaId: null, 
    blocks: [], 
    loading: false,
    expandedBlocks: new Set(),
    expandedLevels: new Set(),
    selectedIndicator: null,
    onTopicSelected
  }

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
    <div class="pm-ruta-gamificada">
      <div class="pm-ruta-gamificada-container" style="max-width: 800px; margin: 0 auto; padding-bottom: 100px;">
        <div id="ruta-header" style="background: white; position: sticky; top: 0; z-index: 10; border-bottom: 1px solid #e2e8f0; padding: 16px;">
          <div class="d-flex align-items-center justify-content-between">
            <h2 style="margin: 0; font-size: 1.25rem; font-weight: 800; color: #1e293b;">Mi Ruta</h2>
            <select id="ruta-clase-select" style="padding: 6px 12px; border-radius: 20px; border: 1px solid #cbd5e1; font-size: 0.85rem; font-weight: 600; cursor: pointer;">
              ${_state.clases.map(c => `<option value="${c.id}" ${c.id === _state.activeClaseId ? 'selected' : ''}>${c.nombre}</option>`).join('')}
            </select>
          </div>
        </div>
        
        <div id="ruta-tree-area" style="padding-top: 8px;"></div>
      </div>
      <div id="ruta-action-panel"></div>
    </div>
  `

  const treeArea = container.querySelector('#ruta-tree-area')
  if (!_state.rutaId) {
    treeArea.innerHTML = '<div style="padding:60px; text-align:center; color:#94a3b8;"><i class="bi bi-map fs-1 d-block mb-3"></i>No se encontró ruta publicada para esta clase.</div>'
    return
  }

  if (_state.blocks.length === 0) {
    treeArea.innerHTML = '<div style="padding:60px; text-align:center; color:#94a3b8;">La ruta no tiene bloques configurados.</div>'
    return
  }

  _state.blocks.forEach(block => {
    const blockContainer = document.createElement('div')
    treeArea.appendChild(blockContainer)

    renderBlockSection(blockContainer, {
      blockId: block.id,
      blockName: block.nombre,
      isExpanded: _state.expandedBlocks.has(block.id),
      childCount: block.levels?.length || 0,
      onToggle: (id) => {
        if (_state.expandedBlocks.has(id)) _state.expandedBlocks.delete(id)
        else _state.expandedBlocks.add(id)
        _renderFull(container)
      }
    })

    if (_state.expandedBlocks.has(block.id)) {
      const content = blockContainer.querySelector('.block-section-content')
      block.levels.forEach(level => {
        content.appendChild(_renderLevel(level, container))
      })
    }
  })

  _renderActionPanel(container)
}

function _renderLevel(level, mainContainer) {
  const div = document.createElement('div')
  div.className = 'pm-level-row'
  div.style.cssText = `
    border-bottom: 1px solid #f1f5f9;
    background: ${level.locked ? '#f8fafc' : 'white'};
    opacity: ${level.locked ? '0.7' : '1'};
  `

  const isExpanded = _state.expandedLevels.has(level.id)
  
  div.innerHTML = `
    <div class="level-header" style="padding: 12px 16px; display: flex; align-items: center; gap: 12px; cursor: ${level.locked ? 'not-allowed' : 'pointer'};">
      <div class="level-icon" style="width: 32px; height: 32px; border-radius: 8px; background: ${_getSemaphoreColor(level.semaphore)}; display: flex; align-items: center; justify-content: center; color: white;">
        <i class="bi ${level.locked ? 'bi-lock-fill' : 'bi-layers'}"></i>
      </div>
      <div style="flex: 1;">
        <div style="font-weight: 700; font-size: 0.9rem; color: #334155;">${level.nombre}</div>
        <div style="display: flex; align-items: center; gap: 8px; margin-top: 4px;">
          <div style="flex: 1; height: 6px; background: #e2e8f0; border-radius: 3px; overflow: hidden;">
            <div style="width: ${level.percentage}%; height: 100%; background: ${_getSemaphoreColor(level.semaphore)}; transition: width 0.3s ease;"></div>
          </div>
          <span style="font-size: 0.65rem; font-weight: 800; color: #64748b; min-width: 30px; text-align: right;">${level.percentage}%</span>
        </div>
        <div style="font-size: 0.7rem; color: #64748b; margin-top: 2px;">${level.nodes?.length || 0} nodos • ${level.locked ? 'Bloqueado' : 'Disponible'}</div>
      </div>
      ${!level.locked ? `<i class="bi bi-chevron-right" style="transition: transform 0.2s; ${isExpanded ? 'transform: rotate(90deg);' : ''}"></i>` : ''}
    </div>
    <div class="level-content" style="${isExpanded ? 'display: block;' : 'display: none;'} padding: 0 16px 16px 56px;">
      ${(level.nodes || []).map(node => `
        <div class="node-item" style="margin-bottom: 12px;">
          <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 6px;">
            <span style="width: 8px; height: 8px; border-radius: 50%; background: ${_getSemaphoreColor(node.semaphore)};"></span>
            <span style="font-weight: 600; font-size: 0.85rem; color: #475569;">${node.nombre}</span>
          </div>
          <div class="indicators-list" style="display: flex; flex-direction: column; gap: 4px;">
            ${(node.indicators || []).map(ind => `
              <div class="indicator-row" 
                data-id="${ind.id}" 
                data-nombre="${ind.nombre}"
                data-node="${node.nombre}"
                data-level="${level.nombre}"
                data-block="${_state.blocks.find(b => b.id === level.block_id)?.nombre || ''}"
                style="padding: 6px 10px; border-radius: 6px; font-size: 0.8rem; cursor: pointer; border: 1px solid ${_state.selectedIndicator?.id === ind.id ? '#3b82f6' : 'transparent'}; background: ${_state.selectedIndicator?.id === ind.id ? '#eff6ff' : 'white'}; transition: all 0.2s;"
              >
                ${ind.nombre}
              </div>
            `).join('')}
          </div>
        </div>
      `).join('')}
    </div>
  `

  if (!level.locked) {
    div.querySelector('.level-header').addEventListener('click', () => {
      if (_state.expandedLevels.has(level.id)) _state.expandedLevels.delete(level.id)
      else _state.expandedLevels.add(level.id)
      _renderFull(mainContainer)
    })
  }

  div.querySelectorAll('.indicator-row').forEach(row => {
    row.addEventListener('click', (e) => {
      e.stopPropagation()
      _state.selectedIndicator = {
        id: row.dataset.id,
        nombre: row.dataset.nombre,
        nodeNombre: row.dataset.node,
        levelNombre: row.dataset.level,
        blockNombre: row.dataset.block
      }
      _renderFull(mainContainer)
    })
  })

  return div
}

function _renderActionPanel(container) {
  const panel = container.querySelector('#ruta-action-panel')
  if (!_state.selectedIndicator) {
    panel.innerHTML = ''
    return
  }

  panel.innerHTML = `
    <div style="position: fixed; bottom: 0; left: 0; right: 0; background: white; border-top: 1px solid #e2e8f0; box-shadow: 0 -4px 20px rgba(0,0,0,0.08); padding: 16px; z-index: 100;">
      <div style="max-width: 800px; margin: 0 auto; display: flex; align-items: center; justify-content: space-between; gap: 16px;">
        <div style="flex: 1; overflow: hidden;">
          <div style="font-size: 0.65rem; text-transform: uppercase; font-weight: 800; color: #3b82f6; letter-spacing: 0.5px; margin-bottom: 2px;">
            ${_state.selectedIndicator.blockNombre} › ${_state.selectedIndicator.levelNombre}
          </div>
          <div style="font-weight: 700; color: #1e293b; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
            ${_state.selectedIndicator.nombre}
          </div>
        </div>
        <div class="d-flex gap-2">
          <button id="btn-cancel-select" class="btn btn-outline-secondary btn-sm" style="border-radius: 20px; padding: 8px 16px; font-weight: 600;">Cancelar</button>
          <button id="btn-use-topic" class="btn btn-primary btn-sm" style="border-radius: 20px; padding: 8px 20px; font-weight: 600; background: #3b82f6; border-color: #3b82f6;">
            📌 Usar como tema
          </button>
        </div>
      </div>
    </div>
  `

  panel.querySelector('#btn-cancel-select').addEventListener('click', () => {
    _state.selectedIndicator = null
    _renderFull(container)
  })

  panel.querySelector('#btn-use-topic').addEventListener('click', () => {
    setRutaTema({
      ..._state.selectedIndicator,
      indicatorId: _state.selectedIndicator.id,
      claseId: _state.activeClaseId
    })
    if (_state.onTopicSelected) {
      _state.onTopicSelected(_state.activeClaseId)
    }
  })
}

function _getSemaphoreColor(status) {
  switch (status) {
    case 'green': return '#22c55e'
    case 'yellow': return '#eab308'
    case 'gray': return '#94a3b8'
    default: return '#94a3b8'
  }
}

/**
 * Attach dropdown listener to the current select element.
 */
function _attachDropdownListener(container) {
  container.querySelector('#ruta-clase-select')?.addEventListener('change', async (e) => {
    _state.activeClaseId = e.target.value
    container.innerHTML = '<div class="pm-ruta-gamificada"><div class="pm-loading"><div class="pm-spinner"></div></div></div>'
    await _loadTreeForActiveClass()
    _renderFull(container)
    _attachDropdownListener(container)
  })
}

/**
 * Attach global event listeners exactly once for the lifetime of this view.
 */
function _attachGlobalListenersOnce(container) {
  if (_globalListenersAttached) return
  _globalListenersAttached = true

  // Listen for node-covered events from clase view
  rutaEvents.on('node-covered', () => {
    _loadTreeForActiveClass().then(() => {
      _renderFull(container)
      _attachDropdownListener(container)
    })
  })
}
