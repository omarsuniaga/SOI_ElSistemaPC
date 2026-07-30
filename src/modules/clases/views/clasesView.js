import '../styles/clases.css'
import { normalizeText } from '../../../core/utils/normalizeText.js'
import { AppModal } from '../../../shared/components/AppModal.js'
import { AppToast } from '../../../shared/components/AppToast.js'
import {
  obtenerClases,
  eliminarClase,
  obtenerAlumnosInscritos,
  obtenerAlumnosInscritosPorClases,
  obtenerAlumnosSinClase,
  inscribirAlumno,
} from '../api/clasesApi.js'
import { supabase } from '../../../lib/supabaseClient.js'
import {
  formatDate,
  escapeHTML,
  formatHora,
  getEstadoLabel,
  getInstrumentoIcon,
  getInitials,
  getConsistentColor,
  timeToMinutes,
  normalizarInstrumento,
  rendimientoBadgeHTML,
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
  filtrosAbiertos: typeof window !== 'undefined' ? window.innerWidth >= 992 : true,
}

// Últimos filtros elegidos por el usuario: sobreviven a un refresh del
// navegador (el `state` de arriba es solo memoria y se pierde con F5).
const FILTROS_STORAGE_KEY = 'soi_clases_filtros_v1'
const FILTRO_KEYS = ['filtroBuscar', 'filtroEstado', 'filtroInstrumento', 'filtroNivel', 'filtroTipo', 'filtroSalon', 'filtroDia']

function _guardarFiltrosStorage() {
  try {
    const payload = Object.fromEntries(FILTRO_KEYS.map(k => [k, state[k]]))
    localStorage.setItem(FILTROS_STORAGE_KEY, JSON.stringify(payload))
  } catch { /* localStorage no disponible (modo privado, etc.) — no es crítico */ }
}

function _restaurarFiltrosStorage() {
  try {
    const raw = localStorage.getItem(FILTROS_STORAGE_KEY)
    if (!raw) return
    const guardado = JSON.parse(raw)
    for (const k of FILTRO_KEYS) {
      if (typeof guardado[k] === 'string') state[k] = guardado[k]
    }
  } catch { /* dato corrupto o localStorage no disponible — seguimos con los defaults */ }
}

/**
 * Vista de Clases Académicas (Simplified Refactor)
 */
