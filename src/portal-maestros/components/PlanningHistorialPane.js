/**
 * PlanningHistorialPane.js
 * Renders the "Historial" tab in the Plan view.
 * Shows merged observaciones + indicadores, with a "Promover" action to
 * register sin_planificar items into the published route.
 */

import { getHistorial } from '../../modules/planning/services/historialService.js'
import {
  getRouteVersionHierarchy,
  createIndicatorObservation,
} from '../../modules/planning/services/planningService.js'
import { addNode, getOrCreateDraftVersion } from '../../modules/planning/services/curriculumAdminService.js'
import { escHTML } from '../utils/portalUtils.js'
import { AppModal } from '../../shared/components/AppModal.js'
import { AppToast } from '../../shared/components/AppToast.js'

const STYLE = `
<style>
  .pm-ht-filters {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    flex-wrap: wrap;
    margin-bottom: 1rem;
    padding: 0.75rem 0.9rem;
    background: var(--pm-surface-2, #f8f9fa);
    border: 1px solid var(--pm-border, #e2e8f0);
    border-radius: 10px;
  }
  .pm-ht-filters select,
  .pm-ht-filters label {
    font-size: 0.88rem;
    color: var(--pm-text, #1e293b);
  }
  .pm-ht-filters select {
    padding: 0.35rem 0.6rem;
    border: 1px solid var(--pm-border, #e2e8f0);
    border-radius: 7px;
    background: var(--pm-surface, #fff);
    cursor: pointer;
  }
  .pm-ht-filters label {
    display: flex;
    align-items: center;
    gap: 0.35rem;
    cursor: pointer;
  }

  .pm-ht-card {
    border: 1px solid var(--pm-border, #e2e8f0);
    border-radius: 12px;
    padding: 0.9rem 1rem;
    margin-bottom: 0.65rem;
    background: var(--pm-surface, #fff);
    transition: box-shadow 0.15s;
  }
  .pm-ht-card:hover {
    box-shadow: 0 2px 8px rgba(0,0,0,0.07);
  }
  .pm-ht-card.sin-planificar {
    background: rgba(251,191,36,0.06);
  }
  .pm-ht-card.registrado {
    background: rgba(74,222,128,0.06);
  }

  .pm-ht-card-header {
    font-size: 0.82rem;
    color: var(--pm-text-muted, #64748b);
    margin-bottom: 0.45rem;
  }
  .pm-ht-card-body {
    font-size: 0.92rem;
    color: var(--pm-text, #1e293b);
    margin-bottom: 0.6rem;
    line-height: 1.5;
  }
  .pm-ht-card-footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.5rem;
    flex-wrap: wrap;
  }

  .pm-ht-estado {
    display: inline-flex;
    align-items: center;
    gap: 0.3rem;
    font-size: 0.78rem;
    font-weight: 600;
    padding: 0.2rem 0.55rem;
    border-radius: 20px;
  }
  .pm-ht-estado.sin-planificar {
    background: rgba(251,191,36,0.18);
    color: #92400e;
  }
  .pm-ht-estado.registrado {
    background: rgba(74,222,128,0.2);
    color: #166534;
  }

  .pm-ht-btn-promover {
    padding: 0.4rem 0.9rem;
    min-height: 36px;
    font-size: 0.84rem;
    font-weight: 600;
    background: var(--pm-primary, #6366f1);
    color: #fff;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    transition: opacity 0.15s;
  }
  .pm-ht-btn-promover:hover {
    opacity: 0.88;
  }

  .pm-ht-empty {
    text-align: center;
    padding: 2.5rem 1rem;
    color: var(--pm-text-muted, #64748b);
    font-size: 0.92rem;
  }

  .pm-ht-modal-excerpt {
    background: var(--pm-surface-2, #f8f9fa);
    border-left: 3px solid var(--pm-border, #e2e8f0);
    border-radius: 0 6px 6px 0;
    padding: 0.5rem 0.75rem;
    font-size: 0.88rem;
    color: var(--pm-text, #1e293b);
    margin-bottom: 1rem;
    line-height: 1.5;
  }
  .pm-ht-modal-section {
    margin-bottom: 1rem;
  }
  .pm-ht-modal-label {
    display: block;
    font-size: 0.82rem;
    font-weight: 600;
    margin-bottom: 0.35rem;
    color: var(--pm-text-muted, #64748b);
    text-transform: uppercase;
    letter-spacing: 0.04em;
  }
  .pm-ht-modal-search {
    width: 100%;
    padding: 0.5rem 0.7rem;
    border: 1px solid var(--pm-border, #e2e8f0);
    border-radius: 8px;
    font-size: 0.9rem;
    margin-bottom: 0.5rem;
    box-sizing: border-box;
  }
  .pm-ht-node-list {
    max-height: 200px;
    overflow-y: auto;
    border: 1px solid var(--pm-border, #e2e8f0);
    border-radius: 8px;
    padding: 0.35rem 0;
  }
  .pm-ht-node-item {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.4rem 0.75rem;
    cursor: pointer;
    font-size: 0.88rem;
  }
  .pm-ht-node-item:hover {
    background: var(--pm-surface-2, #f8f9fa);
  }
  .pm-ht-node-item input[type=radio] {
    cursor: pointer;
  }
  .pm-ht-divider {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    margin: 0.9rem 0;
    color: var(--pm-text-muted, #64748b);
    font-size: 0.82rem;
  }
  .pm-ht-divider::before,
  .pm-ht-divider::after {
    content: '';
    flex: 1;
    border-top: 1px solid var(--pm-border, #e2e8f0);
  }
  .pm-ht-calificacion {
    display: flex;
    gap: 0.5rem;
    flex-wrap: wrap;
  }
  .pm-ht-cal-label {
    display: flex;
    align-items: center;
    gap: 0.3rem;
    padding: 0.3rem 0.65rem;
    border: 1px solid var(--pm-border, #e2e8f0);
    border-radius: 20px;
    cursor: pointer;
    font-size: 0.85rem;
  }
  .pm-ht-cal-label:hover {
    background: var(--pm-surface-2, #f8f9fa);
  }
  .pm-ht-modal-error {
    color: #dc2626;
    font-size: 0.83rem;
    margin-top: 0.5rem;
    display: none;
  }
  .pm-ht-new-node-input {
    width: 100%;
    padding: 0.5rem 0.7rem;
    border: 1px solid var(--pm-border, #e2e8f0);
    border-radius: 8px;
    font-size: 0.9rem;
    box-sizing: border-box;
  }

  @media (max-width: 640px) {
    .pm-ht-filters {
      gap: 0.5rem;
      padding: 0.6rem 0.75rem;
    }
    .pm-ht-card {
      padding: 0.75rem 0.8rem;
    }
    .pm-ht-card-footer {
      flex-direction: column;
      align-items: flex-start;
    }
    .pm-ht-btn-promover {
      width: 100%;
      text-align: center;
    }
  }
</style>
`

