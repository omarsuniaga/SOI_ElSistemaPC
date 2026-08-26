import { normalizeText } from '../../../core/utils/normalizeText.js'
import { AppModal } from '../../../shared/components/AppModal.js'
import { AppToast } from '../../../shared/components/AppToast.js'
import {
  crearClase,
  actualizarClase,
  eliminarClase,
  obtenerAlumnosInscritos,
  inscribirAlumno,
  desinscribirAlumno,
  actualizarTurnoInscripcion,
  verificarSolapamientoCompleto,
  resolverConflictosClases,
} from '../api/clasesApi.js'
import { supabase } from '../../../lib/supabaseClient.js'
import {
  escapeHTML,
  timeToMinutes,
  minutesToTime,
  rendimientoBadgeHTML,
} from '../utils/clasesUtils.js'
import { Clase } from '../models/clase.model.js'
import { openRutaSelectorModal } from '../../planificacion/components/rutaSelectorModal.js'
import { alumnoCoincideBusqueda } from './claseModal.helpers.js'

/**
 * claseModal - Componente modular para la gestión de clases académicas.
 * Encapsula la lógica de creación/edición, gestión de horarios y alumnos.
 */

const DEFAULT_OPTIONS = {
  maestros: [],
  salones: [],
  programas: [],
  alumnos: [],
  onSuccess: null,
  lockedPrincipalTeacherId: null,
  lockedPrincipalTeacherLabel: '',
  allowPrincipalTeacherSelection: true,
}

let _options = { ...DEFAULT_OPTIONS }

const VALIDATION = {
  nombreMax: 100,
  notasMax: 500,
}

/**
 * Abre el modal de clase (Nuevo o Editar)
 */
