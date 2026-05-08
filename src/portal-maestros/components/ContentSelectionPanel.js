/**
 * ContentSelectionPanel — Class content selection for a student session.
 * Loads activeNodes/suggestedNodes via generateClassEvent and lets the
 * teacher pick which nodes to cover, then confirms selection.
 */

import { escHTML } from '../utils/portalUtils.js'
import { generateClassEvent } from '../services/classEventService.js'

/**
 * @param {{ sessionId: string, studentId: string, teacherId: string, onConfirm: Function }} opts
 * @returns {{ el: HTMLElement, refresh: Function, destroy: Function, getSelectedNodes: Function }}
 */
export function createContentSelectionPanel({ sessionId, studentId, teacherId, onConfirm }) {
  const el = document.createElement('div')
  el.className = 'pm-content-panel-root'

  let _data = null
  let _aborted = false

  async function load() {
    el.innerHTML = `<div class="pm-loading"><div class="pm-spinner"></div></div>`
    try {
      _data = await generateClassEvent({ studentId, teacherId, sessionId })
      if (_aborted) return
      render()
    } catch (err) {
      if (_aborted) return
      el.innerHTML = `<div class="pm-empty">Error al cargar contenido: ${escHTML(err.message)}</div>`
    }
  }

  function statusBadge(progress) {
    if (!progress || !progress.status || progress.status === 'pending') {
      return `<span class="pm-badge pm-badge-muted">Pendiente</span>`
    }
    if (progress.status === 'in_process') {
      return `<span class="pm-badge pm-badge-warning">En proceso</span>`
    }
    return `<span class="pm-badge">${escHTML(progress.status)}</span>`
  }

  function isSuggested(nodeId) {
    return (_data?.suggestedNodes || []).some(n => n.id === nodeId)
  }

  function renderIndicators(node) {
    const indicators = node.indicators
    if (!indicators || indicators.length === 0) return ''
    const items = indicators
      .map(ind => `<li class="pm-content-panel-indicator">${escHTML(ind.description || ind.indicatorId || '')}</li>`)
      .join('')
    return `
      <details class="pm-content-panel-details">
        <summary>Indicadores (${indicators.length})</summary>
        <ul class="pm-content-panel-indicator-list">${items}</ul>
      </details>`
  }

  function render() {
    const { level, activeNodes, lastHomework } = _data

    const levelName = level?.name || `Nivel ${level?.level_number || '?'}`

    let homeworkHTML = ''
    if (lastHomework) {
      const hwStatus = lastHomework.status === 'completed'
        ? `<span class="pm-badge">Completada</span>`
        : `<span class="pm-badge pm-badge-warning">${escHTML(lastHomework.status || 'pendiente')}</span>`
      homeworkHTML = `
        <div class="pm-content-panel-homework">
          Tarea anterior: ${escHTML(lastHomework.description || '')} ${hwStatus}
        </div>`
    }

    const nodesHTML = (activeNodes || []).map(node => {
      const checked = isSuggested(node.id) ? 'checked' : ''
      return `
        <label class="pm-content-panel-node">
          <input type="checkbox" data-node-id="${escHTML(node.id)}" ${checked} />
          <span class="pm-content-panel-node-name">${escHTML(node.name || node.key)}</span>
          ${statusBadge(node.progress)}
          ${renderIndicators(node)}
        </label>`
    }).join('')

    el.innerHTML = `
      <div class="pm-content-panel-header">
        <h3 class="pm-content-panel-title">Contenido de Clase</h3>
        <span class="pm-badge">${escHTML(levelName)}</span>
      </div>
      ${homeworkHTML}
      <div class="pm-content-panel-nodes">
        ${nodesHTML || '<div class="pm-empty">No hay nodos disponibles.</div>'}
      </div>
      <button class="pm-btn pm-btn-primary pm-btn-block pm-content-panel-confirm" type="button">
        Confirmar Contenido (${getSelectedNodes().length})
      </button>`

    // Update button count on checkbox change
    el.addEventListener('change', () => {
      const btn = el.querySelector('.pm-content-panel-confirm')
      if (btn) btn.textContent = `Confirmar Contenido (${getSelectedNodes().length})`
    })

    el.querySelector('.pm-content-panel-confirm')?.addEventListener('click', () => {
      if (typeof onConfirm === 'function') {
        onConfirm({
          classEventId: _data.classEventId,
          level: _data.level,
          selectedNodes: getSelectedNodes(),
        })
      }
    })
  }

  function getSelectedNodes() {
    const checks = el.querySelectorAll('input[type="checkbox"][data-node-id]:checked')
    const ids = new Set(Array.from(checks).map(c => c.dataset.nodeId))
    return (_data?.activeNodes || []).filter(n => ids.has(n.id))
  }

  function refresh() {
    load()
  }

  function destroy() {
    _aborted = true
    el.innerHTML = ''
  }

  // Auto-load on creation
  load()

  return { el, refresh, destroy, getSelectedNodes }
}
