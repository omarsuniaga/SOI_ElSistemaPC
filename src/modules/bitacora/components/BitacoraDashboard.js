/**
 * BitacoraDashboard.js — Semáforo grid for content qualification.
 *
 * Shows all objectives for a clase, grouped by category, with a semáforo
 * color indicator per student per objective derived from raw session counts.
 *
 * Props:
 *   claseId      {string}    — required
 *   onRegistrar  {Function}  — callback(objetivoId) → open RegistrarContenidoModal
 *   onVerHistorial {Function} — callback(objetivoId) → open HistorialObjetivoPanel
 *
 * Pattern: mirrors historialContenidosPanel.js — module-level state, render* helpers,
 *          _attachEvents, export async function renderXxx(container, props).
 */

import { getSemaforoPorClase, getContenidosDeClase } from '../api/bitacoraAdapter.js'
import { calcularSemaforo, semaforoClass } from '../utils/semaforo.js'

// ── Module state ─────────────────────────────────────────────────────────────
const state = {
  claseId: null,
  contenidos: [],
  semaforoRows: [],
  container: null,
  onRegistrar: null,
  onVerHistorial: null,
}

// ── Entry point ───────────────────────────────────────────────────────────────

/**
 * Renders the semáforo dashboard inside the given container.
 *
 * @param {HTMLElement} container
 * @param {{ claseId: string, onRegistrar?: Function, onVerHistorial?: Function }} props
 */
export async function renderBitacoraDashboard(container, props = {}) {
  state.container = container
  state.claseId = props.claseId
  state.onRegistrar = props.onRegistrar || null
  state.onVerHistorial = props.onVerHistorial || null

  // Show loading immediately so tests can detect it synchronously
  container.innerHTML = _renderLoading()

  try {
    const [contenidos, semaforoRows] = await Promise.all([
      getContenidosDeClase(state.claseId),
      getSemaforoPorClase(state.claseId),
    ])

    state.contenidos = contenidos
    state.semaforoRows = semaforoRows

    _renderContent()
    _attachEvents()
  } catch (err) {
    console.error('[BitacoraDashboard]', err)
    container.innerHTML = _renderError(err.message)
  }
}

// ── Render helpers ────────────────────────────────────────────────────────────

function _renderLoading() {
  return `
    <div class="d-flex justify-content-center align-items-center" style="min-height: 300px;">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Cargando bitácora...</span>
      </div>
    </div>`
}

function _renderError(msg) {
  return `
    <div class="alert alert-warning d-flex align-items-start gap-3 m-0" role="alert">
      <i class="bi bi-exclamation-triangle fs-3 text-warning mt-1"></i>
      <div>
        <h5 class="alert-heading mb-1">Error al cargar bitácora</h5>
        <p class="mb-0 small">${_escape(msg)}</p>
      </div>
    </div>`
}

function _renderContent() {
  const { contenidos, semaforoRows } = state

  if (contenidos.length === 0) {
    state.container.innerHTML = `
      <div class="text-center py-5 px-3">
        <i class="bi bi-journal-x text-muted d-block mb-3" style="font-size: 3rem; opacity: .4"></i>
        <h5 class="text-muted fw-normal mb-1">Sin objetivos registrados</h5>
        <p class="text-muted small mb-0">Esta clase no tiene contenidos en su ruta académica.</p>
      </div>`
    return
  }

  // Build a lookup: objetivo_id → [semaforoRow]
  const byObjetivo = new Map()
  for (const row of semaforoRows) {
    if (!byObjetivo.has(row.objetivo_id)) byObjetivo.set(row.objetivo_id, [])
    byObjetivo.get(row.objetivo_id).push(row)
  }

  state.container.innerHTML = `
    <div class="bitacora-dashboard">
      <div class="bitacora-header mb-4 d-flex align-items-center gap-3">
        <div class="brand-badge bg-primary bg-opacity-10 text-primary rounded-3 d-flex align-items-center justify-content-center" style="width: 42px; height: 42px;">
          <i class="bi bi-traffic-light fs-4"></i>
        </div>
        <div>
          <h2 class="page-title mb-0" style="font-size: 1.1rem;">Bitácora de Contenidos</h2>
          <p class="text-muted small mb-0">${contenidos.length} objetivo${contenidos.length !== 1 ? 's' : ''} en esta clase</p>
        </div>
      </div>

      <div class="bitacora-objetivos-list">
        ${contenidos.map((obj) => _renderObjetivoRow(obj, byObjetivo.get(obj.id) || [])).join('')}
      </div>
    </div>`
}

function _renderObjetivoRow(objetivo, semaforoRows) {
  // Aggregate counts for this objetivo (all students combined → for summary badge)
  const totalAlumnos = semaforoRows.length
  const verde = semaforoRows.filter(
    (r) => calcularSemaforo(r) === 'verde',
  ).length

  // Per-student dots
  const dots = semaforoRows
    .map((r) => {
      const color = calcularSemaforo(r)
      return `<span class="semaforo-dot ${semaforoClass(color)}" title="Alumno ${_escape(r.alumno_id)}: ${color}"></span>`
    })
    .join('')

  return `
    <div class="bitacora-objetivo-row page-glass rounded p-3 mb-3" data-objetivo-id="${_escape(objetivo.id)}">
      <div class="d-flex align-items-center justify-content-between gap-3 flex-wrap">
        <div class="d-flex align-items-center gap-3 flex-grow-1">
          <span class="text-muted small fw-bold" style="min-width: 2rem;">#${objetivo.orden}</span>
          <div>
            <div class="fw-medium">${_escape(objetivo.descripcion || objetivo.titulo || '')}</div>
            <div class="d-flex gap-1 mt-1 flex-wrap semaforo-dots-container">
              ${dots || '<span class="text-muted small">Sin registros aún</span>'}
            </div>
          </div>
        </div>
        <div class="d-flex align-items-center gap-2">
          ${totalAlumnos > 0 ? `<span class="badge bg-light text-dark border small">${verde}/${totalAlumnos} verde</span>` : ''}
          <button class="btn btn-sm btn-outline-secondary"
                  data-action="ver-historial"
                  data-objetivo-id="${_escape(objetivo.id)}"
                  title="Ver historial">
            <i class="bi bi-clock-history me-1"></i>Historial
          </button>
          <button class="btn btn-sm btn-premium-action"
                  data-action="registrar"
                  data-objetivo-id="${_escape(objetivo.id)}"
                  title="Registrar sesión">
            <i class="bi bi-plus-lg me-1"></i>Registrar
          </button>
        </div>
      </div>
    </div>`
}

// ── Events ────────────────────────────────────────────────────────────────────

function _attachEvents() {
  const container = state.container

  container.querySelector('.bitacora-objetivos-list')?.addEventListener('click', (e) => {
    const btn = e.target.closest('button[data-action]')
    if (!btn) return

    const { action } = btn.dataset
    const objetivoId = btn.dataset.objetivoId

    if (action === 'registrar' && state.onRegistrar) {
      state.onRegistrar(objetivoId)
    }

    if (action === 'ver-historial' && state.onVerHistorial) {
      state.onVerHistorial(objetivoId)
    }
  })
}

// ── Utils ─────────────────────────────────────────────────────────────────────

function _escape(str) {
  if (str == null) return ''
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}
