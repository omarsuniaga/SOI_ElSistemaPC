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

  // Reportes de Director (DESACTIVADO - pendiente crear VIEW con datos agregados)
  router.register('admin-dashboard-reportes', (container) => {
    container.innerHTML = `<div class="pm-placeholder"><i class="bi bi-exclamation-triangle"></i><p>⚠️ Componente en desarrollo. Esperando VIEW teacher_class_fill_metrics agregada.</p></div>`
  })

  // Analítica de Llenado de Asistencias (DESACTIVADO - pendiente crear VIEW con datos agregados)
  router.register('admin-dashboard-analitca-llenado', (container) => {
    container.innerHTML = `<div class="pm-placeholder"><i class="bi bi-exclamation-triangle"></i><p>⚠️ Componente en desarrollo. Esperando VIEW teacher_class_fill_metrics agregada.</p></div>`
  })

  // Reporte de Tendencias para Director (DESACTIVADO - pendiente crear VIEW con datos agregados)
  router.register('admin-dashboard-tendencias', (container) => {
    container.innerHTML = `<div class="pm-placeholder"><i class="bi bi-exclamation-triangle"></i><p>⚠️ Componente en desarrollo. Esperando VIEW teacher_class_fill_metrics agregada.</p></div>`
  })
}
