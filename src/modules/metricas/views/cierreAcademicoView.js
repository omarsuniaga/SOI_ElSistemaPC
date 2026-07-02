import { AppToast } from '../../../shared/components/AppToast.js'
import { getEstadisticasPeriodoActivo, getResumenCierreAcademico, cerrarPeriodoAcademico } from '../api/metricasApi.js'
import { escapeHTML } from '../../clases/utils/clasesUtils.js'
import { renderMetricCard } from '../components/MetricCard.js'
import { getPeriodoActivo } from '../../periodos/api/periodosApi.js'
import { generateAcademicClosureReport } from '../../../portal-maestros/services/reportService.js'

const state = {
  periodo: null,
  cargando: false,
  stats: null,
  cierre: null,
}

export async function renderCierreAcademicoView(container) {
  if (!container) return
  state.cargando = true
  renderLoading(container)
  try {
    state.periodo = await getPeriodoActivo()
    if (!state.periodo) {
      state.periodo = await getEstadisticasPeriodoActivo()
    }

    const fechaInicio = state.periodo?.fecha_inicio || state.periodo?.fechaInicio || null
    const fechaFin = state.periodo?.fecha_fin || state.periodo?.fechaFin || null
    const periodoId = state.periodo?.id || state.periodo?.periodo_id || null

    state.cierre = await getResumenCierreAcademico({ fechaInicio, fechaFin, periodoId })
    state.stats = { ...state.periodo, ...state.cierre?.resumen }
    renderContent(container)
  } catch (error) {
    renderError(container, error.message)
  } finally {
    state.cargando = false
  }
}

function renderLoading(container) {
  container.innerHTML = `
    <div class="d-flex justify-content-center align-items-center" style="min-height: 420px;">
      <div class="text-center">
        <div class="spinner-border text-primary mb-3" role="status"></div>
        <p class="text-muted">Preparando cierre académico...</p>
      </div>
    </div>
  `
}

function renderError(container, message) {
  container.innerHTML = `
    <div class="alert alert-danger m-3">
      <h5 class="mb-2">No se pudo cargar el cierre académico</h5>
      <p class="mb-0">${escapeHTML(message)}</p>
    </div>
  `
}

function renderContent(container) {
  const s = state.stats || {}
  const cierre = state.cierre || { clases: [], alumnos: [], resumen: {} }
  container.innerHTML = `
    <div class="page-container">
      <div class="page-header d-flex justify-content-between align-items-center flex-wrap gap-2 mb-4">
        <div>
          <h3 class="mb-1"><i class="bi bi-archive me-2 text-primary"></i>Cierre Académico</h3>
          <p class="text-muted mb-0">Consolidado del período académico activo: clases, asistencias, progresos y auditoría final.</p>
        </div>
        <div class="d-flex gap-2">
          <button class="btn btn-outline-secondary" id="btn-preview-cierre"><i class="bi bi-file-earmark-text me-1"></i>Vista previa</button>
          <button class="btn btn-danger" id="btn-lock-period"><i class="bi bi-lock-fill me-1"></i>Cerrar período</button>
        </div>
      </div>

      <div class="row g-3 mb-4">
        <div class="col-md-6 col-lg-3">${renderMetricCard({ label: 'Clases', value: cierre.resumen.totalClases || 0, icon: 'bi-easel2', color: 'primary' })}</div>
        <div class="col-md-6 col-lg-3">${renderMetricCard({ label: 'Contenido', value: cierre.resumen.totalContenido || 0, icon: 'bi-journal-text', color: 'success' })}</div>
        <div class="col-md-6 col-lg-3">${renderMetricCard({ label: 'Asistencias', value: `${cierre.resumen.totalPresentes || 0} / ${cierre.resumen.totalAusentes || 0} / ${cierre.resumen.totalJustificados || 0}`, icon: 'bi-calendar-check', color: 'info' })}</div>
        <div class="col-md-6 col-lg-3">${renderMetricCard({ label: 'Alumnos', value: cierre.resumen.totalAlumnos || 0, icon: 'bi-people', color: 'warning' })}</div>
      </div>

      <div class="alert alert-primary border-0 shadow-sm mb-4">
        <div class="d-flex flex-wrap justify-content-between gap-2 align-items-center">
          <div>
            <strong>Período activo:</strong>
            ${escapeHTML(s.nombre || 'Sin nombre')} · ${escapeHTML(s.fecha_inicio || s.fechaInicio || 'N/D')} a ${escapeHTML(s.fecha_fin || s.fechaFin || 'N/D')}
          </div>
          <div class="small text-muted">
            Estado: ${escapeHTML(String(s.activo ? 'activo' : (s.cerrado ? 'cerrado' : 'pendiente')))}
          </div>
        </div>
      </div>

      <div class="row g-4">
        <div class="col-12 col-xl-7">
          <div class="page-glass p-4">
            <h5 class="fw-bold mb-3"><i class="bi bi-journal-check me-2 text-primary"></i>Indicadores del período</h5>
            ${renderIndicadores()}
          </div>
        </div>
        <div class="col-12 col-xl-5">
          <div class="page-glass p-4 mb-4">
            <h5 class="fw-bold mb-3"><i class="bi bi-building me-2 text-primary"></i>Detalle por clase</h5>
            ${renderListaClases(cierre.clases)}
          </div>
          <div class="page-glass p-4">
            <h5 class="fw-bold mb-3"><i class="bi bi-person-check me-2 text-primary"></i>Detalle por alumno</h5>
            ${renderListaAlumnos(cierre.alumnos, 'alumno')}
          </div>
        </div>
      </div>
    </div>
  `

  container.querySelector('#btn-lock-period')?.addEventListener('click', () => {
    void (async () => {
      try {
        const payload = {
          periodoId: state.periodo?.id || state.periodo?.periodo_id || null,
          fechaInicio: state.periodo?.fecha_inicio || state.periodo?.fechaInicio || null,
          fechaFin: state.periodo?.fecha_fin || state.periodo?.fechaFin || null,
          cerradoPor: null,
          observaciones: 'Cierre ejecutado desde Portal ACM',
        }
        if (!payload.periodoId) throw new Error('No se encontró un período activo para cerrar')
        const result = await cerrarPeriodoAcademico(payload)
        AppToast.show(`Período cerrado correctamente${result?.snapshotId ? ` (snapshot ${result.snapshotId})` : ''}`, 'success')
      } catch (err) {
        AppToast.show(`No se pudo cerrar el período: ${err.message}`, 'error')
      }
    })()
  })

  container.querySelector('#btn-preview-cierre')?.addEventListener('click', async () => {
    try {
      await generateAcademicClosureReport({
        periodo: state.periodo,
        resumen: state.cierre?.resumen,
        clases: state.cierre?.clases || [],
        alumnos: state.cierre?.alumnos || [],
      })
    } catch (err) {
      AppToast.show(`No se pudo generar la vista previa: ${err.message}`, 'error')
    }
  })
}

