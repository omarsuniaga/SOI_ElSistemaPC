import '../styles/asistencias.css'
import { AppModal } from '../../../shared/components/AppModal.js'
import { AppToast } from '../../../shared/components/AppToast.js'
import {
  getPeriodos,
  getPeriodoActivo,
  getClases,
  getDetalleSesion,
  getReporteConsolidado,
  ESTADO_LABEL,
} from '../api/asistenciasApi.js'
import { escapeHTML } from '../../clases/utils/clasesUtils.js'
import { openEvaluacionEstrellasModal } from '../../planificacion/components/EvaluacionEstrellasModal.js'
import { renderMapaContenidoSVG } from '../../planificacion/components/MapaContenidoSVG.js'

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
 * Vista de Asistencias - Rediseño con Accordions y Mapa de Contenido Interactivo
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
  container.querySelector('#retry-btn')?.addEventListener('click', () => renderAsistenciasView(state.container))
}

function renderContent(container) {
  container.innerHTML = `
    <div class="asistencias-header-premium p-3 mb-3 bg-body-tertiary rounded-3 shadow-sm">
      <div class="d-flex flex-wrap justify-content-between align-items-center gap-3">
        <div>
          <h4 class="fw-bold mb-1"><i class="bi bi-calendar-check text-primary me-2"></i>Control de Asistencia y Evaluación Didáctica</h4>
          <p class="text-muted small mb-0">${state.resumenGlobal?.totalRegistros || 0} registros en total</p>
        </div>
        <div class="d-flex gap-2">
          <select class="form-select form-select-sm" id="select-periodo" style="width: auto;">
            ${state.periodos
              .map(
                (p) => `
              <option value="${p.id}" ${p.id === state.filtroPeriodo ? 'selected' : ''}>
                ${escapeHTML(p.nombre)} ${p.activo ? '(Activo)' : ''}
              </option>
            `,
              )
              .join('')}
          </select>
          <a href="#asistencias-reportes" class="btn btn-sm btn-outline-secondary d-inline-flex align-items-center">
            <i class="bi bi-file-earmark-pdf me-1"></i>Reportes PDF
          </a>
        </div>
      </div>
    </div>

    <!-- Panel para Renderizar el Mapa SVG Interactivo de Contenidos -->
    <div id="asistencias-mapa-svg-panel" class="mb-4"></div>

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

    <div class="accordion-container">
      <div class="accordion" id="accordion-dias">
        ${renderAccordions()}
      </div>
    </div>
  `

  // Renderizar Mapa de Nodos SVG de Ejemplo en la Cabecera de la Clase
  const mapaPanel = container.querySelector('#asistencias-mapa-svg-panel')
  if (mapaPanel) {
    const nodosDemo = [
      { id: 'nd-1', titulo: 'Postura y Arco Libre', estado: 'logrado' },
      { id: 'nd-2', titulo: 'Escala de Do Mayor', estado: 'en_proceso' },
      { id: 'nd-3', titulo: 'Estudio Nº 4 (Suzuki)', estado: 'pendiente' },
    ]

    renderMapaContenidoSVG({
      container: mapaPanel,
      nodos: nodosDemo,
      onNodeClick: (nodo) => {
        const alumnosDemo = [
          { id: 'al-1', nombre: 'María González', presente: true },
          { id: 'al-2', nombre: 'Pedro Ramírez', presente: true },
          { id: 'al-3', nombre: 'Luis Pérez', presente: false },
        ]
        openEvaluacionEstrellasModal({
          nodo,
          alumnos: alumnosDemo,
        })
      },
      onAddNodeClick: () => {
        AppToast.info('Añadiendo objetivo al vuelo...')
      },
    })
  }
}

