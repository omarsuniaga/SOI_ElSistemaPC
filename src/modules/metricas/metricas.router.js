import { router } from '../../core/router/router.js'
import {
  renderDashboardMetricasView,
  destroyDashboardMetricasView,
} from './views/dashboardMetricasView.js'
import { renderIaReporteGeneradorView } from './views/iaReporteGeneradorView.js'

export function registerRoutesMetricas() {
  // Escuchar cuando el usuario navegue fuera de las vistas del módulo de métricas para destruir la vista y sus listeners
  window.addEventListener('routeChanged', (e) => {
    const targetRoute = e.detail
    if (targetRoute !== 'metricas' && targetRoute !== 'metricas-ia-reportes') {
      try {
        destroyDashboardMetricasView()
      } catch (err) {
        console.error('Error destruyendo DashboardMetricasView:', err)
      }
    }
  })

  // Ruta única centralizada de métricas e integridad de observabilidad
  router.register('metricas', renderDashboardMetricasView)

  // El generador de reportes IA se mantiene como una herramienta especializada
  router.register('metricas-ia-reportes', renderIaReporteGeneradorView)
}
