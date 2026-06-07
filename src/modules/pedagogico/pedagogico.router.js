import { router } from '../../core/router/router.js'
import { renderDashboardPedagogicoView }       from './views/dashboardPedagogicoView.js'
import { renderSeguimientoAlumnosView }        from './views/seguimientoAlumnosView.js'
import { renderReportesPedagogicosView }       from './views/reportesPedagogicosView.js'
import { renderSolicitudesAdminView }          from './views/solicitudesAdminView.js'
import { renderSeguimientoInstitucionalView }  from './views/seguimientoInstitucionalView.js'
import { renderStudentCaseDetailView }         from './views/studentCaseDetailView.js'
import { renderSeguimientoRulesView }          from './views/seguimientoRulesView.js'

export function registerRoutesPedagogico() {
  router.register('pedagogico-dashboard',                 (c) => renderDashboardPedagogicoView(c))
  router.register('pedagogico-seguimiento',               (c) => renderSeguimientoAlumnosView(c))
  router.register('pedagogico-reportes',                  (c) => renderReportesPedagogicosView(c))
  router.register('pedagogico-solicitudes',               (c) => renderSolicitudesAdminView(c))
  router.register('pedagogico-seguimiento-institucional', (c) => renderSeguimientoInstitucionalView(c))
  router.register('pedagogico-caso',                      (c) => renderStudentCaseDetailView(c))
  router.register('pedagogico-seguimiento-reglas',        (c) => renderSeguimientoRulesView(c))
}