function renderAccordions() {
  if (!state.timeline || state.timeline.length === 0) {
    return `
      <div class="text-center py-5 text-muted">
        <i class="bi bi-inbox display-4 d-block mb-2"></i>
        No hay registros de asistencia para este periodo.
      </div>
    `
  }

  return state.timeline
    .map(
      (dia, idx) => `
    <div class="accordion-item mb-2 border rounded-3 overflow-hidden">
      <h2 class="accordion-header" id="heading-${idx}">
        <button class="accordion-button ${idx !== 0 ? 'collapsed' : ''}" type="button" data-bs-toggle="collapse" data-bs-target="#collapse-${idx}">
          <i class="bi bi-calendar3 me-2 text-primary"></i>
          <strong>${formatTimelineDate(dia.fecha)}</strong>
          <span class="badge bg-secondary ms-auto me-2">${dia.clases?.length || 0} clases</span>
        </button>
      </h2>
      <div id="collapse-${idx}" class="accordion-collapse collapse ${idx === 0 ? 'show' : ''}" data-bs-parent="#accordion-dias">
        <div class="accordion-body p-0">
          <div class="list-group list-group-flush">
            ${(dia.clases || [])
              .map(
                (c) => `
              <div class="list-group-item d-flex align-items-center justify-content-between py-3 px-3 hover-bg-light" data-action="view-detail" data-id="${c.sesionId}" style="cursor: pointer;">
                <div>
                  <h6 class="mb-1 fw-bold text-body">${escapeHTML(c.claseNombre)}</h6>
                  <small class="text-muted"><i class="bi bi-person me-1"></i>Maestro: ${escapeHTML(c.maestroNombre || '—')}</small>
                </div>
                <div class="d-flex align-items-center gap-2">
                  <span class="badge bg-success-subtle text-success border border-success-subtle">${c.presentes || 0} Pres.</span>
                  <span class="badge bg-danger-subtle text-danger border border-danger-subtle">${c.ausentes || 0} Aus.</span>
                  <button class="btn btn-sm btn-outline-primary ms-2 btn-evaluar-nodo-fast" data-sesion="${c.sesionId}">
                    <i class="bi bi-star me-1"></i>Evaluar 1-5★
                  </button>
                </div>
              </div>
            `,
              )
              .join('')}
          </div>
        </div>
      </div>
    </div>
  `,
    )
    .join('')
}

function formatTimelineDate(dateStr) {
  const date = new Date(dateStr + 'T12:00:00')
  return date.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })
}

function getObservacionTipoLabel(tipo) {
  const labels = {
    academico: 'Académica',
    conducta: 'Conducta',
    seguimiento: 'Seguimiento',
    familiar: 'Familiar',
    salud: 'Salud',
  }

  if (!tipo) return 'General'
  return labels[tipo] || tipo.charAt(0).toUpperCase() + tipo.slice(1)
}

function getPrioridadLabel(prioridad) {
  const labels = {
    baja: 'Prioridad baja',
    media: 'Prioridad media',
    alta: 'Prioridad alta',
    urgente: 'Prioridad urgente',
  }

  if (!prioridad) return 'Sin prioridad'
  return labels[prioridad] || prioridad.charAt(0).toUpperCase() + prioridad.slice(1)
}

function getPrioridadBadgeClass(prioridad) {
  const classes = {
    baja: 'success',
    media: 'warning',
    alta: 'danger',
    urgente: 'danger',
  }

  return classes[prioridad] || 'secondary'
}

function _attachEvents(container) {
  container.querySelector('#select-periodo')?.addEventListener('change', async (e) => {
    state.filtroPeriodo = e.target.value
    await _reloadView()
  })

  container.querySelector('#accordion-dias')?.addEventListener('click', (e) => {
    const evalBtn = e.target.closest('.btn-evaluar-nodo-fast')
    if (evalBtn) {
      e.stopPropagation()
      openEvaluacionDirecta(evalBtn.dataset.sesion)
      return
    }

    const row = e.target.closest('[data-action="view-detail"]')
    if (row) openDetailModal(row.dataset.id)
  })
}

function openEvaluacionDirecta(sesionId) {
  openEvaluacionEstrellasModal({
    nodo: { id: `nodo-${sesionId}`, titulo: 'Contenido de la Sesión' },
    alumnos: [
      { id: 'al-1', nombre: 'Alumno 1', presente: true },
      { id: 'al-2', nombre: 'Alumno 2', presente: true },
      { id: 'al-3', nombre: 'Alumno 3', presente: false },
    ],
  })
}

