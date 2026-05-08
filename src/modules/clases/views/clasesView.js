import { AppModal } from '../../../shared/components/AppModal.js'
import { AppToast } from '../../../shared/components/AppToast.js'
import {
  obtenerClases,
  crearClase,
  actualizarClase,
  eliminarClase,
  validarHorario,
  getConflictoLabel,
} from '../api/clasesApi.js'
import { crearMaestro } from '../../maestros/api/maestrosApi.js'
import { crearSalon, obtenerSalonesActivos } from '../../salones/api/salonesApi.js'
import { supabase } from '../../../lib/supabaseClient.js'
import {
  formatDate,
  escapeHTML,
  formatHora,
  getEstadoBadgeClass,
  getEstadoLabel,
  getInstrumentoIcon,
  getInitials,
  calcularDuracion,
  getConsistentColor,
} from '../utils/clasesUtils.js'
import { Clase } from '../models/clase.model.js'
import { openAlumnoInscripcionModal } from '../components/alumnoInscripcionModal.js'

const state = {
  clases: [],
  clasesOriginales: [],
  maestros: [],
  salones: [],
  programas: [],
  alumnos: [], // Lista de todos los alumnos activos
  cargando: false,
  filtroEstado: 'todos',
  filtroInstrumento: '',
  vista: 'tabla', // 'tabla' | 'calendario'
  container: null, // Referencia al contenedor DOM para refrescar desde modal
}

const VALIDATION = {
  nombreMax: 100,
  notasMax: 500,
}

export async function renderClasesView(container) {
  if (!container) {
    console.warn('[clasesView] renderClasesView: container es null')
    return
  }
  try {
    state.container = container // Guardar referencia para refrescar desde modal
    state.cargando = true
    renderLoading(container)

    const [clases, maestros, salones, programas, alumnos] = await Promise.all([
      obtenerClases(),
      supabase.from('maestros').select('*').order('nombre_completo', { ascending: true }),
      supabase.from('salones').select('*').order('nombre', { ascending: true }),
      supabase.from('programas').select('*').order('nombre', { ascending: true }),
      supabase.from('alumnos').select('*').eq('activo', true).order('nombre_completo', { ascending: true }),
    ])

    state.clases = clases
    state.clasesOriginales = [...clases]
    state.maestros = maestros.data || []
    state.salones = salones.data || []
    state.programas = programas.data || []
    state.alumnos = alumnos.data || []
    state.cargando = false

    renderContent(container)
    attachGlobalEvents(container)
  } catch (error) {
    console.error(error)
    renderError(container, error.message)
  }
}

function renderLoading(container) {
  if (!container) {
    console.warn('[clasesView] renderLoading: container es null')
    return
  }
  container.innerHTML = `
    <div class="d-flex justify-content-center align-items-center" style="min-height: 400px;">
      <div class="text-center">
        <div class="spinner-border text-primary mb-3" role="status">
          <span class="visually-hidden">Cargando...</span>
        </div>
        <p class="text-muted">Cargando clases...</p>
      </div>
    </div>
  `
}

function renderError(container, mensaje) {
  if (!container) {
    console.warn('[clasesView] renderError: container es null')
    return
  }
  container.innerHTML = `
    <div class="container mt-5">
      <div class="row justify-content-center">
        <div class="col-md-6">
          <div class="alert alert-danger" role="alert">
            <h4 class="alert-heading">
              <i class="bi bi-exclamation-triangle"></i> Error al cargar
            </h4>
            <p>${escapeHTML(mensaje)}</p>
            <hr>
            <button class="btn btn-primary" id="retryBtn">
              <i class="bi bi-arrow-clockwise"></i> Reintentar
            </button>
          </div>
        </div>
      </div>
    </div>
  `
  document.getElementById('retryBtn')?.addEventListener('click', () => renderClasesView(container))
}

function renderContent(container) {
  if (!container) {
    console.warn('[clasesView] renderContent: container es null')
    return
  }
  const instrumentos = [...new Set(state.clases.map(c => c.instrumento).filter(Boolean))].sort()

  container.innerHTML = `
    <div class="page-container">
      <!-- Page Header Compact -->
      <div class="page-header">
        <div class="d-flex align-items-center gap-2">
          <span class="page-title"><i class="bi bi-book me-2 text-primary"></i>Clases</span>
          <span class="badge bg-secondary">${state.clases.length}</span>
        </div>
        <div class="d-flex gap-2 flex-wrap">
          <div class="btn-group btn-group-sm" role="group">
            <input type="radio" class="btn-check" name="clases-vista" id="vista-tabla" value="tabla" checked>
            <label class="btn btn-outline-primary" for="vista-tabla"><i class="bi bi-list-ul"></i></label>
            <input type="radio" class="btn-check" name="clases-vista" id="vista-calendario" value="calendario">
            <label class="btn btn-outline-primary" for="vista-calendario"><i class="bi bi-calendar3"></i></label>
          </div>
          <button class="btn btn-primary btn-sm-compact" id="btnAgregarClase">
            <i class="bi bi-plus-lg"></i> Nuevo
          </button>
        </div>
      </div>

      <!-- Toolbar Compact -->
      <div class="toolbar-dense mb-3">
        <div class="search-bar flex-grow-1" style="min-width: 180px;">
          <i class="bi bi-search"></i>
          <input type="text" class="form-control input-dense" placeholder="Buscar clase..." id="buscar" autocomplete="off">
        </div>
        <select class="form-select input-dense" id="filtroEstado" style="width: auto; min-width: 120px;">
          <option value="todos">Todos</option>
          <option value="activa">Activas</option>
          <option value="suspendida">Suspendidas</option>
          <option value="finalizada">Finalizadas</option>
        </select>
        <select class="form-select input-dense" id="filtroInstrumento" style="width: auto; min-width: 140px;">
          <option value="">Todos los instrumentos</option>
          ${instrumentos.map(i => `<option value="${escapeHTML(i)}">${escapeHTML(i)}</option>`).join('')}
        </select>
      </div>

      <!-- Table Compact -->
      <div class="page-glass p-3 mb-4">
        <table class="table table-premium table-compact mb-0">
          <thead>
            <tr>
              <th>Nombre</th>
              <th class="d-none d-md-table-cell">Instrumento</th>
              <th>Maestro</th>
              <th>Horarios</th>
              <th>Estado</th>
              <th class="text-end">Acciones</th>
            </tr>
          </thead>
          <tbody id="clasesTBody">
            ${renderTableRows(state.clases)}
          </tbody>
        </table>
        ${state.clases.length === 0 ? renderEmpty() : ''}
      </div>

      <!-- Calendar View -->
      <div id="clases-calendar-view" class="d-none">
        ${renderCalendarView(state.clases)}
      </div>

    </div>
  `
}

