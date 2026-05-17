import { AppModal } from '../../../shared/components/AppModal.js'
import { AppToast } from '../../../shared/components/AppToast.js'
import { 
  getEstadisticasPeriodoActivo, 
  getResumenAlertas, 
  getRiesgoAbandono,
  getAlumnosDestacados,
  getAlertasActivas
} from '../api/metricsApi.js'
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
      <div class="page-header">
        <div class="d-flex align-items-center gap-2">
          <span class="page-title"><i class="bi bi-cpu me-2 text-primary"></i>Analytics Hub</span>
        </div>
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
      <button class="btn btn-primary px-4 rounded-pill" id="btn-run-ia">
        <i class="bi bi-magic me-1"></i> Iniciar Análisis de IA
      </button>
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
}

function _attachGlobalEventsIA() {
  state.container.querySelector('#btn-run-ia')?.addEventListener('click', async () => {
    const area = state.container.querySelector('#ia-result-area')
    area.innerHTML = '<div class="text-center"><div class="spinner-border spinner-border-sm text-primary"></div><p class="small mt-2">Analizando datos...</p></div>'
    // Simulación de respuesta de IA (será reemplazado por groqService real)
    setTimeout(() => {
      area.innerHTML = `
        <div class="page-glass p-3 border-primary border-start border-4">
          <p class="small mb-2"><strong>Análisis Institucional:</strong></p>
          <p class="extra-small text-secondary">Basado en el rendimiento del período actual, se observa una mejora del 12% en la asistencia del grupo de Cuerdas. Sin embargo, 3 alumnos muestran un patrón de riesgo por inasistencias en la última racha de 15 días.</p>
          <button class="btn btn-xs btn-outline-primary mt-2">Copiar Reporte</button>
        </div>
      `
    }, 1500)
  })
}
