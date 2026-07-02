import { AppToast } from '../../../shared/components/AppToast.js'
import { escapeHTML } from '../../clases/utils/clasesUtils.js'
import { getCierresAcademicos } from '../api/metricsApi.js'

const state = {
  cierres: [],
  cargando: false,
}

export async function renderCierreHistoricoView(container) {
  if (!container) return
  state.cargando = true
  renderLoading(container)
  try {
    state.cierres = await getCierresAcademicos({ limit: 30 })
    renderContent(container)
  } catch (error) {
    renderError(container, error.message)
  } finally {
    state.cargando = false
  }
}

function renderLoading(container) {
  container.innerHTML = `
    <div class="d-flex justify-content-center align-items-center" style="min-height: 380px;">
      <div class="text-center">
        <div class="spinner-border text-primary mb-3" role="status"></div>
        <p class="text-muted mb-0">Cargando historial de cierres...</p>
      </div>
    </div>
  `
}

function renderError(container, message) {
  container.innerHTML = `
    <div class="alert alert-danger m-3">
      <h5 class="mb-2">No se pudo cargar el historial de cierres</h5>
      <p class="mb-0">${escapeHTML(message)}</p>
    </div>
  `
}

function renderContent(container) {
  const cierres = state.cierres || []
  container.innerHTML = `
    <div class="page-container">
      <div class="page-header mb-4">
        <h3 class="mb-1"><i class="bi bi-clock-history me-2 text-primary"></i>Historial de Cierres Académicos</h3>
        <p class="text-muted mb-0">Registro auditable de los períodos académicos cerrados.</p>
      </div>

      <div class="page-glass p-4">
        ${cierres.length
          ? `
            <div class="table-responsive">
              <table class="table table-sm align-middle">
                <thead>
                  <tr>
                    <th>Período</th>
                    <th>Fecha cierre</th>
                    <th>Rango</th>
                    <th>Clases</th>
                    <th>Asistencia</th>
                    <th>Nota</th>
                  </tr>
                </thead>
                <tbody>
                  ${cierres.map(renderRow).join('')}
                </tbody>
              </table>
            </div>
          `
          : `<div class="alert alert-info mb-0">Todavía no hay cierres académicos registrados.</div>`}
      </div>
    </div>
  `
}

function renderRow(item) {
  const periodo = item.periodos || {}
  const resumen = item.resumen || {}
  const totalAsistencias = (resumen.totalPresentes || 0) + (resumen.totalAusentes || 0) + (resumen.totalJustificados || 0)
  return `
    <tr>
      <td>
        <div class="fw-semibold">${escapeHTML(periodo.nombre || item.periodo_id || 'Sin nombre')}</div>
        <div class="small text-muted">${escapeHTML(periodo.activo ? 'Activo' : (periodo.cerrado ? 'Cerrado' : 'Inactivo'))}</div>
      </td>
      <td>${escapeHTML(formatDate(item.created_at))}</td>
      <td>${escapeHTML(`${item.fecha_inicio || 'N/D'} → ${item.fecha_fin || 'N/D'}`)}</td>
      <td>${escapeHTML(String(resumen.totalClases ?? resumen.total_clases ?? 0))}</td>
      <td>${escapeHTML(`${resumen.totalPresentes ?? 0} / ${resumen.totalAusentes ?? 0} / ${resumen.totalJustificados ?? 0}`)}</td>
      <td>
        <div class="small">${escapeHTML(item.observaciones || 'Sin observaciones')}</div>
        <div class="small text-muted">Asistencias: ${escapeHTML(String(totalAsistencias))}</div>
      </td>
    </tr>
  `
}

function formatDate(dateStr) {
  if (!dateStr) return 'N/D'
  const d = new Date(dateStr)
  if (Number.isNaN(d.getTime())) return 'N/D'
  return d.toLocaleString('es-DO', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}

