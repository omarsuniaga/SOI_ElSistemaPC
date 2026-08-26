/**
 * clasesView.js — Gestión y Catálogo de Clases Académicas (Rediseño Premium).
 *
 * Características:
 * 1. Ocupación >80% de la pantalla para el catálogo de clases desde el primer render.
 * 2. Toolbar ultracompacta y aplanada con métricas inline y botón de filtros desplegable.
 * 3. Selector rápido de Familias Instrumentales (Cuerdas, Maderas, Metales, etc.).
 * 4. Fichas de Clase estructuradas con barra visual de ocupación/cupo, docente, salón y horario.
 * 5. Motor de detección de solapamientos (salón, docente, alumnos, duplicados) con badges de advertencia.
 * 6. Modal interactivo de Resolución y Bifurcación de Conflictos.
 * 7. Modal interactivo de Nómina con gestión directa de inscripciones.
 */

import '../styles/clases.css'
import { AppModal } from '../../../shared/components/AppModal.js'
import { AppToast } from '../../../shared/components/AppToast.js'
import {
  obtenerClases,
  eliminarClase,
  inscribirAlumno,
  desinscribirAlumno,
} from '../api/clasesApi.js'
import { supabase } from '../../../lib/supabaseClient.js'
import {
  escapeHTML,
  getInstrumentoIcon,
} from '../utils/clasesUtils.js'
import { openClaseModal } from '../components/claseModal.js'
import { descargarPdfClase, descargarPdfListadoAlumnosPorClases } from '../domain/generarPdfClase.js'
import { detectarConflictosDeClases, consolidarBadgesFichaClase } from '../utils/claseConflictDetector.js'
import { obtenerAcuerdosMaestros, guardarAcuerdoMaestro, eliminarAcuerdoMaestro } from '../api/acuerdosApi.js'

const state = {
  clases: [],
  clasesOriginales: [],
  maestros: [],
  salones: [],
  programas: [],
  alumnosDisponibles: [],
  acuerdos: [],
  conflictosMap: new Map(),
  cargando: false,
  filtrosAbiertos: false,
  filtroFamilia: 'todas',
  filtroEstado: 'todos',
  filtroCatedra: 'todas',
  filtroMaestro: 'todos',
  filtroSalon: 'todos',
  filtroDia: 'todos',
  filtroConflictos: 'todos',
  ordenarPor: 'maestro',
  searchQuery: '',
  container: null,
}

const FAMILIAS_MAP = {
  cuerdas: ['violin', 'viola', 'violoncello', 'cello', 'contrabajo'],
  maderas: ['flauta', 'oboe', 'clarinete', 'fagot', 'saxofon'],
  metales: ['trompeta', 'trombon', 'corno', 'tuba', 'trombon y tuba'],
  perc_teclado: ['percusion', 'bateria', 'piano', 'teclado', 'lutheria'],
  coral_iniciacion: ['coro', 'coral', 'iniciacion', 'mixto', 'todos', 'general'],
}

/**
 * Inicializa y renderiza la vista de Clases
 */
export async function renderClasesView(container) {
  if (!container) return

  try {
    state.container = container
    state.cargando = true
    renderLoading(container)

    const [clases, maestrosRes, salonesRes, programasRes, alumnosRes] = await Promise.all([
      obtenerClases(),
      supabase.from('maestros').select('*').order('nombre_completo', { ascending: true }),
      supabase.from('salones').select('*').order('nombre', { ascending: true }),
      supabase.from('programas').select('*').order('nombre', { ascending: true }),
      supabase.from('alumnos').select('*').order('nombre_completo', { ascending: true }),
    ])

    state.clases = clases || []
    state.clasesOriginales = [...state.clases]
    state.maestros = maestrosRes.data || []
    state.salones = salonesRes.data || []
    state.programas = programasRes.data || []
    state.alumnosDisponibles = alumnosRes.data || []
    state.acuerdos = obtenerAcuerdosMaestros()

    // Ejecutar motor de detección de solapamientos con soporte de Acuerdos de Maestros
    state.conflictosMap = detectarConflictosDeClases(
      state.clasesOriginales,
      state.maestros,
      state.salones,
      state.alumnosDisponibles,
      state.acuerdos
    )

    state.cargando = false

    renderContent(container)
    attachEvents(container)
  } catch (error) {
    console.error('[clasesView] Error inicializando:', error)
    renderError(container, error.message)
  }
}

function renderLoading(container) {
  container.innerHTML = `
    <div class="d-flex flex-column justify-content-center align-items-center py-5" style="min-height: 350px;">
      <div class="spinner-border text-primary mb-2" role="status"></div>
      <div class="text-muted small fw-semibold">Cargando catálogo de clases y evaluando solapes...</div>
    </div>
  `
}

function renderError(container, mensaje) {
  container.innerHTML = `
    <div class="alert alert-danger m-3 rounded-4 shadow-sm p-3">
      <div class="d-flex align-items-center gap-3">
        <i class="bi bi-exclamation-triangle-fill fs-3"></i>
        <div>
          <h6 class="alert-heading mb-1 fw-bold">Error al cargar clases</h6>
          <p class="mb-2 small text-danger-emphasis">${escapeHTML(mensaje)}</p>
          <button class="btn btn-danger btn-sm" id="retryBtn">
            <i class="bi bi-arrow-clockwise me-1"></i>Reintentar
          </button>
        </div>
      </div>
    </div>
  `
  container.querySelector('#retryBtn')?.addEventListener('click', () => renderClasesView(container))
}

