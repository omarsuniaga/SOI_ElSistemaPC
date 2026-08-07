/**
 * gestionIndicadoresModal.js
 * Modal para eliminar y gestionar indicadores excesivos o no deseados en una clase.
 */

import { eliminarIndicadoresDeClase } from '../api/weeklyPlanAdapter.js'
import { AppToast } from '../../../shared/components/AppToast.js'

function escHTML(str) {
  return String(str ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

export function openGestionIndicadoresModal(claseId, indicadores = [], onUpdate = null) {
  const existing = document.getElementById('modal-gestion-indicadores')
  if (existing) existing.remove()

  const overlay = document.createElement('div')
  overlay.id = 'modal-gestion-indicadores'
  overlay.className = 'modal fade show'
  overlay.style.display = 'block'
  overlay.style.backgroundColor = 'rgba(0, 0, 0, 0.5)'

  let listaActual = [...indicadores]

  overlay.innerHTML = `
    <div class="modal-dialog modal-lg modal-dialog-scrollable">
      <div class="modal-content" style="border-radius:16px; border:1px solid var(--pm-border); background:var(--pm-surface, #fff); color:var(--pm-text);">
        <div class="modal-header border-0 pb-0" style="padding:1.25rem 1.5rem 0.5rem;">
          <div>
            <h5 class="modal-title fw-bold d-flex align-items-center gap-2">
              <span style="font-size:1.4rem;">🎯</span> Gestionar y Eliminar Indicadores
            </h5>
            <p class="text-muted mb-0" style="font-size:0.82rem;">
              Eliminá de la clase los indicadores sobrantes o no deseados. Se conservarán los datos de la guía original.
            </p>
          </div>
          <button type="button" class="btn-close" id="btn-close-modal-gind"></button>
        </div>

        <div class="modal-body" style="padding:1.25rem 1.5rem;">
          <!-- Barra de Búsqueda & Acciones Masivas -->
          <div class="p-3 mb-3 rounded-3" style="background:var(--pm-surface-2, rgba(0,0,0,0.03)); border:1px solid var(--pm-border);">
            <div class="row g-2 align-items-center">
              <div class="col-12 col-md-6">
                <div class="input-group input-group-sm">
                  <span class="input-group-text bg-transparent border-end-0"><i class="bi bi-search text-muted"></i></span>
                  <input type="text" id="gind-search" class="form-control border-start-0" placeholder="Buscar por tema u objetivo..." autocomplete="off" />
                </div>
              </div>
              <div class="col-12 col-md-6 text-md-end d-flex gap-2 justify-content-md-end flex-wrap">
                <button type="button" class="btn btn-outline-secondary btn-sm rounded-3 fw-semibold" id="gind-btn-clean-unrated" title="Quita todos los indicadores al 0%">
                  🧹 Limpiar 0% sin evaluar
                </button>
                <button type="button" class="btn btn-danger btn-sm rounded-3 fw-semibold d-none" id="gind-btn-delete-selected">
                  🗑️ Eliminar seleccionados (<span id="gind-selected-count">0</span>)
                </button>
              </div>
            </div>
            <div class="d-flex justify-content-between align-items-center mt-2 pt-2 border-top border-secondary-subtle" style="font-size:0.78rem;">
              <label class="d-flex align-items-center gap-2 mb-0" style="cursor:pointer; user-select:none;">
                <input type="checkbox" id="gind-check-select-all" class="form-check-input mt-0" />
                <span>Marcar todos los visibles</span>
              </label>
              <span class="text-muted" id="gind-counter-info">${listaActual.length} indicadores en la clase</span>
            </div>
          </div>

          <!-- Lista de Tarjetas de Indicadores -->
          <div id="gind-list" style="max-height:420px; overflow-y:auto;" class="d-flex flex-column gap-2">
            ${_renderListHTML(listaActual)}
          </div>
        </div>

        <div class="modal-footer border-0" style="padding:0.75rem 1.5rem 1.25rem;">
          <button type="button" class="btn btn-secondary btn-sm px-4 rounded-3 fw-semibold" id="btn-cancel-modal-gind">Cerrar</button>
        </div>
      </div>
    </div>
  `

  document.body.appendChild(overlay)

  const closeModal = () => {
    overlay.remove()
  }

  document.getElementById('btn-close-modal-gind')?.addEventListener('click', closeModal)
  document.getElementById('btn-cancel-modal-gind')?.addEventListener('click', closeModal)

  const searchInput = overlay.querySelector('#gind-search')
  const selectAllCheck = overlay.querySelector('#gind-check-select-all')
  const btnDeleteSelected = overlay.querySelector('#gind-btn-delete-selected')
  const countSelected = overlay.querySelector('#gind-selected-count')
  const counterInfo = overlay.querySelector('#gind-counter-info')
  const listContainer = overlay.querySelector('#gind-list')
  const btnCleanUnrated = overlay.querySelector('#gind-btn-clean-unrated')

  const updateSelectionState = () => {
    const visibleCards = [...listContainer.querySelectorAll('.gind-item:not(.d-none)')]
    const checkedCards = visibleCards.filter((card) => card.querySelector('.gind-check')?.checked)

    if (btnDeleteSelected) {
      if (checkedCards.length > 0) {
        btnDeleteSelected.classList.remove('d-none')
        countSelected.textContent = checkedCards.length
      } else {
        btnDeleteSelected.classList.add('d-none')
      }
    }

    if (selectAllCheck) {
      selectAllCheck.checked = visibleCards.length > 0 && checkedCards.length === visibleCards.length
      selectAllCheck.indeterminate = checkedCards.length > 0 && checkedCards.length < visibleCards.length
    }

    if (counterInfo) {
      counterInfo.textContent = `${visibleCards.length} visible${visibleCards.length !== 1 ? 's' : ''} de ${listaActual.length} indicadores`
    }
  }

  // Filtrado por texto
  searchInput?.addEventListener('input', (e) => {
    const term = e.target.value.toLowerCase().trim()
    listContainer.querySelectorAll('.gind-item').forEach((row) => {
      const match = !term || row.dataset.topic.includes(term) || row.dataset.objective.includes(term)
      row.classList.toggle('d-none', !match)
    })
    updateSelectionState()
  })

  // Checkbox Seleccionar todos los visibles
  selectAllCheck?.addEventListener('change', (e) => {
    const isChecked = e.target.checked
    listContainer.querySelectorAll('.gind-item:not(.d-none) .gind-check').forEach((cb) => {
      cb.checked = isChecked
    })
    updateSelectionState()
  })

  // Checkboxes individuales
  listContainer.addEventListener('change', (e) => {
    if (e.target.classList.contains('gind-check')) {
      updateSelectionState()
    }
  })

  // Eliminar individual por botón 🗑️
  listContainer.addEventListener('click', async (e) => {
    const btn = e.target.closest('.gind-btn-delete-single')
    if (!btn) return
    const id = btn.dataset.indicatorId
    if (!confirm('¿Quitar este indicador de la clase?')) return

    btn.disabled = true
    try {
      await eliminarIndicadoresDeClase(claseId, [id])
      listaActual = listaActual.filter((item) => String(item.id) !== String(id))
      listContainer.innerHTML = _renderListHTML(listaActual)
      updateSelectionState()
      AppToast.success('Indicador quitado de la clase')
      if (onUpdate) await onUpdate()
    } catch (err) {
      AppToast.error('Error al quitar el indicador: ' + err.message)
      btn.disabled = false
    }
  })

  // Eliminar Seleccionados
  btnDeleteSelected?.addEventListener('click', async () => {
    const checked = [...listContainer.querySelectorAll('.gind-item:not(.d-none) .gind-check:checked')]
    if (checked.length === 0) return

    const ids = checked.map((cb) => cb.dataset.indicatorId)
    if (!confirm(`¿Eliminar los ${ids.length} indicadores seleccionados de esta clase?`)) return

    btnDeleteSelected.disabled = true
    try {
      await eliminarIndicadoresDeClase(claseId, ids)
      const setIds = new Set(ids)
      listaActual = listaActual.filter((item) => !setIds.has(String(item.id)))
      listContainer.innerHTML = _renderListHTML(listaActual)
      updateSelectionState()
      AppToast.success(`${ids.length} indicadores eliminados de la clase`)
      if (onUpdate) await onUpdate()
    } catch (err) {
      AppToast.error('Error al eliminar seleccionados: ' + err.message)
    } finally {
      btnDeleteSelected.disabled = false
    }
  })

  // Limpiar 0% sin evaluar
  btnCleanUnrated?.addEventListener('click', async () => {
    const unrated = listaActual.filter((ind) => Number(ind.progressPercentage || 0) === 0)
    if (unrated.length === 0) {
      AppToast.info('No hay indicadores sin evaluar (0%) en esta clase.')
      return
    }

    if (!confirm(`¿Deseas eliminar los ${unrated.length} indicadores sin evaluar (0%) de esta clase?`)) return

    btnCleanUnrated.disabled = true
    try {
      const ids = unrated.map((ind) => ind.id)
      await eliminarIndicadoresDeClase(claseId, ids)
      const setIds = new Set(ids)
      listaActual = listaActual.filter((item) => !setIds.has(String(item.id)))
      listContainer.innerHTML = _renderListHTML(listaActual)
      updateSelectionState()
      AppToast.success(`${ids.length} indicadores sin evaluar eliminados`)
      if (onUpdate) await onUpdate()
    } catch (err) {
      AppToast.error('Error al limpiar indicadores: ' + err.message)
    } finally {
      btnCleanUnrated.disabled = false
    }
  })

  updateSelectionState()
}

function _renderListHTML(items) {
  if (items.length === 0) {
    return `<p class="text-muted text-center py-4 my-0" style="font-size:0.85rem;">Todos los indicadores sobrantes fueron eliminados de esta clase.</p>`
  }

  return items
    .map((ind) => {
      const topic = escHTML(ind.topic || 'Indicador')
      const objective = escHTML(ind.objective || '')
      const pct = Number(ind.progressPercentage || 0)

      return `
      <div class="gind-item p-2.5 rounded-3 border d-flex align-items-center justify-content-between gap-3"
           data-indicator-id="${ind.id}"
           data-topic="${topic.toLowerCase()}"
           data-objective="${objective.toLowerCase()}"
           style="background:var(--pm-surface); border-color:var(--pm-border) !important;">
        <div class="d-flex align-items-center gap-2.5 flex-grow-1 min-w-0">
          <input type="checkbox" class="gind-check form-check-input mt-0 flex-shrink-0" data-indicator-id="${ind.id}" style="cursor:pointer;" />
          <div class="min-w-0 flex-grow-1">
            <div class="d-flex align-items-center gap-2 mb-1 flex-wrap">
              <span class="badge bg-secondary-subtle text-secondary border px-2 py-0.5" style="font-size:0.68rem;">Sem. ${ind.weekNumber || 1}</span>
              <span class="badge ${pct > 0 ? 'bg-success-subtle text-success' : 'bg-light text-muted'} border px-2 py-0.5" style="font-size:0.68rem;">
                ${pct}% avance
              </span>
            </div>
            <h6 class="fw-bold mb-0 text-truncate" style="font-size:0.88rem; color:var(--pm-text);">${topic}</h6>
            ${objective ? `<p class="text-muted mb-0 text-truncate" style="font-size:0.76rem;">${objective}</p>` : ''}
          </div>
        </div>
        <button type="button" class="btn btn-outline-danger btn-sm rounded-3 gind-btn-delete-single flex-shrink-0" data-indicator-id="${ind.id}" title="Quitar de esta clase" style="padding:0.25rem 0.5rem; font-size:0.8rem;">
          🗑️
        </button>
      </div>
    `
    })
    .join('')
}
