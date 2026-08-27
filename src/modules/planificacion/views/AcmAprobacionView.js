import {
  obtenerPlanificacionesConDetalles,
  actualizarPlanificacion,
  marcarRevisadasMasivo,
} from '../api/planificacionAdapter.js'
import { escapeHTML } from '../../clases/utils/clasesUtils.js'
import { AppToast } from '../../../shared/components/AppToast.js'
import { CalculadorVelocidadCurricular } from '../domain/CalculadorVelocidadCurricular.js'
import { openJustificacionDesfaseModal } from '../components/JustificacionDesfaseModal.js'
import { renderViewInfoButton, attachViewInfoEvents } from '../../../shared/components/ViewInfoModal.js'
import { router } from '../../../core/router/router.js'

export async function renderAcmAprobacionView(container) {
  if (!container) return

  container.innerHTML = `
    <div class="d-flex justify-content-center align-items-center py-5">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Cargando revisiones pedagógicas...</span>
      </div>
    </div>
  `

  try {
    const planes = await obtenerPlanificacionesConDetalles()
    _renderUI(container, planes)
  } catch (err) {
    console.error('[AcmAprobacionView] Error:', err)
    container.innerHTML = `
      <div class="alert alert-danger my-4">
        <i class="bi bi-exclamation-triangle me-2"></i>Error al cargar revisiones: ${escapeHTML(err.message)}
      </div>
    `
  }
}

