/**
 * asistenciasView.js — Control de Asistencia y Evaluación Didáctica.
 *
 * Características:
 * 1. Layout de 2 Columnas en Escritorio:
 *    - Columna Izquierda: Calendario Mensual Interactivo.
 *    - Columna Derecha: Panel de Clases del Día Seleccionado con nóminas y justificaciones.
 * 2. Filtros Desplegables y Contraíbles para máximo aprovechamiento del espacio vertical.
 * 3. Modo Calendario Exclusivo (sin sobrecarga de vistas redundantes).
 * 4. Píldoras de resumen inline (P / J / A / % Asistencia).
 * 5. Modal de Justificación interactiva con comprobantes.
 */

import '../styles/asistencias.css'
import { AppToast } from '../../../shared/components/AppToast.js'
import { AppModal } from '../../../shared/components/AppModal.js'
import {
  getPeriodos,
  getPeriodoActivo,
  getClases,
  getReporteConsolidado,
  getDetalleSesion,
  ESTADO_LABEL,
} from '../api/asistenciasApi.js'
import { openEvaluacionEstrellasModal } from '../../planificacion/components/EvaluacionEstrellasModal.js'
import { escapeHTML } from '../../clases/utils/clasesUtils.js'
import { descargarPdfResumenMensual } from '../../admin-dashboard/services/academicReportsPdfService.js'

const state = {
  timeline: [],
  periodos: [],
  periodoActivo: null,
  clases: [],
  maestros: [],
  catedras: [],
  resumenGlobal: null,
  cargando: false,
  filtrosAbiertos: false,
  filtroPeriodo: null,
  filtroCatedra: 'todas',
  filtroClase: 'todas',
  filtroMaestro: 'todos',
  searchQuery: '',
  calendarYear: new Date().getFullYear(),
  calendarMonth: new Date().getMonth(), // 0-indexed
  selectedFecha: new Date().toISOString().slice(0, 10),
  container: null,
}

const DIAS_HEADER = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom']
const MESES_NOMBRES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
]

/**
 * Vista de Asistencias y Control Didáctico
 */
export async function renderAsistenciasView(container) {
  if (!container) return
  try {
    state.container = container
    state.cargando = true
    renderLoading(container)

    const [periodos, periodoActivo, clases] = await Promise.all([
      getPeriodos(),
      getPeriodoActivo(),
      getClases(),
    ])

    state.periodos = periodos || []
    state.periodoActivo = periodoActivo
    state.clases = clases || []

    // Extraer cátedras e instrumentos únicos
    const catedrasSet = new Set()
    const maestrosSet = new Set()
    for (const c of state.clases) {
      if (c.instrumento) catedrasSet.add(c.instrumento.trim())
      if (c.maestro_nombre || c.maestroNombre) maestrosSet.add(c.maestro_nombre || c.maestroNombre)
    }
    state.catedras = Array.from(catedrasSet).sort()
    state.maestros = Array.from(maestrosSet).sort()

    if (periodoActivo?.id) {
      state.filtroPeriodo = periodoActivo.id
    } else if (periodos && periodos.length > 0) {
      state.filtroPeriodo = periodos[0].id
    } else {
      state.filtroPeriodo = null
    }

    await _loadData()
    renderContent(container)
    _attachEvents(container)
  } catch (error) {
    console.error('[asistenciasView] Error al inicializar:', error)
    renderError(container, error.message)
  }
}

async function _loadData() {
  try {
    const { timelineByDate, resumenGlobal } = await getReporteConsolidado({
      periodoId: state.filtroPeriodo,
    })

    state.timeline = Array.isArray(timelineByDate) ? timelineByDate : []
    state.resumenGlobal = resumenGlobal || {
      totalClases: 0,
      totalPresentes: 0,
      totalAusentes: 0,
      totalJustificados: 0,
      totalRegistros: 0,
      totalSesiones: 0,
    }

    // Si la fecha seleccionada no tiene sesiones, apuntar a la fecha más reciente con datos
    if (state.timeline.length > 0) {
      const fechasDisponibles = state.timeline.map(t => t.fecha)
      if (!fechasDisponibles.includes(state.selectedFecha)) {
        state.selectedFecha = fechasDisponibles[0]
        const d = new Date(state.selectedFecha + 'T00:00:00')
        state.calendarYear = d.getFullYear()
        state.calendarMonth = d.getMonth()
      }
    }
  } catch (err) {
    console.warn('[asistenciasView] Warning al cargar datos consolidados:', err)
    state.timeline = []
    state.resumenGlobal = {
      totalClases: 0,
      totalPresentes: 0,
      totalAusentes: 0,
      totalJustificados: 0,
      totalRegistros: 0,
      totalSesiones: 0,
    }
  }
}

function renderLoading(container) {
  container.innerHTML = `
    <div class="d-flex flex-column justify-content-center align-items-center py-5" style="min-height: 350px;">
      <div class="spinner-border text-primary mb-2" role="status"></div>
      <div class="text-muted small fw-semibold">Cargando control de asistencia...</div>
    </div>
  `
}

function renderError(container, msg) {
  container.innerHTML = `
    <div class="alert alert-danger m-3 rounded-4 shadow-sm p-3">
      <div class="d-flex align-items-center gap-3">
        <i class="bi bi-exclamation-triangle-fill fs-3"></i>
        <div>
          <h6 class="alert-heading mb-1 fw-bold">Error al cargar asistencias</h6>
          <p class="mb-2 small text-danger-emphasis">${escapeHTML(msg)}</p>
          <button class="btn btn-danger btn-sm" id="retry-btn">
            <i class="bi bi-arrow-clockwise me-1"></i>Reintentar
          </button>
        </div>
      </div>
    </div>
  `
  container.querySelector('#retry-btn')?.addEventListener('click', () => renderAsistenciasView(state.container))
}

