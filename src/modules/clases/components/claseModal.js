import { AppModal } from '../../../shared/components/AppModal.js'
import { AppToast } from '../../../shared/components/AppToast.js'
import { supabase } from '../../../lib/supabaseClient.js'
import {
  crearClase,
  actualizarClase,
  obtenerAlumnosInscritos,
  inscribirAlumno,
  desinscribirAlumno,
  actualizarTurnoInscripcion,
  NIVELES
} from '../api/clasesApi.js'
import {
  escapeHTML,
  getConsistentColor,
  formatHora
} from '../utils/clasesUtils.js'
import { Clase } from '../models/clase.model.js'
import { openRutaSelectorModal } from '../../planificacion/components/rutaSelectorModal.js'

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

  let inscritosSlots = []   // full records with hora_inicio/hora_fin per alumno

  if (isEdicion) {
    AppToast.info('Cargando datos de la clase...')
    const inscritos = await obtenerAlumnosInscritos(clase.id)
    inscritosIds   = (inscritos || []).map(i => i.alumno_id)
    inscritosSlots = inscritos || []
  }

  const title = isEdicion ? `Editar Clase: ${clase.nombre}` : 'Nueva Clase'
  const saveText = isEdicion ? 'Guardar Cambios' : 'Crear Clase'

  AppModal.open({
    title,
    saveText,
    size: 'lg',
    body: _getClaseFormHTML(clase, inscritosIds, inscritosSlots),
    onShow: (modalBody) => {
      _attachModalEvents(modalBody, clase)
    },
    onSave: async (modalBody) => {
      return await _handleSave(modalBody, clase)
    }
  })
}

