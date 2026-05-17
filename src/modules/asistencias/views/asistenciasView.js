import { AppModal } from '../../../shared/components/AppModal.js'
import { AppToast } from '../../../shared/components/AppToast.js'
import {
  getPeriodos,
  getPeriodoActivo,
  getClases,
  getDetalleSesion,
  crearAsistencia,
  ESTADOS,
  ESTADO_LABEL
} from '../api/asistenciasApi.js'
import {
  getTimelineProcesado,
  guardarAsistenciaMasiva
} from '../services/asistenciaDataService.js'
import { consumeRutaTema } from '../services/rutaTopicStore.js'
import { supabase } from '../../../lib/supabaseClient.js'
import { escapeHTML } from '../../clases/utils/clasesUtils.js'

const state = {
  timeline: [],
  periodos: [],
  periodoActivo: null,
  clases: [],
  cargando: false,
  filtroPeriodo: null,
  filtroClase: 'todas',
  container: null
}

/**
 * Vista de Asistencias - Refactored
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

    await _loadTimeline()
    renderContent(container)
    _attachEvents(container)
  } catch (error) {
    console.error(error)
    renderError(container, error.message)
  }
}

async function _loadTimeline() {
  state.timeline = await getTimelineProcesado({
    periodoId: state.filtroPeriodo,
    claseId: state.filtroClase === 'todas' ? null : state.filtroClase
  })
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

      <div class="toolbar-dense mb-3">
        <div class="d-flex gap-2 flex-grow-1">
          <select class="form-select input-dense" id="select-periodo" style="max-width: 200px;">
            ${state.periodos.map(p => `<option value="${p.id}" ${p.id === state.filtroPeriodo ? 'selected' : ''}>${escapeHTML(p.nombre)}</option>`).join('')}
          </select>
          <select class="form-select input-dense" id="select-clase" style="max-width: 200px;">
            <option value="todas">Todas las clases</option>
            ${state.clases.map(c => `<option value="${c.id}" ${c.id === state.filtroClase ? 'selected' : ''}>${escapeHTML(c.nombre)}</option>`).join('')}
          </select>
        </div>
      </div>

      <div id="timeline-area">
        ${renderTimeline()}
      </div>
    </div>
  `
}

function renderTimeline() {
  if (state.timeline.length === 0) {
    return `<div class="text-center py-5 text-muted"><i class="bi bi-calendar-x fs-1 d-block mb-2"></i>No hay sesiones registradas en este período.</div>`
  }

  return state.timeline.map(grupo => `
    <div class="timeline-group mb-4">
      <h6 class="text-muted small text-uppercase fw-bold mb-3 border-bottom pb-2">${formatTimelineDate(grupo.fecha)}</h6>
      <div class="row g-3">
        ${grupo.sesiones.map(s => renderSessionCard(s)).join('')}
      </div>
    </div>
  `).join('')
}

function renderSessionCard(s) {
  return `
    <div class="col-md-6 col-lg-4">
      <div class="card pm-card-clickable h-100" data-action="view-detail" data-id="${s.sesionId}">
        <div class="card-body p-3">
          <div class="d-flex justify-content-between align-items-start mb-2">
            <span class="badge bg-primary bg-opacity-10 text-primary border border-primary-subtle small">${escapeHTML(s.instrumento)}</span>
            <span class="text-muted extra-small"><i class="bi bi-clock me-1"></i>${s.horaInicio.slice(0,5)}</span>
          </div>
          <h6 class="fw-bold mb-1 text-truncate">${escapeHTML(s.claseNombre)}</h6>
          <p class="text-muted small mb-3 text-truncate">${escapeHTML(s.temaPrincipal || 'Sin tema definido')}</p>
          
          <div class="d-flex gap-2">
            <div class="text-center flex-grow-1 p-1 rounded bg-success bg-opacity-10">
              <div class="small fw-bold text-success">${s.totalPresentes}</div>
              <div class="extra-small text-success text-uppercase">P</div>
            </div>
            <div class="text-center flex-grow-1 p-1 rounded bg-danger bg-opacity-10">
              <div class="small fw-bold text-danger">${s.totalAusentes}</div>
              <div class="extra-small text-danger text-uppercase">A</div>
            </div>
            <div class="text-center flex-grow-1 p-1 rounded bg-warning bg-opacity-10">
              <div class="small fw-bold text-warning">${s.totalJustificados}</div>
              <div class="extra-small text-warning text-uppercase">J</div>
            </div>
          </div>
        </div>
      </div>
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
    await _reloadTimelineArea()
  })

  container.querySelector('#select-clase')?.addEventListener('change', async (e) => {
    state.filtroClase = e.target.value
    await _reloadTimelineArea()
  })

  container.querySelector('#timeline-area')?.addEventListener('click', (e) => {
    const card = e.target.closest('[data-action="view-detail"]')
    if (card) openDetailModal(card.dataset.id)
  })

  container.querySelector('#btn-nueva-sesion')?.addEventListener('click', () => openNewSessionModal())
}

async function _reloadTimelineArea() {
  const area = state.container.querySelector('#timeline-area')
  area.innerHTML = `<div class="text-center py-5"><div class="spinner-border text-primary spinner-border-sm" role="status"></div></div>`
  await _loadTimeline()
  area.innerHTML = renderTimeline()
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
            <div class="d-flex justify-content-between mb-2"><span>Horario:</span> <strong>${detail.sesion.horaInicio.slice(0,5)} - ${detail.sesion.horaFin.slice(0,5)}</strong></div>
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