function getFiltradosTimeline() {
  const q = state.searchQuery.toLowerCase().trim()
  const catedra = state.filtroCatedra
  const claseId = state.filtroClase
  const maestro = state.filtroMaestro

  return state.timeline
    .map((dia) => {
      const clasesFiltradas = (dia.clases || []).filter((c) => {
        // Filtro por Cátedra
        if (catedra !== 'todas' && (c.instrumento || '').toLowerCase() !== catedra.toLowerCase()) {
          return false
        }
        // Filtro por Clase
        if (claseId !== 'todas' && c.clase_id !== claseId) {
          return false
        }
        // Filtro por Maestro
        if (maestro !== 'todos' && (c.maestro_nombre || '').toLowerCase() !== maestro.toLowerCase()) {
          return false
        }
        // Filtro por Buscador
        if (q) {
          const matchClase = (c.clase_nombre || '').toLowerCase().includes(q)
          const matchMaestro = (c.maestro_nombre || '').toLowerCase().includes(q)
          const matchInst = (c.instrumento || '').toLowerCase().includes(q)
          const matchAlumno = (c.asistencias || []).some(a => (a.alumno_nombre || '').toLowerCase().includes(q))
          const matchObs = (c.observacion_sesion || c.observacion_clase || '').toLowerCase().includes(q)
          if (!matchClase && !matchMaestro && !matchInst && !matchAlumno && !matchObs) {
            return false
          }
        }
        return true
      })

      return {
        ...dia,
        clases: clasesFiltradas,
      }
    })
    .filter((dia) => dia.clases.length > 0)
}

function contarFiltrosActivos() {
  let count = 0
  if (state.filtroCatedra !== 'todas') count++
  if (state.filtroClase !== 'todas') count++
  if (state.filtroMaestro !== 'todos') count++
  if (state.searchQuery.trim().length > 0) count++
  return count
}

function renderContent(container) {
  const timelineFiltrada = getFiltradosTimeline()
  const totalRegistrosFiltrados = timelineFiltrada.reduce((sum, d) => sum + d.clases.reduce((s, c) => s + (c.total_alumnos || 0), 0), 0)
  const totalPresentesFiltrados = timelineFiltrada.reduce((sum, d) => sum + d.clases.reduce((s, c) => s + (c.presentes || 0), 0), 0)
  const totalAusentesFiltrados = timelineFiltrada.reduce((sum, d) => sum + d.clases.reduce((s, c) => s + (c.ausentes || 0), 0), 0)
  const totalJustificadosFiltrados = timelineFiltrada.reduce((sum, d) => sum + d.clases.reduce((s, c) => s + (c.justificados || 0), 0), 0)
  const tasaAsistencia = totalRegistrosFiltrados > 0 ? Math.round(((totalPresentesFiltrados + totalJustificadosFiltrados) / totalRegistrosFiltrados) * 100) : 0
  const filtrosActivosCount = contarFiltrosActivos()

  // Mapear sesiones por fecha YYYY-MM-DD para el calendario y panel derecho
  const fechasMap = new Map()
  for (const dia of timelineFiltrada) {
    fechasMap.set(dia.fecha, dia)
  }
  const diaSeleccionadoData = fechasMap.get(state.selectedFecha)

  container.innerHTML = `
    <div class="asistencias-view-container p-2 p-md-3">
      
      <!-- TOOLBAR COMPACTA PRINCIPAL -->
      <div class="card border-0 shadow-sm rounded-4 p-2 p-md-3 bg-body mb-3 border border-body-tertiary">
        
        <!-- Fila Superior: Título, Métricas Rápidas y Acciones -->
        <div class="d-flex flex-wrap justify-content-between align-items-center gap-2">
          <div class="d-flex align-items-center gap-2 flex-wrap">
            <h5 class="fw-bold mb-0 text-body d-flex align-items-center">
              <i class="bi bi-calendar-check text-primary me-2"></i>Control de Asistencia
            </h5>
            
            <!-- Badges Inline Compactos -->
            <div class="d-flex align-items-center gap-1 ms-1">
              <span class="badge bg-success-subtle text-success border border-success-subtle py-1 px-2" style="font-size:0.75rem;" title="Presentes">
                <i class="bi bi-check-circle-fill me-1"></i>${totalPresentesFiltrados} P
              </span>
              <span class="badge border py-1 px-2" style="font-size:0.75rem; background: rgba(111, 66, 193, 0.15); color: #d6bbfb; border-color: rgba(111, 66, 193, 0.3) !important;" title="Justificados">
                <i class="bi bi-file-earmark-medical-fill me-1"></i>${totalJustificadosFiltrados} J
              </span>
              <span class="badge bg-danger-subtle text-danger border border-danger-subtle py-1 px-2" style="font-size:0.75rem;" title="Ausentes">
                <i class="bi bi-x-circle-fill me-1"></i>${totalAusentesFiltrados} A
              </span>
              <span class="badge bg-primary-subtle text-primary border border-primary-subtle py-1 px-2" style="font-size:0.75rem;" title="Efectividad Global">
                ${tasaAsistencia}%
              </span>
            </div>
          </div>
          
          <div class="d-flex gap-2 align-items-center">
            <!-- Botón Desplegar/Contraer Filtros -->
            <button class="btn btn-sm ${state.filtrosAbiertos ? 'btn-primary' : 'btn-outline-secondary'} d-inline-flex align-items-center" id="btnToggleFiltros">
              <i class="bi bi-funnel me-1"></i>Filtros
              ${filtrosActivosCount > 0 ? `<span class="badge bg-warning text-dark ms-1 rounded-pill" style="font-size:0.65rem;">${filtrosActivosCount}</span>` : ''}
              <i class="bi bi-chevron-${state.filtrosAbiertos ? 'up' : 'down'} ms-1" style="font-size:0.75rem;"></i>
            </button>

            <!-- Botón PDF -->
            <button class="btn btn-sm btn-outline-danger d-inline-flex align-items-center" id="btnDescargarPdfAsistencias" title="Descargar Resumen PDF">
              <i class="bi bi-file-earmark-pdf me-1"></i>PDF
            </button>
          </div>
        </div>

        <!-- Panel de Filtros Desplegable -->
        <div class="collapse ${state.filtrosAbiertos ? 'show' : ''} pt-2 mt-2 border-top border-body-tertiary" id="panelFiltrosDesplegable">
          <div class="row g-2 align-items-center">
            
            <div class="col-12 col-sm-6 col-lg-3">
              <div class="input-group input-group-sm">
                <span class="input-group-text bg-transparent border-end-0"><i class="bi bi-search text-muted"></i></span>
                <input type="text" class="form-control border-start-0" id="inputBuscarAsistencias" placeholder="Buscar clase, docente, alumno..." value="${escapeHTML(state.searchQuery)}">
              </div>
            </div>

            <div class="col-6 col-sm-3 col-lg-2">
              <select class="form-select form-select-sm" id="selectPeriodo">
                ${state.periodos.map((p) => `<option value="${p.id}" ${p.id === state.filtroPeriodo ? 'selected' : ''}>${escapeHTML(p.nombre)} ${p.activo ? '(Activo)' : ''}</option>`).join('')}
              </select>
            </div>

            <div class="col-6 col-sm-3 col-lg-2">
              <select class="form-select form-select-sm" id="selectCatedra">
                <option value="todas" ${state.filtroCatedra === 'todas' ? 'selected' : ''}>Todas Cátedras</option>
                ${state.catedras.map(c => `<option value="${escapeHTML(c)}" ${state.filtroCatedra === c ? 'selected' : ''}>${escapeHTML(c)}</option>`).join('')}
              </select>
            </div>

            <div class="col-6 col-sm-6 col-lg-3">
              <select class="form-select form-select-sm" id="selectClase">
                <option value="todas" ${state.filtroClase === 'todas' ? 'selected' : ''}>Todas las Clases</option>
                ${state.clases.map(c => `<option value="${c.id}" ${state.filtroClase === c.id ? 'selected' : ''}>${escapeHTML(c.nombre || 'Clase')}</option>`).join('')}
              </select>
            </div>

            <div class="col-6 col-sm-6 col-lg-2">
              <select class="form-select form-select-sm" id="selectMaestro">
                <option value="todos" ${state.filtroMaestro === 'todos' ? 'selected' : ''}>Todos Docentes</option>
                ${state.maestros.map(m => `<option value="${escapeHTML(m)}" ${state.filtroMaestro === m ? 'selected' : ''}>${escapeHTML(m)}</option>`).join('')}
              </select>
            </div>

          </div>
        </div>

      </div>

      <!-- LAYOUT DE 2 COLUMNAS (ESCRITORIO) -->
      <div class="row g-3 align-items-start">
        
        <!-- COLUMNA IZQUIERDA: CALENDARIO MENSUAL -->
        <div class="col-12 col-xl-7">
          ${renderCalendarioGrid(fechasMap)}
        </div>

        <!-- COLUMNA DERECHA: REGISTRO DEL DÍA SELECCIONADO -->
        <div class="col-12 col-xl-5">
          ${renderPanelDiaSeleccionado(diaSeleccionadoData)}
        </div>

      </div>

    </div>
  `
}

