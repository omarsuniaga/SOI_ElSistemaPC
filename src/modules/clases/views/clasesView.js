import '../styles/clases.css'
import { normalizeText } from '../../../core/utils/normalizeText.js'
import { AppModal } from '../../../shared/components/AppModal.js'
import { AppToast } from '../../../shared/components/AppToast.js'
import {
  obtenerClases,
  eliminarClase,
  obtenerAlumnosInscritos,
} from '../api/clasesApi.js'
import { supabase } from '../../../lib/supabaseClient.js'
import {
  formatDate,
  escapeHTML,
  formatHora,
  getEstadoBadgeClass,
  getEstadoLabel,
  getInstrumentoIcon,
  getInitials,
  getConsistentColor,
  timeToMinutes,
} from '../utils/clasesUtils.js'
import { openClaseModal } from '../components/claseModal.js'
import { descargarPdfClase, descargarPdfListadoAlumnosPorClases } from '../domain/generarPdfClase.js'
import { HelpPanel } from '../../../shared/components/HelpPanel.js'

const state = {
  clases: [],
  clasesOriginales: [],
  maestros: [],
  salones: [],
  programas: [],
  alumnos: [],
  cargando: false,
  filtroEstado: 'todos',
  filtroInstrumento: '',
  filtroNivel: '',
  filtroTipo: '',
  filtroSalon: '',
  filtroDia: '',
  filtroBuscar: '',
  vista: 'tabla',
  container: null,
  mostrarDiasVacios: true,
}

/**
 * Vista de Clases Académicas (Simplified Refactor)
 */
