import { AppModal } from '../../../shared/components/AppModal.js'
import { AppToast } from '../../../shared/components/AppToast.js'
import {
  getEstadisticasPeriodoActivo,
  getResumenAlertas,
  getAlumnosDestacados,
  getDestacadosYRiesgoAcademico,
} from '../api/metricasApi.js'
import { callDslRpc } from '../api/observabilidadApi.js'
import { callGroq } from '../../../portal-maestros/services/groqService.js'
import { renderMetricCard } from '../components/MetricCard.js'
import { escapeHTML } from '../../clases/utils/clasesUtils.js'
import { systemLogsWidget } from './systemLogsWidget.js'
import { auditTrailWidget } from './auditTrailWidget.js'
import '../styles/metricas-observabilidad.css'

const NIVEL_ORDER = {
  inicial: 1,
  iniciacion: 1,
  basico: 2,
  básico: 2,
  intermedio: 3,
  avanzado: 4,
}

const state = {
  activeTab: localStorage.getItem('pm_metrics_tab') || 'resumen',
  stats: null,
  cargando: false,
  container: null,
  activeWidgetInstances: [],
  _onlineListener: null,
  _offlineListener: null,
  // Estado local para alumnos destacados con ordenamiento interactivo
  todosDestacados: [],
  filtroDestacados: {
    search: '',
    catedra: 'ALL',
    rango: 'HONOR', // 'EXCELENCIA' (>=95), 'HONOR' (>=90), 'TODOS' (>=80)
    sortBy: 'promedio', // 'posicion' | 'estudiante' | 'catedra' | 'nivel' | 'promedio'
    sortDir: 'desc', // 'asc' | 'desc'
  },
}

/**
 * Destroy all active widget instances and clean up
 */
function _destroyAllWidgets() {
  state.activeWidgetInstances.forEach((widget) => {
    if (widget && typeof widget.destroy === 'function') {
      try {
        widget.destroy()
      } catch (err) {
        console.error('Error destroying widget:', err)
      }
    }
  })
  state.activeWidgetInstances = []
}

/**
 * Institutional Analytics & Observability Hub - Orquestador de Módulo
 */
export async function renderDashboardMetricasView(container) {
  if (!container) return

  try {
    _destroyAllWidgets()

    state.container = container
    state.cargando = true
    renderLoading(container)

    const [stats, resumenAlertas, todosAlumnos] = await Promise.all([
      getEstadisticasPeriodoActivo(),
      getResumenAlertas(),
      getDestacadosYRiesgoAcademico(),
    ])

    state.stats = stats
    state.resumenAlertas = resumenAlertas
    state.todosDestacados = todosAlumnos || []

    state.cargando = false
    renderContent(container)
    _attachEvents(container)
  } catch (error) {
    console.error(error)
    renderError(container, error.message)
  }
}

function renderLoading(container) {
  container.innerHTML = `<div class="d-flex justify-content-center align-items-center obs-loading-area"><div class="spinner-border text-primary" role="status"></div></div>`
}

function renderError(container, msg) {
  container.innerHTML = `<div class="alert alert-danger m-3"><h5>Error analítico</h5><p>${escapeHTML(msg)}</p></div>`
}

function renderContent(container) {
  container.innerHTML = `
    <div class="page-container obs-page-container">
      <div class="page-header d-flex justify-content-between align-items-center flex-wrap gap-3 mb-4">
        <div>
          <h2 class="obs-page-title">
            <i class="bi bi-speedometer2 text-primary"></i> Dashboard de Métricas & Observabilidad
          </h2>
          <p class="obs-page-subtitle">
            Indicadores académicos en tiempo real, cuadro de honor y balance de asistencia docente
          </p>
        </div>
        <div class="d-flex align-items-center gap-2">
          <!-- Monitor de Sincronización Offline Reactivo -->
          <div id="offline-network-badge-container"></div>
          <button id="btn-guia-analisis" class="btn btn-outline-primary rounded-pill px-3 py-1.5 d-flex align-items-center gap-2 small fw-semibold transition-all">
            <i class="bi bi-info-circle-fill"></i>
            <span>Guía de Análisis</span>
          </button>
        </div>
      </div>

      <div class="pm-tabs-container mb-4">
        <div class="obs-tab-group" role="group">
          <button class="obs-tab-btn ${state.activeTab === 'resumen' ? 'active' : ''}" data-tab="resumen"><i class="bi bi-speedometer2"></i> Resumen</button>
          <button class="obs-tab-btn ${state.activeTab === 'operaciones' ? 'active' : ''}" data-tab="operaciones"><i class="bi bi-person-check-fill"></i> Asistencia & Solvencia</button>
          <button class="obs-tab-btn ${state.activeTab === 'logs' ? 'active' : ''}" data-tab="logs"><i class="bi bi-terminal"></i> Logs PWA</button>
          <button class="obs-tab-btn ${state.activeTab === 'auditoria' ? 'active' : ''}" data-tab="auditoria"><i class="bi bi-shield-check"></i> Auditoría</button>
          <button class="obs-tab-btn ${state.activeTab === 'ia' ? 'active' : ''}" data-tab="ia"><i class="bi bi-robot"></i> IA Intelligence</button>
        </div>
      </div>

      <div id="hub-content">
        ${renderTabContent()}
      </div>
    </div>
  `
  _updateOfflineBadge()
}

