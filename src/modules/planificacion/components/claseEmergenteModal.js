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
    title: '⚡ Nueva Clase Emergente',
    size: 'lg',
    saveText: 'Crear Clase',
    cancelText: 'Cancelar',
    body: `
      <form id="formClaseEmergente" class="pm-emergente-form">
        <div class="pm-emergente-section">
          <h3 class="pm-emergente-section-title">📅 Información de la Sesión</h3>
          <div class="pm-emergente-grid">
            <div class="pm-emergente-field">
              <label class="pm-emergente-label">Fecha</label>
              <input type="date" class="pm-emergente-input" id="modal-fecha" required value="${fecha}">
            </div>
            <div class="pm-emergente-field">
              <label class="pm-emergente-label">Clase</label>
              <select class="pm-emergente-select" id="modal-clase_id" required>
                <option value="">Seleccionar...</option>
                ${clases.map(c => `<option value="${c.id}" ${c.id === claseId ? 'selected' : ''}>${escapeHTML(c.nombre)}</option>`).join('')}
              </select>
            </div>
            <div class="pm-emergente-field">
              <label class="pm-emergente-label">Hora inicio</label>
              <input type="time" class="pm-emergente-input" id="modal-hora_inicio" required>
            </div>
            <div class="pm-emergente-field">
              <label class="pm-emergente-label">Hora fin</label>
              <input type="time" class="pm-emergente-input" id="modal-hora_fin" required>
            </div>
          </div>
        </div>

        <div class="pm-emergente-section">
          <h3 class="pm-emergente-section-title">📝 Contenido</h3>
          <div class="pm-emergente-field full">
            <label class="pm-emergente-label">Tema / Título</label>
            <input type="text" class="pm-emergente-input" id="modal-tema" required placeholder="Ej: Clase especial de repertorio">
          </div>
          <div class="pm-emergente-field full">
            <label class="pm-emergente-label">Descripción</label>
            <textarea class="pm-emergente-textarea" id="modal-contenido" rows="3" placeholder="Describe los objetivos de esta clase especial..."></textarea>
          </div>
        </div>

        <div class="pm-emergente-section">
          <h3 class="pm-emergente-section-title">⚠️ Motivo</h3>
          <div class="pm-emergente-field full">
            <select class="pm-emergente-select" id="modal-motivo" required>
              <option value="">Seleccionar motivo...</option>
              <option value="recuperacion">🔄 Recuperación (feriado/ausencia)</option>
              <option value="concierto">🎭 Preparación para concerto/recital</option>
              <option value="examen">📋 Examen parcial</option>
              <option value="reemplazo">👥 Reemplazo de maestro</option>
              <option value="especial">⭐ Clase especial programada</option>
              <option value="otro">📌 Otro motivo</option>
            </select>
          </div>
        </div>

        <div class="pm-emergente-section">
          <label class="pm-emergente-checkbox">
            <input type="checkbox" id="modal-es_co-docencia">
            <span class="pm-emergente-checkbox-mark">✓</span>
            <span class="pm-emergente-checkbox-text">¿Esta clase tiene co-docencia?</span>
          </label>
          
          <div id="codocencia-fields" class="pm-emergente-codocencia" style="display: none;">
            <div class="pm-emergente-codocencia-card">
              <label class="pm-emergente-label">Maestro auxiliar</label>
              <select class="pm-emergente-select" id="modal-maestro_auxiliar_id">
                <option value="">Seleccionar maestro...</option>
              </select>
              <span class="pm-emergente-hint">El maestro auxiliar podrá ver y editar esta sesión.</span>
            </div>
          </div>
        </div>

        <style>
          .pm-emergente-form {
            display: flex;
            flex-direction: column;
            gap: 1.25rem;
          }
          .pm-emergente-section {
            display: flex;
            flex-direction: column;
            gap: 0.75rem;
          }
          .pm-emergente-section-title {
            font-size: 0.8125rem;
            font-weight: 600;
            color: var(--pm-text-muted);
            text-transform: uppercase;
            letter-spacing: 0.04em;
            margin: 0;
            padding-bottom: 0.5rem;
            border-bottom: 1px solid var(--pm-border);
          }
          .pm-emergente-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 0.75rem;
          }
          .pm-emergente-field {
            display: flex;
            flex-direction: column;
            gap: 0.375rem;
          }
          .pm-emergente-field.full {
            grid-column: span 2;
          }
          .pm-emergente-label {
            font-size: 0.8125rem;
            font-weight: 500;
            color: var(--pm-text);
          }
          .pm-emergente-input,
          .pm-emergente-select,
          .pm-emergente-textarea {
            padding: 0.625rem 0.875rem;
            border: 1px solid var(--pm-border);
            border-radius: 10px;
            font-size: 0.875rem;
            background: var(--pm-surface);
            color: var(--pm-text);
            outline: none;
            transition: border-color 0.2s, box-shadow 0.2s;
          }
          .pm-emergente-input:focus,
          .pm-emergente-select:focus,
          .pm-emergente-textarea:focus {
            border-color: var(--pm-primary);
            box-shadow: 0 0 0 3px rgba(0, 122, 255, 0.1);
          }
          .pm-emergente-textarea {
            resize: vertical;
            min-height: 80px;
          }
          .pm-emergente-checkbox {
            display: flex;
            align-items: center;
            gap: 0.75rem;
            cursor: pointer;
            padding: 0.75rem;
            background: var(--pm-surface-2);
            border-radius: 10px;
          }
          .pm-emergente-checkbox input {
            display: none;
          }
          .pm-emergente-checkbox-mark {
            width: 22px;
            height: 22px;
            border: 2px solid var(--pm-border);
            border-radius: 6px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 0.75rem;
            color: transparent;
            transition: all 0.2s;
          }
          .pm-emergente-checkbox input:checked + .pm-emergente-checkbox-mark {
            background: var(--pm-primary);
            border-color: var(--pm-primary);
            color: white;
          }
          .pm-emergente-checkbox-text {
            font-size: 0.875rem;
            color: var(--pm-text);
          }
          .pm-emergente-codocencia {
            margin-top: 0.5rem;
          }
          .pm-emergente-codocencia-card {
            padding: 1rem;
            background: linear-gradient(135deg, rgba(88, 86, 214, 0.1) 0%, rgba(88, 86, 214, 0.05) 100%);
            border: 1px solid rgba(88, 86, 214, 0.2);
            border-radius: 12px;
            display: flex;
            flex-direction: column;
            gap: 0.5rem;
          }
          .pm-emergente-hint {
            font-size: 0.75rem;
            color: var(--pm-text-muted);
          }
        </style>
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