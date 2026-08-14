import { createBitacoraDashboard } from '../components/BitacoraDashboard.js'
import { openRegistrarContenidoModal } from '../components/RegistrarContenidoModal.js'
import { openHistorialObjetivoModal } from '../components/HistorialObjetivoPanel.js'
import { obtenerAlumnos } from '../../alumnos/api/alumnosApi.js'
import { obtenerClases } from '../../clases/api/clasesApi.js'
import { obtenerMaestros } from '../../maestros/api/maestrosApi.js'
import { config } from '../../../core/config/config.js'
import * as bitacoraAdapter from '../api/bitacoraAdapter.js'
import { escapeHTML } from '../../../shared/utils/sanitize.js'

const state = {
  claseId: null,
  container: null,
  dashboardEl: null,
  alumnos: [],
  objetivos: [],
  clases: [],
  maestros: [],
  auditLogs: [],
  auditClaseId: '',
  auditAction: '',
  mode: 'clase',
  loading: false,
  destroyed: false,
}


function renderLoading(container) {
  container.innerHTML = `
    <div class="page-container">
      <div class="d-flex justify-content-center align-items-center" style="min-height:400px">
        <div class="spinner-border text-primary" role="status">
          <span class="visually-hidden">Cargando bitácora...</span>
        </div>
      </div>
    </div>`
}

function renderClassSelector(container, clases) {
  container.innerHTML = `
    <div class="page-container">
      <div class="d-flex align-items-center gap-3 mb-4">
        <div class="rounded-3 bg-success bg-opacity-10 text-success d-flex align-items-center justify-content-center"
          style="width:42px;height:42px">
          <i class="bi bi-journal-check fs-4"></i>
        </div>
        <div>
          <h1 class="page-title mb-0">Bitácora de Contenidos</h1>
          <p class="text-muted small mb-0">Seleccioná una clase para ver su semáforo</p>
        </div>
      </div>
      <div class="card">
        <div class="card-body">
          <div class="mb-3">
            <label for="clase-selector" class="form-label fw-semibold">Clase</label>
            <select id="clase-selector" class="form-select form-select-lg">
              <option value="">— Seleccioná una clase —</option>
              ${clases
                .map(
                  (c) =>
                    `<option value="${escapeHTML(c.id)}">${escapeHTML(c.nombre)} (${escapeHTML(c.instrumento || '')})</option>`,
                )
                .join('')}
            </select>
          </div>
          <button id="btn-ir-bitacora" class="btn btn-success" disabled>
            <i class="bi bi-eye me-1"></i>Ver Bitácora
          </button>
        </div>
      </div>
    </div>`

  const select = container.querySelector('#clase-selector')
  const btn = container.querySelector('#btn-ir-bitacora')

  select.addEventListener('change', () => {
    btn.disabled = !select.value
  })

  btn.addEventListener('click', () => {
    if (select.value) {
      window.router.navigate('bitacora-clase', { claseId: select.value })
    }
  })
}

async function obtenerClasesConFallback() {
  try {
    // Intentar con la API real/mock de clases
    const clases = await obtenerClases()
    if (Array.isArray(clases) && clases.length > 0) return clases
  } catch (_e) {
    // Fallback: cargar mock JSON directamente
  }
  try {
    const { default: mockData } = await import('../../../assets/data/mocks/clases.json')
    return (mockData?.clases || []).map((c) => ({
      id: c.id,
      nombre: c.nombre,
      instrumento: c.instrumento,
      grado: c.grado,
    }))
  } catch (_e2) {
    return []
  }
}

function renderError(container, msg) {
  container.innerHTML = `
    <div class="page-container">
      <div class="alert alert-warning d-flex align-items-start gap-3" role="alert">
        <i class="bi bi-database-exclamation fs-3 text-warning mt-1"></i>
        <div>
          <h5 class="alert-heading mb-1">Error al cargar la bitácora</h5>
          <p class="mb-0 small">${escapeHTML(msg)}</p>
        </div>
      </div>
    </div>`
}

