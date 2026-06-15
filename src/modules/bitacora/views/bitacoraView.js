import { createBitacoraDashboard } from '../components/BitacoraDashboard.js'
import { openRegistrarContenidoModal } from '../components/RegistrarContenidoModal.js'
import { openHistorialObjetivoModal } from '../components/HistorialObjetivoPanel.js'
import { obtenerAlumnos } from '../../alumnos/api/alumnosApi.js'
import * as bitacoraAdapter from '../api/bitacoraAdapter.js'

const state = {
  claseId: null,
  container: null,
  dashboardEl: null,
  alumnos: [],
  objetivos: [],
  loading: false,
  destroyed: false,
}

function escapeHTML(str) {
  if (!str) return ''
  return String(str).replace(/[&<>"']/g, (m) =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m])
  )
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
  state.container = container
  state.destroyed = false

  if (!state.claseId) {
    renderError(container, 'No se especificó la clase.')
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
}