function _updateOfflineBadge() {
  const badgeContainer = state.container?.querySelector('#offline-network-badge-container')
  if (!badgeContainer) return
  const isOnline = navigator.onLine
  badgeContainer.innerHTML = isOnline
    ? `<span class="badge bg-success rounded-pill px-3 py-2 d-inline-flex align-items-center gap-1 shadow-sm"><span class="spinner-grow spinner-grow-sm text-white obs-spinner-slow" role="status"></span><i class="bi bi-cloud-check me-1"></i> Online</span>`
    : `<span class="badge bg-warning text-dark rounded-pill px-3 py-2 d-inline-flex align-items-center gap-1 shadow-sm"><span class="spinner-grow spinner-grow-sm text-dark animate-pulse" role="status"></span><i class="bi bi-cloud-slash me-1"></i> Offline - Logs encolados</span>`
}

function renderTabContent() {
  switch (state.activeTab) {
    case 'resumen':
      return renderResumenTab()
    case 'operaciones':
      return renderOperacionesTab()
    case 'logs':
      return renderLogsTab()
    case 'auditoria':
      return renderAuditoriaTab()
    case 'ia':
      return renderIATab()
    default:
      return renderResumenTab()
  }
}

function renderResumenTab() {
  const s = state.stats || {}
  const ra = state.resumenAlertas || { total: 0, rojas: 0 }

  // Extraer lista única de cátedras para el filtro
  const catedras = Array.from(
    new Set(state.todosDestacados.map((a) => a.programa || a.instrumento_principal).filter(Boolean))
  ).sort()

  return `
    <div class="row g-3">
      <div class="col-md-6 col-lg-4 col-xl-2">
        ${renderMetricCard({ label: 'Alumnos Activos', value: s.alumnos_activos || 0, icon: 'bi-people-fill', color: 'primary' })}
      </div>
      <div class="col-md-6 col-lg-4 col-xl-2">
        ${renderMetricCard({ label: 'Promedio Global', value: ((s.promedio_integrado ?? s.promedio_calificacion_periodo) || 0).toFixed(1) + ' pts', icon: 'bi-star-fill', color: 'success' })}
      </div>
      <div class="col-md-6 col-lg-4 col-xl-2">
        ${renderMetricCard({ label: 'Cuadro de Honor', value: s.alumnos_honor || 0, icon: 'bi-trophy-fill', color: 'warning' })}
      </div>
      <div class="col-md-6 col-lg-4 col-xl-2">
        ${renderMetricCard({ label: 'Asistencia Hoy', value: (s.tasa_asistencia_periodo || 92.5) + '%', icon: 'bi-check2-circle', color: 'info' })}
      </div>
      <div class="col-md-6 col-lg-4 col-xl-2">
        ${renderMetricCard({ label: 'Riesgo Pedagógico', value: s.alumnos_riesgo || 0, icon: 'bi-exclamation-triangle-fill', color: 'danger' })}
      </div>
      <div class="col-md-6 col-lg-4 col-xl-2">
        ${renderMetricCard({ label: 'Cátedras Activas', value: s.catedras_activas || 20, icon: 'bi-music-note-list', color: 'dark' })}
      </div>
      
      <!-- Panel de Alumnos Destacados (Cuadro de Honor) -->
      <div class="col-12 mt-4">
        <div class="page-glass p-4">
          <div class="d-flex justify-content-between align-items-center flex-wrap gap-3 mb-4">
            <div>
              <h5 class="fw-bold m-0 obs-honor-title">
                <i class="bi bi-trophy-fill me-2 text-warning"></i>Cuadro de Honor & Alumnos Destacados
              </h5>
              <p class="obs-honor-subtitle">
                Evaluación continua de calificaciones del período lectivo activo. Haz clic en las columnas para ordenar.
              </p>
            </div>
            <span class="badge obs-badge-excelencia">
              <i class="bi bi-award-fill me-1"></i> Excelencia Académica
            </span>
          </div>

          <!-- Barra de Filtros para Alumnos Destacados -->
          <div class="row g-3 mb-3 align-items-center">
            <div class="col-12 col-md-5">
              <div class="input-group">
                <span class="input-group-text obs-input-addon-dark-strong"><i class="bi bi-search"></i></span>
                <input type="text" id="inputSearchDestacados" class="form-control obs-input-dark-strong" placeholder="Buscar por nombre de alumno..." value="${escapeHTML(state.filtroDestacados.search)}">
              </div>
            </div>

            <div class="col-12 col-md-4">
              <select id="selectCatedraDestacados" class="form-select obs-input-dark-strong">
                <option value="ALL">Todas las Cátedras (${catedras.length})</option>
                ${catedras.map((c) => `<option value="${escapeHTML(c)}" ${state.filtroDestacados.catedra === c ? 'selected' : ''}>${escapeHTML(c)}</option>`).join('')}
              </select>
            </div>

            <div class="col-12 col-md-3">
              <select id="selectRangoDestacados" class="form-select obs-input-dark-strong">
                <option value="HONOR" ${state.filtroDestacados.rango === 'HONOR' ? 'selected' : ''}>Cuadro de Honor (&ge; 90 pts)</option>
                <option value="EXCELENCIA" ${state.filtroDestacados.rango === 'EXCELENCIA' ? 'selected' : ''}>Máxima Excelencia (&ge; 95 pts)</option>
                <option value="TODOS" ${state.filtroDestacados.rango === 'TODOS' ? 'selected' : ''}>Todos con Calificación (&ge; 80 pts)</option>
              </select>
            </div>
          </div>

          <!-- Contenedor de la Tabla -->
          <div class="table-responsive obs-table-scroll">
            <div id="destacados-table-container">
              <!-- Renderizado dinámico -->
            </div>
          </div>
        </div>
      </div>
    </div>
  `
}

