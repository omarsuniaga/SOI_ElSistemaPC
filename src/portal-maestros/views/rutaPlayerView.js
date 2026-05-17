import { getMaestroLocal }                         from '../auth/maestroAuth.js'
import { getMisClases, invalidateClasesCache }      from '../services/maestroDataService.js'
import { loadRouteTree, resolveRutaIdForClase, loadNodesForLevel, loadIndicatorsForNode, invalidateSemaphoresForClase } from '../services/rutaService.js'
import { setRutaTema, peekRutaTema }                from '../services/rutaTopicStore.js'
import { createNodeEvaluationCard }                  from '../components/NodeEvaluationCard.js'
import { escHTML }                                  from '../utils/portalUtils.js'
import { academicService }                          from '../../modules/academic-routes/services/academicService.js'

const SEM_ICON  = { green: '🟢', yellow: '🟡', gray: '⚫' }

let _state = {
  clases:           [],
  activeClaseId:    null,
  rutaId:           null,
  blocks:           [],
  selectedInd:      null,
  evaluacionActiva: null,  // { sesionId, nodoId, indicadorId, claseId }
  evaluando:        false,
  loading:          false,
}

const _maestroLocal = () => getMaestroLocal()

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
    ? `<div class="rp-pending-banner">
        <i class="bi bi-clock-history"></i>
        Tema pendiente de asignar: <strong>${escHTML(pendingTema.nombre)}</strong>
        <button data-action="clear-pending" class="rp-pending-cancel">Cancelar</button>
       </div>`
    : ''

  container.innerHTML = `
    <div style="padding:16px;max-width:800px;margin:0 auto;">

      <div class="rp-header-row">
        <i class="bi bi-diagram-3-fill rp-header-icon"></i>
        <h1 class="rp-title">Ruta de Contenidos</h1>
        <select id="ruta-clase-select" class="rp-clase-select">
          ${_state.clases.map(c => `
            <option value="${c.id}" ${c.id === _state.activeClaseId ? 'selected' : ''}>
              ${escHTML(c.nombre)}
            </option>
          `).join('')}
        </select>
      </div>

      ${pendingBanner}

      <div id="ruta-tree-area"
           role="tree"
           aria-label="Ruta de aprendizaje">
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
    <div role="presentation" style="margin-bottom:20px;">
      <div role="presentation" style="
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
      <div class="rp-level rp-level--locked">
        <div class="rp-level-header" style="opacity:0.6;">
          <span style="font-size:18px;" aria-hidden="true">🔒</span>
          <div>
            <div style="font-weight:600;font-size:13px;">${escHTML(level.nombre)}</div>
            <div style="font-size:11px;margin-top:2px;">Completa el nivel anterior al 80% para desbloquear</div>
          </div>
        </div>
      </div>`
  }

  const sem = level.semaphore
  const pct = _levelPct(level)

  return `
    <div class="rp-level" data-semaphore="${sem}">
      <div data-action="toggle-level"
           data-level-id="${level.id}"
           role="treeitem"
           aria-expanded="false"
           data-semaphore="${sem}"
           class="rp-level-header"
           tabindex="-1">
        <span aria-hidden="true">${SEM_ICON[sem]}</span>
        <div style="flex:1;min-width:0;">
          <div class="rp-level-name">${escHTML(level.nombre)}</div>
          <div class="rp-level-pct" data-semaphore="${sem}">${pct}% completado</div>
        </div>
        <div class="rp-progress-track">
          <div class="rp-progress-fill" data-semaphore="${sem}" style="width:${pct}%;"></div>
        </div>
        <span data-chevron="${level.id}" class="rp-chevron">›</span>
      </div>

      <div data-level-body="${level.id}"
           role="group"
           class="rp-level-body"
           style="display:none;">
        ${level.nodes.map(node => _renderNode(node, level)).join('')}
      </div>
    </div>`
}

function _renderNode(node, level) {
  const sem = node.semaphore

  return `
    <div class="rp-node" data-semaphore="${sem}">
      <div data-action="toggle-node"
           data-node-id="${node.id}"
           role="treeitem"
           aria-expanded="false"
           data-semaphore="${sem}"
           class="rp-node-header"
           tabindex="-1">
        <span aria-hidden="true">${SEM_ICON[sem]}</span>
        <span class="rp-node-name">${escHTML(node.nombre)}</span>
        <span data-chevron="${node.id}" class="rp-chevron">›</span>
      </div>

      <div data-node-body="${node.id}"
           role="group"
           class="rp-node-body"
           style="display:none;">
        ${node.indicators.map(ind => _renderIndicator(ind, node, level)).join('')}
        ${node.indicators.length === 0
          ? `<div style="font-size:12px;color:#94a3b8;padding:4px 0;">Sin indicadores</div>`
          : ''}
      </div>
    </div>`
}

