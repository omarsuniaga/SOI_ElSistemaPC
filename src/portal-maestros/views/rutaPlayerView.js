import { getMaestroLocal }                         from '../auth/maestroAuth.js'
import { getMisClases, invalidateClasesCache }      from '../services/maestroDataService.js'
import { loadRouteTree, resolveRutaIdForClase, loadNodesForLevel, loadIndicatorsForNode } from '../services/rutaService.js'
import { setRutaTema, peekRutaTema }                from '../services/rutaTopicStore.js'
import { escHTML }                                  from '../utils/portalUtils.js'

const SEM_ICON  = { green: '🟢', yellow: '🟡', gray: '⚫' }
const SEM_COLOR = { green: '#22c55e', yellow: '#f59e0b', gray: '#94a3b8' }
const SEM_BG    = { green: '#f0fdf4', yellow: '#fffbeb', gray: '#f8fafc' }

let _state = {
  clases:         [],
  activeClaseId:  null,
  rutaId:         null,
  blocks:         [],
  selectedInd:    null,
  loading:        false,
}

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
    // Force refresh clases on mount to ensure latest data
    invalidateClasesCache()
    _state.clases = await getMisClases(true)
    if (!_state.clases?.length) {
      container.innerHTML = `<p class="pm-empty">No tenés clases asignadas.</p>`
      return
    }

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

      <div id="ruta-tree-area">
        ${_state.rutaId ? _renderBlocks() : `
          <div style="text-align:center;padding:40px;color:var(--pm-text-muted,#64748b);">
            <i class="bi bi-diagram-3" style="font-size:2rem;"></i>
            <p>No se encontró una ruta publicada para esta clase.</p>
          </div>
        `}
      </div>

      <div id="ruta-action-panel"></div>

    </div>
  `

  _attachEvents(container)
}

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
            <div style="font-size:11px;margin-top:2px;">Completa el nivel anterior al 80% para desbloquear</div>
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
        <div style="width:72px;height:5px;background:#e2e8f0;border-radius:3px;overflow:hidden;flex-shrink:0;">
          <div style="height:100%;width:${pct}%;background:${color};border-radius:3px;"></div>
        </div>
        <span data-chevron="${level.id}" style="color:#94a3b8;transition:transform 0.2s;font-size:14px;">›</span>
      </div>

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
      <div style="font-size:11px;color:#94a3b8;margin-bottom:6px;">
        ${escHTML(ind.blockNombre)} › ${escHTML(ind.levelNombre)} › ${escHTML(ind.nodeNombre)}
      </div>
      <div style="font-size:15px;font-weight:700;color:var(--pm-text-primary,#1e293b);margin-bottom:12px;">
        📌 ${escHTML(ind.nombre)}
      </div>
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
  container.querySelector('#ruta-clase-select')?.addEventListener('change', async (e) => {
    _state.activeClaseId = e.target.value
    _state.selectedInd   = null
    container.innerHTML  = `<div class="pm-loading"><div class="pm-spinner"></div></div>`
    await _loadTreeForActiveClass()
    _renderFull(container)
  })

  container.addEventListener('click', async (e) => {
    const el = e.target.closest('[data-action]')
    if (!el) return

    switch (el.dataset.action) {

      case 'toggle-level': {
        const levelId = el.dataset.levelId
        const body    = container.querySelector(`[data-level-body="${levelId}"]`)
        const chevron = container.querySelector(`[data-chevron="${levelId}"]`)
        if (!body) return
        const open = body.style.display !== 'none'

        if (!open && !body.dataset.loaded) {
          // Lazy-load nodes for this level on first expand
          body.innerHTML = `<div style="padding:10px;color:#94a3b8;"><i class="bi bi-hourglass-split"></i> Cargando...</div>`
          try {
            const nodes = await loadNodesForLevel(levelId)
            if (nodes.length > 0) {
              // Find the level object to render nodes with semaphore
              const levelObj = _state.blocks
                .flatMap(b => b.levels)
                .find(l => l.id === levelId)
              if (levelObj) {
                levelObj.nodes = nodes
                body.innerHTML = nodes.map(n => _renderNode(n, levelObj)).join('')
                body.dataset.loaded = 'true'
              }
            } else {
              body.innerHTML = `<div style="font-size:12px;color:#94a3b8;padding:4px 0;">Sin nodos</div>`
            }
          } catch (err) {
            console.error('[rutaPlayerView] lazy-load nodes error:', err)
            body.innerHTML = `<div style="padding:10px;color:#d32f2f;"><i class="bi bi-exclamation-circle"></i> Error cargando nodos</div>`
          }
        }

        body.style.display    = open ? 'none' : ''
        if (chevron) chevron.style.transform = open ? '' : 'rotate(90deg)'
        break
      }

      case 'toggle-node': {
        const nodeId = el.dataset.nodeId
        const body    = container.querySelector(`[data-node-body="${nodeId}"]`)
        const chevron = container.querySelector(`[data-chevron="${nodeId}"]`)
        if (!body) return
        const open = body.style.display !== 'none'

        if (!open && !body.dataset.loaded) {
          // Lazy-load indicators for this node on first expand
          body.innerHTML = `<div style="padding:4px 0;color:#94a3b8;font-size:12px;"><i class="bi bi-hourglass-split"></i> Cargando...</div>`
          try {
            const indicators = await loadIndicatorsForNode(nodeId)
            if (indicators.length > 0) {
              // Find the node object to render indicators with semaphore
              const nodeObj = _state.blocks
                .flatMap(b => b.levels)
                .flatMap(l => l.nodes)
                .find(n => n.id === nodeId)
              if (nodeObj) {
                nodeObj.indicators = indicators
                const levelObj = _state.blocks
                  .flatMap(b => b.levels)
                  .find(l => l.nodes.some(n => n.id === nodeId))
                body.innerHTML = indicators.map(i => _renderIndicator(i, nodeObj, levelObj)).join('')
                body.dataset.loaded = 'true'
              }
            } else {
              body.innerHTML = `<div style="font-size:12px;color:#94a3b8;padding:4px 0;">Sin indicadores</div>`
            }
          } catch (err) {
            console.error('[rutaPlayerView] lazy-load indicators error:', err)
            body.innerHTML = `<div style="font-size:12px;color:#d32f2f;"><i class="bi bi-exclamation-circle"></i> Error cargando indicadores</div>`
          }
        }

        body.style.display    = open ? 'none' : ''
        if (chevron) chevron.style.transform = open ? '' : 'rotate(90deg)'
        break
      }

      case 'select-indicator': {
        _state.selectedInd = {
          id:          el.dataset.indId,
          nombre:      el.dataset.indNombre,
          nodeNombre:  el.dataset.nodeNombre,
          levelNombre: el.dataset.levelNombre,
          blockNombre: _state.blocks[0]?.nombre ?? '',
        }
        _renderActionPanel(container)
        container.querySelector('#ruta-action-panel')?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
        break
      }

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
        window.location.hash = `#/hoy/${_state.activeClaseId}`
        break
      }

      case 'clear-pending': {
        sessionStorage.removeItem('soi_ruta_tema_pendiente')
        _renderFull(container)
        break
      }

      case 'close-panel': {
        _state.selectedInd = null
        _renderActionPanel(container)
        break
      }
    }
  })
}
