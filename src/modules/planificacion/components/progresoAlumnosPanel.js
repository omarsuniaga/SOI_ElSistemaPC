/**
 * progresoAlumnosPanel.js — Panel showing student progress per indicator.
 *
 * Renders a matrix grid: rows = students, columns = indicators.
 * Traffic-light coloring: green (dominado), yellow (en_progreso),
 * red (inicia/no aprobado), gray (sin_evaluar).
 *
 * Click on a cell dispatches 'evaluacion:open' CustomEvent for drill-down.
 * Shows per-alumno and per-indicator summary stats.
 *
 * @module components/progresoAlumnosPanel
 */

import { obtenerEvaluacionesPorClase } from '../services/evaluacionClaseService.js'

const ESTADO_COLOR_MAP = {
  dominado: 'dominado',
  avanzado: 'dominado',
  en_progreso: 'en_progreso',
  inicia: 'inicia',
  sin_evaluar: 'sin_evaluar',
  'no aprobado': 'inicia',
}

const ESTADO_LABEL_MAP = {
  dominado: 'Dominado',
  avanzado: 'Dominado',
  en_progreso: 'En proceso',
  inicia: 'Inicia',
  sin_evaluar: '—',
  'no aprobado': 'No aprobado',
}

/**
 * Render the progress panel into a container.
 *
 * @param {HTMLElement} container - DOM container to render into
 * @param {object} options
 * @param {string} options.claseId - ID of the class
 * @param {Array<object>} options.alumnos - Array of { id, nombre_completo }
 * @param {Array<object>} options.indicadores - Array of { id, description, node_nombre? }
 */
export async function renderProgresoAlumnosPanel(container, { claseId, alumnos = [], indicadores = [] }) {
  container.innerHTML = `
    <div class="d-flex justify-content-center align-items-center py-5">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Cargando progreso...</span>
      </div>
    </div>`

  // Inject styles
  if (!document.getElementById('progress-panel-styles')) {
    const style = document.createElement('style')
    style.id = 'progress-panel-styles'
    style.textContent = _getStyles()
    document.head.appendChild(style)
  }

  try {
    const evaluaciones = await obtenerEvaluacionesPorClase(claseId)
    _renderPanel(container, alumnos, indicadores, evaluaciones, claseId)
  } catch (err) {
    container.innerHTML = `
      <div class="alert alert-warning d-flex align-items-start gap-3 m-3" role="alert">
        <i class="bi bi-exclamation-triangle fs-4 text-warning mt-1"></i>
        <div>
          <h5 class="alert-heading mb-1">Error al cargar progreso</h5>
          <p class="mb-0 small">${esc(err.message)}</p>
        </div>
      </div>`
  }
}

// ── Private ────────────────────────────────────────────────────────────────────

