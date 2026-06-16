/**
 * RegistrarContenidoModal.js — Modal for registering a "contenido dado" session.
 *
 * Fields:
 *   - objetivo (pre-selected, shown as read-only label)
 *   - fecha (default today, must not be future)
 *   - per-alumno: checkbox + nota selector (bien/regular/mal)
 *   - observacion textarea (optional)
 *
 * Props:
 *   claseId             {string}
 *   objetivoId          {string}
 *   objetivoDescripcion {string}
 *   alumnos             {Array<{id, nombre_completo}>}
 *   onSaved             {Function} — called after successful registrarSesion
 *   onCancel            {Function} — called when cancel button clicked
 *
 * Vanilla JS pattern — no framework. Mirrors planificacionView.js modal style.
 */

import { registrarSesion } from '../api/bitacoraAdapter.js'

const NOTAS_VALIDAS = ['bien', 'regular', 'mal']

// ── Entry point ───────────────────────────────────────────────────────────────

/**
 * Renders the registration modal form inside the given container.
 *
 * @param {HTMLElement} container
 * @param {{ claseId: string, objetivoId: string, objetivoDescripcion: string,
 *   alumnos: {id: string, nombre_completo: string}[],
 *   onSaved?: Function, onCancel?: Function,
 *   prefillFecha?: string|null, prefillObservacion?: string|null }} props
 * @param {string}      props.claseId
 * @param {string}      props.objetivoId
 * @param {string}      props.objetivoDescripcion
 * @param {{id: string, nombre_completo: string}[]} props.alumnos
 * @param {Function}    [props.onSaved]
 * @param {Function}    [props.onCancel]
 * @param {string|null} [props.prefillFecha]        - ISO date string to pre-populate the fecha field (optional)
 * @param {string|null} [props.prefillObservacion]  - Text to pre-populate the observación textarea (optional)
 */
export function renderRegistrarContenidoModal(container, props = {}) {
  const {
    claseId,
    objetivoId,
    objetivoDescripcion = '',
    alumnos = [],
    onSaved = null,
    onCancel = null,
    prefillFecha = null,       // NEW: optional ISO date string
    prefillObservacion = null, // NEW: optional string
  } = props

  const today = new Date().toISOString().slice(0, 10)
  const fechaValue = prefillFecha ?? today

  container.innerHTML = `
    <div class="registrar-modal">
      <div class="registrar-modal-header mb-3">
        <div class="d-flex align-items-center gap-2">
          <i class="bi bi-journal-plus text-primary fs-5"></i>
          <h5 class="mb-0 fw-bold">Registrar Contenido</h5>
        </div>
        <p class="text-muted small mb-0 mt-1">
          Objetivo: <strong>${_escape(objetivoDescripcion)}</strong>
        </p>
      </div>

      <form id="form-registrar" novalidate>
        <!-- Fecha -->
        <div class="mb-3">
          <label class="form-label-compact" for="modal-fecha">Fecha de sesión *</label>
          <input type="date" class="form-control input-dense" id="modal-fecha"
                 name="fecha" value="${fechaValue}" max="${today}" required>
          <div class="invalid-feedback" id="error-fecha"></div>
        </div>

        <!-- Alumnos -->
        <div class="mb-3">
          <label class="form-label-compact">Calificación por alumno *</label>
          <div class="registrar-alumnos-list">
            ${alumnos.map((a) => _renderAlumnoRow(a)).join('')}
          </div>
          <div class="invalid-feedback d-block" id="error-alumnos"></div>
        </div>

        <!-- Observacion -->
        <div class="mb-3">
          <label class="form-label-compact" for="modal-observacion">Observación general</label>
          <textarea class="form-control input-dense" id="modal-observacion"
                    name="observacion" rows="2"
                    placeholder="Opcional — comentarios sobre la sesión">${prefillObservacion ? _escape(prefillObservacion) : ''}</textarea>
        </div>

        <!-- Actions -->
        <div class="d-flex gap-2 justify-content-end mt-3">
          <button type="button" class="btn btn-outline-secondary" data-action="cancel">
            Cancelar
          </button>
          <button type="submit" class="btn btn-premium-action">
            <i class="bi bi-check-lg me-1"></i>Guardar
          </button>
        </div>
      </form>
    </div>`

  _attachModalEvents(container, { claseId, objetivoId, alumnos, onSaved, onCancel })
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function _renderAlumnoRow(alumno) {
  return `
    <div class="registrar-alumno-row d-flex align-items-center gap-3 py-2 border-bottom">
      <div class="flex-grow-1 small fw-medium">${_escape(alumno.nombre_completo || alumno.id)}</div>
      <select class="form-select input-dense" style="max-width: 140px;"
              data-alumno-id="${_escape(alumno.id)}"
              name="nota_${_escape(alumno.id)}">
        <option value="">— nota —</option>
        <option value="bien">Bien</option>
        <option value="regular">Regular</option>
        <option value="mal">Mal</option>
      </select>
    </div>`
}

function _attachModalEvents(container, { claseId, objetivoId, alumnos, onSaved, onCancel }) {
  container.querySelector('[data-action="cancel"]')?.addEventListener('click', () => {
    if (typeof onCancel === 'function') onCancel()
  })

  container.querySelector('#form-registrar')?.addEventListener('submit', async (e) => {
    e.preventDefault()

    // Clear previous errors
    container.querySelector('#error-fecha').textContent = ''
    container.querySelector('#error-alumnos').textContent = ''

    const fecha = container.querySelector('#modal-fecha')?.value || ''
    const today = new Date().toISOString().slice(0, 10)

    // Validate: fecha not future
    if (!fecha || fecha > today) {
      container.querySelector('#error-fecha').textContent = 'La fecha no puede ser una fecha futura'
      container.querySelector('#modal-fecha')?.classList.add('is-invalid')
      return
    }
    container.querySelector('#modal-fecha')?.classList.remove('is-invalid')

    // Collect notas from selects
    const notas = []
    container.querySelectorAll('select[data-alumno-id]').forEach((sel) => {
      const nota = sel.value
      if (nota && NOTAS_VALIDAS.includes(nota)) {
        notas.push({ alumnoId: sel.dataset.alumnoId, nota })
      }
    })

    // Validate: at least 1 alumno with nota
    if (notas.length === 0) {
      container.querySelector('#error-alumnos').textContent =
        'Seleccioná una nota para al menos un alumno'
      return
    }

    // Collect observacion
    const observacion = container.querySelector('#modal-observacion')?.value?.trim() || null

    const submitBtn = container.querySelector('button[type="submit"]')
    if (submitBtn) submitBtn.disabled = true

    try {
      await registrarSesion({ claseId, objetivoId, fecha, notas, observacion })
      if (typeof onSaved === 'function') onSaved()
    } catch (err) {
      console.error('[RegistrarContenidoModal]', err)
      container.querySelector('#error-alumnos').textContent =
        err.message || 'Error al guardar. Intentá de nuevo.'
    } finally {
      if (submitBtn) submitBtn.disabled = false
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