function renderTableRows(clases) {
  if (!clases.length) return '<tr><td colspan="7" class="text-center text-muted py-3">No hay clases</td></tr>'

  return clases.map(c => {
    const maestro = state.maestros.find(m => m.id === c.maestro_id)
    const maestroNombre = maestro ? (maestro.nombre_completo || maestro.nombre) : '-'
    const horarios = c.horarios || []
    const color = getConsistentColor(c.id)
    
    const horariosDisplay = horarios.map(h => {
      const diaCorto = h.dia.charAt(0).toUpperCase() + h.dia.slice(1, 3)
      return `${diaCorto} ${formatHora(h.hora_inicio)}-${formatHora(h.hora_fin)}`
    }).join(', ')

    return `
      <tr data-id="${c.id}" class="align-middle">
        <td>
          <div class="d-flex align-items-center gap-3">
            <div class="avatar-compact bg-${color}-subtle text-${color} border border-${color}-subtle">
              <i class="bi ${getInstrumentoIcon(c.instrumento)}"></i>
            </div>
            <div>
              <div class="fw-bold text-truncate" style="max-width: 150px;" title="${c.nombre}">${escapeHTML(c.nombre)}</div>
              <div class="small text-muted d-md-none">${escapeHTML(c.instrumento || '-')}</div>
            </div>
          </div>
        </td>
        <td class="d-none d-md-table-cell">
          <span class="badge bg-body-tertiary text-body border">${escapeHTML(c.instrumento || '-')}</span>
        </td>
        <td class="text-truncate" style="max-width: 120px;" title="${maestroNombre}">
          <div class="d-flex align-items-center gap-1">
            <i class="bi bi-person-badge opacity-50"></i>
            <span>${escapeHTML(maestroNombre)}</span>
          </div>
        </td>
        <td class="text-truncate" style="max-width: 140px;" title="${horariosDisplay}">
          <small class="text-muted"><i class="bi bi-calendar3 me-1"></i>${horariosDisplay || 'Sin horario'}</small>
        </td>
        <td>
          <span class="badge badge-pill bg-${getEstadoBadgeClass(c.estado)}-subtle text-${getEstadoBadgeClass(c.estado)} border border-${getEstadoBadgeClass(c.estado)}-subtle">
            ${getEstadoLabel(c.estado)}
          </span>
        </td>
        <td class="text-end">
          <div class="quick-actions justify-content-end gap-1">
            <button class="btn btn-icon-compact btn-light text-primary border" data-action="edit" data-id="${c.id}" title="Editar">
              <i class="bi bi-pencil"></i>
            </button>
            <button class="btn btn-icon-compact btn-light text-info border" data-action="view" data-id="${c.id}" title="Ver">
              <i class="bi bi-eye"></i>
            </button>
            <button class="btn btn-icon-compact btn-light text-warning border" data-action="inscribir" data-id="${c.id}" title="Inscribir">
              <i class="bi bi-person-plus"></i>
            </button>
            <button class="btn btn-icon-compact btn-light text-danger border" data-action="delete" data-id="${c.id}" title="Eliminar">
              <i class="bi bi-trash"></i>
            </button>
          </div>
        </td>
      </tr>
    `
  }).join('')
}

function renderEmpty() {
  return `
    <div class="col-12 text-center py-5">
      <div class="mb-3">
        <i class="bi bi-inbox" style="font-size: 3rem; color: var(--bs-secondary);"></i>
      </div>
      <h4>No hay clases</h4>
      <p class="text-muted">Crea tu primera clase haciendo clic en el botón "Nuevo"</p>
    </div>
  `
}