export async function renderClasesView(container) {
  if (!container) return

  try {
    state.container = container
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
  container.innerHTML = `
    <div class="d-flex justify-content-center align-items-center" style="min-height: 400px;">
      <div class="text-center">
        <div class="spinner-border text-primary mb-3" role="status"></div>
        <p class="text-muted">Cargando clases...</p>
      </div>
    </div>
  `
}

function renderError(container, mensaje) {
  container.innerHTML = `
    <div class="container mt-5 text-center">
      <div class="alert alert-danger d-inline-block" role="alert">
        <h4 class="alert-heading"><i class="bi bi-exclamation-triangle"></i> Error al cargar</h4>
        <p>${escapeHTML(mensaje)}</p>
        <button class="btn btn-primary btn-sm" id="retryBtn">Reintentar</button>
      </div>
    </div>
  `
  container.querySelector('#retryBtn')?.addEventListener('click', () => renderClasesView(container))
}

function getInstrumentoOptions() {
  const instruments = [...new Set(
    state.clasesOriginales.map(c => c.instrumento).filter(Boolean).sort()
  )]
  return instruments.map(i =>
    `<option value="${escapeHTML(i)}" ${state.filtroInstrumento === i ? 'selected' : ''}>${escapeHTML(i)}</option>`
  ).join('')
}

function getSalonOptions() {
  const fromSalones = state.salones.map(s => s.nombre || s.name || s).filter(Boolean)
  const fromClases  = state.clasesOriginales.map(c => c.salon).filter(Boolean)
  const all = [...new Set([...fromSalones, ...fromClases])].sort()
  return all.map(s =>
    `<option value="${escapeHTML(s)}" ${state.filtroSalon === s ? 'selected' : ''}>${escapeHTML(s)}</option>`
  ).join('')
}

function renderContent(container) {
  container.innerHTML = `
    <div class="page-container">
      <div class="clases-header-premium mb-4">
        <div class="d-flex align-items-center gap-3">
          <div class="brand-badge bg-primary bg-opacity-10 text-primary rounded-3 d-flex align-items-center justify-content-center" style="width: 42px; height: 42px;">
            <i class="bi bi-book fs-4"></i>
          </div>
          <div>
            <h1 class="clases-title-premium mb-0">Clases</h1>
            <p class="text-muted small mb-0">${state.clases.length} clases en total</p>
          </div>
        </div>
        
        <div class="clases-header-actions">
          <button class="btn-help-trigger" id="btn-help-clases" title="¿Cómo funciona esta pantalla?" aria-label="Ayuda">
            <i class="bi bi-question"></i>
          </button>
          <div class="view-segmented-control">
            <button class="view-segment-btn ${state.vista === 'tabla' ? 'active' : ''}" id="btn-vista-tabla" title="Vista de lista">
              <i class="bi bi-list-ul"></i>
            </button>
            <button class="view-segment-btn ${state.vista === 'calendario' ? 'active' : ''}" id="btn-vista-calendario" title="Vista de agenda">
              <i class="bi bi-calendar-week"></i>
            </button>
          </div>
          <button class="btn btn-outline-secondary" id="btnPdfListadoAlumnosClases" type="button">
            <i class="bi bi-file-earmark-pdf me-1"></i>PDF Listados Alumnos x Clases
          </button>
          <button class="btn btn-premium-action" id="btnAgregarClase">
            <i class="bi bi-plus-lg me-1.5"></i>Nueva Clase
          </button>
        </div>
      </div>

      <div class="clases-filter-toolbar mb-4 flex-wrap gap-2">
        <div class="premium-search-container flex-grow-1" style="min-width:200px;">
          <i class="bi bi-search search-icon-muted"></i>
          <input type="text" class="form-control premium-search-input" placeholder="Buscar por nombre, maestro, instrumento..." id="buscar" value="${escapeHTML(state.filtroBuscar)}">
        </div>

        <div class="premium-select-container">
          <i class="bi bi-funnel select-icon-muted"></i>
          <select class="form-select premium-filter-select" id="filtroEstado">
            <option value="todos"      ${state.filtroEstado === 'todos'      ? 'selected' : ''}>Todos los estados</option>
            <option value="activa"     ${state.filtroEstado === 'activa'     ? 'selected' : ''}>Activa</option>
            <option value="suspendida" ${state.filtroEstado === 'suspendida' ? 'selected' : ''}>Pausada</option>
            <option value="finalizada" ${state.filtroEstado === 'finalizada' ? 'selected' : ''}>Finalizada</option>
            <option value="emergente"  ${state.filtroEstado === 'emergente'  ? 'selected' : ''}>Emergente</option>
            <option value="cancelada"  ${state.filtroEstado === 'cancelada'  ? 'selected' : ''}>Cancelada</option>
          </select>
        </div>

        <div class="premium-select-container">
          <i class="bi bi-music-note select-icon-muted"></i>
          <select class="form-select premium-filter-select" id="filtroInstrumento">
            <option value="">Instrumento</option>
            ${getInstrumentoOptions()}
          </select>
        </div>

        <div class="premium-select-container">
          <i class="bi bi-bar-chart-steps select-icon-muted"></i>
          <select class="form-select premium-filter-select" id="filtroNivel">
            <option value=""           ${state.filtroNivel === ''           ? 'selected' : ''}>Nivel</option>
            <option value="iniciacion" ${state.filtroNivel === 'iniciacion' ? 'selected' : ''}>Iniciación</option>
            <option value="basico"     ${state.filtroNivel === 'basico'     ? 'selected' : ''}>Básico</option>
            <option value="intermedio" ${state.filtroNivel === 'intermedio' ? 'selected' : ''}>Intermedio</option>
            <option value="avanzado"   ${state.filtroNivel === 'avanzado'   ? 'selected' : ''}>Avanzado</option>
            <option value="preparatoria" ${state.filtroNivel === 'preparatoria' ? 'selected' : ''}>Preparatoria</option>
          </select>
        </div>

        <div class="premium-select-container">
          <i class="bi bi-tag select-icon-muted"></i>
          <select class="form-select premium-filter-select" id="filtroTipo">
            <option value=""            ${state.filtroTipo === ''            ? 'selected' : ''}>Tipo</option>
            <option value="regular"     ${state.filtroTipo === 'regular'     ? 'selected' : ''}>Regular</option>
            <option value="taller"      ${state.filtroTipo === 'taller'      ? 'selected' : ''}>Taller</option>
            <option value="seccional"   ${state.filtroTipo === 'seccional'   ? 'selected' : ''}>Seccional</option>
            <option value="orquesta"    ${state.filtroTipo === 'orquesta'    ? 'selected' : ''}>Orquesta</option>
            <option value="coro"        ${state.filtroTipo === 'coro'        ? 'selected' : ''}>Coro</option>
            <option value="preparatoria" ${state.filtroTipo === 'preparatoria' ? 'selected' : ''}>Preparatoria</option>
            <option value="iniciacion"  ${state.filtroTipo === 'iniciacion'  ? 'selected' : ''}>Iniciación</option>
            <option value="emergente"   ${state.filtroTipo === 'emergente'   ? 'selected' : ''}>Emergente</option>
            <option value="refuerzo"    ${state.filtroTipo === 'refuerzo'    ? 'selected' : ''}>Refuerzo</option>
          </select>
        </div>

        <div class="premium-select-container">
          <i class="bi bi-door-open select-icon-muted"></i>
          <select class="form-select premium-filter-select" id="filtroSalon">
            <option value="">Salón</option>
            ${getSalonOptions()}
          </select>
        </div>

        <div class="premium-select-container">
          <i class="bi bi-calendar-week select-icon-muted"></i>
          <select class="form-select premium-filter-select" id="filtroDia">
            <option value=""         ${state.filtroDia === ''         ? 'selected' : ''}>Día</option>
            <option value="lunes"    ${state.filtroDia === 'lunes'    ? 'selected' : ''}>Lunes</option>
            <option value="martes"   ${state.filtroDia === 'martes'   ? 'selected' : ''}>Martes</option>
            <option value="miercoles" ${state.filtroDia === 'miercoles' ? 'selected' : ''}>Miércoles</option>
            <option value="jueves"   ${state.filtroDia === 'jueves'   ? 'selected' : ''}>Jueves</option>
            <option value="viernes"  ${state.filtroDia === 'viernes'  ? 'selected' : ''}>Viernes</option>
            <option value="sabado"   ${state.filtroDia === 'sabado'   ? 'selected' : ''}>Sábado</option>
          </select>
        </div>

        <button class="btn btn-outline-secondary btn-sm align-self-center" id="btnLimpiarFiltros" type="button" title="Limpiar filtros">
          <i class="bi bi-x-circle me-1"></i>Limpiar
        </button>
      </div>

      <div id="view-content">
        ${state.vista === 'tabla' ? renderTableView() : renderCalendarView()}
      </div>
    </div>
  `
}

function renderTableView() {
  if (state.clases.length === 0) {
    return renderEmpty()
  }

  return `
    <div class="page-glass rounded w-100">
      <div class="list-group list-group-flush w-100" id="clasesListBody">
        ${state.clases.map(c => renderClaseCard(c)).join('')}
      </div>
    </div>
  `
}

function renderClaseCard(clase) {
  const nombre = clase.nombre || 'Sin nombre'
  const maestro = state.maestros.find(m => m.id === clase.maestro_principal_id)
  const maestroNombre = maestro ? (maestro.nombre_completo || maestro.nombre) : 'Sin maestro'
  const maestroSuplente = state.maestros.find(m => m.id === clase.maestro_suplente_id)
  const maestroSuplenteNombre = maestroSuplente ? (maestroSuplente.nombre_completo || maestroSuplente.nombre) : null
  const initials = getInitials(nombre)
  const estado = clase.estado || 'activa'
  const accentClass = `border-accent-${estado === 'activa' ? 'success' : estado === 'suspendida' ? 'warning' : 'secondary'}`
  const statusDotClass = `bg-${estado === 'activa' ? 'success' : estado === 'suspendida' ? 'warning' : 'secondary'}`
  const horarios = (clase.horarios || []).slice(0, 3) // Mostrar máximo 3 horarios
  const horariosTexto = horarios.length > 0
    ? horarios.map(h => `${(h.dia || '').slice(0, 2).toUpperCase()} ${(h.hora_inicio || '').slice(0, 5)}`).join(' • ')
    : 'Sin horarios'

  return `
    <div class="list-group-item list-group-item-action d-flex align-items-center justify-content-between p-3 w-100 border-start-accent ${accentClass}" data-id="${clase.id}" style="cursor: pointer;">
      <div class="d-flex align-items-center gap-3 flex-grow-1 overflow-hidden">
        <div class="position-relative flex-shrink-0">
          <div class="avatar-compact bg-primary bg-opacity-10 text-primary border border-primary-subtle d-flex align-items-center justify-content-center rounded-circle" style="width: 48px; height: 48px; font-size: 1.2rem; font-weight: 600;">
            ${initials}
          </div>
          <span class="position-absolute bottom-0 end-0 p-1 ${statusDotClass} border border-light rounded-circle" style="transform: translate(10%, 10%);">
            <span class="visually-hidden">${estado}</span>
          </span>
        </div>
        <div class="d-flex flex-column flex-grow-1 overflow-hidden pe-3">
          <span class="fw-bold text-truncate" style="font-size: 1.05rem;">${escapeHTML(nombre)}</span>
          <small class="text-muted text-truncate"><i class="bi bi-person-badge me-1"></i>${escapeHTML(maestroNombre)} • ${escapeHTML(clase.instrumento || '-')}</small>
          ${maestroSuplenteNombre ? `<small class="text-muted text-truncate" style="font-size: 0.82rem;"><i class="bi bi-person-dash me-1"></i>Suplente: ${escapeHTML(maestroSuplenteNombre)}</small>` : ''}
          <small class="text-muted extra-small mt-1" style="font-size: 0.85rem;"><i class="bi bi-clock me-1"></i>${escapeHTML(horariosTexto)}</small>
        </div>
      </div>
      <div class="flex-shrink-0 d-flex align-items-center gap-2 ms-2 pe-1">
        <button class="btn btn-outline-secondary btn-sm btn-class-pdf" data-id="${clase.id}" type="button" title="PDF Listado Alumnos x Clase">
          <i class="bi bi-file-earmark-pdf me-1"></i>PDF Listado Alumnos x Clase
        </button>
        <span class="text-muted">
          <i class="bi bi-chevron-right" style="font-size: 1.1rem; transition: transform 0.2s ease;"></i>
        </span>
      </div>
    </div>
  `
}

function renderEmpty() {
  return `
    <div class="text-center py-5 text-muted">
      <i class="bi bi-funnel fs-1 d-block mb-2 opacity-50"></i>
      <p class="mb-1">No se encontraron clases con los filtros seleccionados.</p>
      <small>Probá ajustar o limpiar los filtros.</small>
    </div>
  `
}

function renderCalendarView() {
  if (state.clases.length === 0) {
    return renderEmpty()
  }

  const diasSemana = ['lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado']
  const diasLabels = {
    lunes: 'Lunes',
    martes: 'Martes',
    miércoles: 'Miércoles',
    jueves: 'Jueves',
    viernes: 'Viernes',
    sábado: 'Sábado'
  }

  // 1. Group class schedules by day
  const agenda = {
    lunes: [],
    martes: [],
    miércoles: [],
    jueves: [],
    viernes: [],
    sábado: []
  }

  state.clases.forEach(clase => {
    (clase.horarios || []).forEach(horario => {
      const diaClean = (horario.dia || '').toLowerCase().trim()
      if (agenda[diaClean]) {
        agenda[diaClean].push({
          ...horario,
          clase: clase
        })
      }
    })
  })

  // 2. Sort classes chronologically inside each day
  Object.keys(agenda).forEach(dia => {
    agenda[dia].sort((a, b) => {
      const minA = timeToMinutes(a.hora_inicio)
      const minB = timeToMinutes(b.hora_inicio)
      return minA - minB
    })
  })

  // 3. Render the grid
  const hideEmptyClass = state.mostrarDiasVacios ? '' : 'hide-empty-days'
  return `
    <div class="weekly-schedule-container">
      <div class="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2 px-1 weekly-schedule-toolbar">
        <span class="small text-muted fw-semibold"><i class="bi bi-calendar-week me-1"></i>Agenda Semanal</span>
        <div class="form-check form-switch m-0 d-flex align-items-center gap-2">
          <input class="form-check-input cursor-pointer" type="checkbox" role="switch" id="toggle-empty-days" ${state.mostrarDiasVacios ? 'checked' : ''}>
          <label class="form-check-label select-none small text-muted cursor-pointer" for="toggle-empty-days">Mostrar días vacíos</label>
        </div>
      </div>
      <div class="weekly-schedule-grid ${hideEmptyClass}">
        ${diasSemana.map(dia => {
          const clasesDia = agenda[dia]
          const label = diasLabels[dia]
          const isEmptyClass = clasesDia.length === 0 ? 'is-empty' : ''
          
          return `
            <div class="schedule-day-column ${isEmptyClass}" data-day="${dia}">
              <div class="schedule-day-header">
                <span class="day-label">${label}</span>
                <span class="day-count-badge bg-primary bg-opacity-10 text-primary">${clasesDia.length}</span>
              </div>
              <div class="schedule-blocks-container">
                ${clasesDia.length > 0 ? clasesDia.map(item => {
                  const c = item.clase
                  const estado = c.estado || 'activa'
                  const start = formatHora(item.hora_inicio)
                  const end = formatHora(item.hora_fin)
                  const salon = state.salones.find(s => s.id === item.salon_id)
                  const salonNombre = salon ? salon.nombre : 'Online/Otro'
                  const borderClass = `border-accent-${estado === 'activa' ? 'success' : estado === 'suspendida' ? 'warning' : 'secondary'}`
                  
                  return `
                    <div class="time-block-card p-2 rounded mb-2 border-start-accent ${borderClass}" data-id="${c.id}" style="cursor: pointer;">
                      <div class="d-flex align-items-center justify-content-between mb-1">
                        <span class="time-range small fw-bold text-primary"><i class="bi bi-clock me-1"></i>${start} - ${end}</span>
                        <i class="bi ${getInstrumentoIcon(c.instrumento)} text-muted" style="font-size: 0.85rem;"></i>
                      </div>
                      <div class="fw-semibold text-truncate small class-name" style="font-size: 0.9rem;">${escapeHTML(c.nombre)}</div>
                      <div class="d-flex justify-content-between align-items-center mt-1 extra-small text-muted">
                        <span class="text-truncate" style="max-width: 60%;"><i class="bi bi-person me-0.5"></i>${escapeHTML(state.maestros.find(m => m.id === c.maestro_principal_id)?.nombre_completo || 'Sin maestro')}</span>
                        <span class="badge bg-body-secondary text-body-secondary-custom px-1.5 py-0.5 rounded" style="font-size: 0.7rem;"><i class="bi bi-geo-alt me-0.5"></i>${escapeHTML(salonNombre)}</span>
                      </div>
                    </div>
                  `
                }).join('') : `
                  <div class="empty-day-block text-muted text-center py-4 small">
                    <i class="bi bi-calendar-minus d-block mb-1 opacity-50"></i>
                    Sin clases
                  </div>
                `}
              </div>
            </div>
          `
        }).join('')}
      </div>
    </div>
  `
}

async function openClasePerfilModal(clase) {
  if (!clase) return

  AppModal.open({
    title: 'Cargando...',
    hideSave: true,
    size: 'md',
    body: `
      <div class="text-center py-5">
        <div class="spinner-border text-primary mb-3" role="status"></div>
        <p class="text-muted">Cargando perfil de la clase...</p>
      </div>
    `
  })

  try {
    // 1. Fetch enrolled students
    const inscritos = await obtenerAlumnosInscritos(clase.id)
    const alumnosInscritosCount = inscritos.length
    
    // 2. Fetch associated info
    const maestro = state.maestros.find(m => m.id === clase.maestro_principal_id)
    const maestroNombre = maestro ? (maestro.nombre_completo || maestro.nombre) : 'Sin maestro'
    const suplente = clase.tiene_suplente || clase.maestro_suplente_id ? state.maestros.find(m => m.id === clase.maestro_suplente_id) : null
    const suplenteNombre = suplente ? (suplente.nombre_completo || suplente.nombre) : null
    const programa = state.programas.find(p => p.id === clase.programa_id)
    const programaNombre = programa ? programa.nombre : 'Sin programa'
    
    // 3. Render Schedules
    let horariosListHTML = ''
    if (clase.horarios && clase.horarios.length > 0) {
      horariosListHTML = clase.horarios.map(h => {
        const diaLabel = h.dia.charAt(0).toUpperCase() + h.dia.slice(1)
        const salon = state.salones.find(s => s.id === h.salon_id)
        const salonNombre = salon ? salon.nombre : 'Online/Otro'
        return `
          <div class="d-flex align-items-center gap-2 mb-1">
            <span class="badge bg-secondary-subtle text-secondary-custom py-1" style="font-size: 0.75rem; min-width: 60px;">${diaLabel}</span>
            <span class="small fw-semibold">${formatHora(h.hora_inicio)} - ${formatHora(h.hora_fin)}</span>
            <span class="small text-muted">• <i class="bi bi-geo-alt me-0.5"></i>${escapeHTML(salonNombre)}</span>
          </div>
        `
      }).join('')
    } else {
      horariosListHTML = '<div class="text-muted small">Sin horarios asignados</div>'
    }

    // 4. Render Students
    let alumnosInscritosListHTML = ''
    if (inscritos && inscritos.length > 0) {
      alumnosInscritosListHTML = `
        <div class="list-group list-group-flush border-top">
          ${inscritos.map(ins => {
            const a = ins.alumno
            if (!a) return ''
            const aInitials = getInitials(a.nombre_completo || a.nombre || '?')
            const color = getConsistentColor(a.id)
            return `
              <div class="list-group-item d-flex align-items-center gap-3 py-2 px-3 border-bottom-0 bg-transparent">
                <div class="avatar-compact text-white d-flex align-items-center justify-content-center rounded-circle" style="width: 32px; height: 32px; font-size: 0.85rem; background-color: ${color}; font-weight:600;">
                  ${aInitials}
                </div>
                <div class="d-flex flex-column overflow-hidden">
                  <span class="fw-semibold text-truncate small" style="font-size: 0.9rem; color: var(--bs-body-color);">${escapeHTML(a.nombre_completo || a.nombre)}</span>
                  <small class="text-muted extra-small">${escapeHTML(a.instrumento_principal || 'Sin instrumento')}</small>
                </div>
              </div>
            `
          }).join('')}
        </div>
      `
    } else {
      alumnosInscritosListHTML = `
        <div class="text-muted text-center py-4 small bg-body-tertiary rounded">
          <i class="bi bi-people d-block mb-1 opacity-50" style="font-size: 1.25rem;"></i>
          No hay alumnos inscritos en esta clase
        </div>
      `
    }

    // Calculate occupancy percentage and color
    const capacity = clase.capacidad_maxima || 20
    const occupancyPercentage = Math.min(100, Math.round((alumnosInscritosCount / capacity) * 100))
    let progressColorClass = 'bg-success'
    if (occupancyPercentage >= 90) progressColorClass = 'bg-danger'
    else if (occupancyPercentage >= 70) progressColorClass = 'bg-warning'

    const bodyHTML = `
      <div class="class-profile-container">
        <!-- Profile Header / Hero Card -->
        <div class="class-hero-card d-flex align-items-center gap-3 p-3 rounded mb-4" style="background: linear-gradient(135deg, rgba(13,110,253,0.08) 0%, rgba(88,86,214,0.08) 100%); border: 1px solid rgba(13,110,253,0.15);">
          <div class="position-relative">
            <div class="avatar-large bg-primary bg-opacity-15 text-primary border border-primary-subtle d-flex align-items-center justify-content-center rounded-circle" style="width: 56px; height: 56px; font-size: 1.5rem; font-weight: 700;">
              <i class="bi ${getInstrumentoIcon(clase.instrumento)}"></i>
            </div>
            <span class="position-absolute bottom-0 end-0 p-1.5 bg-${clase.estado === 'activa' ? 'success' : clase.estado === 'suspendida' ? 'warning' : 'secondary'} border border-light rounded-circle" style="transform: translate(10%, 10%);"></span>
          </div>
          <div class="overflow-hidden">
            <h4 class="mb-1 fw-bold text-truncate" style="letter-spacing: -0.02em; font-size: 1.2rem; color: var(--bs-body-color);">${escapeHTML(clase.nombre)}</h4>
            <span class="badge rounded-pill bg-${clase.estado === 'activa' ? 'success' : clase.estado === 'suspendida' ? 'warning' : 'secondary'} text-capitalize" style="font-size: 0.75rem;">${getEstadoLabel(clase.estado)}</span>
          </div>
        </div>

        <!-- Details Grid -->
        <div class="row g-3 mb-4">
          <div class="col-md-6">
            <div class="detail-item-glass p-3 rounded h-100 border">
              <small class="text-muted d-block mb-1"><i class="bi bi-person-badge me-1"></i>Maestro Principal</small>
              <span class="fw-semibold text-body-color-custom" style="font-size: 0.95rem;">${escapeHTML(maestroNombre)}</span>
              ${suplenteNombre ? `<small class="text-muted d-block extra-small mt-1"><i class="bi bi-person me-0.5"></i>Suplente: ${escapeHTML(suplenteNombre)}</small>` : ''}
            </div>
          </div>
          <div class="col-md-6">
            <div class="detail-item-glass p-3 rounded h-100 border">
              <small class="text-muted d-block mb-1"><i class="bi bi-music-note me-1"></i>Instrumento</small>
              <span class="fw-semibold text-body-color-custom" style="font-size: 0.95rem;">${escapeHTML(clase.instrumento || 'Sin asignar')}</span>
            </div>
          </div>
          <div class="col-md-6">
            <div class="detail-item-glass p-3 rounded h-100 border">
              <small class="text-muted d-block mb-1"><i class="bi bi-collection me-1"></i>Programa</small>
              <span class="fw-semibold text-body-color-custom" style="font-size: 0.95rem;">${escapeHTML(programaNombre)}</span>
            </div>
          </div>
          <div class="col-md-6">
            <div class="detail-item-glass p-3 rounded h-100 border">
              <small class="text-muted d-block mb-2"><i class="bi bi-calendar3 me-1"></i>Horarios y Salones</small>
              <div class="horarios-list-container">
                ${horariosListHTML}
              </div>
            </div>
          </div>
        </div>

        <!-- Enrollment Progress Bar -->
        <div class="enrollment-occupancy-card p-3 rounded mb-4 border bg-body-tertiary">
          <div class="d-flex justify-content-between align-items-center mb-2">
            <span class="fw-semibold small text-muted"><i class="bi bi-people me-1"></i>Ocupación e Inscripciones</span>
            <span class="badge bg-secondary bg-opacity-10 text-secondary-custom small fw-semibold" style="font-size: 0.75rem;">${alumnosInscritosCount} / ${capacity} Alumnos</span>
          </div>
          <div class="progress bg-body-secondary" style="height: 10px; border-radius: 6px; overflow: hidden;">
            <div class="progress-bar ${progressColorClass} progress-bar-striped progress-bar-animated" role="progressbar" style="width: ${occupancyPercentage}%" aria-valuenow="${alumnosInscritosCount}" aria-valuemin="0" aria-valuemax="${capacity}"></div>
          </div>
        </div>

        <!-- Description / Pedagogical Notes -->
        <div class="description-card p-3 rounded mb-4 border bg-body-tertiary">
          <small class="text-muted d-block mb-1"><i class="bi bi-file-earmark-text me-1"></i>Notas Pedagógicas</small>
          <p class="mb-0 text-muted small" style="white-space: pre-line; line-height: 1.5;">${escapeHTML(clase.descripcion || 'Sin notas pedagógicas registradas.')}</p>
        </div>

        <!-- Alumnos Inscritos List -->
        <div class="alumnos-inscritos-section mb-4">
          <h6 class="fw-bold mb-3 d-flex align-items-center gap-2" style="font-size: 0.95rem;">
            <i class="bi bi-person-check text-primary"></i> Alumnos Inscritos
            <span class="badge bg-primary bg-opacity-10 text-primary rounded-pill small" style="font-size: 0.75rem;">${alumnosInscritosCount}</span>
          </h6>
          <div class="alumnos-scroll-list border rounded" style="max-height: 180px; overflow-y: auto;">
            ${alumnosInscritosListHTML}
          </div>
        </div>

        <!-- Action Buttons (moved inside profile modal as requested) -->
        <div class="class-profile-actions border-top pt-3 mt-4">
          <button class="btn btn-outline-danger btn-sm d-flex align-items-center gap-1 btn-profile-delete" data-id="${clase.id}">
            <i class="bi bi-trash"></i> Eliminar Clase
          </button>
          <div class="class-profile-secondary-actions">
            <button class="btn btn-outline-secondary btn-sm d-flex align-items-center gap-1 btn-profile-pdf" data-id="${clase.id}">
              <i class="bi bi-file-earmark-pdf"></i> PDF Listado Alumnos x Clase
            </button>
            <button class="btn btn-outline-primary btn-sm d-flex align-items-center gap-1 btn-profile-edit" data-id="${clase.id}">
              <i class="bi bi-pencil"></i> Editar
            </button>
            <button class="btn btn-secondary btn-sm btn-profile-close">
              Cerrar
            </button>
          </div>
        </div>
      </div>
    `

    AppModal.open({
      title: `Perfil de Clase: ${clase.nombre}`,
      hideSave: true,
      size: 'md',
      body: bodyHTML,
      onShow: (modalBody) => {
        // Hide the default AppModal footer completely
        const footer = modalBody.closest('.app-modal-dialog')?.querySelector('.app-modal-footer')
        if (footer) footer.style.setProperty('display', 'none', 'important')

        // Wire PDF button
        modalBody.querySelector('.btn-profile-pdf')?.addEventListener('click', () => {
          try {
            descargarPdfClase(clase, inscritos, {
              maestros: state.maestros,
              salones: state.salones,
              programas: state.programas,
            })
            AppToast.success('PDF de la clase generado')
          } catch (error) {
            console.error(error)
            AppToast.error('No se pudo generar el PDF de la clase')
          }
        })

        // Wire edit button
        modalBody.querySelector('.btn-profile-edit')?.addEventListener('click', () => {
          AppModal.close()
          setTimeout(() => {
            openClaseModal(clase, {
              maestros: state.maestros,
              salones: state.salones,
              programas: state.programas,
              alumnos: state.alumnos,
              onSuccess: () => renderClasesView(state.container)
            })
          }, 250)
        })

        // Wire delete button
        modalBody.querySelector('.btn-profile-delete')?.addEventListener('click', () => {
          AppModal.close()
          setTimeout(() => {
            openDeleteModal(clase.id)
          }, 250)
        })

        // Wire close button
        modalBody.querySelector('.btn-profile-close')?.addEventListener('click', () => {
          AppModal.close()
        })
      }
    })
  } catch (error) {
    console.error(error)
    AppToast.error('Error al cargar la información detallada de la clase')
    AppModal.close()
  }
}

function attachGlobalEvents(container) {
  container.querySelector('#btn-help-clases')?.addEventListener('click', () => {
    HelpPanel.open({
      title: 'Clases',
      intro: 'Gestión completa de clases: creación, horarios, asignación de maestros, inscripción de alumnos y control de capacidad.',
      sections: [
        { icon: 'bi-easel2',           title: 'Lista de clases',          description: 'Todas las clases del sistema. Filtrá por instrumento, nivel y estado. Las activas aparecen primero.',                                                          color: '#3b82f6' },
        { icon: 'bi-clock',            title: 'Horarios',                 description: 'Cada clase puede tener múltiples horarios semanales. El sistema detecta conflictos de salón y de maestro automáticamente.',                                    color: '#6366f1' },
        { icon: 'bi-people',           title: 'Inscripción de alumnos',   description: '"Grupal": todos comparten el horario. "Rotativa (Turnos)": cada alumno tiene su propio horario individual dentro de la clase.',                               color: '#10b981' },
        { icon: 'bi-bar-chart',        title: 'Capacidad',                description: 'Barra de ocupación: inscriptos vs capacidad máxima. Rojo cuando supera el 90%.',                                                                               color: '#f59e0b' },
        { icon: 'bi-person-workspace', title: 'Maestro titular y suplente', description: 'Cada clase tiene un maestro principal (obligatorio) y puede tener suplente (opcional). Ambos aparecen en el perfil del maestro.',                            color: '#6b7280' },
      ],
    })
  })

  container.querySelector('#btnPdfListadoAlumnosClases')?.addEventListener('click', async () => {
    const button = container.querySelector('#btnPdfListadoAlumnosClases')
    const originalHTML = button?.innerHTML
    if (button) {
      button.disabled = true
      button.innerHTML = '<span class="spinner-border spinner-border-sm me-1" aria-hidden="true"></span>Generando PDF...'
    }

    try {
      const clasesParaReporte = state.clases.length ? state.clases : state.clasesOriginales
      const report = await Promise.all(clasesParaReporte.map(async (clase) => ({
        clase,
        inscritos: await obtenerAlumnosInscritos(clase.id),
      })))

      descargarPdfListadoAlumnosPorClases(report, {
        maestros: state.maestros,
        salones: state.salones,
        programas: state.programas,
      })
      AppToast.success('PDF de listados por clase generado')
    } catch (error) {
      console.error(error)
      AppToast.error('No se pudo generar el PDF de listados por clase')
    } finally {
      if (button) {
        button.disabled = false
        button.innerHTML = originalHTML
      }
    }
  })

  container.querySelector('#btnAgregarClase')?.addEventListener('click', () => {
    openClaseModal(null, {
      maestros: state.maestros,
      salones: state.salones,
      programas: state.programas,
      alumnos: state.alumnos,
      onSuccess: () => renderClasesView(container)
    })
  })

  container.querySelector('#btn-vista-tabla')?.addEventListener('click', () => {
    state.vista = 'tabla'
    saveFilterState()
    renderContent(container)
    attachGlobalEvents(container)
  })

  container.querySelector('#btn-vista-calendario')?.addEventListener('click', () => {
    state.vista = 'calendario'
    saveFilterState()
    renderContent(container)
    attachGlobalEvents(container)
  })

  container.querySelector('#buscar')?.addEventListener('input', applyFilters)
  container.querySelector('#filtroEstado')?.addEventListener('change', applyFilters)
  container.querySelector('#filtroInstrumento')?.addEventListener('change', applyFilters)
  container.querySelector('#filtroNivel')?.addEventListener('change', applyFilters)
  container.querySelector('#filtroTipo')?.addEventListener('change', applyFilters)
  container.querySelector('#filtroSalon')?.addEventListener('change', applyFilters)
  container.querySelector('#filtroDia')?.addEventListener('change', applyFilters)

  container.querySelector('#btnLimpiarFiltros')?.addEventListener('click', () => {
    const ids = ['buscar', 'filtroEstado', 'filtroInstrumento', 'filtroNivel', 'filtroTipo', 'filtroSalon', 'filtroDia']
    ids.forEach(id => {
      const el = container.querySelector(`#${id}`)
      if (!el) return
      if (el.tagName === 'SELECT') el.value = el.options[0]?.value || ''
      else el.value = ''
    })
    state.filtroBuscar = ''
    state.filtroEstado = 'todos'
    state.filtroInstrumento = ''
    state.filtroNivel = ''
    state.filtroTipo = ''
    state.filtroSalon = ''
    state.filtroDia = ''
    applyFilters()
  })

  const viewContent = container.querySelector('#view-content')

  viewContent?.addEventListener('change', (e) => {
    if (e.target && e.target.id === 'toggle-empty-days') {
      state.mostrarDiasVacios = e.target.checked
      const grid = container.querySelector('.weekly-schedule-grid')
      if (grid) {
        if (state.mostrarDiasVacios) {
          grid.classList.remove('hide-empty-days')
        } else {
          grid.classList.add('hide-empty-days')
        }
      }
    }
  })

  viewContent?.addEventListener('click', async (e) => {
    const pdfButton = e.target.closest('.btn-class-pdf[data-id]')
    if (pdfButton) {
      e.preventDefault()
      e.stopPropagation()
      const id = pdfButton.dataset.id
      const clase = state.clasesOriginales.find(c => c.id === id)
      if (!clase) return

      pdfButton.disabled = true
      const originalHTML = pdfButton.innerHTML
      pdfButton.innerHTML = '<span class="spinner-border spinner-border-sm me-1" aria-hidden="true"></span>Generando...'

      try {
        const inscritos = await obtenerAlumnosInscritos(clase.id)
        descargarPdfClase(clase, inscritos, {
          maestros: state.maestros,
          salones: state.salones,
          programas: state.programas,
        })
        AppToast.success('PDF de la clase generado')
      } catch (error) {
        console.error(error)
        AppToast.error('No se pudo generar el PDF de la clase')
      } finally {
        pdfButton.disabled = false
        pdfButton.innerHTML = originalHTML
      }
      return
    }

    // Manejo de clicks en tarjetas de la lista o bloques horarios
    const card = e.target.closest('.list-group-item[data-id], .time-block-card[data-id]')
    if (card) {
      const id = card.dataset.id
      const clase = state.clasesOriginales.find(c => c.id === id)
      if (clase) {
        openClasePerfilModal(clase)
      }
    }
  })
}

function saveFilterState() {
  const c = state.container
  if (!c) return
  state.filtroBuscar      = c.querySelector('#buscar')?.value              || ''
  state.filtroEstado      = c.querySelector('#filtroEstado')?.value        || 'todos'
  state.filtroInstrumento = c.querySelector('#filtroInstrumento')?.value   || ''
  state.filtroNivel       = c.querySelector('#filtroNivel')?.value         || ''
  state.filtroTipo        = c.querySelector('#filtroTipo')?.value          || ''
  state.filtroSalon       = c.querySelector('#filtroSalon')?.value         || ''
  state.filtroDia         = c.querySelector('#filtroDia')?.value           || ''
}

function applyFilters() {
  const c = state.container
  const rawSearch    = c.querySelector('#buscar')?.value           || ''
  const filtroEstado = c.querySelector('#filtroEstado')?.value     || 'todos'
  const filtroInstr  = c.querySelector('#filtroInstrumento')?.value || ''
  const filtroNivel  = c.querySelector('#filtroNivel')?.value      || ''
  const filtroTipo   = c.querySelector('#filtroTipo')?.value       || ''
  const filtroSalon  = c.querySelector('#filtroSalon')?.value      || ''
  const filtroDia    = c.querySelector('#filtroDia')?.value        || ''
  const term         = normalizeText(rawSearch)

  state.clases = state.clasesOriginales.filter(clase => {
    // ── Search text ─────────────────────────────────────────────────────────
    if (term) {
      const maestroPrincipal = state.maestros.find(m => m.id === clase.maestro_principal_id)
      const maestroSuplente  = state.maestros.find(m => m.id === clase.maestro_suplente_id)
      const searchable = normalizeText([
        clase.nombre,
        clase.instrumento,
        clase.descripcion,
        clase.nivel,
        clase.tipo,
        clase.salon,
        maestroPrincipal?.nombre_completo || maestroPrincipal?.nombre,
        maestroSuplente?.nombre_completo  || maestroSuplente?.nombre,
      ].filter(Boolean).join(' '))
      if (!searchable.includes(term)) return false
    }

    // ── Estado ───────────────────────────────────────────────────────────────
    if (filtroEstado !== 'todos' && clase.estado !== filtroEstado) return false

    // ── Instrumento ──────────────────────────────────────────────────────────
    if (filtroInstr && clase.instrumento !== filtroInstr) return false

    // ── Nivel ────────────────────────────────────────────────────────────────
    if (filtroNivel && normalizeText(clase.nivel) !== filtroNivel) return false

    // ── Tipo ─────────────────────────────────────────────────────────────────
    if (filtroTipo && normalizeText(clase.tipo) !== filtroTipo) return false

    // ── Salón ────────────────────────────────────────────────────────────────
    if (filtroSalon && clase.salon !== filtroSalon) return false

    // ── Día ──────────────────────────────────────────────────────────────────
    if (filtroDia) {
      const horarios = clase.horarios || []
      const matchDia = horarios.some(h => normalizeText(h.dia) === filtroDia)
      if (!matchDia) return false
    }

    return true
  })

  const viewContent = c.querySelector('#view-content')
  if (viewContent) {
    viewContent.innerHTML = state.vista === 'tabla' ? renderTableView() : renderCalendarView()
  }
}

function openDeleteModal(id) {
  const clase = state.clasesOriginales.find(c => c.id === id)
  if (!clase) return

  AppModal.open({
    title: '⚠️ Eliminar Clase',
    saveText: 'Eliminar Definitivamente',
    body: `<p>¿Estás seguro de eliminar la clase <strong>${escapeHTML(clase.nombre)}</strong>? Esta acción no se puede deshacer.</p>`,
    onSave: async () => {
      try {
        await eliminarClase(id)
        AppToast.success('Clase eliminada')
        renderClasesView(state.container)
        return true
      } catch (err) {
        AppToast.error(err.message)
        return false
      }
    }
  })
}
