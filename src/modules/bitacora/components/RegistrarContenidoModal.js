import { BitacoraRegistro } from '../models/bitacora.model.js'
import * as bitacoraAdapter from '../api/bitacoraAdapter.js'
import { ModalManager } from '../../../shared/components/modal.js'

function escapeHTML(str) {
  if (!str) return ''
  return String(str).replace(/[&<>"']/g, (m) =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m])
  )
}

function todayISO() {
  return new Date().toISOString().slice(0, 10)
}

function getAlumnoName(alumno) {
  return alumno.nombre_completo || alumno.nombre || alumno.name || 'Sin nombre'
}

/**
 * Opens a Bootstrap modal for registering a content session.
 *
 * @param {Object} opts
 * @param {string} opts.claseId
 * @param {string} opts.objetivoId
 * @param {string} opts.objetivoTitulo
 * @param {Array}  opts.alumnos  — list of alumno objects with { id, nombre_completo, ... }
 * @param {Function} [opts.onSave]  — async callback after successful save
 * @param {Function} [opts.onCancel] — callback when modal is dismissed
 */
export function openRegistrarContenidoModal(opts = {}) {
  const {
    claseId,
    objetivoId,
    objetivoTitulo = 'Objetivo',
    alumnos = [],
  } = opts

  const body = `
    <form id="formRegistrarContenido">
      <div class="mb-3">
        <label class="form-label">Objetivo</label>
        <div class="fw-semibold">${escapeHTML(objetivoTitulo)}</div>
      </div>

      <div class="mb-3">
        <label for="rcFecha" class="form-label">Fecha *</label>
        <input type="date" class="form-control" id="rcFecha" value="${todayISO()}" required>
        <div class="invalid-feedback" id="rcFechaFeedback"></div>
      </div>

      <hr class="my-3">
      <p class="small text-muted mb-2">Evaluación por alumno:</p>

      <div id="rcAlumnosContainer">
        ${alumnos.map((a) => `
          <div class="row g-2 align-items-center mb-2" data-alumno-id="${a.id}">
            <div class="col-md-6">
              <span class="small fw-medium">${escapeHTML(getAlumnoName(a))}</span>
            </div>
            <div class="col-md-6">
              <select class="form-select form-select-sm rc-nota" required>
                <option value="">Seleccionar...</option>
                <option value="bien">Bien</option>
                <option value="regular">Regular</option>
                <option value="mal">Mal</option>
              </select>
            </div>
          </div>
        `).join('')}
        ${!alumnos.length ? `
          <div class="text-muted small">No hay alumnos disponibles para esta clase.</div>
        ` : ''}
      </div>
    </form>
  `

  const footer = `
    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
    <button type="button" class="btn btn-primary" id="btnSubmitRegistrar">
      <i class="bi bi-save me-1"></i>Guardar sesión
    </button>
  `

  const modal = ModalManager.createModal({
    id: 'modalRegistrarContenido',
    title: '<i class="bi bi-plus-circle me-1"></i>Registrar Sesión de Contenido',
    body,
    footer,
    size: 'modal-lg',
  })

  const modalElement = modal.element

  modalElement.querySelector('#btnSubmitRegistrar').addEventListener('click', async () => {
    const btn = modalElement.querySelector('#btnSubmitRegistrar')
    const fechaInput = modalElement.querySelector('#rcFecha')

    fechaInput.classList.remove('is-invalid')

    const fecha = fechaInput.value
    const todayEnd = new Date()
    todayEnd.setHours(23, 59, 59, 999)
    const fechaDate = new Date(fecha + 'T23:59:59')

    if (fechaDate > todayEnd) {
      fechaInput.classList.add('is-invalid')
      modalElement.querySelector('#rcFechaFeedback').textContent = 'La fecha no puede ser posterior a hoy'
      return
    }

    const notaSelects = modalElement.querySelectorAll('.rc-nota')
    const notas = []
    let hasSelection = false

    notaSelects.forEach((sel) => {
      const alumnoId = sel.closest('[data-alumno-id]')?.dataset.alumnoId
      const nota = sel.value
      if (nota) {
        hasSelection = true
        notas.push({ alumno_id: alumnoId, nota })
      }
    })

    if (!hasSelection) {
      ModalManager.showToast('Debe evaluar al menos un alumno.', 'error')
      return
    }

    const registro = new BitacoraRegistro({
      claseId,
      objetivoId,
      fecha,
      notas,
    })

    const errores = registro.validate()
    if (errores.length > 0) {
      ModalManager.showToast(errores[0], 'error')
      return
    }

    btn.disabled = true
    btn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Guardando...'

    try {
      await bitacoraAdapter.registrarSesion(registro.toJSON())

      modalElement.dispatchEvent(new CustomEvent('saved', {
        bubbles: true,
        detail: { claseId, objetivoId, fecha },
      }))

      modal.instance.hide()

      if (opts.onSave) await opts.onSave(registro)
    } catch (error) {
      ModalManager.showToast(error.message || 'Error al guardar la sesión', 'error')
      btn.disabled = false
      btn.innerHTML = '<i class="bi bi-save me-1"></i>Guardar sesión'
    }
  })

  modalElement.addEventListener('hidden.bs.modal', () => {
    if (opts.onCancel) opts.onCancel()
  })

  modal.instance.show()
}
