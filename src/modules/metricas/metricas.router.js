import { router } from '../../core/router/router.js'
import { renderDashboardMetricasView } from './views/dashboardMetricasView.js'
import { renderIaReporteGeneradorView } from './views/iaReporteGeneradorView.js'

export function registerRoutesMetricas() {
  // Ahora todas las rutas analíticas convergen en el Hub Centralizado
  router.register('metricas', renderDashboardMetricasView)
  router.register('metricas-alertas', renderDashboardMetricasView)
  router.register('metricas-riesgo', renderDashboardMetricasView)
  router.register('metricas-maestros', renderDashboardMetricasView)
  router.register('metricas-destacados', renderDashboardMetricasView)
  
  // El generador de reportes IA se mantiene como una herramienta especializada
  router.register('metricas-ia-reportes', renderIaReporteGeneradorView)
}
