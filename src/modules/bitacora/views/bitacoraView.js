/**
 * bitacoraView.js — Main view for the Bitácora module.
 *
 * Mounts BitacoraDashboard, wires RegistrarContenidoModal and
 * HistorialObjetivoPanel into the page. Receives claseId as a URL param.
 *
 * Pattern: mirrors planificacionView.js — module-level state, renderXxxView
 * export, _attachEvents, _renderLoading/_renderError helpers.
 */

import { renderBitacoraDashboard } from '../components/BitacoraDashboard.js'
import { renderRegistrarContenidoModal } from '../components/RegistrarContenidoModal.js'
import { renderHistorialObjetivoPanel } from '../components/HistorialObjetivoPanel.js'
import { getContenidosDeClase, getAlumnosByClase } from '../api/bitacoraAdapter.js'

// ── Module state ─────────────────────────────────────────────────────────────
const state = {
  claseId: null,
  container: null,
  contenidos: [],
  // We don't store alumnos here — they come from the app context if available,
  // otherwise we pass an empty array and let the modal handle no-alumno state.
  alumnos: [],
}

// ── Entry point ───────────────────────────────────────────────────────────────

/**
 * @param {HTMLElement} container
 * @param {{ claseId?: string, alumnos?: Array<{id, nombre_completo}> }} props
 */
export async function renderBitacoraView(container, props = {}) {
  if (!container) return

  state.container = container
  state.claseId = props.claseId || null
  state.alumnos = props.alumnos || []

  if (!state.claseId) {
    container.innerHTML = `
      <div class="page-container">
        <div class="alert alert-warning" role="alert">
          <i class="bi bi-exclamation-triangle me-2"></i>
          No se especificó una clase. Navegá desde el panel principal.
        </div>
      </div>`
    return
  }

  _renderShell()

  // Render the dashboard in the main panel
  const dashboardPanel = container.querySelector('#bitacora-dashboard-panel')
  if (dashboardPanel) {
    await renderBitacoraDashboard(dashboardPanel, {
      claseId: state.claseId,
      onRegistrar: (objetivoId) => _openRegistrarModal(objetivoId),
      onVerHistorial: (objetivoId) => _openHistorialPanel(objetivoId),
    })
  }

  // Pre-load contenidos and alumnos so modal can label the objetivo and list students
  try {
    ;[state.contenidos, state.alumnos] = await Promise.all([
      getContenidosDeClase(state.claseId),
      getAlumnosByClase(state.claseId),
    ])
  } catch {
    state.contenidos = []
    state.alumnos = []
  }
}

// ── Shell ─────────────────────────────────────────────────────────────────────

function _renderShell() {
  state.container.innerHTML = `
    <div class="page-container bitacora-view">
      <!-- View header -->
      <div class="planificacion-header-premium mb-4">
        <div class="d-flex align-items-center gap-3">
          <div class="brand-badge bg-primary bg-opacity-10 text-primary rounded-3 d-flex align-items-center justify-content-center" style="width: 42px; height: 42px;">
            <i class="bi bi-traffic-light fs-4"></i>
          </div>
          <div>
            <h1 class="page-title mb-0">Bitácora de Contenidos</h1>
            <p class="text-muted small mb-0">Seguimiento cualitativo por objetivo</p>
          </div>
        </div>
      </div>

      <!-- Dashboard panel -->
      <div id="bitacora-dashboard-panel"></div>

      <!-- Side panel overlay for modal / historial -->
      <div id="bitacora-side-panel" class="bitacora-side-panel" style="display:none;"></div>
    </div>`
}

// ── Modal / Panel helpers ─────────────────────────────────────────────────────

function _openRegistrarModal(objetivoId) {
  const objetivo = state.contenidos.find((o) => o.id === objetivoId)
  const sidePanel = state.container?.querySelector('#bitacora-side-panel')
  if (!sidePanel) return

  sidePanel.style.display = 'block'
  sidePanel.innerHTML = `
    <div class="bitacora-side-panel-inner page-glass rounded p-4">
      <div id="modal-slot"></div>
    </div>`

  const slot = sidePanel.querySelector('#modal-slot')
  renderRegistrarContenidoModal(slot, {
    claseId: state.claseId,
    objetivoId,
    objetivoDescripcion: objetivo?.descripcion || objetivo?.titulo || objetivoId,
    alumnos: state.alumnos,
    onSaved: async () => {
      sidePanel.style.display = 'none'
      // Reload dashboard
      const dashboardPanel = state.container?.querySelector('#bitacora-dashboard-panel')
      if (dashboardPanel) {
        await renderBitacoraDashboard(dashboardPanel, {
          claseId: state.claseId,
          onRegistrar: (id) => _openRegistrarModal(id),
          onVerHistorial: (id) => _openHistorialPanel(id),
        })
      }
    },
    onCancel: () => {
      sidePanel.style.display = 'none'
    },
  })
}

function _openHistorialPanel(objetivoId) {
  const objetivo = state.contenidos.find((o) => o.id === objetivoId)
  const sidePanel = state.container?.querySelector('#bitacora-side-panel')
  if (!sidePanel) return

  sidePanel.style.display = 'block'
  sidePanel.innerHTML = `
    <div class="bitacora-side-panel-inner page-glass rounded p-4">
      <div class="d-flex justify-content-end mb-2">
        <button class="btn btn-sm btn-outline-secondary" id="btn-close-historial">
          <i class="bi bi-x-lg"></i> Cerrar
        </button>
      </div>
      <div id="historial-slot"></div>
    </div>`

  sidePanel.querySelector('#btn-close-historial')?.addEventListener('click', () => {
    sidePanel.style.display = 'none'
  })

  const slot = sidePanel.querySelector('#historial-slot')
  renderHistorialObjetivoPanel(slot, {
    claseId: state.claseId,
    objetivoId,
    titulo: objetivo?.descripcion || objetivo?.titulo || 'Historial',
  })
}
