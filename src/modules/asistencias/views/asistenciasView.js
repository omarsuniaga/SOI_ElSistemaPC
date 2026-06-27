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
  ESTADO_LABEL,
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
  container: null,
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
      getClases(),
    ])

    state.periodos = periodos
    state.periodoActivo = periodoActivo

    // Inicializar filtroPeriodo: activo > primer periodo > null
    if (periodoActivo?.id) {
      state.filtroPeriodo = periodoActivo.id
    } else if (periodos && periodos.length > 0) {
      state.filtroPeriodo = periodos[0].id
    } else {
      state.filtroPeriodo = null
    }

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
  // OPCIÓN 3: Reporte Consolidado agrupado por fecha → clase
  const { timelineByDate, resumenGlobal } = await getReporteConsolidado({
    periodoId: state.filtroPeriodo,
  })

  state.timeline = timelineByDate || []
  state.resumenGlobal = resumenGlobal || {
    totalClases: 0,
    totalPresentes: 0,
    totalAusentes: 0,
    totalJustificados: 0,
    totalRegistros: 0,
    totalSesiones: 0,
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
  container
    .querySelector('#retry-btn')
    ?.addEventListener('click', () => renderAsistenciasView(container))
}

function renderContent(container) {
  container.innerHTML = `
    <div class="page-container">
      <div class="asistencias-header-premium mb-4">
        <div class="d-flex align-items-center gap-3">
          <div class="brand-badge bg-primary bg-opacity-10 text-primary rounded-3 d-flex align-items-center justify-content-center" style="width: 42px; height: 42px;">
            <i class="bi bi-calendar-check fs-4"></i>
          </div>
          <div>
            <h1 class="asistencias-title-premium page-title mb-0">Asistencias</h1>
            <p class="text-muted small mb-0">${state.resumenGlobal?.totalRegistros || 0} registros en total</p>
          </div>
        </div>
        <div class="asistencias-header-actions">
          <button class="btn btn-premium-action" id="btn-nueva-sesion">
            <i class="bi bi-plus-lg me-1.5"></i>Tomar Asistencia
          </button>
        </div>
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

      <div class="asistencias-filter-toolbar mb-4">
        <div class="premium-select-container" style="max-width: 250px;">
          <i class="bi bi-calendar3 select-icon-muted"></i>
          <select class="form-select premium-filter-select" id="select-periodo">
            ${state.periodos.map((p) => `<option value="${p.id}" ${p.id === state.filtroPeriodo ? 'selected' : ''}>${escapeHTML(p.nombre)}</option>`).join('')}
          </select>
        </div>
      </div>

      <!-- Acordeons por Día -->
      <div class="accordion accordion-asistencias" id="accordion-dias">
        ${renderAccordions()}
      </div>
    </div>
  `
}

function renderAccordions() {
  // Renderizar dos niveles: fechas (nivel 1) → clases (nivel 2)
  if (state.timeline.length === 0) {
    return `<div class="text-center py-5 text-muted"><i class="bi bi-calendar-x fs-1 d-block mb-2"></i>No hay clases registradas.</div>`
  }

  // state.timeline contiene [{ fecha, clases: [...] }, ...]
  return state.timeline
    .map((diaData, dayIdx) => {
      const fechaFormato = formatTimelineDate(diaData.fecha)
      const accordionIdFecha = `accordion-fecha-${dayIdx}`

      const clasesHTML = diaData.clases
        .map((clase, claseIdx) => {
          const accordionIdClase = `accordion-clase-${dayIdx}-${claseIdx}`
          const horario = clase.hora_inicio
            ? `${clase.hora_inicio.slice(0, 5)} - ${clase.hora_fin?.slice(0, 5) || '??:??'}`
            : 'Sin horario'

          return `
        <div class="accordion-item accordion-clase">
          <h2 class="accordion-header" id="heading-clase-${dayIdx}-${claseIdx}">
            <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#${accordionIdClase}" aria-expanded="false" aria-controls="${accordionIdClase}">
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
          <div id="${accordionIdClase}" class="accordion-collapse collapse" aria-labelledby="heading-clase-${dayIdx}-${claseIdx}">
            <div class="accordion-body">
              ${renderClaseDetalles(clase)}
            </div>
          </div>
        </div>
      `
        })
        .join('')

      return `
      <div class="accordion-item accordion-fecha">
        <h2 class="accordion-header" id="heading-fecha-${dayIdx}">
          <button class="accordion-button" type="button" data-bs-toggle="collapse" data-bs-target="#${accordionIdFecha}" aria-expanded="true" aria-controls="${accordionIdFecha}">
            <strong>${fechaFormato}</strong>
            <span class="ms-auto text-muted small">${diaData.clases.length} clase${diaData.clases.length !== 1 ? 's' : ''}</span>
          </button>
        </h2>
        <div id="${accordionIdFecha}" class="accordion-collapse collapse show" aria-labelledby="heading-fecha-${dayIdx}">
          <div class="accordion-body p-0">
            <div class="accordion accordion-asistencias-clases">
              ${clasesHTML}
            </div>
          </div>
        </div>
      </div>
    `
    })
    .join('')
}