function renderIndicadores() {
  return `
    <div class="table-responsive">
      <table class="table table-sm align-middle">
        <tbody>
          <tr><th>Clases dictadas</th><td>Sesiones programadas vs impartidas en el rango</td></tr>
          <tr><th>Contenido cubierto</th><td>Temas planificados vs temas realmente dados</td></tr>
          <tr><th>Progreso por alumno</th><td>Avance individual sobre el contenido impartido</td></tr>
          <tr><th>Asistencia global</th><td>Presentes, ausentes y justificados</td></tr>
          <tr><th>Ausencias justificadas</th><td>Razón, fecha y aprobador de cada justificación</td></tr>
          <tr><th>Clases sin registro</th><td>Sesiones sin asistencia o sin progreso cargado</td></tr>
          <tr><th>Riesgo académico</th><td>Alumnos con baja asistencia o bajo progreso</td></tr>
        </tbody>
      </table>
    </div>
  `
}

function renderListaClases(items) {
  if (!items?.length) return `<p class="text-muted mb-0">Sin clases para el rango seleccionado.</p>`
  return `
    <div class="list-group list-group-flush">
      ${items.slice(0, 10).map((item) => `
        <div class="list-group-item px-0">
          <div class="fw-semibold">${escapeHTML(item.claseNombre)} <span class="text-muted small">(${escapeHTML(item.instrumento)})</span></div>
          <div class="small text-muted">Docente: ${escapeHTML(item.maestroNombre)} · Sesiones: ${item.sesiones} · Contenido: ${item.contenidosTrabajados}</div>
          <div class="small">P: ${item.presentes} · A: ${item.ausentes} · J: ${item.justificados}</div>
        </div>
      `).join('')}
    </div>
  `
}

function renderListaAlumnos(items, tipo) {
  if (!items?.length) return `<p class="text-muted mb-0">Sin alumnos para mostrar.</p>`
  return `
    <div class="list-group list-group-flush">
      ${items.slice(0, 8).map((item) => `
        <div class="list-group-item px-0">
          <div class="d-flex justify-content-between align-items-center">
            <div>
              <div class="fw-semibold">${escapeHTML(item.alumnoNombre || item.nombre_completo || 'Sin nombre')}</div>
              <div class="small text-muted">Presentes: ${item.presentes || 0} · Ausentes: ${item.ausentes || 0} · Justificados: ${item.justificados || 0}</div>
              <div class="small text-muted">Progreso: ${item.totalRegistrosProgreso || 0} registros</div>
            </div>
            <span class="badge bg-${tipo === 'alumno' ? 'primary' : 'success'}">${item.tasaAsistencia != null ? `${item.tasaAsistencia.toFixed(1)}%` : 'N/D'}</span>
          </div>
          ${item.justificaciones?.length ? `<div class="small mt-2 text-muted">Justificaciones: ${item.justificaciones.map(escapeHTML).join(' · ')}</div>` : ''}
        </div>
      `).join('')}
    </div>
  `
}