function _renderUI(container, planes) {
  let filterState = 'revisada'
  const selectedIds = new Set()

  const _renderList = () => {
    const filtered = planes.filter((p) => {
      if (filterState === 'todos') return true
      if (filterState === 'revisada') return p.estado === 'revisada'
      if (filterState === 'publicada') return p.estado === 'publicada'
      if (filterState === 'borrador') return p.estado === 'borrador'
      return true
    })

    const tbody = container.querySelector('#acm-planes-tbody')
    const badgeCount = container.querySelector('#acm-pendientes-count')
    if (badgeCount) badgeCount.textContent = planes.filter((p) => p.estado === 'revisada').length

    if (!tbody) return

    if (filtered.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="6" class="text-center py-5 text-muted">
            <i class="bi bi-check-all display-5 text-success d-block mb-2"></i>
            <strong>No hay planificaciones pendientes en este filtro.</strong>
          </td>
        </tr>
      `
      return
    }

    tbody.innerHTML = filtered
      .map((p) => {
        const isChecked = selectedIds.has(String(p.id))
        const maestroNombre = p.maestro_nombre || p.maestros?.nombre_completo || 'Maestro'
        const claseNombre = p.clase_nombre || p.clases?.nombre || `Clase ${p.clase_id}`

        // Diagnóstico de velocidad curricular
        const diagVelocidad = CalculadorVelocidadCurricular.calcular({
          semanasTotales: p.semanasTotales || 24,
          semanaActual: p.semana || 12,
          totalIndicadores: p.totalIndicadores || 10,
          indicadoresCompletados: p.indicadoresCompletados || 3,
        })

        return `
        <tr>
          <td class="text-center">
            <input type="checkbox" class="form-check-input chk-plan" data-id="${p.id}" ${isChecked ? 'checked' : ''}>
          </td>
          <td>
            <div class="fw-bold text-body">${escapeHTML(p.titulo || 'Plan sin título')}</div>
            <small class="text-muted">Semana ${p.semana || 1} · ${p.fecha ? p.fecha.slice(0, 10) : ''}</small>
            ${
              diagVelocidad.alertaDesfase
                ? `
              <div class="mt-1">
                <span class="badge bg-warning-subtle text-warning-emphasis border border-warning-subtle" style="font-size:0.7rem;">
                  <i class="bi bi-clock-history me-1"></i>Desfase: ${diagVelocidad.desfasePct}% (${diagVelocidad.avanceRealPct}% real vs ${diagVelocidad.avanceEsperadoPct}% esp.)
                </span>
              </div>
            `
                : ''
            }
          </td>
          <td>
            <span class="badge bg-primary-subtle text-primary border border-primary-subtle">${escapeHTML(claseNombre)}</span>
          </td>
          <td>${escapeHTML(maestroNombre)}</td>
          <td>
            ${_getEstadoBadge(p.estado)}
          </td>
          <td class="text-end">
            <div class="btn-group btn-group-sm">
              ${
                p.estado !== 'publicada'
                  ? `
                <button class="btn btn-sm btn-success btn-aprobar-plan" data-id="${p.id}" title="Aprobar">
                  <i class="bi bi-check-lg me-1"></i>Aprobar
                </button>
              `
                  : ''
              }
              <button class="btn btn-sm btn-outline-primary btn-promocionar-plantilla" data-id="${p.id}" title="Promocionar a Plantilla Oficial Institucional">
                <i class="bi bi-star me-1"></i>Hacer Plantilla
              </button>
              ${
                diagVelocidad.alertaDesfase
                  ? `
                <button class="btn btn-sm btn-outline-warning btn-justificar-desfase" data-id="${p.id}" title="Justificar atraso de tiempo">
                  <i class="bi bi-exclamation-triangle me-1"></i>Justificar Atraso
                </button>
              `
                  : ''
              }
              ${
                p.estado === 'revisada'
                  ? `
                <button class="btn btn-sm btn-outline-secondary btn-devolver-plan" data-id="${p.id}" title="Devolver a borrador">
                  <i class="bi bi-arrow-return-left me-1"></i>Devolver
                </button>
              `
                  : ''
              }
            </div>
          </td>
        </tr>
      `
      })
      .join('')

    // Handlers
    tbody.querySelectorAll('.chk-plan').forEach((chk) => {
      chk.addEventListener('change', () => {
        if (chk.checked) selectedIds.add(chk.dataset.id)
        else selectedIds.delete(chk.dataset.id)
        _updateBatchButton()
      })
    })

    tbody.querySelectorAll('.btn-aprobar-plan').forEach((btn) => {
      btn.addEventListener('click', async () => {
        try {
          await actualizarPlanificacion(btn.dataset.id, { estado: 'publicada' })
          AppToast.show('Planificación aprobada y publicada', 'success')
          renderAcmAprobacionView(container)
        } catch (err) {
          AppToast.show(`Error al aprobar: ${err.message}`, 'error')
        }
      })
    })

    tbody.querySelectorAll('.btn-promocionar-plantilla').forEach((btn) => {
      btn.addEventListener('click', async () => {
        try {
          await actualizarPlanificacion(btn.dataset.id, { esPlantillaOficial: true, estado: 'publicada' })
          AppToast.show('Planificación promocionada a Plantilla Oficial Institucional ⭐', 'success')
          renderAcmAprobacionView(container)
        } catch (err) {
          AppToast.show(`Error al promocionar: ${err.message}`, 'error')
        }
      })
    })

    tbody.querySelectorAll('.btn-justificar-desfase').forEach((btn) => {
      btn.addEventListener('click', () => {
        const targetPlan = planes.find((p) => String(p.id) === String(btn.dataset.id))
        if (targetPlan) {
          const diagVelocidad = CalculadorVelocidadCurricular.calcular({
            semanasTotales: targetPlan.semanasTotales || 24,
            semanaActual: targetPlan.semana || 12,
            totalIndicadores: targetPlan.totalIndicadores || 10,
            indicadoresCompletados: targetPlan.indicadoresCompletados || 3,
          })
          openJustificacionDesfaseModal({
            plan: targetPlan,
            calculoDesfase: diagVelocidad,
            onSubmitted: (data) => {
              AppToast.show('Justificación registrada. Notificada a Coordinación ACM.', 'success')
              renderAcmAprobacionView(container)
            },
          })
        }
      })
    })

    tbody.querySelectorAll('.btn-devolver-plan').forEach((btn) => {
      btn.addEventListener('click', async () => {
        try {
          await actualizarPlanificacion(btn.dataset.id, { estado: 'borrador' })
          AppToast.show('Planificación devuelta a borrador', 'info')
          renderAcmAprobacionView(container)
        } catch (err) {
          AppToast.show(`Error al devolver: ${err.message}`, 'error')
        }
      })
    })
  }

  const _updateBatchButton = () => {
    const btnBatch = container.querySelector('#btn-aprobar-masivo')
    if (btnBatch) {
      btnBatch.disabled = selectedIds.size === 0
      btnBatch.innerHTML = `<i class="bi bi-check2-all me-1"></i>Aprobar Seleccionados (${selectedIds.size})`
    }
  }

  container.innerHTML = `
    <div class="container-fluid px-3 py-3">
      <div class="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-4">
        <div>
          <h4 class="fw-bold mb-1"><i class="bi bi-shield-check text-primary me-2"></i>Portal ACM: Gobernanza y Aprobación Curricular</h4>
          <p class="text-muted small mb-0">Revisión de planificaciones, alertas de velocidad temporal y co-construcción pedagógica.</p>
        </div>
        <div class="d-flex flex-wrap gap-2 align-items-center">
          ${renderViewInfoButton('planificacion-acm')}
          <button class="btn btn-primary d-inline-flex align-items-center gap-1 shadow-sm px-3" id="btn-crear-disenador-full">
            <i class="bi bi-journal-plus"></i>Diseñar Plan Completo (ACM)
          </button>
          <button class="btn btn-success d-inline-flex align-items-center gap-1 shadow-sm px-3" id="btn-aprobar-masivo" disabled>
            <i class="bi bi-check2-all"></i>Aprobar Seleccionados (0)
          </button>
        </div>
      </div>

      <div class="card border-0 bg-body-tertiary mb-4 p-2 rounded-3">
        <div class="d-flex flex-wrap align-items-center justify-content-between gap-2">
          <div class="btn-group btn-group-sm" id="acm-filter-tabs">
            <button class="btn btn-outline-secondary active" data-filter="revisada">
              Pendientes de Revisión <span class="badge bg-warning text-dark ms-1" id="acm-pendientes-count">0</span>
            </button>
            <button class="btn btn-outline-secondary" data-filter="publicada">Aprobados</button>
            <button class="btn btn-outline-secondary" data-filter="borrador">Borradores</button>
            <button class="btn btn-outline-secondary" data-filter="todos">Todos</button>
          </div>
        </div>
      </div>

      <div class="card border-0 shadow-sm rounded-3 overflow-hidden">
        <div class="table-responsive">
          <table class="table table-hover align-middle mb-0">
            <thead class="table-light">
              <tr>
                <th style="width: 40px;" class="text-center">
                  <input type="checkbox" class="form-check-input" id="chk-select-all">
                </th>
                <th>Título / Plan</th>
                <th>Clase</th>
                <th>Maestro</th>
                <th>Estado</th>
                <th class="text-end">Acciones</th>
              </tr>
            </thead>
            <tbody id="acm-planes-tbody"></tbody>
          </table>
        </div>
      </div>
    </div>
  `

  // Navegar a las Vistas de Pantalla Completa
  container.querySelector('#btn-crear-disenador-full')?.addEventListener('click', () => {
    router.navigate('planificacion-disenador')
  })

  container.querySelector('#chk-select-all')?.addEventListener('change', (e) => {
    const isChecked = e.target.checked
    container.querySelectorAll('.chk-plan').forEach((chk) => {
      chk.checked = isChecked
      if (isChecked) selectedIds.add(chk.dataset.id)
      else selectedIds.delete(chk.dataset.id)
    })
    _updateBatchButton()
  })

  container.querySelector('#btn-aprobar-masivo')?.addEventListener('click', async () => {
    if (selectedIds.size === 0) return
    try {
      await marcarRevisadasMasivo(Array.from(selectedIds))
      AppToast.show(`${selectedIds.size} planificaciones aprobadas con éxito`, 'success')
      selectedIds.clear()
      renderAcmAprobacionView(container)
    } catch (err) {
      AppToast.show(`Error en aprobación masiva: ${err.message}`, 'error')
    }
  })

  container.querySelectorAll('#acm-filter-tabs button').forEach((btn) => {
    btn.addEventListener('click', () => {
      container.querySelectorAll('#acm-filter-tabs button').forEach((b) => b.classList.remove('active'))
      btn.classList.add('active')
      filterState = btn.dataset.filter
      selectedIds.clear()
      _updateBatchButton()
      _renderList()
    })
  })

  _renderList()
  attachViewInfoEvents(container)
}

function _getEstadoBadge(estado) {
  if (estado === 'publicada') {
    return `<span class="badge bg-success-subtle text-success border border-success-subtle"><i class="bi bi-check-circle me-1"></i>Aprobado</span>`
  }
  if (estado === 'revisada') {
    return `<span class="badge bg-warning-subtle text-warning-emphasis border border-warning-subtle"><i class="bi bi-clock me-1"></i>Pendiente ACM</span>`
  }
  return `<span class="badge bg-secondary-subtle text-secondary border border-secondary-subtle"><i class="bi bi-pencil-square me-1"></i>Borrador</span>`
}
