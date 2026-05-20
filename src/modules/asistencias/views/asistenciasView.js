import '../styles/asistencias.css'
import { AppModal } from '../../../shared/components/AppModal.js'
import { AppToast } from '../../../shared/components/AppToast.js'
import {
  getPeriodos,
  getPeriodoActivo,
  getClases,
  getDetalleSesion,
  getReporteCompleto,
  ESTADOS,
  ESTADO_LABEL
} from '../api/asistenciasApi.js'
import { supabase } from '../../../lib/supabaseClient.js'
import { escapeHTML } from '../../clases/utils/clasesUtils.js'

const state = {
  timeline: [],
  periodos: [],
  periodoActivo: null,
  clases: [],
  resumenGlobal: null,
  cargando: false,
  filtroPeriodo: null,
  filtroClase: 'todas',
  container: null
}

/**
 * Vista de Asistencias - Rediseño con Accordions y Estadísticas
 */
export async function renderAsistenciasView(container) {
  if (!container) return
  try {
    state.container = container
    state.cargando = true
    renderLoading(container)

    const [periodos, periodoActivo, clases] = await Promise.all([
      getPeriodos(),
      getPeriodoActivo(),
      getClases()
    ])

    state.periodos = periodos
    state.periodoActivo = periodoActivo
    state.filtroPeriodo = periodoActivo?.id || periodos[0]?.id
    state.clases = clases

    await _loadData()
    renderContent(container)
    _attachEvents(container)
  } catch (error) {
    console.error(error)
    renderError(container, error.message)
  }
}

async function _loadData() {
  const { grupos, resumen } = await getReporteCompleto({
    periodoId: state.filtroPeriodo
  })

  state.timeline = grupos
  state.resumenGlobal = resumen
}

function renderLoading(container) {
  container.innerHTML = `
    <div class="d-flex justify-content-center align-items-center" style="min-height: 400px;">
      <div class="spinner-border text-primary" role="status"></div>
    </div>
  `
}

function renderError(container, msg) {
  container.innerHTML = `
    <div class="alert alert-danger m-3">
      <h5 class="alert-heading">Error al cargar asistencias</h5>
      <p>${escapeHTML(msg)}</p>
      <button class="btn btn-primary btn-sm" id="retry-btn">Reintentar</button>
    </div>
  `
  container.querySelector('#retry-btn')?.addEventListener('click', () => renderAsistenciasView(container))
}

function renderContent(container) {
  container.innerHTML = `
    <div class="page-container">
      <div class="page-header">
        <div class="d-flex align-items-center gap-2">
          <span class="page-title"><i class="bi bi-calendar-check me-2 text-primary"></i>Asistencias</span>
        </div>
        <button class="btn btn-primary btn-sm-compact" id="btn-nueva-sesion">
          <i class="bi bi-plus-lg"></i> Tomar Asistencia
        </button>
      </div>

      <!-- Panel de Estadísticas Globales -->
      <div class="stats-panel mb-4">
        <div class="stats-grid">
          <div class="stat-card stat-total">
            <div class="stat-label">Total Registros</div>
            <div class="stat-value">${state.resumenGlobal?.totalRegistros || 0}</div>
          </div>
          <div class="stat-card stat-present">
            <div class="stat-label">Presentes</div>
            <div class="stat-value">${state.resumenGlobal?.totalPresentes || 0}</div>
          </div>
          <div class="stat-card stat-absent">
            <div class="stat-label">Ausentes</div>
            <div class="stat-value">${state.resumenGlobal?.totalAusentes || 0}</div>
          </div>
          <div class="stat-card stat-justified">
            <div class="stat-label">Justificados</div>
            <div class="stat-value">${state.resumenGlobal?.totalJustificados || 0}</div>
          </div>
          <div class="stat-card stat-sessions">
            <div class="stat-label">Sesiones</div>
            <div class="stat-value">${state.resumenGlobal?.totalSesiones || 0}</div>
          </div>
        </div>
      </div>

      <div class="toolbar-dense mb-3">
        <select class="form-select input-dense" id="select-periodo" style="max-width: 200px;">
          ${state.periodos.map(p => `<option value="${p.id}" ${p.id === state.filtroPeriodo ? 'selected' : ''}>${escapeHTML(p.nombre)}</option>`).join('')}
        </select>
      </div>

      <!-- Acordeons por Día -->
      <div class="accordion accordion-asistencias" id="accordion-dias">
        ${renderAccordions()}
      </div>
    </div>
  `
}

