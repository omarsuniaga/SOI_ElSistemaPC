import { AppModal } from '../../../shared/components/AppModal.js'
import { AppToast } from '../../../shared/components/AppToast.js'
import { supabase } from '../../../lib/supabaseClient.js'
import {
  crearClase,
  actualizarClase,
  obtenerAlumnosInscritos,
  inscribirAlumno,
  desinscribirAlumno,
  NIVELES
} from '../api/clasesApi.js'
import {
  escapeHTML,
  getConsistentColor,
  formatHora
} from '../utils/clasesUtils.js'
import { Clase } from '../models/clase.model.js'

/**
 * claseModal - Componente modular para la gestión de clases académicas.
 * Encapsula la lógica de creación/edición, gestión de horarios y alumnos.
 */

let _options = {
  maestros: [],
  salones: [],
  programas: [],
  alumnos: [],
  onSuccess: null
}

const VALIDATION = {
  nombreMax: 100,
  notasMax: 500,
}

/**
 * Abre el modal de clase (Nuevo o Editar)
 */
export async function openClaseModal(clase = null, options = {}) {
  _options = { ..._options, ...options }
  const isEdicion = !!clase
  let inscritosIds = []

  if (isEdicion) {
    AppToast.info('Cargando datos de la clase...')
    const inscritos = await obtenerAlumnosInscritos(clase.id)
    inscritosIds = (inscritos || []).map(i => i.alumno_id)
  }

  const title = isEdicion ? `Editar Clase: ${clase.nombre}` : 'Nueva Clase'
  const saveText = isEdicion ? 'Guardar Cambios' : 'Crear Clase'

  AppModal.open({
    title,
    saveText,
    size: 'lg',
    body: _getClaseFormHTML(clase, inscritosIds),
    onShow: (modalBody) => {
      _attachModalEvents(modalBody, clase)
    },
    onSave: async (modalBody) => {
      return await _handleSave(modalBody, clase)
    }
  })
}

function _getClaseFormHTML(clase, inscritosIds) {
  return `
    <form class="row g-3" id="formClase">
      <div class="col-md-6">
        <label class="form-label-compact">Nombre de la Clase *</label>
        <input type="text" class="form-control input-dense" id="modal-nombre" required placeholder="Ej: Violín Básico A" value="${escapeHTML(clase?.nombre || '')}" maxlength="${VALIDATION.nombreMax}">
      </div>
      <div class="col-md-6">
        <label class="form-label-compact">Instrumento *</label>
        <input type="text" class="form-control input-dense" id="modal-instrumento" list="instrumentos-list" required placeholder="Seleccionar..." value="${escapeHTML(clase?.instrumento || '')}">
        ${_getInstrumentosDatalist()}
      </div>
      <div class="col-md-6">
        <label class="form-label-compact">Programa *</label>
        <select class="form-select input-dense" id="modal-programa_id" required>
          ${_getProgramasOptions(clase?.programa_id)}
        </select>
      </div>
      <div class="col-md-6">
        <label class="form-label-compact">Maestro Titular *</label>
        <select class="form-select input-dense" id="modal-maestro_id" required>
          ${_getMaestrosOptions(clase?.maestro_id)}
        </select>
      </div>
      <div class="col-md-6">
        <label class="form-label-compact">Maestro Suplente</label>
        <select class="form-select input-dense" id="modal-maestro_suplente_id">
          ${_getMaestrosOptions(clase?.maestro_suplente_id)}
        </select>
      </div>
      <div class="col-md-6">
        <label class="form-label-compact">Máx. Alumnos</label>
        <input type="number" class="form-control input-dense" id="modal-max_alumnos" value="${clase?.max_alumnos || 20}" min="1" max="50">
      </div>
      <div class="col-md-6">
        <label class="form-label-compact">Estado</label>
        <select class="form-select input-dense" id="modal-estado">
          ${_getEstadosOptions(clase?.estado || 'activa')}
        </select>
      </div>
      
      <div class="col-12 mt-4">
        <div class="d-flex justify-content-between align-items-center mb-2">
          <label class="form-label-compact mb-0">Horarios y Salones *</label>
          <button type="button" class="btn btn-sm btn-outline-primary" id="btn-add-horario">
            <i class="bi bi-plus-circle me-1"></i> Agregar Horario
          </button>
        </div>
        <div id="modal-horarios-container" class="mb-3">
          ${_renderHorariosContainer(clase?.horarios || [])}
        </div>
      </div>

      <div class="col-12">
        <label class="form-label-compact">Notas Pedagógicas</label>
        <textarea class="form-control input-dense" id="modal-notas_pedagogicas" rows="2" placeholder="Observaciones sobre el grupo o metodología..." maxlength="${VALIDATION.notasMax}">${escapeHTML(clase?.notas_pedagogicas || '')}</textarea>
      </div>

      <div class="col-12 mt-3 border-top pt-3">
        <label class="form-label-compact mb-2"><i class="bi bi-people me-1"></i>Inscribir Alumnos</label>
        ${_getAlumnosSelectorHTML(inscritosIds)}
      </div>
    </form>
  `
}