export async function renderClasesView(container) {
  if (!container) return

  try {
    state.container = container
    _restaurarFiltrosStorage()
    injectClasesResponsiveStyles()
    state.cargando = true
    renderLoading(container)

    const [clases, maestros, salones, programas, alumnos] = await Promise.all([
          obtenerClases(),
          supabase.from('maestros').select('*').order('nombre_completo', { ascending: true }),
          supabase.from('salones').select('*').order('nombre', { ascending: true }),
          supabase.from('programas').select('*').order('nombre', { ascending: true }),
          supabase.rpc('get_alumnos_disponibles_para_inscripcion'),
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
    // Los <select>/<input> ya se pintaron con los valores restaurados de
    // localStorage; hay que aplicar el filtrado real para que la lista de
    // abajo coincida con lo que el usuario ve seleccionado arriba.
    applyFilters()
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

function getClaseIssues(clase) {
  const issues = []
  const horarios = Array.isArray(clase?.horarios) ? clase.horarios : []
  const maestros = Array.isArray(state.maestros) ? state.maestros : []
  const allClases = Array.isArray(state.clasesOriginales) ? state.clasesOriginales : []
  const seen = new Set()
  const pushIssue = (issue) => {
    if (!issue || !issue.key || seen.has(issue.key)) return
    seen.add(issue.key)
    issues.push(issue)
  }

  const maestroPrincipal = maestros.find(m => m.id === clase?.maestro_principal_id)
  const maestroSuplente = maestros.find(m => m.id === clase?.maestro_suplente_id)

  if (!clase?.maestro_principal_id || !maestroPrincipal) {
    pushIssue({ key: 'maestro-principal', label: 'Sin maestro', icon: 'bi-person-exclamation', tone: 'danger' })
  }

  if (clase?.necesita_revision) {
    pushIssue({
      key: 'revision-pendiente',
      label: clase.revision_motivo || 'Marcada para revisión',
      icon: 'bi-flag-fill',
      tone: 'warning',
    })
  }



  if (!horarios.length) {
    pushIssue({ key: 'horario', label: 'Sin horario', icon: 'bi-calendar-x', tone: 'danger' })
  }

  const totalAlumnos = Number(clase?.total_alumnos ?? 0)
  if (totalAlumnos <= 0) {
    pushIssue({ key: 'alumnos', label: 'Sin alumnos', icon: 'bi-people', tone: 'warning' })
  } else {
    pushIssue({ key: 'alumnos', label: `${totalAlumnos} ${totalAlumnos === 1 ? 'alumno' : 'alumnos'}`, icon: 'bi-people-fill', tone: 'success' })
  }

  const overlaps = new Set()
  const conflictingStudentsMap = new Map()
  const claseAlumnos = new Set(clase?.alumnos_ids || [])

  for (const horario of horarios) {
    const currentStart = timeToMinutes(horario?.hora_inicio || '00:00')
    const currentEnd = timeToMinutes(horario?.hora_fin || '00:00')
    if (!horario?.dia || currentStart >= currentEnd) continue

    for (const other of allClases) {
      if (!other || other.id === clase?.id) continue
      for (const otherHorario of (other.horarios || [])) {
        if (!otherHorario?.dia || (otherHorario.dia || '').toLowerCase() !== (horario.dia || '').toLowerCase()) continue
        const otherStart = timeToMinutes(otherHorario.hora_inicio || '00:00')
        const otherEnd = timeToMinutes(otherHorario.hora_fin || '00:00')
        if (currentStart < otherEnd && otherStart < currentEnd) {
          const sameTeacher = clase?.maestro_principal_id && (
            other.maestro_principal_id === clase.maestro_principal_id ||
            other.maestro_suplente_id === clase.maestro_principal_id
          )
          const sameRoom = horario.salon_id && otherHorario.salon_id && horario.salon_id === otherHorario.salon_id

          if (sameTeacher) overlaps.add('maestro')
          if (sameRoom) overlaps.add('salon')

          if (claseAlumnos.size > 0 && (other.alumnos_ids || []).length > 0) {
            for (const studentId of (other.alumnos_ids || [])) {
              if (claseAlumnos.has(studentId)) {
                conflictingStudentsMap.set(studentId, {
                  studentId,
                  otherClaseId: other.id,
                  otherClaseNombre: other.nombre,
                  dia: horario.dia,
                  horaInicio: horario.hora_inicio,
                  horaFin: horario.hora_fin
                })
              }
            }
          }
        }
      }
    }
  }

  if (overlaps.has('maestro')) {
    pushIssue({ key: 'solape-maestro', label: 'Solape maestro (misma hora)', icon: 'bi-person-workspace', tone: 'danger' })
  }
  if (overlaps.has('salon')) {
    pushIssue({ key: 'solape-salon', label: 'Solape salón (misma hora)', icon: 'bi-building-exclamation', tone: 'danger' })
  }
  if (conflictingStudentsMap.size > 0) {
    const count = conflictingStudentsMap.size
    pushIssue({
      key: 'solape-alumnos',
      label: `${count} ${count === 1 ? 'alumno' : 'alumnos'} en 2 clases a la misma hora`,
      icon: 'bi-people-fill',
      tone: 'warning',
      conflictsMap: conflictingStudentsMap,
      conflictsList: Array.from(conflictingStudentsMap.values())
    })
  }

  return issues
}

function renderIssuesBadge(issues = []) {
  const warnings = issues.filter(i => i.tone === 'danger' || i.tone === 'warning')
  if (!warnings.length) return ''
  const hasDanger = issues.some(i => i.tone === 'danger')
  const toneClass = hasDanger ? 'text-bg-danger' : 'text-bg-warning'
  const iconClass = hasDanger ? 'bi-exclamation-circle-fill' : 'bi-exclamation-triangle-fill'
  const countLabel = issues.length === 1 ? '1 advertencia' : `${issues.length} advertencias`
  return `
    <span class="badge rounded-pill ${toneClass} clase-issue-badge" title="${escapeHTML(warnings.map(i => i.label).join(' · '))}" aria-label="${escapeHTML(countLabel)}">
      <i class="bi ${iconClass} me-1"></i>${warnings.length}
    </span>
  `
}

function renderIssueChips(issues = []) {
  if (!issues.length) return ''
  return `
    <div class="mt-2 d-flex flex-wrap gap-1">
      ${issues.map(issue => `
        <span class="badge rounded-pill ${issue.tone === 'danger' ? 'text-bg-danger' : issue.tone === 'success' ? 'text-bg-success-subtle text-success-emphasis border border-success-subtle' : 'text-bg-warning-subtle text-warning-emphasis border border-warning-subtle'} classes-warning-chip">
          <i class="bi ${issue.icon} me-1"></i>${escapeHTML(issue.label)}
        </span>
      `).join('')}
    </div>
  `
}

function renderContent(container) {
  if (typeof state.filtrosAbiertos !== 'boolean') {
    state.filtrosAbiertos = window.innerWidth >= 992
  }

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
          <button class="btn-help-trigger clases-ui-btn clases-ui-btn--icon" id="btn-help-clases" title="¿Cómo funciona esta pantalla?" aria-label="Ayuda">
            <i class="bi bi-question-lg"></i>
          </button>
          <div class="view-segmented-control">
            <button class="view-segment-btn clases-ui-btn clases-ui-btn--icon ${state.vista === 'tabla' ? 'active' : ''}" id="btn-vista-tabla" title="Vista de lista" aria-label="Vista de lista">
              <i class="bi bi-list-ul"></i>
            </button>
            <button class="view-segment-btn clases-ui-btn clases-ui-btn--icon ${state.vista === 'calendario' ? 'active' : ''}" id="btn-vista-calendario" title="Vista de agenda" aria-label="Vista de agenda">
              <i class="bi bi-calendar-week"></i>
            </button>
          </div>
          <button class="btn btn-outline-secondary btn-clases-pdf clases-ui-btn clases-ui-btn--icon" id="btnPdfListadoAlumnosClases" type="button" aria-label="Descargar PDF Listados Alumnos x Clase" title="Descargar PDF Listados Alumnos x Clase">
            <i class="bi bi-file-earmark-pdf" aria-hidden="true"></i>
          </button>
          <button class="btn btn-outline-warning clases-ui-btn clases-ui-btn--icon" id="btnAlumnosSinClase" type="button" aria-label="Ver alumnos sin clase asignada" title="Ver alumnos sin clase asignada">
            <i class="bi bi-person-exclamation" aria-hidden="true"></i>
          </button>
          <button class="btn btn-premium-action btn-icon-only clases-ui-btn clases-ui-btn--icon" id="btnAgregarClase" title="Nueva clase" aria-label="Nueva clase">
            <i class="bi bi-plus-lg" aria-hidden="true"></i>
          </button>
        </div>
      </div>

      <div class="clases-filters-panel mb-4">
        <div class="clases-filters-panel__header">
          <div class="d-flex align-items-center gap-2">
            <div class="clases-filters-panel__icon">
              <i class="bi bi-funnel"></i>
            </div>
            <div>
              <div class="d-flex align-items-center gap-2">
                <div class="clases-filters-panel__title">Filtros</div>
                <span class="badge text-bg-primary rounded-pill d-none" id="filtrosBadgeCount" style="font-size: 0.7rem;">0</span>
              </div>
              <div class="clases-filters-panel__subtitle text-muted small" id="filtrosActivosCount">Busca y segmenta las clases visibles</div>
            </div>
          </div>
          <button class="btn btn-outline-secondary btn-sm clases-ui-btn clases-ui-btn--icon" id="btnToggleFiltros" type="button" aria-expanded="${state.filtrosAbiertos ? 'true' : 'false'}" title="${state.filtrosAbiertos ? 'Ocultar filtros' : 'Mostrar filtros'}" aria-label="${state.filtrosAbiertos ? 'Ocultar filtros' : 'Mostrar filtros'}">
            <i class="bi ${state.filtrosAbiertos ? 'bi-chevron-up' : 'bi-chevron-down'}"></i>
          </button>
        </div>
        <div class="clases-filters-panel__body ${state.filtrosAbiertos ? 'is-open' : 'is-collapsed'}" id="clasesFiltersPanelBody">
          <div class="d-flex flex-column gap-2">
            <!-- Barra Superior: Búsqueda + Estado + Limpiar -->
            <div class="d-flex align-items-center gap-2 flex-wrap">
              <div class="premium-search-container flex-grow-1" style="min-width:200px;">
                <i class="bi bi-search search-icon-muted"></i>
                <input type="text" class="form-control premium-search-input" placeholder="Buscar por nombre, maestro, instrumento..." id="buscar" value="${escapeHTML(state.filtroBuscar)}">
              </div>

              <div class="premium-select-container" style="min-width: 170px;">
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

              <button class="btn btn-outline-secondary btn-sm clases-ui-btn clases-ui-btn--icon" id="btnLimpiarFiltros" type="button" title="Limpiar todos los filtros">
                <i class="bi bi-x-lg"></i>
              </button>
            </div>

            <!-- Grilla Comprimida de Filtros Secundarios -->
            <div class="clases-filter-grid mt-1">
              <div class="premium-select-container">
                <i class="bi bi-music-note select-icon-muted"></i>
                <select class="form-select premium-filter-select" id="filtroInstrumento">
                  <option value="">Instrumento (Todos)</option>
                  ${getInstrumentoOptions()}
                </select>
              </div>

              <div class="premium-select-container">
                <i class="bi bi-bar-chart-steps select-icon-muted"></i>
                <select class="form-select premium-filter-select" id="filtroNivel">
                  <option value=""           ${state.filtroNivel === ''           ? 'selected' : ''}>Nivel (Todos)</option>
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
                  <option value=""            ${state.filtroTipo === ''            ? 'selected' : ''}>Tipo (Todos)</option>
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
                  <option value="">Salón (Todos)</option>
                  ${getSalonOptions()}
                </select>
              </div>

              <div class="premium-select-container">
                <i class="bi bi-calendar-week select-icon-muted"></i>
                <select class="form-select premium-filter-select" id="filtroDia">
                  <option value=""         ${state.filtroDia === ''         ? 'selected' : ''}>Día (Todos)</option>
                  <option value="lunes"    ${state.filtroDia === 'lunes'    ? 'selected' : ''}>Lunes</option>
                  <option value="martes"   ${state.filtroDia === 'martes'   ? 'selected' : ''}>Martes</option>
                  <option value="miercoles" ${state.filtroDia === 'miercoles' ? 'selected' : ''}>Miércoles</option>
                  <option value="jueves"   ${state.filtroDia === 'jueves'   ? 'selected' : ''}>Jueves</option>
                  <option value="viernes"  ${state.filtroDia === 'viernes'  ? 'selected' : ''}>Viernes</option>
                  <option value="sabado"   ${state.filtroDia === 'sabado'   ? 'selected' : ''}>Sábado</option>
                </select>
              </div>
            </div>
          </div>
        </div>
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
  const estado = clase.estado || 'activa'
  const accentClass = `border-accent-${estado === 'activa' ? 'success' : estado === 'suspendida' ? 'warning' : 'secondary'}`

  // Construcción limpia de la línea de maestro y suplente
  const docenteTexto = maestroSuplenteNombre
    ? `${escapeHTML(maestroNombre)} <span class="text-secondary">(Suplente: ${escapeHTML(maestroSuplenteNombre)})</span>`
    : escapeHTML(maestroNombre)

  // Construcción detallada de vista previa de horarios con nombre de salón
  const horarios = (clase.horarios || []).slice(0, 3)
  const horariosTexto = horarios.length > 0
    ? horarios.map(h => {
        const diaStr = (h.dia || '').slice(0, 2).toUpperCase()
        const horaStr = (h.hora_inicio || '').slice(0, 5)
        const salonObj = state.salones ? state.salones.find(s => s.id === h.salon_id) : null
        const salonStr = salonObj?.nombre ? ` (${escapeHTML(salonObj.nombre)})` : ''
        return `${diaStr} ${horaStr}${salonStr}`
      }).join(' • ')
    : 'Sin horarios'

  const warnings = getClaseIssues(clase, state.clasesOriginales || state.clases)
  if (clase.capacidad_maxima && clase.total_alumnos != null && clase.total_alumnos / clase.capacidad_maxima >= 0.85) {
    warnings.push({ key: 'cupo-alto', label: 'Cupo alto', icon: 'bi-people-fill', tone: 'warning' })
  }

  return `
    <div class="list-group-item list-group-item-action d-flex align-items-center justify-content-between p-3 w-100 border-start-accent clase-card-item ${accentClass}" data-id="${clase.id}" style="cursor: pointer;">
      <div class="d-flex align-items-center gap-3 flex-grow-1 overflow-hidden clase-card-main">
        <div class="d-flex flex-column flex-grow-1 overflow-hidden pe-3 clase-card-copy">
          <div class="d-flex align-items-center gap-2">
            <span class="fw-bold text-truncate" style="font-size: 1.05rem;">${escapeHTML(nombre)}</span>
            ${renderIssuesBadge(warnings)}
          </div>
          <small class="text-muted text-truncate"><i class="bi bi-person-badge me-1"></i>${docenteTexto} • ${escapeHTML(clase.instrumento || '-')}</small>
          <small class="text-muted extra-small mt-1 clase-card-horarios" style="font-size: 0.85rem;"><i class="bi bi-clock me-1"></i>${horariosTexto}</small>
          ${renderIssueChips(warnings)}
        </div>
      </div>
      <div class="flex-shrink-0 d-flex align-items-center gap-2 ms-2 pe-1 clase-card-actions">
        <button class="btn btn-outline-secondary btn-sm btn-class-pdf clases-ui-btn" data-id="${clase.id}" type="button" title="PDF Listado Alumnos x Clase" aria-label="Descargar PDF de listados de alumnos por clase">
          <i class="bi bi-file-earmark-pdf" aria-hidden="true"></i>
          <span class="btn-class-pdf__label">PDF Listado Alumnos x Clase</span>
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
                  const issues = getClaseIssues(c)
                  
                  return `
                    <div class="time-block-card p-2 rounded mb-2 border-start-accent ${borderClass}" data-id="${c.id}" style="cursor: pointer;">
                      <div class="d-flex align-items-center justify-content-between mb-1">
                        <span class="time-range small fw-bold text-primary"><i class="bi bi-clock me-1"></i>${start} - ${end}</span>
                        <div class="d-flex align-items-center gap-1">
                          ${issues.length > 0 ? `<span class="badge rounded-pill ${issues.some(i => i.tone === 'danger') ? 'text-bg-danger' : 'text-bg-warning'} clase-issue-badge--compact" title="${escapeHTML(issues.map(i => i.label).join(' · '))}"><i class="bi bi-exclamation-triangle-fill"></i></span>` : ''}
                          <i class="bi ${getInstrumentoIcon(c.instrumento)} text-muted" style="font-size: 0.85rem;"></i>
                        </div>
                      </div>
                      <div class="d-flex align-items-center gap-2">
                        <div class="fw-semibold text-truncate small class-name" style="font-size: 0.9rem;">${escapeHTML(c.nombre)}</div>
                        ${renderIssuesBadge(issues)}
                      </div>
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

function _telefonoAlumno(alumno = {}) {
  return alumno.tlf_alumno || alumno.representante_tlf || alumno.familiar_telefono || null
}

/**
 * Modal con los alumnos activos que no están inscritos en ninguna clase,
 * agrupados por instrumento. Este módulo asume que asignar a todos los
 * alumnos a una clase es el flujo normal — esto muestra a quién se le
 * quedó pendiente, sin tener que revisar clase por clase. Cada alumno es
 * clickeable: abre las clases de su mismo instrumento para asignarlo ahí
 * mismo, sin salir del modal.
 */
// Instrumento del último grupo que el usuario tuvo abierto en el modal de
// "Alumnos sin clase" — para que reabrir el modal (p. ej. después de
// asignar a un alumno) no vuelva siempre al primero de la lista.
let _grupoSinClaseAbierto = null

function _abrirModalAlumnosSinClase(grupos = []) {
  const totalAlumnos = grupos.reduce((acc, g) => acc + g.total, 0)
  const idxAbierto = Math.max(0, grupos.findIndex(g => g.instrumento === _grupoSinClaseAbierto))

  const bodyHtml = totalAlumnos === 0
    ? `
      <div class="text-center text-muted py-4">
        <i class="bi bi-check-circle-fill d-block mb-2" style="font-size: 2rem; color: var(--bs-success);"></i>
        Todos los alumnos activos están inscritos en al menos una clase.
      </div>
    `
    : `
      <div class="alert alert-warning d-flex align-items-center gap-2 mb-3">
        <i class="bi bi-person-exclamation fs-4 flex-shrink-0"></i>
        <div>
          <strong class="d-block">${totalAlumnos} ${totalAlumnos === 1 ? 'alumno' : 'alumnos'} sin clase asignada</strong>
          <span class="small text-muted">Agrupados por instrumento principal. Tocá un alumno para asignarlo a una clase.</span>
        </div>
      </div>
      <div class="accordion" id="acc-alumnos-sin-clase">
        ${grupos.map((g, idx) => `
          <div class="accordion-item">
            <h2 class="accordion-header">
              <button class="accordion-button ${idx === idxAbierto ? '' : 'collapsed'}" type="button" data-bs-toggle="collapse" data-bs-target="#grupo-sin-clase-${idx}" data-instrumento="${escapeHTML(g.instrumento)}">
                <span class="fw-semibold">${escapeHTML(g.instrumento)}</span>
                <span class="badge text-bg-warning ms-2">${g.total}</span>
              </button>
            </h2>
            <div id="grupo-sin-clase-${idx}" class="accordion-collapse collapse ${idx === idxAbierto ? 'show' : ''}" data-bs-parent="#acc-alumnos-sin-clase">
              <div class="accordion-body p-0">
                <div class="list-group list-group-flush">
                  ${g.alumnos.map(a => `
                    <button type="button" class="list-group-item list-group-item-action d-flex justify-content-between align-items-center gap-2 btn-asignar-alumno" data-alumno-id="${a.id}">
                      <div class="text-start">
                        <div class="fw-semibold">${escapeHTML(a.nombre_completo)}</div>
                        <small class="text-muted">${a.fecha_ingreso ? `Ingresó ${escapeHTML(formatDate(a.fecha_ingreso))}` : 'Sin fecha de ingreso'}</small>
                      </div>
                      <span class="small text-muted text-nowrap d-flex align-items-center gap-2">
                        <i class="bi bi-telephone"></i>${escapeHTML(_telefonoAlumno(a) || 'Sin teléfono')}
                        <i class="bi bi-chevron-right"></i>
                      </span>
                    </button>
                  `).join('')}
                </div>
              </div>
            </div>
          </div>
        `).join('')}
      </div>
    `

  AppModal.open({
    title: '🎻 Alumnos sin clase asignada',
    size: 'md',
    hideSave: true,
    cancelText: 'Cerrar',
    body: bodyHtml,
    onShow: (body) => {
      if (totalAlumnos === 0) return
      body.querySelectorAll('.accordion-button').forEach((btn) => {
        btn.addEventListener('click', () => {
          _grupoSinClaseAbierto = btn.dataset.instrumento
        })
      })
      body.querySelectorAll('.btn-asignar-alumno').forEach((btn) => {
        btn.addEventListener('click', () => {
          const alumnoId = btn.dataset.alumnoId
          const grupo = grupos.find(g => g.alumnos.some(a => a.id === alumnoId))
          const alumno = grupo?.alumnos.find(a => a.id === alumnoId)
          if (grupo) _grupoSinClaseAbierto = grupo.instrumento
          if (alumno) _abrirModalAsignarClaseAAlumno(alumno, grupos)
        })
      })
    },
  })
}

/**
 * Muestra las clases activas cuyo instrumento coincide con el del alumno
 * (comparando con normalizarInstrumento, porque en los datos reales
 * "Violín" y "Violines" — o "Viola"/"Violas" — conviven como valores
 * distintos) y permite inscribirlo ahí mismo.
 */
// Nivel numérico aproximado a partir del NOMBRE de la clase — no hay un
// nivel_id estructurado en `clases` hoy (está vacío en las 11 clases
// activas), así que esto es una lectura del convenio de nombres ("0A-",
// "1B", "N3", "Iniciación..."), no un dato confiable al 100%. Por eso solo
// se usa para ORDENAR y para separar visualmente, nunca para ocultar de
// forma permanente una clase.
function _inferirNivelNumClase(nombre = '') {
  const n = nombre.toLowerCase()
  if (/ensayo|orquesta sinf/.test(n)) return null // ensambles: aceptan variedad de niveles
  const lead = n.match(/^\s*(\d+)/)
  if (lead) return parseInt(lead[1], 10)
  const conN = n.match(/\bn\s*(\d+)/)
  if (conN) return parseInt(conN[1], 10)
  const trail = n.match(/(\d+)\s*$/)
  if (trail) return parseInt(trail[1], 10)
  if (/iniciaci[oó]n/.test(n)) return 0
  return null
}

const RANGO_NIVEL_ALUMNO = {
  basico: [0, 1],
  'básico': [0, 1],
  intermedio: [1, 2],
  avanzado: [2, 99],
}

function _distanciaNivel(nivelAlumno, nivelClaseNum) {
  if (nivelClaseNum === null || !nivelAlumno) return null // sin dato suficiente: neutral
  const rango = RANGO_NIVEL_ALUMNO[String(nivelAlumno).toLowerCase()]
  if (!rango) return null
  const [min, max] = rango
  if (nivelClaseNum < min) return min - nivelClaseNum
  if (nivelClaseNum > max) return nivelClaseNum - max
  return 0
}

function _abrirModalAsignarClaseAAlumno(alumno, grupos) {
  const claseUniverso = state.clasesOriginales?.length ? state.clasesOriginales : state.clases
  const clavAlumno = normalizarInstrumento(alumno.instrumento_principal)

  const candidatas = clavAlumno
    ? claseUniverso
        .filter(c => c.activo !== false && normalizarInstrumento(c.instrumento) === clavAlumno)
        .map(c => {
          const nivelClaseNum = _inferirNivelNumClase(c.nombre)
          return { ...c, _nivelClaseNum: nivelClaseNum, _distanciaNivel: _distanciaNivel(alumno.nivel, nivelClaseNum) }
        })
        .sort((a, b) => {
          const da = a._distanciaNivel ?? 0.5 // "sin dato" queda entre las buenas y las descartadas
          const db = b._distanciaNivel ?? 0.5
          return da - db
        })
    : []

  const buenEncaje = candidatas.filter(c => (c._distanciaNivel ?? 0) <= 1)
  const otroNivel = candidatas.filter(c => (c._distanciaNivel ?? 0) > 1)

  const renderClase = (c) => {
    const ocupacion = c.capacidad_maxima ? Math.round((c.total_alumnos / c.capacidad_maxima) * 100) : 0
    const cupoAlto = c.capacidad_maxima && ocupacion >= 90
    return `
      <div class="list-group-item d-flex justify-content-between align-items-center gap-2">
        <div>
          <div class="fw-semibold">${escapeHTML(c.nombre)}</div>
          <small class="text-muted">${c.total_alumnos ?? 0}${c.capacidad_maxima ? ` / ${c.capacidad_maxima}` : ''} alumnos${cupoAlto ? ' · <span class="text-warning">cupo alto</span>' : ''}</small>
        </div>
        <button type="button" class="btn btn-sm btn-primary btn-confirmar-asignar" data-clase-id="${c.id}" data-clase-nombre="${escapeHTML(c.nombre)}">
          Asignar
        </button>
      </div>
    `
  }

  const nivelLabel = alumno.nivel ? alumno.nivel.charAt(0).toUpperCase() + alumno.nivel.slice(1) : null

  const bodyHtml = `
    <button type="button" class="btn btn-link btn-sm text-decoration-none ps-0 mb-2 btn-volver-sin-clase">
      <i class="bi bi-arrow-left me-1"></i>Volver al listado
    </button>
    <div class="d-flex align-items-center gap-2 mb-3">
      <div class="avatar-compact text-white d-flex align-items-center justify-content-center rounded-circle flex-shrink-0" style="width: 36px; height: 36px; font-size: 0.85rem; background-color: ${getConsistentColor(alumno.nombre_completo)}; font-weight:600;">
        ${getInitials(alumno.nombre_completo)}
      </div>
      <div>
        <div class="fw-bold">${escapeHTML(alumno.nombre_completo)}</div>
        <small class="text-muted">
          ${escapeHTML(alumno.instrumento_principal || 'Sin instrumento definido')}
          ${nivelLabel ? ` · ${escapeHTML(nivelLabel)}` : ''}
          ${alumno.promedio_notas != null ? ` · Promedio ${escapeHTML(String(alumno.promedio_notas))}` : ''}
        </small>
      </div>
    </div>

    ${!clavAlumno ? `
      <div class="alert alert-secondary small mb-0">
        Este alumno no tiene instrumento principal definido — no se puede sugerir una clase automáticamente. Editalo desde el módulo de Alumnos primero.
      </div>
    ` : candidatas.length === 0 ? `
      <div class="alert alert-secondary small mb-0">
        No hay clases activas de "${escapeHTML(alumno.instrumento_principal)}" todavía.
      </div>
    ` : `
      ${buenEncaje.length > 0 ? `<div class="list-group mb-2">${buenEncaje.map(renderClase).join('')}</div>` : ''}
      ${otroNivel.length > 0 ? `
        <details class="small">
          <summary class="text-muted mb-2" style="cursor:pointer;">
            ${otroNivel.length} ${otroNivel.length === 1 ? 'clase más' : 'clases más'} de otro nivel
          </summary>
          <div class="list-group mt-2">${otroNivel.map(renderClase).join('')}</div>
        </details>
      ` : ''}
      ${buenEncaje.length === 0 && otroNivel.length === 0 ? `
        <div class="alert alert-secondary small mb-0">No hay clases activas de este instrumento todavía.</div>
      ` : ''}
    `}
  `

  AppModal.open({
    title: 'Asignar clase',
    size: 'md',
    hideSave: true,
    cancelText: 'Cerrar',
    body: bodyHtml,
    onShow: (body) => {
      body.querySelector('.btn-volver-sin-clase')?.addEventListener('click', () => {
        _abrirModalAlumnosSinClase(grupos)
      })
      body.querySelectorAll('.btn-confirmar-asignar').forEach((btn) => {
        btn.addEventListener('click', async () => {
          const claseId = btn.dataset.claseId
          const claseNombre = btn.dataset.claseNombre
          btn.disabled = true
          btn.innerHTML = '<span class="spinner-border spinner-border-sm"></span>'
          try {
            await inscribirAlumno(claseId, alumno.id)
            AppToast.success(`${alumno.nombre_completo} asignado a "${claseNombre}"`)

            // Sacar al alumno de los grupos en memoria para que el listado
            // que vuelve a mostrarse ya refleje la asignación.
            for (const g of grupos) {
              g.alumnos = g.alumnos.filter(a => a.id !== alumno.id)
              g.total = g.alumnos.length
            }
            _abrirModalAlumnosSinClase(grupos.filter(g => g.total > 0))
          } catch (error) {
            console.error(error)
            AppToast.error(error.message || 'No se pudo asignar al alumno')
            btn.disabled = false
            btn.innerHTML = 'Asignar'
          }
        })
      })
    },
  })
}

async function openClasePerfilModal(clase) {
  if (!clase) return

  AppModal.open({
    title: 'Cargando...',
    hideSave: true,
    size: 'xl',
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

    // 4. Render Students con badges de conflicto si aplica
    const modalIssues = getClaseIssues(clase, state.clasesOriginales || state.clases)
    const solapeAlumnosIssue = modalIssues.find(i => i.key === 'solape-alumnos')
    const conflictsMap = solapeAlumnosIssue?.conflictsMap || new Map()

    let alumnosInscritosListHTML = ''
    if (inscritos && inscritos.length > 0) {
      alumnosInscritosListHTML = `
        <div class="list-group list-group-flush border-top">
          ${inscritos.map(ins => {
            const a = ins.alumno
            if (!a) return ''
            const aInitials = getInitials(a.nombre_completo || a.nombre || '?')
            const color = getConsistentColor(a.id)
            const conf = conflictsMap.get(a.id)
            const confBadge = conf
              ? `<span class="badge text-bg-warning-subtle text-warning-emphasis border border-warning-subtle extra-small ms-auto flex-shrink-0" title="Choca a la misma hora con '${escapeHTML(conf.otherClaseNombre)}'"><i class="bi bi-exclamation-triangle-fill me-1"></i>Choca con "${escapeHTML(conf.otherClaseNombre)}"</span>`
              : ''
            return `
              <div class="list-group-item d-flex align-items-center gap-3 py-2 px-3 border-bottom-0 bg-transparent flex-wrap">
                <div class="avatar-compact text-white d-flex align-items-center justify-content-center rounded-circle flex-shrink-0" style="width: 32px; height: 32px; font-size: 0.85rem; background-color: ${color}; font-weight:600;">
                  ${aInitials}
                </div>
                <div class="d-flex flex-column overflow-hidden flex-grow-1">
                  <span class="fw-semibold text-truncate small" style="font-size: 0.9rem; color: var(--bs-body-color);">${escapeHTML(a.nombre_completo || a.nombre)}</span>
                  <small class="text-muted extra-small">${escapeHTML(a.instrumento_principal || 'Sin instrumento')} ${rendimientoBadgeHTML(a)}</small>
                </div>
                ${confBadge}
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
    const warningItems = []
    if (occupancyPercentage >= 90) warningItems.push({ icon: 'bi-exclamation-triangle-fill', text: 'Capacidad crítica: revisa cupos y reubicación' })
    else if (occupancyPercentage >= 70) warningItems.push({ icon: 'bi-exclamation-circle-fill', text: 'Capacidad alta: conviene revisar cupos pronto' })
    if (!suplenteNombre) warningItems.push({ icon: 'bi-person-dash-fill', text: 'No tiene maestro suplente asignado' })
    if (!clase.horarios || clase.horarios.length === 0) warningItems.push({ icon: 'bi-calendar-x-fill', text: 'No tiene horarios definidos' })
    if ((clase.horarios || []).length > 1) warningItems.push({ icon: 'bi-clock-history', text: 'La clase tiene múltiples horarios registrados' })
    if (solapeAlumnosIssue && solapeAlumnosIssue.conflictsList) {
      const detailsList = solapeAlumnosIssue.conflictsList.map(c => {
        const al = (inscritos || []).find(i => i.alumno_id === c.studentId)?.alumno || (state.alumnos || []).find(a => a.id === c.studentId)
        const alNombre = al ? (al.nombre_completo || al.nombre) : 'Alumno'
        return `<strong>${escapeHTML(alNombre)}</strong> (choca con "${escapeHTML(c.otherClaseNombre)}")`
      }).join(', ')
      warningItems.push({
        icon: 'bi-people-fill',
        html: `Alumnos coincidentes en 2 clases a la misma hora: ${detailsList}`
      })
    }
    if (occupancyPercentage >= 90) modalIssues.push({ key: 'ocupacion-critica', label: 'Capacidad crítica', icon: 'bi-exclamation-triangle-fill', tone: 'danger' })
    else if (occupancyPercentage >= 70) modalIssues.push({ key: 'ocupacion-alta', label: 'Capacidad alta', icon: 'bi-exclamation-circle-fill', tone: 'warning' })

    const headerActionsHTML = `
      <div class="d-flex align-items-center gap-1">
        <button class="btn btn-sm btn-profile-pdf text-white border-0 d-inline-flex align-items-center justify-content-center" style="background: rgba(255,255,255,0.18); width: 30px; height: 30px; border-radius: 8px;" data-id="${clase.id}" type="button" title="PDF listado alumnos" aria-label="PDF listado alumnos">
          <i class="bi bi-file-earmark-pdf" style="font-size: 0.95rem;"></i>
        </button>
        <button class="btn btn-sm btn-profile-edit text-white border-0 d-inline-flex align-items-center justify-content-center" style="background: rgba(255,255,255,0.18); width: 30px; height: 30px; border-radius: 8px;" data-id="${clase.id}" type="button" title="Editar clase" aria-label="Editar clase">
          <i class="bi bi-pencil" style="font-size: 0.95rem;"></i>
        </button>
        <button class="btn btn-sm btn-profile-delete text-white border-0 d-inline-flex align-items-center justify-content-center" style="background: rgba(220, 53, 69, 0.45); width: 30px; height: 30px; border-radius: 8px;" data-id="${clase.id}" type="button" title="Eliminar clase" aria-label="Eliminar clase">
          <i class="bi bi-trash" style="font-size: 0.95rem;"></i>
        </button>
      </div>
    `

    const bodyHTML = `
      <div class="class-profile-container">
        <!-- Profile Header / Hero Card -->
        <div class="class-hero-card d-flex align-items-start gap-3 p-3 rounded mb-4 flex-wrap" style="background: linear-gradient(135deg, rgba(13,110,253,0.08) 0%, rgba(88,86,214,0.08) 100%); border: 1px solid rgba(13,110,253,0.15);">
          <div class="overflow-hidden flex-grow-1">
            <div class="d-flex align-items-center gap-2 flex-wrap mb-1">
              <h4 class="mb-0 fw-bold text-truncate" style="letter-spacing: -0.02em; font-size: 1.2rem; color: var(--bs-body-color);">${escapeHTML(clase.nombre)}</h4>
              ${renderIssuesBadge(modalIssues)}
            </div>
            <span class="badge rounded-pill bg-${clase.estado === 'activa' ? 'success' : clase.estado === 'suspendida' ? 'warning' : 'secondary'} text-capitalize" style="font-size: 0.75rem;">${getEstadoLabel(clase.estado)}</span>
            ${renderIssueChips(modalIssues)}
          </div>
        </div>

        ${warningItems.length > 0 ? `
          <div class="class-warning-banner p-3 rounded mb-4 border border-warning-subtle bg-warning-subtle">
            <div class="d-flex align-items-center gap-2 mb-2">
              <i class="bi bi-exclamation-triangle-fill text-warning"></i>
              <strong class="small text-warning-emphasis">Advertencias de la clase</strong>
            </div>
            <div class="d-flex flex-column gap-2">
              ${warningItems.map(item => `
                <div class="class-warning-item d-flex align-items-start gap-2 small">
                  <i class="bi ${item.icon} text-warning mt-1"></i>
                  <span>${item.html ? item.html : escapeHTML(item.text)}</span>
                </div>
              `).join('')}
            </div>
          </div>
        ` : ''}

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

        <!-- Alumnos Inscritos List con Buscador Integrado -->
        <div class="alumnos-inscritos-section mb-4">
          <div class="d-flex align-items-center justify-content-between mb-2 flex-wrap gap-2">
            <h6 class="fw-bold mb-0 d-flex align-items-center gap-2" style="font-size: 0.95rem;">
              <i class="bi bi-person-check text-primary"></i> Alumnos Inscritos
              <span class="badge text-bg-primary rounded-pill small" id="profile-alumnos-count" style="font-size: 0.75rem;">${alumnosInscritosCount}</span>
            </h6>
            ${inscritos && inscritos.length > 0 ? `
              <div class="position-relative" style="min-width: 200px;">
                <input type="text" class="form-control form-control-sm pe-4" id="search-profile-alumnos" placeholder="Buscar alumno..." style="font-size: 0.82rem; height: 32px;">
                <i class="bi bi-search position-absolute top-50 end-0 translate-middle-y me-2 text-muted" style="font-size: 0.75rem; pointer-events: none;"></i>
              </div>
            ` : ''}
          </div>
          <div class="alumnos-scroll-list border rounded" style="max-height: 200px; overflow-y: auto;" id="profile-alumnos-container">
            ${alumnosInscritosListHTML}
          </div>
        </div>
      </div>
    `

    AppModal.open({
      title: `Perfil de Clase: ${clase.nombre}`,
      headerActions: headerActionsHTML,
      autoFocus: false,
      hideSave: true,
      size: 'lg',
      body: bodyHTML,
      onShow: (modalBody) => {
        const dialog = modalBody.closest('.app-modal-dialog')

        // Hide the default AppModal footer completely
        const footer = dialog?.querySelector('.app-modal-footer')
        if (footer) footer.style.setProperty('display', 'none', 'important')

        // Wire PDF button
        dialog?.querySelector('.btn-profile-pdf')?.addEventListener('click', () => {
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
        dialog?.querySelector('.btn-profile-edit')?.addEventListener('click', () => {
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
        dialog?.querySelector('.btn-profile-delete')?.addEventListener('click', () => {
          AppModal.close()
          setTimeout(() => {
            openDeleteModal(clase.id)
          }, 250)
        })

        // Wire live student search input
        const searchInput = modalBody.querySelector('#search-profile-alumnos')
        const container = modalBody.querySelector('#profile-alumnos-container')
        const countBadge = modalBody.querySelector('#profile-alumnos-count')

        if (searchInput && container) {
          searchInput.addEventListener('input', (e) => {
            const term = normalizeText(e.target.value)
            const items = container.querySelectorAll('.list-group-item')
            let visibleCount = 0

            items.forEach(item => {
              const text = normalizeText(item.textContent || '')
              const matches = !term || text.includes(term)
              item.style.display = matches ? 'flex' : 'none'
              if (matches) visibleCount++
            })

            let noResultMsg = container.querySelector('.no-search-results')
            if (visibleCount === 0) {
              if (!noResultMsg) {
                noResultMsg = document.createElement('div')
                noResultMsg.className = 'no-search-results text-muted text-center py-4 small'
                noResultMsg.innerHTML = '<i class="bi bi-search d-block mb-1 opacity-50" style="font-size: 1.25rem;"></i>No se encontraron alumnos'
                const listGroup = container.querySelector('.list-group')
                if (listGroup) listGroup.appendChild(noResultMsg)
                else container.appendChild(noResultMsg)
              } else {
                noResultMsg.style.display = 'block'
              }
            } else if (noResultMsg) {
              noResultMsg.style.display = 'none'
            }

            if (countBadge) {
              countBadge.textContent = term ? `${visibleCount} de ${inscritos.length}` : `${inscritos.length}`
            }
          })
        }
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
      const inscritosPorClase = await obtenerAlumnosInscritosPorClases(
        clasesParaReporte.map(clase => clase.id)
      )
      const report = clasesParaReporte.map((clase) => ({
        clase,
        inscritos: inscritosPorClase[clase.id] || [],
      }))

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

  container.querySelector('#btnAlumnosSinClase')?.addEventListener('click', async () => {
    const button = container.querySelector('#btnAlumnosSinClase')
    const originalHTML = button?.innerHTML
    if (button) {
      button.disabled = true
      button.innerHTML = '<span class="spinner-border spinner-border-sm me-1" aria-hidden="true"></span>Buscando...'
    }

    try {
      const grupos = await obtenerAlumnosSinClase()
      _abrirModalAlumnosSinClase(grupos)
    } catch (error) {
      console.error(error)
      AppToast.error('No se pudo obtener el listado de alumnos sin clase')
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

  container.querySelector('#btnToggleFiltros')?.addEventListener('click', () => {
    state.filtrosAbiertos = !state.filtrosAbiertos
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

function injectClasesResponsiveStyles() {
  const styleId = 'clases-responsive-polish'
  if (document.getElementById(styleId)) return

  const style = document.createElement('style')
  style.id = styleId
  style.textContent = `
    .btn-clases-pdf {
      display: inline-flex;
      align-items: center;
      gap: .5rem;
      white-space: nowrap;
    }
    .btn-class-pdf {
      display: inline-flex;
      align-items: center;
      gap: .45rem;
      white-space: nowrap;
    }
    @media (max-width: 767.98px) {
      .clases-header-premium {
        display: flex;
        flex-direction: column;
        align-items: stretch;
        gap: 0.75rem;
      }

      .clases-header-actions {
        display: grid !important;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 0.5rem;
        width: 100%;
      }

      .clases-header-actions > * {
        width: 100%;
        min-width: 0;
      }

      .clases-filters-panel__header {
        flex-wrap: wrap;
        gap: 0.5rem;
      }

      .clases-filters-panel__header > :first-child {
        min-width: 0;
        flex: 1 1 auto;
      }

      .clases-filter-toolbar {
        display: grid !important;
        grid-template-columns: 1fr;
        gap: 0.75rem !important;
      }

      .clases-filter-toolbar .premium-search-container,
      .clases-filter-toolbar .premium-select-container {
        width: 100%;
        min-width: 0 !important;
      }

      .clases-filter-toolbar .btn {
        width: 100%;
      }

      .clase-card-item {
        flex-direction: column !important;
        align-items: stretch !important;
        gap: 0.85rem;
      }

      .clase-card-main {
        width: 100%;
        min-width: 0;
        padding-right: 0 !important;
      }

      .clase-card-copy {
        padding-right: 0 !important;
      }

      .clase-card-suplente {
        display: none;
      }

      .clase-card-horarios {
        font-size: 0.78rem !important;
      }

      .clase-card-actions {
        margin-left: 0 !important;
        padding-right: 0 !important;
        width: 100%;
        flex-wrap: wrap;
        gap: 0.35rem;
      }

      .clase-card-actions .btn {
        flex: 1 1 2.75rem;
        min-width: 2.75rem;
        padding-left: 0;
        padding-right: 0;
      }

      .btn-clases-pdf {
        width: 2.75rem;
        justify-content: center;
        padding-left: .7rem;
        padding-right: .7rem;
        flex-shrink: 0;
      }
      .btn-clases-pdf__label {
        display: none !important;
      }
      .btn-class-pdf {
        width: 2.75rem;
        justify-content: center;
        padding-left: .7rem;
        padding-right: .7rem;
        flex-shrink: 0;
      }
      .btn-class-pdf__label {
        display: none !important;
      }
    }
  `
  document.head.appendChild(style)
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

  state.filtroBuscar = rawSearch
  state.filtroEstado = filtroEstado
  state.filtroInstrumento = filtroInstr
  state.filtroNivel = filtroNivel
  state.filtroTipo = filtroTipo
  state.filtroSalon = filtroSalon
  state.filtroDia = filtroDia
  _guardarFiltrosStorage()

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

  const activosCount = [
    filtroEstado !== 'todos',
    !!filtroInstr,
    !!filtroNivel,
    !!filtroTipo,
    !!filtroSalon,
    !!filtroDia,
    !!term,
  ].filter(Boolean).length

  const badgeEl = c.querySelector('#filtrosBadgeCount')
  if (badgeEl) {
    badgeEl.textContent = activosCount
    if (activosCount > 0) badgeEl.classList.remove('d-none')
    else badgeEl.classList.add('d-none')
  }

  const labelEl = c.querySelector('#filtrosActivosCount')
  if (labelEl) {
    labelEl.textContent = activosCount > 0
      ? `${activosCount} filtro(s) activo(s) aplicado(s)`
      : 'Busca y segmenta las clases visibles'
  }

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