function _renderIndicator(ind, node, level) {
  const sem   = ind.semaphore
  const isSelected = _state.selectedInd?.id === ind.id
  const cls = `rp-indicator${isSelected ? ' rp-indicator--selected' : ''}`

  return `
    <div data-action="select-indicator"
         data-ind-id="${ind.id}"
         data-ind-nombre="${escHTML(ind.nombre)}"
         data-node-nombre="${escHTML(node.nombre)}"
         data-level-nombre="${escHTML(level.nombre)}"
         role="treeitem"
         aria-selected="${isSelected}"
         data-semaphore="${sem}"
         class="${cls}"
         tabindex="-1">
      <span aria-hidden="true">${SEM_ICON[sem]}</span>
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

  const maestro = _maestroLocal()

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

      <!-- Evaluation buttons for class-level progress -->
      <div style="margin-bottom:12px;border-top:1px solid var(--pm-border,#e2e8f0);padding-top:12px;">
        <div style="font-size:11px;font-weight:600;color:var(--pm-text-muted,#64748b);margin-bottom:6px;">
          Evaluación de clase
        </div>
        <div style="display:flex;gap:6px;flex-wrap:wrap;" id="ruta-eval-buttons">
          <button data-action="eval-indicator" data-status="approved" class="pm-eval-ruta-btn" style="
            flex:1;padding:8px 12px;border-radius:8px;border:1px solid #22c55e;
            background:transparent;color:#22c55e;font-size:12px;font-weight:600;cursor:pointer;
          ">✅ Logrado</button>
          <button data-action="eval-indicator" data-status="in_process" class="pm-eval-ruta-btn" style="
            flex:1;padding:8px 12px;border-radius:8px;border:1px solid #f59e0b;
            background:transparent;color:#f59e0b;font-size:12px;font-weight:600;cursor:pointer;
          ">🔄 En Proceso</button>
          <button data-action="eval-indicator" data-status="failed" class="pm-eval-ruta-btn" style="
            flex:1;padding:8px 12px;border-radius:8px;border:1px solid #ef4444;
            background:transparent;color:#ef4444;font-size:12px;font-weight:600;cursor:pointer;
          ">❌ No Logrado</button>
        </div>
        <div id="ruta-eval-status" style="font-size:11px;color:var(--pm-text-muted,#64748b);margin-top:6px;"></div>
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

function _updateTreeTabindex() {
  const tree = document.getElementById('ruta-tree-area')
  if (!tree) return
  const items = tree.querySelectorAll('[role="treeitem"]')
  let foundFirst = false
  items.forEach(item => {
    // Only visible items (not hidden by display:none or inside a collapsed parent)
    if (item.offsetParent !== null) {
      item.setAttribute('tabindex', foundFirst ? '-1' : '0')
      foundFirst = true
    } else {
      item.setAttribute('tabindex', '-1')
    }
  })
}

function _handleTreeKeydown(e, tree) {
  const target = e.target.closest('[role="treeitem"]')
  if (!target || !tree.contains(target)) return

  const key = e.key

  // Collect all visible treeitems
  const allItems = Array.from(tree.querySelectorAll('[role="treeitem"]'))
    .filter(el => el.offsetParent !== null)

  const idx = allItems.indexOf(target)
  if (idx === -1) return

  let newIdx = idx

  switch (key) {
    case 'ArrowDown':
      e.preventDefault()
      newIdx = Math.min(idx + 1, allItems.length - 1)
      break
    case 'ArrowUp':
      e.preventDefault()
      newIdx = Math.max(idx - 1, 0)
      break
    case 'ArrowRight':
      e.preventDefault()
      if (target.getAttribute('aria-expanded') === 'false') {
        target.click()
      }
      return
    case 'ArrowLeft':
      e.preventDefault()
      if (target.getAttribute('aria-expanded') === 'true') {
        target.click()
      }
      return
    case 'Home':
      e.preventDefault()
      newIdx = 0
      break
    case 'End':
      e.preventDefault()
      newIdx = allItems.length - 1
      break
    case 'Enter':
    case ' ':
      e.preventDefault()
      target.click()
      return
    default:
      return
  }

  if (newIdx !== idx && newIdx >= 0) {
    const next = allItems[newIdx]
    if (next) {
      next.focus()
      next.setAttribute('tabindex', '0')
      target.setAttribute('tabindex', '-1')
    }
  }
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
        el.setAttribute('aria-expanded', open ? 'false' : 'true')
        _updateTreeTabindex()
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
        el.setAttribute('aria-expanded', open ? 'false' : 'true')
        _updateTreeTabindex()
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
        container.querySelector('#ruta-action-panel')?.scrollIntoView?.({ behavior: 'smooth', block: 'nearest' })
        break
      }

      case 'eval-indicator': {
        const ind = _state.selectedInd
        if (!ind) return
        const maestro = _maestroLocal()
        if (!maestro) break

        const status = el.dataset.status
        const statusEl = container.querySelector('#ruta-eval-status')
        const allBtns = container.querySelectorAll('.pm-eval-ruta-btn')
        statusEl.textContent = '⏳ Guardando...'
        allBtns.forEach(b => b.style.opacity = '0.5')

        try {
          await academicService.saveIndicatorAttempt({
            indicator_id: ind.id,
            clase_id: _state.activeClaseId,
            created_by: maestro.id,
            status,
            feedback: '',
            attempt_number: 1,
          })
          invalidateSemaphoresForClase(_state.activeClaseId)
          statusEl.textContent = `✅ Guardado — ${status === 'approved' ? 'Logrado' : status === 'in_process' ? 'En Proceso' : 'No Logrado'}`
          statusEl.style.color = '#22c55e'
        } catch (err) {
          console.error('[rutaPlayer] eval error:', err)
          statusEl.textContent = '❌ Error al guardar evaluación'
          statusEl.style.color = '#ef4444'
        }
        allBtns.forEach(b => b.style.opacity = '1')
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

  // Keyboard navigation for the ARIA tree
  container.addEventListener('keydown', (e) => {
    const tree = container.querySelector('#ruta-tree-area')
    if (!tree) return
    _handleTreeKeydown(e, tree)
  })

  // Initialize tree tabindex after first render
  requestAnimationFrame(() => _updateTreeTabindex())
}
