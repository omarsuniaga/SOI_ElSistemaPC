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
              <div class="list-group-item py-3 px-3 hover-bg-light" data-action="view-detail" data-id="${c.sesion_clase_id}" style="cursor: pointer;">
                <div class="d-flex align-items-center justify-content-between gap-3">
                  <div class="min-w-0">
                    <h6 class="mb-1 fw-bold text-body">${escapeHTML(c.clase_nombre || 'Clase sin nombre')}</h6>
                    <small class="text-muted">
                      <i class="bi bi-person me-1"></i>${escapeHTML(c.maestro_nombre || '—')}
                      <span class="mx-1">•</span>
                      <i class="bi bi-clock me-1"></i>${escapeHTML((c.hora_inicio || '--:--').slice(0, 5))}-${escapeHTML((c.hora_fin || '--:--').slice(0, 5))}
                    </small>
                  </div>
                  <div class="d-flex align-items-center gap-2 flex-shrink-0">
                    <span class="badge bg-success-subtle text-success border border-success-subtle">${c.presentes || 0} Pres.</span>
                    <span class="badge bg-danger-subtle text-danger border border-danger-subtle">${c.ausentes || 0} Aus.</span>
                    <button class="btn btn-sm btn-outline-primary ms-2 btn-evaluar-nodo-fast" data-sesion="${c.sesion_clase_id}">
                      <i class="bi bi-star me-1"></i>Evaluar 1-5★
                    </button>
                  </div>
                </div>
                ${renderContenidoPreview(c)}
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

/**
 * Adelanto del contenido de clase en la fila del timeline.
 * `observacion_clase` viene de sesiones_clase.contenido (lo que escribe el maestro);
 * `observacion_sesion` de observaciones_sesion.contenido_raw. Se prefiere el primero.
 */
function renderContenidoPreview(clase) {
  const texto = (clase.observacion_clase || clase.observacion_sesion || '').trim()
  if (!texto) return ''

  const LIMITE = 180
  const resumen = texto.length > LIMITE ? `${texto.slice(0, LIMITE).trimEnd()}…` : texto

  return `
    <div class="mt-2 ps-1 border-start border-3 border-primary-subtle">
      <div class="ps-2 small text-secondary" style="white-space: pre-wrap; word-break: break-word;">${escapeHTML(resumen)}</div>
    </div>
  `
}

function formatTimelineDate(dateStr) {
  const date = new Date(dateStr + 'T12:00:00')
  return date.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })
}

function formatFechaLarga(fecha) {
  if (!fecha) return '—'
  const date = new Date(`${fecha}T12:00:00`)
  if (Number.isNaN(date.getTime())) return fecha
  return date.toLocaleDateString('es-ES', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

/**
 * Muestra el contenido de clase tal cual lo escribió el maestro.
 * Se preserva el texto literal (white-space: pre-wrap) porque es evidencia
 * institucional: no se reformatea ni se interpreta al mostrarlo.
 *
 * `contenido` es la fuente viva; `temaPrincipal` / `observacionesGenerales`
 * son columnas legacy que quedaron casi sin uso y sirven solo de respaldo.
 */
function renderContenidoMaestro(sesion) {
  const contenido = (sesion.contenido || '').trim()

  if (contenido) {
    return `<div class="contenido-maestro border rounded-3 p-3 bg-body" style="white-space: pre-wrap; word-break: break-word;">${escapeHTML(contenido)}</div>`
  }

  const legacy = [
    sesion.temaPrincipal && `<p class="fw-semibold mb-1">${escapeHTML(sesion.temaPrincipal)}</p>`,
    sesion.observacionesGenerales &&
      `<p class="text-secondary small mb-0">${escapeHTML(sesion.observacionesGenerales)}</p>`,
  ]
    .filter(Boolean)
    .join('')

  if (legacy) {
    return `<div class="border rounded-3 p-3 bg-body">${legacy}</div>`
  }

  return `
    <div class="alert alert-light border small mb-0">
      El maestro no registró contenido para esta sesión.
    </div>
  `
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
            <label class="text-muted small text-uppercase fw-bold mb-1 d-block">Contenido registrado por el maestro</label>
            ${renderContenidoMaestro(detail.sesion)}
          </div>
          <div class="col-md-4 bg-body-tertiary p-3 rounded">
            <div class="d-flex justify-content-between mb-2"><span>Fecha:</span> <strong>${escapeHTML(formatFechaLarga(detail.sesion.fecha))}</strong></div>
            <div class="d-flex justify-content-between mb-2"><span>Horario:</span> <strong>${escapeHTML((detail.sesion.horaInicio || '--:--').slice(0, 5))} - ${escapeHTML((detail.sesion.horaFin || '--:--').slice(0, 5))}</strong></div>
            <div class="d-flex justify-content-between mb-2"><span>Maestro:</span> <strong>${escapeHTML(detail.sesion.maestroNombre)}</strong></div>
            <div class="d-flex justify-content-between mb-2"><span>Clase:</span> <strong>${escapeHTML(detail.sesion.claseNombre || '—')}</strong></div>
            ${detail.sesion.salon ? `<div class="d-flex justify-content-between mb-2"><span>Lugar:</span> <strong>${escapeHTML(detail.sesion.salon)}</strong></div>` : ''}
            <button class="btn btn-sm btn-primary w-100 mt-2" id="btn-evaluar-modal-inner">
              <i class="bi bi-star me-1"></i>Evaluar Contenido (1-5★)
            </button>
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