function _attachModalEvents(modalBody, clase) {
  // Add schedule row
  modalBody.querySelector('#btn-add-horario').addEventListener('click', () => {
    const container = modalBody.querySelector('#modal-horarios-container')
    const index = container.children.length
    const tempDiv = document.createElement('div')
    tempDiv.innerHTML = _renderHorarioRow(null, index)
    container.appendChild(tempDiv.firstElementChild)
  })

  // Remove schedule row
  modalBody.querySelector('#modal-horarios-container').addEventListener('click', (e) => {
    const btn = e.target.closest('.btn-remove-horario')
    if (btn) {
      const container = modalBody.querySelector('#modal-horarios-container')
      if (container.children.length > 1) {
        btn.closest('.horario-row').remove()
      } else {
        AppToast.warning('La clase debe tener al menos un horario')
      }
    }
  })

  // Alumnos filter logic
  const searchInput = modalBody.querySelector('#search-modal-alumnos')
  const listItems = modalBody.querySelectorAll('.alumno-check-item')
  searchInput?.addEventListener('input', (e) => {
    const term = e.target.value.toLowerCase().trim()
    listItems.forEach(item => {
      const match = item.dataset.nombre.includes(term) || item.dataset.instrumento.includes(term)
      item.style.display = match ? 'block' : 'none'
    })
  })

  const checks = modalBody.querySelectorAll('.alumnos-list input[type="checkbox"]')
  const countDisplay = modalBody.querySelector('#alumnos-selection-count')
  const updateCount = () => {
    const selected = Array.from(checks).filter(c => c.checked).length
    countDisplay.textContent = `${selected} alumnos seleccionados`
  }
  checks.forEach(c => c.addEventListener('change', updateCount))
  updateCount()
}

async function _handleSave(modalBody, originalClase) {
  const isEdicion = !!originalClase
  
  const getFormData = () => {
    const maestroSuplenteValue = modalBody.querySelector('#modal-maestro_suplente_id').value
    const data = {
      nombre: modalBody.querySelector('#modal-nombre').value.trim(),
      programa_id: modalBody.querySelector('#modal-programa_id').value,
      maestro_id: modalBody.querySelector('#modal-maestro_id').value,
      maestro_suplente_id: maestroSuplenteValue ? maestroSuplenteValue : null,
      instrumento: modalBody.querySelector('#modal-instrumento').value.trim(),
      max_alumnos: parseInt(modalBody.querySelector('#modal-max_alumnos').value) || 20,
      estado: modalBody.querySelector('#modal-estado').value,
      notas_pedagogicas: modalBody.querySelector('#modal-notas_pedagogicas').value.trim(),
      horarios: Array.from(modalBody.querySelectorAll('.horario-row')).map(row => ({
        dia: row.querySelector('[name="horario-dia"]').value,
        hora_inicio: row.querySelector('[name="horario-hora_inicio"]').value,
        hora_fin: row.querySelector('[name="horario-hora_fin"]').value,
        salon_id: row.querySelector('[name="horario-salon_id"]').value || null,
      }))
    }
    return data
  }

  const formData = getFormData()
  const claseObj = new Clase(formData)
  const errores = claseObj.validate()

  if (errores.length > 0) {
    AppToast.error(errores[0])
    return false
  }

  try {
    let resultClase
    if (isEdicion) {
      resultClase = await actualizarClase(originalClase.id, formData)
      
      // Update enrollment if it changed (optimization: only if edicion)
      // This part requires comparing original vs new IDs, for now simple bulk:
      const newIds = Array.from(modalBody.querySelectorAll('.alumnos-list input[type="checkbox"]:checked')).map(cb => cb.value)
      // Logic for diffing enrollment could be added here
    } else {
      resultClase = await crearClase(formData)
      
      // New enrollment
      const selectedIds = Array.from(modalBody.querySelectorAll('.alumnos-list input[type="checkbox"]:checked')).map(cb => cb.value)
      if (selectedIds.length > 0) {
        await Promise.all(selectedIds.map(aid => inscribirAlumno(resultClase.id, aid)))
      }
    }

    AppToast.success(isEdicion ? 'Clase actualizada' : 'Clase creada')
    if (_options.onSuccess) _options.onSuccess()
    return true
  } catch (err) {
    if (err.isConflict) {
      AppToast.warning(`Conflicto detected: ${err.message}`)
      // Here we could implement the "Force" or "Reubicar" UI if needed
    } else {
      AppToast.error(err.message)
    }
    return false
  }
}