export async function openClaseModal(clase = null, options = {}) {
  _options = { ...DEFAULT_OPTIONS, ...options }
  const isEdicion = !!clase
  let inscritosIds = []

  let inscritosSlots = []   // full records with hora_inicio/hora_fin per alumno

  AppToast.info(isEdicion ? 'Cargando datos de la clase y alumnos...' : 'Cargando catálogo...')

  const fetchPromises = []

  // Si no se pasaron alumnos, cargarlos directamente de la base de datos
  if (!_options.alumnos || _options.alumnos.length === 0) {
    fetchPromises.push(
      supabase
        .from('alumnos')
        .select('*')
        .order('nombre_completo', { ascending: true })
        .then(({ data }) => {
          _options.alumnos = data || []
        })
    )
  }

  // Si es edición, cargar los alumnos actualmente inscritos
  if (isEdicion) {
    fetchPromises.push(
      obtenerAlumnosInscritos(clase.id).then((inscritos) => {
        const inscritosOrdenados = [...(inscritos || [])].sort((a, b) => {
          const an = (a.alumno?.nombre_completo || a.alumno?.nombre || '').toString().toLocaleLowerCase('es')
          const bn = (b.alumno?.nombre_completo || b.alumno?.nombre || '').toString().toLocaleLowerCase('es')
          return an.localeCompare(bn, 'es')
        })
        inscritosIds   = inscritosOrdenados.map(i => i.alumno_id)
        inscritosSlots = inscritosOrdenados
      })
    )
  }

  await Promise.all(fetchPromises)

  const title = isEdicion ? `Editar Clase: ${clase.nombre}` : 'Nueva Clase'
  const saveText = isEdicion ? 'Guardar Cambios' : 'Crear Clase'

  AppModal.open({
    title,
    saveText,
    deleteText: '<i class="bi bi-trash3-fill" style="font-size:1.1rem;"></i>',
    onDelete: isEdicion ? async () => {
      try {
        await eliminarClase(clase.id)
        AppToast.success('Clase eliminada correctamente.')
        if (_options.onSuccess) {
          await _options.onSuccess()
        }
        return true
      } catch (err) {
        AppToast.error('Error al eliminar la clase: ' + err.message)
        return false
      }
    } : null,
    size: 'view',
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
  const selectedPrincipalTeacherId = clase?.maestro_principal_id || _options.lockedPrincipalTeacherId || ''
  const principalTeacherLabel =
    _options.lockedPrincipalTeacherLabel ||
    _options.maestros.find((maestro) => maestro.id === selectedPrincipalTeacherId)?.nombre_completo ||
    _options.maestros.find((maestro) => maestro.id === selectedPrincipalTeacherId)?.nombre ||
    'Maestro asignado'

  const esRotativa = Boolean(
    clase?.tipo_clase === 'rotativa' ||
    clase?.tipo_clase === 'rotativo' ||
    clase?.tipo_clase === 'individual' ||
    (inscritosSlots && inscritosSlots.some(s => Boolean(s.hora_inicio || s.hora_fin)))
  )

  return `
    <form class="container-fluid p-0" id="formClase">
      <div class="row g-3">
        
        <!-- COLUMNA 1: Datos Académicos & Cátedra (25%) -->
        <div class="col-12 col-lg-3">
          <div class="card border-0 shadow-sm rounded-4 p-3 bg-body h-100 border border-body-tertiary d-flex flex-column gap-2.5">
            <h6 class="fw-bold mb-2 text-body d-flex align-items-center" style="font-size: 0.9rem;">
              <i class="bi bi-info-circle text-primary me-2"></i>1. Cátedra & Docente
            </h6>

            <div>
              <label class="form-label-compact">Nombre de la Clase *</label>
              <input type="text" class="form-control input-dense" id="modal-nombre" required placeholder="Ej: Violín Básico A" value="${escapeHTML(clase?.nombre || '')}" maxlength="${VALIDATION.nombreMax}">
            </div>

            <div>
              <label class="form-label-compact">Instrumento / Cátedra *</label>
              <input type="text" class="form-control input-dense" id="modal-instrumento" list="instrumentos-list" required placeholder="Seleccionar..." value="${escapeHTML(clase?.instrumento || '')}">
              ${_getInstrumentosDatalist()}
            </div>

            <div>
              <label class="form-label-compact">Maestro Titular *</label>
              ${_options.allowPrincipalTeacherSelection
                ? `<select class="form-select input-dense" id="modal-maestro_id" required>
                    ${_getMaestrosOptions(selectedPrincipalTeacherId)}
                  </select>`
                : `<input type="text" class="form-control input-dense" value="${escapeHTML(principalTeacherLabel)}" readonly>
                   <input type="hidden" id="modal-maestro_id" value="${escapeHTML(selectedPrincipalTeacherId)}">`
              }
            </div>

            <div>
              <div class="d-flex align-items-center gap-2 mb-1">
                <label class="form-label-compact mb-0">Maestro Suplente</label>
                <div class="form-check form-switch">
                  <input class="form-check-input" type="checkbox" id="modal-tiene_suplente" ${clase?.tiene_suplente ? 'checked' : ''}>
                </div>
              </div>
              <select class="form-select input-dense" id="modal-maestro_suplente_id" style="display: ${clase?.tiene_suplente ? 'block' : 'none'};">
                ${_getMaestrosOptions(clase?.maestro_suplente_id)}
              </select>
            </div>

            <div class="row g-2">
              <div class="col-6">
                <label class="form-label-compact">Programa *</label>
                <select class="form-select input-dense" id="modal-programa_id" required>
                  ${_getProgramasOptions(clase?.programa_id)}
                </select>
              </div>
              <div class="col-6">
                <label class="form-label-compact">Estado</label>
                <select class="form-select input-dense" id="modal-estado">
                  ${_getEstadosOptions(clase?.estado || 'activa')}
                </select>
              </div>
            </div>

            <div>
              <label class="form-label-compact">Ruta de Contenido</label>
              <div class="d-flex gap-2">
                <input type="text" class="form-control input-dense" id="modal-ruta-display" readonly placeholder="Seleccionar ruta..." value="${clase?.ruta_id ? 'Ruta seleccionada' : ''}">
                <button type="button" class="btn btn-sm btn-outline-primary d-inline-flex align-items-center gap-1 px-2.5 py-1 rounded-3 shadow-xs" id="btn-seleccionar-ruta" style="white-space: nowrap; font-size: 0.78rem;">
                  <i class="bi bi-diagram-3-fill"></i>
                  <span>Elegir</span>
                </button>
              </div>
              <input type="hidden" id="modal-ruta_id" value="${clase?.ruta_id || ''}">
            </div>

            <div class="row g-2">
              <div class="col-6">
                <label class="form-label-compact">Capacidad Máx.</label>
                <input type="number" class="form-control input-dense" id="modal-max_alumnos" value="${clase?.capacidad_maxima || 20}" min="1" max="80">
              </div>
              <div class="col-6">
                <label class="form-label-compact">Dinámica</label>
                <select class="form-select input-dense" id="modal-tipo_clase_select">
                  <option value="grupal" ${!esRotativa ? 'selected' : ''}>Grupal</option>
                  <option value="rotativa" ${esRotativa ? 'selected' : ''}>Rotativa (Turnos)</option>
                </select>
                <input type="radio" name="modal-tipo_clase" id="tipo-grupal" value="grupal" ${!esRotativa ? 'checked' : ''} style="display:none;">
                <input type="radio" name="modal-tipo_clase" id="tipo-rotativa" value="rotativa" ${esRotativa ? 'checked' : ''} style="display:none;">
              </div>
            </div>

          </div>
        </div>

        <!-- COLUMNA 2: Horarios Semanales & Salón (25%) -->
        <div class="col-12 col-lg-3">
          <div class="card border-0 shadow-sm rounded-4 p-3 bg-body h-100 border border-body-tertiary d-flex flex-column justify-content-between">
            <div>
              <div class="d-flex justify-content-between align-items-center pb-2 mb-2 border-bottom">
                <h6 class="fw-bold mb-0 text-body d-flex align-items-center" style="font-size: 0.9rem;">
                  <i class="bi bi-clock text-primary me-2"></i>2. Horario & Salón
                </h6>
                <button type="button" class="btn btn-sm btn-outline-primary d-inline-flex align-items-center gap-1 px-2.5 py-1 rounded-3 fw-semibold shadow-xs" id="btn-add-horario" style="font-size:0.75rem;">
                  <i class="bi bi-plus-circle-fill"></i>
                  <span>Bloque</span>
                </button>
              </div>

              <div id="modal-horarios-container" class="mb-3" style="max-height: calc(92vh - 380px); overflow-y: auto;">
                ${_renderHorariosContainer(clase?.horarios || [])}
              </div>
            </div>

            <div>
              <label class="form-label-compact">Notas Pedagógicas / Observaciones</label>
              <textarea class="form-control input-dense" id="modal-notas_pedagogicas" rows="3" placeholder="Observaciones sobre la metodología o dinámica..." maxlength="${VALIDATION.notasMax}">${escapeHTML(clase?.descripcion || '')}</textarea>
            </div>
          </div>
        </div>

        <!-- COLUMNA 3: Nómina & Asignación Rápida de Alumnos (50%) -->
        <div class="col-12 col-lg-6">
          <div class="card border-0 shadow-sm rounded-4 p-3 bg-body h-100 border border-body-tertiary d-flex flex-column">
            
            <div class="d-flex justify-content-between align-items-center pb-2 mb-2 border-bottom">
              <h6 class="fw-bold mb-0 text-body d-flex align-items-center" style="font-size: 0.9rem;">
                <i class="bi bi-people text-primary me-2"></i>3. Nómina de Alumnos
              </h6>
              <span class="badge bg-primary text-white rounded-pill" id="badge-total-alumnos-modal">${inscritosIds.length}</span>
            </div>

            <div class="flex-grow-1 overflow-auto" id="seccion-alumnos-grupal" style="display:${esRotativa ? 'none' : 'block'}; max-height: calc(92vh - 240px);">
              ${_getAlumnosSelectorHTML(inscritosIds)}
            </div>

            <div class="flex-grow-1 overflow-auto" id="seccion-alumnos-rotativa" style="display:${esRotativa ? 'block' : 'none'}; max-height: calc(92vh - 240px);">
              ${_getSlotBuilderHTML(inscritosSlots)}
            </div>

          </div>
        </div>

      </div>
    </form>
  `
}

function _getSlotBuilderHTML(inscritosSlots = []) {
  const alumnos = _options.alumnos || []
  const alumnosMap = new Map(alumnos.map(a => [a.id, a]))

  // Agrupar alumnos inscritos por franja horaria (hora_inicio + hora_fin)
  const slotsGroupMap = new Map()

  inscritosSlots.forEach(s => {
    const key = `${(s.hora_inicio || '00:00').slice(0, 5)}-${(s.hora_fin || '00:00').slice(0, 5)}`
    if (!slotsGroupMap.has(key)) {
      slotsGroupMap.set(key, {
        hora_inicio: (s.hora_inicio || '00:00').slice(0, 5),
        hora_fin: (s.hora_fin || '00:00').slice(0, 5),
        alumnosIds: [],
      })
    }
    if (s.alumno_id) {
      slotsGroupMap.get(key).alumnosIds.push(s.alumno_id)
    }
  })

  const existingCards = Array.from(slotsGroupMap.values()).sort((a, b) => {
    return timeToMinutes(a.hora_inicio || '23:59') - timeToMinutes(b.hora_inicio || '23:59')
  })

  const cardsHtml = existingCards.length > 0
    ? existingCards.map(s => _renderSlotCardHTML(s, alumnos, alumnosMap)).join('')
    : _renderSlotCardHTML({ hora_inicio: '15:00', hora_fin: '15:30', alumnosIds: [] }, alumnos, alumnosMap)

  return `
    <div class="rotativa-container">
      <!-- Barra Superior con Filtro y Acciones Rápidas -->
      <div class="d-flex flex-wrap gap-2 mb-2.5 align-items-center justify-content-between pb-2 border-bottom">
        <div class="d-flex align-items-center gap-2 flex-wrap">
          <button type="button" class="btn btn-sm btn-outline-primary d-inline-flex align-items-center gap-1.5 px-3 py-1 rounded-3 fw-semibold shadow-xs" id="btn-add-slot" style="font-size:0.78rem;">
            <i class="bi bi-plus-circle-fill"></i>
            <span>Nuevo Turno</span>
          </button>

          <div class="input-group input-group-sm rounded-3 shadow-xs overflow-hidden" style="width: 215px;">
            <span class="input-group-text bg-body-tertiary border-end-0 py-1 text-muted" style="font-size:0.75rem;"><i class="bi bi-clock me-1"></i> Franja</span>
            <select class="form-select form-select-sm border-start-0 border-end-0 py-1" id="slot-duration-select" title="Duración para auto-generar" style="font-size:0.78rem;">
              <option value="15">15 min</option>
              <option value="20">20 min</option>
              <option value="30" selected>30 min</option>
              <option value="45">45 min</option>
              <option value="60">60 min (1h)</option>
              <option value="custom">Personalizado…</option>
            </select>
            <button type="button" class="btn btn-sm btn-outline-success d-inline-flex align-items-center gap-1 px-2.5 py-1" id="btn-auto-slots" title="Generar franjas según el horario global y la duración" style="font-size:0.78rem;">
              <i class="bi bi-magic"></i>
              <span>Auto</span>
            </button>
          </div>
        </div>

        <button type="button" class="btn btn-sm btn-outline-secondary d-inline-flex align-items-center gap-1 px-2.5 py-1 rounded-3 shadow-xs" id="btn-sort-slots" title="Ordenar turnos por hora" style="font-size:0.78rem;">
          <i class="bi bi-sort-numeric-down"></i>
          <span>Ordenar</span>
        </button>
      </div>

      <div id="slots-container" class="mb-2" style="max-height: calc(92vh - 350px); overflow-y: auto;">
        ${cardsHtml}
      </div>

      <div class="d-flex justify-content-between align-items-center mt-1 px-1">
        <small class="text-muted" style="font-size:0.75rem;">Podés asignar 1, 2 o más alumnos por cada turno (Micro-Grupos)</small>
        <small class="fw-bold text-primary" id="slots-count">
          ${inscritosSlots.length || 0} alumno(s) asignados
        </small>
      </div>
    </div>
  `
}

function _renderSlotCardHTML(slot, alumnos = [], alumnosMap = new Map()) {
  const startMin = timeToMinutes(slot.hora_inicio || '00:00')
  const endMin = timeToMinutes(slot.hora_fin || '00:00')
  const durMin = Math.max(0, endMin - startMin)

  const alumnosDelTurno = (slot.alumnosIds || [])
    .map(id => alumnosMap.get(id))
    .filter(Boolean)

  return `
    <div class="slot-card p-3 rounded-3 border bg-body mb-2.5 shadow-xs">
      <div class="d-flex justify-content-between align-items-center mb-2 flex-wrap gap-1">
        <div class="d-flex align-items-center gap-1.5 flex-wrap">
          <span class="badge bg-primary-subtle text-primary border border-primary-subtle fw-semibold" style="font-size:0.75rem;">
            <i class="bi bi-clock me-1"></i>Turno
          </span>
          <div class="d-flex align-items-center gap-1">
            <input type="time" class="form-control form-control-sm slot-hora-inicio input-dense" value="${slot.hora_inicio || ''}" style="width:105px;" required>
            <span class="text-muted small">–</span>
            <input type="time" class="form-control form-control-sm slot-hora-fin input-dense" value="${slot.hora_fin || ''}" style="width:105px;" required>
          </div>
          <span class="badge bg-body-tertiary text-muted border small slot-duracion-badge">${durMin > 0 ? `${durMin} min` : 'Turno'}</span>
        </div>
        
        <button type="button" class="btn btn-sm btn-link text-danger p-0 btn-remove-slot" title="Eliminar este turno completo">
          <i class="bi bi-trash3 fs-6"></i>
        </button>
      </div>

      <!-- Alumnos Asignados a este Turno (Soporte Multi-Alumno / Micro-Grupo) -->
      <div class="slot-alumnos-container d-flex flex-column gap-1.5 mb-2">
        ${alumnosDelTurno.length > 0 ? alumnosDelTurno.map(a => `
          <div class="slot-alumno-pill d-flex align-items-center justify-content-between p-1.5 px-2 rounded-2 bg-body-tertiary border" data-alumno-id="${a.id}">
            <div class="d-flex align-items-center gap-2 text-truncate me-2">
              <i class="bi bi-person-fill text-primary"></i>
              <strong class="text-body small text-truncate">${escapeHTML(a.nombre_completo)}</strong>
              <span class="text-muted small text-truncate">${a.instrumento_principal ? `· ${escapeHTML(a.instrumento_principal)}` : ''}</span>
            </div>
            <button type="button" class="btn btn-sm btn-link text-danger p-0 btn-remove-alumno-from-slot" title="Quitar alumno de este turno">
              <i class="bi bi-x-circle-fill"></i>
            </button>
          </div>
        `).join('') : `
          <div class="slot-empty-notice small text-muted fst-italic p-1.5 px-2 bg-body-tertiary rounded-2 border border-dashed text-center">
            Sin alumnos asignados a este turno todavía.
          </div>
        `}
      </div>

      <!-- Asignador Interactivo con Buscador en Tiempo Real -->
      <div class="slot-add-alumno-wrapper">
        <button type="button" class="btn btn-sm btn-outline-primary rounded-3 btn-toggle-add-alumno d-inline-flex align-items-center gap-1.5 px-2.5 py-1 fw-semibold shadow-xs" style="font-size:0.78rem;">
          <i class="bi bi-person-plus-fill"></i>
          <span>+ Asignar Alumnos</span>
        </button>

        <div class="slot-add-alumno-panel p-2 rounded-3 border bg-body-tertiary shadow-xs mt-2" style="display:none;">
          <div class="input-group input-group-sm mb-2">
            <span class="input-group-text bg-body border-end-0"><i class="bi bi-search text-muted"></i></span>
            <input type="text" class="form-control input-dense slot-alumno-search-input border-start-0" placeholder="Escribir nombre o instrumento...">
            <button type="button" class="btn btn-sm btn-outline-secondary btn-close-add-panel" title="Cerrar"><i class="bi bi-x"></i></button>
          </div>

          <div class="slot-alumno-search-results d-flex flex-column gap-1 overflow-auto" style="max-height: 160px;">
            <!-- Resultados renderizados dinámicamente -->
          </div>
        </div>
      </div>
    </div>
  `
}

function _attachModalEvents(modalBody, _clase) {
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
  modalBody.querySelector('#btn-add-horario')?.addEventListener('click', () => {
    const container = modalBody.querySelector('#modal-horarios-container')
    const index = container.children.length
    const tempDiv = document.createElement('div')
    tempDiv.innerHTML = _renderHorarioRow(null, index)
    container.appendChild(tempDiv.firstElementChild)
  })

  // Remove schedule row
  modalBody.querySelector('#modal-horarios-container')?.addEventListener('click', (e) => {
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
  const selectTipoClase = modalBody.querySelector('#modal-tipo_clase_select')

  if (selectTipoClase) {
    selectTipoClase.addEventListener('change', (e) => {
      const val = e.target.value
      const radio = modalBody.querySelector(`input[name="modal-tipo_clase"][value="${val}"]`)
      if (radio) {
        radio.checked = true
        radio.dispatchEvent(new Event('change'))
      }
    })
  }

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
    if (!slotsContainer || !slotsCount) return
    const totalPills = slotsContainer.querySelectorAll('.slot-alumno-pill').length
    const totalCards = slotsContainer.querySelectorAll('.slot-card').length
    slotsCount.textContent = `${totalPills} alumno(s) en ${totalCards} turno(s)`
  }

  // 1. Agregar Turno Nuevo
  modalBody.querySelector('#btn-add-slot')?.addEventListener('click', () => {
    const alumnos = _options.alumnos || []
    const alumnosMap = new Map(alumnos.map(a => [a.id, a]))
    const temp = document.createElement('div')
    temp.innerHTML = _renderSlotCardHTML({ hora_inicio: '15:00', hora_fin: '15:30', alumnosIds: [] }, alumnos, alumnosMap)
    slotsContainer.appendChild(temp.firstElementChild)
    _updateSlotsCount()
  })

  // Helper para renderizar los resultados de búsqueda de alumnos en el panel
  const _renderSearchResultsInPanel = (panel, term = '') => {
    const resultsContainer = panel.querySelector('.slot-alumno-search-results')
    if (!resultsContainer) return
    const card = panel.closest('.slot-card')
    const assignedIds = new Set(Array.from(card.querySelectorAll('.slot-alumno-pill')).map(p => p.dataset.alumnoId))
    const alumnos = _options.alumnos || []
    const normTerm = normalizeText(term)

    const filtered = alumnos.filter(a => {
      if (!normTerm) return true
      const n = normalizeText(a.nombre_completo || '')
      const inst = normalizeText(a.instrumento_principal || '')
      return n.includes(normTerm) || inst.includes(normTerm)
    }).slice(0, 30)

    if (filtered.length === 0) {
      resultsContainer.innerHTML = `
        <div class="small text-muted p-2 text-center">
          No se encontraron alumnos con "${escapeHTML(term)}"
        </div>
      `
      return
    }

    resultsContainer.innerHTML = filtered.map(a => {
      const isAlreadyAssigned = assignedIds.has(a.id)
      return `
        <div class="d-flex align-items-center justify-content-between p-1.5 px-2 rounded-2 bg-body border ${isAlreadyAssigned ? 'opacity-50' : ''}">
          <div class="small text-truncate me-2">
            <strong class="text-body">${escapeHTML(a.nombre_completo)}</strong>
            <span class="text-muted small">· ${escapeHTML(a.instrumento_principal || 'General')}</span>
          </div>
          <button type="button" class="btn btn-xs ${isAlreadyAssigned ? 'btn-success disabled' : 'btn-primary'} py-0.5 px-2 rounded-pill btn-quick-assign-alumno" data-alumno-id="${a.id}" data-nombre="${escapeHTML(a.nombre_completo)}" data-instrumento="${escapeHTML(a.instrumento_principal || '')}" ${isAlreadyAssigned ? 'disabled' : ''}>
            ${isAlreadyAssigned ? '<i class="bi bi-check me-1"></i>Asignado' : '<i class="bi bi-plus me-1"></i>Asignar'}
          </button>
        </div>
      `
    }).join('')
  }

  // 2. Delegación en slotsContainer
  slotsContainer?.addEventListener('input', (e) => {
    // A. Filtrar en el buscador de alumnos del turno
    const searchInput = e.target.closest('.slot-alumno-search-input')
    if (searchInput) {
      const panel = searchInput.closest('.slot-add-alumno-panel')
      _renderSearchResultsInPanel(panel, searchInput.value)
    }
  })

  slotsContainer?.addEventListener('change', (e) => {
    // B. Recalcular badge de duración al cambiar hora inicio o fin
    const timeInput = e.target.closest('.slot-hora-inicio, .slot-hora-fin')
    if (timeInput) {
      const card = timeInput.closest('.slot-card')
      const hInicio = card.querySelector('.slot-hora-inicio')?.value
      const hFin = card.querySelector('.slot-hora-fin')?.value
      const badge = card.querySelector('.slot-duracion-badge')
      if (hInicio && hFin && badge) {
        const dur = Math.max(0, timeToMinutes(hFin) - timeToMinutes(hInicio))
        badge.textContent = dur > 0 ? `${dur} min` : 'Turno'
      }
    }
  })

  slotsContainer?.addEventListener('click', (e) => {
    // A. Abrir/Cerrar panel de agregar alumnos
    const btnToggle = e.target.closest('.btn-toggle-add-alumno')
    if (btnToggle) {
      const wrapper = btnToggle.closest('.slot-add-alumno-wrapper')
      const panel = wrapper.querySelector('.slot-add-alumno-panel')
      const isVisible = panel.style.display !== 'none'
      panel.style.display = isVisible ? 'none' : 'block'
      if (!isVisible) {
        const searchInput = panel.querySelector('.slot-alumno-search-input')
        searchInput.value = ''
        _renderSearchResultsInPanel(panel, '')
        setTimeout(() => searchInput.focus(), 50)
      }
      return
    }

    const btnClosePanel = e.target.closest('.btn-close-add-panel')
    if (btnClosePanel) {
      const panel = btnClosePanel.closest('.slot-add-alumno-panel')
      panel.style.display = 'none'
      return
    }

    // B. Asignar alumno desde el resultado rápido
    const btnAssign = e.target.closest('.btn-quick-assign-alumno')
    if (btnAssign) {
      const alumnoId = btnAssign.dataset.alumnoId
      const nombre = btnAssign.dataset.nombre || 'Estudiante'
      const instrumento = btnAssign.dataset.instrumento || ''
      const card = btnAssign.closest('.slot-card')
      const alumnosContainer = card.querySelector('.slot-alumnos-container')

      if (alumnosContainer.querySelector(`[data-alumno-id="${alumnoId}"]`)) {
        AppToast.warning('El alumno ya está asignado a este turno')
        return
      }

      const emptyNotice = alumnosContainer.querySelector('.slot-empty-notice')
      if (emptyNotice) emptyNotice.remove()

      const pill = document.createElement('div')
      pill.className = 'slot-alumno-pill d-flex align-items-center justify-content-between p-1.5 px-2 rounded-2 bg-body-tertiary border'
      pill.dataset.alumnoId = alumnoId
      pill.innerHTML = `
        <div class="d-flex align-items-center gap-2 text-truncate me-2">
          <i class="bi bi-person-fill text-primary"></i>
          <strong class="text-body small text-truncate">${escapeHTML(nombre)}</strong>
          <span class="text-muted small text-truncate">${instrumento ? `· ${escapeHTML(instrumento)}` : ''}</span>
        </div>
        <button type="button" class="btn btn-sm btn-link text-danger p-0 btn-remove-alumno-from-slot" title="Quitar alumno de este turno">
          <i class="bi bi-x-circle-fill"></i>
        </button>
      `
      alumnosContainer.appendChild(pill)
      btnAssign.className = 'btn btn-xs btn-success py-0.5 px-2 rounded-pill btn-quick-assign-alumno disabled'
      btnAssign.disabled = true
      btnAssign.innerHTML = '<i class="bi bi-check me-1"></i>Asignado'
      _updateSlotsCount()
      return
    }

    // C. Quitar alumno de un turno
    const btnRemoveAlumno = e.target.closest('.btn-remove-alumno-from-slot')
    if (btnRemoveAlumno) {
      const card = btnRemoveAlumno.closest('.slot-card')
      const alumnosContainer = card.querySelector('.slot-alumnos-container')
      btnRemoveAlumno.closest('.slot-alumno-pill').remove()
      
      if (alumnosContainer.querySelectorAll('.slot-alumno-pill').length === 0) {
        alumnosContainer.innerHTML = `
          <div class="slot-empty-notice small text-muted fst-italic p-1.5 px-2 bg-body-tertiary rounded-2 border border-dashed text-center">
            Sin alumnos asignados a este turno todavía.
          </div>
        `
      }

      const panel = card.querySelector('.slot-add-alumno-panel')
      if (panel && panel.style.display !== 'none') {
        const searchInput = panel.querySelector('.slot-alumno-search-input')
        _renderSearchResultsInPanel(panel, searchInput?.value || '')
      }

      _updateSlotsCount()
      return
    }

    // D. Eliminar turno completo
    const btnRemoveSlot = e.target.closest('.btn-remove-slot')
    if (btnRemoveSlot) {
      const totalCards = slotsContainer.querySelectorAll('.slot-card').length
      if (totalCards <= 1) {
        AppToast.warning('Debe haber al menos un turno en una clase rotativa')
        return
      }
      btnRemoveSlot.closest('.slot-card').remove()
      _updateSlotsCount()
      return
    }
  })

  // 3. Auto-generar franjas de turnos según el horario global
  modalBody.querySelector('#btn-auto-slots')?.addEventListener('click', () => {
    const durationSelect = modalBody.querySelector('#slot-duration-select')
    let durationMin = parseInt(durationSelect?.value || '30', 10)

    if (durationSelect?.value === 'custom') {
      const customVal = prompt('Ingresá la duración de cada turno en minutos (ej: 15, 20, 30, 45):', '30')
      if (customVal === null) return
      const parsed = parseInt(customVal, 10)
      if (isNaN(parsed) || parsed <= 0) {
        AppToast.warning('La duración ingresada no es válida')
        return
      }
      durationMin = parsed
    }

    const firstHorarioRow = modalBody.querySelector('#modal-horarios-container .horario-row')
    const startStr = firstHorarioRow?.querySelector('[name="horario-hora_inicio"]')?.value
    const endStr   = firstHorarioRow?.querySelector('[name="horario-hora_fin"]')?.value

    if (!startStr || !endStr) {
      AppToast.warning('Por favor definí primero el horario de inicio y fin en "2. Horario & Salón"')
      return
    }

    const startMin = timeToMinutes(startStr)
    const endMin   = timeToMinutes(endStr)

    if (endMin <= startMin) {
      AppToast.warning('La hora de fin debe ser posterior a la hora de inicio')
      return
    }

    const turnosGenerados = []
    for (let m = startMin; m + durationMin <= endMin; m += durationMin) {
      turnosGenerados.push({
        inicio: minutesToTime(m),
        fin: minutesToTime(m + durationMin)
      })
    }

    if (turnosGenerados.length === 0) {
      AppToast.warning(`El horario global debe durar al menos ${durationMin} minutos`)
      return
    }

    const existingCards = Array.from(slotsContainer.querySelectorAll('.slot-card'))
    const alumnos = _options.alumnos || []
    const alumnosMap = new Map(alumnos.map(a => [a.id, a]))

    turnosGenerados.forEach((t, idx) => {
      let card = existingCards[idx]
      if (!card) {
        const temp = document.createElement('div')
        temp.innerHTML = _renderSlotCardHTML({ hora_inicio: t.inicio, hora_fin: t.fin, alumnosIds: [] }, alumnos, alumnosMap)
        card = temp.firstElementChild
        slotsContainer.appendChild(card)
      } else {
        card.querySelector('.slot-hora-inicio').value = t.inicio
        card.querySelector('.slot-hora-fin').value = t.fin
        const badge = card.querySelector('.slot-duracion-badge')
        if (badge) badge.textContent = `${durationMin} min`
      }
    })

    _updateSlotsCount()
    AppToast.success(`Se generaron ${turnosGenerados.length} franjas de ${durationMin} min (${startStr} a ${endStr})`)
  })

  // 4. Ordenar turnos por horario ascendente
  modalBody.querySelector('#btn-sort-slots')?.addEventListener('click', () => {
    if (!slotsContainer) return
    const cards = Array.from(slotsContainer.querySelectorAll('.slot-card'))
    if (cards.length <= 1) return

    cards.sort((a, b) => {
      const hA = a.querySelector('.slot-hora-inicio')?.value || '23:59'
      const hB = b.querySelector('.slot-hora-inicio')?.value || '23:59'
      return timeToMinutes(hA) - timeToMinutes(hB)
    })

    cards.forEach(c => slotsContainer.appendChild(c))
    AppToast.success('Turnos ordenados por horario')
  })

  // ── Alumnos grupal: filtro + contador + seleccionar todos ─────────────────
  const searchInput = modalBody.querySelector('#search-modal-alumnos')
  const listItems   = modalBody.querySelectorAll('.alumno-check-item')
  const selectAllChk = modalBody.querySelector('#chk-select-all-alumnos')
  const checks = modalBody.querySelectorAll('.alumnos-list input[type="checkbox"]')
  const countDisplay = modalBody.querySelector('#alumnos-selection-count')

  const getVisibleItems = () => {
    return Array.from(listItems).filter(item => !item.classList.contains('d-none'))
  }

  const updateSelectAllState = () => {
    if (!selectAllChk) return
    const visibleItems = getVisibleItems()
    if (visibleItems.length === 0) {
      selectAllChk.checked = false
      selectAllChk.indeterminate = false
      selectAllChk.disabled = true
      return
    }
    selectAllChk.disabled = false
    const visibleChecks = visibleItems.map(item => item.querySelector('input[type="checkbox"]')).filter(Boolean)
    const checkedCount = visibleChecks.filter(c => c.checked).length

    if (checkedCount === 0) {
      selectAllChk.checked = false
      selectAllChk.indeterminate = false
    } else if (checkedCount === visibleChecks.length) {
      selectAllChk.checked = true
      selectAllChk.indeterminate = false
    } else {
      selectAllChk.checked = false
      selectAllChk.indeterminate = true
    }
  }

  const updateCount = () => {
    const selected = Array.from(checks).filter(c => c.checked).length
    if (countDisplay) countDisplay.textContent = `${selected} alumnos seleccionados`
    updateSelectAllState()
  }

  const applyAlumnoFilters = () => {
    const rawTerm = searchInput?.value || ''
    const term = normalizeText(rawTerm)

    let visibleInscritos = 0
    let visibleDisponibles = 0

    listItems.forEach(item => {
      const nombre = item.dataset.nombre || ''
      const instrumento = item.dataset.instrumento || ''
      const matches = !term || nombre.includes(term) || instrumento.includes(term)
      
      item.classList.toggle('d-none', !matches)
      if (matches) {
        if (item.dataset.section === 'inscritos') visibleInscritos++
        else visibleDisponibles++
      }
    })

    const headerInscritos = modalBody.querySelector('#header-seccion-inscritos')
    const headerDisponibles = modalBody.querySelector('#header-seccion-disponibles')
    if (headerInscritos) headerInscritos.classList.toggle('d-none', visibleInscritos === 0)
    if (headerDisponibles) headerDisponibles.classList.toggle('d-none', visibleDisponibles === 0)

    updateSelectAllState()
  }

  searchInput?.addEventListener('input', applyAlumnoFilters)

  selectAllChk?.addEventListener('click', (e) => {
    e.stopPropagation()
    const visibleItems = getVisibleItems()
    const visibleChecks = visibleItems.map(item => item.querySelector('input[type="checkbox"]')).filter(Boolean)
    
    const anyChecked = visibleChecks.some(c => c.checked)
    const shouldCheck = !anyChecked

    visibleChecks.forEach(c => {
      c.checked = shouldCheck
    })

    updateCount()
  })

  checks.forEach(c => c.addEventListener('change', updateCount))
  applyAlumnoFilters()
  updateCount()
}

async function _handleSave(modalBody, originalClase) {
  const isEdicion = !!originalClase

  const getFormData = () => {
    const maestroSuplenteValue = modalBody.querySelector('#modal-maestro_suplente_id')?.value || ''
    const tieneSuplente = modalBody.querySelector('#modal-tiene_suplente')?.checked || false

    const data = {
      nombre: modalBody.querySelector('#modal-nombre')?.value?.trim() || '',
      programa_id: modalBody.querySelector('#modal-programa_id')?.value || null,
      maestro_principal_id: modalBody.querySelector('#modal-maestro_id')?.value || null,
      maestro_suplente_id: tieneSuplente && maestroSuplenteValue ? maestroSuplenteValue : null,
      tiene_suplente: tieneSuplente,
      instrumento: modalBody.querySelector('#modal-instrumento')?.value?.trim() || '',
      capacidad_maxima: parseInt(modalBody.querySelector('#modal-max_alumnos')?.value) || 20,
      estado: modalBody.querySelector('#modal-estado')?.value || 'activa',
      tipo_clase: modalBody.querySelector('input[name="modal-tipo_clase"]:checked')?.value || 'grupal',
      descripcion: modalBody.querySelector('#modal-notas_pedagogicas')?.value?.trim() || '',
      ruta_id: modalBody.querySelector('#modal-ruta_id')?.value || null,
      horarios: Array.from(modalBody.querySelectorAll('.horario-row')).map(row => ({
        dia: row.querySelector('[name="horario-dia"]')?.value,
        hora_inicio: row.querySelector('[name="horario-hora_inicio"]')?.value,
        hora_fin: row.querySelector('[name="horario-hora_fin"]')?.value,
        salon_id: row.querySelector('[name="horario-salon_id"]')?.value || null,
      })).filter(h => h.dia && h.hora_inicio && h.hora_fin)
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
  const _readSlots = () => {
    const slots = []
    modalBody.querySelectorAll('#slots-container .slot-card').forEach(card => {
      const horaInicio = card.querySelector('.slot-hora-inicio')?.value || ''
      const horaFin = card.querySelector('.slot-hora-fin')?.value || ''
      if (!horaInicio || !horaFin) return

      const alumnoPills = card.querySelectorAll('.slot-alumno-pill')
      alumnoPills.forEach(pill => {
        const alumnoId = pill.dataset.alumnoId
        if (alumnoId) {
          slots.push({
            alumno_id: alumnoId,
            hora_inicio: horaInicio,
            hora_fin: horaFin,
          })
        }
      })
    })
    return slots.sort((a, b) => timeToMinutes(a.hora_inicio || '23:59') - timeToMinutes(b.hora_inicio || '23:59'))
  }

  const _syncGrupal = async (claseId) => {
    const newIds = Array.from(modalBody.querySelectorAll('.alumnos-list input[type="checkbox"]:checked')).map(cb => cb.value)
    const currentEnrolled = await obtenerAlumnosInscritos(claseId)
    const currentIds = (currentEnrolled || []).map(i => i.alumno_id)
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

    const incomplete = slots.find(s => !s.hora_inicio || !s.hora_fin)
    if (incomplete) { AppToast.error('Todos los turnos deben tener hora de inicio y fin'); return false }

    const currentEnrolled = await obtenerAlumnosInscritos(claseId)
    const currentIds = (currentEnrolled || []).map(i => i.alumno_id)
    const newIds     = slots.map(s => s.alumno_id)

    const toRemove = currentIds.filter(id => !newIds.includes(id))
    await Promise.all(toRemove.map(aid => desinscribirAlumno(claseId, aid)))

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
      resultClase = await actualizarClase(originalClase.id, formData, true)
      if (formData.tipo_clase === 'rotativa') {
        const ok = await _syncRotativa(resultClase.id)
        if (!ok) return false
      } else {
        await _syncGrupal(resultClase.id)
      }
    } else {
      resultClase = await crearClase(formData, true)
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

    AppToast.success(isEdicion ? 'Clase actualizada con éxito' : 'Clase creada con éxito')
    if (_options.onSuccess) await _options.onSuccess()
    if (_options.onSaved) await _options.onSaved()
    return true
  } catch (err) {
    console.error('[claseModal] Error al guardar clase:', err)
    AppToast.error(err.message || 'Error al procesar el guardado de la clase')
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
  const selectedSet = new Set(selectedIds || [])
  const todosAlumnos = _options.alumnos || []

  const inscritos = todosAlumnos.filter(a => selectedSet.has(a.id))
  const noInscritos = todosAlumnos.filter(a => !selectedSet.has(a.id))

  return `
    <div class="alumnos-selector-container">
      <div class="d-flex align-items-center justify-content-between mb-2 gap-2 flex-wrap">
        <div class="input-group input-group-sm flex-grow-1" style="min-width: 180px;">
          <span class="input-group-text bg-transparent"><i class="bi bi-search text-muted"></i></span>
          <input type="text" class="form-control" id="search-modal-alumnos" placeholder="Buscar por nombre o instrumento...">
        </div>
        <div class="form-check text-nowrap mb-0 flex-shrink-0" style="font-size: 0.8rem;">
          <input class="form-check-input cursor-pointer" type="checkbox" id="chk-select-all-alumnos" title="Marcar / Desmarcar alumnos visibles">
          <label class="form-check-label cursor-pointer user-select-none text-muted fw-semibold" for="chk-select-all-alumnos">
            Marcar visibles
          </label>
        </div>
      </div>

      <!-- Resumen / Contador de Selección -->
      <div class="d-flex justify-content-between align-items-center mb-2 px-1">
        <small class="fw-bold text-primary" id="alumnos-selection-count">${selectedSet.size} seleccionados</small>
        <small class="text-muted">${todosAlumnos.length} en el padrón</small>
      </div>

      <div class="alumnos-list border rounded-3 bg-body-tertiary p-2" style="max-height: calc(92vh - 310px); overflow-y: auto;">
        
        ${inscritos.length > 0 ? `
          <div class="small fw-bold text-success text-uppercase mb-1.5 px-1 d-flex align-items-center gap-1" id="header-seccion-inscritos" style="font-size:0.68rem;">
            <i class="bi bi-check-circle-fill"></i> Inscritos en esta Clase (${inscritos.length})
          </div>
          <div class="d-flex flex-column gap-1 mb-3">
            ${inscritos.map(a => `
              <div class="form-check alumno-check-item p-2 rounded-2 bg-success-subtle bg-opacity-25 border border-success-subtle d-flex align-items-center gap-2" data-section="inscritos" data-nombre="${normalizeText(a.nombre_completo)}" data-instrumento="${normalizeText(a.instrumento_principal)}">
                <input class="form-check-input ms-0 flex-shrink-0" type="checkbox" value="${a.id}" id="chk-a-${a.id}" checked>
                <label class="form-check-label small w-100 cursor-pointer mb-0" for="chk-a-${a.id}">
                  <strong class="text-body">${escapeHTML(a.nombre_completo)}</strong>
                  <span class="text-muted small">· ${escapeHTML(a.instrumento_principal || 'General')}</span>
                </label>
              </div>
            `).join('')}
          </div>
        ` : ''}

        <div class="small fw-bold text-muted text-uppercase mb-1.5 px-1 d-flex align-items-center gap-1" id="header-seccion-disponibles" style="font-size:0.68rem;">
          <i class="bi bi-person-plus"></i> Alumnos Disponibles (${noInscritos.length})
        </div>
        <div class="d-flex flex-column gap-1">
          ${noInscritos.map(a => `
            <div class="form-check alumno-check-item p-2 rounded-2 bg-body border d-flex align-items-center gap-2" data-section="disponibles" data-nombre="${normalizeText(a.nombre_completo)}" data-instrumento="${normalizeText(a.instrumento_principal)}">
              <input class="form-check-input ms-0 flex-shrink-0" type="checkbox" value="${a.id}" id="chk-a-${a.id}">
              <label class="form-check-label small w-100 cursor-pointer mb-0" for="chk-a-${a.id}">
                <span class="text-body fw-semibold">${escapeHTML(a.nombre_completo)}</span>
                <span class="text-muted small">· ${escapeHTML(a.instrumento_principal || 'General')}</span>
              </label>
            </div>
          `).join('')}
        </div>

      </div>
    </div>
  `
}