function _renderPanel(container, alumnos, indicadores, evaluaciones, claseId) {
  // Build evaluation lookup: key = "alumnoId:indicatorId"
  const evalMap = new Map()
  for (const ev of evaluaciones) {
    evalMap.set(`${ev.alumno_id}:${ev.indicator_id}`, ev)
  }

  // Compute per-alumno stats
  const alumnoStats = alumnos.map((alumno) => {
    const stats = { total: indicadores.length, dominados: 0, en_progreso: 0, inician: 0, sin_evaluar: 0 }
    for (const ind of indicadores) {
      const ev = evalMap.get(`${alumno.id}:${ind.id}`)
      const estado = ev?.estado || 'sin_evaluar'
      if (estado === 'dominado' || estado === 'avanzado') stats.dominados++
      else if (estado === 'en_progreso') stats.en_progreso++
      else if (estado === 'inicia') stats.inician++
      else stats.sin_evaluar++
    }
    return { ...alumno, stats }
  })

  // Compute per-indicator stats
  const indicadorStats = indicadores.map((ind) => {
    const stats = { total: alumnos.length, dominados: 0, en_progreso: 0, inician: 0, sin_evaluar: 0 }
    for (const alumno of alumnos) {
      const ev = evalMap.get(`${alumno.id}:${ind.id}`)
      const estado = ev?.estado || 'sin_evaluar'
      if (estado === 'dominado' || estado === 'avanzado') stats.dominados++
      else if (estado === 'en_progreso') stats.en_progreso++
      else if (estado === 'inicia') stats.inician++
      else stats.sin_evaluar++
    }
    return { ...ind, stats }
  })

  const matrixHtml = _buildMatrixHtml(alumnoStats, indicadores, evalMap, claseId)
  const alumnoSummaryHtml = _buildAlumnoSummaryHtml(alumnoStats)
  const indicadorSummaryHtml = _buildIndicadorSummaryHtml(indicadorStats)

  container.innerHTML = `
    <div class="progress-panel">
      <div class="progress-panel-header mb-3">
        <h5 class="fw-bold mb-1"><i class="bi bi-grid-3x3 me-2"></i>Progreso de Alumnos</h5>
        <small class="text-muted">${alumnos.length} alumnos · ${indicadores.length} indicadores</small>
      </div>

      <!-- Matrix -->
      <div class="page-glass rounded mb-4 overflow-auto">
        ${matrixHtml}
      </div>

      <!-- Summaries -->
      <div class="row g-3">
        <div class="col-12 col-lg-6">
          <div class="page-glass rounded p-3">
            <h6 class="fw-bold mb-3"><i class="bi bi-person me-1"></i>Resumen por Alumno</h6>
            ${alumnoSummaryHtml}
          </div>
        </div>
        <div class="col-12 col-lg-6">
          <div class="page-glass rounded p-3">
            <h6 class="fw-bold mb-3"><i class="bi bi-bullseye me-1"></i>Resumen por Indicador</h6>
            ${indicadorSummaryHtml}
          </div>
        </div>
      </div>
    </div>
  `

  // Wire cell clicks
  container.querySelectorAll('.progress-cell').forEach((cell) => {
    cell.addEventListener('click', () => {
      const { alumnoId, indicatorId } = cell.dataset
      document.dispatchEvent(
        new CustomEvent('evaluacion:open', {
          detail: { alumnoId, indicatorId, claseId },
        }),
      )
    })
  })
}

function _buildMatrixHtml(alumnoStats, indicadores, evalMap, claseId) {
  if (alumnoStats.length === 0 || indicadores.length === 0) {
    return '<div class="text-center text-muted py-4">Sin datos para mostrar la matriz de progreso.</div>'
  }

  const headerCells = indicadores
    .map(
      (ind) =>
        `<th class="progress-matrix-th" title="${esc(ind.description)}">
          <div class="progress-matrix-ind-name">${esc(ind.description)}</div>
          ${ind.node_nombre ? `<div class="progress-matrix-node-name">${esc(ind.node_nombre)}</div>` : ''}
        </th>`,
    )
    .join('')

  const rows = alumnoStats
    .map((alumno) => {
      const cells = indicadores
        .map((ind) => {
          const ev = evalMap.get(`${alumno.id}:${ind.id}`)
          const estado = ev?.estado || 'sin_evaluar'
          const colorClass = ESTADO_COLOR_MAP[estado] || 'sin_evaluar'
          const label = ESTADO_LABEL_MAP[estado] || estado
          const nota = ev?.nota ? ` (${ev.nota})` : ''
          return `<td class="progress-cell progress-cell--${colorClass}"
                     data-alumno-id="${alumno.id}"
                     data-indicator-id="${ind.id}"
                     title="${esc(alumno.nombre_completo)}: ${label}${nota}"
                     role="button" tabindex="0">
                    <span class="progress-cell-label">${label}${nota}</span>
                  </td>`
        })
        .join('')
      return `
        <tr>
          <td class="progress-matrix-name-cell">${esc(alumno.nombre_completo || alumno.id)}</td>
          ${cells}
        </tr>`
    })
    .join('')

  return `
    <table class="table table-sm table-bordered mb-0 progress-matrix-table">
      <thead class="table-light">
        <tr>
          <th class="progress-matrix-th progress-matrix-name-cell">Alumno</th>
          ${headerCells}
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>`
}

