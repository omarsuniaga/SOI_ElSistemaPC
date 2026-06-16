import { createBitacoraDashboard } from '../components/BitacoraDashboard.js'
import { openRegistrarContenidoModal } from '../components/RegistrarContenidoModal.js'
import { openHistorialObjetivoModal } from '../components/HistorialObjetivoPanel.js'
import { obtenerAlumnos } from '../../alumnos/api/alumnosApi.js'
import { obtenerClases } from '../../clases/api/clasesApi.js'
import { config } from '../../../core/config/config.js'
import * as bitacoraAdapter from '../api/bitacoraAdapter.js'

const state = {
  claseId: null,
  container: null,
  dashboardEl: null,
  alumnos: [],
  objetivos: [],
  clases: [],
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
}