function _renderDestacadosTable() {
  const container = state.container?.querySelector('#destacados-table-container')
  if (!container) return

  // Asignar ranking natural por promedio descendente antes de filtrar/ordenar
  const rankingNaturalMap = new Map()
  const ordenadosPorNotaDesc = [...state.todosDestacados].sort(
    (a, b) => Number(b.promedio) - Number(a.promedio)
  )
  ordenadosPorNotaDesc.forEach((alumno, idx) => {
    rankingNaturalMap.set(alumno.id, idx + 1)
  })

  let lista = state.todosDestacados.map((a) => ({
    ...a,
    _rankingNatural: rankingNaturalMap.get(a.id) || 999,
  }))

  // 1. Filtrar por rango
  if (state.filtroDestacados.rango === 'EXCELENCIA') {
    lista = lista.filter((a) => Number(a.promedio) >= 95)
  } else if (state.filtroDestacados.rango === 'HONOR') {
    lista = lista.filter((a) => Number(a.promedio) >= 90)
  } else {
    lista = lista.filter((a) => Number(a.promedio) >= 80)
  }

  // 2. Filtrar por cátedra
  if (state.filtroDestacados.catedra !== 'ALL') {
    lista = lista.filter(
      (a) => (a.programa || a.instrumento_principal) === state.filtroDestacados.catedra
    )
  }

  // 3. Filtrar por búsqueda de texto
  if (state.filtroDestacados.search.trim()) {
    const q = state.filtroDestacados.search.toLowerCase()
    lista = lista.filter((a) => (a.nombre_completo || '').toLowerCase().includes(q))
  }

  // 4. Ordenar dinámicamente según sortBy y sortDir
  const { sortBy, sortDir } = state.filtroDestacados
  const modifier = sortDir === 'asc' ? 1 : -1

  lista.sort((a, b) => {
    switch (sortBy) {
      case 'posicion':
        return modifier * (a._rankingNatural - b._rankingNatural)
      case 'estudiante':
        return (
          modifier *
          (a.nombre_completo || '').localeCompare(b.nombre_completo || '', 'es', {
            sensitivity: 'base',
          })
        )
      case 'catedra': {
        const catA = a.programa || a.instrumento_principal || ''
        const catB = b.programa || b.instrumento_principal || ''
        return modifier * catA.localeCompare(catB, 'es', { sensitivity: 'base' })
      }
      case 'nivel': {
        const nivelA = NIVEL_ORDER[(a.nivel || '').toLowerCase()] || 0
        const nivelB = NIVEL_ORDER[(b.nivel || '').toLowerCase()] || 0
        if (nivelA !== nivelB) return modifier * (nivelA - nivelB)
        return (
          modifier *
          (a.nivel || '').localeCompare(b.nivel || '', 'es', { sensitivity: 'base' })
        )
      }
      case 'promedio':
      default:
        return modifier * (Number(a.promedio) - Number(b.promedio))
    }
  })

  if (lista.length === 0) {
    container.innerHTML = `
      <div class="p-5 text-center obs-text-muted">
        <i class="bi bi-inbox fs-2 d-block mb-2"></i>
        No se encontraron alumnos con los criterios seleccionados.
      </div>
    `
    return
  }

  // Helper para generar el icono de ordenamiento en los encabezados
  const getSortIcon = (colKey) => {
    if (sortBy === colKey) {
      return sortDir === 'asc'
        ? `<i class="bi bi-arrow-up-short text-primary fs-5 align-middle"></i>`
        : `<i class="bi bi-arrow-down-short text-primary fs-5 align-middle"></i>`
    }
    return `<i class="bi bi-arrow-down-up text-muted opacity-40 small align-middle ms-1"></i>`
  }

  const getThClasses = (colKey) =>
    `obs-sort-th col-${colKey}${sortBy === colKey ? ' is-sorted' : ''}`

  container.innerHTML = `
    <div class="d-flex justify-content-between align-items-center mb-2 px-1">
      <span class="extra-small fw-semibold obs-text-muted">
        Mostrando ${lista.length} estudiante(s) · Ordenado por: <strong>${_getSortLabel(sortBy)} (${sortDir.toUpperCase()})</strong>
      </span>
    </div>
    <table class="table align-middle mb-0 obs-table-dark">
      <thead>
        <tr class="obs-honor-thead-row">
          <th class="${getThClasses('posicion')}" data-sort="posicion" title="Ordenar por Posición">
            Posición ${getSortIcon('posicion')}
          </th>
          <th class="${getThClasses('estudiante')}" data-sort="estudiante" title="Ordenar por Nombre de Estudiante">
            Estudiante ${getSortIcon('estudiante')}
          </th>
          <th class="${getThClasses('catedra')}" data-sort="catedra" title="Ordenar por Cátedra / Programa">
            Cátedra / Programa ${getSortIcon('catedra')}
          </th>
          <th class="${getThClasses('nivel')}" data-sort="nivel" title="Ordenar por Nivel Académico">
            Nivel ${getSortIcon('nivel')}
          </th>
          <th class="${getThClasses('promedio')}" data-sort="promedio" title="Ordenar por Promedio">
            Promedio ${getSortIcon('promedio')}
          </th>
        </tr>
      </thead>
      <tbody>
        ${lista
          .map((d) => {
            const pos = d._rankingNatural
            let medalla = `<span class="obs-honor-pos-num">#${pos}</span>`
            if (pos === 1) medalla = `<span class="obs-honor-medal" title="1er Lugar">🥇</span>`
            else if (pos === 2) medalla = `<span class="obs-honor-medal" title="2do Lugar">🥈</span>`
            else if (pos === 3) medalla = `<span class="obs-honor-medal" title="3er Lugar">🥉</span>`

            const nota = Number(d.promedio) || 0
            const esExcelencia = nota >= 95

            const badgeNotaClass = esExcelencia
              ? 'obs-badge-nota-excelencia'
              : 'obs-badge-nota-honor'

            const nivelLabel = (d.nivel || 'Básico').toUpperCase()

            return `
            <tr class="obs-honor-row">
              <td class="obs-honor-td-center">
                ${medalla}
              </td>
              <td class="obs-honor-td">
                <div class="obs-honor-name">
                  ${escapeHTML(d.nombre_completo)}
                </div>
                <div class="obs-honor-tagline">
                  ${esExcelencia ? '🌟 Cuadro de Honor Superior' : '⭐ Alumno Sobresaliente'}
                </div>
              </td>
              <td class="obs-honor-td-catedra">
                <i class="bi bi-music-note-beamed text-primary me-1.5"></i> ${escapeHTML(d.programa || 'Iniciación Musical')}
              </td>
              <td class="obs-honor-td-center">
                <span class="badge obs-badge-nivel">
                  ${nivelLabel}
                </span>
              </td>
              <td class="obs-honor-td-center">
                <span class="badge obs-badge-nota ${badgeNotaClass}">
                  ${nota.toFixed(1)} pts
                </span>
              </td>
            </tr>
          `
          })
          .join('')}
      </tbody>
    </table>
  `

  // Registrar eventos de clic en los encabezados <th> para ordenamiento
  container.querySelectorAll('th[data-sort]').forEach((th) => {
    th.addEventListener('click', () => {
      const col = th.dataset.sort
      if (state.filtroDestacados.sortBy === col) {
        // Alternar dirección
        state.filtroDestacados.sortDir =
          state.filtroDestacados.sortDir === 'asc' ? 'desc' : 'asc'
      } else {
        // Nueva columna: por defecto 'desc' para promedio y posición, 'asc' para texto
        state.filtroDestacados.sortBy = col
        state.filtroDestacados.sortDir =
          col === 'promedio' || col === 'posicion' ? 'asc' : 'asc'
        if (col === 'promedio') state.filtroDestacados.sortDir = 'desc'
      }
      _renderDestacadosTable()
    })
  })
}

function _getSortLabel(sortBy) {
  switch (sortBy) {
    case 'posicion':
      return 'Posición'
    case 'estudiante':
      return 'Estudiante'
    case 'catedra':
      return 'Cátedra / Programa'
    case 'nivel':
      return 'Nivel'
    case 'promedio':
      return 'Promedio'
    default:
      return 'Promedio'
  }
}

function renderOperacionesTab() {
  return `
    <div class="w-100">
      <!-- Widget Canónico Unificado a Ancho Completo: Balance de Asistencia & Solvencia Docente -->
      <div id="cumplimiento-maestros-container" class="obs-full-width-slot">
        <div class="text-center py-5"><div class="spinner-border text-primary"></div></div>
      </div>

      <div class="d-flex justify-content-between align-items-center mt-4 mb-3 flex-wrap gap-2">
        <h5 class="fw-bold m-0"><i class="bi bi-stars text-warning me-2"></i>Reconocimiento — Enseñanza Guiada</h5>
      </div>
      <div class="row g-4">
        <div class="col-12">
          <div class="p-3 border rounded-3 bg-light bg-opacity-25 shadow-sm">
            <div id="indice-ensenanza-guiada-container">
              <div class="text-center py-5"><div class="spinner-border spinner-border-sm text-primary"></div></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
}

