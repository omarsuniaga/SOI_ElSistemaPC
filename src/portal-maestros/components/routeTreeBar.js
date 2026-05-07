/**
 * routeTreeBar — Collapsible route tree bar with semaphore indicators.
 *
 * Usage:
 *   const bar = createRouteTreeBar(container, { claseId, rutaId, onIndicadorSelect })
 *   bar.refresh()
 *   bar.destroy()
 *   bar.getActiveIndicador()
 *
 * rutaId is treated as route_version_id (the caller resolves from clases → route_versions).
 */

import { supabase } from '../../lib/supabaseClient.js'
import { getSemaphoreForNode } from '../services/evaluationService.js'

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

function _escHTML(str) {
  const div = document.createElement('div')
  div.textContent = str ?? ''
  return div.innerHTML
}

const SEMAPHORE_ICON = { green: '🟢', yellow: '🟡', gray: '⚫' }

// ─────────────────────────────────────────────────────────────────────────────
// Data loading
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Load the full route tree for a given route_version_id and claseId.
 * Returns a nested structure: blocks[] → levels[] → nodes[] → indicators[]
 * Each indicator carries a `semaphore` ('green'|'yellow'|'gray').
 *
 * @param {string} routeVersionId
 * @param {string} claseId
 * @returns {Promise<import('./routeTreeBar.types').Block[]>}
 */
async function _loadTree(routeVersionId, claseId) {
  // 1. Blocks
  const { data: blocks, error: bErr } = await supabase
    .from('blocks')
    .select('id, nombre, order_index')
    .eq('route_version_id', routeVersionId)
    .order('order_index', { ascending: true })

  if (bErr) throw bErr
  if (!blocks || blocks.length === 0) return []

  // 2. Levels
  const blockIds = blocks.map(b => b.id)
  const { data: levels, error: lErr } = await supabase
    .from('levels')
    .select('id, block_id, nombre, order_index')
    .in('block_id', blockIds)
    .eq('route_version_id', routeVersionId)
    .order('order_index', { ascending: true })

  if (lErr) throw lErr

  // 3. Nodes
  const levelIds = (levels ?? []).map(l => l.id)
  if (levelIds.length === 0) {
    return blocks.map(b => ({ ...b, levels: [] }))
  }

  const { data: nodes, error: nErr } = await supabase
    .from('nodes')
    .select('id, level_id, nombre, order_index')
    .in('level_id', levelIds)
    .eq('route_version_id', routeVersionId)
    .order('order_index', { ascending: true })

  if (nErr) throw nErr

  // 4. Indicators + semaphore per node (parallel)
  const nodeIds = (nodes ?? []).map(n => n.id)

  const [indResult, semaphoreResults] = await Promise.all([
    nodeIds.length > 0
      ? supabase
          .from('indicators')
          .select('id, node_id, nombre, description, order_index, is_required')
          .in('node_id', nodeIds)
          .eq('activo', true)
          .order('order_index', { ascending: true })
      : Promise.resolve({ data: [], error: null }),

    Promise.all(
      (nodes ?? []).map(n =>
        getSemaphoreForNode(n.id, claseId)
          .then(r => ({ nodeId: n.id, semaphore: r.semaphore, indicators: r.indicators }))
          .catch(() => ({ nodeId: n.id, semaphore: 'gray', indicators: [] }))
      )
    ),
  ])

  if (indResult.error) throw indResult.error

  // Build semaphore map: nodeId → { nodeSemaphore, indicatorSemaphores }
  const nodeSemaphoreMap = new Map()
  for (const s of semaphoreResults) {
    nodeSemaphoreMap.set(s.nodeId, s.semaphore)
  }

  // Group indicators by node, attach indicator-level semaphore
  // Indicator semaphore: we derive it from node-level data from getSemaphoreForNode.
  // Since getSemaphoreForNode returns node-level aggregate, we fall back:
  // - If node is green → all indicators green
  // - If node is yellow → all indicators yellow
  // - If node is gray → all indicators gray
  // This is a simplification; a per-indicator semaphore would need extra queries.
  const indByNode = new Map()
  for (const ind of indResult.data ?? []) {
    if (!indByNode.has(ind.node_id)) indByNode.set(ind.node_id, [])
    const nodeSem = nodeSemaphoreMap.get(ind.node_id) ?? 'gray'
    indByNode.get(ind.node_id).push({ ...ind, semaphore: nodeSem })
  }

  // Group nodes by level
  const nodesByLevel = new Map()
  for (const node of nodes ?? []) {
    if (!nodesByLevel.has(node.level_id)) nodesByLevel.set(node.level_id, [])
    nodesByLevel.get(node.level_id).push({
      ...node,
      semaphore: nodeSemaphoreMap.get(node.id) ?? 'gray',
      indicators: indByNode.get(node.id) ?? [],
    })
  }

  // Group levels by block
  const levelsByBlock = new Map()
  for (const level of levels ?? []) {
    if (!levelsByBlock.has(level.block_id)) levelsByBlock.set(level.block_id, [])
    const levelNodes = nodesByLevel.get(level.id) ?? []
    // Level semaphore: green if all nodes green, gray if all gray, else yellow
    const nodeSems = levelNodes.map(n => n.semaphore)
    const levelSem = nodeSems.every(s => s === 'green')
      ? 'green'
      : nodeSems.every(s => s === 'gray')
      ? 'gray'
      : 'yellow'
    levelsByBlock.get(level.block_id).push({ ...level, semaphore: levelSem, nodes: levelNodes })
  }

  return blocks.map(b => ({
    ...b,
    levels: levelsByBlock.get(b.id) ?? [],
  }))
}

