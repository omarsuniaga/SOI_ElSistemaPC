import {
  obtenerPlanificacionesConDetalles,
  eliminarPlanificacion,
  actualizarPlanificacion,
} from '../api/planificacionAdapter.js'
import { openEditorPlanificacionModal } from '../components/EditorPlanificacionModal.js'
import { escapeHTML } from '../../clases/utils/clasesUtils.js'
import { AppToast } from '../../../shared/components/AppToast.js'
import { router } from '../../../core/router/router.js'
import { usePortalAuth } from '../../../portal-maestros/auth/usePortalAuth.js'
import {
  getExportableClassesFromPlans,
  isPlanificacionApproved,
} from '../utils/planificacionExportUtils.js'

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
    const maestro = usePortalAuth.getMaestro?.() || null
    if (!maestro?.id) {
      throw new Error('No se pudo identificar al maestro autenticado.')
    }

    const planes = await obtenerPlanificacionesConDetalles(maestro.id)
    _renderUI(container, planes, maestro)
  } catch (err) {
    console.error('[MaestroPlanificacionView] Error:', err)
    container.innerHTML = `
      <div class="alert alert-danger my-4">
        <i class="bi bi-exclamation-triangle me-2"></i>Error al cargar las planificaciones: ${escapeHTML(err.message)}
      </div>
    `
  }
}

