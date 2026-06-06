import { obtenerSesiones } from '../api/sesionesApi.js'
import { obtenerClases } from '../api/planificacionAdapter.js'
import { usePlanificacion } from '../hooks/usePlanificacion.js'
import { escapeHTML } from '../../clases/utils/clasesUtils.js'

const panelState = {
  sesiones: [],
  sesionesEnriquecidas: [],
  clases: [],
  filtroClase: '',
  filtroFechaDesde: '',
  filtroFechaHasta: '',
  soloSinPlan: false,
  container: null,
  onCrearPlan: null,
}

/**
 * Renders the Content History panel inside the given container.
 * @param {HTMLElement} container
 * @param {object} options
 * @param {string|null} options.maestroId
 * @param {Array} options.planificaciones - current plans from the hook
 * @param {Function} options.onCrearPlan - callback(prefillData) to open plan modal
 */
export async function renderHistorialContenidosPanel(container, options = {}) {
  const { maestroId = null, planificaciones = [], onCrearPlan = null } = options
  panelState.container = container
  panelState.onCrearPlan = onCrearPlan

  container.innerHTML = _renderLoading()

  try {
    const [sesiones, clases] = await Promise.all([
      obtenerSesiones({ maestro_id: maestroId, soloConContenido: true }),
      obtenerClases(),
    ])

    panelState.sesiones = sesiones.sort((a, b) => new Date(b.fecha) - new Date(a.fecha))
    panelState.clases = clases

    const hook = usePlanificacion()
    panelState.sesionesEnriquecidas = hook.getSesionesConEstadoPlanificacion(
      panelState.sesiones,
      planificaciones,
    )

    _renderPanel()
  } catch (error) {
    console.error('[historialContenidosPanel]', error)
    container.innerHTML = `
      <div class="alert alert-warning d-flex align-items-start gap-3 m-0" role="alert">
        <i class="bi bi-exclamation-triangle fs-3 text-warning mt-1"></i>
        <div>
          <h5 class="alert-heading mb-1">Error al cargar historial</h5>
          <p class="mb-0 small">${escapeHTML(error.message)}</p>
        </div>
      </div>`
  }
}

function _renderLoading() {
  return `
    <div class="d-flex justify-content-center align-items-center" style="min-height: 300px;">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Cargando historial...</span>
      </div>
    </div>`
}

function _getFilteredSesiones() {
  return panelState.sesionesEnriquecidas.filter((s) => {
    if (panelState.filtroClase && s.clase_id !== panelState.filtroClase) return false
    if (panelState.filtroFechaDesde && s.fecha < panelState.filtroFechaDesde) return false
    if (panelState.filtroFechaHasta && s.fecha > panelState.filtroFechaHasta) return false
    if (panelState.soloSinPlan && s.tiene_plan) return false
    return true
  })
}

