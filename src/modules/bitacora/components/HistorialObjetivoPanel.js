/**
 * HistorialObjetivoPanel.js — Read-only history panel for one objective.
 *
 * Shows:
 *   - Chronological list of sessions (fecha, per-student nota_cualitativa)
 *   - Per-student summary (how many times seen and at what notes)
 *   - Observaciones when present
 *
 * Props:
 *   claseId    {string}
 *   objetivoId {string}
 *   titulo     {string}  — optional heading override
 *
 * Pattern: mirrors historialContenidosPanel.js — module-level state, render helpers.
 */

import { getHistorialContenido } from '../api/bitacoraAdapter.js'

// ── Module state ─────────────────────────────────────────────────────────────
const state = {
  container: null,
  claseId: null,
  objetivoId: null,
  titulo: '',
  rows: [],
}

// ── Entry point ───────────────────────────────────────────────────────────────

/**
 * @param {HTMLElement} container
 * @param {{ claseId: string, objetivoId: string, titulo?: string }} props
 */
export async function renderHistorialObjetivoPanel(container, props = {}) {
  state.container = container
  state.claseId = props.claseId
  state.objetivoId = props.objetivoId
  state.titulo = props.titulo || 'Historial de Objetivo'

  // Show loading synchronously so tests can detect it before awaiting
  container.innerHTML = _renderLoading()

  try {
    const rows = await getHistorialContenido(state.claseId, state.objetivoId)
    state.rows = rows
    _renderContent()
  } catch (err) {
    console.error('[HistorialObjetivoPanel]', err)
    container.innerHTML = _renderError(err.message)
  }
}

// ── Render helpers ────────────────────────────────────────────────────────────

function _renderLoading() {
  return `
    <div class="d-flex justify-content-center align-items-center" style="min-height: 200px;">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Cargando historial...</span>
      </div>
    </div>`
}

function _renderError(msg) {
  return `
    <div class="alert alert-warning d-flex align-items-start gap-3 m-0" role="alert">
      <i class="bi bi-exclamation-triangle fs-3 text-warning mt-1"></i>
      <div>
        <h5 class="alert-heading mb-1">Error al cargar historial</h5>
        <p class="mb-0 small">${_escape(msg)}</p>
      </div>
    </div>`
}

function _renderContent() {
  const { rows } = state

  if (rows.length === 0) {
    state.container.innerHTML = `
      <div class="text-center py-4 px-3">
        <i class="bi bi-clock-history text-muted d-block mb-3" style="font-size: 2.5rem; opacity: .4"></i>
        <h5 class="text-muted fw-normal mb-1">Sin historial aún</h5>
        <p class="text-muted small mb-0">No hay sesiones registradas para este objetivo.</p>
      </div>`
    return
  }

  // Group rows by fecha
  const byFecha = new Map()
  for (const row of rows) {
    if (!byFecha.has(row.fecha)) byFecha.set(row.fecha, [])
    byFecha.get(row.fecha).push(row)
  }

  // Build per-student summary
  const alumnoSummary = new Map()
  for (const row of rows) {
    if (!alumnoSummary.has(row.alumno_id)) {
      alumnoSummary.set(row.alumno_id, { bien: 0, regular: 0, mal: 0, total: 0 })
    }
    const s = alumnoSummary.get(row.alumno_id)
    s.total++
    if (row.nota_cualitativa === 'bien') s.bien++
    else if (row.nota_cualitativa === 'regular') s.regular++
    else if (row.nota_cualitativa === 'mal') s.mal++
  }

  state.container.innerHTML = `
    <div class="historial-objetivo-panel">
      <div class="d-flex align-items-center gap-2 mb-3">
        <i class="bi bi-clock-history text-primary fs-5"></i>
        <h5 class="mb-0 fw-bold">${_escape(state.titulo)}</h5>
      </div>

      <!-- Student summary -->
      <div class="historial-student-summary mb-4">
        <div class="small text-muted text-uppercase fw-bold mb-2">Resumen por alumno</div>
        <div class="row g-2">
          ${Array.from(alumnoSummary.entries())
            .map(([alumnoId, s]) => _renderStudentSummaryCard(alumnoId, s))
            .join('')}
        </div>
      </div>

      <!-- Timeline by fecha -->
      <div class="small text-muted text-uppercase fw-bold mb-2">Sesiones</div>
      <div class="historial-timeline">
        ${Array.from(byFecha.entries())
          .map(([fecha, fechaRows]) => _renderFechaGroup(fecha, fechaRows))
          .join('')}
      </div>
    </div>`
}

function _renderStudentSummaryCard(alumnoId, summary) {
  const total = summary.total
  const bienPct = total > 0 ? Math.round((summary.bien / total) * 100) : 0

  return `
    <div class="col-md-4 col-6">
      <div class="page-glass rounded p-2 small">
        <div class="fw-medium text-truncate mb-1" title="${_escape(alumnoId)}">${_escape(alumnoId)}</div>
        <div class="d-flex gap-2 flex-wrap">
          <span class="badge bg-success bg-opacity-15 text-success border-0">${summary.bien} bien</span>
          <span class="badge bg-warning bg-opacity-15 text-warning border-0">${summary.regular} regular</span>
          <span class="badge bg-danger bg-opacity-15 text-danger border-0">${summary.mal} mal</span>
        </div>
        <div class="progress mt-2" style="height: 4px;" title="${bienPct}% bien">
          <div class="progress-bar bg-success" style="width: ${bienPct}%"></div>
        </div>
      </div>
    </div>`
}

function _renderFechaGroup(fecha, rows) {
  return `
    <div class="historial-fecha-grupo mb-3">
      <div class="d-flex align-items-center gap-2 mb-2">
        <span class="badge bg-light text-dark border">
          <i class="bi bi-calendar3 me-1"></i>${_escape(fecha)}
        </span>
        <span class="text-muted small">${rows.length} alumno${rows.length !== 1 ? 's' : ''}</span>
      </div>
      <div class="page-glass rounded p-2">
        ${rows.map((r) => _renderNoteRow(r)).join('')}
      </div>
    </div>`
}

function _renderNoteRow(row) {
  const badgeCls =
    row.nota_cualitativa === 'bien'
      ? 'bg-success bg-opacity-15 text-success'
      : row.nota_cualitativa === 'mal'
        ? 'bg-danger bg-opacity-15 text-danger'
        : 'bg-warning bg-opacity-15 text-warning'

  return `
    <div class="d-flex align-items-center gap-2 py-1 border-bottom historial-nota-row">
      <span class="small text-muted flex-grow-1">${_escape(row.alumno_id)}</span>
      <span class="badge border-0 ${badgeCls}">${_escape(row.nota_cualitativa)}</span>
      ${row.observacion ? `<span class="small text-muted fst-italic">${_escape(row.observacion)}</span>` : ''}
    </div>`
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
