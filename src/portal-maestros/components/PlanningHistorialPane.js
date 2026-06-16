/**
 * PlanningHistorialPane.js
 * Renders the "Historial" tab in the Plan view.
 * Shows observaciones with a "Promover" action to register items into bitácora (árbol A).
 */

import { getHistorial } from '../../modules/planning/services/historialService.js'
import { escHTML } from '../utils/portalUtils.js'
import { AppToast } from '../../shared/components/AppToast.js'
import { getContenidosDeClase, getAlumnosByClase } from '../../modules/bitacora/index.js'
import { renderRegistrarContenidoModal } from '../../modules/bitacora/components/RegistrarContenidoModal.js'

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
  .pm-ht-filters label {
    font-size: 0.88rem;
    color: var(--pm-text, #1e293b);
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

    container.innerHTML =
      STYLE +
      `
      <div class="pm-ht-filters">
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
      if (filterSinPlanificar && item.estado !== 'sin_planificar') return false
      return true
    })
  }

  function _cardHtml(item) {
    const date = _formatDate(item.fecha)
    const estadoClass = item.estado === 'sin_planificar' ? 'sin-planificar' : 'registrado'
    const raw = item.contenido_raw || item.contenido_ia_dsl || ''
    const excerpt = raw.slice(0, 120) + (raw.length > 120 ? '…' : '')

    return `
      <div class="pm-ht-card ${estadoClass}" data-id="${escHTML(item.id)}">
        <div class="pm-ht-card-header">📅 ${escHTML(date)} · ${escHTML(item.clase_nombre)}</div>
        <div class="pm-ht-card-body">${excerpt ? `"${escHTML(excerpt)}"` : '<em>Sin contenido</em>'}</div>
        <div class="pm-ht-card-footer">
          <span class="pm-ht-estado ${estadoClass}">
            ${item.estado === 'sin_planificar' ? '○ Sin planificar' : '✅ Registrado en bitácora'}
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

  // -------------------------------------------------------------------------
  // Wire
  // -------------------------------------------------------------------------

  function _wireFilters() {
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
  // Promover modal — árbol A (bitácora)
  // -------------------------------------------------------------------------

  let _promoverInFlight = false

  async function _openPromoverModal(item) {
    if (_promoverInFlight) return
    _promoverInFlight = true

    if (!claseId) {
      AppToast.error('Seleccioná una clase para promover este contenido.')
      _promoverInFlight = false
      return
    }

    let contenidos = []
    let alumnos = []
    try {
      ;[contenidos, alumnos] = await Promise.all([
        getContenidosDeClase(claseId),
        getAlumnosByClase(claseId),
      ])
    } catch (err) {
      console.error('[PlanningHistorialPane] Error loading bitácora data:', err)
      AppToast.error('No se pudo cargar los datos de la bitácora. Intentá de nuevo.')
      _promoverInFlight = false
      return
    }

    if (contenidos.length === 0) {
      AppToast.error('Esta clase no tiene objetivos/contenidos registrados en la bitácora.')
      return
    }

    // Build an overlay modal
    const overlay = document.createElement('div')
    overlay.style.cssText = `
      position: fixed; top: 0; left: 0; right: 0; bottom: 0;
      background: rgba(0,0,0,0.5);
      display: flex; align-items: center; justify-content: center;
      z-index: 10000;
    `

    const panel = document.createElement('div')
    panel.style.cssText = `
      background: var(--pm-surface, #fff);
      border-radius: 16px;
      box-shadow: 0 20px 60px rgba(0,0,0,0.3);
      max-width: 560px;
      width: 90%;
      max-height: 90vh;
      overflow-y: auto;
      padding: 1.5rem;
    `

    const raw = item.contenido_raw || item.contenido_ia_dsl || ''
    const excerpt = raw.slice(0, 150) + (raw.length > 150 ? '…' : '')

    panel.innerHTML = `
      <h3 style="margin: 0 0 0.75rem 0; font-size: 1.1rem;">Registrar en bitácora</h3>
      <div style="background: var(--pm-surface-2,#f8f9fa); border-left: 3px solid var(--pm-border,#e2e8f0);
                  padding: 0.5rem 0.75rem; border-radius: 0 6px 6px 0; font-size: 0.88rem;
                  margin-bottom: 1rem;">
        ${excerpt ? escHTML(excerpt) : '<em>Sin contenido</em>'}
      </div>
      <label style="display:block; font-size:0.82rem; font-weight:600; margin-bottom:0.4rem; text-transform:uppercase; letter-spacing:0.04em; color:var(--pm-text-muted,#64748b);">
        Objetivo / Contenido
      </label>
      <select id="pm-ht-promover-objetivo" style="width:100%; padding:0.5rem 0.7rem; border:1px solid var(--pm-border,#e2e8f0); border-radius:8px; font-size:0.9rem; margin-bottom:1rem; box-sizing:border-box;">
        <option value="">Seleccioná un objetivo…</option>
        ${contenidos.map((c) => `<option value="${escHTML(c.id)}">${escHTML(c.descripcion ?? c.nombre ?? c.id)}</option>`).join('')}
      </select>
      <div id="pm-ht-promover-modal-container"></div>
      <div style="display:flex; justify-content:flex-end; margin-top:0.75rem;">
        <button id="pm-ht-promover-cancel" style="padding:0.5rem 1.2rem; border:1px solid var(--pm-border,#e2e8f0); border-radius:8px; background:var(--pm-surface-2,#f8f9fa); cursor:pointer; font-weight:600;">
          Cancelar
        </button>
      </div>
    `

    overlay.appendChild(panel)
    document.body.appendChild(overlay)
    _promoverInFlight = false

    const modalContainer = panel.querySelector('#pm-ht-promover-modal-container')
    const objetivoSelect = panel.querySelector('#pm-ht-promover-objetivo')

    function _renderInnerModal(objetivoId) {
      const objetivo = contenidos.find((c) => c.id === objetivoId)
      if (!objetivo) {
        modalContainer.innerHTML = ''
        return
      }
      renderRegistrarContenidoModal(modalContainer, {
        claseId,
        objetivoId,
        objetivoDescripcion: objetivo.descripcion ?? objetivo.nombre ?? objetivoId,
        alumnos,
        prefillFecha: item.fecha || null,
        prefillObservacion: raw.slice(0, 400) || null,
        onSaved: () => {
          // Mark item as registered
          const idx = allItems.findIndex((i) => i.id === item.id)
          if (idx !== -1) allItems[idx] = { ...allItems[idx], estado: 'registrado' }

          const card = container.querySelector(`.pm-ht-card[data-id="${CSS.escape(item.id)}"]`)
          if (card) {
            card.classList.remove('sin-planificar')
            card.classList.add('registrado')
            const estadoEl = card.querySelector('.pm-ht-estado')
            if (estadoEl) {
              estadoEl.className = 'pm-ht-estado registrado'
              estadoEl.textContent = '✅ Registrado en bitácora'
            }
            card.querySelector('[data-action="promover"]')?.remove()
          }

          overlay.remove()
          AppToast.success('Contenido registrado en la bitácora.')
          onPromoted?.()
        },
        onCancel: () => {
          overlay.remove()
        },
      })
    }

    objetivoSelect.addEventListener('change', () => {
      _renderInnerModal(objetivoSelect.value)
    })

    panel.querySelector('#pm-ht-promover-cancel').addEventListener('click', () => {
      overlay.remove()
    })
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) overlay.remove()
    })
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