function _renderPanel() {
  const filtradas = _getFilteredSesiones()
  const totalSesiones = panelState.sesionesEnriquecidas.length
  const sinPlan = panelState.sesionesEnriquecidas.filter((s) => !s.tiene_plan).length
  const conPlan = totalSesiones - sinPlan

  // Group by clase
  const agrupadas = new Map()
  for (const s of filtradas) {
    const claseId = s.clase_id || 'sin_clase'
    if (!agrupadas.has(claseId)) agrupadas.set(claseId, [])
    agrupadas.get(claseId).push(s)
  }

  // Unique clases from sessions
  const clasesEnSesiones = [
    ...new Set(panelState.sesionesEnriquecidas.map((s) => s.clase_id).filter(Boolean)),
  ]
  const clasesOpciones = clasesEnSesiones
    .map((cid) => {
      const clase = panelState.clases.find((c) => c.id === cid)
      return { id: cid, nombre: clase?.nombre || cid }
    })
    .sort((a, b) => a.nombre.localeCompare(b.nombre))

  panelState.container.innerHTML = `
    <div class="historial-panel">
      <!-- Stats -->
      <div class="historial-stats mb-3">
        <div class="historial-stat">
          <span class="historial-stat-value">${totalSesiones}</span>
          <span class="historial-stat-label">Sesiones</span>
        </div>
        <div class="historial-stat historial-stat--warning">
          <span class="historial-stat-value">${sinPlan}</span>
          <span class="historial-stat-label">Sin planificar</span>
        </div>
        <div class="historial-stat historial-stat--success">
          <span class="historial-stat-value">${conPlan}</span>
          <span class="historial-stat-label">Planificadas</span>
        </div>
      </div>

      <!-- Filters -->
      <div class="historial-filter-bar mb-3">
        <div class="premium-select-container">
          <i class="bi bi-book select-icon-muted"></i>
          <select class="form-select premium-filter-select" id="historial-filtro-clase">
            <option value="">Todas las clases</option>
            ${clasesOpciones.map((c) => `<option value="${c.id}" ${panelState.filtroClase === c.id ? 'selected' : ''}>${escapeHTML(c.nombre)}</option>`).join('')}
          </select>
        </div>
        <div class="historial-date-filters">
          <input type="date" class="form-control input-dense" id="historial-fecha-desde"
                 value="${panelState.filtroFechaDesde}" placeholder="Desde">
          <input type="date" class="form-control input-dense" id="historial-fecha-hasta"
                 value="${panelState.filtroFechaHasta}" placeholder="Hasta">
        </div>
        <label class="historial-toggle" id="historial-toggle-sin-plan">
          <input type="checkbox" ${panelState.soloSinPlan ? 'checked' : ''}>
          <span class="historial-toggle-label">Solo sin planificar</span>
        </label>
      </div>

      <!-- Timeline -->
      <div class="historial-timeline" id="historial-timeline">
        ${filtradas.length === 0 ? _renderEmpty() : _renderGroups(agrupadas)}
      </div>
    </div>
  `

  _attachPanelEvents()
}

function _renderGroups(agrupadas) {
  let html = ''
  for (const [claseId, sesiones] of agrupadas) {
    const clase = panelState.clases.find((c) => c.id === claseId)
    const claseNombre = clase?.nombre || 'Clase sin nombre'
    const claseInstrumento = clase?.instrumento || ''

    html += `
      <div class="historial-grupo mb-4">
        <div class="historial-grupo-header">
          <div class="d-flex align-items-center gap-2">
            <i class="bi bi-music-note-beamed text-primary"></i>
            <span class="fw-bold">${escapeHTML(claseNombre)}</span>
            ${claseInstrumento ? `<span class="badge bg-primary bg-opacity-10 text-primary border-0 small">${escapeHTML(claseInstrumento)}</span>` : ''}
          </div>
          <span class="text-muted small">${sesiones.length} sesión${sesiones.length !== 1 ? 'es' : ''}</span>
        </div>
        <div class="historial-grupo-body">
          ${sesiones.map((s) => _renderSesionCard(s, clase)).join('')}
        </div>
      </div>
    `
  }
  return html
}

