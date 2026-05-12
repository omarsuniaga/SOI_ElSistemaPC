/**
 * routeTreeBar — Visualizador de Ruta para Asistencia (NUEVO MODELO: plan_clases)
 */
import { supabase } from '../../lib/supabaseClient.js'
import { RouteConfigAdapter } from '../services/routeConfigAdapter.js'

function _escHTML(str) {
  const div = document.createElement('div')
  div.textContent = str ?? ''
  return div.innerHTML
}

export function createRouteTreeBar(container, { claseId, rutaId, completedTopics = [], onIndicadorSelect }) {
  let _hierarchy = []
  let _loading = false
  let _activeNode = null

  const wrapper = document.createElement('div')
  wrapper.className = 'pm-route-bar-wrapper'
  container.appendChild(wrapper)

  // Estilos locales para el árbol compacto en asistencia
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

    const obj = e.target.closest('[data-type="obj"]')
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
    if (_loading) {
      wrapper.innerHTML = '<div style="padding:1rem; text-align:center; font-size:0.8rem; color:var(--pm-text-muted);">Cargando ruta...</div>'
      return
    }

    if (!_hierarchy || _hierarchy.length === 0) {
      wrapper.innerHTML = '<div style="padding:1rem; text-align:center; font-size:0.8rem; color:var(--pm-text-muted);">No hay objetivos configurados para esta clase.</div>'
      return
    }

    wrapper.innerHTML = _hierarchy.map(nivel => `
      <div class="pm-tree-level">
        <div style="background:var(--pm-surface-2); padding: 0.4rem 1rem; font-size:0.7rem; font-weight:800; color:var(--pm-primary); text-transform:uppercase; letter-spacing:0.5px;">
          ${_escHTML(nivel.nombre)}
        </div>
        ${(nivel.plan_temas || []).map(tema => `
          <div class="pm-tree-node" data-type="node">
            <div class="pm-tree-header">
              <span class="pm-tree-title">${_escHTML(tema.nombre)}</span>
              <span class="pm-tree-badge">${tema.tipo}</span>
            </div>
          </div>
          <div class="pm-tree-children">
            ${(tema.plan_objetivos || []).map(obj => {
              const isCompleted = (completedTopics || []).includes(obj.nombre);
              return `
                <div class="pm-tree-obj" data-type="obj" data-id="${obj.id}" data-nombre="${_escHTML(obj.nombre)}">
                  <i class="bi ${isCompleted ? 'bi-check-circle-fill text-success' : (_activeNode?.id === obj.id ? 'bi-circle-fill text-primary' : 'bi-circle')}"></i>
                  <span style="${isCompleted ? 'text-decoration: line-through; opacity: 0.6;' : ''}">${_escHTML(obj.nombre)}</span>
                </div>
              `;
            }).join('')}
          </div>
        `).join('')}
      </div>
    `).join('')
  }

  async function refresh() {
    if (!rutaId) return
    _loading = true
    _render()

    try {
      // Usamos el nuevo Adapter para traer la jerarquía de plan_clases
      _hierarchy = await RouteConfigAdapter.getRouteHierarchy(rutaId)
    } catch (err) {
      console.error('[routeTreeBar] Error:', err)
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
    return _activeNode
  }

  refresh()

  return { refresh, destroy, getActiveIndicador }
}
