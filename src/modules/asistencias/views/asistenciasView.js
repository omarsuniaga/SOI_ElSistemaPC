import '../styles/asistencias.css'
import { AppModal } from '../../../shared/components/AppModal.js'
import { AppToast } from '../../../shared/components/AppToast.js'
import {
  getPeriodos,
  getPeriodoActivo,
  getClases,
  getDetalleSesion,
  getReporteCompleto,
  getReporteConsolidado,
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
  // OPCIÓN 3: Reporte Consolidado (agrupa por clase, no por sesión)
  // Mostrar todas las clases del período seleccionado, sin filtrar por fecha

  const { clases, resumenGlobal, fecha } = await getReporteConsolidado({
    periodoId: state.filtroPeriodo
  })

  state.timeline = clases || []
  state.resumenGlobal = resumenGlobal || {
    totalClases: 0,
    totalPresentes: 0,
    totalAusentes: 0,
    totalJustificados: 0,
    totalRegistros: 0,
  }
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
  // OPCIÓN 3: Renderizar clases consolidadas (ya agrupadas por clase+horario)
  if (state.timeline.length === 0) {
    return `<div class="text-center py-5 text-muted"><i class="bi bi-calendar-x fs-1 d-block mb-2"></i>No hay clases para hoy.</div>`
  }

  // state.timeline contiene directamente clases consolidadas
  return state.timeline.map((clase, idx) => {
    const accordionId = `accordion-clase-${idx}`
    const horario = clase.hora_inicio
      ? `${clase.hora_inicio.slice(0, 5)} - ${clase.hora_fin?.slice(0, 5) || '??:??'}`
      : 'Sin horario'

    return `
      <div class="accordion-item accordion-clase">
        <h2 class="accordion-header" id="heading-${idx}">
          <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#${accordionId}" aria-expanded="false" aria-controls="${accordionId}">
            <div class="clase-header-info">
              <div class="clase-name">${escapeHTML(clase.clase_nombre)}</div>
              <div class="clase-meta">
                <span class="horario">${horario}</span>
                <span class="maestro">Prof. ${escapeHTML(clase.maestro_nombre)}</span>
                ${clase.maestro_auxiliar_nombre ? `<span class="auxiliar">Aux. ${escapeHTML(clase.maestro_auxiliar_nombre)}</span>` : ''}
              </div>
            </div>
            <div class="clase-header-stats">
              <div class="stat-badge stat-present">
                <span class="value">${clase.presentes}</span>
                <span class="label">P</span>
              </div>
              <div class="stat-badge stat-absent">
                <span class="value">${clase.ausentes}</span>
                <span class="label">A</span>
              </div>
              <div class="stat-badge stat-justified">
                <span class="value">${clase.justificados}</span>
                <span class="label">J</span>
              </div>
            </div>
          </button>
        </h2>
        <div id="${accordionId}" class="accordion-collapse collapse" aria-labelledby="heading-${idx}">
          <div class="accordion-body">
            ${renderClaseDetalles(clase)}
          </div>
        </div>
      </div>
    `
  }).join('')
}

function renderClaseDetalles(clase) {
  const justificados = clase.justificaciones || []

  return `
    <div class="clase-details-container">
      <!-- Resumen de Asistencia -->
      <div class="resumen-stats mb-3">
        <div class="stat-row">
          <span class="stat-label">Presentes:</span>
          <span class="stat-value text-success">${clase.presentes}</span>
        </div>
        <div class="stat-row">
          <span class="stat-label">Ausentes:</span>
          <span class="stat-value text-danger">${clase.ausentes}</span>
        </div>
        <div class="stat-row">
          <span class="stat-label">Justificados:</span>
          <span class="stat-value text-warning">${clase.justificados}</span>
        </div>
      </div>

      <!-- Justificaciones con Detalles -->
      ${justificados && justificados.length > 0 ? `
        <div class="justificaciones-section">
          <h6 class="section-title">Justificaciones</h6>
          <div class="justificaciones-list">
            ${justificados.map((j, idx) => `
              <div class="justificacion-item">
                <div class="d-flex justify-content-between align-items-start">
                  <div>
                    <div class="fw-semibold">${escapeHTML(j.alumno_nombre || 'Sin nombre')}</div>
                    <div class="small text-muted">${escapeHTML(j.motivo || 'Sin descripción')}</div>
                  </div>
                  ${j.evidencia_url ? `
                    <button class="btn btn-sm btn-outline-primary" onclick="alert('Abrir adjunto: ${j.evidencia_url}')">
                      <i class="bi bi-paperclip"></i>
                    </button>
                  ` : ''}
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      ` : `
        <div class="text-muted small">No hay justificaciones registradas para esta clase.</div>
      `}
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
