/**
 * Componente: Modal de Asistencia (Versión Mejorada)
 * Siguiendo patrones de ausenciaModal: CSS variables, dark/light theme support, card-based UI
 */

import { ModalManager } from '../../../shared/components/modal.js'
import { Asistencia } from '../models/asistencia.model.js'
import { escapeHTML, formatDateISO } from '../utils/asistenciasUtils.js'
import { obtenerAlumnos } from '../../alumnos/api/alumnosApi.js'

const VALIDATION = {
  justificacionMax: 500,
}

const ESTADO_OPCIONES = [
  { value: 'P', label: 'Presente', icon: 'bi-check-circle-fill', color: 'success' },
  { value: 'A', label: 'Ausente', icon: 'bi-x-circle-fill', color: 'danger' },
  { value: 'J', label: 'Justificado', icon: 'bi-file-earmark-text', color: 'warning' },
]

/**
 * Abre el modal de justificación mejorado
 * @param {Object} data - Datos del alumno
 * @param {Function} onSave - Callback al guardar
 */
export function openAsistenciaJustificarModal(data, onSave) {
  const body = `
    <form id="formJustificacion" class="asi-justif-form">
      <div class="asi-form-section">
        <label class="asi-form-label">Alumno</label>
        <div class="asi-alumno-card">
          <i class="bi bi-person-circle"></i>
          <span>${escapeHTML(data.nombre)}</span>
        </div>
      </div>

      <div class="asi-form-section">
        <label class="asi-form-label">Tipo de ausencia</label>
        <div class="asi-estado-grid">
          ${ESTADO_OPCIONES.map(opt => `
            <label class="asi-estado-card" title="${opt.label}">
              <input type="radio" name="tipoJustif" value="${opt.value}"
                ${data.estado === opt.value ? 'checked' : ''}>
              <span class="asi-estado-visual">
                <i class="bi ${opt.icon}"></i>
                <span class="asi-estado-label">${opt.label}</span>
              </span>
            </label>
          `).join('')}
        </div>
      </div>

      <div class="asi-form-section">
        <label for="justifTexto" class="asi-form-label">Justificación</label>
        <textarea class="asi-form-textarea" id="justifTexto" name="justificacion_texto"
          rows="4" maxlength="${VALIDATION.justificacionMax}"
          placeholder="Motivo de la ausencia o nota adicional...">${data.justificacionTexto || ''}</textarea>
        <div class="asi-form-footer">
          <span class="asi-char-count"><span id="justifCount">${(data.justificacionTexto || '').length}</span>/${VALIDATION.justificacionMax}</span>
        </div>
      </div>

      <div class="asi-form-section">
        <label for="justifArchivo" class="asi-form-label">Adjuntar archivo (opcional)</label>
        <div class="asi-file-upload">
          <input type="file" class="asi-file-input" id="justifArchivo" name="justificacion_archivo"
            accept="image/*,.pdf">
          <label for="justifArchivo" class="asi-file-label">
            <i class="bi bi-cloud-upload"></i>
            <span>Haz click para seleccionar o arrastra un archivo</span>
            <small>Máx 5MB (PDF, JPG, PNG)</small>
          </label>
          ${data.justificacionArchivo ? `
            <div class="asi-file-preview">
              <i class="bi bi-check-circle-fill"></i>
              <span>${data.justificacionArchivo}</span>
            </div>
          ` : ''}
        </div>
      </div>
    </form>

    <style>
      .asi-justif-form { display: flex; flex-direction: column; gap: 1.25rem; }
      .asi-form-section { display: flex; flex-direction: column; gap: 0.5rem; }
      .asi-form-label { font-size: 0.8125rem; font-weight: 600; color: var(--pm-text); }

      .asi-alumno-card {
        display: flex; align-items: center; gap: 0.75rem;
        padding: 0.75rem 1rem;
        background: var(--pm-surface-2);
        border-radius: 10px;
        font-weight: 500;
        border: 1px solid var(--pm-border);
      }
      .asi-alumno-card i { font-size: 1.5rem; color: var(--pm-primary); }

      .asi-estado-grid {
        display: grid; grid-template-columns: repeat(3, 1fr); gap: 0.75rem;
      }
      @media (max-width: 500px) {
        .asi-estado-grid { grid-template-columns: repeat(2, 1fr); }
      }

      .asi-estado-card {
        position: relative; cursor: pointer;
      }
      .asi-estado-card input { display: none; }
      .asi-estado-visual {
        display: flex; flex-direction: column; align-items: center; gap: 0.5rem;
        padding: 0.875rem 0.75rem;
        border: 2px solid var(--pm-border);
        border-radius: 12px;
        transition: all 0.2s;
        text-align: center;
      }
      .asi-estado-visual i { font-size: 1.75rem; }
      .asi-estado-label { font-size: 0.75rem; font-weight: 500; }

      .asi-estado-card input:checked + .asi-estado-visual {
        border-color: var(--pm-primary);
        background: var(--pm-primary-bg);
        transform: scale(1.05);
      }

      .asi-form-textarea {
        padding: 0.625rem 0.875rem;
        border: 1px solid var(--pm-border);
        border-radius: 10px;
        font-size: 0.875rem;
        background: var(--pm-surface);
        color: var(--pm-text);
        font-family: inherit;
        resize: vertical;
        transition: border-color 0.2s, box-shadow 0.2s;
      }
      .asi-form-textarea:focus {
        outline: none;
        border-color: var(--pm-primary);
        box-shadow: 0 0 0 3px var(--pm-primary-bg);
      }
      .asi-form-textarea::placeholder {
        color: var(--pm-text-muted);
        opacity: 0.7;
      }

      .asi-form-footer {
        display: flex; justify-content: flex-end;
      }
      .asi-char-count {
        font-size: 0.6875rem;
        color: var(--pm-text-muted);
      }

      .asi-file-upload {
        position: relative;
        display: flex; flex-direction: column; gap: 0.75rem;
      }
      .asi-file-input { display: none; }
      .asi-file-label {
        display: flex; flex-direction: column; align-items: center; gap: 0.5rem;
        padding: 1.5rem 1rem;
        border: 2px dashed var(--pm-border);
        border-radius: 12px;
        cursor: pointer;
        transition: all 0.2s;
        text-align: center;
        color: var(--pm-text-muted);
      }
      .asi-file-label:hover {
        border-color: var(--pm-primary);
        background: var(--pm-primary-bg);
        color: var(--pm-primary);
      }
      .asi-file-label i { font-size: 1.75rem; }
      .asi-file-label small { font-size: 0.6875rem; }

      .asi-file-preview {
        display: flex; align-items: center; gap: 0.75rem;
        padding: 0.75rem 1rem;
        background: var(--pm-success-bg);
        border: 1px solid var(--pm-success);
        border-radius: 10px;
        color: var(--pm-success);
        font-size: 0.8125rem;
      }
      .asi-file-preview i { font-size: 1.25rem; }

      /* Dark mode support */
      [data-bs-theme="dark"] .asi-form-textarea,
      [data-portal-theme="dark"] .asi-form-textarea {
        background-color: var(--pm-surface);
        border-color: var(--pm-border);
      }
    </style>
  `

  const footer = `
    <button type="button" class="btn btn-secondary btn-sm" data-bs-dismiss="modal">Cancelar</button>
    <button type="button" class="btn btn-primary btn-sm" id="btnSubmitJustif">Justificar</button>
  `

  const modal = ModalManager.createModal({
    id: 'modalJustificacion',
    title: '<i class="bi bi-file-earmark-text"></i> Justificar Ausencia',
    body,
    footer,
    size: 'modal-lg',
  })

  // Event listeners
  const justifInput = modal.element.querySelector('#justifTexto')
  const justifCount = modal.element.querySelector('#justifCount')
  if (justifInput) {
    justifInput.addEventListener('input', (e) => {
      justifCount.textContent = e.target.value.length
    })
  }

  // File drag & drop
  const fileLabel = modal.element.querySelector('.asi-file-label')
  if (fileLabel) {
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
      fileLabel.addEventListener(eventName, preventDefaults, false)
    })

    function preventDefaults(e) {
      e.preventDefault()
      e.stopPropagation()
    }

    ['dragenter', 'dragover'].forEach(eventName => {
      fileLabel.addEventListener(eventName, highlight, false)
    })
    ['dragleave', 'drop'].forEach(eventName => {
      fileLabel.addEventListener(eventName, unhighlight, false)
    })

    function highlight() {
      fileLabel.style.borderColor = 'var(--pm-primary)'
      fileLabel.style.background = 'var(--pm-primary-bg)'
    }
    function unhighlight() {
      fileLabel.style.borderColor = ''
      fileLabel.style.background = ''
    }
  }

  // Submit handler
  modal.element.querySelector('#btnSubmitJustif')?.addEventListener('click', async () => {
    const btn = modal.element.querySelector('#btnSubmitJustif')
    btn.disabled = true
    btn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Guardando...'

    try {
      const tipo = modal.element.querySelector('input[name="tipoJustif"]:checked')?.value || 'J'
      const justificacionTexto = justifInput.value.trim()
      const archivoInput = modal.element.querySelector('#justifArchivo')
      let justificacionArchivo = data.justificacionArchivo || ''

      if (archivoInput?.files?.length > 0) {
        justificacionArchivo = archivoInput.files[0].name
      }

      await onSave({
        estado: tipo,
        justificacionTexto,
        justificacionArchivo,
      })

      modal.instance.hide()
    } catch (error) {
      ModalManager.showToast(error.message || 'Error al guardar', 'error')
      btn.disabled = false
      btn.innerHTML = 'Justificar'
    }
  })

  modal.instance.show()
}

