import { router } from '../../core/router/router.js'
import { renderDashboardMetricasView } from './views/dashboardMetricasView.js'
import { renderCierreAcademicoView } from './views/cierreAcademicoView.js'
import { renderCierreHistoricoView } from './views/cierreHistoricoView.js'
import { renderIaReporteGeneradorView } from './views/iaReporteGeneradorView.js'

export function registerRoutesMetricas() {
  // Ahora todas las rutas analíticas convergen en el Hub Centralizado
  router.register('metricas', renderDashboardMetricasView)
  router.register('metricas-alertas', renderDashboardMetricasView)
  router.register('metricas-riesgo', renderDashboardMetricasView)
  router.register('metricas-maestros', renderDashboardMetricasView)
  router.register('metricas-destacados', renderDashboardMetricasView)
  router.register('cierre-academico', renderCierreAcademicoView)
  router.register('cierre-academico-historico', renderCierreHistoricoView)
  
  // El generador de reportes IA se mantiene como una herramienta especializada
  router.register('metricas-ia-reportes', renderIaReporteGeneradorView)
}