function _renderUI(container, planes, maestro) {
  let filterState = 'todos'
  const approvedPlans = planes.filter((plan) => isPlanificacionApproved(plan))
  const exportableClasses = getExportableClassesFromPlans(approvedPlans)
  let exportClaseId = exportableClasses[0]?.claseId || ''

  const _renderList = () => {
    const filtered = planes.filter((p) => {
      const estado = String(p.estado || '')
        .trim()
        .toLowerCase()

      if (filterState === 'todos') return true
      if (filterState === 'borrador') return ['borrador', 'planificado'].includes(estado)
      if (filterState === 'revisada') return estado === 'revisada'
      if (filterState === 'publicada') return isPlanificacionApproved(p)
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
        const classHasApprovedPlans = approvedPlans.some(
          (plan) => String(plan.clase_id || plan.claseId) === String(p.clase_id || p.claseId),
        )

        return `
        <div class="col-md-6 col-lg-4 mb-3">
          <div class="card h-100 border-0 shadow-sm rounded-3 hover-shadow transition-all">
            <div class="card-body d-flex flex-direction-column justify-content-between p-3">
              <div>
                <div class="d-flex align-items-center justify-content-between mb-2 gap-2">
                  <span class="badge bg-primary-subtle text-primary border border-primary-subtle" style="font-size:0.75rem;">
                    <i class="bi bi-easel me-1"></i>${escapeHTML(claseNombre)}
                  </span>
                  ${estadoBadge}
                </div>
                <h6 class="card-title fw-bold text-body mb-2">${escapeHTML(p.titulo || p.tema || 'Plan sin título')}</h6>
                <div class="text-muted mb-3" style="font-size:0.78rem;">
                  <i class="bi bi-calendar3 me-1"></i>${escapeHTML(p.fecha_inicio || p.fecha || 'Sin fecha')}
                </div>

                ${
                  contenidosList.length > 0
                    ? `
                  <div class="bg-body-tertiary p-2 rounded-2 mb-3" style="font-size:0.8rem;">
                    <div class="fw-semibold text-muted mb-1" style="font-size:0.72rem; text-transform:uppercase;">Contenidos / Objetivos:</div>
                    <ul class="mb-0 ps-3">
                      ${contenidosList.slice(0, 3).map((c) => `<li>${escapeHTML(typeof c === 'string' ? c : c?.titulo || c?.nombre || JSON.stringify(c))}</li>`).join('')}
                      ${contenidosList.length > 3 ? `<li class="text-muted opacity-75">+${contenidosList.length - 3} más...</li>` : ''}
                    </ul>
                  </div>
                `
                    : ''
                }
              </div>

              <div class="pt-2 border-top d-flex align-items-center justify-content-between mt-2 gap-2 flex-wrap">
                <div class="btn-group btn-group-sm">
                  <button class="btn btn-outline-secondary btn-edit-plan" data-id="${p.id}" title="Editar">
                    <i class="bi bi-pencil me-1"></i>Editar
                  </button>
                  <button class="btn btn-outline-danger btn-delete-plan" data-id="${p.id}" title="Eliminar">
                    <i class="bi bi-trash"></i>
                  </button>
                  <button class="btn btn-outline-primary btn-view-export" data-clase-id="${escapeHTML(p.clase_id || p.claseId || '')}" title="Documento" ${classHasApprovedPlans ? '' : 'disabled'}>
                    <i class="bi bi-file-earmark-text"></i>
                  </button>
                </div>
                ${
                  ['borrador', 'planificado'].includes(String(p.estado || '').trim().toLowerCase())
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

    listEl.querySelectorAll('.btn-view-export').forEach((btn) => {
      btn.addEventListener('click', () => {
        if (!btn.dataset.claseId) return
        _goToPrintView({
          scope: 'class',
          claseId: btn.dataset.claseId,
          output: 'html',
        })
      })
    })
  }

  container.innerHTML = `
    <div class="container-fluid px-3 py-3">
      <div class="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-4">
        <div>
          <h4 class="fw-bold mb-1"><i class="bi bi-journal-text text-primary me-2"></i>Mis Planificaciones Didácticas</h4>
          <p class="text-muted small mb-0">Gestioná las secuencias didácticas y generá el documento institucional para entrega física.</p>
        </div>
        <button class="btn btn-primary d-inline-flex align-items-center gap-1 shadow-sm px-3" id="btn-nuevo-plan">
          <i class="bi bi-plus-lg"></i>Nueva Planificación
        </button>
      </div>

      <div class="card border-0 shadow-sm rounded-4 mb-4">
        <div class="card-body">
          <div class="d-flex flex-column flex-xl-row align-items-xl-center justify-content-between gap-3 mb-3">
            <div>
              <h5 class="fw-bold mb-1"><i class="bi bi-printer me-2 text-primary"></i>Entrega al área académica</h5>
              <p class="text-muted small mb-0">
                Solo se incluyen planificaciones aprobadas del maestro ${escapeHTML(maestro?.nombre_completo || maestro?.nombre || 'actual')}.
              </p>
            </div>
            <span class="badge bg-success-subtle text-success border border-success-subtle px-3 py-2">
              ${approvedPlans.length} planificaciones aprobadas
            </span>
          </div>

          <div class="row g-3 align-items-end">
            <div class="col-lg-4">
              <label for="plan-export-class-select" class="form-label small fw-semibold text-muted text-uppercase">Clase para documento individual</label>
              <select class="form-select" id="plan-export-class-select" ${exportableClasses.length > 0 ? '' : 'disabled'}>
                ${
                  exportableClasses.length > 0
                    ? exportableClasses
                        .map(
                          (item) => `
                          <option value="${item.claseId}">
                            ${escapeHTML(item.claseNombre)} · ${item.totalPlanificaciones} planes
                          </option>
                        `,
                        )
                        .join('')
                    : '<option value="">No hay clases con planes aprobados</option>'
                }
              </select>
            </div>

            <div class="col-lg-8">
              <div class="d-flex flex-wrap gap-2">
                <button class="btn btn-outline-primary" id="btn-export-class-html" ${exportableClasses.length > 0 ? '' : 'disabled'}>
                  <i class="bi bi-file-earmark-code me-1"></i>Ver HTML por clase
                </button>
                <button class="btn btn-primary" id="btn-export-class-pdf" ${exportableClasses.length > 0 ? '' : 'disabled'}>
                  <i class="bi bi-file-earmark-pdf me-1"></i>Descargar PDF por clase
                </button>
                <button class="btn btn-outline-secondary" id="btn-export-all-html" ${approvedPlans.length > 0 ? '' : 'disabled'}>
                  <i class="bi bi-collection me-1"></i>Ver consolidado
                </button>
                <button class="btn btn-secondary" id="btn-export-all-pdf" ${approvedPlans.length > 0 ? '' : 'disabled'}>
                  <i class="bi bi-collection-fill me-1"></i>Descargar PDF consolidado
                </button>
              </div>
            </div>
          </div>

          ${
            approvedPlans.length === 0
              ? `
              <div class="alert alert-warning mt-3 mb-0">
                <i class="bi bi-exclamation-circle me-2"></i>
                Todavía no tenés planificaciones aprobadas para generar el documento oficial.
              </div>
            `
              : ''
          }
        </div>
      </div>

      <div class="card border-0 bg-body-tertiary mb-4 p-2 rounded-3">
        <div class="d-flex flex-wrap align-items-center justify-content-between gap-2">
          <div class="btn-group btn-group-sm" id="filter-tabs">
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

  container.querySelector('#plan-export-class-select')?.addEventListener('change', (event) => {
    exportClaseId = event.target.value
  })

  container.querySelector('#btn-export-class-html')?.addEventListener('click', () => {
    if (!exportClaseId) return
    _goToPrintView({ scope: 'class', claseId: exportClaseId, output: 'html' })
  })

  container.querySelector('#btn-export-class-pdf')?.addEventListener('click', () => {
    if (!exportClaseId) return
    _goToPrintView({ scope: 'class', claseId: exportClaseId, output: 'pdf' })
  })

  container.querySelector('#btn-export-all-html')?.addEventListener('click', () => {
    _goToPrintView({ scope: 'all', output: 'html' })
  })

  container.querySelector('#btn-export-all-pdf')?.addEventListener('click', () => {
    _goToPrintView({ scope: 'all', output: 'pdf' })
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
  const rawState = String(estado || '')
    .trim()
    .toLowerCase()

  if (rawState === 'activa' || rawState === 'publicada' || rawState === 'revisado') {
    return `<span class="badge bg-success-subtle text-success border border-success-subtle"><i class="bi bi-check-circle me-1"></i>Aprobado</span>`
  }
  if (rawState === 'revisada') {
    return `<span class="badge bg-warning-subtle text-warning-emphasis border border-warning-subtle"><i class="bi bi-clock me-1"></i>En Revisi?n</span>`
  }
  if (rawState === 'cerrada' || rawState === 'ejecutado') {
    return `<span class="badge bg-info-subtle text-info border border-info-subtle"><i class="bi bi-check2-square me-1"></i>Cerrada</span>`
  }
  if (rawState === 'archivada' || rawState === 'archivado') {
    return `<span class="badge bg-dark-subtle text-dark border border-dark-subtle"><i class="bi bi-archive me-1"></i>Archivada</span>`
  }
  return `<span class="badge bg-secondary-subtle text-secondary border border-secondary-subtle"><i class="bi bi-pencil-square me-1"></i>Borrador</span>`
}

function _goToPrintView({ scope = 'all', claseId = null, output = 'html' } = {}) {
  const params = {
    scope,
    output,
    parentRoute: 'planificacion',
  }

  if (scope === 'class' && claseId) {
    params.claseId = claseId
  }

  router.navigate('planificacion-print', params)
}
