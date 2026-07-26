/**
 * evaluacionClaseModal.js — Modal for evaluating students on curriculum indicators.
 *
 * Renders a Bootstrap 5 modal with:
 * - Student selector dropdown
 * - Per-indicator rows with estado dropdown, nota input, observaciones textarea
 * - Evidencia field (URL video/audio)
 * - Save button that calls registrarEvaluacion for each modified indicator
 *
 * @module components/evaluacionClaseModal
 */

import { registrarEvaluacion } from '../services/evaluacionClaseService.js'

const ESTADOS_EVALUACION = [
  { value: 'sin_evaluar', label: 'Sin evaluar' },
  { value: 'inicia', label: 'No iniciado' },
  { value: 'en_progreso', label: 'En proceso' },
  { value: 'avanzado', label: 'Dominado' },
  { value: 'dominado', label: 'Sobresaliente' },
]

// The spec uses different labels than the DB values. Map spec labels to DB values.
const ESTADO_SPEC_MAP = {
  sin_evaluar: 'sin_evaluar',
  'no iniciado': 'sin_evaluar',
  inicia: 'inicia',
  'en proceso': 'en_progreso',
  en_progreso: 'en_progreso',
  dominado: 'dominado',
  'requiere refuerzo': 'en_progreso',
  'no aprobado': 'inicia',
  sobresaliente: 'dominado',
}

/**
 * Render the evaluation modal into the DOM.
 *
 * @param {object} options
 * @param {string} options.claseId - ID of the class being evaluated
 * @param {Array<object>} options.alumnos - Array of { id, nombre_completo }
 * @param {Array<object>} options.indicadores - Array of { id, description, node_nombre? }
 * @param {Array<object>} [options.evaluaciones] - Existing evaluations to pre-fill
 * @param {string} [options.alumnoPreseleccionado] - Pre-select this student
 * @param {string} [options.evaluadoPor] - ID of the evaluating teacher
 * @param {function} [options.onSave] - Callback after successful save
 */
export function renderEvaluacionClaseModal({
  claseId,
  alumnos = [],
  indicadores = [],
  evaluaciones = [],
  alumnoPreseleccionado = null,
  evaluadoPor = null,
  onSave = null,
}) {
  // Remove any existing modal
  const existing = document.querySelector('.eval-modal-overlay')
  if (existing) existing.remove()

  const overlay = document.createElement('div')
  overlay.className = 'eval-modal-overlay'
  overlay.innerHTML = _buildModalHTML(alumnos, indicadores, evaluaciones, alumnoPreseleccionado)
  document.body.appendChild(overlay)

  // Inject styles
  if (!document.getElementById('eval-modal-styles')) {
    const style = document.createElement('style')
    style.id = 'eval-modal-styles'
    style.textContent = _getStyles()
    document.head.appendChild(style)
  }

  const close = () => {
    overlay.classList.remove('open')
    setTimeout(() => overlay.remove(), 200)
  }

  // Wire close events
  overlay.querySelector('.eval-modal-backdrop').onclick = close
  overlay.querySelector('.eval-modal-cancel').onclick = close
  const escHandler = (e) => {
    if (e.key === 'Escape') {
      close()
      document.removeEventListener('keydown', escHandler)
    }
  }
  document.addEventListener('keydown', escHandler)

  // Pre-fill existing evaluations
  if (evaluaciones.length > 0) {
    _prefillEvaluaciones(overlay, evaluaciones, alumnoPreseleccionado)
  }

  // Save handler
  overlay.querySelector('.eval-modal-save').onclick = async () => {
    const alumnoId = overlay.querySelector('#eval-alumno-select')?.value
    if (!alumnoId) {
      _showError(overlay, 'Seleccioná un alumno')
      return
    }

    const saveBtn = overlay.querySelector('.eval-modal-save')
    saveBtn.disabled = true
    saveBtn.textContent = 'Guardando...'

    const rows = overlay.querySelectorAll('.eval-indicator-row')
    let savedCount = 0

    for (const row of rows) {
      const indicatorId = row.dataset.indicatorId
      const nota = row.querySelector('.eval-nota-input')?.value
      const estado = row.querySelector('.eval-estado-select')?.value || 'sin_evaluar'
      const observaciones = row.querySelector('.eval-observaciones-input')?.value || ''
      const evidencia = row.querySelector('.eval-evidencia-input')?.value || ''

      const observacionesFull = evidencia
        ? `${observaciones}${observaciones ? '\n' : ''}Evidencia: ${evidencia}`
        : observaciones

      try {
        await registrarEvaluacion({
          alumno_id: alumnoId,
          indicator_id: indicatorId,
          clase_id: claseId,
          nota: nota ? parseInt(nota, 10) : null,
          estado,
          observaciones: observacionesFull || null,
          evaluado_por: evaluadoPor,
        })
        savedCount++
      } catch (err) {
        console.error('[evaluacionClaseModal] Error saving indicator:', indicatorId, err)
      }
    }

    if (savedCount > 0 && onSave) {
      onSave({ alumnoId, savedCount })
    }

    close()
  }

  // Open animation
  requestAnimationFrame(() => overlay.classList.add('open'))
}