/**
 * @param {HTMLElement} container
 * @param {{
 *   maestroId: string,
 *   claseId: string|null,
 *   publishedRouteVersionId: string|null,
 *   onPromoted?: () => void
 * }} opts
 */
export async function renderPlanningHistorialPane(
  container,
  { maestroId, claseId, publishedRouteVersionId, onPromoted },
) {
  // State
  /** @type {import('../../modules/planning/services/historialService.js').HistorialItem[]} */
  let allItems = []
  let filterType = 'todos' // 'todos' | 'observacion' | 'indicador'
  let filterSinPlanificar = false

  container.innerHTML = STYLE + '<div class="pm-ht-empty"><p>Cargando historial…</p></div>'

  try {
    allItems = await getHistorial(maestroId, { claseId })
  } catch (err) {
    console.error('[PlanningHistorialPane] Error fetching historial:', err)
    container.innerHTML = STYLE + '<div class="pm-ht-empty"><p>No se pudo cargar el historial.</p></div>'
    return
  }

  _render()

  // -------------------------------------------------------------------------
  // Render
  // -------------------------------------------------------------------------

  function _render() {
    const filtered = _applyFilters(allItems)

    const cardsHtml =
      filtered.length === 0
        ? '<div class="pm-ht-empty"><p>No hay registros que coincidan con los filtros.</p></div>'
        : filtered.map((item) => _cardHtml(item)).join('')

    // Keep existing style tag, only replace content below it
    const existing = container.querySelector('style')
    container.innerHTML =
      STYLE +
      `
      <div class="pm-ht-filters">
        <select id="pm-ht-tipo">
          <option value="todos"${filterType === 'todos' ? ' selected' : ''}>Tipo: Todos</option>
          <option value="observacion"${filterType === 'observacion' ? ' selected' : ''}>Solo observaciones</option>
          <option value="indicador"${filterType === 'indicador' ? ' selected' : ''}>Solo indicadores</option>
        </select>
        <label>
          <input type="checkbox" id="pm-ht-sinplan"${filterSinPlanificar ? ' checked' : ''} />
          Solo sin planificar
        </label>
      </div>
      <div id="pm-ht-list">${cardsHtml}</div>
    `

    _wireFilters()
  }

  function _applyFilters(items) {
    return items.filter((item) => {
      if (filterType !== 'todos' && item.type !== filterType) return false
      if (filterSinPlanificar && item.estado !== 'sin_planificar') return false
      return true
    })
  }

  function _cardHtml(item) {
    const date = _formatDate(item.fecha)
    const estadoClass = item.estado === 'sin_planificar' ? 'sin-planificar' : 'registrado'

    if (item.type === 'observacion') {
      const raw = item.contenido_raw || item.contenido_ia_dsl || ''
      const excerpt = raw.slice(0, 120) + (raw.length > 120 ? '…' : '')
      return `
        <div class="pm-ht-card ${estadoClass}" data-id="${escHTML(item.id)}">
          <div class="pm-ht-card-header">📅 ${escHTML(date)} · ${escHTML(item.clase_nombre)}</div>
          <div class="pm-ht-card-body">${excerpt ? `"${escHTML(excerpt)}"` : '<em>Sin contenido</em>'}</div>
          <div class="pm-ht-card-footer">
            <span class="pm-ht-estado ${estadoClass}">
              ${item.estado === 'sin_planificar' ? '○ Sin planificar' : '✅ Registrado en ruta'}
            </span>
            ${
              item.estado === 'sin_planificar'
                ? `<button class="pm-ht-btn-promover" data-action="promover" data-id="${escHTML(item.id)}">+ Promover</button>`
                : ''
            }
          </div>
        </div>
      `
    }

    // indicador
    const calEmoji = { bien: '🟢', regular: '🟡', mal: '🔴' }[item.calificacion ?? ''] ?? ''
    const calLabel = { bien: 'Bien', regular: 'Regular', mal: 'Mal' }[item.calificacion ?? ''] ?? item.calificacion ?? ''
    const desc = item.descripcion ? item.descripcion.slice(0, 100) + (item.descripcion.length > 100 ? '…' : '') : ''

    return `
      <div class="pm-ht-card ${estadoClass}" data-id="${escHTML(item.id)}">
        <div class="pm-ht-card-header">
          📅 ${escHTML(date)} · ${escHTML(item.clase_nombre)}${item.clase_instrumento ? ` · 🎻 ${escHTML(item.clase_instrumento)}` : ''}
          ${item.node_name ? ` · <strong>${escHTML(item.node_name)}</strong>` : ''}
        </div>
        ${item.calificacion ? `<div class="pm-ht-card-body">Calificación: ${calEmoji} ${escHTML(calLabel)}</div>` : ''}
        ${desc ? `<div class="pm-ht-card-body" style="font-size:0.85rem;color:var(--pm-text-muted);">${escHTML(desc)}</div>` : ''}
        <div class="pm-ht-card-footer">
          <span class="pm-ht-estado ${estadoClass}">
            ${item.estado === 'sin_planificar' ? '○ Sin planificar' : '✅ Registrado en ruta'}
          </span>
        </div>
      </div>
    `
  }

  // -------------------------------------------------------------------------
  // Wire
  // -------------------------------------------------------------------------

  function _wireFilters() {
    container.querySelector('#pm-ht-tipo')?.addEventListener('change', (e) => {
      filterType = e.target.value
      _render()
    })
    container.querySelector('#pm-ht-sinplan')?.addEventListener('change', (e) => {
      filterSinPlanificar = e.target.checked
      _render()
    })
    container.querySelectorAll('[data-action="promover"]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const id = btn.dataset.id
        const item = allItems.find((i) => i.id === id)
        if (item) _openPromoverModal(item)
      })
    })
  }

  // -------------------------------------------------------------------------
  // Promover modal
  // -------------------------------------------------------------------------

  async function _openPromoverModal(item) {
    if (!publishedRouteVersionId) {
      AppToast.error('Seleccioná una clase con ruta publicada para promover este contenido.')
      return
    }

    // Load hierarchy once
    let blocks = []
    try {
      blocks = await getRouteVersionHierarchy(publishedRouteVersionId)
    } catch (err) {
      console.error('[PlanningHistorialPane] Error loading hierarchy:', err)
      AppToast.error('No se pudo cargar la ruta. Intentá de nuevo.')
      return
    }

    /** @type {{ id: string, name: string }[]} */
    const allNodes = blocks.flatMap((b) =>
      (b.levels ?? []).flatMap((l) => (l.nodes ?? []).map((n) => ({ id: n.id, name: n.name ?? '' }))),
    )

    const raw = item.contenido_raw || item.contenido_ia_dsl || ''
    const excerpt = raw.slice(0, 150) + (raw.length > 150 ? '…' : '')

    const bodyHtml = `
      <div class="pm-ht-modal-excerpt">${excerpt ? escHTML(excerpt) : '<em>Sin contenido de texto</em>'}</div>

      <div class="pm-ht-modal-section">
        <span class="pm-ht-modal-label">¿Corresponde a un nodo existente?</span>
        <input
          type="text"
          id="pm-ht-node-search"
          class="pm-ht-modal-search"
          placeholder="🔍 Buscar nodo…"
        />
        <div class="pm-ht-node-list" id="pm-ht-node-list">
          ${_nodesListHtml(allNodes)}
        </div>
      </div>

      <div class="pm-ht-modal-section">
        <span class="pm-ht-modal-label">Calificación</span>
        <div class="pm-ht-calificacion">
          <label class="pm-ht-cal-label"><input type="radio" name="pm-ht-cal" value="bien" /> 🟢 Bien</label>
          <label class="pm-ht-cal-label"><input type="radio" name="pm-ht-cal" value="regular" /> 🟡 Regular</label>
          <label class="pm-ht-cal-label"><input type="radio" name="pm-ht-cal" value="mal" /> 🔴 Mal</label>
        </div>
      </div>

      <div class="pm-ht-divider">ó</div>

      <div class="pm-ht-modal-section">
        <span class="pm-ht-modal-label">+ Crear nuevo nodo en mi borrador</span>
        <input
          type="text"
          id="pm-ht-new-node"
          class="pm-ht-new-node-input"
          placeholder="Nombre del nuevo nodo…"
        />
      </div>

      <div class="pm-ht-modal-error" id="pm-ht-modal-error">Seleccioná un nodo existente o escribí un nombre para crear uno nuevo.</div>
    `

    AppModal.open({
      title: 'Registrar en la ruta',
      size: 'md',
      body: bodyHtml,
      saveText: 'Guardar',
      onSave: async (bodyEl) => {
        // Resolve inputs from the modal body element
        const searchInput = bodyEl.querySelector('#pm-ht-node-search')
        const nodeListEl = bodyEl.querySelector('#pm-ht-node-list')
        const newNodeInput = bodyEl.querySelector('#pm-ht-new-node')
        const errorEl = bodyEl.querySelector('#pm-ht-modal-error')
        const calRadio = bodyEl.querySelector('input[name="pm-ht-cal"]:checked')

        const selectedNodeId = nodeListEl?.querySelector('input[type=radio]:checked')?.value ?? null
        const newNodeName = newNodeInput?.value?.trim() ?? ''
        const calificacion = calRadio?.value ?? null

        // Wire up search filter (if not already done — modal may have re-rendered)
        // (filtering is handled in onSave scope; for live filtering we use delegated event)

        if (!selectedNodeId && !newNodeName) {
          if (errorEl) errorEl.style.display = 'block'
          return false // keep modal open
        }
        if (errorEl) errorEl.style.display = 'none'

        try {
          let nodeId = selectedNodeId
          let routeVersionId = publishedRouteVersionId

          if (!selectedNodeId && newNodeName) {
            // Create a new node in the draft
            const draftVersionId = await getOrCreateDraftVersion(publishedRouteVersionId)
            routeVersionId = draftVersionId

            // Use first available level from the published hierarchy
            const firstLevel = blocks[0]?.levels?.[0]
            if (!firstLevel) {
              AppToast.error('La ruta no tiene niveles. Agregá un nivel desde la pestaña Gestionar.')
              return false
            }

            const newNode = await addNode({
              levelId: firstLevel.id,
              routeVersionId: draftVersionId,
              name: newNodeName,
            })
            nodeId = newNode?.id ?? newNode
          }

          await createIndicatorObservation({
            maestroId,
            routeVersionId,
            nodeId,
            claseId,
            fecha: item.fecha,
            descripcion: item.contenido_raw?.slice(0, 200) ?? null,
            calificacion,
            estudianteIds: [],
            notasIndividuales: {},
          })

          // Update item in-place
          const idx = allItems.findIndex((i) => i.id === item.id)
          if (idx !== -1) allItems[idx] = { ...allItems[idx], estado: 'registrado' }

          // Update card in DOM without full reload
          const card = container.querySelector(`.pm-ht-card[data-id="${CSS.escape(item.id)}"]`)
          if (card) {
            card.classList.remove('sin-planificar')
            card.classList.add('registrado')
            const estadoEl = card.querySelector('.pm-ht-estado')
            if (estadoEl) {
              estadoEl.className = 'pm-ht-estado registrado'
              estadoEl.textContent = '✅ Registrado en ruta'
            }
            const promoverBtn = card.querySelector('[data-action="promover"]')
            promoverBtn?.remove()
          }

          AppToast.success('Contenido registrado en la ruta.')
          onPromoted?.()
          // return undefined → modal closes
        } catch (err) {
          console.error('[PlanningHistorialPane] Error promoviendo:', err)
          AppToast.error('No se pudo registrar el contenido. Intentá de nuevo.')
          return false
        }
      },
    })

    // Wire live search filter inside the modal (after modal is in DOM)
    requestAnimationFrame(() => {
      const searchInput = document.getElementById('pm-ht-node-search')
      const nodeListEl = document.getElementById('pm-ht-node-list')
      if (searchInput && nodeListEl) {
        searchInput.addEventListener('input', () => {
          const q = searchInput.value.toLowerCase()
          const filtered = q ? allNodes.filter((n) => n.name.toLowerCase().includes(q)) : allNodes
          nodeListEl.innerHTML = _nodesListHtml(filtered)
        })
      }
    })
  }

  function _nodesListHtml(nodes) {
    if (nodes.length === 0) {
      return '<div style="padding:0.5rem 0.75rem; font-size:0.85rem; color:var(--pm-text-muted);">Sin resultados</div>'
    }
    return nodes
      .map(
        (n) => `
        <label class="pm-ht-node-item">
          <input type="radio" name="pm-ht-node" value="${escHTML(n.id)}" />
          ${escHTML(n.name)}
        </label>
      `,
      )
      .join('')
  }

  // -------------------------------------------------------------------------
  // Helpers
  // -------------------------------------------------------------------------

  function _formatDate(isoDate) {
    if (!isoDate) return ''
    try {
      return new Date(isoDate + 'T00:00:00').toLocaleDateString('es-AR', {
        day: 'numeric',
        month: 'short',
      })
    } catch {
      return isoDate
    }
  }
}