function getClaseNombre(clases, claseId) {
  if (!claseId) return '—'
  const clase = clases?.find((item) => String(item.id) === String(claseId))
  return clase?.nombre || clase?.clase_nombre || claseId
}

function getMaestroNombre(maestros, maestroId) {
  if (!maestroId) return '—'
  const maestro = maestros?.find((item) => String(item.id) === String(maestroId))
  return maestro?.nombre_completo || maestro?.nombre || maestro?.email || maestroId
}

function formatTimestamp(value) {
  if (!value) return '—'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return String(value)
  return new Intl.DateTimeFormat('es-DO', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date)
}

function renderAuditContent(container) {
  container.innerHTML = `
    <div class="page-container">
      <div class="d-flex align-items-center gap-3 mb-4">
        <div class="rounded-3 bg-warning bg-opacity-10 text-warning d-flex align-items-center justify-content-center"
          style="width:42px;height:42px">
          <i class="bi bi-clipboard2-data fs-4"></i>
        </div>
        <div>
          <h1 class="page-title mb-0">Auditoría de Suplentes</h1>
          <p class="text-muted small mb-0">Seguimiento de asistencia, contenido y asignaciones</p>
        </div>
        <button class="btn btn-outline-secondary btn-sm ms-auto" id="btn-refresh-audit">
          <i class="bi bi-arrow-clockwise me-1"></i>Actualizar
        </button>
      </div>

      <div class="card mb-3">
        <div class="card-body">
          <div class="row g-3 align-items-end">
            <div class="col-12 col-md-5">
              <label class="form-label fw-semibold" for="audit-clase-filter">Clase</label>
              <select id="audit-clase-filter" class="form-select">
                <option value="">Todas las clases</option>
                ${state.clases
                  .map(
                    (c) =>
                      `<option value="${escapeHTML(c.id)}"${String(state.auditClaseId) === String(c.id) ? ' selected' : ''}>${escapeHTML(c.nombre || c.clase_nombre || c.id)}</option>`,
                  )
                  .join('')}
              </select>
            </div>
            <div class="col-12 col-md-4">
              <label class="form-label fw-semibold" for="audit-action-filter">Acción</label>
              <select id="audit-action-filter" class="form-select">
                <option value="">Todas las acciones</option>
                ${['SUBSTITUTE_ASSIGN', 'SUBSTITUTE_REMOVE', 'SUBSTITUTE_ATTENDANCE', 'SUBSTITUTE_CONTENT']
                  .map(
                    (action) =>
                      `<option value="${action}"${state.auditAction === action ? ' selected' : ''}>${action}</option>`,
                  )
                  .join('')}
              </select>
            </div>
            <div class="col-12 col-md-3 d-flex gap-2">
              <button id="btn-apply-audit-filters" class="btn btn-warning flex-fill">
                <i class="bi bi-funnel me-1"></i>Filtrar
              </button>
              <button id="btn-clear-audit-filters" class="btn btn-outline-secondary">
                Limpiar
              </button>
            </div>
          </div>
        </div>
      </div>

      <div id="audit-dashboard-container"></div>
    </div>`
}