// ── Private helpers ────────────────────────────────────────────────────────────

function _buildModalHTML(alumnos, indicadores, evaluaciones, alumnoPreseleccionado) {
  const alumnoOptions = alumnos
    .map(
      (a) =>
        `<option value="${a.id}" ${a.id === alumnoPreseleccionado ? 'selected' : ''}>${esc(a.nombre_completo || a.nombre || a.id)}</option>`,
    )
    .join('')

  const indicatorRows = indicadores
    .map((ind) => {
      const existing = evaluaciones.find(
        (e) => e.indicator_id === ind.id && (!alumnoPreseleccionado || e.alumno_id === alumnoPreseleccionado),
      )
      const nota = existing?.nota || ''
      const estado = existing?.estado || 'sin_evaluar'
      const obs = existing?.observaciones || ''

      return `
      <div class="eval-indicator-row" data-indicator-id="${ind.id}">
        <div class="eval-indicator-info">
          <div class="eval-indicator-name">${esc(ind.description || ind.id)}</div>
          ${ind.node_nombre ? `<div class="eval-indicator-node">${esc(ind.node_nombre)}</div>` : ''}
        </div>
        <div class="eval-indicator-fields">
          <div class="eval-field-group">
            <label class="eval-field-label">Estado</label>
            <select class="form-select form-select-sm eval-estado-select">
              ${ESTADOS_EVALUACION.map((e) => `<option value="${e.value}" ${e.value === estado ? 'selected' : ''}>${e.label}</option>`).join('')}
            </select>
          </div>
          <div class="eval-field-group">
            <label class="eval-field-label">Nota (1-5)</label>
            <input type="number" class="form-control form-control-sm eval-nota-input" min="1" max="5" value="${nota}" placeholder="-">
          </div>
          <div class="eval-field-group eval-field-wide">
            <label class="eval-field-label">Observaciones</label>
            <textarea class="form-control form-control-sm eval-observaciones-input" rows="1" placeholder="Opcional">${esc(obs)}</textarea>
          </div>
          <div class="eval-field-group eval-field-wide">
            <label class="eval-field-label">Evidencia (URL)</label>
            <input type="url" class="form-control form-control-sm eval-evidencia-input" placeholder="https://...">
          </div>
        </div>
      </div>`
    })
    .join('')

  return `
    <div class="eval-modal-backdrop"></div>
    <div class="eval-modal-dialog">
      <div class="eval-modal-header">
        <div class="eval-modal-header-left">
          <div class="eval-modal-icon"><i class="bi bi-clipboard-check"></i></div>
          <div>
            <h5 class="eval-modal-title">Evaluación de Clase</h5>
            <p class="eval-modal-subtitle">Calificar indicadores por alumno</p>
          </div>
        </div>
        <button class="eval-modal-close-x" aria-label="Cerrar">&times;</button>
      </div>
      <div class="eval-modal-body">
        <div class="eval-alumno-select-wrapper">
          <label class="eval-field-label fw-bold" for="eval-alumno-select">Alumno</label>
          <select class="form-select" id="eval-alumno-select">
            <option value="">Seleccionar alumno...</option>
            ${alumnoOptions}
          </select>
        </div>
        <div class="eval-error-msg d-none" role="alert"></div>
        <div class="eval-indicators-list">
          ${indicatorRows || '<div class="text-muted text-center py-3">No hay indicadores para evaluar.</div>'}
        </div>
      </div>
      <div class="eval-modal-footer">
        <button class="btn btn-outline-secondary eval-modal-cancel">Cancelar</button>
        <button class="btn btn-primary eval-modal-save">Guardar Evaluación</button>
      </div>
    </div>
  `
}

