import { router } from '../../core/router/router.js'
import { renderPatronAsistenciaView } from './views/patronAsistenciaView.js'
import { renderIaAnalisisView } from './views/iaAnalisisView.js'
import { renderIaReporteGeneradorView } from './views/iaReporteGeneradorView.js'
import { renderMetricasSubNav } from './components/metricasSubNav.js'

// Envuelve cualquier vista del módulo con el sub-nav de métricas
function withSubNav(routeId, viewFn) {
  return async (container) => {
    container.innerHTML = ''
    const subNav = renderMetricasSubNav(routeId)
    container.appendChild(subNav)

    const content = document.createElement('div')
    content.className = 'metricas-content'
    container.appendChild(content)

    await viewFn(content)
  }
}

// Lazy loaders con cache
let _dashboard, _alertas, _riesgo, _maestros, _destacados, _periodos

async function lazyDashboard(container) {
  if (!_dashboard) {
    try {
      const mod = await import('./views/dashboardMetricasView.js')
      _dashboard = mod.renderDashboardMetricasView
    } catch {
      _dashboard = (c) => { c.innerHTML = renderStubHTML('Dashboard de Métricas') }
    }
  }
  return _dashboard(container)
}

async function lazyAlertas(container) {
  if (!_alertas) {
    try {
      const mod = await import('./views/alertasView.js')
      _alertas = mod.renderAlertasView
    } catch {
      _alertas = (c) => { c.innerHTML = renderStubHTML('Panel de Alertas') }
    }
  }
  return _alertas(container)
}

async function lazyRiesgo(container) {
  if (!_riesgo) {
    try {
      const mod = await import('./views/riesgoAbandonoView.js')
      _riesgo = mod.renderRiesgoAbandonoView
    } catch {
      _riesgo = (c) => { c.innerHTML = renderStubHTML('Riesgo de Abandono') }
    }
  }
  return _riesgo(container)
}

async function lazyMaestros(container) {
  if (!_maestros) {
    try {
      const mod = await import('./views/rendimientoMaestrosView.js')
      _maestros = mod.renderRendimientoMaestrosView
    } catch {
      _maestros = (c) => { c.innerHTML = renderStubHTML('Rendimiento de Maestros') }
    }
  }
  return _maestros(container)
}

async function lazyDestacados(container) {
  if (!_destacados) {
    try {
      const mod = await import('./views/destacadosView.js')
      _destacados = mod.renderDestacadosView
    } catch {
      _destacados = (c) => { c.innerHTML = renderStubHTML('Destacados y Riesgo Académico') }
    }
  }
  return _destacados(container)
}

async function lazyPeriodos(container) {
  if (!_periodos) {
    try {
      const mod = await import('../periodos/views/periodosView.js')
      _periodos = mod.renderPeriodosView
    } catch {
      _periodos = (c) => { c.innerHTML = renderStubHTML('Gestión de Períodos') }
    }
  }
  return _periodos(container)
}

function renderStubHTML(label) {
  return `
    <div class="p-4 text-center py-5">
      <div class="fs-1 mb-3">🔧</div>
      <h5 class="text-muted">${label}</h5>
      <p class="text-muted small">Este módulo está siendo cargado...</p>
    </div>
  `
}

export function registerRoutesMetricas() {
  router.register('metricas',           withSubNav('metricas',           lazyDashboard))
  router.register('metricas-alertas',   withSubNav('metricas-alertas',   lazyAlertas))
  router.register('metricas-riesgo',    withSubNav('metricas-riesgo',    lazyRiesgo))
  router.register('metricas-maestros',  withSubNav('metricas-maestros',  lazyMaestros))
  router.register('metricas-patron',    withSubNav('metricas-patron',    renderPatronAsistenciaView))
  router.register('metricas-destacados',withSubNav('metricas-destacados',lazyDestacados))
  router.register('metricas-ia-analisis',withSubNav('metricas-ia-analisis', renderIaAnalisisView))
  router.register('metricas-ia-reportes',withSubNav('metricas-ia-reportes', renderIaReporteGeneradorView))
  router.register('periodos',           withSubNav('periodos',           lazyPeriodos))
}
