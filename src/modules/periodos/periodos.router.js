import { router } from '../../core/router/router.js'
import { renderPeriodosView } from './views/periodosView.js'
import { renderReporteCierreView } from './views/reporteCierreView.js'

export function registerRoutesPeriodos() {
  router.register('periodos', renderPeriodosView)
  router.register('periodos-academicos', renderPeriodosView)
  router.register('reporte-cierre', renderReporteCierreView)
}
