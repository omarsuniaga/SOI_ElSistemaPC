import {
  obtenerPlanificacionesConDetalles,
  eliminarPlanificacion,
  actualizarPlanificacion,
} from '../api/planificacionAdapter.js'
import { openEditorPlanificacionModal } from '../components/EditorPlanificacionModal.js'
import { escapeHTML } from '../../clases/utils/clasesUtils.js'
import { AppToast } from '../../../shared/components/AppToast.js'

export async function renderMaestroPlanificacionView(container) {
  if (!container) return

  container.innerHTML = `
    <div class="d-flex justify-content-center align-items-center py-5">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Cargando mis planificaciones...</span>
      </div>
    </div>
  `

  try {
    const planes = await obtenerPlanificacionesConDetalles()
    _renderUI(container, planes)
  } catch (err) {
    console.error('[MaestroPlanificacionView] Error:', err)
    container.innerHTML = `
      <div class="alert alert-danger my-4">
        <i class="bi bi-exclamation-triangle me-2"></i>Error al cargar las planificaciones: ${escapeHTML(err.message)}
      </div>
    `
  }
}

function _renderUI(container, planes) {
  let filterState = 'todos'

  const _renderList = () => {
    const filtered = planes.filter((p) => {
      if (filterState === 'todos') return true
      if (filterState === 'borrador') return p.estado === 'borrador'
      if (filterState === 'revisada') return p.estado === 'revisada'
      if (filterState === 'publicada') return p.estado === 'publicada'
      return true
    })

    const listEl = container.querySelector('#maestro-planes-list')
    if (!listEl) return

    if (filtered.length === 0) {
      listEl.innerHTML = `
        <div class="col-12">
          <div class="card border-0 bg-body-secondary text-center py-5 rounded-4">
            <div class="card-body">
              <i class="bi bi-journal-x display-4 text-muted mb-3 d-block"></i>
              <h5 class="fw-semibold">No tenés planificaciones cargadas</h5>
              <p class="text-muted small max-w-md mx-auto mb-3">
                Creá tu primer plan didáctico para organizar los contenidos y objetivos de tus clases.
              </p>
              <button class="btn btn-primary btn-sm rounded-3" id="btn-crear-primer-plan">
                <i class="bi bi-plus-lg me-1"></i>Crear Plan Didáctico
              </button>
            </div>
          </div>
        </div>
      `
      listEl.querySelector('#btn-crear-primer-plan')?.addEventListener('click', () => {
        openEditorPlanificacionModal({ onSaved: () => renderMaestroPlanificacionView(container) })
      })
      return
    }

    listEl.innerHTML = filtered
      .map((p) => {
        const estadoBadge = _getEstadoBadge(p.estado)
        const contenidosList = Array.isArray(p.contenidos)
          ? p.contenidos
          : typeof p.contenidos === 'string'
            ? [p.contenidos]
            : []
        const claseNombre = p.clase_nombre || p.clases?.nombre || p.claseId || 'Sin clase asignada'

        return `
        <div class="col-md-6 col-lg-4 mb-3">
          <div class="card h-100 border-0 shadow-sm rounded-3 hover-shadow transition-all">
            <div class="card-body d-flex flex-direction-column justify-content-between p-3">
              <div>
                <div class="d-flex align-items-center justify-content-between mb-2">
                  <span class="badge bg-primary-subtle text-primary border border-primary-subtle" style="font-size:0.75rem;">
                    <i class="bi bi-easel me-1"></i>${escapeHTML(claseNombre)}
                  </span>
                  ${estadoBadge}
                </div>
                <h6 class="card-title fw-bold text-body mb-2">${escapeHTML(p.titulo || 'Plan sin título')}</h6>
                <div class="text-muted mb-3" style="font-size:0.78rem;">
                  <i class="bi bi-calendar3 me-1"></i>Semana ${p.semana || 1} · ${p.fecha ? p.fecha.slice(0, 10) : '—'}
                </div>

                ${
                  contenidosList.length > 0
                    ? `
                  <div class="bg-body-tertiary p-2 rounded-2 mb-3" style="font-size:0.8rem;">
                    <div class="fw-semibold text-muted mb-1" style="font-size:0.72rem; text-transform:uppercase;">Contenidos / Objetivos:</div>
                    <ul class="mb-0 ps-3">
                      ${contenidosList.slice(0, 3).map((c) => `<li>${escapeHTML(c)}</li>`).join('')}
                      ${contenidosList.length > 3 ? `<li class="text-muted opacity-75">+${contenidosList.length - 3} más...</li>` : ''}
                    </ul>
                  </div>
                `
                    : ''
                }
              </div>

              <div class="pt-2 border-top d-flex align-items-center justify-content-between mt-2">
                <div class="btn-group btn-group-sm">
                  <button class="btn btn-outline-secondary btn-edit-plan" data-id="${p.id}" title="Editar">
                    <i class="bi bi-pencil me-1"></i>Editar
                  </button>
                  <button class="btn btn-outline-danger btn-delete-plan" data-id="${p.id}" title="Eliminar">
                    <i class="bi bi-trash"></i>
                  </button>
                </div>
                ${
                  p.estado === 'borrador'
                    ? `
                  <button class="btn btn-sm btn-outline-primary btn-enviar-revision" data-id="${p.id}">
                    <i class="bi bi-send me-1"></i>Enviar ACM
                  </button>
                `
                    : ''
                }
              </div>
            </div>
          </div>
        </div>
      `
      })
      .join('')

    // Event listeners
    listEl.querySelectorAll('.btn-edit-plan').forEach((btn) => {
      btn.addEventListener('click', () => {
        const targetPlan = planes.find((p) => String(p.id) === String(btn.dataset.id))
        if (targetPlan) {
          openEditorPlanificacionModal({
            plan: targetPlan,
            onSaved: () => renderMaestroPlanificacionView(container),
          })
        }
      })
    })

    listEl.querySelectorAll('.btn-delete-plan').forEach((btn) => {
      btn.addEventListener('click', async () => {
        if (confirm('¿Estás seguro de eliminar esta planificación?')) {
          try {
            await eliminarPlanificacion(btn.dataset.id)
            AppToast.show('Planificación eliminada', 'success')
            renderMaestroPlanificacionView(container)
          } catch (err) {
            AppToast.show(`Error al eliminar: ${err.message}`, 'error')
          }
        }
      })
    })

    listEl.querySelectorAll('.btn-enviar-revision').forEach((btn) => {
      btn.addEventListener('click', async () => {
        try {
          await actualizarPlanificacion(btn.dataset.id, { estado: 'revisada' })
          AppToast.show('Planificación enviada a revisión pedagógica (ACM)', 'success')
          renderMaestroPlanificacionView(container)
        } catch (err) {
          AppToast.show(`Error al enviar: ${err.message}`, 'error')
        }
      })
    })
  }

  container.innerHTML = `
    <div class="container-fluid px-3 py-3">
      <div class="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-4">
        <div>
          <h4 class="fw-bold mb-1"><i class="bi bi-journal-text text-primary me-2"></i>Mis Planificaciones Didácticas</h4>
          <p class="text-muted small mb-0">Gestioná las secuencias didácticas y contenidos semanales de tus clases.</p>
        </div>
        <button class="btn btn-primary d-inline-flex align-items-center gap-1 shadow-sm px-3" id="btn-nuevo-plan">
          <i class="bi bi-plus-lg"></i>Nueva Planificación
        </button>
      </div>

      <div class="card border-0 bg-body-tertiary mb-4 p-2 rounded-3">
        <div class="d-flex flex-wrap align-items-center justify-content-between gap-2">
          <div class="btn-group btn-group-sm id="filter-tabs">
            <button class="btn btn-outline-secondary active" data-filter="todos">Todos</button>
            <button class="btn btn-outline-secondary" data-filter="borrador">Borradores</button>
            <button class="btn btn-outline-secondary" data-filter="revisada">Enviados (ACM)</button>
            <button class="btn btn-outline-secondary" data-filter="publicada">Aprobados</button>
          </div>
          <span class="text-muted small"><strong id="planes-count">${planes.length}</strong> planificaciones registradas</span>
        </div>
      </div>

      <div class="row g-3" id="maestro-planes-list"></div>
    </div>
  `

  container.querySelector('#btn-nuevo-plan')?.addEventListener('click', () => {
    openEditorPlanificacionModal({ onSaved: () => renderMaestroPlanificacionView(container) })
  })

  container.querySelectorAll('#filter-tabs button').forEach((btn) => {
    btn.addEventListener('click', () => {
      container.querySelectorAll('#filter-tabs button').forEach((b) => b.classList.remove('active'))
      btn.classList.add('active')
      filterState = btn.dataset.filter
      _renderList()
    })
  })

  _renderList()
}

function _getEstadoBadge(estado) {
  if (estado === 'publicada') {
    return `<span class="badge bg-success-subtle text-success border border-success-subtle"><i class="bi bi-check-circle me-1"></i>Aprobado</span>`
  }
  if (estado === 'revisada') {
    return `<span class="badge bg-warning-subtle text-warning-emphasis border border-warning-subtle"><i class="bi bi-clock me-1"></i>En Revisión</span>`
  }
  return `<span class="badge bg-secondary-subtle text-secondary border border-secondary-subtle"><i class="bi bi-pencil-square me-1"></i>Borrador</span>`
}
