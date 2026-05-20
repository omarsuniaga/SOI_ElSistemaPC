import { router } from '../../core/router/router.js'
import CumplimientoMaestrosWidget from './views/cumplimientoMaestrosWidget.js'
import DirectorReportingPanel from './views/directorReportingPanel.js'
import { analyticsFillingBehaviorWidget } from './views/analyticsFillingBehaviorWidget.js'
import { directorTrendReportView } from './views/directorTrendReportView.js'

/**
 * Registra las rutas del módulo Admin Dashboard
 * Incluye: cumplimiento de maestros, reportes, analítica de llenado, tendencias
 */
export function registerRoutesAdminDashboard() {
  // Cumplimiento de Maestros - Vista principal del dashboard
  router.register('admin-dashboard', (container) => {
    try {
      container.innerHTML = `<div id="admin-dashboard-container"></div>`
      const widget = new CumplimientoMaestrosWidget('admin-dashboard-container')
      widget.init()
    } catch (error) {
      console.error('[admin-dashboard] Error:', error)
      container.innerHTML = `<div class="pm-placeholder"><i class="bi bi-exclamation-triangle"></i><p>Error al cargar cumplimiento: ${error.message}</p></div>`
    }
  })

  // Reportes de Director
  router.register('admin-dashboard-reportes', (container) => {
    try {
      container.innerHTML = `<div id="director-reporting-container"></div>`
      const panel = new DirectorReportingPanel('director-reporting-container')
      panel.init()
    } catch (error) {
      console.error('[admin-dashboard-reportes] Error:', error)
      container.innerHTML = `<div class="pm-placeholder"><i class="bi bi-exclamation-triangle"></i><p>Error al cargar reportes: ${error.message}</p></div>`
    }
  })

  // Analítica de Llenado de Asistencias
  router.register('admin-dashboard-analitca-llenado', (container) => {
    try {
      container.innerHTML = `<div id="analytics-filling-container"></div>`
      const widget = analyticsFillingBehaviorWidget('analytics-filling-container')
      widget.init()
    } catch (error) {
      console.error('[admin-dashboard-analitca-llenado] Error:', error)
      container.innerHTML = `<div class="pm-placeholder"><i class="bi bi-exclamation-triangle"></i><p>Error al cargar analítica: ${error.message}</p></div>`
    }
  })

  // Reporte de Tendencias para Director
  router.register('admin-dashboard-tendencias', (container) => {
    try {
      container.innerHTML = `<div id="trend-report-container"></div>`
      const view = directorTrendReportView('trend-report-container')
      view.init()
    } catch (error) {
      console.error('[admin-dashboard-tendencias] Error:', error)
      container.innerHTML = `<div class="pm-placeholder"><i class="bi bi-exclamation-triangle"></i><p>Error al cargar tendencias: ${error.message}</p></div>`
    }
  })
}