// -- Helpers de Renderizado --

function _getMaestrosOptions(selectedId = '') {
  return `<option value="">Seleccionar maestro...</option>` +
    _options.maestros.map(m => `<option value="${m.id}" ${m.id === selectedId ? 'selected' : ''}>${escapeHTML(m.nombre_completo || m.nombre)}</option>`).join('')
}

function _getSalonesOptions(selectedId = '') {
  return `<option value="">Sin salón (Online/Otro)</option>` +
    _options.salones.map(s => `<option value="${s.id}" ${s.id === selectedId ? 'selected' : ''}>${escapeHTML(s.nombre)}</option>`).join('')
}

function _getProgramasOptions(selectedId = '') {
  return `<option value="">Seleccionar programa...</option>` +
    _options.programas.map(p => `<option value="${p.id}" ${p.id === selectedId ? 'selected' : ''}>${escapeHTML(p.nombre)}</option>`).join('')
}

function _getEstadosOptions(selectedValue = 'activa') {
  return Clase.getEstados().map(e =>
    `<option value="${e}" ${e === selectedValue ? 'selected' : ''}>${Clase.getEstadoLabel(e)}</option>`
  ).join('')
}

function _getInstrumentosDatalist() {
  const inst = ['Violín', 'Viola', 'Cello', 'Piano', 'Flauta', 'Teoría', 'Coro']
  return `<datalist id="instrumentos-list">${inst.map(i => `<option value="${i}">`).join('')}</datalist>`
}

function _renderHorarioRow(horario, index) {
  return `
    <div class="horario-row bg-body-tertiary p-2 rounded mb-2 border" data-index="${index}">
      <div class="row g-2 align-items-center">
        <div class="col-md-4">
          <select class="form-select form-select-sm" name="horario-dia" required>
            <option value="">Día...</option>
            ${['lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'].map(d => `<option value="${d}" ${horario?.dia === d ? 'selected' : ''}>${d.charAt(0).toUpperCase() + d.slice(1)}</option>`).join('')}
          </select>
        </div>
        <div class="col-md-3">
          <input type="time" class="form-control form-control-sm" name="horario-hora_inicio" value="${(horario?.hora_inicio || '').slice(0,5)}" required>
        </div>
        <div class="col-md-3">
          <input type="time" class="form-control form-control-sm" name="horario-hora_fin" value="${(horario?.hora_fin || '').slice(0,5)}" required>
        </div>
        <div class="col-md-2 d-flex justify-content-end">
          <button type="button" class="btn btn-sm btn-link text-danger btn-remove-horario" title="Quitar"><i class="bi bi-x-circle"></i></button>
        </div>
        <div class="col-12 mt-1">
          <select class="form-select form-select-sm" name="horario-salon_id">
            ${_getSalonesOptions(horario?.salon_id)}
          </select>
        </div>
      </div>
    </div>
  `
}

function _renderHorariosContainer(horarios = []) {
  if (horarios.length === 0) return _renderHorarioRow(null, 0)
  return horarios.map((h, i) => _renderHorarioRow(h, i)).join('')
}

function _getAlumnosSelectorHTML(selectedIds = []) {
  const alumnos = _options.alumnos || []
  return `
    <div class="alumnos-selector-container">
      <div class="input-group input-group-sm mb-2">
        <span class="input-group-text"><i class="bi bi-search"></i></span>
        <input type="text" class="form-control" id="search-modal-alumnos" placeholder="Filtrar por nombre o instrumento...">
      </div>
      <div class="alumnos-list border rounded bg-body-tertiary" style="max-height: 200px; overflow-y: auto; padding: 8px;">
        ${alumnos.map(a => `
          <div class="form-check alumno-check-item" data-nombre="${a.nombre_completo.toLowerCase()}" data-instrumento="${(a.instrumento_principal || '').toLowerCase()}">
            <input class="form-check-input" type="checkbox" value="${a.id}" id="chk-a-${a.id}" ${selectedIds.includes(a.id) ? 'checked' : ''}>
            <label class="form-check-label small w-100 cursor-pointer" for="chk-a-${a.id}">
              ${escapeHTML(a.nombre_completo)} <span class="text-muted">(${escapeHTML(a.instrumento_principal || 'N/A')})</span>
            </label>
          </div>
        `).join('')}
      </div>
      <div class="text-end mt-1"><small class="text-muted" id="alumnos-selection-count">0 seleccionados</small></div>
    </div>
  `
}
