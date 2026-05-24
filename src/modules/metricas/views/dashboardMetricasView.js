import { AppModal } from '../../../shared/components/AppModal.js'
import { AppToast } from '../../../shared/components/AppToast.js'
import { 
  getEstadisticasPeriodoActivo, 
  getResumenAlertas, 
  getRiesgoAbandono,
  getAlumnosDestacados,
  getAlertasActivas
} from '../api/metricasApi.js'
import { renderMetricCard } from '../components/MetricCard.js'
import { escapeHTML } from '../../clases/utils/clasesUtils.js'

const state = {
  activeTab: localStorage.getItem('pm_metrics_tab') || 'resumen',
  stats: null,
  alertas: [],
  riesgo: [],
  cargando: false,
  container: null
}

/**
 * Institutional Analytics Hub - Orquestador de Métricas
 */
export async function renderDashboardMetricasView(container) {
  if (!container) return
  try {
    state.container = container
    state.cargando = true
    renderLoading(container)

    // Cargar datos iniciales (KPIs)
    state.stats = await getEstadisticasPeriodoActivo()
    const resumenAlertas = await getResumenAlertas()
    state.resumenAlertas = resumenAlertas

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
          <span class="page-title"><i class="bi bi-cpu me-2 text-primary"></i>Analytics Hub</span>
        </div>
        <button id="btn-guia-analisis" class="btn btn-outline-primary rounded-pill px-3 py-1.5 d-flex align-items-center gap-2 small fw-semibold transition-all">
          <i class="bi bi-info-circle-fill"></i>
          <span>Guía de Análisis</span>
        </button>
      </div>

      <div class="pm-tabs-container mb-4">
        <div class="btn-group w-100 shadow-sm" role="group">
          <button class="btn btn-outline-primary ${state.activeTab === 'resumen' ? 'active' : ''}" data-tab="resumen"><i class="bi bi-speedometer2 me-1"></i> Resumen</button>
          <button class="btn btn-outline-primary ${state.activeTab === 'alertas' ? 'active' : ''}" data-tab="alertas"><i class="bi bi-bell me-1"></i> Alertas</button>
          <button class="btn btn-outline-primary ${state.activeTab === 'riesgo' ? 'active' : ''}" data-tab="riesgo"><i class="bi bi-shield-exclamation me-1"></i> Riesgo</button>
          <button class="btn btn-outline-primary ${state.activeTab === 'ia' ? 'active' : ''}" data-tab="ia"><i class="bi bi-robot me-1"></i> IA Analysis</button>
        </div>
      </div>

      <div id="hub-content">
        ${renderTabContent()}
      </div>
    </div>
  `
}

function renderTabContent() {
  switch (state.activeTab) {
    case 'resumen': return renderResumenTab()
    case 'alertas': return renderAlertasTab()
    case 'riesgo': return renderRiesgoTab()
    case 'ia': return renderIATab()
    default: return renderResumenTab()
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

function renderAlertasTab() {
  return `
    <div class="page-glass p-4">
      <div class="d-flex justify-content-between align-items-center mb-4">
        <h5 class="fw-bold m-0">Alertas de Seguimiento Académico</h5>
        <span class="badge bg-danger">${state.resumenAlertas?.rojas || 0} Críticas</span>
      </div>
      <div id="alertas-list-container">
        <div class="text-center py-5"><div class="spinner-border spinner-border-sm text-primary"></div></div>
      </div>
    </div>
  `
}

function renderRiesgoTab() {
  return `
    <div class="page-glass p-4">
      <h5 class="fw-bold mb-4">Análisis Proactivo de Riesgo de Abandono</h5>
      <div class="alert alert-info small mb-4">
        <i class="bi bi-info-circle me-1"></i> El puntaje de riesgo se calcula combinando racha de ausencias, promedio académico y participación.
      </div>
      <div id="riesgo-list-container">
        <div class="text-center py-5"><div class="spinner-border spinner-border-sm text-primary"></div></div>
      </div>
    </div>
  `
}

function renderIATab() {
  return `
    <div class="text-center py-5">
      <i class="bi bi-robot fs-1 text-primary d-block mb-3"></i>
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
  container.querySelectorAll('[data-tab]').forEach(btn => {
    btn.addEventListener('click', () => {
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
            ${destacados.slice(0, 5).map(d => `
              <tr>
                <td><i class="bi bi-award text-warning me-2"></i><strong>${escapeHTML(d.nombre_completo)}</strong></td>
                <td><span class="badge bg-success bg-opacity-10 text-success border border-success-subtle">${d.promedio}</span></td>
                <td class="text-muted">${escapeHTML(d.programa)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      `
    }
  }

  if (state.activeTab === 'alertas') {
    const alertas = await getAlertasActivas()
    const area = state.container.querySelector('#alertas-list-container')
    if (area) {
      area.innerHTML = alertas.length === 0 
        ? '<p class="text-center text-muted">No hay alertas activas.</p>'
        : alertas.map(a => `
          <div class="alert-item d-flex align-items-center gap-3 p-3 border-bottom">
            <div class="bg-${a.color} rounded-circle" style="width:12px;height:12px;"></div>
            <div class="flex-grow-1">
              <div class="fw-bold small">${escapeHTML(a.nombre_alumno)}</div>
              <div class="extra-small text-muted">${escapeHTML(a.descripcion_alerta)}</div>
            </div>
            <div class="text-end small text-muted">${a.fecha_referencia}</div>
          </div>
        `).join('')
    }
  }

  if (state.activeTab === 'riesgo') {
    const riesgo = await getRiesgoAbandono()
    const area = state.container.querySelector('#riesgo-list-container')
    if (area) {
      area.innerHTML = `
        <table class="table table-compact table-hover">
          <thead><tr><th>Alumno</th><th class="text-center">Score</th><th>Nivel</th></tr></thead>
          <tbody class="small">
            ${riesgo.map(r => `
              <tr>
                <td>${escapeHTML(r.nombre_completo)}</td>
                <td class="text-center fw-bold">${r.score_riesgo}</td>
                <td><span class="badge bg-${r.nivel_riesgo === 'alto' ? 'danger' : 'warning'}">${r.nivel_riesgo.toUpperCase()}</span></td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      `
    }
  }

  if (state.activeTab === 'ia') {
    _attachGlobalEventsIA()
  }
}

function _attachGlobalEventsIA() {
  state.container.querySelector('#btn-run-ia')?.addEventListener('click', async () => {
    const area = state.container.querySelector('#ia-result-area')
    if (!area) return
    area.innerHTML = '<div class="text-center"><div class="spinner-border spinner-border-sm text-primary"></div><p class="small mt-2">Analizando datos...</p></div>'
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
            <button class="guia-tab-btn text-nowrap" data-guia="alertas" type="button">
              <i class="bi bi-bell"></i>
              <span>Alertas Activas</span>
            </button>
            <button class="guia-tab-btn text-nowrap" data-guia="riesgo" type="button">
              <i class="bi bi-shield-exclamation"></i>
              <span>Riesgo de Abandono</span>
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

            <!-- PANEL ALERTAS -->
            <div class="guia-panel d-none" id="pane-alertas">
              <div class="d-flex align-items-center gap-3 mb-3">
                <div class="guia-icon-box bg-danger bg-opacity-10 text-danger">
                  <i class="bi bi-bell"></i>
                </div>
                <div>
                  <h6 class="fw-bold mb-0" style="font-size:1rem; letter-spacing:-0.01em;">Seguimiento Reactivo e Incidencias</h6>
                  <p class="extra-small text-muted mb-0">Detección y respuesta ante eventualidades escolares.</p>
                </div>
              </div>
              <hr class="my-3 opacity-25">
              <div class="vstack gap-3">
                <div class="guia-panel-card">
                  <div class="d-flex align-items-center gap-2 mb-2">
                    <div class="bg-danger rounded-circle" style="width: 7px; height: 7px;"></div>
                    <span class="fw-bold small text-danger" style="font-size:0.825rem;">Alertas Críticas (Rojas)</span>
                  </div>
                  <p class="extra-small text-secondary mb-0 lh-base">
                    Disparadas ante ausencias reiteradas e injustificadas o por comentarios de prioridad alta registrados por los maestros (ej. incidentes graves, bajo rendimiento crónico).
                  </p>
                </div>

                <div class="guia-panel-card">
                  <div class="d-flex align-items-center gap-2 mb-2">
                    <div class="bg-warning rounded-circle" style="width: 7px; height: 7px;"></div>
                    <span class="fw-bold small text-warning" style="font-size:0.825rem;">Alertas Amarillas (Preventivas)</span>
                  </div>
                  <p class="extra-small text-secondary mb-0 lh-base">
                    Avisos tempranos que indican una primera falta injustificada o baja participación, permitiendo al equipo de tutores intervenir preventivamente.
                  </p>
                </div>

                <div class="guia-panel-card bg-light bg-opacity-25 border-dashed">
                  <p class="extra-small text-secondary mb-2 lh-base">
                    Las alertas cruzan de forma reactiva la asistencia diaria y las observaciones docentes con los perfiles curriculares de los estudiantes.
                  </p>
                  <div class="guia-data-badge">
                    <i class="bi bi-database me-1 text-danger"></i> vw_alertas_activas
                  </div>
                </div>
              </div>
            </div>

            <!-- PANEL RIESGO -->
            <div class="guia-panel d-none" id="pane-riesgo">
              <div class="d-flex align-items-center gap-3 mb-3">
                <div class="guia-icon-box bg-warning bg-opacity-10 text-warning">
                  <i class="bi bi-shield-exclamation"></i>
                </div>
                <div>
                  <h6 class="fw-bold mb-0" style="font-size:1rem; letter-spacing:-0.01em;">Modelo de Riesgo de Deserción</h6>
                  <p class="extra-small text-muted mb-0">Algoritmo predictivo para interceptar la deserción escolar.</p>
                </div>
              </div>
              <hr class="my-3 opacity-25">
              <div class="vstack gap-3">
                <div class="guia-formula-box">
                  <div class="small fw-bold text-primary mb-2 d-flex align-items-center gap-2">
                    <i class="bi bi-calculator"></i> Ponderación Algorítmica
                  </div>
                  <p class="extra-small text-secondary mb-3 lh-base">
                    El score predictivo combina la <strong>racha de inasistencias en los últimos 15 días</strong> y la <strong>caída del promedio general</strong> del estudiante en el período activo.
                  </p>
                  
                  <div class="row g-2 text-center">
                    <div class="col-6">
                      <div class="p-2 border border-danger-subtle bg-danger bg-opacity-10 text-danger rounded-3 extra-small">
                        <div class="fw-bold" style="font-size: 0.725rem;">Riesgo Alto</div>
                        <div class="extra-small opacity-75 font-monospace mt-1" style="font-size:0.625rem;">Racha > 3 O Promedio < 5.0</div>
                      </div>
                    </div>
                    <div class="col-6">
                      <div class="p-2 border border-warning-subtle bg-warning bg-opacity-10 text-warning rounded-3 extra-small">
                        <div class="fw-bold" style="font-size: 0.725rem;">Riesgo Medio</div>
                        <div class="extra-small opacity-75 font-monospace mt-1" style="font-size:0.625rem;">Racha = 2 O Promedio < 7.0</div>
                      </div>
                    </div>
                  </div>
                </div>

                <div class="guia-panel-card">
                  <p class="extra-small text-secondary mb-3 lh-base">
                    El score predictivo se recalcula automáticamente en base de datos cada vez que un docente asienta una asistencia o califica una evaluación.
                  </p>
                  <div class="guia-data-badge">
                    <i class="bi bi-database me-1 text-warning"></i> vw_riesgo_abandono
                  </div>
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

                <div class="guia-panel-card">
                  <div class="fw-bold small text-secondary mb-2" style="font-size: 0.775rem;">Estructura de Datos inyectados:</div>
                  <div class="vstack gap-2 extra-small">
                    <div class="d-flex align-items-start gap-2 py-1">
                      <i class="bi bi-circle-fill text-info mt-1.5" style="font-size:0.35rem;"></i>
                      <div><strong>Analítica Institucional</strong>: Combina <code>vw_estadisticas_periodo</code> y estadísticas de rendimiento docente para correlacionar factores organizacionales.</div>
                    </div>
                    <div class="d-flex align-items-start gap-2 py-1">
                      <i class="bi bi-circle-fill text-info mt-1.5" style="font-size:0.35rem;"></i>
                      <div><strong>Foco de Deserción</strong>: Filtra exclusivamente los alumnos en <code>vw_riesgo_abandono</code> para estructurar planes de intervención y tutoría.</div>
                    </div>
                    <div class="d-flex align-items-start gap-2 py-1">
                      <i class="bi bi-circle-fill text-info mt-1.5" style="font-size:0.35rem;"></i>
                      <div><strong>Progreso Escolar</strong>: Agrupa los promedios de <code>vw_destacados_y_riesgo_academico</code> por cátedra instrumental para redactar boletines periódicos.</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  `

  AppModal.open({
    title: 'Guía de Análisis Académico',
    body: content,
    size: 'lg',
    hideSave: true,
    cancelText: 'Entendido',
    onShow: (bodyEl) => {
      // Registrar evento de pestañas dinámicas internas del modal
      const tabs = bodyEl.querySelectorAll('#guia-modal-tabs button')
      const panels = bodyEl.querySelectorAll('.guia-panel')

      tabs.forEach(tab => {
        tab.addEventListener('click', () => {
          // Remover clase activa de todos los tabs
          tabs.forEach(t => t.classList.remove('active'))
          // Añadir a este tab
          tab.classList.add('active')

          // Ocultar todos los paneles
          panels.forEach(p => p.classList.add('d-none'))
          // Mostrar el panel correspondiente
          const targetPane = bodyEl.querySelector(`#pane-${tab.dataset.guia}`)
          if (targetPane) {
            targetPane.classList.remove('d-none')
          }
        })
      })
    }
  })
}