function renderCalendarView(clases) {
  const diasOrden = ['lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado', 'domingo']
  const diasLabel = { lunes: 'Lun', martes: 'Mar', miercoles: 'Mié', jueves: 'Jue', viernes: 'Vie', sabado: 'Sáb', domingo: 'Dom' }

  const horas = []
  for (let h = 7; h <= 21; h++) {
    horas.push(`${h.toString().padStart(2, '0')}:00`)
  }

  const getClasesEnHorario = (dia, hora) => {
    return clases.filter(c => {
      const horarios = c.horarios || []
      return horarios.some(h => {
        if (h.dia !== dia) return false
        const inicio = parseInt(h.hora_inicio?.split(':')[0] || 0)
        const fin = parseInt(h.hora_fin?.split(':')[0] || 0)
        return hora >= inicio && hora < fin
      })
    })
  }

  return `
    <div class="table-responsive">
      <table class="table table-bordered table-sm calendar-grid" style="min-width: 800px;">
        <thead class="table-light">
          <tr>
            <th style="width: 60px; min-width: 60px;">Hora</th>
            ${diasOrden.map(d => `<th class="text-center">${diasLabel[d]}</th>`).join('')}
          </tr>
        </thead>
        <tbody>
          ${horas.map(hora => `
            <tr>
              <td class="text-muted small text-center" style="white-space: nowrap;">${hora}</td>
              ${diasOrden.map(dia => {
                const clasesEnHora = getClasesEnHorario(dia, parseInt(hora))
                if (clasesEnHora.length === 0) {
                  return '<td class="p-1"></td>'
                }
                const clase = clasesEnHora[0]
                const maestro = state.maestros.find(m => m.id === clase.maestro_id)
                const color = getConsistentColor(clase.id)
                return `
                  <td class="p-1" style="background: ${color}15;">
                    <div class="calendar-cell p-1" style="font-size: 0.75rem;">
                      <strong>${escapeHTML(clase.nombre || '')}</strong>
                      <div class="text-muted small">${escapeHTML(maestro?.nombre_completo || '')}</div>
                    </div>
                  </td>
                `
              }).join('')}
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
    <div class="mt-3">
      <h6>Leyenda</h6>
      <div class="d-flex flex-wrap gap-2">
        ${clases.slice(0, 6).map(c => {
          const color = getConsistentColor(c.id)
          return `<span class="badge" style="background: ${color}; color: white;">${escapeHTML(c.nombre || '')}</span>`
        }).join('')}
      </div>
    </div>
  `
}

function toggleCalendarView(vista) {
  state.vista = vista
  const tablaView = document.querySelector('.table-scroll-container')
  const calendarView = document.getElementById('clases-calendar-view')
  if (vista === 'calendario') {
    tablaView?.classList.add('d-none')
    calendarView?.classList.remove('d-none')
  } else {
    tablaView?.classList.remove('d-none')
    calendarView?.classList.add('d-none')
  }
}

function attachGlobalEvents(container) {
  if (!container) {
    console.warn('[clasesView] attachGlobalEvents: container es null')
    return
  }
  container.querySelector('#btnAgregarClase')?.addEventListener('click', () => {
    openCreateModal()
  })

  container.querySelectorAll('input[name="clases-vista"]').forEach(r => {
    r.addEventListener('change', e => {
      toggleCalendarView(e.target.value)
    })
  })

  container.querySelector('#buscar')?.addEventListener('input', applyFilters)
  container.querySelector('#filtroEstado')?.addEventListener('change', applyFilters)
  container.querySelector('#filtroInstrumento')?.addEventListener('change', applyFilters)

  const tbody = container.querySelector('#clasesTBody')
  tbody?.addEventListener('click', async (e) => {
    const row = e.target.closest('tr[data-id]')
    const btn = e.target.closest('[data-action]')

    if (row && !btn) {
      const id = row.dataset.id
      openViewModal(id)
      return
    }

    if (!btn) return
    const id = btn.dataset.id
    if (btn.dataset.action === 'edit') {
      openEditModal(id)
    } else if (btn.dataset.action === 'delete') {
      openDeleteModal(id)
    } else if (btn.dataset.action === 'view') {
      openViewModal(id)
    } else if (btn.dataset.action === 'inscribir') {
      await openAlumnoInscripcionModal(id)
    }
  })
}

function updateAuxiliarLogic(modalBody) {
  const hasAuxiliarCb = modalBody.querySelector('#modal-has-auxiliar')
  const auxContainer = modalBody.querySelector('#auxiliar-container')
  const selectAux = modalBody.querySelector('#modal-maestro_auxiliar_id')
  const btnCrearAux = modalBody.querySelector('#btn-crear-auxiliar')
  const auxFormContainer = modalBody.querySelector('#auxiliar-form-container')
  const btnCancelAux = modalBody.querySelector('#btn-cancel-auxiliar')
  const btnSaveAux = modalBody.querySelector('#btn-save-auxiliar')
  
  if (!hasAuxiliarCb) return

  hasAuxiliarCb.addEventListener('change', (e) => {
    auxContainer.style.display = e.target.checked ? 'block' : 'none'
    if (!e.target.checked) selectAux.value = ''
  })

  btnCrearAux.addEventListener('click', () => {
    auxFormContainer.style.display = 'block'
    modalBody.querySelector('#aux-nombre').focus()
  })

  btnCancelAux.addEventListener('click', () => {
    auxFormContainer.style.display = 'none'
    modalBody.querySelector('#aux-nombre').value = ''
    modalBody.querySelector('#aux-instrumento').value = ''
  })

  btnSaveAux.addEventListener('click', async () => {
    const nombre = modalBody.querySelector('#aux-nombre').value.trim()
    const instrumento = modalBody.querySelector('#aux-instrumento').value.trim()
    const correo = modalBody.querySelector('#aux-correo').value.trim()

    if (!nombre || !instrumento || !correo) {
      AppToast.error('Nombre, instrumento y correo son requeridos')
      return
    }

    const spinner = modalBody.querySelector('#aux-spinner')
    btnSaveAux.disabled = true
    spinner.classList.remove('d-none')

    try {
      const nuevo = await crearMaestro({ 
        nombre_completo: nombre, 
        especialidad: instrumento, 
        correo: correo,
        activo: true 
      })
      state.maestros.push(nuevo)
      state.maestros.sort((a, b) => (a.nombre_completo || '').localeCompare(b.nombre_completo || ''))
      
      const selectTitular = modalBody.querySelector('#modal-maestro_id')
      const titularValue = selectTitular.value
      selectTitular.innerHTML = getMaestrosOptions(titularValue)
      
      selectAux.innerHTML = '<option value="">Seleccionar existente...</option>' + state.maestros.map(m => `<option value="${m.id}" ${m.id === nuevo.id ? 'selected' : ''}>${escapeHTML(m.nombre_completo || m.nombre)}</option>`).join('')
      
      btnCancelAux.click()
      AppToast.success('Maestro auxiliar creado y seleccionado')
    } catch (err) {
      AppToast.error(err.message || 'Error al crear maestro')
    } finally {
      btnSaveAux.disabled = false
      spinner.classList.add('d-none')
    }
  })
}

async function updateAllSalonSelects(modalBody, selectedId = null) {
  try {
    const salones = await obtenerSalonesActivos()
    state.salones = salones // Actualizar estado global
    
    const selects = modalBody.querySelectorAll('select[name="horario-salon_id"]')
    selects.forEach(sel => {
      const currentVal = sel.value
      sel.innerHTML = getSalonesOptions(selectedId && sel.dataset.targetNew ? selectedId : currentVal)
      delete sel.dataset.targetNew // Limpiar flag
    })
  } catch (err) {
    console.error('Error actualizando selectores de salón:', err)
  }
}

function updateSalonLogic(modalBody) {
  const formContainer = modalBody.querySelector('#salon-form-container')
  const btnSave = modalBody.querySelector('#btn-save-salon')
  const btnCancel = modalBody.querySelector('#btn-cancel-salon')
  const spinner = modalBody.querySelector('#salon-spinner')
  
  if (!formContainer) return

  // Delegación de eventos para los botones '+' en las filas de horarios
  modalBody.addEventListener('click', (e) => {
    const btn = e.target.closest('.btn-create-salon')
    if (btn) {
      // Marcar el select actual para recibir el nuevo ID si se crea
      const select = btn.closest('.input-group').querySelector('select')
      select.dataset.targetNew = 'true'
      
      formContainer.style.display = 'block'
      formContainer.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
      modalBody.querySelector('#new-salon-nombre').focus()
    }
  })

  btnCancel.addEventListener('click', () => {
    formContainer.style.display = 'none'
    modalBody.querySelector('#new-salon-nombre').value = ''
    modalBody.querySelector('#new-salon-capacidad').value = '20'
    // Limpiar flags de target
    modalBody.querySelectorAll('select[name="horario-salon_id"]').forEach(s => delete s.dataset.targetNew)
  })

  btnSave.addEventListener('click', async () => {
    const nombre = modalBody.querySelector('#new-salon-nombre').value.trim()
    const capacidad = modalBody.querySelector('#new-salon-capacidad').value

    if (!nombre) {
      AppToast.error('El nombre del salón es obligatorio')
      return
    }

    btnSave.disabled = true
    spinner.classList.remove('d-none')

    try {
      const nuevo = await crearSalon({ nombre, capacidad })
      await updateAllSalonSelects(modalBody, nuevo.id)
      btnCancel.click()
      AppToast.success('Salón creado y seleccionado')
    } catch (err) {
      AppToast.error(err.message || 'Error al crear salón')
    } finally {
      btnSave.disabled = false
      spinner.classList.add('d-none')
    }
  })
}

function applyFilters() {
  const searchTerm = document.getElementById('buscar')?.value.trim().toLowerCase() || ''
  const filtroEstado = document.getElementById('filtroEstado')?.value || 'todos'
  const filtroInstrumento = document.getElementById('filtroInstrumento')?.value || ''

  state.clases = state.clasesOriginales.filter(c => {
    const matchSearch = !searchTerm ||
      (c.nombre || '').toLowerCase().includes(searchTerm) ||
      (c.instrumento || '').toLowerCase().includes(searchTerm)

    const matchEstado = filtroEstado === 'todos' || c.estado === filtroEstado
    const matchInstrumento = !filtroInstrumento || c.instrumento === filtroInstrumento

    return matchSearch && matchEstado && matchInstrumento
  })

  refreshTable()
  refreshCalendar()
}

function refreshCalendar() {
  const calendarView = document.getElementById('clases-calendar-view')
  if (calendarView && state.vista === 'calendario') {
    calendarView.innerHTML = renderCalendarView(state.clases)
  }
}

function refreshTable() {
  const tbody = document.getElementById('clasesTBody')
  if (!tbody) return
  if (state.clases.length === 0) {
    tbody.innerHTML = '<tr><td colspan="7" class="text-center text-muted py-4">No hay clases</td></tr>'
  } else {
    tbody.innerHTML = renderTableRows(state.clases)
  }
}

function getMaestrosOptions(selectedId = '') {
  return `<option value="">Seleccionar...</option>` +
    state.maestros.map(m => `<option value="${m.id}" ${m.id === selectedId ? 'selected' : ''}>${escapeHTML(m.nombre_completo || m.nombre || 'Sin nombre')}</option>`).join('')
}

function getSalonesOptions(selectedId = '') {
  return `<option value="">Sin salón</option>` +
    state.salones.map(s => `<option value="${s.id}" ${s.id === selectedId ? 'selected' : ''}>${escapeHTML(s.nombre)}</option>`).join('')
}

function getProgramasOptions(selectedId = '') {
  return `<option value="">Seleccionar programa...</option>` +
    state.programas.map(p => `<option value="${p.id}" ${p.id === selectedId ? 'selected' : ''}>${escapeHTML(p.nombre || p.name || 'Sin nombre')}</option>`).join('')
}

function getInstrumentosDatalist() {
  const instrumentos = [
    'Violín', 'Viola', 'Cello', 'Bajo', 'Flauta', 'Oboe',
    'Clarinete', 'Fagot', 'Trompa', 'Trompeta', 'Trombón',
    'Tuba', 'Piano', 'Guitarra', 'Arpa', 'Percusión',
    'Voz', 'Dirección', 'Solfeo', 'Teoría',
  ]
  return `<datalist id="instrumentos-list">${instrumentos.map(i => `<option value="${i}">`).join('')}</datalist>`
}

function getEstadosOptions(selectedValue = 'activa') {
  return Clase.getEstados().map(e =>
    `<option value="${e}" ${e === selectedValue ? 'selected' : ''}>${Clase.getEstadoLabel(e)}</option>`
  ).join('')
}

function getAlumnosSelectorHTML(selectedIds = []) {
  const alumnos = state.alumnos || []
  if (alumnos.length === 0) {
    return `<p class="text-muted small py-2">No hay alumnos registrados</p>`
  }

  return `
    <div class="alumnos-selector-container">
      <div class="search-bar mb-2">
        <div class="input-group input-group-sm">
          <span class="input-group-text bg-body-tertiary border-end-0"><i class="bi bi-search"></i></span>
          <input type="text" class="form-control input-dense border-start-0" id="search-modal-alumnos" placeholder="Buscar alumnos..." autocomplete="off">
        </div>
      </div>
      <div class="alumnos-list border rounded p-2 bg-body-tertiary" style="max-height: 180px; overflow-y: auto;">
        ${alumnos.map(a => {
          const isChecked = selectedIds.includes(a.id)
          const nombre = escapeHTML(a.nombre_completo || a.nombre || 'Alumno')
          const instrumento = escapeHTML(a.instrumento_principal || '')
          return `
            <div class="form-check alumno-check-item py-1 border-bottom border-light-subtle last-child-no-border" 
                 data-nombre="${nombre.toLowerCase()}" 
                 data-instrumento="${instrumento.toLowerCase()}">
              <input class="form-check-input cursor-pointer" type="checkbox" value="${a.id}" id="chk-alumno-${a.id}" ${isChecked ? 'checked' : ''}>
              <label class="form-check-label w-100 cursor-pointer d-flex justify-content-between align-items-center" for="chk-alumno-${a.id}">
                <span class="small fw-semibold">${nombre}</span>
                ${instrumento ? `<span class="badge bg-secondary-subtle text-secondary" style="font-size: 0.6rem;">${instrumento}</span>` : ''}
              </label>
            </div>
          `
        }).join('')}
      </div>
      <div class="mt-1">
        <small class="text-muted" id="alumnos-selection-count">0 alumnos seleccionados</small>
      </div>
    </div>
  `
}

function updateAlumnosLogic(modalBody) {
  const searchInput = modalBody.querySelector('#search-modal-alumnos')
  const countDisplay = modalBody.querySelector('#alumnos-selection-count')
  const listItems = modalBody.querySelectorAll('.alumno-check-item')
  const checks = modalBody.querySelectorAll('.alumnos-list input[type="checkbox"]')

  const updateCount = () => {
    const selected = Array.from(checks).filter(c => c.checked).length
    countDisplay.textContent = `${selected} alumno${selected === 1 ? '' : 's'} seleccionado${selected === 1 ? '' : 's'}`
  }

  searchInput?.addEventListener('input', (e) => {
    const term = e.target.value.toLowerCase().trim()
    listItems.forEach(item => {
      const match = item.dataset.nombre.includes(term) || item.dataset.instrumento.includes(term)
      item.style.display = match ? 'block' : 'none'
    })
  })

  checks.forEach(chk => {
    chk.addEventListener('change', updateCount)
  })

  // Init count
  updateCount()
}

function getDiasOptions(selectedValue = '') {
  const dias = [
    { value: 'lunes', label: 'Lunes' },
    { value: 'martes', label: 'Martes' },
    { value: 'miércoles', label: 'Miércoles' },
    { value: 'jueves', label: 'Jueves' },
    { value: 'viernes', label: 'Viernes' },
    { value: 'sábado', label: 'Sábado' },
  ]
  return `<option value="">Seleccionar día</option>` +
    dias.map(d => `<option value="${d.value}" ${d.value === selectedValue ? 'selected' : ''}>${d.label}</option>`).join('')
}

function renderHorarioRow(horario, index) {
  return `
    <div class="horario-row card mb-2" data-index="${index}">
      <div class="card-body py-2">
        <div class="row g-2 align-items-center mb-1">
          <div class="col-7">
            <select class="form-select input-dense" name="horario-dia" required>
              ${getDiasOptions(horario?.dia || '')}
            </select>
          </div>
          <div class="col-4">
            <div class="input-group input-group-sm">
              <select class="form-select input-dense" name="horario-salon_id">
                ${getSalonesOptions(horario?.salon_id || '')}
              </select>
              <button class="btn btn-outline-primary btn-create-salon" type="button" title="Crear nuevo salón">
                <i class="bi bi-plus-lg"></i>
              </button>
            </div>
          </div>
          <div class="col-1 d-flex justify-content-end">
            <button type="button" class="btn btn-outline-danger btn-sm px-1" onclick="this.closest('.horario-row').remove()" title="Eliminar horario">
              <i class="bi bi-trash"></i>
            </button>
          </div>
        </div>
        <div class="row g-2 align-items-center">
          <div class="col-6">
            <input type="time" class="form-control input-dense" name="horario-hora_inicio" value="${horario?.hora_inicio || ''}" required placeholder="Inicio">
          </div>
          <div class="col-6">
            <input type="time" class="form-control input-dense" name="horario-hora_fin" value="${horario?.hora_fin || ''}" required placeholder="Fin">
          </div>
        </div>
      </div>
    </div>
  `
}

function renderHorariosContainer(horarios = []) {
  if (horarios.length === 0) {
    return renderHorarioRow(null, 0)
  }
  return horarios.map((h, i) => renderHorarioRow(h, i)).join('')
}

function getClaseFormHTML(clase = null, inscritosIds = []) {
  const esEdicion = !!clase
  return `
    <form class="row g-2" id="formClase">
      <div class="col-md-6">
        <label class="form-label-compact">Nombre *</label>
        <input type="text" class="form-control input-dense" id="modal-nombre" required placeholder="Clase de Violín" value="${escapeHTML(clase?.nombre || '')}">
      </div>
      <div class="col-md-6">
        <label class="form-label-compact">Instrumento *</label>
        ${getInstrumentosDatalist()}
        <input type="text" class="form-control input-dense" id="modal-instrumento" list="instrumentos-list" required placeholder="Seleccionar o escribir..." value="${escapeHTML(clase?.instrumento || '')}">
      </div>
      <div class="col-md-6">
        <label class="form-label-compact">Programa *</label>
        <select class="form-select input-dense" id="modal-programa_id" required>
          ${getProgramasOptions(clase?.programa_id)}
        </select>
      </div>
      <div class="col-md-6">
        <label class="form-label-compact">Maestro titular *</label>
        <select class="form-select input-dense" id="modal-maestro_id" required>
          ${getMaestrosOptions(clase?.maestro_id)}
        </select>
      </div>
      <div class="col-md-6">
        <div class="d-flex justify-content-between align-items-center mb-1">
          <label class="form-label-compact mb-0">Maestro auxiliar</label>
          <div class="form-check form-switch m-0">
            <input class="form-check-input" type="checkbox" id="modal-has-auxiliar" ${clase?.maestro_auxiliar_id ? 'checked' : ''}>
            <label class="form-check-label small" for="modal-has-auxiliar">¿Auxiliar?</label>
          </div>
        </div>
        <div id="auxiliar-container" style="display: ${clase?.maestro_auxiliar_id ? 'block' : 'none'};">
          <div class="input-group input-group-sm">
            <select class="form-select input-dense" id="modal-maestro_auxiliar_id">
              <option value="">Seleccionar existente...</option>
              ${getMaestrosOptions(clase?.maestro_auxiliar_id)}
            </select>
            <button class="btn btn-outline-primary" type="button" id="btn-crear-auxiliar" title="Crear nuevo maestro">
              <i class="bi bi-person-plus"></i>
            </button>
          </div>
          <div id="auxiliar-form-container" class="mt-2 p-2 border rounded bg-body-tertiary" style="display: none;">
            <h6 class="small fw-bold mb-2">Crear Nuevo Maestro</h6>
            <input type="text" class="form-control input-dense mb-2" id="aux-nombre" placeholder="Nombre completo *">
            <input type="email" class="form-control input-dense mb-2" id="aux-correo" placeholder="Correo electrónico *">
            <input type="text" class="form-control input-dense mb-2" id="aux-instrumento" placeholder="Instrumento principal *">
            <div class="d-flex justify-content-end gap-2">
              <button type="button" class="btn btn-secondary btn-sm px-2 py-1" id="btn-cancel-auxiliar">Cancelar</button>
              <button type="button" class="btn btn-primary btn-sm px-2 py-1" id="btn-save-auxiliar">
                <span class="spinner-border spinner-border-sm me-1 d-none" role="status" id="aux-spinner"></span>
                Guardar
              </button>
            </div>
          </div>
        </div>
      </div>
      <div class="col-md-6">
        <label class="form-label-compact">Máx. alumnos</label>
        <input type="number" class="form-control input-dense" id="modal-max_alumnos" value="${clase?.max_alumnos || 20}" min="1" max="50">
      </div>
      <div class="col-md-6">
        <label class="form-label-compact">Estado</label>
        <select class="form-select input-dense" id="modal-estado">
          ${getEstadosOptions(clase?.estado || 'activa')}
        </select>
      </div>
      <div class="col-12">
        <label class="form-label-compact">Horarios *</label>
        <div id="salon-form-container" class="mt-1 mb-2 p-2 border rounded bg-body-tertiary" style="display: none;">
          <h6 class="small fw-bold mb-2"><i class="bi bi-door-open me-1"></i>Crear Nuevo Salón</h6>
          <div class="row g-2 mb-2">
            <div class="col-8">
              <input type="text" class="form-control input-dense" id="new-salon-nombre" placeholder="Nombre del salón *">
            </div>
            <div class="col-4">
              <input type="number" class="form-control input-dense" id="new-salon-capacidad" placeholder="Cap." value="20">
            </div>
          </div>
          <div class="d-flex justify-content-end gap-2">
            <button type="button" class="btn btn-secondary btn-sm px-2 py-1" id="btn-cancel-salon">Cancelar</button>
            <button type="button" class="btn btn-primary btn-sm px-2 py-1" id="btn-save-salon">
              <span class="spinner-border spinner-border-sm me-1 d-none" role="status" id="salon-spinner"></span>
              Guardar
            </button>
          </div>
        </div>
        <div id="modal-horarios-container">
          ${renderHorariosContainer(clase?.horarios || [])}
        </div>
        <button type="button" class="btn btn-dashed w-100 mt-2 py-2" id="btn-add-horario">
          <i class="bi bi-plus-circle"></i>
          <span class="small fw-semibold">Agregar otro horario</span>
        </button>
      </div>
      <div class="col-12">
        <label class="form-label-compact">Notas pedagógicas</label>
        <textarea class="form-control input-dense" id="modal-notas_pedagogicas" rows="2" placeholder="Notas sobre la clase...">${escapeHTML(clase?.notas_pedagogicas || '')}</textarea>
      </div>
      <div class="col-12 mt-3">
        <div class="d-flex align-items-center justify-content-between mb-2">
          <label class="form-label-compact mb-0"><i class="bi bi-people me-1"></i>Inscribir Alumnos</label>
          <span class="badge bg-info-subtle text-info border border-info-subtle" style="font-size: 0.65rem;">Opcional</span>
        </div>
        ${getAlumnosSelectorHTML(inscritosIds)}
      </div>
    </form>
  `
}

function openCreateModal() {
  state.editando = null
  const formBody = getClaseFormHTML()
  
  AppModal.open({
    title: 'Nueva Clase',
    body: formBody,
    size: 'lg',
    saveText: 'Guardar',
    onShow: (modalBody) => {
      modalBody.querySelector('#btn-add-horario')?.addEventListener('click', () => {
        const container = modalBody.querySelector('#modal-horarios-container')
        const index = container.children.length
        container.insertAdjacentHTML('beforeend', renderHorarioRow(null, index))
      })
      updateAuxiliarLogic(modalBody)
      updateSalonLogic(modalBody)
      updateAlumnosLogic(modalBody)
    },
    onSave: async (modalBody) => {
      const getFormData = () => {
        const nombre = modalBody.querySelector('#modal-nombre').value.trim()
        const programa_id = modalBody.querySelector('#modal-programa_id').value
        const maestro_id = modalBody.querySelector('#modal-maestro_id').value
        const tieneAuxiliar = modalBody.querySelector('#modal-has-auxiliar').checked
        const maestro_auxiliar_id = tieneAuxiliar ? modalBody.querySelector('#modal-maestro_auxiliar_id').value : null
        const instrumento = modalBody.querySelector('#modal-instrumento').value.trim()
        const max_alumnos = parseInt(modalBody.querySelector('#modal-max_alumnos').value) || 20
        const estado = modalBody.querySelector('#modal-estado').value
        const notas_pedagogicas = modalBody.querySelector('#modal-notas_pedagogicas').value.trim()

        const horarioRows = modalBody.querySelectorAll('.horario-row')
        const horarios = Array.from(horarioRows).map(row => ({
          dia: row.querySelector('[name="horario-dia"]').value,
          hora_inicio: row.querySelector('[name="horario-hora_inicio"]').value,
          hora_fin: row.querySelector('[name="horario-hora_fin"]').value,
          salon_id: row.querySelector('[name="horario-salon_id"]').value || null,
        }))

        return { nombre, programa_id, maestro_id, maestro_auxiliar_id, instrumento, max_alumnos, estado, notas_pedagogicas, horarios }
      }

      const saveClaseFn = async (isForce = false) => {
        const data = getFormData()
        
        if (!data.nombre) throw new Error('El nombre es obligatorio')
        if (!data.programa_id) throw new Error('Debe seleccionar un programa')
        if (!data.maestro_id) throw new Error('Debe seleccionar un maestro titular')
        if (!data.instrumento) throw new Error('Debe seleccionar un instrumento')
        if (data.horarios.length === 0) throw new Error('Debe agregar al menos un horario')

        try {
          const claseCreada = await crearClase(data, isForce)
          
          const selectedAlumnoIds = Array.from(modalBody.querySelectorAll('.alumnos-list input[type="checkbox"]:checked')).map(cb => cb.value)
          if (selectedAlumnoIds.length > 0) {
            AppToast.info(`Inscribiendo ${selectedAlumnoIds.length} alumnos...`)
            await Promise.all(selectedAlumnoIds.map(alumnoId => inscribirAlumno(claseCreada.id, alumnoId)))
          }

          await renderClasesView(state.container)
          AppToast.success(isForce ? 'Clase creada con prioridad (forzada)' : 'Clase creada correctamente')
          return true
        } catch (err) {
          if (err.isConflict) {
            mostrarConflictos(err.conflictData)
            return false
          }
          throw err
        }
      }

      const mostrarConflictos = (conflictos) => {
        // Renderizar modal de conflictos con opciones de edición inline
        const diasSemana = ['lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado', 'domingo']
        const diasOptions = diasSemana.map(d => `<option value="${d}">${d.charAt(0).toUpperCase() + d.slice(1)}</option>`).join('')
        const salonesOptions = state.salones.map(s => `<option value="${s.id}">${escapeHTML(s.nombre)}</option>`).join('')

        const renderConflictoEditable = (c, index) => {
          const [diaStr, rangoHora] = c.horario.split(' de ')
          const [horaInicio, horaFin] = rangoHora ? rangoHora.split(' a ') : ['', '']
          
          return `
            <div class="conflicto-card mb-3 border rounded bg-body-tertiary overflow-hidden" data-conflicto-index="${index}" data-clase-id="${c.clase_id}">
              <div class="conflicto-header d-flex align-items-center gap-3 p-3 border-bottom">
                <div class="text-warning fs-4"><i class="bi bi-exclamation-triangle-fill"></i></div>
                <div class="flex-grow-1">
                  <div class="fw-bold text-uppercase small text-muted">Conflicto de ${c.tipo}</div>
                  <div class="text-body">${c.detalle}</div>
                </div>
                <button class="btn btn-sm btn-outline-primary btn-toggle-edit" data-index="${index}">
                  <i class="bi bi-pencil"></i> Reubicar
                </button>
              </div>
              
              <div class="conflicto-preview p-3">
                <div class="d-flex align-items-center gap-2 text-secondary small">
                  <i class="bi bi-clock"></i>
                  <span class="conflicto-horario-text">${c.horario}</span>
                </div>
              </div>

              <div class="conflicto-editor p-3 border-top bg-body-secondary" style="display:none;">
                <div class="row g-2">
                  <div class="col-md-4">
                    <label class="form-label small text-muted">Día</label>
                    <select class="form-select form-select-sm conflicto-dia" data-index="${index}">
                      ${diasOptions}
                    </select>
                  </div>
                  <div class="col-md-3">
                    <label class="form-label small text-muted">Inicio</label>
                    <input type="time" class="form-control form-control-sm conflicto-hora-inicio" value="${horaInicio}" data-index="${index}">
                  </div>
                  <div class="col-md-3">
                    <label class="form-label small text-muted">Fin</label>
                    <input type="time" class="form-control form-control-sm conflicto-hora-fin" value="${horaFin}" data-index="${index}">
                  </div>
                  <div class="col-md-2 d-flex align-items-end">
                    <button class="btn btn-sm btn-success w-100 btn-guardar-conflicto" data-index="${index}">
                      <i class="bi bi-check-lg"></i>
                    </button>
                  </div>
                </div>
                ${c.tipo === 'salón' ? `
                <div class="mt-2">
                  <label class="form-label small text-muted">Salón alternativo</label>
                  <select class="form-select form-select-sm conflicto-salon" data-index="${index}">
                    <option value="">-- Mantener actual --</option>
                    ${salonesOptions}
                  </select>
                </div>
                ` : ''}
                <div class="mt-2 d-flex gap-2">
                  <button class="btn btn-sm btn-outline-secondary btn-cancelar-conflicto" data-index="${index}">Cancelar</button>
                  <button class="btn btn-sm btn-outline-danger btn-forzar-uno" data-index="${index}">Forzar este conflicto</button>
                </div>
              </div>
            </div>
          `
        }

        const conflictosHTML = conflictos.map((c, i) => renderConflictoEditable(c, i)).join('')

        modalBody.innerHTML = `
          <div class="p-2 text-center mb-4">
            <div class="display-6 text-warning mb-2"><i class="bi bi-shield-exclamation"></i></div>
            <h4 class="fw-bold">Conflictos de Programación</h4>
            <p class="text-muted">Se detectaron solapamientos. Puedes reubicar la clase existente o forzar la creación.</p>
          </div>
          <div class="mb-3">
            ${conflictosHTML}
          </div>
          <div class="alert alert-info d-flex align-items-center gap-2 py-2">
            <i class="bi bi-info-circle"></i>
            <small>Edita la clase existente para resolver el conflicto, o usa "Forzar" para crear de todas formas.</small>
          </div>
        `

        // Eventos para editar inline
        modalBody.querySelectorAll('.btn-toggle-edit').forEach(btn => {
          btn.addEventListener('click', async (e) => {
            const index = e.currentTarget.dataset.index
            const card = modalBody.querySelector(`[data-conflicto-index="${index}"]`)
            const editor = card.querySelector('.conflicto-editor')
            const preview = card.querySelector('.conflicto-preview')
            
            // Cargar datos actuales de la clase conflictiva
            const conflicto = conflictos[index]
            try {
              const { data: horariosConflicto } = await supabase
                .from('clase_horarios')
                .select('*')
                .eq('clase_id', conflicto.clase_id)
              
              const h = horariosConflicto?.[0]
              if (h) {
                const selectDia = editor.querySelector('.conflicto-dia')
                if (selectDia) selectDia.value = h.dia
                const inputInicio = editor.querySelector('.conflicto-hora-inicio')
                if (inputInicio) inputInicio.value = h.hora_inicio?.slice(0,5) || ''
                const inputFin = editor.querySelector('.conflicto-hora-fin')
                if (inputFin) inputFin.value = h.hora_fin?.slice(0,5) || ''
                const selectSalon = editor.querySelector('.conflicto-salon')
                if (selectSalon) selectSalon.value = h.salon_id || ''
              }
            } catch (err) {
              console.warn('Error cargando horario conflictivo:', err)
            }
            
            editor.style.display = 'block'
            preview.style.display = 'none'
            e.currentTarget.style.display = 'none'
          })
        })

        modalBody.querySelectorAll('.btn-cancelar-conflicto').forEach(btn => {
          btn.addEventListener('click', (e) => {
            const index = e.currentTarget.dataset.index
            const card = modalBody.querySelector(`[data-conflicto-index="${index}"]`)
            const editor = card.querySelector('.conflicto-editor')
            const preview = card.querySelector('.conflicto-preview')
            const btnEdit = card.querySelector('.btn-toggle-edit')
            
            editor.style.display = 'none'
            preview.style.display = 'block'
            btnEdit.style.display = 'inline-block'
          })
        })

        modalBody.querySelectorAll('.btn-guardar-conflicto').forEach(btn => {
          btn.addEventListener('click', async (e) => {
            const index = e.currentTarget.dataset.index
            const card = modalBody.querySelector(`[data-conflicto-index="${index}"]`)
            const editor = card.querySelector('.conflicto-editor')
            
            const conflicto = conflictos[index]
            const nuevoDia = editor.querySelector('.conflicto-dia')?.value
            const nuevaHoraInicio = editor.querySelector('.conflicto-hora-inicio')?.value
            const nuevaHoraFin = editor.querySelector('.conflicto-hora-fin')?.value
            const nuevoSalon = editor.querySelector('.conflicto-salon')?.value

            if (!nuevoDia || !nuevaHoraInicio || !nuevaHoraFin) {
              AppToast.error('Completa día, hora de inicio y fin')
              return
            }

            try {
              // Actualizar horario de la clase conflictiva
              const { error: errorHorario } = await supabase
                .from('clase_horarios')
                .update({
                  dia: nuevoDia,
                  hora_inicio: nuevaHoraInicio,
                  hora_fin: nuevaHoraFin,
                  ...(nuevoSalon ? { salon_id: nuevoSalon } : {})
                })
                .eq('clase_id', conflicto.clase_id)

              if (errorHorario) throw errorHorario

              AppToast.success(`Horario de "${conflicto.clase_nombre || 'clase'}" actualizado`)
              
              // Cerrar editor y refrescar
              editor.style.display = 'none'
              const preview = card.querySelector('.conflicto-preview')
              const horarioText = card.querySelector('.conflicto-horario-text')
              if (horarioText) horarioText.textContent = `${nuevoDia} de ${nuevaHoraInicio} a ${nuevaHoraFin}`
              preview.style.display = 'block'
              
              // Ocultar este conflicto resuelto
              card.style.opacity = '0.6'
              card.querySelector('.btn-toggle-edit').style.display = 'none'
              
              // Verificar si quedan conflictos sin resolver
              const conflictosPendientes = modalBody.querySelectorAll('.conflicto-card:not([style*="opacity"])')
              if (conflictosPendientes.length === 0) {
                // Todos resueltos, permitir guardar
                AppModal.resetSaveBtn('Guardar (conflictos resueltos)')
              }
            } catch (err) {
              AppToast.error('Error actualizando: ' + err.message)
            }
          })
        })

        modalBody.querySelectorAll('.btn-forzar-uno').forEach(btn => {
          btn.addEventListener('click', (e) => {
            const index = e.currentTarget.dataset.index
            const card = modalBody.querySelector(`[data-conflicto-index="${index}"]`)
            card.style.opacity = '0.5'
            card.querySelector('.conflicto-editor').style.display = 'none'
            card.querySelector('.conflicto-preview').style.display = 'block'
            
            // Marcar este conflicto como forzado
            conflicto._forzado = true
          })
        })

        AppModal.resetSaveBtn('Forzar Creación')
        const footer = document.querySelector('.app-modal-footer')
        const oldCancel = footer.querySelector('.app-modal-btn-cancel')
        
        const btnVolver = oldCancel.cloneNode(true)
        btnVolver.textContent = 'Volver a Editar'
        btnVolver.classList.replace('btn-secondary', 'btn-outline-secondary')
        oldCancel.parentNode.replaceChild(btnVolver, oldCancel)

        btnVolver.onclick = () => {
          modalBody.innerHTML = formBody
          AppModal.resetSaveBtn('Guardar')
          btnVolver.parentNode.replaceChild(oldCancel, btnVolver)
          updateAuxiliarLogic(modalBody)
          updateSalonLogic(modalBody)
          updateAlumnosLogic(modalBody)
        }

        AppModal.setSaveHandler(async () => {
          try {
            return await saveClaseFn(true)
          } catch (err) {
            AppToast.error(err.message)
            return false
          }
        })
      }

      try {
        const data = getFormData()
        const conflictos = await validarHorario(data.horarios, data.maestro_id, null)
        if (conflictos.length > 0) {
          mostrarConflictos(conflictos)
          return false
        }
        return await saveClaseFn(false)
      } catch (err) {
        AppToast.error(err.message)
        return false
      }
    }
  })
}


async function openEditModal(id) {
  // Soportar tanto string como UUID para el id
  const clase = state.clasesOriginales.find(c => String(c.id) === String(id))
  if (!clase) {
    console.error('[openEditModal] Clase no encontrada. id recibido:', id, '| disponibles:', state.clasesOriginales.map(c => c.id))
    AppToast.error('Clase no encontrada')
    return
  }

  AppModal.open({
    title: 'Cargando...',
    body: '<div class="text-center py-4"><div class="spinner-border text-primary"></div></div>',
    hideSave: true
  })

  try {
    const inscritosRaw = await obtenerAlumnosInscritos(id)
    const inscritosIds = inscritosRaw.map(r => r.alumno_id)
    const formBody = getClaseFormHTML(clase, inscritosIds)

    AppModal.open({
      title: 'Editar Clase',
      body: formBody,
      size: 'lg',
      saveText: 'Guardar cambios',
      onShow: (modalBody) => {
        modalBody.querySelector('#btn-add-horario')?.addEventListener('click', () => {
          const container = modalBody.querySelector('#modal-horarios-container')
          const index = container.children.length
          container.insertAdjacentHTML('beforeend', renderHorarioRow(null, index))
        })
        updateAuxiliarLogic(modalBody)
        updateSalonLogic(modalBody)
        updateAlumnosLogic(modalBody)
      },
      onSave: async (modalBody) => {
        const getFormData = () => {
          const nombre = modalBody.querySelector('#modal-nombre').value.trim()
          const programa_id = modalBody.querySelector('#modal-programa_id').value
          const maestro_id = modalBody.querySelector('#modal-maestro_id').value
          const tieneAuxiliar = modalBody.querySelector('#modal-has-auxiliar').checked
          const maestro_auxiliar_id = tieneAuxiliar ? modalBody.querySelector('#modal-maestro_auxiliar_id').value : null
          const instrumento = modalBody.querySelector('#modal-instrumento').value.trim()
          const max_alumnos = parseInt(modalBody.querySelector('#modal-max_alumnos').value) || 20
          const estado = modalBody.querySelector('#modal-estado').value
          const notas_pedagogicas = modalBody.querySelector('#modal-notas_pedagogicas').value.trim()

          const horarioRows = modalBody.querySelectorAll('.horario-row')
          const horarios = Array.from(horarioRows).map(row => ({
            dia: row.querySelector('[name="horario-dia"]').value,
            hora_inicio: row.querySelector('[name="horario-hora_inicio"]').value,
            hora_fin: row.querySelector('[name="horario-hora_fin"]').value,
            salon_id: row.querySelector('[name="horario-salon_id"]').value || null,
          }))

          return { nombre, programa_id, maestro_id, maestro_auxiliar_id, instrumento, max_alumnos, estado, notas_pedagogicas, horarios }
        }

        const saveClaseFn = async (isForce = false) => {
          const data = getFormData()
          try {
            const actualizada = await actualizarClase(id, data, isForce)
            
            const currentlySelected = Array.from(modalBody.querySelectorAll('.alumnos-list input[type="checkbox"]:checked')).map(cb => cb.value)
            
            const toEnroll = currentlySelected.filter(sid => !inscritosIds.includes(sid))
            const toRemove = inscritosIds.filter(sid => !currentlySelected.includes(sid))

            if (toEnroll.length > 0 || toRemove.length > 0) {
              AppToast.info('Actualizando lista de alumnos...')
              await Promise.all([
                ...toEnroll.map(sid => inscribirAlumno(id, sid)),
                ...toRemove.map(sid => desinscribirAlumno(id, sid))
              ])
            }

            const idx = state.clasesOriginales.findIndex(c => c.id === id)
            if (idx !== -1) {
              state.clasesOriginales[idx] = { ...state.clasesOriginales[idx], ...actualizada }
            }
            applyFilters()
            AppToast.success(isForce ? 'Clase actualizada con prioridad (forzada)' : 'Clase actualizada correctamente')
            return true
          } catch (err) {
            if (err.isConflict) {
              mostrarConflictos(err.conflictData)
              return false
            }
            throw err
          }
        }

        const mostrarConflictos = (conflictos) => {
          const warnings = conflictos.map(c => `
            <div class="d-flex align-items-start gap-3 p-3 mb-2 border rounded bg-body-tertiary">
              <div class="text-warning fs-4"><i class="bi bi-exclamation-triangle-fill"></i></div>
              <div>
                <div class="fw-bold text-uppercase small text-muted">Conflicto de ${c.tipo}</div>
                <div class="text-body">${c.detalle}</div>
                <div class="small text-secondary"><i class="bi bi-clock me-1"></i> ${c.horario}</div>
              </div>
            </div>
          `).join('')

          modalBody.innerHTML = `
            <div class="p-2 text-center mb-4">
              <div class="display-6 text-warning mb-2"><i class="bi bi-shield-exclamation"></i></div>
              <h4 class="fw-bold">Conflictos Detectados</h4>
              <p class="text-muted">Esta actualización genera solapamientos en la agenda.</p>
            </div>
            <div class="mb-4">
              ${warnings}
            </div>
          `

          AppModal.resetSaveBtn('Sí, Forzar Cambios')
          const footer = document.querySelector('.app-modal-footer')
          const oldCancel = footer.querySelector('.app-modal-btn-cancel')
          
          const btnVolver = oldCancel.cloneNode(true)
          btnVolver.textContent = 'Volver a Editar'
          btnVolver.classList.replace('btn-secondary', 'btn-outline-secondary')
          oldCancel.parentNode.replaceChild(btnVolver, oldCancel)

          btnVolver.onclick = () => {
            modalBody.innerHTML = formBody
            AppModal.resetSaveBtn('Guardar cambios')
            btnVolver.parentNode.replaceChild(oldCancel, btnVolver)
            updateAuxiliarLogic(modalBody)
            updateSalonLogic(modalBody)
            updateAlumnosLogic(modalBody)
          }

          AppModal.setSaveHandler(async () => {
            try {
              return await saveClaseFn(true)
            } catch (err) {
              AppToast.error(err.message)
              return false
            }
          })
        }

        try {
          return await saveClaseFn(false)
        } catch (err) {
          AppToast.error(err.message)
          return false
        }
      }
    })
  } catch (err) {
    console.error('[openEditModal] Error cargando alumnos inscritos:', err)
    AppModal.close()
    AppToast.error('Error al cargar datos de la clase')
  }
}


function openViewModal(id) {
  const clase = state.clasesOriginales.find(c => String(c.id) === String(id))
  if (!clase) {
    AppToast.error('Clase no encontrada')
    return
  }

  const maestroId = clase.maestro_id || clase.maestro_principal_id
  const maestro = state.maestros.find(m => m.id === maestroId)
  const auxiliarId = clase.maestro_auxiliar_id || clase.maestro_suplente_id
  const maestroAuxiliar = state.maestros.find(m => m.id === auxiliarId)
  const programa = state.programas.find(p => p.id === clase.programa_id)
  const horarios = clase.horarios || []

  const horariosHTML = horarios.map(h => {
    const salon = state.salones.find(s => s.id === h.salon_id)
    const duracion = calcularDuracion(h.hora_inicio, h.hora_fin)
    const diaLabel = h.dia.charAt(0).toUpperCase() + h.dia.slice(1)
    return `<div class="d-flex justify-content-between align-items-center border-bottom py-2">
      <span><strong>${diaLabel}</strong>: ${formatHora(h.hora_inicio)} - ${formatHora(h.hora_fin)} (${duracion} min)</span>
      <span class="badge bg-secondary">${salon ? escapeHTML(salon.nombre) : 'Sin salón'}</span>
    </div>`
  }).join('')

  AppModal.open({
    title: escapeHTML(clase.nombre),
    saveText: 'Editar',
    cancelText: 'Cerrar',
    onSave: () => {
      openEditModal(id)
      return false // Evita que se cierre y permite que openEditModal sobreescriba el DOM
    },
    onShow: (modalBody) => {
      modalBody.querySelector('#btn-gestionar-alumnos')?.addEventListener('click', () => {
        openAlumnoInscripcionModal(id)
      })
    },
    body: `
      <div class="row">
        <div class="col-md-6">
          <div class="mb-3">
            <label class="form-label fw-bold">Nombre</label>
            <p class="form-control-plaintext">${escapeHTML(clase.nombre)}</p>
          </div>
          <div class="mb-3">
            <label class="form-label fw-bold">Programa</label>
            <p class="form-control-plaintext">${programa ? escapeHTML(programa.nombre || programa.name) : '<span class="text-muted">Sin programa</span>'}</p>
          </div>
          <div class="mb-3">
            <label class="form-label fw-bold">Instrumento</label>
            <p class="form-control-plaintext"><i class="bi ${getInstrumentoIcon(clase.instrumento)}"></i> ${escapeHTML(clase.instrumento || '-')}</p>
          </div>
          <div class="mb-3">
            <label class="form-label fw-bold">Maestro titular</label>
            <p class="form-control-plaintext">${maestro ? escapeHTML(maestro.nombre_completo || maestro.nombre) : (maestroId ? '<span class="text-warning">ID no encontrado</span>' : '<span class="text-muted">No asignado</span>')}</p>
          </div>
          <div class="mb-3">
            <label class="form-label fw-bold">Maestro auxiliar</label>
            <p class="form-control-plaintext">${maestroAuxiliar ? escapeHTML(maestroAuxiliar.nombre_completo || maestroAuxiliar.nombre) : '<span class="text-muted">No asignado</span>'}</p>
          </div>
        </div>
        <div class="col-md-6">
          <div class="mb-3">
            <label class="form-label fw-bold">Horarios</label>
            <div class="form-control-plaintext">${horariosHTML || 'Sin horarios'}</div>
          </div>
          <div class="mb-3">
            <label class="form-label fw-bold">Estado</label>
            <p class="form-control-plaintext">
              <span class="badge ${getEstadoBadgeClass(clase.estado)}">${getEstadoLabel(clase.estado)}</span>
            </p>
          </div>
          <div class="mb-3">
            <label class="form-label fw-bold">Máx. alumnos</label>
            <p class="form-control-plaintext">${clase.max_alumnos || 20}</p>
          </div>
          <div class="mb-3 mt-4">
            <button type="button" class="btn btn-outline-primary btn-sm w-100" id="btn-gestionar-alumnos">
              <i class="bi bi-people-fill me-2"></i> Gestionar alumnos inscritos
            </button>
          </div>
        </div>
      </div>
      <hr>
      <div class="mb-3">
        <label class="form-label fw-bold">Notas pedagógicas</label>
        <p class="form-control-plaintext">${clase.notas_pedagogicas ? escapeHTML(clase.notas_pedagogicas) : '<span class="text-muted">Sin notas pedagógicas</span>'}</p>
      </div>
    `
  })
}

function openDeleteModal(id) {
  const clase = state.clasesOriginales.find(c => String(c.id) === String(id))
  if (!clase) {
    AppToast.error('Clase no encontrada')
    return
  }

  AppModal.open({
    title: '⚠️ Eliminar Clase',
    size: 'sm',
    saveText: 'Eliminar',
    body: `<p>¿Eliminar la clase <strong>${escapeHTML(clase.nombre)}</strong>?</p>
           <p class="text-muted small mb-0">Esta acción no se puede deshacer.</p>`,
    onSave: async () => {
      try {
        await eliminarClase(id)
        state.clasesOriginales = state.clasesOriginales.filter(c => c.id !== id)
        applyFilters()
        AppToast.success('Clase eliminada correctamente')
      } catch (error) {
        AppToast.error(error.message || 'Error al eliminar')
      }
    }
  })
}