function renderLogsTab() {
  return `
    <div class="page-glass p-4">
      <div class="d-flex justify-content-between align-items-center flex-wrap gap-3 mb-4">
        <h5 class="fw-bold m-0 obs-text-primary"><i class="bi bi-terminal-fill text-danger me-2"></i>Consola Técnica y Monitor de Red</h5>
        <button class="btn btn-sm btn-outline-secondary" id="btn-clear-logs"><i class="bi bi-trash me-1"></i>Limpiar Consola</button>
      </div>
      <!-- Widget Modular de Logs Técnicos -->
      <div id="system-logs-container">
        <div class="text-center py-5"><div class="spinner-border text-primary"></div></div>
      </div>
    </div>
  `
}

function renderAuditoriaTab() {
  return `
    <div class="page-glass p-4">
      <div class="d-flex justify-content-between align-items-center flex-wrap gap-3 mb-4">
        <h5 class="fw-bold m-0 obs-text-primary"><i class="bi bi-shield-check text-success me-2"></i>Pistas de Auditoría y Seguridad</h5>
        <span class="badge bg-info bg-opacity-10 text-info border border-info-subtle px-3 py-1 rounded-pill">Trazabilidad RLS</span>
      </div>
      <!-- Widget Modular de Auditoría -->
      <div id="audit-trail-container">
        <div class="text-center py-5"><div class="spinner-border text-primary"></div></div>
      </div>
    </div>
  `
}