function _renderSesionCard(sesion, clase) {
  const tienePlan = sesion.tiene_plan
  const accentClass = tienePlan ? 'historial-card--planned' : 'historial-card--unplanned'
  const badgeHtml = tienePlan
    ? '<span class="badge bg-success bg-opacity-10 text-success border-0"><i class="bi bi-check-circle me-1"></i>Planificado</span>'
    : '<span class="badge bg-warning bg-opacity-10 text-warning border-0"><i class="bi bi-exclamation-circle me-1"></i>Sin planificar</span>'

  const fechaLabel = _formatFecha(sesion.fecha)
  const horario =
    sesion.hora_inicio && sesion.hora_fin ? `${sesion.hora_inicio} – ${sesion.hora_fin}` : ''

  const asistenciaHtml = sesion.asistencia
    ? `<span class="historial-meta-item"><i class="bi bi-people"></i> P:${sesion.asistencia.presentes} A:${sesion.asistencia.ausentes}</span>`
    : '<span class="historial-meta-item text-muted"><i class="bi bi-people"></i> Sin asistencia</span>'

  const tipoIcon = sesion.tipo === 'emergente' ? '⚡' : '📅'

  return `
    <div class="historial-sesion-card ${accentClass}" data-sesion-id="${sesion.id}">
      <div class="historial-card-timeline-dot"></div>
      <div class="historial-card-content">
        <div class="historial-card-header">
          <div class="d-flex align-items-center gap-2 flex-wrap">
            <span class="historial-fecha">${tipoIcon} ${fechaLabel}</span>
            ${horario ? `<span class="historial-horario">${horario}</span>` : ''}
            ${badgeHtml}
          </div>
        </div>
        <h6 class="historial-card-title">${escapeHTML(sesion.tema || 'Sin tema')}</h6>
        ${sesion.contenido ? `<p class="historial-card-desc">${escapeHTML(sesion.contenido)}</p>` : ''}
        <div class="historial-card-meta">
          ${asistenciaHtml}
          ${sesion.motivo ? `<span class="historial-meta-item"><i class="bi bi-tag"></i> ${escapeHTML(sesion.motivo)}</span>` : ''}
        </div>
        <div class="historial-card-actions">
          ${
            !tienePlan
              ? `<button class="btn btn-sm btn-promover-plan" data-action="promover" data-sesion-id="${sesion.id}" title="Agregar a planificación oficial">
                  <i class="bi bi-journal-plus me-1"></i>Agregar a Plan
                </button>`
              : `<button class="btn btn-sm btn-outline-secondary" data-action="ver-plan" data-sesion-id="${sesion.id}" title="Ver plan asociado">
                  <i class="bi bi-eye me-1"></i>Ver Plan
                </button>`
          }
        </div>
      </div>
    </div>
  `
}

function _renderEmpty() {
  return `
    <div class="text-center py-5 px-3">
      <i class="bi bi-clock-history text-muted d-block mb-3" style="font-size: 3rem; opacity: .4"></i>
      <h5 class="text-muted fw-normal mb-1">No hay sesiones registradas</h5>
      <p class="text-muted small mb-0">
        ${
          panelState.soloSinPlan
            ? 'Todas las sesiones ya están vinculadas a un plan. ¡Buen trabajo!'
            : 'Cuando registres contenidos en tus clases, aparecerán aquí.'
        }
      </p>
    </div>
  `
}

function _attachPanelEvents() {
  const container = panelState.container

  container.querySelector('#historial-filtro-clase')?.addEventListener('change', (e) => {
    panelState.filtroClase = e.target.value
    _renderPanel()
  })

  container.querySelector('#historial-fecha-desde')?.addEventListener('change', (e) => {
    panelState.filtroFechaDesde = e.target.value
    _renderPanel()
  })

  container.querySelector('#historial-fecha-hasta')?.addEventListener('change', (e) => {
    panelState.filtroFechaHasta = e.target.value
    _renderPanel()
  })

  container.querySelector('#historial-toggle-sin-plan input')?.addEventListener('change', (e) => {
    panelState.soloSinPlan = e.target.checked
    _renderPanel()
  })

  // Action buttons
  container.querySelector('#historial-timeline')?.addEventListener('click', (e) => {
    const btn = e.target.closest('button[data-action]')
    if (!btn) return

    const sesionId = btn.dataset.sesionId
    const sesion = panelState.sesionesEnriquecidas.find((s) => s.id === sesionId)
    if (!sesion) return

    if (btn.dataset.action === 'promover' && panelState.onCrearPlan) {
      const clase = panelState.clases.find((c) => c.id === sesion.clase_id)
      panelState.onCrearPlan({
        tema: sesion.tema || '',
        clase_id: sesion.clase_id || '',
        contenido: sesion.contenido || '',
        fecha_inicio: sesion.fecha || '',
        instrumento: clase?.instrumento || '',
      })
    }

    if (btn.dataset.action === 'ver-plan' && sesion.plan_asociado) {
      document.dispatchEvent(
        new CustomEvent('planificacion:focusPlan', {
          detail: { planId: sesion.plan_asociado.id },
        }),
      )
    }
  })
}

function _formatFecha(fechaStr) {
  if (!fechaStr) return '-'
  const fecha = new Date(fechaStr + 'T00:00:00')
  return fecha.toLocaleDateString('es-ES', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}