async function mountAuditDashboard() {
  const container = state.container?.querySelector('#audit-dashboard-container')
  if (!container) return

  container.innerHTML = `
    <div class="d-flex justify-content-center py-4">
      <div class="spinner-border text-warning" role="status">
        <span class="visually-hidden">Cargando auditoría...</span>
      </div>
    </div>`

  try {
    const logs = await bitacoraAdapter.getAuditoriaSuplentes({
      claseId: state.auditClaseId || null,
      action: state.auditAction || null,
      limit: 200,
    })

    state.auditLogs = Array.isArray(logs) ? logs : []

    if (!state.auditLogs.length) {
      container.innerHTML = `
        <div class="text-center py-5">
          <i class="bi bi-journal-text d-block mb-3" style="font-size:2.5rem;opacity:.3"></i>
          <p class="text-muted mb-0">No hay eventos de suplentes para los filtros actuales.</p>
        </div>`
      return
    }

    container.innerHTML = `
      <div class="table-responsive">
        <table class="table table-sm table-hover align-middle">
          <thead class="table-light">
            <tr>
              <th>Fecha</th>
              <th>Acción</th>
              <th>Clase</th>
              <th>Titular</th>
              <th>Suplente</th>
              <th>Detalle</th>
              <th>Actor</th>
            </tr>
          </thead>
          <tbody>
            ${state.auditLogs
              .map((log) => {
                const changes = log.changes || {}
                return `
                  <tr>
                    <td class="text-nowrap">${escapeHTML(formatTimestamp(log.timestamp))}</td>
                    <td><span class="badge text-bg-warning">${escapeHTML(log.action || '—')}</span></td>
                    <td>${escapeHTML(getClaseNombre(state.clases, log.entity_id || changes.class_id))}</td>
                    <td>${escapeHTML(getMaestroNombre(state.maestros, changes.maestro_titular_id))}</td>
                    <td>${escapeHTML(getMaestroNombre(state.maestros, changes.maestro_suplente_id))}</td>
                    <td>
                      <div class="small text-muted">${escapeHTML(changes.summary || log.metadata?.summary || '—')}</div>
                      ${changes.sesion_id ? `<div class="small">Sesión: ${escapeHTML(changes.sesion_id)}</div>` : ''}
                      ${changes.fecha ? `<div class="small">Fecha: ${escapeHTML(changes.fecha)}</div>` : ''}
                    </td>
                    <td>${escapeHTML(getMaestroNombre(state.maestros, log.user_id))}</td>
                  </tr>`
              })
              .join('')}
          </tbody>
        </table>
      </div>`
  } catch (error) {
    container.innerHTML = `
      <div class="alert alert-danger mb-0">
        <i class="bi bi-exclamation-triangle me-2"></i>${escapeHTML(error.message)}
      </div>`
  }
}

function renderContent(container) {
  const headerHtml = `
    <div class="page-container">
      <div class="d-flex align-items-center gap-3 mb-4">
        <div class="rounded-3 bg-success bg-opacity-10 text-success d-flex align-items-center justify-content-center"
          style="width:42px;height:42px">
          <i class="bi bi-journal-check fs-4"></i>
        </div>
        <div>
          <h1 class="page-title mb-0">Bitácora de Contenidos</h1>
          <p class="text-muted small mb-0">Seguimiento de objetivos por alumno</p>
        </div>
        <button class="btn btn-outline-secondary btn-sm ms-auto" id="btn-refresh-bitacora">
          <i class="bi bi-arrow-clockwise me-1"></i>Actualizar
        </button>
      </div>
      <div id="bitacora-dashboard-container"></div>
    </div>`

  container.innerHTML = headerHtml
  state.container = container
}

async function mountDashboard() {
  const container = state.container?.querySelector('#bitacora-dashboard-container')
  if (!container) return

  container.innerHTML = `
    <div class="d-flex justify-content-center py-4">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Cargando...</span>
      </div>
    </div>`

  try {
    const dashboard = await createBitacoraDashboard(state.claseId, state.alumnos)
    container.innerHTML = ''
    container.appendChild(dashboard)
    state.dashboardEl = dashboard
  } catch (error) {
    container.innerHTML = `
      <div class="alert alert-danger mb-0">
        <i class="bi bi-exclamation-triangle me-2"></i>${escapeHTML(error.message)}
      </div>`
  }
}