function renderIATab() {
  return `
    <div class="page-glass p-5 text-center">
      <i class="bi bi-robot fs-1 text-primary d-block mb-3 animate-bell"></i>
      <h4 class="fw-bold obs-text-primary">SOI Intelligence</h4>
      <p class="obs-ia-intro">
        Genera un análisis narrativo institucional cruzando en tiempo real los KPIs del período activo con datos reales de Supabase.
      </p>
      <div class="d-flex justify-content-center gap-2 flex-wrap">
        <button class="btn btn-primary px-4 rounded-pill shadow" id="btn-run-ia">
          <i class="bi bi-magic me-1"></i> Iniciar Análisis de IA
        </button>
        <a href="#/metricas-ia-reportes" class="btn btn-outline-secondary px-4 rounded-pill">
          <i class="bi bi-file-earmark-richtext me-1"></i> Generador de Reportes Completo
        </a>
      </div>
      <div id="ia-result-area" class="mt-4 text-start obs-ia-result-box"></div>
    </div>
  `
}

function _attachEvents(container) {
  container.querySelectorAll('[data-tab]').forEach((btn) => {
    btn.addEventListener('click', () => {
      _destroyAllWidgets()

      state.activeTab = btn.dataset.tab
      localStorage.setItem('pm_metrics_tab', state.activeTab)
      renderContent(container)
      _attachEvents(container)
      _onTabChange()
    })
  })

  // Botón de ayuda / Guía Analítica
  container.querySelector('#btn-guia-analisis')?.addEventListener('click', () => {
    _openGuiaAnaliticaModal()
  })

  // Eventos de la pestaña Resumen (Filtros de Alumnos Destacados)
  const inputSearch = container.querySelector('#inputSearchDestacados')
  const selectCatedra = container.querySelector('#selectCatedraDestacados')
  const selectRango = container.querySelector('#selectRangoDestacados')

  inputSearch?.addEventListener('input', (e) => {
    state.filtroDestacados.search = e.target.value
    _renderDestacadosTable()
  })

  selectCatedra?.addEventListener('change', (e) => {
    state.filtroDestacados.catedra = e.target.value
    _renderDestacadosTable()
  })

  selectRango?.addEventListener('change', (e) => {
    state.filtroDestacados.rango = e.target.value
    _renderDestacadosTable()
  })

  // Listeners de Red para reactividad del Badge del Hub
  state._onlineListener = _updateOfflineBadge
  state._offlineListener = _updateOfflineBadge
  window.addEventListener('online', state._onlineListener)
  window.addEventListener('offline', state._offlineListener)

  _onTabChange()
}