/**
 * Abre el modal para crear/editar asistencia (versión mejorada)
 * @param {string} mode - 'create' | 'edit'
 * @param {HTMLElement} container
 * @param {Object} data - Datos de la asistencia
 * @param {Function} onSave - Callback al guardar
 */
export async function openAsistenciaModal(mode, container, data, onSave) {
  const isEdit = mode === 'edit'
  const titulo = isEdit ? 'Editar Asistencia' : 'Nueva Asistencia'
  const submitLabel = isEdit ? 'Guardar cambios' : 'Guardar'

  let alumnos = []
  try {
    alumnos = await obtenerAlumnos()
  } catch (e) {
    console.warn('No se pudieron cargar alumnos:', e.message)
  }

  const alumnosOptions = alumnos.map(a =>
    `<option value="${a.id}" ${data?.student_id === a.id ? 'selected' : ''}>${escapeHTML(a.name)}</option>`
  ).join('')

  const body = `
    <form id="formAsistencia" class="asi-form">
      <div class="asi-form-row">
        <div class="asi-form-group">
          <label for="asistFecha" class="asi-form-label">Fecha <span class="asi-required">*</span></label>
          <input type="date" class="asi-form-input" id="asistFecha" name="fecha"
            value="${data?.fecha || formatDateISO(new Date())}" required>
        </div>
      </div>

      <div class="asi-form-row">
        <div class="asi-form-group">
          <label for="asistClase" class="asi-form-label">Clase <span class="asi-required">*</span></label>
          <select class="asi-form-select" id="asistClase" name="clase_id" required>
            <option value="">Seleccionar clase</option>
            <option value="clase-1" ${data?.clase_id === 'clase-1' ? 'selected' : ''}>Clase ejemplo</option>
          </select>
        </div>
        <div class="asi-form-group">
          <label for="asistAlumno" class="asi-form-label">Alumno <span class="asi-required">*</span></label>
          <select class="asi-form-select" id="asistAlumno" name="student_id" required>
            <option value="">Seleccionar alumno</option>
            ${alumnosOptions}
          </select>
        </div>
      </div>

      <div class="asi-form-section">
        <label class="asi-form-label">Estado <span class="asi-required">*</span></label>
        <div class="asi-estado-grid">
          ${ESTADO_OPCIONES.map(opt => `
            <label class="asi-estado-card" title="${opt.label}">
              <input type="radio" name="estado" value="${opt.value}"
                ${(!data || data.estado === opt.value) ? 'checked' : ''}>
              <span class="asi-estado-visual">
                <i class="bi ${opt.icon}"></i>
                <span class="asi-estado-label">${opt.label}</span>
              </span>
            </label>
          `).join('')}
        </div>
      </div>

      <div class="asi-form-section">
        <label for="asistJustificacion" class="asi-form-label">Justificación (opcional)</label>
        <textarea class="asi-form-textarea" id="asistJustificacion" name="justificacion_texto"
          rows="3" maxlength="${VALIDATION.justificacionMax}"
          placeholder="Motivo de la ausencia o nota adicional...">${data?.justificacion_texto || ''}</textarea>
        <div class="asi-form-footer">
          <span class="asi-char-count"><span id="justifCount">${(data?.justificacion_texto || '').length}</span>/${VALIDATION.justificacionMax}</span>
        </div>
      </div>
    </form>

    <style>
      .asi-form { display: flex; flex-direction: column; gap: 1.25rem; }
      .asi-form-section { display: flex; flex-direction: column; gap: 0.5rem; }
      .asi-form-row { display: grid; grid-template-columns: repeat(2, 1fr); gap: 1rem; }
      @media (max-width: 600px) {
        .asi-form-row { grid-template-columns: 1fr; }
      }
      .asi-form-group { display: flex; flex-direction: column; gap: 0.375rem; }
      .asi-form-label { font-size: 0.8125rem; font-weight: 600; color: var(--pm-text); }
      .asi-required { color: var(--pm-danger); }

      .asi-form-input, .asi-form-select {
        padding: 0.625rem 0.875rem;
        border: 1px solid var(--pm-border);
        border-radius: 10px;
        font-size: 0.875rem;
        background: var(--pm-surface);
        color: var(--pm-text);
        transition: border-color 0.2s, box-shadow 0.2s;
        font-family: inherit;
      }
      .asi-form-input:focus, .asi-form-select:focus {
        outline: none;
        border-color: var(--pm-primary);
        box-shadow: 0 0 0 3px var(--pm-primary-bg);
      }
      .asi-form-select { appearance: none; background-image: url("data:image/svg+xml,..."); }

      .asi-estado-grid {
        display: grid; grid-template-columns: repeat(3, 1fr); gap: 0.75rem;
      }
      @media (max-width: 500px) {
        .asi-estado-grid { grid-template-columns: repeat(2, 1fr); }
      }

      .asi-estado-card {
        position: relative; cursor: pointer;
      }
      .asi-estado-card input { display: none; }
      .asi-estado-visual {
        display: flex; flex-direction: column; align-items: center; gap: 0.5rem;
        padding: 0.875rem 0.75rem;
        border: 2px solid var(--pm-border);
        border-radius: 12px;
        transition: all 0.2s;
        text-align: center;
      }
      .asi-estado-visual i { font-size: 1.75rem; }
      .asi-estado-label { font-size: 0.75rem; font-weight: 500; }

      .asi-estado-card input:checked + .asi-estado-visual {
        border-color: var(--pm-primary);
        background: var(--pm-primary-bg);
        transform: scale(1.05);
      }

      .asi-form-textarea {
        padding: 0.625rem 0.875rem;
        border: 1px solid var(--pm-border);
        border-radius: 10px;
        font-size: 0.875rem;
        background: var(--pm-surface);
        color: var(--pm-text);
        font-family: inherit;
        resize: vertical;
        transition: border-color 0.2s, box-shadow 0.2s;
      }
      .asi-form-textarea:focus {
        outline: none;
        border-color: var(--pm-primary);
        box-shadow: 0 0 0 3px var(--pm-primary-bg);
      }
      .asi-form-textarea::placeholder {
        color: var(--pm-text-muted);
        opacity: 0.7;
      }

      .asi-form-footer {
        display: flex; justify-content: flex-end;
      }
      .asi-char-count {
        font-size: 0.6875rem;
        color: var(--pm-text-muted);
      }

      /* Dark mode support */
      [data-bs-theme="dark"] .asi-form-input,
      [data-bs-theme="dark"] .asi-form-select,
      [data-bs-theme="dark"] .asi-form-textarea,
      [data-portal-theme="dark"] .asi-form-input,
      [data-portal-theme="dark"] .asi-form-select,
      [data-portal-theme="dark"] .asi-form-textarea {
        background-color: var(--pm-surface);
        border-color: var(--pm-border);
      }
    </style>
  `

  const footer = `
    <button type="button" class="btn btn-secondary btn-sm" data-bs-dismiss="modal">Cancelar</button>
    <button type="button" class="btn btn-primary btn-sm" id="btnSubmitAsistencia">${submitLabel}</button>
  `

  const modal = ModalManager.createModal({
    id: 'modalAsistencia',
    title: `<i class="bi bi-calendar-check"></i> ${titulo}`,
    body,
    footer,
    size: 'modal-lg',
  })

  // Event listeners
  const justifInput = modal.element.querySelector('#asistJustificacion')
  const justifCount = modal.element.querySelector('#justifCount')
  if (justifInput) {
    justifInput.addEventListener('input', (e) => {
      justifCount.textContent = e.target.value.length
    })
  }

  // Submit handler
  modal.element.querySelector('#btnSubmitAsistencia')?.addEventListener('click', async () => {
    const btn = modal.element.querySelector('#btnSubmitAsistencia')
    btn.disabled = true
    btn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Guardando...'

    try {
      const fecha = modal.element.querySelector('#asistFecha').value
      const estado = modal.element.querySelector('input[name="estado"]:checked')?.value || 'P'
      const justificacion_texto = justifInput.value.trim()

      const modelo = new Asistencia({
        id: data?.id,
        clase_id: modal.element.querySelector('#asistClase').value,
        student_id: modal.element.querySelector('#asistAlumno').value,
        fecha,
        estado,
        justificacion_texto,
      })

      const errores = modelo.validate()
      if (errores.length > 0) {
        ModalManager.showToast(errores.join('. '), 'error')
        btn.disabled = false
        btn.innerHTML = submitLabel
        return
      }

      await onSave(modelo.toJSON(), mode)
      modal.instance.hide()
    } catch (error) {
      ModalManager.showToast(error.message || 'Error al guardar', 'error')
      btn.disabled = false
      btn.innerHTML = submitLabel
    }
  })

  modal.instance.show()
}
