/**
 * routeTreeBar — Curriculum route visualizer for the attendance view.
 *
 * Accepts a pre-resolved curriculum tree (blocks → levels → nodes → indicators).
 * Does NOT query Supabase or plan_* tables directly.
 *
 * @param {HTMLElement} container
 * @param {{
 *   claseId: string,
 *   tree?: Block[],           // pre-resolved tree from curriculumAdapter
 *   completedTopics?: string[],
 *   onIndicadorSelect?: (ind: {id: string, nombre: string}) => void
 * }} options
 * @returns {{ refresh: Function, destroy: Function, getActiveIndicador: Function }}
 */
import { EmptyCurriculumState } from './EmptyCurriculumState.js'

function _escHTML(str) {
  const div = document.createElement('div')
  div.textContent = str ?? ''
  return div.innerHTML
}

export function createRouteTreeBar(container, { claseId, tree = null, completedTopics = [], onIndicadorSelect }) {
  let _tree = tree
  let _activeNode = null

  const wrapper = document.createElement('div')
  wrapper.className = 'pm-route-bar-wrapper'
  container.appendChild(wrapper)

  // Local styles for the compact tree in the attendance view
  if (!document.getElementById('pm-route-bar-styles')) {
    const style = document.createElement('style')
    style.id = 'pm-route-bar-styles'
    style.textContent = `
      .pm-route-bar-wrapper { margin: 0.5rem 1rem; background: var(--pm-surface); border: 1px solid var(--pm-border); border-radius: 12px; overflow: hidden; }
      .pm-tree-node { padding: 0.75rem 1rem; border-bottom: 1px solid var(--pm-border); cursor: pointer; transition: background 0.2s; }
      .pm-tree-node:hover { background: var(--pm-surface-2); }
      .pm-tree-node.active { border-left: 4px solid var(--pm-primary); background: rgba(var(--pm-primary-rgb), 0.05); }
      .pm-tree-header { display: flex; align-items: center; justify-content: space-between; }
      .pm-tree-title { font-weight: 700; font-size: 0.85rem; color: var(--pm-text); }
      .pm-tree-badge { font-size: 0.65rem; background: var(--pm-primary-light); color: var(--pm-primary); padding: 2px 6px; border-radius: 4px; font-weight: 800; }
      .pm-tree-children { padding-left: 1rem; background: var(--pm-surface-2); display: none; }
      .pm-tree-node.expanded + .pm-tree-children { display: block; }
      .pm-tree-obj { padding: 0.5rem 1rem; font-size: 0.8rem; color: var(--pm-text-muted); display: flex; align-items: center; gap: 0.5rem; cursor: pointer; }
      .pm-tree-obj:hover { color: var(--pm-primary); background: rgba(var(--pm-primary-rgb), 0.03); }
      .pm-tree-icon { width: 24px; height: 24px; border-radius: 50%; background: var(--pm-primary); color: white; display: flex; align-items: center; justify-content: center; font-size: 0.7rem; font-weight: 700; }
    `
    document.head.appendChild(style)
  }

  function _handleClick(e) {
    const node = e.target.closest('[data-type="node"]')
    if (node) {
      node.classList.toggle('expanded')
      return
    }

    const obj = e.target.closest('[data-type="ind"]')
    if (obj) {
      const id = obj.dataset.id
      const nombre = obj.dataset.nombre
      _activeNode = { id, nombre }
      onIndicadorSelect?.({ id, nombre })
      _render()
    }
  }

  wrapper.addEventListener('click', _handleClick)

  function _render() {
    if (!_tree || _tree.length === 0) {
      wrapper.innerHTML = EmptyCurriculumState({ reason: 'no_route' })
      return
    }

    // Flatten tree: blocks → levels → nodes → indicators
    // Display: block label + nodes as expandable rows + indicators as leaf items
    wrapper.innerHTML = _tree.map(block => {
      const blockName = block.name ?? block.nombre ?? ''
      const allNodes = (block.levels || []).flatMap(lvl => lvl.nodes || [])

      return `
        <div class="pm-tree-level">
          <div style="background:var(--pm-surface-2); padding: 0.4rem 1rem; font-size:0.7rem; font-weight:800; color:var(--pm-primary); text-transform:uppercase; letter-spacing:0.5px;">
            ${_escHTML(blockName)}
          </div>
          ${allNodes.map(node => {
            const nodeName = node.name ?? node.nombre ?? ''
            const nodeType = node.type ?? node.tipo ?? ''
            const indicators = node.indicators ?? []
            return `
              <div class="pm-tree-node" data-type="node">
                <div class="pm-tree-header">
                  <span class="pm-tree-title">${_escHTML(nodeName)}</span>
                  ${nodeType ? `<span class="pm-tree-badge">${_escHTML(nodeType)}</span>` : ''}
                </div>
              </div>
              <div class="pm-tree-children">
                ${indicators.map(ind => {
                  const indName = ind.description ?? ind.descripcion ?? ind.name ?? ''
                  const isCompleted = (completedTopics || []).includes(indName)
                  const isActive = _activeNode?.id === ind.id
                  return `
                    <div class="pm-tree-obj" data-type="ind" data-id="${ind.id}" data-nombre="${_escHTML(indName)}">
                      <i class="bi ${isCompleted ? 'bi-check-circle-fill text-success' : (isActive ? 'bi-circle-fill text-primary' : 'bi-circle')}"></i>
                      <span style="${isCompleted ? 'text-decoration: line-through; opacity: 0.6;' : ''}">${_escHTML(indName)}</span>
                    </div>
                  `
                }).join('')}
              </div>
            `
          }).join('')}
        </div>
      `
    }).join('')
  }

  /**
   * Update the tree with new data and re-render.
   * @param {Block[]} newTree
   */
  function setTree(newTree) {
    _tree = newTree
    _render()
  }

  function destroy() {
    wrapper.removeEventListener('click', _handleClick)
    wrapper.remove()
  }

  function getActiveIndicador() {
    return _activeNode
  }

  // Initial render with whatever tree was passed in
  _render()

  return { setTree, destroy, getActiveIndicador }
}