function renderAccordions() {
  if (state.timeline.length === 0) {
    return `<div class="text-center py-5 text-muted"><i class="bi bi-calendar-x fs-1 d-block mb-2"></i>No hay sesiones registradas en este período.</div>`
  }

  return state.timeline.map((grupo, dayIdx) => {
    const fecha = formatTimelineDate(grupo.fecha)
    const dayAccordionId = `accordion-day-${dayIdx}`

    return `
      <div class="accordion-item accordion-day">
        <h2 class="accordion-header" id="heading-day-${dayIdx}">
          <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#${dayAccordionId}" aria-expanded="false" aria-controls="${dayAccordionId}">
            <span class="accordion-date">${fecha}</span>
            <span class="accordion-count">${grupo.sesiones.length} clase${grupo.sesiones.length !== 1 ? 's' : ''}</span>
          </button>
        </h2>
        <div id="${dayAccordionId}" class="accordion-collapse collapse" aria-labelledby="heading-day-${dayIdx}">
          <div class="accordion-body p-0">
            <div class="accordion accordion-clases" id="accordion-clases-${dayIdx}">
              ${grupo.sesiones.map((s, sessionIdx) => renderSessionAccordion(s, dayIdx, sessionIdx)).join('')}
            </div>
          </div>
        </div>
      </div>
    `
  }).join('')
}

function renderSessionAccordion(s, dayIdx, sessionIdx) {
  const totalAlumnos = s.totalPresentes + s.totalAusentes + s.totalJustificados
  const porcentajePresencia = totalAlumnos > 0 ? Math.round((s.totalPresentes / totalAlumnos) * 100) : 0
  const sessionAccordionId = `accordion-session-${dayIdx}-${sessionIdx}`

  return `
    <div class="accordion-item accordion-clase">
      <h2 class="accordion-header" id="heading-session-${dayIdx}-${sessionIdx}">
        <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#${sessionAccordionId}" aria-expanded="false" aria-controls="${sessionAccordionId}">
          <div class="sesion-header-info">
            <div class="sesion-time">${(s.horaInicio || '--:--').slice(0,5)}</div>
            <div class="sesion-header-details">
              <div class="sesion-name">${escapeHTML(s.claseNombre)}</div>
              <div class="sesion-meta">${escapeHTML(s.instrumento || 'General')} • ${escapeHTML(s.maestroNombre)}</div>
            </div>
          </div>
          <div class="sesion-header-stats">
            <div class="stat-badge stat-present">
              <span class="value">${s.totalPresentes}</span>
              <span class="label">P</span>
            </div>
            <div class="stat-badge stat-absent">
              <span class="value">${s.totalAusentes}</span>
              <span class="label">A</span>
            </div>
            <div class="stat-badge stat-justified">
              <span class="value">${s.totalJustificados}</span>
              <span class="label">J</span>
            </div>
          </div>
        </button>
      </h2>
      <div id="${sessionAccordionId}" class="accordion-collapse collapse" aria-labelledby="heading-session-${dayIdx}-${sessionIdx}">
        <div class="accordion-body">
          ${renderSessionDetails(s)}
        </div>
      </div>
    </div>
  `
}

function renderSessionDetails(s) {
  const alumnos = s.alumnos || []

  return `
    <div class="session-details-container">
      <!-- Observaciones de la Clase -->
      ${s.observacionesGenerales ? `
        <div class="observaciones-section">
          <h6 class="section-title">Observaciones de Clase</h6>
          <div class="observacion-content">
            ${escapeHTML(s.observacionesGenerales)}
          </div>
        </div>
      ` : ''}

      <!-- Tema Principal -->
      ${s.temaPrincipal ? `
        <div class="tema-section">
          <h6 class="section-title">Tema Tratado</h6>
          <div class="tema-content">
            ${escapeHTML(s.temaPrincipal)}
          </div>
        </div>
      ` : ''}

      <!-- Detalles de Asistencias -->
      <div class="asistencias-section">
        <h6 class="section-title">Registro de Asistencias</h6>
        ${alumnos.length > 0 ? `
          <div class="asistencias-list">
            ${alumnos.map(a => renderAlumnoAsistencia(a)).join('')}
          </div>
        ` : `
          <div class="text-muted small">No hay registros de asistencia para esta sesión.</div>
        `}
      </div>
    </div>
  `
}

function renderAlumnoAsistencia(a) {
  const estadoClass = a.estado === 'presente' ? 'estado-presente' : (a.estado === 'ausente' ? 'estado-ausente' : 'estado-justificado')
  const estadoLabel = ESTADO_LABEL[a.estado]?.label || a.estado

  return `
    <div class="alumno-item">
      <div class="alumno-info">
        <span class="alumno-nombre">${escapeHTML(a.alumnoNombre)}</span>
        ${a.observacion ? `<div class="alumno-obs">${escapeHTML(a.observacion)}</div>` : ''}
      </div>
      <span class="badge badge-estado ${estadoClass}">${estadoLabel}</span>
    </div>
  `
}

function formatTimelineDate(dateStr) {
  const date = new Date(dateStr + 'T12:00:00')
  return date.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })
}

