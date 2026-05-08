import { ModalManager } from '../../../shared/components/modal.js'
import { Asistencia } from '../models/asistencia.model.js'
import { escapeHTML, formatDateISO } from '../utils/asistenciasUtils.js'
import { obtenerAlumnos } from '../../alumnos/api/alumnosApi.js'
import { obtenerAsistenciasPorClase, registrarAsistenciaBulk } from '../api/asistenciasApi.js'

const VALIDATION = {
  justificacionMax: 500,
}

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

export async function openRegistroBulkModal(claseId, container, onSave) {
  let alumnos = []
  let asistenciasExistentes = []

  try {
    alumnos = await obtenerAlumnos()
  } catch (e) {
    ModalManager.showToast('No se pudieron cargar los alumnos', 'error')
    return
  }

  const fechaHoy = formatDateISO(new Date())

  const body = `
    <form id="formBulkAsistencia">
      <div class="mb-3">
        <label for="bulkFecha" class="form-label">Fecha *</label>
        <input type="date" class="form-control" id="bulkFecha" name="fecha"
          value="${fechaHoy}" required>
      </div>

      <hr>

      <h6 class="mb-3"><i class="bi bi-people"></i> Lista de Alumnos</h6>

      <div id="bulkAlumnosList" class="table-responsive">
        <table class="table table-sm table-bordered">
          <thead class="table-light">
            <tr>
              <th>Alumno</th>
              <th class="text-center" style="width: 100px;">Estado</th>
              <th style="width: 200px;">Nota</th>
            </tr>
          </thead>
          <tbody>
            ${alumnos.map(a => `
              <tr data-student-id="${a.id}">
                <td>
                  <small class="fw-bold">${escapeHTML(a.name)}</small>
                </td>
                <td class="text-center">
                  <div class="btn-group btn-group-sm" role="group">
                    <input type="radio" class="btn-check" name="estado_${a.id}" id="p_${a.id}" value="P" checked>
                    <label class="btn btn-outline-success btn-sm" for="p_${a.id}" title="Presente">P</label>

                    <input type="radio" class="btn-check" name="estado_${a.id}" id="a_${a.id}" value="A">
                    <label class="btn btn-outline-danger btn-sm" for="a_${a.id}" title="Ausente">A</label>

                    <input type="radio" class="btn-check" name="estado_${a.id}" id="j_${a.id}" value="J">
                    <label class="btn btn-outline-warning btn-sm" for="j_${a.id}" title="Justificado">J</label>
                  </div>
                </td>
                <td>
                  <input type="text" class="form-control form-control-sm" name="nota_${a.id}"
                    placeholder="Opcional..." maxlength="100">
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>

      <div class="alert alert-info small mb-0">
        <i class="bi bi-info-circle"></i> Selecciona el estado para cada alumno. "P" = Presente, "A" = Ausente, "J" = Justificado.
      </div>
    </form>
  `

  const footer = `
    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
    <button type="button" class="btn btn-success" id="btnSubmitBulk">
      <i class="bi bi-check-all"></i> Registrar ${alumnos.length} asistencias
    </button>
  `

  const modal = ModalManager.createModal({
    id: 'modalBulkAsistencia',
    title: `<i class="bi bi-clipboard2-check"></i> Registro Masivo de Asistencia`,
    body,
    footer,
    size: 'modal-xl',
  })

  const fechaInput = modal.element.querySelector('#bulkFecha')
  fechaInput?.addEventListener('change', async () => {
    const fecha = fechaInput.value
    if (fecha && claseId) {
      try {
        asistenciasExistentes = await obtenerAsistenciasPorClase(claseId)
        const asistenciasDelDia = asistenciasExistentes.filter(a => a.fecha === fecha)
        asistenciasDelDia.forEach(a => {
          const radio = modal.element.querySelector(`input[name="estado_${a.student_id}"][value="${a.estado}"]`)
          if (radio) radio.checked = true
          const notaInput = modal.element.querySelector(`input[name="nota_${a.student_id}"]`)
          if (notaInput && a.justificacion_texto) notaInput.value = a.justificacion_texto
        })
      } catch (e) {
        console.warn('No se pudieron cargar asistencias existentes:', e.message)
      }
    }
  })

  modal.element.querySelector('#btnSubmitBulk')?.addEventListener('click', async () => {
    const fecha = modal.element.querySelector('#bulkFecha').value
    if (!fecha) {
      ModalManager.showToast('La fecha es obligatoria', 'error')
      return
    }

    const btn = modal.element.querySelector('#btnSubmitBulk')
    btn.disabled = true
    btn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Registrando...'

    const asistencias = alumnos.map(a => ({
      clase_id: claseId,
      student_id: a.id,
      fecha,
      estado: modal.element.querySelector(`input[name="estado_${a.id}"]:checked`)?.value || 'P',
      justificacion_texto: modal.element.querySelector(`input[name="nota_${a.id}"]`)?.value || '',
    }))

    try {
      await onSave(asistencias)
      ModalManager.showToast(`${asistencias.length} asistencias registradas correctamente`, 'success')
      modal.instance.hide()
    } catch (error) {
      ModalManager.showToast(error.message || 'Error al registrar', 'error')
      btn.disabled = false
      btn.innerHTML = `<i class="bi bi-check-all"></i> Registrar ${alumnos.length} asistencias`
    }
  })

  modal.instance.show()
}