/**
 * Determine if a level is locked (previous level < 80% green indicators).
 * Levels are checked in order_index order within a block.
 *
 * @param {object[]} levels - sorted by order_index
 * @param {number} currentIdx
 * @returns {boolean}
 */
function _isLevelLocked(levels, currentIdx) {
  if (currentIdx === 0) return false
  const prev = levels[currentIdx - 1]
  // Gather all indicators from all nodes in previous level
  const allInds = prev.nodes.flatMap(n => n.indicators)
  if (allInds.length === 0) return false
  const greenCount = allInds.filter(i => i.semaphore === 'green').length
  return greenCount / allInds.length < 0.8
}

/**
 * Find the first "suggested" indicator: first gray indicator in order.
 *
 * @param {object[]} blocks
 * @returns {object|null} indicator with id and nombre
 */
function _findSuggested(blocks) {
  for (const block of blocks) {
    for (const level of block.levels) {
      for (const node of level.nodes) {
        for (const ind of node.indicators) {
          if (ind.semaphore === 'gray') return ind
        }
      }
    }
  }
  return null
}

// ─────────────────────────────────────────────────────────────────────────────
// Rendering
// ─────────────────────────────────────────────────────────────────────────────

function _renderCollapsed(activeIndicador, suggestedIndicador) {
  const display = activeIndicador ?? suggestedIndicador
  const label = activeIndicador ? 'Tema activo' : 'Sugerido'
  const name = display ? _escHTML(display.nombre) : 'Sin indicadores'
  return /* html */ `
    <div class="pm-route-bar--collapsed" data-action="toggle-tree">
      <div>
        <div class="pm-route-bar__label">${label}</div>
        <div class="pm-route-bar__breadcrumb">${name}</div>
      </div>
      <span class="pm-route-bar__chevron">▾</span>
    </div>
  `
}

function _renderIndicador(ind, isActive, isSuggested) {
  const icon = SEMAPHORE_ICON[ind.semaphore] ?? '⚫'
  const colorCls = `pm-route-indicador--${ind.semaphore}`
  const activeCls = isActive ? ' pm-route-indicador--active' : ''
  return /* html */ `
    <div class="pm-route-indicador ${colorCls}${activeCls}"
         data-action="select-indicador"
         data-id="${_escHTML(ind.id)}"
         data-nombre="${_escHTML(ind.nombre)}">
      <span class="pm-route-indicador__icon">${icon}</span>
      <div class="pm-route-indicador__info">
        <div class="pm-route-indicador__name">${_escHTML(ind.nombre)}</div>
        ${isSuggested ? '<div class="pm-route-indicador__sugerido">★ Sugerido</div>' : ''}
      </div>
    </div>
  `
}

function _renderNode(node, activeId, suggestedId) {
  const indicators = node.indicators
    .map(ind =>
      _renderIndicador(ind, ind.id === activeId, ind.id === suggestedId)
    )
    .join('')

  const icon = SEMAPHORE_ICON[node.semaphore] ?? '⚫'

  return /* html */ `
    <div class="pm-route-nodo">
      <div class="pm-route-nodo__header" data-action="toggle-nodo" data-nodo-id="${_escHTML(node.id)}">
        <span>${icon}</span>
        <span class="pm-route-nodo__name">${_escHTML(node.nombre)}</span>
      </div>
      <div class="pm-route-nodo__body" data-nodo-body="${_escHTML(node.id)}">
        ${indicators || '<div style="padding:0.5rem;font-size:0.8rem;color:var(--pm-text-muted)">Sin indicadores</div>'}
      </div>
    </div>
  `
}

function _renderLevel(level, idx, levels, activeId, suggestedId) {
  const locked = _isLevelLocked(levels, idx)
  const lockedCls = locked ? ' pm-route-nivel--locked' : ''
  const badgeText = locked ? '🔒 Bloqueado' : `${level.semaphore === 'green' ? '✓ Completado' : 'En progreso'}`
  const badgeCls = locked ? 'pm-route-nivel__badge--locked' : ''

  const nodesHtml = level.nodes.map(n => _renderNode(n, activeId, suggestedId)).join('')

  return /* html */ `
    <div class="pm-route-nivel${lockedCls}">
      <div class="pm-route-nivel__header" data-action="toggle-nivel" data-nivel-id="${_escHTML(level.id)}">
        <span>${SEMAPHORE_ICON[level.semaphore] ?? '⚫'}</span>
        <span class="pm-route-nivel__name">${_escHTML(level.nombre)}</span>
        <span class="pm-route-nivel__badge ${badgeCls}">${badgeText}</span>
      </div>
      <div class="pm-route-nivel__body" data-nivel-body="${_escHTML(level.id)}">
        ${nodesHtml || '<div style="padding:0.5rem;font-size:0.8rem;color:var(--pm-text-muted)">Sin nodos</div>'}
      </div>
    </div>
  `
}