function attachEvents() {
  const container = state.container
  if (!container) return

  container.addEventListener('click', (e) => {
    const refreshBtn = e.target.closest('#btn-refresh-bitacora')
    if (refreshBtn) {
      mountDashboard()
    }
    const refreshAuditBtn = e.target.closest('#btn-refresh-audit')
    if (refreshAuditBtn) {
      mountAuditDashboard()
    }
    const applyAuditBtn = e.target.closest('#btn-apply-audit-filters')
    if (applyAuditBtn) {
      const claseFilter = container.querySelector('#audit-clase-filter')
      const actionFilter = container.querySelector('#audit-action-filter')
      state.auditClaseId = claseFilter?.value || ''
      state.auditAction = actionFilter?.value || ''
      mountAuditDashboard()
    }
    const clearAuditBtn = e.target.closest('#btn-clear-audit-filters')
    if (clearAuditBtn) {
      const claseFilter = container.querySelector('#audit-clase-filter')
      const actionFilter = container.querySelector('#audit-action-filter')
      if (claseFilter) claseFilter.value = ''
      if (actionFilter) actionFilter.value = ''
      state.auditClaseId = ''
      state.auditAction = ''
      mountAuditDashboard()
    }
  })

  container.addEventListener('registrar-contenido', (e) => {
    if (state.destroyed) return
    const { objetivoId } = e.detail || {}
    if (!objetivoId) return

    const objetivo = state.objetivos.find((o) => o.id === objetivoId)
    const objetivoTitulo = objetivo?.titulo || objetivo?.descripcion || 'Objetivo'

    openRegistrarContenidoModal({
      claseId: state.claseId,
      objetivoId,
      objetivoTitulo,
      alumnos: state.alumnos,
      onSave: () => mountDashboard(),
    })
  })

  container.addEventListener('ver-historial', (e) => {
    if (state.destroyed) return
    const { objetivoId } = e.detail || {}
    if (!objetivoId) return

    const objetivo = state.objetivos.find((o) => o.id === objetivoId)
    const objetivoTitulo = objetivo?.titulo || objetivo?.descripcion || 'Historial'

    openHistorialObjetivoModal({
      claseId: state.claseId,
      objetivoId,
      objetivoTitulo,
      alumnos: state.alumnos,
    })
  })
}

export async function renderBitacoraView(container, params = {}) {
  if (!container) return

  state.claseId = params.claseId || params.id
  state.mode = params.mode || 'clase'
  state.container = container
  state.destroyed = false

  if (state.mode === 'suplentes') {
    try {
      state.loading = true
      renderLoading(container)
      const [clases, maestros, auditLogs] = await Promise.all([
        obtenerClases(),
        obtenerMaestros(),
        bitacoraAdapter.getAuditoriaSuplentes({
          claseId: params.claseId || null,
          action: params.action || null,
          limit: 200,
        }),
      ])
      state.clases = Array.isArray(clases) ? clases : []
      state.maestros = Array.isArray(maestros) ? maestros : []
      state.auditLogs = Array.isArray(auditLogs) ? auditLogs : []
      state.auditClaseId = params.claseId || ''
      state.auditAction = params.action || ''
      state.loading = false

      if (state.destroyed) return
      renderAuditContent(container)
      attachEvents()
      await mountAuditDashboard()
    } catch (error) {
      if (state.destroyed) return
      renderError(container, error.message)
    }
    return
  }

  if (!state.claseId) {
    // Sin clase: mostrar selector para elegir una
    try {
      state.loading = true
      renderLoading(container)
      const clases = await obtenerClasesConFallback()
      state.clases = Array.isArray(clases) ? clases : []
      state.loading = false
      if (state.destroyed) return
      if (state.clases.length === 0) {
        renderError(container, 'No hay clases disponibles.')
        return
      }
      renderClassSelector(container, state.clases)
    } catch (error) {
      if (state.destroyed) return
      renderError(container, error.message)
    }
    return
  }

  try {
    state.loading = true
    renderLoading(container)

    const [alumnos, objetivos] = await Promise.all([
      obtenerAlumnos(),
      bitacoraAdapter.getObjetivosClase(state.claseId),
    ])

    state.alumnos = Array.isArray(alumnos) ? alumnos : []
    state.objetivos = Array.isArray(objetivos) ? objetivos : []
    state.loading = false

    if (state.destroyed) return

    renderContent(container)
    attachEvents()
    await mountDashboard()
  } catch (error) {
    console.error('[bitacoraView]', error)
    if (state.destroyed) return
    renderError(container, error.message)
  }
}

export function destroyBitacoraView() {
  state.destroyed = true
  state.dashboardEl = null
  state.container = null
  state.alumnos = []
  state.objetivos = []
  state.clases = []
  state.maestros = []
  state.auditLogs = []
  state.auditClaseId = ''
  state.auditAction = ''
  state.mode = 'clase'
}
