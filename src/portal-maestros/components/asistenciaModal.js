/**
 * Componente: Modal de Asistencia
 * Diseño original + mejoras: variables CSS, dark/light mode, responsive, mejor UX
 */

import { ModalManager } from '../../../shared/components/modal.js'
import { Asistencia } from '../models/asistencia.model.js'
import { escapeHTML, formatDateISO } from '../utils/asistenciasUtils.js'
import { obtenerAlumnos } from '../../alumnos/api/alumnosApi.js'

const VALIDATION = {
  justificacionMax: 500,
}

/**
 * Abre el modal de justificación
 * @param {Object} data - Datos del alumno {id, nombre, estado, justificacionTexto, justificacionArchivo}
 * @param {Function} onSave - Callback al guardar
 */
export function openAsistenciaJustificarModal(data, onSave) {
  const body = `
    <form id="formJustificacion">
      <div class="am-mb-3">
        <label class="am-form-label">Alumno</label>
        <div class="am-fw-semibold">${escapeHTML(data.nombre)}</div>
      </div>

      <div class="am-mb-3">
        <label class="am-form-label">Tipo de ausencia</label>
        <div class="am-d-flex am-gap-3">
          <div class="am-form-check">
            <input class="am-form-check-input" type="radio" name="tipoJustif" id="tipoP" value="P" ${data.estado === 'P' ? 'checked' : ''}>
            <label class="am-form-check-label am-text-success" for="tipoP">
              <i class="bi bi-check-circle"></i> Presente
            </label>
          </div>
          <div class="am-form-check">
            <input class="am-form-check-input" type="radio" name="tipoJustif" id="tipoA" value="A">
            <label class="am-form-check-label am-text-danger" for="tipoA">
              <i class="bi bi-x-circle"></i> Ausente
            </label>
          </div>
          <div class="am-form-check">
            <input class="am-form-check-input" type="radio" name="tipoJustif" id="tipoJ" value="J" ${data.estado === 'J' ? 'checked' : ''}>
            <label class="am-form-check-label am-text-warning" for="tipoJ">
              <i class="bi bi-file-earmark-text"></i> Justificado
            </label>
          </div>
        </div>
      </div>

      <div class="am-mb-3">
        <label for="justifTexto" class="am-form-label">Justificación</label>
        <textarea class="am-form-control" id="justifTexto" name="justificacion_texto"
          rows="3" maxlength="${VALIDATION.justificacionMax}"
          placeholder="Motivo de la ausencia o nota adicional...">${data.justificacionTexto || ''}</textarea>
        <small class="am-form-text am-text-muted" id="justifCount">${(data.justificacionTexto || '').length}/${VALIDATION.justificacionMax}</small>
      </div>

      <div class="am-mb-3">
        <label for="justifArchivo" class="am-form-label">Adjuntar imagen (opcional)</label>
        <input type="file" class="am-form-control" id="justifArchivo" name="justificacion_archivo"
          accept="image/*">
        ${data.justificacionArchivo ? `<small class="am-text-success am-d-block am-mt-1"><i class="bi bi-paperclip"></i> Archivo adjuntado previamente</small>` : ''}
      </div>
    </form>

    <style>
      .am-mb-3 { margin-bottom: 1rem; display: flex; flex-direction: column; gap: 0.5rem; }
      .am-form-label { font-size: 0.8125rem; font-weight: 600; color: var(--pm-text); }
      .am-fw-semibold { font-weight: 600; color: var(--pm-text); }
      .am-form-control {
        padding: 0.625rem 0.875rem;
        border: 1px solid var(--pm-border);
        border-radius: 10px;
        font-size: 0.875rem;
        background: var(--pm-surface);
        color: var(--pm-text);
        transition: border-color 0.2s, box-shadow 0.2s;
        font-family: inherit;
        resize: vertical;
      }
      .am-form-control:focus {
        outline: none;
        border-color: var(--pm-primary);
        box-shadow: 0 0 0 3px var(--pm-primary-bg);
      }
      .am-form-control::placeholder {
        color: var(--pm-text-muted);
        opacity: 0.7;
      }

      .am-d-flex { display: flex; }
      .am-gap-3 { gap: 0.75rem; }
      .am-form-check {
        display: flex;
        align-items: center;
        gap: 0.5rem;
      }
      .am-form-check-input {
        width: 1rem;
        height: 1rem;
        margin-top: 0;
        cursor: pointer;
        accent-color: var(--pm-primary);
      }
      .am-form-check-label {
        font-size: 0.875rem;
        cursor: pointer;
        margin-bottom: 0;
        display: flex;
        align-items: center;
        gap: 0.375rem;
      }
      .am-form-check-label i { font-size: 1rem; }

      .am-text-success { color: var(--pm-success); }
      .am-text-danger { color: var(--pm-danger); }
      .am-text-warning { color: var(--pm-warning); }
      .am-text-muted { color: var(--pm-text-muted); }

      .am-form-text {
        font-size: 0.6875rem;
        display: block;
        margin-top: 0.25rem;
        text-align: right;
      }
      .am-d-block { display: block; }
      .am-mt-1 { margin-top: 0.25rem; }

      /* Dark mode support */
      [data-bs-theme="dark"] .am-form-control,
      [data-portal-theme="dark"] .am-form-control {
        background-color: var(--pm-surface);
        border-color: var(--pm-border);
      }

      @media (max-width: 600px) {
        .am-gap-3 { flex-direction: column; gap: 0.5rem; }
      }
    </style>
  `

  const footer = `
    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
    <button type="button" class="btn btn-primary" id="btnSubmitJustif">Guardar</button>
  `

  const modal = ModalManager.createModal({
    id: 'modalJustificacion',
    title: '<i class="bi bi-file-earmark-text"></i> Justificar Ausencia',
    body,
    footer,
    size: 'modal-lg',
  })

  const justifInput = modal.element.querySelector('#justifTexto')
  const justifCount = modal.element.querySelector('#justifCount')
  justifInput?.addEventListener('input', (e) => {
    justifCount.textContent = `${e.target.value.length}/${VALIDATION.justificacionMax}`
  })

  modal.element.querySelector('#btnSubmitJustif')?.addEventListener('click', async () => {
    const btn = modal.element.querySelector('#btnSubmitJustif')
    btn.disabled = true
    btn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Guardando...'

    try {
      const tipo = modal.element.querySelector('input[name="tipoJustif"]:checked')?.value || 'J'
      const justificacionTexto = modal.element.querySelector('#justifTexto').value.trim()
      const archivoInput = modal.element.querySelector('#justifArchivo')
      let justificacionArchivo = data.justificacionArchivo || ''

      if (archivoInput && archivoInput.files && archivoInput.files.length > 0) {
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
      btn.innerHTML = 'Guardar'
    }
  })

  modal.instance.show()
}

/**
 * Abre el modal para crear/editar una asistencia
 * @param {string} mode - 'create' | 'edit'
 * @param {HTMLElement} container
 * @param {Object} data - Datos de la asistencia
 * @param {Function} onSave - Callback al guardar
 */
export async function openAsistenciaModal(mode, container, data, onSave) {
  const isEdit = mode === 'edit'

  let alumnos = []
  try {
    alumnos = await obtenerAlumnos()
  } catch (e) {
    console.warn('No se pudieron cargar alumnos:', e.message)
  }

  const titulo = isEdit ? 'Editar Asistencia' : 'Nueva Asistencia'
  const submitLabel = isEdit ? 'Guardar cambios' : 'Guardar'

  const alumnosOptions = alumnos.map(a =>
    `<option value="${a.id}" ${data?.student_id === a.id ? 'selected' : ''}>${escapeHTML(a.name)}</option>`
  ).join('')

  const body = `
    <form id="formAsistencia">
      <div class="am-mb-3">
        <label for="asistFecha" class="am-form-label">Fecha <span class="am-required">*</span></label>
        <input type="date" class="am-form-control" id="asistFecha" name="fecha"
          value="${data?.fecha || formatDateISO(new Date())}" required>
      </div>

      <div class="am-row">
        <div class="am-col-md-6 am-mb-3">
          <label for="asistClase" class="am-form-label">Clase <span class="am-required">*</span></label>
          <select class="am-form-select" id="asistClase" name="clase_id" required>
            <option value="">Seleccionar clase</option>
            <option value="clase-1" ${data?.clase_id === 'clase-1' ? 'selected' : ''}>Clase ejemplo</option>
          </select>
        </div>
        <div class="am-col-md-6 am-mb-3">
          <label for="asistAlumno" class="am-form-label">Alumno <span class="am-required">*</span></label>
          <select class="am-form-select" id="asistAlumno" name="student_id" required>
            <option value="">Seleccionar alumno</option>
            ${alumnosOptions}
          </select>
        </div>
      </div>

      <div class="am-mb-3">
        <label class="am-form-label">Estado <span class="am-required">*</span></label>
        <div class="am-d-flex am-gap-3">
          <div class="am-form-check">
            <input class="am-form-check-input" type="radio" name="estado" id="estadoP" value="P"
              ${(!data || data.estado === 'P') ? 'checked' : ''}>
            <label class="am-form-check-label" for="estadoP">
              <i class="bi bi-check-circle am-text-success"></i> Presente
            </label>
          </div>
          <div class="am-form-check">
            <input class="am-form-check-input" type="radio" name="estado" id="estadoA" value="A"
              ${data?.estado === 'A' ? 'checked' : ''}>
            <label class="am-form-check-label" for="estadoA">
              <i class="bi bi-x-circle am-text-danger"></i> Ausente
            </label>
          </div>
          <div class="am-form-check">
            <input class="am-form-check-input" type="radio" name="estado" id="estadoJ" value="J"
              ${data?.estado === 'J' ? 'checked' : ''}>
            <label class="am-form-check-label" for="estadoJ">
              <i class="bi bi-file-earmark-text am-text-warning"></i> Justificado
            </label>
          </div>
        </div>
      </div>

      <div class="am-mb-3">
        <label for="asistJustificacion" class="am-form-label">Justificación</label>
        <textarea class="am-form-control" id="asistJustificacion" name="justificacion_texto"
          rows="3" maxlength="${VALIDATION.justificacionMax}"
          placeholder="Motivo de la ausencia o nota adicional...">${data?.justificacion_texto || ''}</textarea>
        <small class="am-form-text am-text-muted" id="justifCount">${(data?.justificacion_texto || '').length}/${VALIDATION.justificacionMax}</small>
      </div>
    </form>

    <style>
      .am-mb-3 { margin-bottom: 1rem; display: flex; flex-direction: column; gap: 0.5rem; }
      .am-form-label { font-size: 0.8125rem; font-weight: 600; color: var(--pm-text); }
      .am-required { color: var(--pm-danger); }

      .am-form-control, .am-form-select {
        padding: 0.625rem 0.875rem;
        border: 1px solid var(--pm-border);
        border-radius: 10px;
        font-size: 0.875rem;
        background: var(--pm-surface);
        color: var(--pm-text);
        transition: border-color 0.2s, box-shadow 0.2s;
        font-family: inherit;
      }
      .am-form-control:focus, .am-form-select:focus {
        outline: none;
        border-color: var(--pm-primary);
        box-shadow: 0 0 0 3px var(--pm-primary-bg);
      }
      .am-form-control::placeholder {
        color: var(--pm-text-muted);
        opacity: 0.7;
      }
      .am-form-select { appearance: none; cursor: pointer; }

      .am-row { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
      .am-col-md-6 { grid-column: span 1; }
      @media (max-width: 600px) {
        .am-row { grid-template-columns: 1fr; gap: 1rem; }
      }

      .am-d-flex { display: flex; }
      .am-gap-3 { gap: 0.75rem; }

      .am-form-check {
        display: flex;
        align-items: center;
        gap: 0.5rem;
      }
      .am-form-check-input {
        width: 1rem;
        height: 1rem;
        margin-top: 0;
        cursor: pointer;
        accent-color: var(--pm-primary);
      }
      .am-form-check-label {
        font-size: 0.875rem;
        cursor: pointer;
        margin-bottom: 0;
        display: flex;
        align-items: center;
        gap: 0.375rem;
      }
      .am-form-check-label i { font-size: 1rem; }

      .am-text-success { color: var(--pm-success); }
      .am-text-danger { color: var(--pm-danger); }
      .am-text-warning { color: var(--pm-warning); }
      .am-text-muted { color: var(--pm-text-muted); }

      .am-form-text {
        font-size: 0.6875rem;
        display: block;
        margin-top: 0.25rem;
        text-align: right;
      }

      /* Dark mode support */
      [data-bs-theme="dark"] .am-form-control,
      [data-bs-theme="dark"] .am-form-select,
      [data-portal-theme="dark"] .am-form-control,
      [data-portal-theme="dark"] .am-form-select {
        background-color: var(--pm-surface);
        border-color: var(--pm-border);
      }

      @media (max-width: 600px) {
        .am-gap-3 { flex-direction: column; gap: 0.5rem; }
      }
    </style>
  `

  const footer = `
    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
    <button type="button" class="btn btn-primary" id="btnSubmitAsistencia">${submitLabel}</button>
  `

  const modal = ModalManager.createModal({
    id: 'modalAsistencia',
    title: `<i class="bi bi-calendar-check"></i> ${titulo}`,
    body,
    footer,
    size: 'modal-lg',
  })

  const justifInput = modal.element.querySelector('#asistJustificacion')
  const justifCount = modal.element.querySelector('#justifCount')
  justifInput?.addEventListener('input', (e) => {
    justifCount.textContent = `${e.target.value.length}/${VALIDATION.justificacionMax}`
  })

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
        clase_id: modal.element.querySelector('#asistClase')?.value,
        student_id: modal.element.querySelector('#asistAlumno')?.value,
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
