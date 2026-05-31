import { AppModal } from '../../../shared/components/AppModal.js'
import { AppToast } from '../../../shared/components/AppToast.js'
import {
  getEstadisticasPeriodoActivo,
  getResumenAlertas,
  getAlumnosDestacados,
} from '../api/metricasApi.js'
import { renderMetricCard } from '../components/MetricCard.js'
import { escapeHTML } from '../../clases/utils/clasesUtils.js'
import { systemLogsWidget } from './systemLogsWidget.js'
import { auditTrailWidget } from './auditTrailWidget.js'

const state = {
  activeTab: localStorage.getItem('pm_metrics_tab') || 'resumen',
  stats: null,
  cargando: false,
  container: null,
  activeWidgetInstance: null,
  _onlineListener: null,
  _offlineListener: null,
}

/**
 * Institutional Analytics & Observability Hub - Orquestador de Módulo (Decoupled con Widgets del Slice 2)
 */
export async function renderDashboardMetricasView(container) {
  if (!container) return
  try {
    // Destruir instancia anterior si existe para evitar fugas de memoria
    if (state.activeWidgetInstance && typeof state.activeWidgetInstance.destroy === 'function') {
      state.activeWidgetInstance.destroy()
      state.activeWidgetInstance = null
    }

    state.container = container
    state.cargando = true
    renderLoading(container)

    // Cargar datos del resumen principal
    state.stats = await getEstadisticasPeriodoActivo()
    state.resumenAlertas = await getResumenAlertas()

    state.cargando = false
    renderContent(container)
    _attachEvents(container)
  } catch (error) {
    console.error(error)
    renderError(container, error.message)
  }
}

function renderLoading(container) {
  container.innerHTML = `<div class="d-flex justify-content-center align-items-center" style="min-height: 400px;"><div class="spinner-border text-primary" role="status"></div></div>`
}

function renderError(container, msg) {
  container.innerHTML = `<div class="alert alert-danger m-3"><h5>Error analítico</h5><p>${escapeHTML(msg)}</p></div>`
}