function _prefillEvaluaciones(overlay, evaluaciones, alumnoPreseleccionado) {
  if (!alumnoPreseleccionado) return

  const rows = overlay.querySelectorAll('.eval-indicator-row')
  for (const row of rows) {
    const indicatorId = row.dataset.indicatorId
    const eval_ = evaluaciones.find(
      (e) => e.indicator_id === indicatorId && e.alumno_id === alumnoPreseleccionado,
    )
    if (!eval_) continue

    const notaInput = row.querySelector('.eval-nota-input')
    const estadoSelect = row.querySelector('.eval-estado-select')
    const obsInput = row.querySelector('.eval-observaciones-input')

    if (notaInput && eval_.nota) notaInput.value = eval_.nota
    if (estadoSelect && eval_.estado) estadoSelect.value = eval_.estado
    if (obsInput && eval_.observaciones) obsInput.value = eval_.observaciones
  }
}

function _showError(overlay, msg) {
  const el = overlay.querySelector('.eval-error-msg')
  if (el) {
    el.textContent = msg
    el.classList.remove('d-none')
    setTimeout(() => el.classList.add('d-none'), 3000)
  }
}

function esc(str) {
  if (!str) return ''
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function _getStyles() {
  return `
    .eval-modal-overlay {
      position: fixed;
      inset: 0;
      display: none;
      align-items: center;
      justify-content: center;
      z-index: 10000;
      padding: 1rem;
      opacity: 0;
      transition: opacity 0.2s ease;
    }
    .eval-modal-overlay.open {
      display: flex;
      opacity: 1;
    }
    .eval-modal-backdrop {
      position: absolute;
      inset: 0;
      background: rgba(0,0,0,0.5);
      backdrop-filter: blur(4px);
    }
    .eval-modal-dialog {
      position: relative;
      background: var(--bs-body-bg, #fff);
      border-radius: 12px;
      box-shadow: 0 25px 50px -12px rgba(0,0,0,0.25);
      width: 100%;
      max-width: 700px;
      max-height: 85vh;
      display: flex;
      flex-direction: column;
      overflow: hidden;
      transform: scale(0.95) translateY(10px);
      transition: transform 0.25s cubic-bezier(0.32,0.72,0,1);
    }
    .eval-modal-overlay.open .eval-modal-dialog {
      transform: scale(1) translateY(0);
    }
    .eval-modal-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 1rem 1.25rem;
      border-bottom: 1px solid var(--bs-border-color, #dee2e6);
    }
    .eval-modal-header-left {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }
    .eval-modal-icon {
      width: 40px;
      height: 40px;
      background: linear-gradient(135deg, var(--bs-primary, #0d6efd), #6366f1);
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #fff;
      font-size: 1.1rem;
    }
    .eval-modal-title {
      font-size: 1.05rem;
      font-weight: 700;
      margin: 0;
    }
    .eval-modal-subtitle {
      font-size: 0.75rem;
      color: var(--bs-secondary-color, #6c757d);
      margin: 0.15rem 0 0;
    }
    .eval-modal-close-x {
      width: 32px;
      height: 32px;
      border: none;
      background: var(--bs-tertiary-bg, #f8f9fa);
      border-radius: 8px;
      cursor: pointer;
      font-size: 1.2rem;
      color: var(--bs-secondary-color, #6c757d);
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .eval-modal-body {
      flex: 1;
      overflow-y: auto;
      padding: 1rem 1.25rem;
    }
    .eval-alumno-select-wrapper {
      margin-bottom: 1rem;
    }
    .eval-error-msg {
      background: #fee2e2;
      color: #dc2626;
      padding: 0.5rem 0.75rem;
      border-radius: 8px;
      font-size: 0.8rem;
      margin-bottom: 0.75rem;
    }
    .eval-indicator-row {
      border: 1px solid var(--bs-border-color, #dee2e6);
      border-radius: 8px;
      padding: 0.75rem;
      margin-bottom: 0.5rem;
    }
    .eval-indicator-info {
      margin-bottom: 0.5rem;
    }
    .eval-indicator-name {
      font-weight: 600;
      font-size: 0.85rem;
    }
    .eval-indicator-node {
      font-size: 0.72rem;
      color: var(--bs-secondary-color, #6c757d);
    }
    .eval-indicator-fields {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 0.5rem;
    }
    .eval-field-wide {
      grid-column: 1 / -1;
    }
    .eval-field-label {
      display: block;
      font-size: 0.7rem;
      font-weight: 600;
      margin-bottom: 0.2rem;
      color: var(--bs-secondary-color, #6c757d);
    }
    .eval-modal-footer {
      display: flex;
      justify-content: flex-end;
      gap: 0.5rem;
      padding: 0.75rem 1.25rem;
      border-top: 1px solid var(--bs-border-color, #dee2e6);
    }
    @media (max-width: 640px) {
      .eval-indicator-fields {
        grid-template-columns: 1fr;
      }
    }
  `
}