async function _onTabChange() {
  if (state.activeTab === 'resumen') {
    _renderDestacadosTable()
  }

  if (state.activeTab === 'operaciones') {
    try {
      const { CumplimientoMaestrosWidget } =
        await import('../../admin-dashboard/views/cumplimientoMaestrosWidget.js')
      const widget = new CumplimientoMaestrosWidget('cumplimiento-maestros-container')
      await widget.init()
      state.activeWidgetInstances.push(widget)
    } catch (err) {
      console.error('Error al cargar el widget de CumplimientoMaestrosWidget:', err)
      const el = state.container?.querySelector('#cumplimiento-maestros-container')
      if (el)
        el.innerHTML = `<div class="alert alert-warning small"><i class="bi bi-exclamation-circle me-1"></i> No se pudo instanciar el Balance de Asistencia & Solvencia Docente.</div>`
    }

    // 3. indiceEnsenanzaGuiadaWidget (Spec D-01/D-02: reconocimiento, no ranking)
    try {
      const { indiceEnsenanzaGuiadaWidget } =
        await import('../../admin-dashboard/views/indiceEnsenanzaGuiadaWidget.js')
      const widget = indiceEnsenanzaGuiadaWidget('indice-ensenanza-guiada-container')
      await widget.init()
      state.activeWidgetInstances.push(widget)
    } catch (err) {
      console.error('Error al cargar el widget de Índice de Enseñanza Guiada:', err)
      const el = state.container.querySelector('#indice-ensenanza-guiada-container')
      if (el)
        el.innerHTML = `<div class="alert alert-warning small"><i class="bi bi-exclamation-circle me-1"></i> No se pudo instanciar el Índice de Enseñanza Guiada.</div>`
    }
  }

  if (state.activeTab === 'logs') {
    const logger = systemLogsWidget('system-logs-container')
    state.activeWidgetInstances.push(logger)
    await logger.init()
  }

  if (state.activeTab === 'auditoria') {
    const audit = auditTrailWidget('audit-trail-container')
    state.activeWidgetInstances.push(audit)
    await audit.init()
  }

  if (state.activeTab === 'ia') {
    _attachGlobalEventsIA()
  }
}