async function _reloadView() {
  const container = state.container
  await _loadData()
  renderContent(container)
  _attachEvents(container)
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
            <div class="d-flex justify-content-between mb-2"><span>Fecha:</span> <strong>${escapeHTML(detail.sesion.fecha || '—')}</strong></div>
            <div class="d-flex justify-content-between mb-2"><span>Horario:</span> <strong>${escapeHTML((detail.sesion.horaInicio || '--:--').slice(0, 5))} - ${escapeHTML((detail.sesion.horaFin || '--:--').slice(0, 5))}</strong></div>
            <div class="d-flex justify-content-between mb-2"><span>Maestro:</span> <strong>${escapeHTML(detail.sesion.maestroNombre)}</strong></div>
            <button class="btn btn-sm btn-primary w-100 mt-2" id="btn-evaluar-modal-inner">
              <i class="bi bi-star me-1"></i>Evaluar Contenido (1-5★)
            </button>
          </div>
          <div class="col-12">
            <h6 class="fw-bold border-bottom pb-2 mb-3">Registro de Observaciones </h6>
            ${
              detail.observaciones?.length
                ? `
              <div class="observaciones-section">
                <div class="d-flex flex-column gap-3">
                  ${detail.observaciones
                    .map(
                      (o) => `
                    <article class="border rounded-3 p-3 bg-body">
                      <div class="d-flex flex-wrap justify-content-between align-items-start gap-2 mb-2">
                        <div>
                          <div class="fw-semibold">${escapeHTML(o.titulo || 'Observación sin título')}</div>
                          <div class="small text-muted">
                            <i class="bi bi-person me-1"></i>${escapeHTML(o.alumnoNombre || '—')}
                            <span class="mx-1">•</span>
                            ${escapeHTML(getObservacionTipoLabel(o.tipo))}
                          </div>
                        </div>
                        <div class="d-flex flex-wrap gap-2">
                          <span class="badge text-bg-${getPrioridadBadgeClass(o.prioridad)}">${escapeHTML(getPrioridadLabel(o.prioridad))}</span>
                        </div>
                      </div>
                      <div class="observacion-content">${escapeHTML(o.descripcion || 'Sin descripción.')}</div>
                    </article>
                  `,
                    )
                    .join('')}
                </div>
              </div>
            `
                : `
              <div class="alert alert-light border small mb-0">
                No hay observaciones registradas para esta sesión.
              </div>
            `
            }
          </div>
          <div class="col-12">
            <h6 class="fw-bold border-bottom pb-2 mb-3">Listado de Asistencia y Evaluación</h6>
            <div class="table-responsive">
              <table class="table table-compact">
                <thead>
                  <tr>
                    <th>Alumno</th>
                    <th class="text-center">Estado Asistencia</th>
                    <th>Observaciones</th>
                  </tr>
                </thead>
                <tbody>
                  ${detail.asistencias
                    .map(
                      (a) => `
                    <tr>
                      <td>${escapeHTML(a.alumnoNombre)}</td>
                      <td class="text-center">
                        <span class="badge bg-${ESTADO_LABEL[a.estado]?.css || 'secondary'}">${escapeHTML(ESTADO_LABEL[a.estado]?.label || a.estado)}</span>
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

    setTimeout(() => {
      document.querySelector('#btn-evaluar-modal-inner')?.addEventListener('click', () => {
        const alumnosModal = detail.asistencias.map((a) => ({
          id: a.alumnoId,
          nombre: a.alumnoNombre,
          presente: a.estado === 'presente' || a.estado === 'tardanza',
        }))

        openEvaluacionEstrellasModal({
          nodo: { id: `nodo-${sesionId}`, titulo: detail.sesion.temaPrincipal || 'Contenido Didáctico' },
          alumnos: alumnosModal,
        })
      })
    }, 100)
  } catch (err) {
    AppToast.error(`Error cargando detalle: ${err.message}`)
  }
}