function _buildAlumnoSummaryHtml(alumnoStats) {
  return alumnoStats
    .map((a) => {
      const pct = a.stats.total > 0 ? Math.round((a.stats.dominados / a.stats.total) * 100) : 0
      const barColor = pct >= 70 ? 'bg-success' : pct >= 40 ? 'bg-warning' : 'bg-danger'
      return `
      <div class="alumno-summary-card mb-2">
        <div class="d-flex justify-content-between align-items-center mb-1">
          <span class="fw-semibold small">${esc(a.nombre_completo || a.id)}</span>
          <span class="small text-muted">${pct}% dominado</span>
        </div>
        <div class="progress" style="height: 6px;">
          <div class="progress-bar ${barColor}" role="progressbar" style="width: ${pct}%"></div>
        </div>
        <div class="d-flex gap-2 mt-1">
          <small class="text-success">${a.stats.dominados} dom.</small>
          <small class="text-warning">${a.stats.en_progreso} proc.</small>
          <small class="text-danger">${a.stats.inician} ini.</small>
          <small class="text-muted">${a.stats.sin_evaluar} pend.</small>
        </div>
      </div>`
    })
    .join('')
}

function _buildIndicadorSummaryHtml(indicadorStats) {
  return indicadorStats
    .map((ind) => {
      const pct = ind.stats.total > 0 ? Math.round((ind.stats.dominados / ind.stats.total) * 100) : 0
      const barColor = pct >= 70 ? 'bg-success' : pct >= 40 ? 'bg-warning' : 'bg-danger'
      return `
      <div class="indicador-summary-row mb-2">
        <div class="d-flex justify-content-between align-items-center mb-1">
          <span class="fw-semibold small">${esc(ind.description)}</span>
          <span class="small text-muted">${pct}% dominado</span>
        </div>
        <div class="progress" style="height: 6px;">
          <div class="progress-bar ${barColor}" role="progressbar" style="width: ${pct}%"></div>
        </div>
        <div class="d-flex gap-2 mt-1">
          <small class="text-success">${ind.stats.dominados} dom.</small>
          <small class="text-warning">${ind.stats.en_progreso} proc.</small>
          <small class="text-danger">${ind.stats.inician} ini.</small>
          <small class="text-muted">${ind.stats.sin_evaluar} pend.</small>
        </div>
      </div>`
    })
    .join('')
}

function esc(str) {
  if (!str) return ''
  return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}

function _getStyles() {
  return `
    .progress-matrix-table { font-size: 0.8rem; }
    .progress-matrix-th { text-align: center; white-space: nowrap; vertical-align: bottom; padding: 0.5rem !important; }
    .progress-matrix-ind-name { font-weight: 600; font-size: 0.72rem; }
    .progress-matrix-node-name { font-size: 0.65rem; color: var(--bs-secondary-color, #6c757d); }
    .progress-matrix-name-cell { font-weight: 600; white-space: nowrap; min-width: 140px; }
    .progress-cell { text-align: center; cursor: pointer; transition: transform 0.1s, box-shadow 0.15s; padding: 0.4rem !important; }
    .progress-cell:hover { transform: scale(1.08); box-shadow: 0 2px 8px rgba(0,0,0,0.12); z-index: 1; position: relative; }
    .progress-cell-label { font-size: 0.7rem; font-weight: 500; }
    .progress-cell--dominado { background: #dcfce7; color: #166534; }
    .progress-cell--en_progreso { background: #fef9c3; color: #854d0e; }
    .progress-cell--inicia { background: #fee2e2; color: #991b1b; }
    .progress-cell--sin_evaluar { background: #f3f4f6; color: #6b7280; }
    [data-bs-theme="dark"] .progress-cell--dominado { background: #14532d; color: #86efac; }
    [data-bs-theme="dark"] .progress-cell--en_progreso { background: #713f12; color: #fde047; }
    [data-bs-theme="dark"] .progress-cell--inicia { background: #7f1d1d; color: #fca5a5; }
    [data-bs-theme="dark"] .progress-cell--sin_evaluar { background: #374151; color: #9ca3af; }
    .alumno-summary-card, .indicador-summary-row { padding: 0.5rem; border: 1px solid var(--bs-border-color, #dee2e6); border-radius: 8px; }
  `
}