const IA_SYSTEM_PROMPT = `Actuás como el Analista de Inteligencia Institucional de "El Sistema Punta Cana",
una fundación de educación musical. Se te entrega un JSON con métricas REALES pre-calculadas
(KPIs del período, alertas, hotspots pedagógicos y rendimiento docente).

Tu tarea: redactar un análisis ejecutivo breve en markdown limpio con:
1. Estado general del grupo en 2-3 frases.
2. Los 1-2 focos de atención más críticos (si los datos los muestran).
3. Una recomendación accionable (máximo 2 bullets).

REGLA CRÍTICA ANTIALUCINACIÓN: NO inventes números ni porcentajes que no estén en el JSON.
Si un arreglo viene vacío, decilo explícitamente ("sin datos suficientes") en vez de suponer.
Sé conciso y concreto.`

function _compilarContextoIA(dslData) {
  const s = state.stats || {}
  const ra = state.resumenAlertas || {}
  return {
    periodo_activo: {
      total_alumnos: s.alumnos_activos ?? null,
      promedio_general: (s.promedio_integrado ?? s.promedio_calificacion_periodo) ?? null,
      asistencia_hoy_porcentaje: s.tasa_asistencia_periodo ?? null,
    },
    alertas: { total: ra.total ?? 0, rojas: ra.rojas ?? 0 },
    hotspots_pedagogicos: (dslData?.nodeDifficulty || []).slice(0, 5),
    rendimiento_docente: (dslData?.complianceData || []).slice(0, 10),
  }
}

function _attachGlobalEventsIA() {
  state.container?.querySelector('#btn-run-ia')?.addEventListener('click', async () => {
    const area = state.container?.querySelector('#ia-result-area')
    if (!area) return
    area.innerHTML =
      '<div class="text-center py-4"><div class="spinner-border spinner-border-sm text-primary"></div><p class="small mt-2 obs-text-secondary">Compilando datos reales y analizando con IA...</p></div>'

    try {
      const dslData = await callDslRpc('global')
      const contexto = _compilarContextoIA(dslData)

      let narrativa = null
      try {
        const respuesta = await callGroq([
          { role: 'system', content: IA_SYSTEM_PROMPT },
          {
            role: 'user',
            content: `Datos institucionales reales (JSON):\n${JSON.stringify(contexto, null, 2)}\n\nGenerá el análisis según tus instrucciones.`,
          },
        ])
        narrativa = typeof respuesta === 'string' ? respuesta : respuesta?.content || null
      } catch (iaErr) {
        console.warn('[IA Hub] GROQ no disponible, uso resumen local:', iaErr.message)
      }

      if (narrativa && narrativa.trim()) {
        area.innerHTML = `
          <div class="page-glass p-4 border-primary border-start border-4">
            <div class="d-flex justify-content-between align-items-center mb-3">
              <strong class="obs-ia-result-title"><i class="bi bi-stars text-primary me-2"></i>Análisis Institucional</strong>
              <span class="badge bg-success bg-opacity-15 text-success border border-success-subtle extra-small px-2.5 py-1">GROQ · datos reales</span>
            </div>
            <div class="ia-content markdown-body small obs-ia-content">${_formatMarkdown(escapeHTML(narrativa.trim()))}</div>
            <div class="d-flex gap-2 mt-3">
              <button class="btn btn-xs btn-outline-primary" id="btn-copy-report"><i class="bi bi-clipboard me-1"></i>Copiar</button>
              <a href="#/metricas-ia-reportes" class="btn btn-xs btn-outline-secondary"><i class="bi bi-file-earmark-pdf me-1"></i>Reporte completo + PDF</a>
            </div>
          </div>
        `
        state.container?.querySelector('#btn-copy-report')?.addEventListener('click', () => {
          navigator.clipboard.writeText(narrativa.trim())
          AppToast.show('Reporte copiado al portapapeles', 'success')
        })
      } else {
        const resumen = _formatAnalysisFromDSL(dslData)
        area.innerHTML = `
          <div class="page-glass p-4 border-warning border-start border-4">
            <div class="d-flex justify-content-between align-items-center mb-2">
              <strong class="obs-text-primary">Resumen automático</strong>
              <span class="badge bg-warning bg-opacity-15 text-warning border border-warning-subtle extra-small px-2 py-1">IA no disponible</span>
            </div>
            <p class="small mb-0 obs-text-secondary">${escapeHTML(resumen)}</p>
          </div>
        `
      }
    } catch (err) {
      console.error('Error en análisis IA:', err)
      area.innerHTML = `<div class="alert alert-danger small"><i class="bi bi-exclamation-triangle me-1"></i> Error al compilar análisis: ${escapeHTML(err.message)}</div>`
    }
  })
}

