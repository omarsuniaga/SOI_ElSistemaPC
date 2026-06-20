import { ModalManager } from '../../../shared/components/modal.js'
import { Progreso } from '../models/progreso.model.js'
import { escapeHTML, getCalificacionColor, getCalificacionLabel } from '../utils/progresosUtils.js'

export async function openCalificacionModal(mode, container, data = null, options = {}) {
  const { alumnos = [], clases = [], maestros = [], onSave = null } = options
  const isEdit = mode === 'edit' && data

  const tiposOptions = Progreso.getTiposEvaluacion()
    .map(t => `<option value="${t.value}" ${isEdit && data.tipo_evaluacion === t.value ? 'selected' : ''}>${t.label}</option>`)
    .join('')

  const estadosOptions = Progreso.getEstados()
    .map(e => `<option value="${e.value}" ${isEdit && data.estado === e.value ? 'selected' : ''}>${e.label}</option>`)
    .join('')

  const alumnoOptions = alumnos.length
    ? alumnos.map(a => `<option value="${a.id}" ${isEdit && data.alumno_id === a.id ? 'selected' : ''}>${escapeHTML(a.name || a.nombre || 'Sin nombre')}</option>`).join('')
    : '<option value="">No hay alumnos disponibles</option>'

  const claseOptions = clases.length
    ? clases.map(c => `<option value="${c.id}" ${isEdit && data.clase_id === c.id ? 'selected' : ''}>${escapeHTML(c.nombre || 'Sin nombre')}</option>`).join('')
    : '<option value="">No hay clases disponibles</option>'

  const maestroOptions = maestros.length
    ? `<option value="">Sin asignar</option>` + maestros.map(m => `<option value="${m.id}" ${isEdit && data.maestro_id === m.id ? 'selected' : ''}>${escapeHTML(m.nombre || m.name || 'Sin nombre')}</option>`).join('')
    : '<option value="">Sin asignar</option>'

  const body = `
    <form id="formCalificacionModal">
      <div class="row">
        <div class="col-md-6 mb-3">
          <label for="cal_alumno_id" class="form-label">Alumno *</label>
          <select class="form-select" id="cal_alumno_id" name="alumno_id" required>
            <option value="">Seleccionar alumno</option>
            ${alumnoOptions}
          </select>
        </div>
        <div class="col-md-6 mb-3">
          <label for="cal_clase_id" class="form-label">Clase *</label>
          <select class="form-select" id="cal_clase_id" name="clase_id" required>
            <option value="">Seleccionar clase</option>
            ${claseOptions}
          </select>
        </div>
      </div>

      <div class="row">
        <div class="col-md-6 mb-3">
          <label for="cal_maestro_id" class="form-label">Maestro</label>
          <select class="form-select" id="cal_maestro_id" name="maestro_id">
            ${maestroOptions}
          </select>
        </div>
        <div class="col-md-6 mb-3">
          <label for="cal_fecha" class="form-label">Fecha de Evaluacion</label>
          <input type="date" class="form-control" id="cal_fecha" name="fecha_evaluacion" value="${isEdit && data.fecha_evaluacion ? data.fecha_evaluacion : new Date().toISOString().split('T')[0]}">
        </div>
      </div>

      <div class="row">
        <div class="col-md-6 mb-3">
          <label for="cal_tipo" class="form-label">Tipo de Evaluacion *</label>
          <select class="form-select" id="cal_tipo" name="tipo_evaluacion" required>
            <option value="">Seleccionar tipo</option>
            ${tiposOptions}
          </select>
        </div>
        <div class="col-md-6 mb-3">
          <label for="cal_calificacion" class="form-label">Calificacion (0-5)</label>
          <input type="number" class="form-control" id="cal_calificacion" name="calificacion" min="0" max="5" step="0.01" placeholder="0.00 - 5.00" value="${isEdit && data.calificacion !== null && data.calificacion !== undefined ? data.calificacion : ''}">
          <small class="form-text text-muted" id="cal_calificacionLabel"></small>
        </div>
      </div>

      <div class="row">
        <div class="col-md-6 mb-3">
          <label for="cal_estado" class="form-label">Estado</label>
          <select class="form-select" id="cal_estado" name="estado">
            ${estadosOptions}
          </select>
        </div>
      </div>

      <div class="mb-3">
        <label for="cal_observaciones" class="form-label">Observaciones</label>
        <textarea class="form-control" id="cal_observaciones" name="observaciones" rows="3" maxlength="500" placeholder="Notas adicionales...">${isEdit && data.observaciones ? escapeHTML(data.observaciones) : ''}</textarea>
        <small class="form-text text-muted" id="cal_observacionesCount">${isEdit && data.observaciones ? data.observaciones.length : 0}/500</small>
      </div>
    </form>
  `

  const footer = `
    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
    <button type="button" class="btn btn-primary" id="btnSubmitCalificacionModal">${isEdit ? 'Guardar Cambios' : 'Guardar'}</button>
  `

  const modal = ModalManager.createModal({
    id: 'modalCalificacion',
    title: isEdit ? 'Editar Calificacion' : 'Nueva Calificacion',
    body,
    footer,
    size: 'modal-lg',
  })

  const calInput = document.getElementById('cal_calificacion')
  if (calInput) {
    const val = parseFloat(calInput.value)
    if (!isNaN(val)) {
      const label = document.getElementById('cal_calificacionLabel')
      label.textContent = getCalificacionLabel(val)
      label.className = `form-text text-${getCalificacionColor(val)}`
    }

    calInput.addEventListener('input', (e) => {
      const v = parseFloat(e.target.value)
      const label = document.getElementById('cal_calificacionLabel')
      if (!isNaN(v) && v >= 0 && v <= 5) {
        label.textContent = getCalificacionLabel(v)
        label.className = `form-text text-${getCalificacionColor(v)}`
      } else {
        label.textContent = ''
      }
    })
  }

  document.getElementById('cal_observaciones')?.addEventListener('input', (e) => {
    document.getElementById('cal_observacionesCount').textContent = e.target.value.length + '/500'
  })

  document.getElementById('btnSubmitCalificacionModal')?.addEventListener('click', async () => {
    const alumno_id = document.getElementById('cal_alumno_id').value
    const clase_id = document.getElementById('cal_clase_id').value
    const maestro_id = document.getElementById('cal_maestro_id').value || null
    const fecha_evaluacion = document.getElementById('cal_fecha').value || null
    const tipo_evaluacion = document.getElementById('cal_tipo').value
    const calificacion = document.getElementById('cal_calificacion').value
    const estado = document.getElementById('cal_estado').value
    const observaciones = document.getElementById('cal_observaciones').value

    if (!alumno_id) {
      ModalManager.showToast('El alumno es obligatorio', 'error')
      return
    }

    if (!clase_id) {
      ModalManager.showToast('La clase es obligatoria', 'error')
      return
    }

    if (!tipo_evaluacion) {
      ModalManager.showToast('El tipo de evaluacion es obligatorio', 'error')
      return
    }

    const submitBtn = document.getElementById('btnSubmitCalificacionModal')
    submitBtn.disabled = true
    submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Guardando...'

    try {
      const datos = {
        alumno_id,
        clase_id,
        maestro_id,
        fecha_evaluacion,
        tipo_evaluacion,
        calificacion: calificacion !== '' ? parseFloat(calificacion) : null,
        estado,
        observaciones,
      }

      if (onSave) {
        await onSave(isEdit ? data.id : null, datos)
      }

      modal.instance.hide()
    } catch (error) {
      console.error(error)
      ModalManager.showToast(error.message || 'Error al guardar', 'error')
    } finally {
      submitBtn.disabled = false
      submitBtn.innerHTML = isEdit ? 'Guardar Cambios' : 'Guardar'
    }
  })

  modal.instance.show()
}
