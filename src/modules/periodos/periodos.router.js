import { router } from '../../core/router/router.js'
import { renderPeriodosView } from './views/periodosView.js'
import { renderReporteCierreView } from './views/reporteCierreView.js'
import { renderCalendarioLectivoView } from './views/calendarioLectivoView.js'

export function registerRoutesPeriodos() {
  router.register('periodos', renderPeriodosView)
  router.register('periodos-academicos', renderPeriodosView)
  router.register('reporte-cierre', renderReporteCierreView)
  router.register('periodo-lectivo', renderCalendarioLectivoView)
}
