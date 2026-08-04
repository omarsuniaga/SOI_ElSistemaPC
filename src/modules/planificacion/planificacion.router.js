import { router } from '../../core/router/router.js'
import { renderMaestroPlanificacionView } from './views/MaestroPlanificacionView.js'
import { renderAcmAprobacionView } from './views/AcmAprobacionView.js'
import { renderCoberturaCurricularView } from './views/CoberturaCurricularView.js'
import { renderAcmPropuestasView } from './views/acmPropuestasView.js'
import { renderClasePlanificacionView } from './views/clasePlanificacionView.js'
import { renderDisenadorCurricularView } from './views/DisenadorCurricularView.js'
import { renderRutaPedagogicaView } from './views/RutaPedagogicaView.js'

export function registerRoutesPlanificacion() {
  // "Mis Planes" - vista del maestro logueado
  router.register('planificacion', (container, params = {}) =>
    renderMaestroPlanificacionView(container, params),
  )

  // "Aprobación y Revisión ACM" - vista de coordinación pedagógica
  router.register('planificacion-acm', (container, params = {}) =>
    renderAcmAprobacionView(container, params),
  )
  router.register('planificacion-maestros', (container, params = {}) =>
    renderAcmAprobacionView(container, params),
  )

  // "Diseñador Curricular Institucional (ACM)" - Pantalla Completa
  router.register('planificacion-disenador', (container, params = {}) =>
    renderDisenadorCurricularView(container, {
      ...params,
      claseId: params.claseId || params.clase || null,
    }),
  )

  // "Ruta Pedagógica Completa (SVG)" - Pantalla Completa con Alumnos y Estrellas
  router.register('planificacion-ruta', (container, params = {}) =>
    renderRutaPedagogicaView(container, {
      ...params,
      claseId: params.claseId || params.clase || null,
    }),
  )

  // "Cobertura Curricular" - mapa de cumplimiento pedagógico para Dirección
  router.register('planificacion-cobertura', (container, params = {}) =>
    renderCoberturaCurricularView(container, params),
  )

  // "Planificación de Clase" - detalle por clase
  router.register('planificacion-clase', (container, params = {}) =>
    renderClasePlanificacionView(container, params),
  )

  // "Propuestas de Maestros" - revisión ACM de contenido propuesto
  router.register('maestro-propuestas-pendientes', (container, params = {}) =>
    renderAcmPropuestasView(container, params),
  )
}
