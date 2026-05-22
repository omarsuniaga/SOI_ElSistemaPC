import { router } from '../../core/router/router.js'
import { renderPlanificacionView } from './views/planificacionView.js'

export function registerRoutesPlanificacion() {
  // "Mis Planes" - vista del maestro logueado
  router.register('planificacion', (container) => renderPlanificacionView(container, { viewMode: 'maestro' }))
  // "Plantillas" - biblioteca de plantillas DSL
  router.register('planificacion-plantillas', (container) => renderPlanificacionView(container, { viewMode: 'plantillas' }))
  // "Todas las Planificaciones" - vista administrativa
  router.register('planificacion-maestros', (container) => renderPlanificacionView(container, { viewMode: 'admin' }))
  // planificacion-curricular queda bajo academic-admin.router.js (no registrar aquí)
}
