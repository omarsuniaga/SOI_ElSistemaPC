/**
 * Componente: Modal de Asistencia
 */

import { ModalManager } from '../../../shared/components/modal.js'
import { Asistencia } from '../models/asistencia.model.js'
import { escapeHTML, formatDateISO } from '../utils/asistenciasUtils.js'
import { obtenerAlumnos } from '../../alumnos/api/alumnosApi.js'

const VALIDATION = {
  justificacionMax: 500,
}

/**
 * Abre el modal de justificación con tipo, texto e imagen
 * @param {Object} data - Datos del alumno {id, nombre, estado, justificacionTexto, justificacionArchivo}
 * @param {Function} onSave - Callback al guardar {justificacionTexto, justificacionArchivo, estado}
 */
export function openAsistenciaJustificarModal(data, onSave) {
  const body = `
    <form id="formJustificacion">
      <div class="mb-3">
        <label class="form-label">Alumno</label>
        <div class="fw-semibold">${escapeHTML(data.nombre)}</div>
      </div>

      <div class="mb-3">
        <label class="form-label">Tipo de ausencia</label>
        <div class="d-flex gap-3">
          <div class="form-check">
            <input class="form-check-input" type="radio" name="tipoJustif" id="tipoP" value="P" ${data.estado === 'P' ? 'checked' : ''}>
            <label class="form-check-label text-success" for="tipoP">
              <i class="bi bi-check-circle"></i> Presente
            </label>
          </div>
          <div class="form-check">
            <input class="form-check-input" type="radio" name="tipoJustif" id="tipoA" value="A">
            <label class="form-check-label text-danger" for="tipoA">
              <i class="bi bi-x-circle"></i> Ausente
            </label>
          </div>
          <div class="form-check">
            <input class="form-check-input" type="radio" name="tipoJustif" id="tipoJ" value="J" ${data.estado === 'J' ? 'checked' : ''}>
            <label class="form-check-label text-warning" for="tipoJ">
              <i class="bi bi-file-earmark-text"></i> Justificado
            </label>
          </div>
        </div>
      </div>

      <div class="mb-3">
        <label for="justifTexto" class="form-label">Justificación</label>
        <textarea class="form-control" id="justifTexto" name="justificacion_texto"
          rows="3" maxlength="${VALIDATION.justificacionMax}"
          placeholder="Motivo de la ausencia o nota adicional...">${data.justificacionTexto || ''}</textarea>
        <small class="form-text text-muted" id="justifCount">${(data.justificacionTexto || '').length}/${VALIDATION.justificacionMax}</small>
      </div>

      <div class="mb-3">
        <label for="justifArchivo" class="form-label">Adjuntar imagen (opcional)</label>
        <input type="file" class="form-control" id="justifArchivo" name="justificacion_archivo"
          accept="image/*">
        ${data.justificacionArchivo ? `<small class="text-success d-block mt-1"><i class="bi bi-paperclip"></i> Archivo adjuntado previamente</small>` : ''}
      </div>
    </form>
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
 * Abre el modal para crear/editar/justificar una asistencia
 * @param {string} mode - 'create' | 'edit' | 'justify'
 * @param {HTMLElement} container
 * @param {Object} data - Datos de la asistencia (para edit/justify)
 * @param {Function} onSave - Callback al guardar
 */
export async function openAsistenciaModal(mode, container, data, onSave) {
  const isEdit = mode === 'edit'
  const isJustify = mode === 'justify'

  let alumnos = []
  try {
    alumnos = await obtenerAlumnos()
  } catch (e) {
    console.warn('No se pudieron cargar alumnos:', e.message)
  }

  const titulo = isJustify ? 'Justificar Ausencia' : isEdit ? 'Editar Asistencia' : 'Nueva Asistencia'
  const submitLabel = isJustify ? 'Justificar' : isEdit ? 'Guardar cambios' : 'Guardar'

  const alumnosOptions = alumnos.map(a =>
    `<option value="${a.id}" ${data?.student_id === a.id ? 'selected' : ''}>${escapeHTML(a.name)}</option>`
  ).join('')

  const body = `
    <form id="formAsistencia">
      <div class="mb-3">
        <label for="asistFecha" class="form-label">Fecha *</label>
        <input type="date" class="form-control" id="asistFecha" name="fecha"
          value="${data?.fecha || formatDateISO(new Date())}" required>
      </div>

      ${!isJustify ? `
        <div class="row">
          <div class="col-md-6 mb-3">
            <label for="asistClase" class="form-label">Clase *</label>
            <select class="form-select" id="asistClase" name="clase_id" ${isEdit ? '' : 'required'}>
              <option value="">Seleccionar clase</option>
              <option value="clase-1" ${data?.clase_id === 'clase-1' ? 'selected' : ''}>Clase ejemplo</option>
            </select>
          </div>
          <div class="col-md-6 mb-3">
            <label for="asistAlumno" class="form-label">Alumno *</label>
            <select class="form-select" id="asistAlumno" name="student_id" required>
              <option value="">Seleccionar alumno</option>
              ${alumnosOptions}
            </select>
          </div>
        </div>
      ` : ''}

      ${!isJustify ? `
        <div class="mb-3">
          <label class="form-label">Estado *</label>
          <div class="d-flex gap-3">
            <div class="form-check">
              <input class="form-check-input" type="radio" name="estado" id="estadoP" value="P"
                ${(!data || data.estado === 'P') ? 'checked' : ''}>
              <label class="form-check-label" for="estadoP">
                <i class="bi bi-check-circle text-success"></i> Presente
              </label>
            </div>
            <div class="form-check">
              <input class="form-check-input" type="radio" name="estado" id="estadoA" value="A"
                ${data?.estado === 'A' ? 'checked' : ''}>
              <label class="form-check-label" for="estadoA">
                <i class="bi bi-x-circle text-danger"></i> Ausente
              </label>
            </div>
            <div class="form-check">
              <input class="form-check-input" type="radio" name="estado" id="estadoJ" value="J"
                ${data?.estado === 'J' ? 'checked' : ''}>
              <label class="form-check-label" for="estadoJ">
                <i class="bi bi-file-earmark-text text-warning"></i> Justificado
              </label>
            </div>
          </div>
        </div>
      ` : ''}

      <div class="mb-3">
        <label for="asistJustificacion" class="form-label">Justificación</label>
        <textarea class="form-control" id="asistJustificacion" name="justificacion_texto"
          rows="3" maxlength="${VALIDATION.justificacionMax}"
          placeholder="Motivo de la ausencia o nota adicional...">${data?.justificacion_texto || ''}</textarea>
        <small class="form-text text-muted" id="justifCount">${(data?.justificacion_texto || '').length}/${VALIDATION.justificacionMax}</small>
      </div>
    </form>
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
      const justificacion_texto = modal.element.querySelector('#asistJustificacion').value.trim()

      const modelo = new Asistencia({
        id: data?.id,
        clase_id: data?.clase_id || modal.element.querySelector('#asistClase')?.value,
        student_id: data?.student_id || modal.element.querySelector('#asistAlumno')?.value,
        fecha,
        estado: isJustify ? 'J' : estado,
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
