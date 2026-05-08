import { AppModal } from '../../../shared/components/AppModal.js'
import { AppToast } from '../../../shared/components/AppToast.js'

let onSaveCallback = null
let currentMaestroId = null
let currentMaestroAuxiliarId = null

export function openClaseEmergenteModal(options = {}) {
  const {
    fecha = '',
    claseId = '',
    clases = [],
    maestroId = null,
    onSave = null
  } = options

  onSaveCallback = onSave
  currentMaestroId = maestroId

  AppModal.open({
    title: '📅 Nueva Clase Emergente',
    size: 'lg',
    saveText: 'Crear Clase',
    cancelText: 'Cancelar',
    body: `
      <form id="formClaseEmergente" class="row g-3">
        <div class="col-md-6">
          <label class="form-label-compact">Fecha *</label>
          <input type="date" class="form-control input-dense" id="modal-fecha" required value="${fecha}">
        </div>
        <div class="col-md-6">
          <label class="form-label-compact">Clase *</label>
          <select class="form-select input-dense" id="modal-clase_id" required>
            <option value="">Seleccionar clase...</option>
            ${clases.map(c => `<option value="${c.id}" ${c.id === claseId ? 'selected' : ''}>${escapeHTML(c.nombre)}</option>`).join('')}
          </select>
        </div>
        <div class="col-md-6">
          <label class="form-label-compact">Hora inicio *</label>
          <input type="time" class="form-control input-dense" id="modal-hora_inicio" required>
        </div>
        <div class="col-md-6">
          <label class="form-label-compact">Hora fin *</label>
          <input type="time" class="form-control input-dense" id="modal-hora_fin" required>
        </div>
        <div class="col-12">
          <label class="form-label-compact">Tema / Título *</label>
          <input type="text" class="form-control input-dense" id="modal-tema" required placeholder="Ej: Clase especial de repertorio">
        </div>
        <div class="col-12">
          <label class="form-label-compact">Contenido / Descripción</label>
          <textarea class="form-control input-dense" id="modal-contenido" rows="3" placeholder="Describe los objetivos de esta clase especial..."></textarea>
        </div>
        <div class="col-12">
          <label class="form-label-compact">Motivo de clase emergente</label>
          <select class="form-select input-dense" id="modal-motivo" required>
            <option value="">Seleccionar motivo...</option>
            <option value="recuperacion">Recuperación (feriado/ausencia)</option>
            <option value="concierto">Preparación para concerto/recital</option>
            <option value="examen">Examen parcial</option>
            <option value="reemplazo">Reemplazo de maestro</option>
            <option value="especial">Clase especial programada</option>
            <option value="otro">Otro motivo</option>
          </select>
        </div>
        <div class="col-12">
          <div class="form-check">
            <input class="form-check-input" type="checkbox" id="modal-es_co-docencia">
            <label class="form-check-label" for="modal-es_co-docencia">
              ¿Esta clase tiene co-docencia?
            </label>
          </div>
        </div>
        <div id="codocencia-fields" class="col-12" style="display: none;">
          <div class="p-3 bg-body-tertiary rounded">
            <label class="form-label-compact">Maestro auxiliar</label>
            <select class="form-select input-dense" id="modal-maestro_auxiliar_id">
              <option value="">Seleccionar maestro auxiliar...</option>
            </select>
            <small class="text-muted">El maestro auxiliar podrá ver y editar esta sesión.</small>
          </div>
        </div>
      </form>
    `,
    onShow: (modalBody) => {
      const checkboxCoDocencia = modalBody.querySelector('#modal-es_co-docencia')
      const codocenciaFields = modalBody.querySelector('#codocencia-fields')
      
      checkboxCoDocencia?.addEventListener('change', (e) => {
        codocenciaFields.style.display = e.target.checked ? 'block' : 'none'
      })

      const claseSelect = modalBody.querySelector('#modal-clase_id')
      claseSelect?.addEventListener('change', async (e) => {
        const claseId = e.target.value
        const clase = clases.find(c => c.id === claseId)
        
        if (clase?.maestro_auxiliar_id && checkboxCoDocencia.checked) {
          const auxSelect = modalBody.querySelector('#modal-maestro_auxiliar_id')
          auxSelect.value = clase.maestro_auxiliar_id
        }
      })
    },
    onSave: async (modalBody) => {
      const datos = {
        fecha: modalBody.querySelector('#modal-fecha').value,
        clase_id: modalBody.querySelector('#modal-clase_id').value,
        hora_inicio: modalBody.querySelector('#modal-hora_inicio').value,
        hora_fin: modalBody.querySelector('#modal-hora_fin').value,
        tema: modalBody.querySelector('#modal-tema').value.trim(),
        contenido: modalBody.querySelector('#modal-contenido').value.trim(),
        motivo: modalBody.querySelector('#modal-motivo').value,
        tipo: 'emergente',
        es_codocencia: modalBody.querySelector('#modal-es_co-docencia').checked,
        maestro_auxiliar_id: modalBody.querySelector('#modal-maestro_auxiliar_id')?.value || null,
        estado: 'pendiente',
        maestro_id: currentMaestroId,
      }

      if (!datos.fecha || !datos.clase_id || !datos.hora_inicio || !datos.hora_fin || !datos.tema || !datos.motivo) {
        AppToast.error('Todos los campos obligatorios deben completarse')
        return false
      }

      if (datos.hora_inicio >= datos.hora_fin) {
        AppToast.error('La hora de inicio debe ser menor que la hora de fin')
        return false
      }

      if (onSaveCallback) {
        await onSaveCallback(datos)
      }

      return true
    }
  })
}