function normalizeStr(t) {
  return (t || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim()
}
const normalizeText = normalizeStr

function getFiltradosClases() {
  const q = normalizeStr(state.searchQuery)
  const fam = state.filtroFamilia
  const catedra = state.filtroCatedra
  const maestro = state.filtroMaestro
  const salon = state.filtroSalon
  const dia = state.filtroDia
  const estado = state.filtroEstado
  const conflictoFiltro = state.filtroConflictos

  return state.clasesOriginales.filter((c) => {
    const issues = state.conflictosMap.get(c.id) || []

    // 0. Filtro por Conflictos
    if (conflictoFiltro === 'con-conflictos' && issues.length === 0) return false
    if (conflictoFiltro === 'en-revision' && !c.necesita_revision) return false
    if (conflictoFiltro === 'sin-conflictos' && issues.length > 0) return false

    // 1. Filtro por Familia Instrumental
    if (fam !== 'todas') {
      const instNorm = normalizeStr(c.instrumento || c.nombre || '')
      const keywords = FAMILIAS_MAP[fam] || []
      const matchFam = keywords.some(k => instNorm.includes(k))
      if (!matchFam) return false
    }

    // 2. Filtro por Cátedra
    if (catedra !== 'todas' && normalizeStr(c.instrumento) !== normalizeStr(catedra)) {
      return false
    }

    // 3. Filtro por Docente
    if (maestro !== 'todos') {
      const matchDocenteId = c.maestro_principal_id === maestro || c.maestro_id === maestro
      const matchDocenteNombre = normalizeStr(c.maestro_nombre) === normalizeStr(maestro)
      if (!matchDocenteId && !matchDocenteNombre) return false
    }

    // 4. Filtro por Salón
    if (salon !== 'todos') {
      const salonNombre = c.salon || (c.horarios || [])[0]?.salones?.nombre || ''
      if (normalizeStr(salonNombre) !== normalizeStr(salon)) return false
    }

    // 5. Filtro por Día
    if (dia !== 'todos') {
      const tieneDia = (c.horarios || c.clase_horarios || []).some(h => normalizeStr(h.dia || h.dia_semana) === normalizeStr(dia))
      if (!tieneDia) return false
    }

    // 6. Filtro por Estado
    if (estado !== 'todos') {
      const isActiva = c.activo !== false && c.estado !== 'inactiva'
      if (estado === 'activa' && !isActiva) return false
      if (estado === 'inactiva' && isActiva) return false
    }

    // 7. Buscador Universal
    if (q) {
      const matchNombre = normalizeStr(c.nombre).includes(q)
      const matchInst = normalizeStr(c.instrumento).includes(q)
      const matchMaestro = normalizeStr(c.maestro_nombre).includes(q)
      const matchSalon = normalizeStr(c.salon).includes(q)
      if (!matchNombre && !matchInst && !matchMaestro && !matchSalon) return false
    }

    return true
  }).sort((a, b) => {
    const orden = state.ordenarPor || 'maestro'
    const maestrosMap = new Map(state.maestros.map(m => [m.id, m.nombre_completo || m.nombre || '']))
    const maestroA = a.maestro_nombre || maestrosMap.get(a.maestro_principal_id) || maestrosMap.get(a.maestro_id) || 'Sin asignar'
    const maestroB = b.maestro_nombre || maestrosMap.get(b.maestro_principal_id) || maestrosMap.get(b.maestro_id) || 'Sin asignar'
    const nombreA = a.nombre || ''
    const nombreB = b.nombre || ''
    const instA = a.instrumento || ''
    const instB = b.instrumento || ''

    if (orden === 'maestro') {
      const comp = maestroA.localeCompare(maestroB, 'es', { sensitivity: 'base' })
      if (comp !== 0) return comp
      return nombreA.localeCompare(nombreB, 'es', { sensitivity: 'base', numeric: true })
    }

    if (orden === 'familia') {
      const getFam = (inst) => {
        const norm = normalizeStr(inst)
        for (const [fKey, list] of Object.entries(FAMILIAS_MAP)) {
          if (list.some(k => norm.includes(k))) return fKey
        }
        return 'zzz'
      }
      const famA = getFam(instA)
      const famB = getFam(instB)
      const compFam = famA.localeCompare(famB, 'es')
      if (compFam !== 0) return compFam
      return instA.localeCompare(instB, 'es')
    }

    if (orden === 'catedra') {
      const compInst = instA.localeCompare(instB, 'es')
      if (compInst !== 0) return compInst
      return nombreA.localeCompare(nombreB, 'es')
    }

    if (orden === 'dia') {
      const diasOrder = { lunes: 1, martes: 2, miercoles: 3, jueves: 4, viernes: 5, sabado: 6, domingo: 7 }
      const diaA = (a.horarios || a.clase_horarios || [])[0]?.dia || ''
      const diaB = (b.horarios || b.clase_horarios || [])[0]?.dia || ''
      const orderA = diasOrder[normalizeStr(diaA)] || 99
      const orderB = diasOrder[normalizeStr(diaB)] || 99
      if (orderA !== orderB) return orderA - orderB
      const horaA = (a.horarios || a.clase_horarios || [])[0]?.hora_inicio || '23:59'
      const horaB = (b.horarios || b.clase_horarios || [])[0]?.hora_inicio || '23:59'
      return horaA.localeCompare(horaB)
    }

    if (orden === 'ocupacion_desc') {
      const pctA = (a.total_alumnos || 0) / (a.capacidad_maxima || 20)
      const pctB = (b.total_alumnos || 0) / (b.capacidad_maxima || 20)
      return pctB - pctA
    }

    if (orden === 'ocupacion_asc') {
      const pctA = (a.total_alumnos || 0) / (a.capacidad_maxima || 20)
      const pctB = (b.total_alumnos || 0) / (b.capacidad_maxima || 20)
      return pctA - pctB
    }

    if (orden === 'nombre') {
      return nombreA.localeCompare(nombreB, 'es', { sensitivity: 'base', numeric: true })
    }

    return 0
  })
}

function contarFiltrosActivos() {
  let count = 0
  if (state.filtroFamilia !== 'todas') count++
  if (state.filtroCatedra !== 'todas') count++
  if (state.filtroMaestro !== 'todos') count++
  if (state.filtroSalon !== 'todos') count++
  if (state.filtroDia !== 'todos') count++
  if (state.filtroEstado !== 'todos') count++
  if (state.filtroConflictos !== 'todos') count++
  if (state.searchQuery.trim().length > 0) count++
  return count
}

function renderContent(container) {
  const clasesFiltradas = getFiltradosClases()
  const totalClases = state.clasesOriginales.length
  const totalActivas = state.clasesOriginales.filter(c => c.activo !== false && c.estado !== 'inactiva').length
  const totalMatriculas = state.clasesOriginales.reduce((s, c) => s + (c.total_alumnos || (c.alumnos_ids || []).length || 0), 0)
  const totalCapacidad = state.clasesOriginales.reduce((s, c) => s + (c.capacidad_maxima || 20), 0)
  const pctOcupacionGlobal = totalCapacidad > 0 ? Math.round((totalMatriculas / totalCapacidad) * 100) : 0
  
  // Calcular clases con conflictos/advertencias
  let clasesConConflicto = 0
  state.clasesOriginales.forEach(c => {
    const issues = state.conflictosMap.get(c.id) || []
    if (issues.length > 0) clasesConConflicto++
  })

  const filtrosActivosCount = contarFiltrosActivos()

  // Calcular alumnos únicos inscritos y alumnos sin clase
  const inscritosGeneralSet = new Set()
  state.clasesOriginales.forEach(c => {
    (c.alumnos_ids || []).forEach(aid => inscritosGeneralSet.add(aid))
  })
  const totalAlumnosPadron = state.alumnosDisponibles.length
  const totalAlumnosUnicos = inscritosGeneralSet.size
  const alumnosSinClaseCount = state.alumnosDisponibles.filter(a => !inscritosGeneralSet.has(a.id)).length

  // Extraer opciones únicas para los selects
  const catedrasList = [...new Set(state.clasesOriginales.map(c => c.instrumento).filter(Boolean))].sort()
  const salonesList = [...new Set(state.salones.map(s => s.nombre).filter(Boolean))].sort()
  const maestrosList = [...new Set(state.maestros.map(m => m.nombre_completo || m.nombre).filter(Boolean))].sort()

  container.innerHTML = `
    <div class="clases-view-container p-2 p-md-3">
      
      <!-- TOOLBAR COMPACTA PRINCIPAL -->
      <div class="card border-0 shadow-sm rounded-4 p-2 p-md-3 bg-body mb-3 border border-body-tertiary">
        
        <!-- Fila 1: Título, Métricas Rápidas y Botones de Acción -->
        <div class="d-flex flex-wrap justify-content-between align-items-center gap-2">
          <div class="d-flex align-items-center gap-2 flex-wrap">
            <h5 class="fw-bold mb-0 text-body d-flex align-items-center">
              <i class="bi bi-easel2 text-primary me-2"></i>Gestión de Clases
            </h5>
            
            <!-- Badges Inline de Resumen Específicos (Clickeables para ver explicación) -->
            <div class="d-flex align-items-center gap-1.5 ms-1 flex-wrap" id="contenedorBadgesHeader" title="Hacé clic en cualquier indicador para ver la explicación y desglose detallado">
              <span class="badge bg-primary-subtle text-primary border border-primary-subtle py-1 px-2 cursor-pointer btn-info-metrica" style="font-size:0.75rem; cursor:pointer;" title="Ver explicación de Clases Activas">
                <i class="bi bi-easel me-1"></i>${totalActivas}/${totalClases} Clases Activas
              </span>
              <span class="badge bg-success-subtle text-success border border-success-subtle py-1 px-2 cursor-pointer btn-info-metrica" style="font-size:0.75rem; cursor:pointer;" title="Ver explicación de Alumnos Asignados">
                <i class="bi bi-people-fill me-1"></i>${totalAlumnosUnicos}/${totalAlumnosPadron} Alumnos Asignados
              </span>
              <span class="badge bg-secondary-subtle text-secondary-emphasis border border-secondary-subtle py-1 px-2 cursor-pointer btn-info-metrica" style="font-size:0.75rem; cursor:pointer;" title="Ver explicación de Matrículas Totales">
                <i class="bi bi-journal-check me-1"></i>${totalMatriculas} Matrículas Totales
              </span>
              <span class="badge bg-info-subtle text-info-emphasis border border-info-subtle py-1 px-2 cursor-pointer btn-info-metrica" style="font-size:0.75rem; cursor:pointer;" title="Ver explicación de Ocupación Global">
                <i class="bi bi-pie-chart-fill me-1"></i>${pctOcupacionGlobal}% Ocupación
              </span>
              <span class="badge bg-body-tertiary text-muted border py-1 px-1.5 cursor-pointer btn-info-metrica" style="font-size:0.75rem; cursor:pointer;" title="¿Qué significan estas métricas? Hacé clic para abrir la guía">
                <i class="bi bi-question-circle-fill text-primary"></i>
              </span>
              ${clasesConConflicto > 0 ? `
                <span class="badge bg-danger-subtle text-danger border border-danger-subtle py-1 px-2 cursor-pointer" id="badgeFiltroConflictosHeader" style="font-size:0.75rem; cursor:pointer;" title="Ver clases con solapes o advertencias">
                  <i class="bi bi-exclamation-triangle-fill me-1"></i>${clasesConConflicto} con Advertencias
                </span>
              ` : ''}
            </div>
          </div>

          <div class="d-flex gap-2 align-items-center flex-wrap">
            <!-- Botón Alumnos Sin Clase -->
            <button class="btn btn-sm ${alumnosSinClaseCount > 0 ? 'bg-warning-subtle text-warning-emphasis border border-warning-subtle' : 'bg-body-secondary text-secondary border border-secondary-subtle'} d-inline-flex align-items-center gap-1.5 px-3 py-1.5 rounded-3 fw-semibold shadow-xs" id="btnAlumnosSinClase" title="Ver alumnos que no tienen ninguna clase asignada">
              <i class="bi bi-person-exclamation"></i>
              <span>Sin Clase (${alumnosSinClaseCount})</span>
            </button>

            <!-- Botón Desplegar/Contraer Filtros -->
            <button class="btn btn-sm ${state.filtrosAbiertos ? 'btn-primary' : 'btn-outline-secondary'} d-inline-flex align-items-center gap-1.5 px-3 py-1.5 rounded-3 fw-semibold shadow-xs" id="btnToggleFiltrosClases">
              <i class="bi bi-funnel-fill"></i>
              <span>Filtros</span>
              ${filtrosActivosCount > 0 ? `<span class="badge bg-warning text-dark ms-1 rounded-pill" style="font-size:0.65rem;">${filtrosActivosCount}</span>` : ''}
              <i class="bi bi-chevron-${state.filtrosAbiertos ? 'up' : 'down'} ms-1" style="font-size:0.75rem;"></i>
            </button>

            <!-- Botón PDF Listados -->
            <button class="btn btn-sm btn-outline-secondary d-inline-flex align-items-center gap-1.5 px-3 py-1.5 rounded-3 fw-semibold shadow-xs" id="btnPdfListadosClases" title="Descargar Planilla General PDF">
              <i class="bi bi-file-earmark-pdf-fill"></i>
              <span>Listados PDF</span>
            </button>

            <!-- Botón Crear Clase -->
            <button class="btn btn-sm btn-outline-primary d-inline-flex align-items-center gap-1.5 px-3 py-1.5 rounded-3 fw-semibold shadow-xs" id="btnNuevaClase">
              <i class="bi bi-plus-circle-fill"></i>
              <span>Nueva Clase</span>
            </button>
          </div>
        </div>

        <!-- Panel de Filtros Desplegable (Oculto por defecto para garantizar 80% pantalla útil) -->
        <div class="collapse ${state.filtrosAbiertos ? 'show' : ''} pt-2 mt-2 border-top border-body-tertiary" id="panelFiltrosClases">
          
          <!-- Píldoras de Familia Instrumental -->
          <div class="d-flex align-items-center gap-1.5 mb-2.5 flex-wrap">
            <span class="small text-muted me-1 fw-bold" style="font-size:0.75rem;"><i class="bi bi-tag-fill me-1"></i>Familia:</span>
            <button class="btn btn-sm ${state.filtroFamilia === 'todas' ? 'btn-primary' : 'btn-outline-secondary'} rounded-3 px-2.5 py-1 fw-semibold shadow-xs family-pill-btn" data-familia="todas" style="font-size:0.75rem;">Todas</button>
            <button class="btn btn-sm ${state.filtroFamilia === 'cuerdas' ? 'btn-primary' : 'btn-outline-secondary'} rounded-3 px-2.5 py-1 fw-semibold shadow-xs family-pill-btn" data-familia="cuerdas" style="font-size:0.75rem;">🎻 Cuerdas</button>
            <button class="btn btn-sm ${state.filtroFamilia === 'maderas' ? 'btn-primary' : 'btn-outline-secondary'} rounded-3 px-2.5 py-1 fw-semibold shadow-xs family-pill-btn" data-familia="maderas" style="font-size:0.75rem;">🎷 Maderas</button>
            <button class="btn btn-sm ${state.filtroFamilia === 'metales' ? 'btn-primary' : 'btn-outline-secondary'} rounded-3 px-2.5 py-1 fw-semibold shadow-xs family-pill-btn" data-familia="metales" style="font-size:0.75rem;">🎺 Metales</button>
            <button class="btn btn-sm ${state.filtroFamilia === 'perc_teclado' ? 'btn-primary' : 'btn-outline-secondary'} rounded-3 px-2.5 py-1 fw-semibold shadow-xs family-pill-btn" data-familia="perc_teclado" style="font-size:0.75rem;">🥁 Percusión & Piano</button>
            <button class="btn btn-sm ${state.filtroFamilia === 'coral_iniciacion' ? 'btn-primary' : 'btn-outline-secondary'} rounded-3 px-2.5 py-1 fw-semibold shadow-xs family-pill-btn" data-familia="coral_iniciacion" style="font-size:0.75rem;">🎶 Iniciación & Coro</button>
          </div>

          <!-- Selects de Filtro y Ordenamiento Estilizados -->
          <div class="row g-2 align-items-center">
            
            <!-- Buscador -->
            <div class="col-12 col-sm-6 col-lg-3">
              <div class="input-group input-group-sm rounded-3 shadow-xs overflow-hidden">
                <span class="input-group-text bg-body-tertiary border-end-0 py-1.5"><i class="bi bi-search text-muted"></i></span>
                <input type="text" class="form-control border-start-0 py-1.5 fw-medium" id="inputBuscarClases" placeholder="Buscar por nombre, docente..." value="${escapeHTML(state.searchQuery)}" style="font-size:0.8rem;">
              </div>
            </div>

            <!-- Cátedra -->
            <div class="col-6 col-sm-3 col-lg-2">
              <select class="form-select form-select-sm rounded-3 shadow-xs border-body-tertiary fw-medium py-1.5" id="selectCatedraClase" style="font-size:0.8rem;">
                <option value="todas" ${state.filtroCatedra === 'todas' ? 'selected' : ''}>Todas Cátedras</option>
                ${catedrasList.map(c => `<option value="${escapeHTML(c)}" ${state.filtroCatedra === c ? 'selected' : ''}>${escapeHTML(c)}</option>`).join('')}
              </select>
            </div>

            <!-- Docente -->
            <div class="col-6 col-sm-3 col-lg-2">
              <select class="form-select form-select-sm rounded-3 shadow-xs border-body-tertiary fw-medium py-1.5" id="selectMaestroClase" style="font-size:0.8rem;">
                <option value="todos" ${state.filtroMaestro === 'todos' ? 'selected' : ''}>Todos Docentes</option>
                ${maestrosList.map(m => `<option value="${escapeHTML(m)}" ${state.filtroMaestro === m ? 'selected' : ''}>${escapeHTML(m)}</option>`).join('')}
              </select>
            </div>

            <!-- Salón -->
            <div class="col-6 col-sm-3 col-lg-1">
              <select class="form-select form-select-sm rounded-3 shadow-xs border-body-tertiary fw-medium py-1.5" id="selectSalonClase" style="font-size:0.8rem;">
                <option value="todos" ${state.filtroSalon === 'todos' ? 'selected' : ''}>Salones</option>
                ${salonesList.map(s => `<option value="${escapeHTML(s)}" ${state.filtroSalon === s ? 'selected' : ''}>${escapeHTML(s)}</option>`).join('')}
              </select>
            </div>

            <!-- Día -->
            <div class="col-6 col-sm-3 col-lg-1">
              <select class="form-select form-select-sm rounded-3 shadow-xs border-body-tertiary fw-medium py-1.5" id="selectDiaClase" style="font-size:0.8rem;">
                <option value="todos" ${state.filtroDia === 'todos' ? 'selected' : ''}>Día</option>
                <option value="lunes" ${state.filtroDia === 'lunes' ? 'selected' : ''}>Lun</option>
                <option value="martes" ${state.filtroDia === 'martes' ? 'selected' : ''}>Mar</option>
                <option value="miercoles" ${state.filtroDia === 'miercoles' ? 'selected' : ''}>Mié</option>
                <option value="jueves" ${state.filtroDia === 'jueves' ? 'selected' : ''}>Jue</option>
                <option value="viernes" ${state.filtroDia === 'viernes' ? 'selected' : ''}>Vie</option>
                <option value="sabado" ${state.filtroDia === 'sabado' ? 'selected' : ''}>Sáb</option>
              </select>
            </div>

            <!-- Conflictos / Estados -->
            <div class="col-6 col-sm-3 col-lg-1">
              <select class="form-select form-select-sm rounded-3 shadow-xs border-body-tertiary fw-medium py-1.5" id="selectConflictosFiltro" style="font-size:0.8rem;">
                <option value="todos" ${state.filtroConflictos === 'todos' ? 'selected' : ''}>Estados</option>
                <option value="con-conflictos" ${state.filtroConflictos === 'con-conflictos' ? 'selected' : ''}>⚠️ Advertencias</option>
                <option value="en-revision" ${state.filtroConflictos === 'en-revision' ? 'selected' : ''}>🚩 Revisión</option>
                <option value="sin-conflictos" ${state.filtroConflictos === 'sin-conflictos' ? 'selected' : ''}>✅ Sin Conflictos</option>
              </select>
            </div>

            <!-- Ordenar Por -->
            <div class="col-12 col-sm-6 col-lg-2">
              <div class="input-group input-group-sm rounded-3 shadow-xs overflow-hidden">
                <span class="input-group-text bg-body-tertiary border-end-0 py-1.5 text-muted" style="font-size:0.75rem;"><i class="bi bi-sort-down"></i></span>
                <select class="form-select form-select-sm border-start-0 py-1.5 fw-semibold text-primary" id="selectOrdenarClases" style="font-size:0.8rem;">
                  <option value="maestro" ${state.ordenarPor === 'maestro' ? 'selected' : ''}>Maestro (A-Z)</option>
                  <option value="familia" ${state.ordenarPor === 'familia' ? 'selected' : ''}>Familia Instrumental</option>
                  <option value="catedra" ${state.ordenarPor === 'catedra' ? 'selected' : ''}>Cátedra (A-Z)</option>
                  <option value="dia" ${state.ordenarPor === 'dia' ? 'selected' : ''}>Día y Horario</option>
                  <option value="ocupacion_desc" ${state.ordenarPor === 'ocupacion_desc' ? 'selected' : ''}>Mayor Ocupación</option>
                  <option value="ocupacion_asc" ${state.ordenarPor === 'ocupacion_asc' ? 'selected' : ''}>Menor Ocupación</option>
                  <option value="nombre" ${state.ordenarPor === 'nombre' ? 'selected' : ''}>Nombre de Clase</option>
                </select>
              </div>
            </div>

          </div>
        </div>

      </div>

      <!-- GRID DE TARJETAS DE CLASE (80% DEL ESPACIO VISUAL) -->
      ${clasesFiltradas.length > 0 ? `
        <div class="row g-3">
          ${clasesFiltradas.map(c => _renderClaseCardV2(c)).join('')}
        </div>
      ` : `
        <div class="card border-0 shadow-sm rounded-4 p-5 text-center bg-body text-muted">
          <i class="bi bi-easel fs-1 d-block mb-3 opacity-50 text-secondary"></i>
          <h5 class="fw-bold">No se encontraron clases</h5>
          <p class="small text-muted mb-3">Probá cambiando los filtros o agregá una nueva clase al catálogo.</p>
          <button class="btn btn-primary btn-sm mx-auto" id="btnCrearClaseEmpty">
            <i class="bi bi-plus-lg me-1"></i>Crear Nueva Clase
          </button>
        </div>
      `}

    </div>
  `
}

/**
 * Calcula un tono HUE (0-360) determinista para el maestro para agrupar visualmente
 */
function getMaestroHue(idOrName = '') {
  if (!idOrName || idOrName === 'Maestro no asignado') return 220
  let hash = 0
  for (let i = 0; i < idOrName.length; i++) {
    hash = (hash << 5) - hash + idOrName.charCodeAt(i)
    hash |= 0
  }
  return Math.abs(hash) % 360
}

/**
 * Renderiza la ficha visual de una clase con detección de solapes y advertencias
 */
function _renderClaseCardV2(c) {
  const isActiva = c.activo !== false && c.estado !== 'inactiva'
  const totalAlumnos = c.total_alumnos || (c.alumnos_ids || []).length || 0
  const capacidad = c.capacidad_maxima || 20
  const pctOcupacion = Math.min(100, Math.round((totalAlumnos / capacidad) * 100))

  let fillClass = 'bg-success'
  if (pctOcupacion >= 85 && pctOcupacion < 100) fillClass = 'bg-warning'
  if (pctOcupacion >= 100) fillClass = 'bg-danger'

  // Resolver horario
  const primerHorario = (c.horarios || c.clase_horarios || [])[0] || {}
  const diaTexto = primerHorario.dia || primerHorario.dia_semana || 'Por definir'
  const horaTexto = primerHorario.hora_inicio 
    ? `${String(primerHorario.hora_inicio).slice(0, 5)} - ${String(primerHorario.hora_fin || '').slice(0, 5)}`
    : (c.hora_inicio ? `${String(c.hora_inicio).slice(0, 5)} - ${String(c.hora_fin || '').slice(0, 5)}` : 'Horario flexible')

  // Resolver salón
  const salonTexto = c.salon || primerHorario.salones?.nombre || primerHorario.salon_nombre || 'Salón por asignar'

  // Resolver maestro
  const maestroObj = state.maestros.find(m => m.id === c.maestro_principal_id || m.id === c.maestro_id)
  const maestroNombre = c.maestro_nombre || maestroObj?.nombre_completo || 'Maestro no asignado'
  const maestroIdKey = c.maestro_principal_id || c.maestro_id || maestroNombre
  const teacherHue = getMaestroHue(maestroIdKey)

  // Conflictos detectados en esta clase
  const issues = state.conflictosMap.get(c.id) || []
  const badgesConsolidados = consolidarBadgesFichaClase(issues)
  const hasDangerIssues = badgesConsolidados.some(i => i.nivel === 'danger')
  const hasWarningIssues = badgesConsolidados.some(i => i.nivel === 'warning')

  return `
    <div class="col-12 col-md-6 col-xl-4">
      <div class="clase-card-v2 h-100 ${hasDangerIssues ? 'border-danger' : hasWarningIssues ? 'border-warning' : ''}" style="--teacher-hue: ${teacherHue};">
        
        <div>
          <!-- Header de Ficha -->
          <div class="clase-card-v2-header">
            <div>
              <div class="d-flex align-items-center gap-1 mb-1 flex-wrap">
                <span class="badge bg-secondary-subtle text-secondary border" style="font-size:0.68rem;">
                  <i class="bi ${getInstrumentoIcon(c.instrumento)} me-1"></i>${escapeHTML(c.instrumento || 'General')}
                </span>
                ${c.tipo_clase ? `<span class="badge bg-body-tertiary text-muted border" style="font-size:0.68rem;">${escapeHTML(c.tipo_clase)}</span>` : ''}
                ${c.necesita_revision ? `<span class="badge bg-warning text-dark" style="font-size:0.68rem;"><i class="bi bi-flag-fill me-1"></i>Revisión</span>` : ''}
              </div>
              <h6 class="clase-card-v2-title">${escapeHTML(c.nombre || 'Clase')}</h6>
            </div>
            
            <span class="badge ${isActiva ? 'bg-success-subtle text-success border border-success-subtle' : 'bg-danger-subtle text-danger border border-danger-subtle'}" style="font-size:0.68rem;">
              ${isActiva ? 'Activa' : 'Inactiva'}
            </span>
          </div>

          <!-- Metadatos Operativos -->
          <div class="clase-card-v2-meta">
            <div class="clase-meta-row">
              <i class="bi bi-clock text-primary"></i>
              <span><strong>${escapeHTML(diaTexto)}</strong> · ${escapeHTML(horaTexto)}</span>
            </div>
            <div class="clase-meta-row">
              <i class="bi bi-door-closed text-secondary"></i>
              <span>${escapeHTML(salonTexto)}</span>
            </div>
            <div class="clase-meta-row">
              <i class="bi bi-person-badge" style="color: hsl(var(--teacher-hue), 70%, 60%);"></i>
              <span>Docente: <strong>${escapeHTML(maestroNombre)}</strong></span>
            </div>
          </div>

          <!-- Chips de Advertencias/Solapes Consolidados si existen -->
          ${badgesConsolidados.length > 0 ? `
            <div class="d-flex flex-wrap gap-1 mb-2">
              ${badgesConsolidados.map(b => `
                <span class="badge ${b.nivel === 'danger' ? 'bg-danger-subtle text-danger border border-danger-subtle' : b.nivel === 'warning' ? 'bg-warning-subtle text-warning-emphasis border border-warning-subtle' : 'bg-info-subtle text-info border border-info-subtle'}" style="font-size:0.68rem;" title="${escapeHTML(b.tooltip)}">
                  <i class="bi ${b.icon} me-1"></i>${escapeHTML(b.label)}
                </span>
              `).join('')}
            </div>
          ` : ''}

          <!-- Ocupación / Capacidad -->
          <div class="clase-occupancy-container">
            <div class="d-flex justify-content-between align-items-center" style="font-size:0.75rem;">
              <span class="text-muted fw-semibold">Capacidad: <strong>${totalAlumnos}/${capacidad}</strong> alumnos</span>
              <span class="fw-bold ${pctOcupacion >= 100 ? 'text-danger' : 'text-success'}">${pctOcupacion}%</span>
            </div>
            <div class="clase-occupancy-bar">
              <div class="clase-occupancy-fill ${fillClass}" style="width: ${pctOcupacion}%;"></div>
            </div>
          </div>
        </div>

        <!-- Footer / Acciones Rápidas -->
        <div class="clase-card-v2-footer">
          <div class="d-flex gap-1 align-items-center">
            <button class="btn btn-outline-primary btn-sm px-2 py-1 d-inline-flex align-items-center" 
                    data-action="ver-nomina" 
                    data-id="${c.id}"
                    style="font-size:0.78rem;">
              <i class="bi bi-people-fill me-1"></i>Nómina (${totalAlumnos})
            </button>

            ${issues.length > 0 ? `
              <button class="btn btn-warning btn-sm px-2 py-1 d-inline-flex align-items-center"
                      data-action="resolver-conflicto"
                      data-id="${c.id}"
                      style="font-size:0.78rem;"
                      title="Evaluar y resolver conflictos de esta clase">
                <i class="bi bi-shield-exclamation me-1"></i>Resolver (${issues.length})
              </button>
            ` : ''}
          </div>

          <div class="d-flex gap-1">
            <button class="btn btn-outline-secondary btn-sm px-2 py-1" 
                    data-action="pdf-clase" 
                    data-id="${c.id}" 
                    title="Descargar Planilla PDF">
              <i class="bi bi-file-earmark-pdf"></i>
            </button>
            <button class="btn btn-outline-secondary btn-sm px-2 py-1" 
                    data-action="editar-clase" 
                    data-id="${c.id}" 
                    title="Editar Clase y Horario">
              <i class="bi bi-pencil"></i>
            </button>
            <button class="btn btn-outline-danger btn-sm px-2 py-1" 
                    data-action="eliminar-clase" 
                    data-id="${c.id}" 
                    data-nombre="${escapeHTML(c.nombre)}" 
                    title="Eliminar Clase">
              <i class="bi bi-trash"></i>
            </button>
          </div>
        </div>

      </div>
    </div>
  `
}

/**
 * Modal Interactivo de Resolución y Bifurcación de Conflictos (Vista Inmersiva 95%)
 */
function _mostrarModalResolucionConflictos(claseId) {
  const clase = state.clasesOriginales.find(c => c.id === claseId)
  if (!clase) return

  const issues = state.conflictosMap.get(claseId) || []
  const maestroObj = state.maestros.find(m => m.id === clase.maestro_principal_id || m.id === clase.maestro_id)
  const primerHorario = (clase.horarios || clase.clase_horarios || [])[0] || {}

  const modalHtml = `
    <div class="container-fluid p-0">
      <div class="row g-3">
        
        <!-- PANEL IZQUIERDO: Diagnóstico y Comparativa de Solapes (45%) -->
        <div class="col-12 col-lg-5">
          <div class="card border-0 shadow-sm rounded-4 p-3 bg-body h-100 border border-body-tertiary">
            
            <div class="d-flex align-items-center gap-2 pb-2 mb-3 border-bottom">
              <div class="p-2 rounded-3 bg-warning-subtle text-warning-emphasis">
                <i class="bi bi-shield-exclamation fs-4"></i>
              </div>
              <div>
                <h6 class="fw-bold mb-0 text-body">Diagnóstico de Conflictos</h6>
                <small class="text-muted">${issues.length} advertencia(s) que requieren decisión</small>
              </div>
            </div>

            <!-- Ficha Resumen de Esta Clase -->
            <div class="p-3 rounded-3 mb-3 bg-body-tertiary border">
              <div class="d-flex justify-content-between align-items-center mb-2">
                <span class="badge bg-primary-subtle text-primary border border-primary-subtle" style="font-size:0.7rem;">
                  <i class="bi ${getInstrumentoIcon(clase.instrumento)} me-1"></i>${escapeHTML(clase.instrumento || 'General')}
                </span>
                <span class="badge ${clase.necesita_revision ? 'bg-warning text-dark' : 'bg-success-subtle text-success border border-success-subtle'}" style="font-size:0.7rem;">
                  ${clase.necesita_revision ? 'En Revisión' : 'Activa'}
                </span>
              </div>
              <h6 class="fw-bold text-body mb-2">${escapeHTML(clase.nombre)}</h6>
              <div class="d-flex flex-column gap-1 small text-muted" style="font-size:0.8rem;">
                <div><i class="bi bi-person-badge text-info me-2"></i>Docente: <strong>${escapeHTML(maestroObj?.nombre_completo || 'No asignado')}</strong></div>
                <div><i class="bi bi-clock text-primary me-2"></i>Horario: <strong>${escapeHTML(primerHorario.dia || 'Por definir')} ${primerHorario.hora_inicio ? String(primerHorario.hora_inicio).slice(0, 5) + ' - ' + String(primerHorario.hora_fin || '').slice(0, 5) : ''}</strong></div>
                <div><i class="bi bi-door-closed text-secondary me-2"></i>Salón: <strong>${escapeHTML(clase.salon || primerHorario.salon_nombre || 'Por asignar')}</strong></div>
              </div>
            </div>

            <!-- Detalle de Solapes Enfrentados -->
            <div class="small fw-bold text-muted text-uppercase mb-2" style="font-size:0.7rem;">Desglose Detallado de Advertencias</div>
            <div class="d-flex flex-column gap-2" style="max-height: calc(92vh - 380px); overflow-y: auto;">
              ${issues.map((issue, idx) => `
                <div class="p-2.5 rounded-3 border ${issue.nivel === 'danger' ? 'border-danger-subtle bg-danger-subtle bg-opacity-10' : issue.nivel === 'warning' ? 'border-warning-subtle bg-warning-subtle bg-opacity-10' : 'border-info-subtle bg-body'}">
                  <div class="d-flex align-items-center gap-2 mb-1">
                    <i class="bi ${issue.icon} ${issue.nivel === 'danger' ? 'text-danger' : issue.nivel === 'warning' ? 'text-warning-emphasis' : 'text-info'}"></i>
                    <strong class="text-body" style="font-size:0.85rem;">${idx + 1}. ${escapeHTML(issue.titulo)}</strong>
                  </div>
                  <p class="small text-muted mb-0" style="font-size:0.78rem;">${escapeHTML(issue.detalle)}</p>
                </div>
              `).join('')}
            </div>

          </div>
        </div>

        <!-- PANEL DERECHO: Matriz de Decisiones Pedagógicas & Operativas (55%) -->
        <div class="col-12 col-lg-7">
          <div class="card border-0 shadow-sm rounded-4 p-3 bg-body h-100 border border-body-tertiary d-flex flex-column justify-content-between">
            
            <div>
              <div class="d-flex align-items-center justify-content-between pb-2 mb-3 border-bottom">
                <div class="d-flex align-items-center gap-2">
                  <div class="p-2 rounded-3 bg-primary-subtle text-primary">
                    <i class="bi bi-diagram-3 fs-4"></i>
                  </div>
                  <div>
                    <h6 class="fw-bold mb-0 text-body">Matriz de Resolución & Bifurcación</h6>
                    <small class="text-muted">Elegí la acción que regulariza la situación académica u operativa</small>
                  </div>
                </div>
              </div>

              <!-- Acciones según cada conflicto -->
              <div class="d-flex flex-column gap-3 mb-4" id="conflictosListContainer">
                ${issues.map((issue, idx) => `
                  <div class="p-3 rounded-4 border bg-body-tertiary shadow-xs">
                    <div class="d-flex align-items-center justify-content-between mb-1.5 flex-wrap gap-1">
                      <div class="fw-bold text-body d-flex align-items-center gap-2" style="font-size:0.88rem;">
                        <i class="bi ${issue.icon} fs-5 ${issue.nivel === 'danger' ? 'text-danger' : issue.nivel === 'warning' ? 'text-warning-emphasis' : 'text-info'}"></i>
                        <span>${idx + 1}. ${escapeHTML(issue.titulo)}</span>
                      </div>
                      <span class="badge ${issue.nivel === 'danger' ? 'bg-danger-subtle text-danger border border-danger-subtle' : issue.nivel === 'warning' ? 'bg-warning-subtle text-warning-emphasis border border-warning-subtle' : 'bg-info-subtle text-info border border-info-subtle'}" style="font-size:0.68rem;">
                        ${issue.nivel === 'danger' ? 'Crítico' : issue.nivel === 'warning' ? 'Advertencia' : 'Informativo'}
                      </span>
                    </div>

                    <p class="small text-muted mb-3" style="font-size:0.78rem; line-height: 1.4;">${escapeHTML(issue.detalle)}</p>
                    
                    <div class="d-flex flex-wrap align-items-center gap-2 pt-2 border-top">
                      ${issue.tipo === 'salon' ? `
                        <button class="btn btn-outline-danger btn-sm d-inline-flex align-items-center gap-1.5 px-3.5 py-1.5 rounded-3 fw-semibold shadow-xs flex-grow-1" data-bifurcacion="liberar-salon" data-clase-id="${issue.otraClaseId || ''}" data-salon-id="${issue.salonId || ''}" title="Liberar salón en la otra clase">
                          <i class="bi bi-door-open-fill"></i>
                          <span>Liberar Salón en "${escapeHTML(issue.otraClaseNombre || 'otra clase')}"</span>
                        </button>
                        <button class="btn btn-outline-secondary btn-sm d-inline-flex align-items-center gap-1.5 px-2.5 py-1.5 rounded-3 shadow-xs" data-bifurcacion="editar-horario-esta" data-clase-id="${clase.id}" title="Reasignar salón de esta clase">
                          <i class="bi bi-pencil-square"></i>
                          <span>Reasignar</span>
                        </button>
                      ` : ''}

                      ${issue.tipo === 'maestro' ? `
                        <button class="btn btn-outline-warning btn-sm d-inline-flex align-items-center gap-1.5 px-3.5 py-1.5 rounded-3 fw-semibold text-dark shadow-xs flex-grow-1" data-bifurcacion="editar-horario-esta" data-clase-id="${clase.id}" title="Asignar docente suplente">
                          <i class="bi bi-person-plus-fill"></i>
                          <span>Asignar Docente Suplente</span>
                        </button>
                      ` : ''}

                      ${issue.tipo === 'alumnos' ? `
                        <button class="btn btn-outline-primary btn-sm d-inline-flex align-items-center gap-1.5 px-3.5 py-1.5 rounded-3 fw-semibold shadow-xs flex-grow-1" data-bifurcacion="acuerdo-maestros" data-otra-clase-id="${issue.otraClaseId || ''}" data-otra-clase-nombre="${escapeHTML(issue.otraClaseNombre || '')}" data-alumnos="${(issue.alumnosComunes || []).join(',')}" data-alumnos-nombres="${escapeHTML((issue.alumnosNombres || []).join(','))}" title="Pactar acuerdo de asistencia compartida entre docentes">
                          <i class="bi bi-handshake-fill"></i>
                          <span>Formalizar Acuerdo Docente</span>
                        </button>
                        <button class="btn btn-outline-success btn-sm d-inline-flex align-items-center gap-1.5 px-2.5 py-1.5 rounded-3 shadow-xs" data-bifurcacion="aceptar-solape-pedagogico" data-clase-id="${clase.id}" title="Validar como ensayo conjunto">
                          <i class="bi bi-check2-circle"></i>
                          <span>Ensayo Conjunto</span>
                        </button>
                        <button class="btn btn-outline-danger btn-sm d-inline-flex align-items-center gap-1.5 px-2.5 py-1.5 rounded-3 shadow-xs" data-bifurcacion="desinscribir-solapados" data-clase-id="${issue.otraClaseId || ''}" data-alumnos="${(issue.alumnosComunes || []).join(',')}" title="Dar de baja de la otra clase">
                          <i class="bi bi-person-x-fill"></i>
                          <span>Desinscribir</span>
                        </button>
                      ` : ''}

                      ${issue.tipo === 'acuerdo_maestros' ? `
                        <div class="d-flex align-items-center justify-content-between w-100 p-2.5 rounded-3 bg-info-subtle bg-opacity-40 border border-info-subtle gap-2 flex-wrap">
                          <div class="d-flex align-items-center gap-2 small text-info-emphasis fw-bold" style="font-size:0.8rem;">
                            <i class="bi bi-handshake-fill fs-5 text-info"></i>
                            <span>Acuerdo Activo · Transición pactada: <strong>${escapeHTML(issue.horaTransicion || '16:15')}</strong></span>
                          </div>
                          <button class="btn btn-outline-danger btn-sm d-inline-flex align-items-center gap-1 px-3 py-1 rounded-pill" data-bifurcacion="eliminar-acuerdo" data-acuerdo-id="${issue.acuerdoId}" title="Revocar acuerdo">
                            <i class="bi bi-x-circle"></i>
                            <span>Revocar</span>
                          </button>
                        </div>
                      ` : ''}

                      ${issue.tipo === 'duplicados' ? `
                        <button class="btn btn-outline-danger btn-sm d-inline-flex align-items-center gap-1.5 px-3.5 py-1.5 rounded-3 fw-semibold shadow-xs flex-grow-1" data-bifurcacion="limpiar-duplicados" data-clase-id="${clase.id}" title="Depurar inscripciones duplicadas">
                          <i class="bi bi-trash3-fill"></i>
                          <span>Depurar Inscripciones Duplicadas</span>
                        </button>
                      ` : ''}
                    </div>

                    <!-- Contenedor dinámico para el formulario de Acuerdo de Maestros -->
                    <div class="form-acuerdo-container mt-2" style="display:none;"></div>
                  </div>
                `).join('')}
              </div>
            </div>

            <!-- Panel de Excepción / Revisión para Coordinación -->
            <div class="p-3 bg-body-tertiary rounded-3 border">
              <label class="small fw-bold text-muted text-uppercase mb-1" style="font-size:0.7rem;">Control de Revisión por Dirección / Coordinación</label>
              <div class="input-group input-group-sm mb-2 rounded-3 overflow-hidden">
                <input type="text" class="form-control" id="inputMotivoRevision" placeholder="Motivo o justificación de la excepción académica..." value="${escapeHTML(clase.revision_motivo || '')}">
                <button class="btn btn-outline-warning px-3 fw-semibold text-dark shadow-xs" id="btnMarcarRevision">
                  <i class="bi bi-flag-fill me-1"></i>Guardar en Revisión
                </button>
              </div>
              <div class="d-flex justify-content-between align-items-center">
                <small class="text-muted" style="font-size:0.75rem;">Permite operar la clase manteniendo una bandera de revisión visible.</small>
                ${clase.necesita_revision ? `
                  <button class="btn btn-outline-success btn-sm py-1.5 px-3 rounded-3 fw-semibold shadow-xs" id="btnMarcarResuelto" style="font-size:0.78rem;">
                    <i class="bi bi-check2-circle me-1"></i>Marcar como Resuelto
                  </button>
                ` : ''}
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  `

  AppModal.open({
    title: `Centro de Resolución de Conflictos · ${escapeHTML(clase.nombre)}`,
    size: 'view',
    hideSave: true,
    cancelText: 'Cerrar',
    body: modalHtml,
  })

  // Vincular eventos interactivos
  setTimeout(() => {
    // 1. Guardar en Revisión
    document.getElementById('btnMarcarRevision')?.addEventListener('click', async () => {
      const motivo = document.getElementById('inputMotivoRevision')?.value.trim() || 'Pendiente de revisión por coordinación.'
      try {
        AppToast.info('Actualizando estado de revisión...')
        await supabase
          .from('clases')
          .update({
            necesita_revision: true,
            revision_motivo: motivo,
            updated_at: new Date().toISOString(),
          })
          .eq('id', clase.id)

        AppToast.success('Clase marcada en revisión con éxito.')
        AppModal.close()
        await renderClasesView(state.container)
      } catch (err) {
        console.error(err)
        AppToast.error('No se pudo marcar en revisión.')
      }
    })

    // 2. Marcar como Resuelto
    document.getElementById('btnMarcarResuelto')?.addEventListener('click', async () => {
      try {
        AppToast.info('Marcando clase como resuelta...')
        await supabase
          .from('clases')
          .update({
            necesita_revision: false,
            revision_motivo: null,
            updated_at: new Date().toISOString(),
          })
          .eq('id', clase.id)

        AppToast.success('Advertencia resuelta y clase normalizada.')
        AppModal.close()
        await renderClasesView(state.container)
      } catch (err) {
        console.error(err)
        AppToast.error('Error al actualizar el estado de la clase.')
      }
    })

    // 3. Delegación de botones de bifurcación
    document.getElementById('conflictosListContainer')?.addEventListener('click', async (e) => {
      // 3.1 Abrir Formulario de Acuerdo de Maestros
      const btnAcuerdo = e.target.closest('[data-bifurcacion="acuerdo-maestros"]')
      if (btnAcuerdo) {
        const cardParent = btnAcuerdo.closest('.p-3')
        const formContainer = cardParent?.querySelector('.form-acuerdo-container')
        if (formContainer) {
          const otraClaseId = btnAcuerdo.dataset.otraClaseId
          const otraClaseNombre = btnAcuerdo.dataset.otraClaseNombre
          const alumnosIds = (btnAcuerdo.dataset.alumnos || '').split(',').filter(Boolean)
          const alumnosNombres = (btnAcuerdo.dataset.alumnosNombres || '').split(',').filter(Boolean)
          const otraClaseObj = state.clasesOriginales.find(x => x.id === otraClaseId)
          const otraMaestroObj = state.maestros.find(m => m.id === otraClaseObj?.maestro_principal_id || m.id === otraClaseObj?.maestro_id)

          formContainer.style.display = 'block'
          formContainer.innerHTML = `
            <div class="card border-primary border-opacity-50 bg-primary-subtle bg-opacity-10 p-3 rounded-3 mt-3">
              <h6 class="fw-bold text-primary mb-2 d-flex align-items-center">
                <i class="bi bi-handshake-fill me-2"></i>Formalizar Acuerdo Inter-Cátedra (Franja Compartida)
              </h6>
              <p class="small text-muted mb-2" style="font-size:0.78rem;">
                Pacto entre <strong>${escapeHTML(maestroObj?.nombre_completo || 'Docente 1')}</strong> (${escapeHTML(clase.nombre)}) y <strong>${escapeHTML(otraMaestroObj?.nombre_completo || 'Docente 2')}</strong> (${escapeHTML(otraClaseNombre)}).
              </p>

              <div class="row g-2 mb-2">
                <div class="col-12 col-md-6">
                  <label class="form-label-compact" style="font-size:0.75rem;">Estudiante Beneficiario *</label>
                  <select class="form-select form-select-sm" id="acuerdo-select-alumno">
                    ${alumnosIds.map((id, i) => `<option value="${id}" data-nombre="${escapeHTML(alumnosNombres[i] || 'Estudiante')}">${escapeHTML(alumnosNombres[i] || 'Estudiante')}</option>`).join('')}
                  </select>
                </div>
                <div class="col-12 col-md-6">
                  <label class="form-label-compact" style="font-size:0.75rem;">Hora de Transición / Traspaso *</label>
                  <input type="time" class="form-control form-control-sm" id="acuerdo-input-hora" value="16:15" required>
                </div>
                <div class="col-12">
                  <label class="form-label-compact" style="font-size:0.75rem;">Motivo Pedagógico</label>
                  <input type="text" class="form-control form-control-sm" id="acuerdo-input-motivo" value="Acuerdo inter-cátedra de asistencia compartida" placeholder="Justificación del acuerdo...">
                </div>
              </div>

              <div class="form-check mb-3" style="font-size:0.8rem;">
                <input class="form-check-input" type="checkbox" id="acuerdo-chk-aprobado" checked>
                <label class="form-check-label fw-semibold text-body" for="acuerdo-chk-aprobado">
                  Acuerdo validado y autorizado por ambos docentes
                </label>
              </div>

              <div class="d-flex gap-2">
                <button class="btn btn-success btn-sm px-3" data-bifurcacion="confirmar-guardar-acuerdo" data-otra-clase-id="${otraClaseId}">
                  <i class="bi bi-check-lg me-1"></i>Confirmar y Despejar Alerta
                </button>
                <button class="btn btn-outline-secondary btn-sm" data-bifurcacion="cancelar-form-acuerdo">
                  Cancelar
                </button>
              </div>
            </div>
          `
        }
        return
      }

      // 3.2 Cancelar Formulario de Acuerdo
      const btnCancelarAcuerdo = e.target.closest('[data-bifurcacion="cancelar-form-acuerdo"]')
      if (btnCancelarAcuerdo) {
        const formContainer = btnCancelarAcuerdo.closest('.form-acuerdo-container')
        if (formContainer) {
          formContainer.style.display = 'none'
          formContainer.innerHTML = ''
        }
        return
      }

      // 3.3 Confirmar y Guardar Acuerdo de Maestros
      const btnConfirmarAcuerdo = e.target.closest('[data-bifurcacion="confirmar-guardar-acuerdo"]')
      if (btnConfirmarAcuerdo) {
        const formParent = btnConfirmarAcuerdo.closest('.form-acuerdo-container')
        const selectAlumno = formParent.querySelector('#acuerdo-select-alumno')
        const inputHora = formParent.querySelector('#acuerdo-input-hora')
        const inputMotivo = formParent.querySelector('#acuerdo-input-motivo')
        const chkAprobado = formParent.querySelector('#acuerdo-chk-aprobado')

        if (!chkAprobado?.checked) {
          AppToast.warning('Debes confirmar que ambos docentes autorizaron el acuerdo.')
          return
        }

        const alumnoId = selectAlumno?.value
        const selectedOption = selectAlumno?.options[selectAlumno.selectedIndex]
        const alumnoNombre = selectedOption?.dataset.nombre || 'Estudiante'
        const horaTransicion = inputHora?.value || '16:15'
        const motivo = inputMotivo?.value.trim() || 'Acuerdo inter-cátedra de asistencia compartida'

        const otraClaseId = btnConfirmarAcuerdo.dataset.otraClaseId
        const otraClaseObj = state.clasesOriginales.find(x => x.id === otraClaseId)
        const otraMaestroObj = state.maestros.find(m => m.id === otraClaseObj?.maestro_principal_id || m.id === otraClaseObj?.maestro_id)

        try {
          AppToast.info('Registrando acuerdo de maestros...')
          await guardarAcuerdoMaestro({
            alumno_id: alumnoId,
            alumno_nombre: alumnoNombre,
            clase_origen_id: clase.id,
            clase_origen_nombre: clase.nombre,
            maestro_origen_id: clase.maestro_principal_id || clase.maestro_id,
            maestro_origen_nombre: maestroObj?.nombre_completo || 'Docente 1',
            clase_destino_id: otraClaseObj?.id,
            clase_destino_nombre: otraClaseObj?.nombre,
            maestro_destino_id: otraClaseObj?.maestro_principal_id || otraClaseObj?.maestro_id,
            maestro_destino_nombre: otraMaestroObj?.nombre_completo || 'Docente 2',
            dia: primerHorario.dia || 'Lunes',
            hora_transicion: horaTransicion,
            motivo,
          })

          AppToast.success(`Acuerdo formalizado para ${alumnoNombre}. Advertencia despejada.`)
          AppModal.close()
          await renderClasesView(state.container)
        } catch (acuerdoErr) {
          console.error(acuerdoErr)
          AppToast.error('Error al guardar el acuerdo de maestros.')
        }
        return
      }

      // 3.4 Revocar Acuerdo de Maestros
      const btnEliminarAcuerdo = e.target.closest('[data-bifurcacion="eliminar-acuerdo"]')
      if (btnEliminarAcuerdo) {
        const acuerdoId = btnEliminarAcuerdo.dataset.acuerdoId
        if (confirm('¿Deseas revocar este acuerdo de maestros? Volverá a aparecer la advertencia de solape.')) {
          eliminarAcuerdoMaestro(acuerdoId)
          AppToast.success('Acuerdo revocado.')
          AppModal.close()
          await renderClasesView(state.container)
        }
        return
      }

      // 3.5 Liberar Salón
      const btnLiberar = e.target.closest('[data-bifurcacion="liberar-salon"]')
      if (btnLiberar) {
        const otraClaseId = btnLiberar.dataset.claseId
        if (confirm('¿Desvincular el salón de la otra clase para que lo use exclusivamente esta?')) {
          try {
            await supabase.from('clases').update({ salon_id: null, salon: null }).eq('id', otraClaseId)
            await supabase.from('clase_horarios').update({ salon_id: null }).eq('clase_id', otraClaseId)
            AppToast.success('Salón liberado exitosamente.')
            AppModal.close()
            await renderClasesView(state.container)
          } catch (err) {
            console.error(err)
            AppToast.error('No se pudo liberar el salón.')
          }
        }
        return
      }

      // 3.6 Desinscribir Solapados de otra clase
      const btnDesinscribir = e.target.closest('[data-bifurcacion="desinscribir-solapados"]')
      if (btnDesinscribir) {
        const otraClaseId = btnDesinscribir.dataset.claseId
        const alumnosIds = (btnDesinscribir.dataset.alumnos || '').split(',').filter(Boolean)
        if (confirm(`¿Dar de baja a ${alumnosIds.length} alumno(s) de la otra clase para evitar el solape?`)) {
          try {
            AppToast.info('Desinscribiendo alumnos de la otra clase...')
            const { data: inscritos } = await supabase.from('alumnos_clases').select('id, alumno_id').eq('clase_id', otraClaseId)
            for (const ins of inscritos || []) {
              if (alumnosIds.includes(ins.alumno_id)) {
                await desinscribirAlumno(ins.id)
              }
            }
            AppToast.success('Alumnos desinscritos de la otra clase.')
            AppModal.close()
            await renderClasesView(state.container)
          } catch (err) {
            console.error(err)
            AppToast.error('Error al desinscribir alumnos.')
          }
        }
        return
      }

      const btnEditarEsta = e.target.closest('[data-bifurcacion="editar-horario-esta"]')
      if (btnEditarEsta) {
        AppModal.close()
        openClaseModal(clase, {
          onSuccess: () => renderClasesView(state.container),
          onSaved: () => renderClasesView(state.container),
          maestros: state.maestros,
          salones: state.salones,
          programas: state.programas,
          alumnos: state.alumnosDisponibles,
        })
        return
      }

      const btnAceptarSolape = e.target.closest('[data-bifurcacion="aceptar-solape-pedagogico"]')
      if (btnAceptarSolape) {
        try {
          await supabase
            .from('clases')
            .update({
              necesita_revision: false,
              revision_motivo: 'Solape pedagógico validado (Ensayo conjunto).',
            })
            .eq('id', clase.id)

          AppToast.success('Solape aceptado como excepción pedagógica.')
          AppModal.close()
          await renderClasesView(state.container)
        } catch (err) {
          console.error(err)
          AppToast.error('Error al registrar la excepción.')
        }
        return
      }

      const btnLimpiarDup = e.target.closest('[data-bifurcacion="limpiar-duplicados"]')
      if (btnLimpiarDup) {
        try {
          AppToast.info('Limpiando inscripciones duplicadas...')
          const { data: inscripciones } = await supabase
            .from('alumnos_clases')
            .select('id, alumno_id')
            .eq('clase_id', clase.id)

          const unicos = new Set()
          for (const ins of inscripciones || []) {
            if (unicos.has(ins.alumno_id)) {
              await desinscribirAlumno(ins.id)
            } else {
              unicos.add(ins.alumno_id)
            }
          }

          AppToast.success('Inscripciones duplicadas eliminadas.')
          AppModal.close()
          await renderClasesView(state.container)
        } catch (err) {
          console.error(err)
          AppToast.error('Error al depurar duplicados.')
        }
        return
      }
    })
  }, 100)
}

/**
 * Modal interactivo y guiado para consultar y asignar alumnos sin clase (Paso 1 → Paso 2 → Paso 3)
 */
function _mostrarModalAlumnosSinClase() {
  const getSinClaseList = () => {
    const inscritosGeneralSet = new Set()
    state.clasesOriginales.forEach(c => {
      (c.alumnos_ids || []).forEach(aid => inscritosGeneralSet.add(aid))
    })
    return state.alumnosDisponibles.filter(a => !inscritosGeneralSet.has(a.id))
  }

  let selectedAlumno = null
  let selectedClase = null
  const modalContainerId = 'modal-sin-clase-wizard'

  const _renderStep1 = () => {
    const sinClaseList = getSinClaseList()
    return `
      <div id="step-1-alumnos" class="h-100 d-flex flex-column">
        <div class="d-flex justify-content-between align-items-center mb-3 pb-2 border-bottom flex-wrap gap-2 flex-shrink-0">
          <div>
            <h6 class="fw-bold mb-0 text-body d-flex align-items-center gap-2">
              <i class="bi bi-person-x-fill text-warning fs-5"></i>
              <span>Padrón de Alumnos Sin Clase Asignada</span>
            </h6>
            <small class="text-muted">Hay <strong>${sinClaseList.length}</strong> alumnos activos que no están asignados a ningún horario</small>
          </div>

          <div class="input-group input-group-sm rounded-3 shadow-xs overflow-hidden" style="max-width: 320px;">
            <span class="input-group-text bg-body-tertiary border-end-0 py-1.5"><i class="bi bi-search text-muted"></i></span>
            <input type="text" class="form-control border-start-0 py-1.5 fw-medium" id="inputBuscarSinClase" placeholder="Filtrar por nombre o instrumento..." style="font-size:0.82rem;">
          </div>
        </div>

        <div class="overflow-auto flex-grow-1 pe-1" style="max-height: calc(92vh - 200px);" id="listaAlumnosSinClaseContainer">
          ${sinClaseList.length === 0 ? `
            <div class="p-5 text-center text-muted bg-body-tertiary rounded-4 border my-auto">
              <i class="bi bi-check-circle-fill text-success fs-1 d-block mb-3"></i>
              <h5 class="fw-bold text-body">¡Excelente trabajo!</h5>
              <p class="mb-0">Todos los alumnos del padrón tienen al menos una clase asignada.</p>
            </div>
          ` : `
            <div class="row g-2.5" id="gridSinClaseItems">
              ${sinClaseList.map(a => `
                <div class="col-12 col-md-6 col-xl-4 item-sin-clase-card" data-nombre="${normalizeStr(a.nombre_completo)}" data-instrumento="${normalizeStr(a.instrumento_principal)}">
                  <div class="p-3 rounded-3 border bg-body d-flex justify-content-between align-items-center shadow-xs h-100 hover-shadow transition-all">
                    <div class="d-flex align-items-center gap-2.5 text-truncate me-2">
                      <div class="p-2.5 rounded-circle bg-warning-subtle text-warning-emphasis flex-shrink-0">
                        <i class="bi bi-person-fill fs-5"></i>
                      </div>
                      <div class="text-truncate">
                        <strong class="text-body d-block text-truncate" style="font-size:0.88rem;">${escapeHTML(a.nombre_completo)}</strong>
                        <small class="text-muted d-block text-truncate" style="font-size:0.78rem;">
                          <i class="bi ${getInstrumentoIcon(a.instrumento_principal)} me-1 text-primary"></i>${escapeHTML(a.instrumento_principal || 'Sin instrumento')}
                          ${a.telefono ? `· 📞 ${escapeHTML(a.telefono)}` : ''}
                        </small>
                      </div>
                    </div>
                    
                    <button class="btn btn-sm btn-outline-primary d-inline-flex align-items-center gap-1.5 px-3 py-1.5 rounded-3 fw-semibold shadow-xs flex-shrink-0 btn-elegir-alumno-inscribir" data-alumno-id="${a.id}" data-alumno-nombre="${escapeHTML(a.nombre_completo)}" data-instrumento="${escapeHTML(a.instrumento_principal || '')}" style="font-size:0.8rem;" title="Inscribir este alumno a una clase">
                      <i class="bi bi-plus-circle-fill"></i>
                      <span>Inscribir</span>
                    </button>
                  </div>
                </div>
              `).join('')}
            </div>
          `}
        </div>
      </div>
    `
  }

  const _renderStep2 = () => {
    const clases = state.clasesOriginales || []
    return `
      <div id="step-2-clases" class="h-100 d-flex flex-column">
        <div class="d-flex justify-content-between align-items-center mb-2.5 pb-2 border-bottom flex-wrap gap-2 flex-shrink-0">
          <button type="button" class="btn btn-sm btn-outline-secondary d-inline-flex align-items-center gap-1.5 px-3 py-1.5 rounded-3 shadow-xs" id="btnVolverStep1" style="font-size:0.8rem;">
            <i class="bi bi-arrow-left"></i>
            <span>Volver a Alumnos Sin Clase</span>
          </button>

          <div class="input-group input-group-sm rounded-3 shadow-xs overflow-hidden" style="max-width: 320px;">
            <span class="input-group-text bg-body-tertiary border-end-0 py-1.5"><i class="bi bi-search text-muted"></i></span>
            <input type="text" class="form-control border-start-0 py-1.5 fw-medium" id="inputBuscarClaseDestino" placeholder="Buscar clase, horario, docente..." style="font-size:0.82rem;">
          </div>
        </div>

        <div class="p-3 rounded-3 bg-primary-subtle bg-opacity-40 border border-primary-subtle d-flex align-items-center gap-3 mb-3 shadow-xs flex-shrink-0">
          <div class="p-2.5 rounded-circle bg-primary text-white">
            <i class="bi bi-person-fill fs-5"></i>
          </div>
          <div>
            <span class="small text-muted d-block" style="font-size:0.75rem;">Alumno seleccionado para incorporar:</span>
            <strong class="text-body" style="font-size:0.95rem;">${escapeHTML(selectedAlumno.nombre_completo)}</strong>
            <span class="badge bg-primary-subtle text-primary border border-primary-subtle ms-2" style="font-size:0.75rem;">
              <i class="bi ${getInstrumentoIcon(selectedAlumno.instrumento)} me-1"></i>${escapeHTML(selectedAlumno.instrumento || 'General')}
            </span>
          </div>
        </div>

        <div class="small fw-bold text-muted text-uppercase mb-2 flex-shrink-0" style="font-size:0.75rem;">Elegí la clase de destino donde querés incorporarlo:</div>

        <div class="table-responsive rounded-3 border bg-body shadow-xs overflow-auto flex-grow-1" style="max-height: calc(92vh - 270px);">
          <table class="table table-hover align-middle mb-0" style="font-size:0.84rem;">
            <thead class="table-light sticky-top">
              <tr>
                <th style="font-size:0.78rem;">Clase & Cátedra</th>
                <th style="font-size:0.78rem;">Docente</th>
                <th style="font-size:0.78rem;">Horario & Salón</th>
                <th style="font-size:0.78rem;" class="text-center">Capacidad</th>
                <th style="font-size:0.78rem;" class="text-end pe-3">Acción</th>
              </tr>
            </thead>
            <tbody id="tbodyClasesDestino">
              ${clases.map(c => {
                const totalAlumnos = c.total_alumnos || (c.alumnos_ids || []).length || 0
                const capacidad = c.capacidad_maxima || 20
                const primerHorario = (c.horarios || c.clase_horarios || [])[0] || {}
                const diaTexto = primerHorario.dia || primerHorario.dia_semana || 'Por definir'
                const horaTexto = primerHorario.hora_inicio 
                  ? `${String(primerHorario.hora_inicio).slice(0, 5)} - ${String(primerHorario.hora_fin || '').slice(0, 5)}`
                  : (c.hora_inicio ? `${String(c.hora_inicio).slice(0, 5)} - ${String(c.hora_fin || '').slice(0, 5)}` : 'Flexible')
                const salonTexto = c.salon || primerHorario.salones?.nombre || primerHorario.salon_nombre || 'Sin salón'
                const maestroObj = state.maestros.find(m => m.id === c.maestro_principal_id || m.id === c.maestro_id)
                const maestroNombre = c.maestro_nombre || maestroObj?.nombre_completo || 'No asignado'
                const isFull = totalAlumnos >= capacidad

                return `
                  <tr class="item-clase-destino-row" data-search="${normalizeStr(c.nombre)} ${normalizeStr(c.instrumento)} ${normalizeStr(maestroNombre)} ${normalizeStr(diaTexto)}">
                    <td>
                      <strong class="text-body d-block" style="font-size:0.9rem;">${escapeHTML(c.nombre)}</strong>
                      <span class="badge bg-secondary-subtle text-secondary border" style="font-size:0.7rem;">
                        <i class="bi ${getInstrumentoIcon(c.instrumento)} me-1"></i>${escapeHTML(c.instrumento || 'General')}
                      </span>
                    </td>
                    <td>
                      <i class="bi bi-person-badge text-info me-1"></i>
                      <span class="fw-semibold text-body">${escapeHTML(maestroNombre)}</span>
                    </td>
                    <td>
                      <div class="small"><strong>${escapeHTML(diaTexto)}</strong> · ${escapeHTML(horaTexto)}</div>
                      <small class="text-muted"><i class="bi bi-door-closed me-1"></i>${escapeHTML(salonTexto)}</small>
                    </td>
                    <td class="text-center">
                      <span class="badge ${isFull ? 'bg-danger-subtle text-danger border border-danger-subtle' : 'bg-success-subtle text-success border border-success-subtle'} rounded-pill px-2.5 py-1" style="font-size:0.78rem;">
                        ${totalAlumnos} / ${capacidad}
                      </span>
                    </td>
                    <td class="text-end pe-3">
                      <button type="button" class="btn btn-sm btn-outline-primary d-inline-flex align-items-center gap-1.5 px-3 py-1.5 rounded-3 fw-semibold shadow-xs btn-seleccionar-clase-destino" data-clase-id="${c.id}" style="font-size:0.8rem;">
                        <span>Seleccionar Clase</span>
                        <i class="bi bi-chevron-right"></i>
                      </button>
                    </td>
                  </tr>
                `
              }).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `
  }

  const _renderStep3 = async (claseId) => {
    const clase = state.clasesOriginales.find(c => c.id === claseId)
    if (!clase) return ''
    selectedClase = clase

    const { data: inscritosData } = await supabase
      .from('alumnos_clases')
      .select('id, alumno_id, activo, alumnos(*)')
      .eq('clase_id', claseId)

    const inscritos = (inscritosData || []).map(item => ({
      inscripcionId: item.id,
      alumnoId: item.alumno_id,
      nombre: item.alumnos?.nombre_completo || 'Estudiante',
      instrumento: item.alumnos?.instrumento_principal || '',
      telefono: item.alumnos?.telefono || '',
    }))

    const primerHorario = (clase.horarios || clase.clase_horarios || [])[0] || {}
    const diaTexto = primerHorario.dia || primerHorario.dia_semana || 'Por definir'
    const horaTexto = primerHorario.hora_inicio 
      ? `${String(primerHorario.hora_inicio).slice(0, 5)} - ${String(primerHorario.hora_fin || '').slice(0, 5)}`
      : 'Flexible'
    const maestroObj = state.maestros.find(m => m.id === clase.maestro_principal_id || m.id === clase.maestro_id)
    const maestroNombre = clase.maestro_nombre || maestroObj?.nombre_completo || 'No asignado'
    const isAlreadyIn = inscritos.some(i => i.alumnoId === selectedAlumno.id)

    return `
      <div id="step-3-nomina" class="h-100 d-flex flex-column">
        <div class="d-flex justify-content-between align-items-center mb-3 pb-2 border-bottom flex-wrap gap-2 flex-shrink-0">
          <button type="button" class="btn btn-sm btn-outline-secondary d-inline-flex align-items-center gap-1.5 px-3 py-1.5 rounded-3 shadow-xs" id="btnVolverStep2" style="font-size:0.8rem;">
            <i class="bi bi-arrow-left"></i>
            <span>Elegir Otra Clase</span>
          </button>

          <span class="badge bg-primary-subtle text-primary border border-primary-subtle py-1.5 px-3 rounded-pill" style="font-size:0.8rem;">
            <i class="bi bi-people-fill me-1"></i>${inscritos.length} / ${clase.capacidad_maxima || 20} alumnos inscritos
          </span>
        </div>

        <div class="row g-3 flex-grow-1 overflow-hidden">
          <!-- Columna Izquierda: Información de Clase y Acción de Incorporación -->
          <div class="col-12 col-lg-5 d-flex flex-column gap-3">
            
            <!-- Tarjeta de Clase Seleccionada -->
            <div class="p-3.5 rounded-4 bg-body-tertiary border shadow-xs">
              <div class="d-flex justify-content-between align-items-center mb-2 flex-wrap gap-1">
                <h6 class="fw-bold mb-0 text-body" style="font-size:1rem;">${escapeHTML(clase.nombre)}</h6>
                <span class="badge bg-secondary-subtle text-secondary border" style="font-size:0.72rem;">
                  <i class="bi ${getInstrumentoIcon(clase.instrumento)} me-1"></i>${escapeHTML(clase.instrumento || 'General')}
                </span>
              </div>
              
              <div class="d-flex flex-column gap-2 small text-muted mt-2" style="font-size:0.82rem;">
                <div class="d-flex align-items-center gap-2">
                  <i class="bi bi-person-badge text-info fs-5"></i>
                  <span>Docente: <strong class="text-body">${escapeHTML(maestroNombre)}</strong></span>
                </div>
                <div class="d-flex align-items-center gap-2">
                  <i class="bi bi-clock text-primary fs-5"></i>
                  <span>Horario: <strong class="text-body">${escapeHTML(diaTexto)} · ${escapeHTML(horaTexto)}</strong></span>
                </div>
                <div class="d-flex align-items-center gap-2">
                  <i class="bi bi-door-closed text-secondary fs-5"></i>
                  <span>Salón: <strong class="text-body">${escapeHTML(clase.salon || primerHorario.salon_nombre || 'Sin salón asignado')}</strong></span>
                </div>
              </div>
            </div>

            <!-- Panel de Confirmación de Inscripción -->
            <div class="p-3.5 rounded-4 bg-success-subtle bg-opacity-30 border border-success-subtle shadow-xs">
              <div class="d-flex align-items-center gap-2.5 mb-3">
                <div class="p-2.5 rounded-circle bg-success text-white">
                  <i class="bi bi-person-plus-fill fs-5"></i>
                </div>
                <div>
                  <span class="small text-muted d-block" style="font-size:0.75rem;">Alumno listo para ser asignado:</span>
                  <strong class="text-body" style="font-size:0.95rem;">${escapeHTML(selectedAlumno.nombre_completo)}</strong>
                  <span class="text-muted small d-block">Instrumento: ${escapeHTML(selectedAlumno.instrumento || 'General')}</span>
                </div>
              </div>

              <button type="button" class="btn ${isAlreadyIn ? 'btn-success disabled' : 'btn-success'} w-100 d-inline-flex align-items-center justify-content-center gap-2 py-2 rounded-3 fw-bold shadow-xs" id="btnConfirmarInscribirAqui" data-clase-id="${clase.id}" data-alumno-id="${selectedAlumno.id}" ${isAlreadyIn ? 'disabled' : ''}>
                <i class="bi ${isAlreadyIn ? 'bi-check2-circle' : 'bi-plus-circle-fill'} fs-5"></i>
                <span>${isAlreadyIn ? 'Ya está en la nómina' : '+ Agregar Aquí a Esta Clase'}</span>
              </button>
            </div>

          </div>

          <!-- Columna Derecha: Nómina Completa de Alumnos con Quitar -->
          <div class="col-12 col-lg-7 d-flex flex-column h-100">
            <div class="p-3 rounded-4 border bg-body shadow-xs d-flex flex-column h-100">
              <div class="small fw-bold text-muted text-uppercase mb-2.5 d-flex justify-content-between align-items-center pb-2 border-bottom flex-shrink-0" style="font-size:0.75rem;">
                <span class="d-flex align-items-center gap-1.5 text-body">
                  <i class="bi bi-people-fill text-primary"></i>
                  <span>Nómina Actual de la Clase (${inscritos.length})</span>
                </span>
                <span class="text-muted fw-normal">Podés dar de baja a un alumno si te equivocaste</span>
              </div>

              <div class="overflow-auto flex-grow-1 pe-1" style="max-height: calc(92vh - 280px);" id="listaNominaClaseContainer">
                ${inscritos.length === 0 ? `
                  <div class="p-5 text-center text-muted small fst-italic">No hay alumnos inscritos en esta clase todavía.</div>
                ` : `
                  <div class="d-flex flex-column gap-2">
                    ${inscritos.map(ins => `
                      <div class="p-2.5 px-3 rounded-3 border bg-body-tertiary d-flex justify-content-between align-items-center shadow-xs">
                        <div class="d-flex align-items-center gap-2.5 text-truncate me-2">
                          <i class="bi bi-person-circle text-primary fs-5"></i>
                          <div class="text-truncate">
                            <strong class="text-body small d-block text-truncate">${escapeHTML(ins.nombre)}</strong>
                            <span class="text-muted small text-truncate" style="font-size:0.75rem;">${ins.instrumento ? `${escapeHTML(ins.instrumento)}` : 'General'}</span>
                          </div>
                        </div>
                        
                        <button type="button" class="btn btn-sm btn-outline-danger py-1 px-2.5 rounded-3 shadow-xs d-inline-flex align-items-center gap-1 btn-quitar-alumno-nomina" data-inscripcion-id="${ins.inscripcionId}" data-nombre="${escapeHTML(ins.nombre)}" data-clase-id="${clase.id}" title="Quitar de esta clase">
                          <i class="bi bi-trash3-fill"></i>
                          <span>Quitar</span>
                        </button>
                      </div>
                    `).join('')}
                  </div>
                `}
              </div>
            </div>
          </div>

        </div>
      </div>
    `
  }

  const _attachStepEvents = (containerEl) => {
    // ── Paso 1: Filtro de búsqueda y selección de alumno ────────────────────
    const inputBuscarSinClase = containerEl.querySelector('#inputBuscarSinClase')
    if (inputBuscarSinClase) {
      const items = containerEl.querySelectorAll('.item-sin-clase-card')
      inputBuscarSinClase.addEventListener('input', (e) => {
        const term = normalizeStr(e.target.value)
        items.forEach(it => {
          const n = it.dataset.nombre || ''
          const inst = it.dataset.instrumento || ''
          const match = !term || n.includes(term) || inst.includes(term)
          it.classList.toggle('d-none', !match)
        })
      })
    }

    containerEl.querySelectorAll('.btn-elegir-alumno-inscribir').forEach(btn => {
      btn.addEventListener('click', () => {
        selectedAlumno = {
          id: btn.dataset.alumnoId,
          nombre_completo: btn.dataset.alumnoNombre,
          instrumento: btn.dataset.instrumento,
        }
        containerEl.innerHTML = _renderStep2()
        _attachStepEvents(containerEl)
      })
    })

    // ── Paso 2: Volver a Paso 1 o Elegir Clase Destino ──────────────────────
    const btnVolverStep1 = containerEl.querySelector('#btnVolverStep1')
    if (btnVolverStep1) {
      btnVolverStep1.addEventListener('click', () => {
        containerEl.innerHTML = _renderStep1()
        _attachStepEvents(containerEl)
      })
    }

    const inputBuscarClaseDestino = containerEl.querySelector('#inputBuscarClaseDestino')
    if (inputBuscarClaseDestino) {
      const rows = containerEl.querySelectorAll('.item-clase-destino-row')
      inputBuscarClaseDestino.addEventListener('input', (e) => {
        const term = normalizeStr(e.target.value)
        rows.forEach(r => {
          const text = r.dataset.search || ''
          r.classList.toggle('d-none', !text.includes(term))
        })
      })
    }

    containerEl.querySelectorAll('.btn-seleccionar-clase-destino').forEach(btn => {
      btn.addEventListener('click', async () => {
        const claseId = btn.dataset.claseId
        containerEl.innerHTML = `
          <div class="d-flex flex-column align-items-center justify-content-center py-5">
            <div class="spinner-border text-primary mb-2"></div>
            <span class="small text-muted fw-semibold">Cargando nómina de la clase...</span>
          </div>
        `
        containerEl.innerHTML = await _renderStep3(claseId)
        _attachStepEvents(containerEl)
      })
    })

    // ── Paso 3: Volver a Paso 2, Confirmar Agregar o Quitar ─────────────────
    const btnVolverStep2 = containerEl.querySelector('#btnVolverStep2')
    if (btnVolverStep2) {
      btnVolverStep2.addEventListener('click', () => {
        containerEl.innerHTML = _renderStep2()
        _attachStepEvents(containerEl)
      })
    }

    const btnConfirmarInscribirAqui = containerEl.querySelector('#btnConfirmarInscribirAqui')
    if (btnConfirmarInscribirAqui) {
      btnConfirmarInscribirAqui.addEventListener('click', async () => {
        const claseId = btnConfirmarInscribirAqui.dataset.claseId
        const alumnoId = btnConfirmarInscribirAqui.dataset.alumnoId
        try {
          btnConfirmarInscribirAqui.disabled = true
          btnConfirmarInscribirAqui.innerHTML = `<span class="spinner-border spinner-border-sm me-1"></span> Inscribiendo...`
          await inscribirAlumno(claseId, alumnoId)
          AppToast.success(`¡${selectedAlumno.nombre_completo} fue incorporado a la clase exitosamente!`)
          await renderClasesView(state.container)
          containerEl.innerHTML = await _renderStep3(claseId)
          _attachStepEvents(containerEl)
        } catch (err) {
          console.error(err)
          AppToast.error('No se pudo inscribir al alumno: ' + (err.message || 'Error desconocido'))
          btnConfirmarInscribirAqui.disabled = false
          btnConfirmarInscribirAqui.innerHTML = `<i class="bi bi-plus-circle-fill me-1"></i>+ Agregar Aquí`
        }
      })
    }

    containerEl.querySelectorAll('.btn-quitar-alumno-nomina').forEach(btn => {
      btn.addEventListener('click', async () => {
        const inscripcionId = btn.dataset.inscripcionId
        const nombre = btn.dataset.nombre
        const claseId = btn.dataset.claseId
        if (confirm(`¿Dar de baja a "${nombre}" de esta clase?`)) {
          try {
            await desinscribirAlumno(inscripcionId)
            AppToast.success(`Alumno "${nombre}" removido de la clase.`)
            await renderClasesView(state.container)
            containerEl.innerHTML = await _renderStep3(claseId)
            _attachStepEvents(containerEl)
          } catch (err) {
            console.error(err)
            AppToast.error('Error al remover alumno.')
          }
        }
      })
    })
  }

  AppModal.open({
    title: `Gestión de Alumnos Sin Clase Asignada`,
    size: 'view',
    hideSave: true,
    cancelText: 'Cerrar',
    body: `<div id="${modalContainerId}">${_renderStep1()}</div>`,
  })

  setTimeout(() => {
    const containerEl = document.getElementById(modalContainerId)
    if (containerEl) _attachStepEvents(containerEl)
  }, 100)
}

/**
 * Modal pedagógico e informativo sobre el desglose de métricas académicas
 */
function _mostrarModalExplicacionMetricas() {
  const totalClases = state.clasesOriginales.length
  const totalActivas = state.clasesOriginales.filter(c => c.activo !== false && c.estado !== 'inactiva').length
  const totalMatriculas = state.clasesOriginales.reduce((s, c) => s + (c.total_alumnos || (c.alumnos_ids || []).length || 0), 0)
  const totalCapacidad = state.clasesOriginales.reduce((s, c) => s + (c.capacidad_maxima || 20), 0)
  const pctOcupacionGlobal = totalCapacidad > 0 ? Math.round((totalMatriculas / totalCapacidad) * 100) : 0
  
  const inscritosGeneralSet = new Set()
  state.clasesOriginales.forEach(c => {
    (c.alumnos_ids || []).forEach(aid => inscritosGeneralSet.add(aid))
  })
  const totalAlumnosPadron = state.alumnosDisponibles.length
  const totalAlumnosUnicos = inscritosGeneralSet.size
  const alumnosSinClaseCount = totalAlumnosPadron - totalAlumnosUnicos
  const promedioMaterias = totalAlumnosUnicos > 0 ? (totalMatriculas / totalAlumnosUnicos).toFixed(1) : '0.0'

  const modalHtml = `
    <div class="container-fluid p-0">
      <div class="alert alert-info d-flex align-items-center gap-3 p-3 rounded-3 shadow-xs mb-3">
        <i class="bi bi-info-circle-fill fs-3 text-info"></i>
        <div>
          <strong class="d-block text-body mb-0.5">Guía de Indicadores de Gestión Académica</strong>
          <span class="small text-muted">Explicación técnica de cómo se calculan los alumnos, las matrículas y la capacidad de la academia.</span>
        </div>
      </div>

      <div class="row g-3">
        <!-- 1. Alumnos Asignados vs Padrón -->
        <div class="col-12 col-md-6">
          <div class="p-3 rounded-3 border bg-body h-100 shadow-xs">
            <div class="d-flex align-items-center gap-2 mb-2">
              <div class="p-2 rounded-circle bg-success-subtle text-success">
                <i class="bi bi-people-fill fs-5"></i>
              </div>
              <div>
                <h6 class="fw-bold mb-0 text-body">Alumnos Asignados</h6>
                <small class="text-success fw-semibold">${totalAlumnosUnicos} de ${totalAlumnosPadron} Alumnos Únicos</small>
              </div>
            </div>
            <p class="small text-muted mb-2">
              Representa la cantidad de <strong>personas físicas individuales</strong> que ya tienen al menos una clase asignada en el sistema.
            </p>
            <div class="p-2 rounded-2 bg-body-tertiary small border">
              <strong>¿Para qué sirve?</strong> Permite evidenciar que actualmente faltan <strong>${alumnosSinClaseCount} alumnos</strong> por ser vinculados a un horario o cátedra.
            </div>
          </div>
        </div>

        <!-- 2. Matrículas Totales (Carga Pedagógica) -->
        <div class="col-12 col-md-6">
          <div class="p-3 rounded-3 border bg-body h-100 shadow-xs">
            <div class="d-flex align-items-center gap-2 mb-2">
              <div class="p-2 rounded-circle bg-secondary-subtle text-secondary-emphasis">
                <i class="bi bi-journal-check fs-5"></i>
              </div>
              <div>
                <h6 class="fw-bold mb-0 text-body">Matrículas Totales</h6>
                <small class="text-secondary-emphasis fw-semibold">${totalMatriculas} Plazas / Cupos Ocupados</small>
              </div>
            </div>
            <p class="small text-muted mb-2">
              Es la <strong>suma acumulada de asientos ocupados</strong> en todas las clases. Cada vez que un alumno se inscribe en una materia, genera 1 matrícula.
            </p>
            <div class="p-2 rounded-2 bg-body-tertiary small border">
              <strong>¿Por qué difiere de los alumnos?</strong> Porque un estudiante cursa en promedio <strong>${promedioMaterias} materias</strong> (ej: <em>Violín + Orquesta + Solfeo</em>). Esta métrica dimensiona la carga de trabajo docente.
            </div>
          </div>
        </div>

        <!-- 3. Clases Activas -->
        <div class="col-12 col-md-6">
          <div class="p-3 rounded-3 border bg-body h-100 shadow-xs">
            <div class="d-flex align-items-center gap-2 mb-2">
              <div class="p-2 rounded-circle bg-primary-subtle text-primary">
                <i class="bi bi-easel2-fill fs-5"></i>
              </div>
              <div>
                <h6 class="fw-bold mb-0 text-body">Clases Activas</h6>
                <small class="text-primary fw-semibold">${totalActivas} activas de ${totalClases} registradas</small>
              </div>
            </div>
            <p class="small text-muted mb-0">
              Total de grupos, ensambles y cátedras individuales que se encuentran en estado operativo durante este período académico.
            </p>
          </div>
        </div>

        <!-- 4. Ocupación Global -->
        <div class="col-12 col-md-6">
          <div class="p-3 rounded-3 border bg-body h-100 shadow-xs">
            <div class="d-flex align-items-center gap-2 mb-2">
              <div class="p-2 rounded-circle bg-info-subtle text-info-emphasis">
                <i class="bi bi-pie-chart-fill fs-5"></i>
              </div>
              <div>
                <h6 class="fw-bold mb-0 text-body">Ocupación Global</h6>
                <small class="text-info-emphasis fw-semibold">${pctOcupacionGlobal}% de la Capacidad Instalada</small>
              </div>
            </div>
            <p class="small text-muted mb-0">
              Mide la relación entre las <strong>${totalMatriculas} matrículas</strong> y los <strong>${totalCapacidad} cupos máximos</strong> disponibles en todos los salones y horarios.
            </p>
          </div>
        </div>
      </div>
    </div>
  `

  AppModal.open({
    title: 'Explicación de Métricas & Indicadores Académicos',
    size: 'lg',
    hideSave: true,
    cancelText: 'Entendido',
    body: modalHtml,
  })
}

/**
 * Modal de Nómina e Inscripciones de Alumnos en tiempo real (Vista Inmersiva 95%)
 */
async function _mostrarModalNominaClase(claseId) {
  const clase = state.clasesOriginales.find(c => c.id === claseId)
  if (!clase) return

  AppToast.info('Cargando nómina de la clase...')

  try {
    const { data: inscritosData, error } = await supabase
      .from('alumnos_clases')
      .select('id, alumno_id, activo, alumnos(*)')
      .eq('clase_id', claseId)
      .eq('activo', true)

    if (error) throw error

    let inscritos = (inscritosData || []).map(row => {
      const a = row.alumnos || {}
      return {
        inscripcionId: row.id,
        alumnoId: a.id || row.alumno_id,
        nombre: a.nombre_completo || `${a.nombre || ''} ${a.apellido || ''}`.trim() || 'Estudiante',
        instrumento: a.instrumento_principal || '—',
        codigo: a.codigo_alumno || a.codigo || '—',
        nivel: a.nivel || 'inicial',
      }
    })

    const capacidad = clase.capacidad_maxima || 20
    const pctOcupacion = Math.min(100, Math.round((inscritos.length / capacidad) * 100))
    const maestroObj = state.maestros.find(m => m.id === clase.maestro_principal_id || m.id === clase.maestro_id)
    const primerHorario = (clase.horarios || clase.clase_horarios || [])[0] || {}

    const modalHtml = `
      <div class="container-fluid p-0">
        <div class="row g-3">
          
          <!-- PANEL IZQUIERDO: Ficha Resumen & Herramienta de Inscripción (35%) -->
          <div class="col-12 col-lg-4">
            <div class="card border-0 shadow-sm rounded-4 p-3 bg-body h-100 border border-body-tertiary d-flex flex-column justify-content-between">
              
              <div>
                <!-- Header de Clase -->
                <div class="d-flex align-items-center gap-2 pb-2 mb-3 border-bottom">
                  <div class="p-2 rounded-3 bg-primary-subtle text-primary">
                    <i class="bi ${getInstrumentoIcon(clase.instrumento)} fs-4"></i>
                  </div>
                  <div>
                    <h6 class="fw-bold mb-0 text-body">${escapeHTML(clase.nombre)}</h6>
                    <span class="badge bg-secondary-subtle text-secondary border" style="font-size:0.68rem;">${escapeHTML(clase.instrumento || 'General')}</span>
                  </div>
                </div>

                <!-- Datos Operativos -->
                <div class="d-flex flex-column gap-2 mb-3 small text-muted">
                  <div><i class="bi bi-person-badge text-info me-2"></i>Docente: <strong>${escapeHTML(maestroObj?.nombre_completo || 'No asignado')}</strong></div>
                  <div><i class="bi bi-clock text-primary me-2"></i>Horario: <strong>${escapeHTML(primerHorario.dia || 'Por definir')} ${primerHorario.hora_inicio ? String(primerHorario.hora_inicio).slice(0, 5) + ' - ' + String(primerHorario.hora_fin || '').slice(0, 5) : ''}</strong></div>
                  <div><i class="bi bi-door-closed text-secondary me-2"></i>Salón: <strong>${escapeHTML(clase.salon || primerHorario.salon_nombre || 'Por asignar')}</strong></div>
                </div>

                <!-- Capacidad y Ocupación -->
                <div class="p-3 rounded-3 bg-body-tertiary border mb-3">
                  <div class="d-flex justify-content-between align-items-center mb-1">
                    <span class="small fw-bold text-muted text-uppercase" style="font-size:0.7rem;">Ocupación del Cupo</span>
                    <span class="fw-bold ${pctOcupacion >= 100 ? 'text-danger' : 'text-success'}">${pctOcupacion}%</span>
                  </div>
                  <div class="progress" style="height: 8px;">
                    <div class="progress-bar ${pctOcupacion >= 100 ? 'bg-danger' : pctOcupacion >= 85 ? 'bg-warning' : 'bg-success'}" style="width: ${pctOcupacion}%;"></div>
                  </div>
                  <div class="text-center mt-2 small text-muted" style="font-size:0.75rem;">
                    <strong>${inscritos.length}</strong> de <strong>${capacidad}</strong> cupos ocupados
                  </div>
                </div>
              </div>

              <!-- Inscribir Nuevo Alumno -->
              <div class="p-3 bg-body-tertiary rounded-3 border">
                <label class="small fw-bold text-muted text-uppercase mb-2 d-block" style="font-size:0.7rem;">
                  <i class="bi bi-person-plus-fill me-1 text-primary"></i>Inscribir Alumno Disponible
                </label>
                <div class="d-flex flex-column gap-2">
                  <select class="form-select form-select-sm" id="selectAlumnoParaInscribir">
                    <option value="">Seleccionar del padrón...</option>
                    ${state.alumnosDisponibles
                      .filter(a => !inscritos.some(i => i.alumnoId === a.id))
                      .map(a => `<option value="${a.id}">${escapeHTML(a.nombre_completo || 'Estudiante')} (${escapeHTML(a.instrumento_principal || 'General')})</option>`)
                      .join('')}
                  </select>
                  <button class="btn btn-primary btn-sm w-100" id="btnConfirmarInscripcion">
                    <i class="bi bi-plus-lg me-1"></i>Inscribir a la Clase
                  </button>
                </div>
              </div>

            </div>
          </div>

          <!-- PANEL DERECHO: Lista Oficial de Estudiantes Inscritos (65%) -->
          <div class="col-12 col-lg-8">
            <div class="card border-0 shadow-sm rounded-4 p-3 bg-body h-100 border border-body-tertiary d-flex flex-column">
              
              <!-- Toolbar Superior de la Nómina -->
              <div class="d-flex justify-content-between align-items-center pb-2 mb-3 border-bottom gap-2 flex-wrap">
                <div class="d-flex align-items-center gap-2">
                  <h6 class="fw-bold mb-0 text-body">Estudiantes Inscritos</h6>
                  <span class="badge bg-primary text-white rounded-pill px-2" id="badgeTotalInscritosModal">${inscritos.length}</span>
                </div>
                
                <div class="d-flex align-items-center gap-2">
                  <div class="input-group input-group-sm" style="max-width: 220px;">
                    <span class="input-group-text bg-transparent"><i class="bi bi-search text-muted"></i></span>
                    <input type="text" class="form-control" id="inputBuscarInscritoModal" placeholder="Buscar estudiante...">
                  </div>
                  <button class="btn btn-outline-secondary btn-sm" id="btnPdfNominaModal" title="Descargar Planilla Oficial PDF">
                    <i class="bi bi-file-earmark-pdf me-1"></i>PDF
                  </button>
                </div>
              </div>

              <!-- Lista / Grid de Estudiantes con Scroll Independiente -->
              <div class="flex-grow-1 overflow-auto pe-1" style="max-height: calc(92vh - 220px);" id="listaInscritosContainer">
                ${inscritos.length > 0 ? `
                  <div class="d-flex flex-column gap-2" id="itemsInscritosList">
                    ${inscritos.map((al, idx) => `
                      <div class="d-flex justify-content-between align-items-center p-2.5 rounded-3 bg-body-tertiary border item-alumno-inscrito" data-nombre="${normalizeStr(al.nombre)}" data-codigo="${normalizeStr(al.codigo)}">
                        <div class="d-flex align-items-center gap-3">
                          <span class="badge rounded-circle bg-secondary-subtle text-secondary fw-bold" style="width:24px; height:24px; display:inline-flex; align-items:center; justify-content:center; font-size:0.75rem;">${idx + 1}</span>
                          <div>
                            <div class="fw-bold text-body" style="font-size:0.88rem;">${escapeHTML(al.nombre)}</div>
                            <div class="d-flex align-items-center gap-2 small text-muted" style="font-size:0.72rem;">
                              <span><i class="bi bi-qr-code me-1"></i>${escapeHTML(al.codigo)}</span>
                              <span>•</span>
                              <span><i class="bi bi-music-note me-1"></i>${escapeHTML(al.instrumento)}</span>
                              <span>•</span>
                              <span class="badge bg-secondary-subtle text-secondary py-0 px-1.5" style="font-size:0.65rem;">Nivel ${escapeHTML(al.nivel)}</span>
                            </div>
                          </div>
                        </div>
                        <button class="btn btn-outline-danger btn-sm py-1 px-2.5" data-action="desinscribir-alumno" data-id="${al.inscripcionId}" data-nombre="${escapeHTML(al.nombre)}" title="Dar de baja a este estudiante">
                          <i class="bi bi-person-x me-1"></i>Dar de baja
                        </button>
                      </div>
                    `).join('')}
                  </div>
                ` : `
                  <div class="text-center py-5 text-muted">
                    <i class="bi bi-people fs-1 d-block mb-2 opacity-50"></i>
                    <h6 class="fw-bold">No hay alumnos inscritos</h6>
                    <p class="small text-muted">Utilizá el panel izquierdo para seleccionar y asignar alumnos a esta clase.</p>
                  </div>
                `}
              </div>

            </div>
          </div>

        </div>
      </div>
    `

    AppModal.open({
      title: `Nómina Oficial · ${escapeHTML(clase.nombre)}`,
      size: 'view',
      hideSave: true,
      cancelText: 'Cerrar',
      body: modalHtml,
    })

    // Eventos interactivos
    setTimeout(() => {
      // 1. Buscador dentro de los inscritos
      document.getElementById('inputBuscarInscritoModal')?.addEventListener('input', (e) => {
        const val = normalizeStr(e.target.value)
        document.querySelectorAll('.item-alumno-inscrito').forEach(el => {
          const match = el.dataset.nombre.includes(val) || el.dataset.codigo.includes(val)
          el.style.display = match ? 'flex' : 'none'
        })
      })

      // 2. Descargar PDF desde el modal
      document.getElementById('btnPdfNominaModal')?.addEventListener('click', async () => {
        AppToast.info(`Generando planilla PDF de ${clase.nombre}...`)
        try {
          await descargarPdfClase(clase)
          AppToast.success('PDF descargado con éxito.')
        } catch (err) {
          console.error(err)
          AppToast.error('Error generando PDF.')
        }
      })

      // 3. Inscribir Alumno
      document.getElementById('btnConfirmarInscripcion')?.addEventListener('click', async () => {
        const select = document.getElementById('selectAlumnoParaInscribir')
        const alumnoId = select?.value
        if (!alumnoId) {
          AppToast.warning('Seleccioná un alumno para inscribir.')
          return
        }

        try {
          AppToast.info('Inscribiendo alumno...')
          await inscribirAlumno(claseId, alumnoId)
          AppToast.success('Alumno inscrito exitosamente.')
          AppModal.close()
          await renderClasesView(state.container)
          _mostrarModalNominaClase(claseId)
        } catch (err) {
          console.error(err)
          AppToast.error('No se pudo inscribir al alumno.')
        }
      })

      // 4. Desinscribir Alumno
      document.getElementById('listaInscritosContainer')?.addEventListener('click', async (e) => {
        const btn = e.target.closest('[data-action="desinscribir-alumno"]')
        if (!btn) return

        const inscripcionId = btn.dataset.id
        const nombre = btn.dataset.nombre
        if (confirm(`¿Dar de baja a "${nombre}" de esta clase?`)) {
          try {
            await desinscribirAlumno(inscripcionId)
            AppToast.success(`Alumno ${nombre} dado de baja de la clase.`)
            AppModal.close()
            await renderClasesView(state.container)
            _mostrarModalNominaClase(claseId)
          } catch (err) {
            console.error(err)
            AppToast.error('Error al dar de baja al alumno.')
          }
        }
      })
    }, 100)

  } catch (err) {
    console.error(err)
    AppToast.error('Error cargando nómina de alumnos.')
  }
}

function attachEvents(container) {
  // 1. Toggle Filtros Desplegables
  container.querySelector('#btnToggleFiltrosClases')?.addEventListener('click', () => {
    state.filtrosAbiertos = !state.filtrosAbiertos
    renderContent(container)
    attachEvents(container)
  })

  // 1.1 Badge de filtro de advertencias en cabecera
  container.querySelector('#badgeFiltroConflictosHeader')?.addEventListener('click', (e) => {
    e.stopPropagation()
    state.filtroConflictos = state.filtroConflictos === 'con-conflictos' ? 'todos' : 'con-conflictos'
    state.filtrosAbiertos = true
    renderContent(container)
    attachEvents(container)
  })

  // 1.2 Abrir Guía de Explicación de Métricas
  container.querySelectorAll('.btn-info-metrica').forEach(badge => {
    badge.addEventListener('click', () => {
      _mostrarModalExplicacionMetricas()
    })
  })

  // 2. Filtro por Píldoras de Familia
  container.querySelectorAll('.family-pill-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      state.filtroFamilia = btn.dataset.familia
      renderContent(container)
      attachEvents(container)
    })
  })

  // 3. Buscador
  const searchInput = container.querySelector('#inputBuscarClases')
  searchInput?.addEventListener('input', (e) => {
    state.searchQuery = e.target.value
    renderContent(container)
    attachEvents(container)
  })

  // 4. Selects de Filtros
  container.querySelector('#selectCatedraClase')?.addEventListener('change', (e) => {
    state.filtroCatedra = e.target.value
    renderContent(container)
    attachEvents(container)
  })

  container.querySelector('#selectMaestroClase')?.addEventListener('change', (e) => {
    state.filtroMaestro = e.target.value
    renderContent(container)
    attachEvents(container)
  })

  container.querySelector('#selectSalonClase')?.addEventListener('change', (e) => {
    state.filtroSalon = e.target.value
    renderContent(container)
    attachEvents(container)
  })

  container.querySelector('#selectDiaClase')?.addEventListener('change', (e) => {
    state.filtroDia = e.target.value
    renderContent(container)
    attachEvents(container)
  })

  container.querySelector('#selectConflictosFiltro')?.addEventListener('change', (e) => {
    state.filtroConflictos = e.target.value
    renderContent(container)
    attachEvents(container)
  })

  container.querySelector('#selectOrdenarClases')?.addEventListener('change', (e) => {
    state.ordenarPor = e.target.value
    renderContent(container)
    attachEvents(container)
  })

  // 4b. Botón Alumnos Sin Clase
  container.querySelector('#btnAlumnosSinClase')?.addEventListener('click', () => {
    _mostrarModalAlumnosSinClase()
  })

  // 5. Botones Crear Nueva Clase
  const abrirModalCrear = () => {
    openClaseModal(null, {
      onSuccess: () => renderClasesView(state.container),
      onSaved: () => renderClasesView(state.container),
      maestros: state.maestros,
      salones: state.salones,
      programas: state.programas,
      alumnos: state.alumnosDisponibles,
    })
  }

  container.querySelector('#btnNuevaClase')?.addEventListener('click', abrirModalCrear)
  container.querySelector('#btnCrearClaseEmpty')?.addEventListener('click', abrirModalCrear)

  // 6. Botón Descargar PDF Listados Generales
  container.querySelector('#btnPdfListadosClases')?.addEventListener('click', async () => {
    AppToast.info('Generando planilla general de clases en PDF...')
    try {
      await descargarPdfListadoAlumnosPorClases({ clases: state.clasesOriginales })
      AppToast.success('Planilla PDF generada exitosamente.')
    } catch (err) {
      console.error(err)
      AppToast.error('No se pudo generar el PDF de clases.')
    }
  })

  // 7. Delegación de Clics en Tarjetas de Clase
  container.addEventListener('click', async (e) => {
    // A. Ver Nómina
    const btnNomina = e.target.closest('[data-action="ver-nomina"]')
    if (btnNomina) {
      _mostrarModalNominaClase(btnNomina.dataset.id)
      return
    }

    // B. Resolver Conflicto
    const btnResolver = e.target.closest('[data-action="resolver-conflicto"]')
    if (btnResolver) {
      _mostrarModalResolucionConflictos(btnResolver.dataset.id)
      return
    }

    // C. PDF Individual de Clase
    const btnPdf = e.target.closest('[data-action="pdf-clase"]')
    if (btnPdf) {
      const c = state.clasesOriginales.find(x => x.id === btnPdf.dataset.id)
      if (c) {
        AppToast.info(`Generando PDF de ${c.nombre}...`)
        try {
          await descargarPdfClase(c)
          AppToast.success('PDF generado con éxito.')
        } catch (err) {
          console.error(err)
          AppToast.error('Error generando PDF de la clase.')
        }
      }
      return
    }

    // D. Editar Clase
    const btnEditar = e.target.closest('[data-action="editar-clase"]')
    if (btnEditar) {
      const c = state.clasesOriginales.find(x => x.id === btnEditar.dataset.id)
      if (c) {
        openClaseModal(c, {
          onSuccess: () => renderClasesView(state.container),
          onSaved: () => renderClasesView(state.container),
          maestros: state.maestros,
          salones: state.salones,
          programas: state.programas,
          alumnos: state.alumnosDisponibles,
        })
      }
      return
    }

    // E. Eliminar Clase
    const btnEliminar = e.target.closest('[data-action="eliminar-clase"]')
    if (btnEliminar) {
      const claseId = btnEliminar.dataset.id
      const nombre = btnEliminar.dataset.nombre
      if (confirm(`¿Estás seguro de eliminar la clase "${nombre}"? Esta acción no se puede deshacer.`)) {
        try {
          await eliminarClase(claseId)
          AppToast.success(`Clase "${nombre}" eliminada exitosamente.`)
          await renderClasesView(state.container)
        } catch (err) {
          console.error(err)
          AppToast.error('No se pudo eliminar la clase.')
        }
      }
      return
    }
  })
}