function _getClaseFormHTML(clase, inscritosIds, inscritosSlots = []) {
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
        <label class="form-label-compact">Ruta de Contenido</label>
        <div class="d-flex gap-2">
          <input type="text" class="form-control input-dense" id="modal-ruta-display" readonly placeholder="Seleccionar ruta..." value="${clase?.ruta_id ? 'Ruta seleccionada' : ''}">
          <button type="button" class="btn btn-outline-primary btn-sm" id="btn-seleccionar-ruta" style="white-space: nowrap;">
            <i class="bi bi-diagram-3 me-1"></i>Elegir
          </button>
        </div>
        <input type="hidden" id="modal-ruta_id" value="${clase?.ruta_id || ''}">
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
          ${_getMaestrosOptions(clase?.maestro_principal_id)}
        </select>
      </div>
      <div class="col-md-6">
        <div class="d-flex align-items-center gap-2">
          <label class="form-label-compact mb-0">Maestro Suplente</label>
          <div class="form-check form-switch">
            <input class="form-check-input" type="checkbox" id="modal-tiene_suplente" ${clase?.tiene_suplente ? 'checked' : ''}>
          </div>
        </div>
        <select class="form-select input-dense" id="modal-maestro_suplente_id" style="display: ${clase?.tiene_suplente ? 'block' : 'none'}; margin-top: 8px;">
          ${_getMaestrosOptions(clase?.maestro_suplente_id)}
        </select>
      </div>
      <div class="col-md-6">
        <label class="form-label-compact">Máx. Alumnos</label>
        <input type="number" class="form-control input-dense" id="modal-max_alumnos" value="${clase?.capacidad_maxima || 20}" min="1" max="50">
      </div>
      <div class="col-md-6">
        <label class="form-label-compact">Estado</label>
        <select class="form-select input-dense" id="modal-estado">
          ${_getEstadosOptions(clase?.estado || 'activa')}
        </select>
      </div>
      
      <div class="col-12 mt-3 pt-2 border-top">
        <label class="form-label-compact d-block mb-2"><i class="bi bi-gear me-1"></i> Dinámica de la Clase *</label>
        <div class="d-flex align-items-center bg-body-tertiary p-2 rounded border">
          <div class="form-check me-4">
            <input class="form-check-input cursor-pointer" type="radio" name="modal-tipo_clase" id="tipo-grupal" value="grupal" ${!clase || clase.tipo_clase !== 'rotativa' ? 'checked' : ''}>
            <label class="form-check-label small cursor-pointer lh-sm" for="tipo-grupal">
              <strong>Grupal</strong><br>
              <span class="text-muted" style="font-size: 0.75rem;">Asistencia global, todos los alumnos asisten en el mismo horario.</span>
            </label>
          </div>
          <div class="form-check">
            <input class="form-check-input cursor-pointer" type="radio" name="modal-tipo_clase" id="tipo-rotativa" value="rotativa" ${clase?.tipo_clase === 'rotativa' ? 'checked' : ''}>
            <label class="form-check-label small cursor-pointer lh-sm" for="tipo-rotativa">
              <strong>Rotativa (Turnos)</strong><br>
              <span class="text-muted" style="font-size: 0.75rem;">Clase individual o micro-grupos. Se asignan slots de tiempo a cada alumno.</span>
            </label>
          </div>
        </div>
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
        <textarea class="form-control input-dense" id="modal-notas_pedagogicas" rows="2" placeholder="Observaciones sobre el grupo o metodología..." maxlength="${VALIDATION.notasMax}">${escapeHTML(clase?.descripcion || '')}</textarea>
      </div>

      <div class="col-12 mt-3 border-top pt-3" id="seccion-alumnos-grupal" style="display:${clase?.tipo_clase === 'rotativa' ? 'none' : 'block'}">
        <label class="form-label-compact mb-2"><i class="bi bi-people me-1"></i>Inscribir Alumnos</label>
        ${_getAlumnosSelectorHTML(inscritosIds)}
      </div>

      <div class="col-12 mt-3 border-top pt-3" id="seccion-alumnos-rotativa" style="display:${clase?.tipo_clase === 'rotativa' ? 'block' : 'none'}">
        <label class="form-label-compact mb-2"><i class="bi bi-person-lines-fill me-1"></i>Turnos individuales</label>
        ${_getSlotBuilderHTML(inscritosSlots)}
      </div>
    </form>
  `
}

function _getSlotBuilderHTML(inscritosSlots = []) {
  const alumnos = _options.alumnos || []

  const slotRow = (alumnoId = '', horaInicio = '', horaFin = '') => {
    const alumno = alumnos.find(a => a.id === alumnoId)
    return `
      <div class="slot-row d-flex align-items-center gap-2 mb-2 p-2 rounded border bg-body-tertiary">
        <select class="form-select form-select-sm slot-alumno-select flex-grow-1" style="min-width:0;" required>
          <option value="">Seleccionar alumno…</option>
          ${alumnos.map(a => `
            <option value="${a.id}" ${a.id === alumnoId ? 'selected' : ''}>
              ${escapeHTML(a.nombre_completo)}${a.instrumento_principal ? ` — ${escapeHTML(a.instrumento_principal)}` : ''}
            </option>`).join('')}
        </select>
        <div class="d-flex align-items-center gap-1 flex-shrink-0">
          <input type="time" class="form-control form-control-sm slot-hora-inicio" value="${horaInicio}" style="width:110px;" required title="Hora inicio">
          <span class="text-muted small">–</span>
          <input type="time" class="form-control form-control-sm slot-hora-fin" value="${horaFin}" style="width:110px;" required title="Hora fin">
        </div>
        <button type="button" class="btn btn-sm btn-link text-danger p-0 btn-remove-slot" title="Quitar turno">
          <i class="bi bi-x-circle-fill fs-5"></i>
        </button>
      </div>`
  }

  const existingRows = inscritosSlots.length
    ? inscritosSlots.map(s => slotRow(
        s.alumno_id,
        (s.hora_inicio || '').slice(0, 5),
        (s.hora_fin   || '').slice(0, 5)
      )).join('')
    : slotRow()   // Una fila vacía por defecto

  return `
    <div id="slots-container" class="mb-2">
      ${existingRows}
    </div>
    <button type="button" class="btn btn-sm btn-outline-primary w-100" id="btn-add-slot">
      <i class="bi bi-plus-circle me-1"></i> Agregar turno
    </button>
    <div class="text-end mt-1">
      <small class="text-muted" id="slots-count">
        ${inscritosSlots.length || 0} turno${inscritosSlots.length !== 1 ? 's' : ''} asignado${inscritosSlots.length !== 1 ? 's' : ''}
      </small>
    </div>`
}

function _attachModalEvents(modalBody, clase) {
  // Botón para seleccionar ruta
  const btnSeleccionarRuta = modalBody.querySelector('#btn-seleccionar-ruta')
  if (btnSeleccionarRuta) {
    btnSeleccionarRuta.addEventListener('click', async (e) => {
      e.preventDefault()
      const instrumento = modalBody.querySelector('#modal-instrumento')?.value?.trim()
      if (!instrumento) {
        AppToast.warning('Selecciona un instrumento primero')
        return
      }

      openRutaSelectorModal(instrumento, 'Cualquier Nivel', (rutaId) => {
        modalBody.querySelector('#modal-ruta_id').value = rutaId
        modalBody.querySelector('#modal-ruta-display').value = 'Ruta seleccionada ✓'
        AppToast.success('Ruta asignada a la clase')
      })
    })
  }

  // Switch para maestro suplente
  const switchSuplente = modalBody.querySelector('#modal-tiene_suplente')
  const selectSuplente = modalBody.querySelector('#modal-maestro_suplente_id')

  if (switchSuplente && selectSuplente) {
    switchSuplente.addEventListener('change', (e) => {
      selectSuplente.style.display = e.target.checked ? 'block' : 'none'
      if (!e.target.checked) {
        selectSuplente.value = '' // Limpiar selección si se desactiva
      }
    })
  }

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

  // ── Toggle grupal ↔ rotativa ─────────────────────────────────────────────
  const seccionGrupal   = modalBody.querySelector('#seccion-alumnos-grupal')
  const seccionRotativa = modalBody.querySelector('#seccion-alumnos-rotativa')

  modalBody.querySelectorAll('input[name="modal-tipo_clase"]').forEach(radio => {
    radio.addEventListener('change', () => {
      const esRotativa = modalBody.querySelector('input[name="modal-tipo_clase"]:checked')?.value === 'rotativa'
      seccionGrupal.style.display   = esRotativa ? 'none'  : 'block'
      seccionRotativa.style.display = esRotativa ? 'block' : 'none'
    })
  })

  // ── Slot builder events ───────────────────────────────────────────────────
  const slotsContainer = modalBody.querySelector('#slots-container')
  const slotsCount     = modalBody.querySelector('#slots-count')

  const _updateSlotsCount = () => {
    const n = slotsContainer.querySelectorAll('.slot-row').length
    slotsCount.textContent = `${n} turno${n !== 1 ? 's' : ''} asignado${n !== 1 ? 's' : ''}`
  }

  // Agregar turno
  modalBody.querySelector('#btn-add-slot')?.addEventListener('click', () => {
    const alumnos = _options.alumnos || []
    const temp = document.createElement('div')
    temp.innerHTML = _getSlotBuilderHTML([]).split('id="slots-container"')[1]
      ? '' : ''
    // Build a single empty row and append
    const emptyRow = document.createElement('div')
    emptyRow.className = 'slot-row d-flex align-items-center gap-2 mb-2 p-2 rounded border bg-body-tertiary'
    emptyRow.innerHTML = `
      <select class="form-select form-select-sm slot-alumno-select flex-grow-1" style="min-width:0;" required>
        <option value="">Seleccionar alumno…</option>
        ${alumnos.map(a => `<option value="${a.id}">${escapeHTML(a.nombre_completo)}${a.instrumento_principal ? ` — ${escapeHTML(a.instrumento_principal)}` : ''}</option>`).join('')}
      </select>
      <div class="d-flex align-items-center gap-1 flex-shrink-0">
        <input type="time" class="form-control form-control-sm slot-hora-inicio" style="width:110px;" required title="Hora inicio">
        <span class="text-muted small">–</span>
        <input type="time" class="form-control form-control-sm slot-hora-fin" style="width:110px;" required title="Hora fin">
      </div>
      <button type="button" class="btn btn-sm btn-link text-danger p-0 btn-remove-slot" title="Quitar turno">
        <i class="bi bi-x-circle-fill fs-5"></i>
      </button>`
    slotsContainer.appendChild(emptyRow)
    _updateSlotsCount()
  })

  // Quitar turno (delegado)
  slotsContainer?.addEventListener('click', e => {
    if (e.target.closest('.btn-remove-slot')) {
      const rows = slotsContainer.querySelectorAll('.slot-row')
      if (rows.length <= 1) {
        AppToast.warning('Debe haber al menos un turno en una clase rotativa')
        return
      }
      e.target.closest('.slot-row').remove()
      _updateSlotsCount()
    }
  })

  // ── Alumnos grupal: filtro + contador ────────────────────────────────────
  const searchInput = modalBody.querySelector('#search-modal-alumnos')
  const listItems   = modalBody.querySelectorAll('.alumno-check-item')
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
    if (countDisplay) countDisplay.textContent = `${selected} alumnos seleccionados`
  }
  checks.forEach(c => c.addEventListener('change', updateCount))
  updateCount()
}

async function _handleSave(modalBody, originalClase) {
  const isEdicion = !!originalClase

  const getFormData = () => {
    const maestroSuplenteValue = modalBody.querySelector('#modal-maestro_suplente_id').value
    const tieneSuplente = modalBody.querySelector('#modal-tiene_suplente').checked

    const data = {
      nombre: modalBody.querySelector('#modal-nombre').value.trim(),
      programa_id: modalBody.querySelector('#modal-programa_id').value,
      maestro_principal_id: modalBody.querySelector('#modal-maestro_id').value,
      maestro_suplente_id: tieneSuplente ? maestroSuplenteValue : null,
      tiene_suplente: tieneSuplente,
      instrumento: modalBody.querySelector('#modal-instrumento').value.trim(),
      capacidad_maxima: parseInt(modalBody.querySelector('#modal-max_alumnos').value) || 20,
      estado: modalBody.querySelector('#modal-estado').value,
      tipo_clase: modalBody.querySelector('input[name="modal-tipo_clase"]:checked')?.value || 'grupal',
      descripcion: modalBody.querySelector('#modal-notas_pedagogicas').value.trim(),
      ruta_id: modalBody.querySelector('#modal-ruta_id')?.value || null,
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

  // ── Helpers para leer slots del panel rotativa ───────────────────────────
  const _readSlots = () =>
    Array.from(modalBody.querySelectorAll('#slots-container .slot-row')).map(row => ({
      alumno_id:   row.querySelector('.slot-alumno-select').value,
      hora_inicio: row.querySelector('.slot-hora-inicio').value,
      hora_fin:    row.querySelector('.slot-hora-fin').value,
    })).filter(s => s.alumno_id)

  const _syncGrupal = async (claseId) => {
    const newIds = Array.from(modalBody.querySelectorAll('.alumnos-list input[type="checkbox"]:checked')).map(cb => cb.value)
    const currentEnrolled = await obtenerAlumnosInscritos(claseId)
    const currentIds = currentEnrolled.map(i => i.alumno_id)
    const toAdd    = newIds.filter(id => !currentIds.includes(id))
    const toRemove = currentIds.filter(id => !newIds.includes(id))
    await Promise.all([
      ...toAdd.map(aid    => inscribirAlumno(claseId, aid)),
      ...toRemove.map(aid => desinscribirAlumno(claseId, aid)),
    ])
  }

  const _syncRotativa = async (claseId) => {
    const slots = _readSlots()
    if (slots.length === 0) { AppToast.warning('Agregá al menos un turno'); return false }

    // Validate all slots have times
    const incomplete = slots.find(s => !s.hora_inicio || !s.hora_fin)
    if (incomplete) { AppToast.error('Todos los turnos deben tener hora de inicio y fin'); return false }

    const currentEnrolled = await obtenerAlumnosInscritos(claseId)
    const currentIds = currentEnrolled.map(i => i.alumno_id)
    const newIds     = slots.map(s => s.alumno_id)

    // Remove alumnos no longer in the list
    const toRemove = currentIds.filter(id => !newIds.includes(id))
    await Promise.all(toRemove.map(aid => desinscribirAlumno(claseId, aid)))

    // Upsert each slot: update time if already enrolled, insert if new
    await Promise.all(slots.map(s =>
      currentIds.includes(s.alumno_id)
        ? actualizarTurnoInscripcion(claseId, s.alumno_id, s.hora_inicio, s.hora_fin)
        : inscribirAlumno(claseId, s.alumno_id, s.hora_inicio, s.hora_fin)
    ))
    return true
  }

  try {
    let resultClase
    if (isEdicion) {
      resultClase = await actualizarClase(originalClase.id, formData)
      if (formData.tipo_clase === 'rotativa') {
        const ok = await _syncRotativa(resultClase.id)
        if (!ok) return false
      } else {
        await _syncGrupal(resultClase.id)
      }
    } else {
      resultClase = await crearClase(formData)
      if (formData.tipo_clase === 'rotativa') {
        const ok = await _syncRotativa(resultClase.id)
        if (!ok) return false
      } else {
        const selectedIds = Array.from(modalBody.querySelectorAll('.alumnos-list input[type="checkbox"]:checked')).map(cb => cb.value)
        if (selectedIds.length > 0) {
          await Promise.all(selectedIds.map(aid => inscribirAlumno(resultClase.id, aid)))
        }
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
          <input type="time" class="form-control form-control-sm" name="horario-hora_inicio" value="${(horario?.hora_inicio || '').slice(0, 5)}" required>
        </div>
        <div class="col-md-3">
          <input type="time" class="form-control form-control-sm" name="horario-hora_fin" value="${(horario?.hora_fin || '').slice(0, 5)}" required>
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
