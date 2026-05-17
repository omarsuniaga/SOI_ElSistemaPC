import { router } from '../../core/router/router.js'
import { renderPlanificacionView } from './views/planificacionView.js'

export function registerRoutesPlanificacion() {
  // Ahora todas las rutas de planificación se unifican en la vista inteligente
  router.register('planificacion', renderPlanificacionView)
  router.register('planificacion-curricular', renderPlanificacionView)
  router.register('planificacion-plantillas', renderPlanificacionView)
  router.register('planificacion-maestros', renderPlanificacionView)
}
