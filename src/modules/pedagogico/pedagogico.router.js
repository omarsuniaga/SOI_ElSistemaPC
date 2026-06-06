import { router } from '../../core/router/router.js'
import { renderDashboardPedagogicoView }  from './views/dashboardPedagogicoView.js'
import { renderSeguimientoAlumnosView }   from './views/seguimientoAlumnosView.js'
import { renderReportesPedagogicosView }  from './views/reportesPedagogicosView.js'
import { renderSolicitudesAdminView }     from './views/solicitudesAdminView.js'

export function registerRoutesPedagogico() {
  router.register('pedagogico-dashboard',   (c) => renderDashboardPedagogicoView(c))
  router.register('pedagogico-seguimiento', (c) => renderSeguimientoAlumnosView(c))
  router.register('pedagogico-reportes',    (c) => renderReportesPedagogicosView(c))
  router.register('pedagogico-solicitudes', (c) => renderSolicitudesAdminView(c))
}