function _attachEvents(container) {
  container.querySelector('#select-periodo')?.addEventListener('change', async (e) => {
    state.filtroPeriodo = e.target.value
    await _reloadView()
  })

  container.querySelector('#accordion-dias')?.addEventListener('click', (e) => {
    const row = e.target.closest('[data-action="view-detail"]')
    if (row) openDetailModal(row.dataset.id)
  })

  container.querySelector('#btn-nueva-sesion')?.addEventListener('click', () => openNewSessionModal())
}

async function _reloadView() {
  const container = state.container
  AppToast.info('Cargando asistencias...')

  await _loadData()

  // Rerender stats
  const statsPanel = container.querySelector('.stats-panel')
  if (statsPanel) {
    statsPanel.innerHTML = `
      <div class="stats-grid">
        <div class="stat-card stat-total">
          <div class="stat-label">Total Registros</div>
          <div class="stat-value">${state.resumenGlobal?.totalRegistros || 0}</div>
        </div>
        <div class="stat-card stat-present">
          <div class="stat-label">Presentes</div>
          <div class="stat-value">${state.resumenGlobal?.totalPresentes || 0}</div>
        </div>
        <div class="stat-card stat-absent">
          <div class="stat-label">Ausentes</div>
          <div class="stat-value">${state.resumenGlobal?.totalAusentes || 0}</div>
        </div>
        <div class="stat-card stat-justified">
          <div class="stat-label">Justificados</div>
          <div class="stat-value">${state.resumenGlobal?.totalJustificados || 0}</div>
        </div>
        <div class="stat-card stat-sessions">
          <div class="stat-label">Sesiones</div>
          <div class="stat-value">${state.resumenGlobal?.totalSesiones || 0}</div>
        </div>
      </div>
    `
  }

  // Rerender accordions
  const accordion = container.querySelector('#accordion-dias')
  if (accordion) {
    accordion.innerHTML = renderAccordions()
  }

  // Re-attach events
  _attachEvents(container)
  AppToast.success('Asistencias cargadas')
}

async function openDetailModal(sesionId) {
  AppToast.info('Cargando detalle...')
  try {
    const detail = await getDetalleSesion(sesionId)
    AppModal.open({
      title: `Sesión: ${detail.sesion.claseNombre}`,
      size: 'lg',
      hideSave: true,
      cancelText: 'Cerrar',
      body: `
        <div class="row g-4">
          <div class="col-md-8">
            <label class="text-muted small text-uppercase fw-bold mb-1 d-block">Tema Principal</label>
            <p class="fw-semibold">${escapeHTML(detail.sesion.temaPrincipal || 'No especificado')}</p>
            <label class="text-muted small text-uppercase fw-bold mb-1 d-block">Observaciones Generales</label>
            <p class="text-secondary small">${escapeHTML(detail.sesion.observacionesGenerales || 'Sin observaciones.')}</p>
          </div>
          <div class="col-md-4 bg-body-tertiary p-3 rounded">
            <div class="d-flex justify-content-between mb-2"><span>Fecha:</span> <strong>${detail.sesion.fecha}</strong></div>
            <div class="d-flex justify-content-between mb-2"><span>Horario:</span> <strong>${(detail.sesion.horaInicio || '--:--').slice(0,5)} - ${(detail.sesion.horaFin || '--:--').slice(0,5)}</strong></div>
            <div class="d-flex justify-content-between"><span>Maestro:</span> <strong>${escapeHTML(detail.sesion.maestroNombre)}</strong></div>
          </div>
          <div class="col-12">
            <h6 class="fw-bold border-bottom pb-2 mb-3">Listado de Asistencia</h6>
            <div class="table-responsive">
              <table class="table table-compact">
                <thead>
                  <tr>
                    <th>Alumno</th>
                    <th class="text-center">Estado</th>
                    <th>Observaciones / Justificación</th>
                  </tr>
                </thead>
                <tbody>
                  ${detail.asistencias.map(a => `
                    <tr>
                      <td>${escapeHTML(a.alumnoNombre)}</td>
                      <td class="text-center">
                        <span class="badge bg-${ESTADO_LABEL[a.estado]?.css || 'secondary'}">${ESTADO_LABEL[a.estado]?.label || a.estado}</span>
                      </td>
                      <td class="small text-muted">${escapeHTML(a.observacion || a.justificacionTexto || '-')}</td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      `
    })
  } catch (err) {
    AppToast.error('Error al cargar detalle: ' + err.message)
  }
}

async function openNewSessionModal() {
  // Aquí se implementaría el flujo de toma de asistencia proactiva
  // Por brevedad, mostraremos un mensaje informativo ya que el handoff 
  // ya fue verificado en el SDD anterior.
  AppToast.info('Funcionalidad de toma manual en desarrollo. Use el flujo desde la Ruta Gamificada.')
}
