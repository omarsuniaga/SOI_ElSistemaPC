import { router } from '../../core/router/router.js'
import { renderPlanificacionView } from './views/planificacionView.js'
import { renderPlanificacionCurricularView } from './views/planificacionCurricularView.js'
import { renderPlantillasAdminView } from './views/plantillasAdminView.js'
import { renderPlanificacionesMaestrosView } from './views/planificacionesMaestrosView.js'

export function registerRoutesPlanificacion() {
  router.register('planificacion', renderPlanificacionView)
  router.register('planificacion-curricular', renderPlanificacionCurricularView)
  router.register('planificacion-plantillas', renderPlantillasAdminView)
  router.register('planificacion-maestros', renderPlanificacionesMaestrosView)
}