function escapeHTML(str) {
  if (!str) return ''
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

export function openEditarSesionModal(sesion, options = {}) {
  const { clases = [], maestros = [], onSave = null, onDelete = null } = options

  AppModal.open({
    title: '✏️ Editar Sesión Pasada',
    size: 'lg',
    saveText: 'Guardar Cambios',
    cancelText: 'Cancelar',
    onSave: async (modalBody) => {
      const datos = {
        tema: modalBody.querySelector('#modal-tema').value.trim(),
        contenido: modalBody.querySelector('#modal-contenido').value.trim(),
        hora_inicio: modalBody.querySelector('#modal-hora_inicio').value,
        hora_fin: modalBody.querySelector('#modal-hora_fin').value,
      }

      if (!datos.tema) {
        AppToast.error('El tema es obligatorio')
        return false
      }

      if (onSave) {
        await onSave(sesion.id, datos)
      }

      return true
    },
    body: `
      <form id="formEditarSesion" class="row g-3">
        <div class="col-md-6">
          <label class="form-label-compact">Fecha</label>
          <input type="date" class="form-control input-dense" id="modal-fecha" value="${sesion.fecha}" disabled>
          <small class="text-muted">La fecha no se puede modificar</small>
        </div>
        <div class="col-md-6">
          <label class="form-label-compact">Clase</label>
          <select class="form-select input-dense" id="modal-clase_id" disabled>
            <option value="">${sesion.clase_nombre || sesion.clase_id}</option>
          </select>
        </div>
        <div class="col-md-6">
          <label class="form-label-compact">Hora inicio *</label>
          <input type="time" class="form-control input-dense" id="modal-hora_inicio" required value="${sesion.hora_inicio || ''}">
        </div>
        <div class="col-md-6">
          <label class="form-label-compact">Hora fin *</label>
          <input type="time" class="form-control input-dense" id="modal-hora_fin" required value="${sesion.hora_fin || ''}">
        </div>
        <div class="col-12">
          <label class="form-label-compact">Tema *</label>
          <input type="text" class="form-control input-dense" id="modal-tema" required value="${escapeHTML(sesion.tema || '')}">
        </div>
        <div class="col-12">
          <label class="form-label-compact">Contenido / Descripción</label>
          <textarea class="form-control input-dense" id="modal-contenido" rows="4">${escapeHTML(sesion.contenido || '')}</textarea>
        </div>
        ${sesion.asistencia ? `
        <div class="col-12">
          <label class="form-label-compact">Asistencia</label>
          <div class="d-flex gap-3">
            <span class="badge bg-success">P: ${sesion.asistencia.presentes || 0}</span>
            <span class="badge bg-danger">A: ${sesion.asistencia.ausentes || 0}</span>
            <span class="badge bg-secondary">J: ${sesion.asistencia.justificados || 0}</span>
          </div>
        </div>
        ` : ''}
      </form>
    `
  })
}

export function openVerSesionModal(sesion, options = {}) {
  const { clases = [], maestros = [], onEditar = null, onPasarAsistencia = null, onEliminar = null } = options

  const asistenciaHtml = sesion.asistencia 
    ? `
      <div class="d-flex gap-2 mb-3">
        <span class="badge bg-success-subtle text-success">Presentes: ${sesion.asistencia.presentes || 0}</span>
        <span class="badge bg-danger-subtle text-danger">Ausentes: ${sesion.asistencia.ausentes || 0}</span>
        <span class="badge bg-secondary-subtle text-secondary">Justificados: ${sesion.asistencia.justificados || 0}</span>
      </div>
    `
    : '<p class="text-muted">Sin asistencia registrada</p>'

  AppModal.open({
    title: `📋 ${sesion.tema || 'Sesión'}`,
    size: 'lg',
    saveText: onEditar ? 'Editar' : 'Cerrar',
    cancelText: onPasarAsistencia ? 'Pasar Asistencia' : '',
    onSave: () => {
      if (onEditar) {
        onEditar(sesion)
        return false
      }
      return true
    },
    onCancel: onPasarAsistencia ? () => {
      onPasarAsistencia(sesion)
      return false
    } : undefined,
    body: `
      <div class="row">
        <div class="col-md-6">
          <div class="mb-3">
            <label class="form-label fw-bold">Fecha</label>
            <p class="form-control-plaintext">${sesion.fecha}</p>
          </div>
          <div class="mb-3">
            <label class="form-label fw-bold">Horario</label>
            <p class="form-control-plaintext">${sesion.hora_inicio || '-'} - ${sesion.hora_fin || '-'}</p>
          </div>
          <div class="mb-3">
            <label class="form-label fw-bold">Tipo</label>
            <p class="form-control-plaintext">
              <span class="badge ${sesion.tipo === 'emergente' ? 'bg-warning text-dark' : 'bg-primary'}">
                ${sesion.tipo === 'emergente' ? '⚡ Emergente' : '📅 Regular'}
              </span>
            </p>
          </div>
          <div class="mb-3">
            <label class="form-label fw-bold">Estado</label>
            <p class="form-control-plaintext">
              <span class="badge ${sesion.estado === 'registrada' ? 'bg-success' : sesion.estado === 'pendiente' ? 'bg-warning text-dark' : 'bg-secondary'}">
                ${sesion.estado === 'registrada' ? '✅ Registrada' : sesion.estado === 'pendiente' ? '⏳ Pendiente' : sesion.estado}
              </span>
            </p>
          </div>
        </div>
        <div class="col-md-6">
          <div class="mb-3">
            <label class="form-label fw-bold">Tema</label>
            <p class="form-control-plaintext">${escapeHTML(sesion.tema || '-')}</p>
          </div>
          <div class="mb-3">
            <label class="form-label fw-bold">Contenido</label>
            <p class="form-control-plaintext">${escapeHTML(sesion.contenido || 'Sin contenido registrado')}</p>
          </div>
          ${sesion.motivo ? `
          <div class="mb-3">
            <label class="form-label fw-bold">Motivo</label>
            <p class="form-control-plaintext">${escapeHTML(sesion.motivo)}</p>
          </div>
          ` : ''}
        </div>
      </div>
      <hr>
      <div class="mb-3">
        <label class="form-label fw-bold">Asistencia</label>
        ${asistenciaHtml}
      </div>
    `
  })
}