function _renderTree(blocks, activeId, suggestedId) {
  if (!blocks || blocks.length === 0) {
    return /* html */ `
      <div class="pm-route-tree">
        <div style="padding:1rem;text-align:center;color:var(--pm-text-muted);font-size:0.85rem">
          No hay ruta cargada
        </div>
      </div>
    `
  }

  const content = blocks
    .map(block => {
      const levelsHtml = block.levels
        .map((level, idx) => _renderLevel(level, idx, block.levels, activeId, suggestedId))
        .join('')
      return /* html */ `
        <div class="pm-route-block">
          <div style="padding:0.5rem 0.25rem;font-size:0.75rem;color:var(--pm-text-muted);text-transform:uppercase;letter-spacing:1px;">
            ${_escHTML(block.nombre)}
          </div>
          ${levelsHtml}
        </div>
      `
    })
    .join('')

  return /* html */ `<div class="pm-route-tree">${content}</div>`
}

// ─────────────────────────────────────────────────────────────────────────────
// Public factory
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Create the RouteTreeBar component.
 *
 * @param {HTMLElement} container
 * @param {{ claseId: string, rutaId: string, onIndicadorSelect: (ind: {id:string, nombre:string}) => void }} options
 * @returns {{ refresh: () => Promise<void>, destroy: () => void, getActiveIndicador: () => object|null }}
 */
export function createRouteTreeBar(container, { claseId, rutaId, onIndicadorSelect }) {
  let _blocks = []
  let _expanded = false
  let _activeIndicador = null
  let _suggestedIndicador = null
  let _loading = false

  // Create wrapper
  const wrapper = document.createElement('div')
  wrapper.className = 'pm-route-bar-wrapper'
  container.appendChild(wrapper)

  // ── Event delegation ────────────────────────────────────────────────────

  function _handleClick(e) {
    const action = e.target.closest('[data-action]')
    if (!action) return

    switch (action.dataset.action) {
      case 'toggle-tree':
        _expanded = !_expanded
        _render()
        break

      case 'select-indicador': {
        const id = action.dataset.id
        const nombre = action.dataset.nombre
        _activeIndicador = { id, nombre }
        _expanded = false
        _render()
        onIndicadorSelect?.({ id, nombre })
        break
      }

      case 'toggle-nivel': {
        const nivelId = action.dataset.nivelId
        const body = wrapper.querySelector(`[data-nivel-body="${nivelId}"]`)
        if (body) {
          body.style.display = body.style.display === 'none' ? '' : 'none'
        }
        break
      }

      case 'toggle-nodo': {
        const nodoId = action.dataset.nodoId
        const body = wrapper.querySelector(`[data-nodo-body="${nodoId}"]`)
        if (body) {
          body.style.display = body.style.display === 'none' ? '' : 'none'
        }
        break
      }
    }
  }

  wrapper.addEventListener('click', _handleClick)

  // ── Rendering ────────────────────────────────────────────────────────────

  function _render() {
    if (_loading) {
      wrapper.innerHTML = /* html */ `
        <div class="pm-route-bar--collapsed" style="cursor:default">
          <div>
            <div class="pm-route-bar__label">Cargando ruta…</div>
          </div>
        </div>
      `
      return
    }

    const collapsed = _renderCollapsed(_activeIndicador, _suggestedIndicador)
    const tree = _expanded ? _renderTree(_blocks, _activeIndicador?.id, _suggestedIndicador?.id) : ''
    wrapper.innerHTML = collapsed + tree
  }

  // ── Data loading ─────────────────────────────────────────────────────────

  async function refresh() {
    if (!rutaId || !claseId) {
      _blocks = []
      _render()
      return
    }

    _loading = true
    _render()

    try {
      _blocks = await _loadTree(rutaId, claseId)
      _suggestedIndicador = _findSuggested(_blocks)
    } catch (err) {
      console.error('[routeTreeBar] Error loading tree:', err)
      _blocks = []
      _suggestedIndicador = null
    } finally {
      _loading = false
      _render()
    }
  }

  function destroy() {
    wrapper.removeEventListener('click', _handleClick)
    wrapper.remove()
  }

  function getActiveIndicador() {
    return _activeIndicador
  }

  // ── Init ─────────────────────────────────────────────────────────────────
  refresh()

  return { refresh, destroy, getActiveIndicador }
}
