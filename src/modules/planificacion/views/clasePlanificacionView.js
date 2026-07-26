/**
 * clasePlanificacionView.js — Main view for class planification.
 *
 * Displays:
 * - Route status indicator (assigned / not assigned)
 * - List of linked objectives/indicators
 * - Progress panel toggle
 * - Button to link curriculum route
 * - Button to open evaluation modal per indicator
 *
 * @module views/clasePlanificacionView
 */

import { useClasePlanificacion } from '../hooks/useClasePlanificacion.js'
import { AppToast } from '../../../shared/components/AppToast.js'

const hook = useClasePlanificacion()

/**
 * Render the class planification view into a container.
 *
 * @param {HTMLElement} container - DOM container to render into
 */
export function renderClasePlanificacionView(container) {
  if (!container) return

  // Subscribe to hook state changes
  const unsub = hook.subscribe(() => _render(container))

  // Initial render
  _render(container)

  // Fetch initial data
  hook.fetchRutaDeClase('').catch(() => {})

  // Cleanup on navigation (best-effort)
  return () => unsub()
}

// ── Private ────────────────────────────────────────────────────────────────────

function _render(container) {
  if (hook.cargando && !hook.rutaAsignada && hook.objetivos.length === 0) {
    container.innerHTML = `
      <div class="clase-plan-view">
        <div class="d-flex justify-content-center align-items-center py-5">
          <div class="spinner-border text-primary" role="status">
            <span class="visually-hidden">Cargando...</span>
          </div>
        </div>
      </div>`
    return
  }

  if (hook.error && !hook.rutaAsignada) {
    container.innerHTML = `
      <div class="clase-plan-view">
        <div class="alert alert-warning d-flex align-items-start gap-3 m-3" role="alert">
          <i class="bi bi-exclamation-triangle fs-4 text-warning mt-1"></i>
          <div>
            <h5 class="alert-heading mb-1">Error al cargar planificación</h5>
            <p class="mb-0 small">${esc(hook.error)}</p>
          </div>
        </div>
      </div>`
    return
  }

  const ruta = hook.rutaAsignada
  const objetivos = hook.objetivos || []

  container.innerHTML = `
    <div class="clase-plan-view">
      <div class="d-flex align-items-center gap-3 mb-4">
        <div class="brand-badge bg-primary bg-opacity-10 text-primary rounded-3 d-flex align-items-center justify-content-center" style="width: 42px; height: 42px;">
          <i class="bi bi-journal-check fs-4"></i>
        </div>
        <div>
          <h4 class="fw-bold mb-0">Planificación de Clase</h4>
          <p class="text-muted small mb-0">Vinculá indicadores curriculares y evaluá el progreso de tus alumnos</p>
        </div>
      </div>

      <!-- Route Status Card -->
      ${ruta ? _renderRouteCard(ruta) : _renderNoRouteCard()}

      <!-- Objectives List -->
      ${ruta ? _renderObjectivesSection(objetivos) : ''}

      <!-- Progress Panel Placeholder -->
      <div id="clase-plan-progreso-container" class="mt-4"></div>
    </div>
  `

  _attachEvents(container)
}

function _renderRouteCard(ruta) {
  const estadoLabel = ruta.estado === 'activo' ? 'Activa' : ruta.estado === 'borrador' ? 'Borrador' : 'Archivada'
  const estadoColor = ruta.estado === 'activo' ? 'success' : ruta.estado === 'borrador' ? 'warning' : 'secondary'

  return `
    <div class="page-glass rounded p-3 mb-4">
      <div class="d-flex justify-content-between align-items-center">
        <div class="d-flex align-items-center gap-2">
          <i class="bi bi-diagram-3 text-${estadoColor}"></i>
          <div>
            <div class="fw-bold small">Ruta Asignada</div>
            <small class="text-muted">ID: ${esc(ruta.route_version_id || ruta.id)}</small>
          </div>
        </div>
        <span class="badge bg-${estadoColor} bg-opacity-10 text-${estadoColor}">${estadoLabel}</span>
      </div>
    </div>`
}

function _renderNoRouteCard() {
  return `
    <div class="page-glass rounded p-4 mb-4 text-center">
      <i class="bi bi-diagram-3 d-block mb-2" style="font-size: 2rem; opacity: 0.3;"></i>
      <h6 class="text-muted mb-1">Sin ruta curricular asignada</h6>
      <p class="text-muted small mb-3">Asigná una ruta desde ACM para vincular indicadores a tus planificaciones.</p>
    </div>`
}

function _renderObjectivesSection(objetivos) {
  if (objetivos.length === 0) {
    return `
      <div class="page-glass rounded p-3 mb-4">
        <div class="fw-bold small mb-2"><i class="bi bi-list-check me-1"></i>Objetivos Vinculados</div>
        <div class="text-muted small text-center py-2">No hay indicadores vinculados aún.</div>
      </div>`
  }

  const rows = objetivos
    .map((obj) => {
      const estadoBadge = obj.estado === 'completado'
        ? '<span class="badge bg-success bg-opacity-10 text-success">Completado</span>'
        : obj.estado === 'en_progreso'
          ? '<span class="badge bg-warning bg-opacity-10 text-warning">En proceso</span>'
          : '<span class="badge bg-secondary bg-opacity-10 text-secondary">Pendiente</span>'

      return `
      <div class="d-flex justify-content-between align-items-center py-2 border-bottom">
        <div class="d-flex align-items-center gap-2">
          <i class="bi bi-bullseye text-primary small"></i>
          <span class="small">${esc(obj.indicator_description || obj.indicator_id)}</span>
        </div>
        <div class="d-flex align-items-center gap-2">
          ${estadoBadge}
          <button class="btn btn-sm btn-outline-primary" data-action="evaluar" data-indicator-id="${obj.indicator_id}" title="Evaluar">
            <i class="bi bi-clipboard-check"></i>
          </button>
        </div>
      </div>`
    })
    .join('')

  return `
    <div class="page-glass rounded p-3 mb-4">
      <div class="fw-bold small mb-2"><i class="bi bi-list-check me-1"></i>Objetivos Vinculados (${objetivos.length})</div>
      ${rows}
    </div>`
}

function _attachEvents(container) {
  container.querySelectorAll('[data-action="evaluar"]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const indicatorId = btn.dataset.indicatorId
      document.dispatchEvent(
        new CustomEvent('evaluacion:open', {
          detail: { indicatorId },
        }),
      )
    })
  })
}

function esc(str) {
  if (!str) return ''
  return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}