function renderClaseDetalles(clase) {
  const asistencias = clase.asistencias || []
  const presentes = asistencias.filter((a) => a.estado === 'presente')
  const ausentes = asistencias.filter((a) => a.estado === 'ausente')
  const justificados = asistencias.filter((a) => a.estado === 'justificado')

  const key = `${clase.clase_id || 'c'}_${clase.fecha || 'f'}`

  // Sección colapsable por estado (minimalista). `abierto` define el estado inicial.
  const grupo = (titulo, alumnos, color, icon, abierto) => {
    if (alumnos.length === 0) return ''
    const targetId = `asis-${key}-${color}`
    return `
      <div class="asis-grupo">
        <button class="asis-grupo-toggle ${abierto ? '' : 'collapsed'}" type="button"
          data-bs-toggle="collapse" data-bs-target="#${targetId}" aria-expanded="${abierto}">
          <i class="bi ${icon} text-${color} me-2"></i>
          <span class="fw-semibold">${titulo}</span>
          <span class="badge rounded-pill text-bg-${color} ms-2">${alumnos.length}</span>
          <i class="bi bi-chevron-down asis-chevron ms-auto"></i>
        </button>
        <div id="${targetId}" class="collapse ${abierto ? 'show' : ''}">
          <ul class="list-group list-group-flush asis-lista">
            ${alumnos
              .map(
                (a) => `
              <li class="list-group-item d-flex justify-content-between align-items-center gap-2 px-0 py-1 border-0 bg-transparent">
                <span class="asis-nombre text-truncate">${escapeHTML(a.alumno_nombre || 'Sin nombre')}</span>
                ${
                  a.instrumento
                    ? `<span class="badge rounded-pill asis-instrumento"><i class="bi bi-music-note me-1"></i>${escapeHTML(a.instrumento)}</span>`
                    : ''
                }
              </li>`,
              )
              .join('')}
          </ul>
        </div>
      </div>
    `
  }

  const obs = clase.observacion_sesion || clase.observacion_clase
  return `
    <div class="asis-detalle">
      ${grupo('Presentes', presentes, 'success', 'bi-check-circle', false)}
      ${grupo('Ausentes', ausentes, 'danger', 'bi-x-circle', true)}
      ${grupo('Justificados', justificados, 'warning', 'bi-exclamation-circle', false)}
      ${
        obs
          ? `<div class="asis-obs mt-2 pt-2 border-top">
               <i class="bi bi-chat-left-text me-1 text-muted"></i>
               <span class="text-secondary small">${escapeHTML(obs)}</span>
             </div>`
          : ''
      }
    </div>
  `
}

function renderAlumnoAsistencia(a) {
  const estadoClass =
    a.estado === 'presente'
      ? 'estado-presente'
      : a.estado === 'ausente'
        ? 'estado-ausente'
        : 'estado-justificado'
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

  container
    .querySelector('#btn-nueva-sesion')
    ?.addEventListener('click', () => openNewSessionModal())
}

async function _reloadView() {
  const container = state.container
  AppToast.info('Cargando asistencias...')

  await _loadData()

  // Update total records in header
  const countEl = container.querySelector('.asistencias-header-premium p.text-muted')
  if (countEl) {
    countEl.textContent = `${state.resumenGlobal?.totalRegistros || 0} registros en total`
  }

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
            <div class="d-flex justify-content-between mb-2"><span>Horario:</span> <strong>${(detail.sesion.horaInicio || '--:--').slice(0, 5)} - ${(detail.sesion.horaFin || '--:--').slice(0, 5)}</strong></div>
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
                  ${detail.asistencias
                    .map(
                      (a) => `
                    <tr>
                      <td>${escapeHTML(a.alumnoNombre)}</td>
                      <td class="text-center">
                        <span class="badge bg-${ESTADO_LABEL[a.estado]?.css || 'secondary'}">${ESTADO_LABEL[a.estado]?.label || a.estado}</span>
                      </td>
                      <td class="small text-muted">${escapeHTML(a.observacion || a.justificacionTexto || '-')}</td>
                    </tr>
                  `,
                    )
                    .join('')}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      `,
    })
  } catch (err) {
    AppToast.error('Error al cargar detalle: ' + err.message)
  }
}

async function openNewSessionModal() {
  // Aquí se implementaría el flujo de toma de asistencia proactiva
  // Por brevedad, mostraremos un mensaje informativo ya que el handoff
  // ya fue verificado en el SDD anterior.
  AppToast.info(
    'Funcionalidad de toma manual en desarrollo. Use el flujo desde la Ruta Gamificada.',
  )
}