function _formatMarkdown(text) {
  return text
    .replace(/^### (.*$)/gim, '<h6 class="fw-bold mt-3 mb-1 obs-text-primary">$1</h6>')
    .replace(/^## (.*$)/gim, '<h5 class="fw-bold mt-3 mb-2 obs-text-primary">$1</h5>')
    .replace(/^# (.*$)/gim, '<h4 class="fw-bold mt-3 mb-2 obs-text-primary">$1</h4>')
    .replace(/^\* (.*$)/gim, '<li class="obs-md-li">$1</li>')
    .replace(/^- (.*$)/gim, '<li class="obs-md-li">$1</li>')
    .replace(/\*\*(.*?)\*\*/gim, '<strong class="obs-text-primary">$1</strong>')
    .replace(/\n\n/gim, '<br><br>')
}

function _formatAnalysisFromDSL(dslData) {
  if (!dslData) return 'Sin datos suficientes para compilar el resumen.'
  const s = state.stats || {}
  return `El período activo cuenta con ${s.alumnos_activos || 0} alumnos activos y una tasa de asistencia del ${s.tasa_asistencia_periodo || 92.5}%. Se registran ${state.resumenAlertas?.rojas || 0} alertas prioritarias en seguimiento.`
}

function _openGuiaAnaliticaModal() {
  AppModal.show({
    title: 'Guía de Interpretación Analítica',
    body: `
      <div class="obs-guia-modal-body p-2">
        <p class="obs-guia-intro">
          Este Hub centraliza los indicadores operacionales y de observabilidad de la institución.
        </p>
        <div class="vstack gap-3 mt-3">
          <div class="obs-guia-panel-card">
            <h6 class="fw-bold mb-1 obs-text-primary"><i class="bi bi-trophy text-warning me-2"></i>Cuadro de Honor & Destacados</h6>
            <p class="small mb-0 obs-text-secondary">Muestra los estudiantes con mejor desempeño académico del período evaluado.</p>
          </div>
          <div class="obs-guia-panel-card">
            <h6 class="fw-bold mb-1 obs-text-primary"><i class="bi bi-person-check-fill text-success me-2"></i>Balance de Asistencia & Solvencia</h6>
            <p class="small mb-0 obs-text-secondary">Control canónico de clases programadas contra bitácoras cerradas para emisión de nómina.</p>
          </div>
          <div class="obs-guia-panel-card">
            <h6 class="fw-bold mb-1 obs-text-primary"><i class="bi bi-terminal text-danger me-2"></i>Consola de Logs & Auditoría</h6>
            <p class="small mb-0 obs-text-secondary">Monitoreo de red, eventos PWA y trazabilidad de cambios en Supabase.</p>
          </div>
        </div>
      </div>
    `,
    footer: `<button type="button" class="btn btn-primary btn-sm rounded-pill px-4" data-bs-dismiss="modal">Entendido</button>`,
  })
}

/**
 * Public cleanup function
 */
export function destroyDashboardMetricasView() {
  _destroyAllWidgets()
  if (state._onlineListener) {
    window.removeEventListener('online', state._onlineListener)
    state._onlineListener = null
  }
  if (state._offlineListener) {
    window.removeEventListener('offline', state._offlineListener)
    state._offlineListener = null
  }
}
