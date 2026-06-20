/**
 * PlanningRouteTree.js
 * Visualizador read-only de la jerarquía de una ruta académica:
 * blocks → levels → nodes → indicators.
 *
 * Renderiza un acordeón colapsable. Por performance, niveles y nodos
 * arrancan colapsados (una ruta puede tener cientos de nodos/indicadores).
 */

import { getRouteVersionHierarchy } from '../../modules/planning/services/planningService.js'
import { escHTML } from '../utils/portalUtils.js'

const NODE_ICONS = {
  ESCALA: '🎼',
  ARPEGIO: '🎹',
  MANO_IZQ: '✋',
  ARCO: '🎻',
  SONIDO: '🔊',
  AFINACION: '🎵',
  TECNICA: '⚙️',
  REPERTORIO: '📖',
}

function _nodeIcon(type) {
  return NODE_ICONS[type] || '•'
}

/**
 * @param {HTMLElement} container
 * @param {{ routeVersionId: string }} opts
 */
export async function renderPlanningRouteTree(container, { routeVersionId }) {
  const blocks = await getRouteVersionHierarchy(routeVersionId)

  if (!blocks || blocks.length === 0) {
    container.innerHTML =
      '<div class="pm-planning-empty"><p>Esta ruta aún no tiene estructura configurada.</p></div>'
    return
  }

  const html = `
    <style>
      .pm-rt-root { display: flex; flex-direction: column; gap: 0.75rem; }
      .pm-rt-block { border: 1px solid var(--pm-border); border-radius: 12px; overflow: hidden; background: var(--pm-surface); }
      .pm-rt-block-head { padding: 0.9rem 1rem; background: var(--pm-surface-2); }
      .pm-rt-block-name { font-weight: 700; font-size: 1rem; color: var(--pm-text); }
      .pm-rt-block-obj { font-size: 0.78rem; color: var(--pm-text-muted); margin-top: 2px; }

      .pm-rt-toggle { display: flex; align-items: center; gap: 0.6rem; cursor: pointer; padding: 0.7rem 1rem; user-select: none; }
      .pm-rt-toggle:hover { background: var(--pm-surface-2); }
      .pm-rt-arrow { transition: transform 0.2s; color: var(--pm-text-muted); font-size: 0.75rem; }
      .pm-rt-open > .pm-rt-toggle .pm-rt-arrow { transform: rotate(90deg); }
      .pm-rt-children { display: none; }
      .pm-rt-open > .pm-rt-children { display: block; }

      .pm-rt-level { border-top: 1px solid var(--pm-border); }
      .pm-rt-level-num { width: 26px; height: 26px; flex-shrink: 0; background: var(--pm-primary); color: #fff; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 0.78rem; }
      .pm-rt-level-name { font-weight: 600; font-size: 0.9rem; }
      .pm-rt-level-obj { display: block; font-size: 0.72rem; color: var(--pm-text-muted); }

      .pm-rt-node { border-top: 1px solid var(--pm-border); padding-left: 1rem; }
      .pm-rt-node-icon { font-size: 1rem; }
      .pm-rt-node-name { font-weight: 600; font-size: 0.85rem; }
      .pm-rt-node-critical { font-size: 0.6rem; font-weight: 700; color: var(--pm-danger); border: 1px solid var(--pm-danger); border-radius: 4px; padding: 1px 4px; margin-left: 4px; }
      .pm-rt-count { margin-left: auto; font-size: 0.7rem; color: var(--pm-text-muted); }

      .pm-rt-indicators { list-style: none; margin: 0; padding: 0.5rem 1rem 0.75rem 2.5rem; }
      .pm-rt-indicator { font-size: 0.8rem; color: var(--pm-text); padding: 0.25rem 0; display: flex; gap: 0.4rem; }
      .pm-rt-indicator::before { content: '◦'; color: var(--pm-primary); }
      .pm-rt-indicator.required::before { content: '★'; color: var(--pm-warning, #fbbf24); }

      @media (max-width: 640px) {
        .pm-rt-toggle { padding: 0.6rem 0.75rem; }
        .pm-rt-indicators { padding-left: 1.5rem; }
      }
    </style>
    <div class="pm-rt-root">
      ${blocks.map((b) => _renderBlock(b)).join('')}
    </div>
  `

  container.innerHTML = html

  // Toggle de acordeón (delegación de eventos)
  container.querySelectorAll('.pm-rt-toggle').forEach((toggle) => {
    toggle.addEventListener('click', () => {
      toggle.closest('[data-collapsible]')?.classList.toggle('pm-rt-open')
    })
  })
}

function _renderBlock(block) {
  return `
    <div class="pm-rt-block">
      <div class="pm-rt-block-head">
        <div class="pm-rt-block-name">${escHTML(block.name || 'Bloque')}</div>
        ${block.objective ? `<div class="pm-rt-block-obj">${escHTML(block.objective)}</div>` : ''}
      </div>
      ${(block.levels || []).map((l) => _renderLevel(l)).join('')}
    </div>
  `
}

function _renderLevel(level) {
  const nodeCount = (level.nodes || []).length
  return `
    <div class="pm-rt-level" data-collapsible>
      <div class="pm-rt-toggle">
        <i class="bi bi-chevron-right pm-rt-arrow"></i>
        <div class="pm-rt-level-num">${level.level_number ?? '·'}</div>
        <div>
          <span class="pm-rt-level-name">${escHTML(level.name || 'Nivel')}</span>
          ${level.main_objective ? `<span class="pm-rt-level-obj">${escHTML(level.main_objective)}</span>` : ''}
        </div>
        <span class="pm-rt-count">${nodeCount} nodo${nodeCount === 1 ? '' : 's'}</span>
      </div>
      <div class="pm-rt-children">
        ${(level.nodes || []).map((n) => _renderNode(n)).join('')}
      </div>
    </div>
  `
}

function _renderNode(node) {
  const inds = node.indicators || []
  return `
    <div class="pm-rt-node" data-collapsible>
      <div class="pm-rt-toggle">
        <i class="bi bi-chevron-right pm-rt-arrow"></i>
        <span class="pm-rt-node-icon">${_nodeIcon(node.type)}</span>
        <span class="pm-rt-node-name">${escHTML(node.name || 'Nodo')}</span>
        ${node.is_critical ? '<span class="pm-rt-node-critical">CRÍTICO</span>' : ''}
        <span class="pm-rt-count">${inds.length} ind.</span>
      </div>
      <div class="pm-rt-children">
        <ul class="pm-rt-indicators">
          ${
            inds.length
              ? inds
                  .map(
                    (i) =>
                      `<li class="pm-rt-indicator ${i.is_required ? 'required' : ''}">${escHTML(
                        i.nombre || i.description || 'Indicador',
                      )}</li>`,
                  )
                  .join('')
              : '<li class="pm-rt-indicator">Sin indicadores</li>'
          }
        </ul>
      </div>
    </div>
  `
}