/**
 * Renderiza la cuadrícula del Calendario Mensual
 */
function renderCalendarioGrid(fechasMap) {
  const year = state.calendarYear
  const month = state.calendarMonth
  const monthName = MESES_NOMBRES[month]

  const primerDiaMes = new Date(year, month, 1)
  const ultimoDiaMes = new Date(year, month + 1, 0)
  
  let primerDiaSemana = primerDiaMes.getDay() - 1 // Lunes = 0, Dom = 6
  if (primerDiaSemana < 0) primerDiaSemana = 6

  const totalDiasMes = ultimoDiaMes.getDate()
  const hoyStr = new Date().toISOString().slice(0, 10)

  const diasCeldas = []

  // Relleno días mes anterior
  const diasMesAnterior = new Date(year, month, 0).getDate()
  for (let i = primerDiaSemana - 1; i >= 0; i--) {
    const dNum = diasMesAnterior - i
    diasCeldas.push({
      num: dNum,
      fecha: null,
      isOtherMonth: true,
    })
  }

  // Días del mes actual
  for (let d = 1; d <= totalDiasMes; d++) {
    const fechaISO = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`
    const dataDia = fechasMap.get(fechaISO)
    diasCeldas.push({
      num: d,
      fecha: fechaISO,
      isOtherMonth: false,
      isToday: fechaISO === hoyStr,
      isSelected: fechaISO === state.selectedFecha,
      data: dataDia || null,
    })
  }

  // Relleno días mes siguiente
  const remainder = (7 - (diasCeldas.length % 7)) % 7
  for (let i = 1; i <= remainder; i++) {
    diasCeldas.push({
      num: i,
      fecha: null,
      isOtherMonth: true,
    })
  }

  return `
    <div class="asistencias-calendar-container p-2 p-md-3 h-100">
      
      <!-- Toolbar del Calendario -->
      <div class="calendar-header-toolbar py-1 mb-2">
        <div class="d-flex align-items-center gap-2">
          <button class="btn btn-outline-secondary btn-sm px-2 py-1" id="btnMesAnterior" title="Mes anterior">
            <i class="bi bi-chevron-left"></i>
          </button>
          <h6 class="calendar-month-title mb-0 fw-bold">${monthName} ${year}</h6>
          <button class="btn btn-outline-secondary btn-sm px-2 py-1" id="btnMesSiguiente" title="Mes siguiente">
            <i class="bi bi-chevron-right"></i>
          </button>
          <button class="btn btn-outline-primary btn-sm px-2 py-1 ms-1" id="btnHoyCalendar" style="font-size:0.75rem;">
            Hoy
          </button>
        </div>

        <div class="d-none d-sm-flex align-items-center gap-3 small text-muted" style="font-size: 0.75rem;">
          <span class="d-flex align-items-center gap-1"><span class="badge rounded-circle p-1 bg-success"> </span> Presentes</span>
          <span class="d-flex align-items-center gap-1"><span class="badge rounded-circle p-1" style="background:#9d65c9;"> </span> Justificados</span>
          <span class="d-flex align-items-center gap-1"><span class="badge rounded-circle p-1 bg-danger"> </span> Ausentes</span>
        </div>
      </div>

      <!-- Encabezados de Días -->
      <div class="calendar-grid-header mb-1">
        ${DIAS_HEADER.map(d => `<div>${d}</div>`).join('')}
      </div>

      <!-- Cuadrícula de Celdas -->
      <div class="calendar-grid-days">
        ${diasCeldas.map(celda => {
          if (celda.isOtherMonth) {
            return `<div class="calendar-day-cell other-month"><span class="calendar-day-num text-muted">${celda.num}</span></div>`
          }

          const dData = celda.data
          const totalClases = dData?.clases?.length || 0
          const totalP = dData?.clases?.reduce((s, c) => s + (c.presentes || 0), 0) || 0
          const totalJ = dData?.clases?.reduce((s, c) => s + (c.justificados || 0), 0) || 0
          const totalA = dData?.clases?.reduce((s, c) => s + (c.ausentes || 0), 0) || 0
          const totalReg = totalP + totalJ + totalA || 1

          const pctP = Math.round((totalP / totalReg) * 100)
          const pctJ = Math.round((totalJ / totalReg) * 100)
          const pctA = 100 - pctP - pctJ

          return `
            <div class="calendar-day-cell ${celda.isToday ? 'is-today' : ''} ${celda.isSelected ? 'is-selected' : ''}" 
                 data-action="select-day" 
                 data-fecha="${celda.fecha}">
              <div class="d-flex justify-content-between align-items-center">
                <span class="calendar-day-num">${celda.num}</span>
                ${totalClases > 0 ? `<span class="calendar-clases-badge">${totalClases} cl.</span>` : ''}
              </div>
              
              ${totalClases > 0 ? `
                <div class="calendar-day-content">
                  <div class="calendar-bar-asistencia" title="${totalP} Pres / ${totalJ} Just / ${totalA} Aus">
                    <div class="bar-p" style="width: ${pctP}%"></div>
                    <div class="bar-j" style="width: ${pctJ}%"></div>
                    <div class="bar-a" style="width: ${pctA}%"></div>
                  </div>
                  <div class="d-flex justify-content-between" style="font-size:0.62rem; color:#aaa; font-weight: 600;">
                    <span class="text-success">${totalP}P</span>
                    <span style="color:#d6bbfb;">${totalJ}J</span>
                    <span class="text-danger">${totalA}A</span>
                  </div>
                </div>
              ` : '<div class="small text-muted" style="font-size:0.6rem; opacity:0.25;">—</div>'}
            </div>
          `
        }).join('')}
      </div>

    </div>
  `
}

/**
 * Renderiza el Panel de Registro del Día Seleccionado (Columna Derecha)
 */
function renderPanelDiaSeleccionado(diaSeleccionadoData) {
  return `
    <div class="selected-day-panel shadow-sm p-3 mt-0 h-100" style="min-height: 480px; max-height: calc(100vh - 180px); overflow-y: auto;">
      <div class="selected-day-header pb-2 mb-3 sticky-top bg-body pt-1" style="z-index: 2;">
        <div>
          <h6 class="mb-0 fw-bold text-body">
            <i class="bi bi-calendar-event text-primary me-2"></i>${formatTimelineDate(state.selectedFecha)}
          </h6>
          <small class="text-muted" style="font-size:0.75rem;">
            ${diaSeleccionadoData ? `${diaSeleccionadoData.clases.length} clases impartidas` : 'No hay sesiones registradas.'}
          </small>
        </div>
      </div>

      ${diaSeleccionadoData ? `
        <div class="d-flex flex-column gap-2">
          ${diaSeleccionadoData.clases.map((c, idx) => _renderClaseCardDetalle(c, idx)).join('')}
        </div>
      ` : `
        <div class="text-center py-5 text-muted">
          <i class="bi bi-calendar2-x fs-1 d-block mb-2 text-secondary opacity-50"></i>
          <div class="small fw-semibold">Sin clases registradas</div>
          <small class="text-muted">Hacé clic en un día del calendario que tenga sesiones marcadas.</small>
        </div>
      `}
    </div>
  `
}

/**
 * Renderiza la ficha estructurada de una clase con nómina de asistencia y justificaciones
 */
function _renderClaseCardDetalle(c, idx) {
  const total = c.total_alumnos || (c.asistencias || []).length || 0
  const asistencias = c.asistencias || []

  return `
    <div class="clase-session-card p-3 rounded-3 mb-1">
      
      <!-- Header Clase -->
      <div>
        <div class="d-flex justify-content-between align-items-start gap-2 mb-1">
          <div>
            <h6 class="fw-bold mb-0 text-body" style="font-size: 0.92rem;">${escapeHTML(c.clase_nombre || 'Clase')}</h6>
            <div class="small text-muted d-flex align-items-center gap-2 mt-1" style="font-size:0.75rem;">
              <span><i class="bi bi-clock me-1"></i>${escapeHTML(formatHorario(c.hora_inicio, c.hora_fin))}</span>
              <span>•</span>
              <span><i class="bi bi-music-note me-1"></i>${escapeHTML(c.instrumento || 'General')}</span>
            </div>
          </div>
          <div class="text-end">
            <span class="badge bg-success-subtle text-success border border-success-subtle me-1" style="font-size:0.68rem;">${c.presentes || 0} P</span>
            <span class="badge bg-danger-subtle text-danger border border-danger-subtle me-1" style="font-size:0.68rem;">${c.ausentes || 0} A</span>
            <span class="badge border" style="font-size:0.68rem; background: rgba(111, 66, 193, 0.15); color: #d6bbfb; border-color: rgba(111, 66, 193, 0.3) !important;">${c.justificados || 0} J</span>
          </div>
        </div>

        <div class="small text-muted mb-2" style="font-size:0.78rem;">
          <i class="bi bi-person-badge me-1"></i>Docente: <strong>${escapeHTML(c.maestro_nombre || 'Sin asignar')}</strong>
        </div>

        ${c.observacion_sesion || c.observacion_clase ? `
          <div class="p-2 rounded-2 mb-2 bg-body-tertiary border text-secondary small" style="font-size: 0.76rem;">
            <i class="bi bi-journal-text me-1 text-primary"></i>${escapeHTML(c.observacion_sesion || c.observacion_clase)}
          </div>
        ` : ''}
      </div>

      <!-- Nómina de Alumnos y Asistencia -->
      <div class="mt-2 pt-2 border-top border-body-tertiary">
        <div class="d-flex justify-content-between align-items-center mb-1">
          <span class="small fw-bold text-uppercase text-muted" style="font-size: 0.68rem;">Nómina (${total} alumnos)</span>
        </div>

        <div class="d-flex flex-column gap-1" style="max-height: 150px; overflow-y: auto;">
          ${asistencias.length > 0 ? asistencias.map((a, aIdx) => {
            const isPresente = a.estado === 'presente' || a.estado === 'P'
            const isJustificado = a.estado === 'justificado' || a.estado === 'J'
            
            if (isPresente) {
              return `
                <div class="roster-student-item asistencia-presente py-1 px-2">
                  <span class="small" style="font-size:0.8rem;"><strong class="text-muted me-1">${aIdx + 1}.</strong> ${escapeHTML(a.alumno_nombre || a.alumnoNombre || 'Estudiante')}</span>
                  <span class="badge student-status-badge" style="font-size:0.65rem"><i class="bi bi-check-circle-fill me-1"></i>Presente</span>
                </div>
              `
            }
            if (isJustificado) {
              const justifObj = a.justificacion || (c.justificaciones || []).find(j => j.alumno_id === (a.alumno_id || a.alumnoId)) || {}
              return `
                <div class="roster-student-item asistencia-justificado py-1 px-2"
                     data-action="ver-justificacion-modal"
                     data-student="${escapeHTML(a.alumno_nombre || a.alumnoNombre || 'Estudiante')}"
                     data-clase="${escapeHTML(c.clase_nombre || 'Clase')}"
                     data-docente="${escapeHTML(c.maestro_nombre || 'Docente')}"
                     data-fecha="${escapeHTML(c.fecha)}"
                     data-motivo="${escapeHTML(justifObj.motivo || justifObj.descripcion || a.justificacion_texto || 'Justificación asentada por la cátedra.')}"
                     data-evidencia="${escapeHTML(justifObj.evidencia_url || '')}"
                     title="Ver motivo de justificación">
                  <span class="small" style="font-size:0.8rem;"><strong class="text-muted me-1">${aIdx + 1}.</strong> ${escapeHTML(a.alumno_nombre || a.alumnoNombre || 'Estudiante')}</span>
                  <span class="badge student-status-badge" style="font-size:0.65rem"><i class="bi bi-file-earmark-medical-fill me-1"></i>Justificado <i class="bi bi-info-circle ms-1"></i></span>
                </div>
              `
            }
            return `
              <div class="roster-student-item asistencia-ausente py-1 px-2">
                <span class="small" style="font-size:0.8rem;"><strong class="text-muted me-1">${aIdx + 1}.</strong> ${escapeHTML(a.alumno_nombre || a.alumnoNombre || 'Estudiante')}</span>
                <span class="badge student-status-badge" style="font-size:0.65rem"><i class="bi bi-x-circle-fill me-1"></i>Ausente</span>
              </div>
            `
          }).join('') : `
            <div class="small text-muted py-1" style="font-size:0.75rem;">No hay alumnos registrados en esta sesión.</div>
          `}
        </div>
      </div>

    </div>
  `
}

function formatHorario(horaInicio, horaFin) {
  if (!horaInicio && !horaFin) return 'Horario por cátedra'
  
  const parseTime = (t) => {
    if (!t) return ''
    if (typeof t !== 'string') return ''
    if (t.includes('T')) {
      const match = t.match(/T(\d{2}:\d{2})/)
      if (match) return match[1]
    }
    const clean = t.trim()
    if (clean === '--:--' || clean === 'null' || clean === 'undefined') return ''
    const parts = clean.split(':')
    if (parts.length >= 2) {
      return `${parts[0].padStart(2, '0')}:${parts[1].padStart(2, '0')}`
    }
    return clean
  }

  const start = parseTime(horaInicio)
  const end = parseTime(horaFin)

  if (start && end) return `${start} - ${end}`
  if (start) return `${start} hrs`
  if (end) return `Hasta ${end}`
  return 'Horario por cátedra'
}

function formatTimelineDate(dateStr) {
  if (!dateStr) return '—'
  const date = new Date(dateStr + 'T12:00:00')
  return date.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
}

function _mostrarModalJustificacion({ student, clase, docente, fecha, motivo, evidencia }) {
  document.getElementById('justifModalContainer')?.remove()

  const modalHtml = `
    <div class="justif-modal-backdrop" id="justifModalContainer">
      <div class="justif-modal-dialog">
        <div class="p-3 border-bottom d-flex align-items-center justify-content-between" style="border-color: rgba(111,66,193,0.3) !important;">
          <div class="d-flex align-items-center gap-2">
            <div class="p-2 rounded-3" style="background: rgba(111,66,193,0.2); color: #cbb2fe;">
              <i class="bi bi-file-earmark-medical-fill fs-5"></i>
            </div>
            <div>
              <h6 class="mb-0 fw-bold">Detalle de Inasistencia Justificada</h6>
              <div class="small text-muted">${escapeHTML(fecha)}</div>
            </div>
          </div>
          <button type="button" class="btn-close btn-close-white" id="btnCerrarJustifModal" aria-label="Cerrar"></button>
        </div>

        <div class="p-4">
          <div class="mb-3">
            <div class="text-muted small fw-semibold text-uppercase">Estudiante</div>
            <div class="fs-6 fw-bold">${escapeHTML(student)}</div>
          </div>

          <div class="row g-2 mb-3">
            <div class="col-6">
              <div class="text-muted small fw-semibold text-uppercase">Clase</div>
              <div class="small fw-semibold">${escapeHTML(clase)}</div>
            </div>
            <div class="col-6">
              <div class="text-muted small fw-semibold text-uppercase">Docente</div>
              <div class="small">${escapeHTML(docente)}</div>
            </div>
          </div>

          <div class="p-3 rounded-3 mb-3" style="background: rgba(111, 66, 193, 0.12); border: 1px dashed rgba(111, 66, 193, 0.4);">
            <div class="d-flex align-items-center gap-2 mb-1" style="color: #d6bbfb;">
              <i class="bi bi-chat-left-quote-fill"></i>
              <span class="small fw-bold text-uppercase">Causa / Justificación Declarada</span>
            </div>
            <p class="mb-0 small text-body" style="line-height: 1.5;">${escapeHTML(motivo)}</p>
          </div>

          ${evidencia ? `
            <div class="mb-3">
              <a href="${escapeHTML(evidencia)}" target="_blank" rel="noopener" class="btn btn-sm btn-outline-info w-100 d-flex align-items-center justify-content-center gap-2">
                <i class="bi bi-paperclip"></i> Ver Documento / Evidencia Adjunta
              </a>
            </div>
          ` : ''}

          <div class="text-end mt-4">
            <button type="button" class="btn btn-secondary btn-sm px-4 rounded-3" id="btnAceptarJustifModal">Entendido</button>
          </div>
        </div>
      </div>
    </div>
  `

  document.body.insertAdjacentHTML('beforeend', modalHtml)

  const backdrop = document.getElementById('justifModalContainer')
  const close = () => backdrop?.remove()

  document.getElementById('btnCerrarJustifModal')?.addEventListener('click', close)
  document.getElementById('btnAceptarJustifModal')?.addEventListener('click', close)
  backdrop?.addEventListener('click', (e) => {
    if (e.target === backdrop) close()
  })
}

/**
 * Adelanto del contenido de clase en la fila del timeline.
 * `observacion_clase` viene de sesiones_clase.contenido (lo que escribe el maestro);
 * `observacion_sesion` de observaciones_sesion.contenido_raw. Se prefiere el primero.
 */
function renderContenidoPreview(clase) {
  const texto = (clase.observacion_clase || clase.observacion_sesion || '').trim()
  if (!texto) return ''

  const LIMITE = 180
  const resumen = texto.length > LIMITE ? `${texto.slice(0, LIMITE).trimEnd()}…` : texto

  return `
    <div class="mt-2 ps-1 border-start border-3 border-primary-subtle">
      <div class="ps-2 small text-secondary" style="white-space: pre-wrap; word-break: break-word;">${escapeHTML(resumen)}</div>
    </div>
  `
}

function formatFechaLarga(fecha) {
  if (!fecha) return '—'
  const date = new Date(`${fecha}T12:00:00`)
  if (Number.isNaN(date.getTime())) return fecha
  return date.toLocaleDateString('es-ES', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

/**
 * Muestra el contenido de clase tal cual lo escribió el maestro.
 * Se preserva el texto literal (white-space: pre-wrap) porque es evidencia
 * institucional: no se reformatea ni se interpreta al mostrarlo.
 *
 * `contenido` es la fuente viva; `temaPrincipal` / `observacionesGenerales`
 * son columnas legacy que quedaron casi sin uso y sirven solo de respaldo.
 */
function renderContenidoMaestro(sesion) {
  const contenido = (sesion.contenido || '').trim()

  if (contenido) {
    return `<div class="contenido-maestro border rounded-3 p-3 bg-body" style="white-space: pre-wrap; word-break: break-word;">${escapeHTML(contenido)}</div>`
  }

  const legacy = [
    sesion.temaPrincipal && `<p class="fw-semibold mb-1">${escapeHTML(sesion.temaPrincipal)}</p>`,
    sesion.observacionesGenerales &&
      `<p class="text-secondary small mb-0">${escapeHTML(sesion.observacionesGenerales)}</p>`,
  ]
    .filter(Boolean)
    .join('')

  if (legacy) {
    return `<div class="border rounded-3 p-3 bg-body">${legacy}</div>`
  }

  return `
    <div class="alert alert-light border small mb-0">
      El maestro no registró contenido para esta sesión.
    </div>
  `
}

function getObservacionTipoLabel(tipo) {
  const labels = {
    academico: 'Académica',
    conducta: 'Conducta',
    seguimiento: 'Seguimiento',
    familiar: 'Familiar',
    salud: 'Salud',
  }

  if (!tipo) return 'General'
  return labels[tipo] || tipo.charAt(0).toUpperCase() + tipo.slice(1)
}

function getPrioridadLabel(prioridad) {
  const labels = {
    baja: 'Prioridad baja',
    media: 'Prioridad media',
    alta: 'Prioridad alta',
    urgente: 'Prioridad urgente',
  }

  if (!prioridad) return 'Sin prioridad'
  return labels[prioridad] || prioridad.charAt(0).toUpperCase() + prioridad.slice(1)
}

function getPrioridadBadgeClass(prioridad) {
  const classes = {
    baja: 'success',
    media: 'warning',
    alta: 'danger',
    urgente: 'danger',
  }

  return classes[prioridad] || 'secondary'
}

function _attachEvents(container) {
  // 1. Botón Toggle Filtros Desplegables
  container.querySelector('#btnToggleFiltros')?.addEventListener('click', () => {
    state.filtrosAbiertos = !state.filtrosAbiertos
    renderContent(container)
    _attachEvents(container)
  })

  // 2. Selector de Período
  container.querySelector('#selectPeriodo')?.addEventListener('change', async (e) => {
    state.filtroPeriodo = e.target.value
    await _loadData()
    renderContent(container)
    _attachEvents(container)
  })

  // 3. Selector de Cátedra
  container.querySelector('#selectCatedra')?.addEventListener('change', (e) => {
    state.filtroCatedra = e.target.value
    renderContent(container)
    _attachEvents(container)
  })

  // 4. Selector de Clase
  container.querySelector('#selectClase')?.addEventListener('change', (e) => {
    state.filtroClase = e.target.value
    renderContent(container)
    _attachEvents(container)
  })

  // 5. Selector de Maestro
  container.querySelector('#selectMaestro')?.addEventListener('change', (e) => {
    state.filtroMaestro = e.target.value
    renderContent(container)
    _attachEvents(container)
  })

  // 6. Buscador
  const searchInput = container.querySelector('#inputBuscarAsistencias')
  searchInput?.addEventListener('input', (e) => {
    state.searchQuery = e.target.value
    renderContent(container)
    _attachEvents(container)
  })

  // 7. Navegación Mes Calendario
  container.querySelector('#btnMesAnterior')?.addEventListener('click', () => {
    if (state.calendarMonth === 0) {
      state.calendarMonth = 11
      state.calendarYear -= 1
    } else {
      state.calendarMonth -= 1
    }
    renderContent(container)
    _attachEvents(container)
  })

  container.querySelector('#btnMesSiguiente')?.addEventListener('click', () => {
    if (state.calendarMonth === 11) {
      state.calendarMonth = 0
      state.calendarYear += 1
    } else {
      state.calendarMonth += 1
    }
    renderContent(container)
    _attachEvents(container)
  })

  container.querySelector('#btnHoyCalendar')?.addEventListener('click', () => {
    const now = new Date()
    state.calendarYear = now.getFullYear()
    state.calendarMonth = now.getMonth()
    state.selectedFecha = now.toISOString().slice(0, 10)
    renderContent(container)
    _attachEvents(container)
  })

  // 8. Botón Descargar PDF
  container.querySelector('#btnDescargarPdfAsistencias')?.addEventListener('click', async () => {
    AppToast.info('Generando informe de asistencia...')
    try {
      await descargarPdfResumenMensual({
        periodoNombre: state.periodos.find(p => p.id === state.filtroPeriodo)?.nombre || 'Período Académico',
        fechaGeneracion: new Date().toLocaleDateString('es-ES'),
        totalSesiones: state.resumenGlobal?.totalSesiones || 0,
        totalAsistencias: state.resumenGlobal?.totalRegistros || 0,
        tasaAsistenciaPct: state.resumenGlobal?.totalRegistros ? Math.round(((state.resumenGlobal.totalPresentes + state.resumenGlobal.totalJustificados) / state.resumenGlobal.totalRegistros) * 100) : 0,
        totalInasistencias: state.resumenGlobal?.totalAusentes || 0,
        asistenciasPorDia: [],
        asistenciasPorInstrumento: [],
        alumnosEnRiesgo: [],
      })
      AppToast.success('Informe PDF generado exitosamente.')
    } catch (err) {
      console.error('[asistenciasView] Error al exportar PDF:', err)
      AppToast.error('No se pudo generar el PDF de asistencia.')
    }
  })

  // 9. Delegación de Clics para selección de día y modal de justificación
  container.addEventListener('click', (e) => {
    // Selección de día en el calendario
    const dayCell = e.target.closest('[data-action="select-day"]')
    if (dayCell && dayCell.dataset.fecha) {
      state.selectedFecha = dayCell.dataset.fecha
      renderContent(container)
      _attachEvents(container)
      return
    }

    // Modal de Justificación
    const justifBtn = e.target.closest('[data-action="ver-justificacion-modal"]')
    if (justifBtn) {
      _mostrarModalJustificacion({
        student: justifBtn.dataset.student,
        clase: justifBtn.dataset.clase,
        docente: justifBtn.dataset.docente,
        fecha: justifBtn.dataset.fecha,
        motivo: justifBtn.dataset.motivo,
        evidencia: justifBtn.dataset.evidencia,
      })
      return
    }

    const row = e.target.closest('[data-action="view-detail"]')
    if (row) openDetailModal(row.dataset.id)
  })
}

function openEvaluacionDirecta(sesionId) {
  openEvaluacionEstrellasModal({
    nodo: { id: `nodo-${sesionId}`, titulo: 'Contenido de la Sesión' },
    alumnos: [
      { id: 'al-1', nombre: 'Alumno 1', presente: true },
      { id: 'al-2', nombre: 'Alumno 2', presente: true },
      { id: 'al-3', nombre: 'Alumno 3', presente: false },
    ],
  })
}

async function _reloadView() {
  const container = state.container
  await _loadData()
  renderContent(container)
  _attachEvents(container)
}

async function openDetailModal(sesionId) {
  AppToast.info('Cargando detalle...')
  try {
    const detail = await getDetalleSesion(sesionId)
    AppModal.open({
      title: `Sesión: ${detail.sesion.claseNombre}`,
      size: 'lg',
      hideSave: true,
      cancelText: 'Cerrar',
      body: `
        <div class="row g-4">
          <div class="col-md-8">
            <label class="text-muted small text-uppercase fw-bold mb-1 d-block">Contenido registrado por el maestro</label>
            ${renderContenidoMaestro(detail.sesion)}
          </div>
          <div class="col-md-4 bg-body-tertiary p-3 rounded">
            <div class="d-flex justify-content-between mb-2"><span>Fecha:</span> <strong>${escapeHTML(formatFechaLarga(detail.sesion.fecha))}</strong></div>
            <div class="d-flex justify-content-between mb-2"><span>Horario:</span> <strong>${escapeHTML((detail.sesion.horaInicio || '--:--').slice(0, 5))} - ${escapeHTML((detail.sesion.horaFin || '--:--').slice(0, 5))}</strong></div>
            <div class="d-flex justify-content-between mb-2"><span>Maestro:</span> <strong>${escapeHTML(detail.sesion.maestroNombre)}</strong></div>
            <div class="d-flex justify-content-between mb-2"><span>Clase:</span> <strong>${escapeHTML(detail.sesion.claseNombre || '—')}</strong></div>
            ${detail.sesion.salon ? `<div class="d-flex justify-content-between mb-2"><span>Lugar:</span> <strong>${escapeHTML(detail.sesion.salon)}</strong></div>` : ''}
            <button class="btn btn-sm btn-primary w-100 mt-2" id="btn-evaluar-modal-inner">
              <i class="bi bi-star me-1"></i>Evaluar Contenido (1-5★)
            </button>
          </div>
          <div class="col-12">
            <h6 class="fw-bold border-bottom pb-2 mb-3">Registro de Observaciones </h6>
            ${
              detail.observaciones?.length
                ? `
              <div class="observaciones-section">
                <div class="d-flex flex-column gap-3">
                  ${detail.observaciones
                    .map(
                      (o) => `
                    <article class="border rounded-3 p-3 bg-body">
                      <div class="d-flex flex-wrap justify-content-between align-items-start gap-2 mb-2">
                        <div>
                          <div class="fw-semibold">${escapeHTML(o.titulo || 'Observación sin título')}</div>
                          <div class="small text-muted">
                            <i class="bi bi-person me-1"></i>${escapeHTML(o.alumnoNombre || '—')}
                            <span class="mx-1">•</span>
                            ${escapeHTML(getObservacionTipoLabel(o.tipo))}
                          </div>
                        </div>
                        <div class="d-flex flex-wrap gap-2">
                          <span class="badge text-bg-${getPrioridadBadgeClass(o.prioridad)}">${escapeHTML(getPrioridadLabel(o.prioridad))}</span>
                        </div>
                      </div>
                      <div class="observacion-content">${escapeHTML(o.descripcion || 'Sin descripción.')}</div>
                    </article>
                  `,
                    )
                    .join('')}
                </div>
              </div>
            `
                : `
              <div class="alert alert-light border small mb-0">
                No hay observaciones registradas para esta sesión.
              </div>
            `
            }
          </div>
          <div class="col-12">
            <h6 class="fw-bold border-bottom pb-2 mb-3">Listado de Asistencia y Evaluación</h6>
            <div class="table-responsive">
              <table class="table table-compact">
                <thead>
                  <tr>
                    <th>Alumno</th>
                    <th class="text-center">Estado Asistencia</th>
                    <th>Observaciones</th>
                  </tr>
                </thead>
                <tbody>
                  ${detail.asistencias
                    .map(
                      (a) => `
                    <tr>
                      <td>${escapeHTML(a.alumnoNombre)}</td>
                      <td class="text-center">
                        <span class="badge bg-${ESTADO_LABEL[a.estado]?.css || 'secondary'}">${escapeHTML(ESTADO_LABEL[a.estado]?.label || a.estado)}</span>
                      </td>
                      <td class="small text-muted">${escapeHTML(a.observacion || a.justificacionTexto || '-')}</td>
                    </tr>
                  `,
                    )
                    .join('')}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      `,
    })

    setTimeout(() => {
      document.querySelector('#btn-evaluar-modal-inner')?.addEventListener('click', () => {
        const alumnosModal = (detail.asistencias || []).map((a) => ({
          id: a.alumnoId,
          nombre: a.alumnoNombre,
          presente: a.estado === 'presente' || a.estado === 'tardanza',
        }))

        openEvaluacionEstrellasModal({
          nodo: { id: `nodo-${sesionId}`, titulo: detail.sesion.temaPrincipal || 'Contenido Didáctico' },
          alumnos: alumnosModal,
        })
      })
    }, 100)
  } catch (error) {
    console.error('[asistenciasView] Error abriendo detalle:', error)
    AppToast.error('No se pudo cargar el detalle de la sesión.')
  }
}