function renderContent(container) {
  container.innerHTML = `
    <div class="page-container">
      <div class="page-header d-flex justify-content-between align-items-center flex-wrap gap-2">
        <div class="d-flex align-items-center gap-2">
          <span class="page-title"><i class="bi bi-cpu me-2 text-primary"></i>Analytics & Observability Hub</span>
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
        <div class="btn-group w-100 shadow-sm flex-wrap" role="group">
          <button class="btn btn-outline-primary ${state.activeTab === 'resumen' ? 'active' : ''}" data-tab="resumen"><i class="bi bi-speedometer2 me-1"></i> Resumen</button>
          <button class="btn btn-outline-primary ${state.activeTab === 'operaciones' ? 'active' : ''}" data-tab="operaciones"><i class="bi bi-gear-fill me-1"></i> Operaciones</button>
          <button class="btn btn-outline-primary ${state.activeTab === 'logs' ? 'active' : ''}" data-tab="logs"><i class="bi bi-terminal me-1"></i> Logs PWA</button>
          <button class="btn btn-outline-primary ${state.activeTab === 'auditoria' ? 'active' : ''}" data-tab="auditoria"><i class="bi bi-shield-check me-1"></i> Auditoría</button>
          <button class="btn btn-outline-primary ${state.activeTab === 'ia' ? 'active' : ''}" data-tab="ia"><i class="bi bi-robot me-1"></i> IA Intelligence</button>
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
  const badgeContainer = state.container.querySelector('#offline-network-badge-container')
  if (!badgeContainer) return
  const isOnline = navigator.onLine
  badgeContainer.innerHTML = isOnline
    ? `<span class="badge bg-success rounded-pill px-3 py-2 d-inline-flex align-items-center gap-1 shadow-sm"><span class="spinner-grow spinner-grow-sm text-white" style="animation-duration: 2s;" role="status"></span><i class="bi bi-cloud-check me-1"></i> Online</span>`
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

  return `
    <div class="row g-3">
      <div class="col-md-6 col-lg-3">
        ${renderMetricCard({ label: 'Alumnos Activos', value: s.total_alumnos || 0, icon: 'bi-people', color: 'primary' })}
      </div>
      <div class="col-md-6 col-lg-3">
        ${renderMetricCard({ label: 'Promedio Global', value: (s.promedio_general || 0).toFixed(2), icon: 'bi-star', color: 'success' })}
      </div>
      <div class="col-md-6 col-lg-3">
        ${renderMetricCard({ label: 'Alertas Rojas', value: ra.rojas, icon: 'bi-exclamation-octagon', color: 'danger' })}
      </div>
      <div class="col-md-6 col-lg-3">
        ${renderMetricCard({ label: 'Asistencia Hoy', value: (s.asistencia_hoy_porcentaje || 0) + '%', icon: 'bi-check2-circle', color: 'info' })}
      </div>
      
      <div class="col-12 mt-4">
        <h5 class="fw-bold mb-3"><i class="bi bi-trophy me-2 text-warning"></i>Alumnos Destacados</h5>
        <div class="page-glass p-0 overflow-hidden">
          <div id="destacados-placeholder" class="p-4 text-center text-muted">Cargando destacados...</div>
        </div>
      </div>
    </div>
  `
}

function renderOperacionesTab() {
  return `
    <div class="page-glass p-4">
      <div class="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
        <h5 class="fw-bold m-0"><i class="bi bi-gear-wide-connected text-primary me-2"></i>Monitoreo de Operaciones y Cumplimiento Docente</h5>
        <span class="badge bg-primary bg-opacity-10 text-primary border border-primary-subtle px-3 py-1.5 rounded-pill">Cruces de Rendimiento</span>
      </div>
      <div class="alert alert-info small mb-4">
        <i class="bi bi-info-circle me-1"></i> <strong>Punto Ciego Analítico:</strong> Este panel cruza la tasa de asistencia de los estudiantes con las demoras y cumplimiento de llenado de registros por parte del personal docente.
      </div>
      <div class="row g-4">
        <div class="col-12 col-xl-7">
          <div class="p-3 border rounded-3 bg-light bg-opacity-25 shadow-sm">
            <h6 class="fw-bold mb-3"><i class="bi bi-person-badge text-primary me-1"></i>Estado de Cumplimiento Docente</h6>
            <div id="cumplimiento-maestros-container">
              <div class="text-center py-5"><div class="spinner-border spinner-border-sm text-primary"></div></div>
            </div>
          </div>
        </div>
        <div class="col-12 col-xl-5">
          <div class="p-3 border rounded-3 bg-light bg-opacity-25 shadow-sm">
            <h6 class="fw-bold mb-3"><i class="bi bi-graph-up-arrow text-primary me-1"></i>Velocidad de Llenado de Registros</h6>
            <div id="comportamiento-llenado-container">
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
        <h5 class="fw-bold m-0"><i class="bi bi-terminal-fill text-danger me-2"></i>Consola Técnica y Monitor de Red</h5>
        <button class="btn btn-sm btn-outline-secondary" id="btn-clear-logs"><i class="bi bi-trash me-1"></i>Limpiar Consola</button>
      </div>
      <!-- Widget Modular de Logs Técnicos -->
      <div id="system-logs-container">
        <div class="text-center py-5"><div class="spinner-border spinner-border-sm text-primary"></div></div>
      </div>
    </div>
  `
}

function renderAuditoriaTab() {
  return `
    <div class="page-glass p-4">
      <!-- Widget Modular de Auditoría -->
      <div id="audit-trail-container">
        <div class="text-center py-5"><div class="spinner-border spinner-border-sm text-primary"></div></div>
      </div>
    </div>
  `
}

function renderIATab() {
  return `
    <div class="text-center py-5">
      <i class="bi bi-robot fs-1 text-primary d-block mb-3 animate-bell"></i>
      <h5>SOI Intelligence</h5>
      <p class="text-muted">Genera un análisis narrativo del estado actual de tu grupo.</p>
      <div class="d-flex justify-content-center gap-2 flex-wrap">
        <button class="btn btn-primary px-4 rounded-pill" id="btn-run-ia">
          <i class="bi bi-magic me-1"></i> Iniciar Análisis de IA
        </button>
        <a href="#/metricas-ia-reportes" class="btn btn-outline-secondary px-4 rounded-pill">
          <i class="bi bi-file-earmark-richtext me-1"></i> Generador de Reportes Completo
        </a>
      </div>
      <div id="ia-result-area" class="mt-4 text-start" style="max-width: 600px; margin: 0 auto;"></div>
    </div>
  `
}

function _attachEvents(container) {
  container.querySelectorAll('[data-tab]').forEach((btn) => {
    btn.addEventListener('click', () => {
      // Limpiar widgets anteriores si existen
      if (state.activeWidgetInstance && typeof state.activeWidgetInstance.destroy === 'function') {
        state.activeWidgetInstance.destroy()
        state.activeWidgetInstance = null
      }

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

  // Listeners de Red para reactividad del Badge del Hub
  // Store references for cleanup in destroy()
  state._onlineListener = _updateOfflineBadge
  state._offlineListener = _updateOfflineBadge
  window.addEventListener('online', state._onlineListener)
  window.addEventListener('offline', state._offlineListener)

  // Ejecutar carga de datos específica de la pestaña
  _onTabChange()
}

async function _onTabChange() {
  if (state.activeTab === 'resumen') {
    const destacados = await getAlumnosDestacados()
    const area = state.container.querySelector('#destacados-placeholder')
    if (area) {
      area.className = ''
      area.innerHTML = `
        <table class="table table-compact table-hover mb-0">
          <tbody class="small">
            ${destacados
              .slice(0, 5)
              .map(
                (d) => `
              <tr>
                <td><i class="bi bi-award text-warning me-2"></i><strong>${escapeHTML(d.nombre_completo)}</strong></td>
                <td><span class="badge bg-success bg-opacity-10 text-success border border-success-subtle">${d.promedio}</span></td>
                <td class="text-muted">${escapeHTML(d.programa)}</td>
              </tr>
            `,
              )
              .join('')}
          </tbody>
        </table>
      `
    }
  }

  if (state.activeTab === 'operaciones') {
    // 1. CumplimientoMaestrosWidget
    try {
      const { CumplimientoMaestrosWidget } =
        await import('../../admin-dashboard/views/cumplimientoMaestrosWidget.js')
      const widget = new CumplimientoMaestrosWidget('cumplimiento-maestros-container')
      await widget.init()
    } catch (err) {
      console.error('Error al cargar el widget de CumplimientoMaestrosWidget:', err)
      const el = state.container.querySelector('#cumplimiento-maestros-container')
      if (el)
        el.innerHTML = `<div class="alert alert-warning small"><i class="bi bi-exclamation-circle me-1"></i> No se pudo instanciar el Cumplimiento de Maestros.</div>`
    }

    // 2. analyticsFillingBehaviorWidget
    try {
      const { analyticsFillingBehaviorWidget } =
        await import('../../admin-dashboard/views/analyticsFillingBehaviorWidget.js')
      const widget = analyticsFillingBehaviorWidget('comportamiento-llenado-container')
      await widget.init()
    } catch (err) {
      console.error('Error al cargar el widget de Comportamiento de Llenado:', err)
      const el = state.container.querySelector('#comportamiento-llenado-container')
      if (el)
        el.innerHTML = `<div class="alert alert-warning small"><i class="bi bi-exclamation-circle me-1"></i> No se pudo instanciar la Analítica de Llenado.</div>`
    }
  }

  if (state.activeTab === 'logs') {
    // Instanciar widget modular del Slice 2
    const logger = systemLogsWidget('system-logs-container')
    state.activeWidgetInstance = logger
    await logger.init()
  }

  if (state.activeTab === 'auditoria') {
    // Instanciar widget modular del Slice 2
    const audit = auditTrailWidget('audit-trail-container')
    state.activeWidgetInstance = audit
    await audit.init()
  }

  if (state.activeTab === 'ia') {
    _attachGlobalEventsIA()
  }
}

function _attachGlobalEventsIA() {
  state.container.querySelector('#btn-run-ia')?.addEventListener('click', async () => {
    const area = state.container.querySelector('#ia-result-area')
    if (!area) return
    area.innerHTML =
      '<div class="text-center"><div class="spinner-border spinner-border-sm text-primary"></div><p class="small mt-2">Analizando datos...</p></div>'
    // Simulación de respuesta de IA (será reemplazado por groqService real)
    setTimeout(() => {
      area.innerHTML = `
        <div class="page-glass p-3 border-primary border-start border-4">
          <p class="small mb-2"><strong>Análisis Institucional:</strong></p>
          <p class="extra-small text-secondary">Basado en el rendimiento del período actual, se observa una mejora del 12% en la asistencia del grupo de Cuerdas. Sin embargo, 3 alumnos muestran un patrón de riesgo por inasistencias en la última racha de 15 días.</p>
          <button class="btn btn-xs btn-outline-primary mt-2" id="btn-copy-report">Copiar Reporte</button>
        </div>
      `

      // Adjuntar evento de copiado
      state.container.querySelector('#btn-copy-report')?.addEventListener('click', () => {
        navigator.clipboard.writeText(area.querySelector('p.text-secondary').innerText)
        AppToast.show('Reporte copiado al portapapeles', 'success')
      })
    }, 1500)
  })
}

function _openGuiaAnaliticaModal() {
  const content = `
    <style>
      .guia-modal-body {
        font-family: 'Outfit', 'Inter', -apple-system, sans-serif;
      }
      .guia-tab-btn {
        background: none;
        border: none;
        border-radius: 10px;
        color: var(--pm-text-muted, #6c757d);
        padding: 0.75rem 1rem;
        text-align: left;
        transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
        font-weight: 500;
        display: flex;
        align-items: center;
        gap: 0.75rem;
        width: 100%;
        font-size: 0.875rem;
        position: relative;
        overflow: hidden;
      }
      .guia-tab-btn:hover {
        background: rgba(var(--bs-primary-rgb, 13, 110, 253), 0.04);
        color: var(--bs-primary, #0d6efd);
        padding-left: 1.15rem;
      }
      .guia-tab-btn.active {
        background: rgba(var(--bs-primary-rgb, 13, 110, 253), 0.08) !important;
        color: var(--bs-primary, #0d6efd) !important;
        font-weight: 600;
        padding-left: 1.15rem;
      }
      .guia-tab-btn.active::before {
        content: '';
        position: absolute;
        left: 0;
        top: 20%;
        height: 60%;
        width: 3px;
        background: var(--bs-primary, #0d6efd);
        border-radius: 0 4px 4px 0;
      }
      
      .guia-panel-card {
        background: rgba(var(--bs-body-bg-rgb, 255, 255, 255), 0.5);
        backdrop-filter: blur(8px);
        -webkit-backdrop-filter: blur(8px);
        border: 1px solid rgba(var(--bs-border-color-rgb, 222, 226, 230), 0.15);
        border-radius: 14px;
        padding: 1.25rem;
        transition: all 0.25s ease;
      }
      .guia-panel-card:hover {
        transform: translateY(-1px);
        border-color: rgba(var(--bs-primary-rgb, 13, 110, 253), 0.25);
      }
      .guia-icon-box {
        width: 38px;
        height: 38px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 10px;
        font-size: 1.1rem;
        flex-shrink: 0;
      }
      
      .guia-data-badge {
        background: rgba(var(--bs-body-color-rgb, 33, 37, 41), 0.03);
        border: 1px solid rgba(var(--bs-border-color-rgb, 222, 226, 230), 0.2);
        border-radius: 8px;
        padding: 0.4rem 0.65rem;
        font-size: 0.725rem;
        font-family: var(--bs-font-monospace, monospace);
        color: var(--pm-text-muted, #6c757d);
        display: inline-flex;
        align-items: center;
      }

      .guia-formula-box {
        background: linear-gradient(135deg, rgba(var(--bs-body-bg-rgb, 255, 255, 255), 0.8) 0%, rgba(var(--bs-tertiary-bg-rgb, 248, 249, 250), 0.8) 100%);
        border: 1px dashed rgba(var(--bs-border-color-rgb, 222, 226, 230), 0.7);
        border-radius: 12px;
        padding: 1.15rem;
      }
    </style>

    <div class="guia-modal-body container-fluid p-0">
      <div class="row g-0 flex-column flex-md-row">
        <!-- Barra de navegación lateral -->
        <div class="col-12 col-md-4 border-end pb-3 pb-md-0 pe-md-3 mb-3 mb-md-0" style="border-color: rgba(var(--bs-border-color-rgb, 222, 226, 230), 0.15) !important;">
          <div class="d-flex flex-row flex-md-column gap-1 overflow-x-auto overflow-y-hidden" id="guia-modal-tabs" style="scrollbar-width: none;">
            <button class="guia-tab-btn active text-nowrap" data-guia="resumen" type="button">
              <i class="bi bi-speedometer2"></i>
              <span>Resumen & KPIs</span>
            </button>
            <button class="guia-tab-btn text-nowrap" data-guia="operaciones" type="button">
              <i class="bi bi-gear-fill"></i>
              <span>Operaciones & Docencia</span>
            </button>
            <button class="guia-tab-btn text-nowrap" data-guia="logs" type="button">
              <i class="bi bi-terminal"></i>
              <span>Logs de Sistema</span>
            </button>
            <button class="guia-tab-btn text-nowrap" data-guia="auditoria" type="button">
              <i class="bi bi-shield-check"></i>
              <span>Auditoría Trail</span>
            </button>
            <button class="guia-tab-btn text-nowrap" data-guia="ia" type="button">
              <i class="bi bi-robot"></i>
              <span>SOI Intelligence</span>
            </button>
          </div>
        </div>

        <!-- Panel de contenidos principal -->
        <div class="col-12 col-md-8 ps-md-3">
          <div class="guia-panels-content">
            
            <!-- PANEL RESUMEN -->
            <div class="guia-panel active" id="pane-resumen">
              <div class="d-flex align-items-center gap-3 mb-3">
                <div class="guia-icon-box bg-primary bg-opacity-10 text-primary">
                  <i class="bi bi-speedometer2"></i>
                </div>
                <div>
                  <h6 class="fw-bold mb-0" style="font-size:1rem; letter-spacing:-0.01em;">Métricas Macro y KPIs de Control</h6>
                  <p class="extra-small text-muted mb-0">El pulso integral del período académico en tiempo real.</p>
                </div>
              </div>
              <hr class="my-3 opacity-25">
              <div class="vstack gap-3">
                <div class="guia-panel-card">
                  <div class="d-flex align-items-center justify-content-between mb-2">
                    <span class="fw-bold small text-primary" style="letter-spacing: -0.01em; font-size:0.825rem;">Resumen General</span>
                    <span class="badge bg-primary bg-opacity-10 text-primary border border-primary-subtle extra-small">KPIs</span>
                  </div>
                  <p class="extra-small text-secondary mb-3 lh-base">
                    Consolida a nivel institucional la cantidad de estudiantes inscritos, el promedio general y el porcentaje de asistencia de la fecha actual.
                  </p>
                  <div class="guia-data-badge">
                    <i class="bi bi-database me-1 text-primary"></i> vw_estadisticas_periodo
                  </div>
                </div>
                
                <div class="guia-panel-card">
                  <div class="d-flex align-items-center justify-content-between mb-2">
                    <span class="fw-bold small text-warning" style="letter-spacing: -0.01em; font-size:0.825rem;">Alumnos Destacados</span>
                    <span class="badge bg-warning bg-opacity-10 text-warning border border-warning-subtle extra-small">Rendimiento</span>
                  </div>
                  <p class="extra-small text-secondary mb-3 lh-base">
                    Identifica automáticamente a los alumnos sobresalientes con un promedio ponderado mayor o igual a <strong>9.50</strong> para visibilizar e incentivar el mérito académico.
                  </p>
                  <div class="guia-data-badge">
                    <i class="bi bi-database me-1 text-warning"></i> vw_destacados_y_riesgo_academico
                  </div>
                </div>
              </div>
            </div>

            <!-- PANEL OPERACIONES -->
            <div class="guia-panel d-none" id="pane-operaciones">
              <div class="d-flex align-items-center gap-3 mb-3">
                <div class="guia-icon-box bg-primary bg-opacity-10 text-primary">
                  <i class="bi bi-gear-fill"></i>
                </div>
                <div>
                  <h6 class="fw-bold mb-0" style="font-size:1rem; letter-spacing:-0.01em;">Cumplimiento Operativo y Docencia</h6>
                  <p class="extra-small text-muted mb-0">Cruce dinámico del llenado de clases y estadísticas operativas.</p>
                </div>
              </div>
              <hr class="my-3 opacity-25">
              <div class="vstack gap-3">
                <div class="guia-panel-card">
                  <span class="fw-bold small text-primary d-block mb-2">Detección de Puntos Ciegos</span>
                  <p class="extra-small text-secondary mb-0 lh-base">
                    Estudia si el ausentismo estudiantil coincide con retrasos u omisión de registros de asistencia por parte de maestros en categoría irregular o negligente.
                  </p>
                </div>
              </div>
            </div>

            <!-- PANEL LOGS -->
            <div class="guia-panel d-none" id="pane-logs">
              <div class="d-flex align-items-center gap-3 mb-3">
                <div class="guia-icon-box bg-danger bg-opacity-10 text-danger">
                  <i class="bi bi-terminal"></i>
                </div>
                <div>
                  <h6 class="fw-bold mb-0" style="font-size:1rem; letter-spacing:-0.01em;">Consola de Depuración del Cliente (PWA)</h6>
                  <p class="extra-small text-muted mb-0">Monitoreo de excepciones técnicas, red y tolerancia offline.</p>
                </div>
              </div>
              <hr class="my-3 opacity-25">
              <div class="vstack gap-3">
                <div class="guia-panel-card">
                  <span class="fw-bold small text-danger d-block mb-2">Excepciones de Red y RLS</span>
                  <p class="extra-small text-secondary mb-0 lh-base">
                    Muestra fallas al ejecutar políticas de seguridad en la base de datos o caídas en la conexión de Internet del cliente, con logs persistidos.
                  </p>
                </div>
              </div>
            </div>

            <!-- PANEL AUDITORIA -->
            <div class="guia-panel d-none" id="pane-auditoria">
              <div class="d-flex align-items-center gap-3 mb-3">
                <div class="guia-icon-box bg-success bg-opacity-10 text-success">
                  <i class="bi bi-shield-check"></i>
                </div>
                <div>
                  <h6 class="fw-bold mb-0" style="font-size:1rem; letter-spacing:-0.01em;">Audit Trail - Control de Cambios</h6>
                  <p class="extra-small text-muted mb-0">Trazabilidad histórica de todas las solicitudes y aprobaciones de ausencias.</p>
                </div>
              </div>
              <hr class="my-3 opacity-25">
              <div class="vstack gap-3">
                <div class="guia-panel-card">
                  <span class="fw-bold small text-success d-block mb-2">Inmutabilidad Histórica</span>
                  <p class="extra-small text-secondary mb-0 lh-base">
                    Cada vez que un maestro o administrador crea, aprueba o rechaza una ausencia, se graba un log transaccional no-modificable para prevenir el fraude.
                  </p>
                </div>
              </div>
            </div>

            <!-- PANEL IA -->
            <div class="guia-panel d-none" id="pane-ia">
              <div class="d-flex align-items-center gap-3 mb-3">
                <div class="guia-icon-box bg-info bg-opacity-10 text-info">
                  <i class="bi bi-robot"></i>
                </div>
                <div>
                  <h6 class="fw-bold mb-0" style="font-size:1rem; letter-spacing:-0.01em;">SOI Intelligence - IA de Confianza</h6>
                  <p class="extra-small text-muted mb-0">Modelos generativos (Groq) con inyección de contexto rigurosa.</p>
                </div>
              </div>
              <hr class="my-3 opacity-25">
              <div class="vstack gap-3">
                <div class="guia-panel-card border-start border-3 border-info">
                  <span class="badge bg-info bg-opacity-10 text-info border border-info-subtle extra-small mb-2">Protocolo Antialucinaciones</span>
                  <p class="extra-small text-secondary mb-0 lh-base">
                    Para asegurar análisis veraces, la IA no tiene acceso general a la base de datos transaccional. En su lugar, el sistema compila paquetes de datos agregados en JSON provenientes de las vistas consolidadas según el tipo de reporte solicitado.
                  </p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  `

  AppModal.open({
    title: 'Guía de Análisis Académico y Observabilidad',
    body: content,
    size: 'lg',
    hideSave: true,
    cancelText: 'Entendido',
    onShow: (bodyEl) => {
      // Registrar evento de pestañas dinámicas internas del modal
      const tabs = bodyEl.querySelectorAll('#guia-modal-tabs button')
      const panels = bodyEl.querySelectorAll('.guia-panel')

      tabs.forEach((tab) => {
        tab.addEventListener('click', () => {
          // Remover clase activa de todos los tabs
          tabs.forEach((t) => t.classList.remove('active'))
          // Añadir a este tab
          tab.classList.add('active')

          // Ocultar todos los paneles
          panels.forEach((p) => p.classList.add('d-none'))
          // Mostrar el panel correspondiente
          const targetPane = bodyEl.querySelector(`#pane-${tab.dataset.guia}`)
          if (targetPane) {
            targetPane.classList.remove('d-none')
          }
        })
      })
    },
  })
}

/**
 * Destruye la instancia del dashboard de métricas y libera recursos.
 * Elimina event listeners globales y destruye widgets hijos activos.
 */
export function destroyDashboardMetricasView() {
  // Destruir widget activo si existe
  if (state.activeWidgetInstance && typeof state.activeWidgetInstance.destroy === 'function') {
    state.activeWidgetInstance.destroy()
    state.activeWidgetInstance = null
  }

  // Remover listeners globales de red
  if (state._onlineListener) {
    window.removeEventListener('online', state._onlineListener)
    state._onlineListener = null
  }
  if (state._offlineListener) {
    window.removeEventListener('offline', state._offlineListener)
    state._offlineListener = null
  }

  // Limpiar estado
  state.container = null
  state.stats = null
  state.cargando = false
}
