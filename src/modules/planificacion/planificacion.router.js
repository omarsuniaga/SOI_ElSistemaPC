import { router } from '../../core/router/router.js'
import { renderPlanificacionView, renderCoberturaView } from './views/planificacionView.js'
import { renderRutaAcademicaView } from './views/rutaAcademicaView.js'
import { renderAcmPropuestasView } from './views/acmProuestasView.js'

export function registerRoutesPlanificacion() {
  // "Mis Planes" - vista del maestro logueado
  router.register('planificacion', (container) =>
    renderPlanificacionView(container, { viewMode: 'maestro' }),
  )
  router.register('planificacion-acm', (container) =>
    renderPlanificacionView(container, { viewMode: 'acm' }),
  )
  // "Plantillas" - biblioteca de plantillas DSL
  router.register('planificacion-plantillas', (container) =>
    renderPlanificacionView(container, { viewMode: 'plantillas' }),
  )
  // "Todas las Planificaciones" - vista administrativa
  router.register('planificacion-maestros', (container) =>
    renderPlanificacionView(container, { viewMode: 'admin' }),
  )
  // "Cobertura Curricular" - mapa clases vs planificaciones
  router.register('planificacion-cobertura', (container) => renderCoberturaView(container))
  // "Ruta Académica" - contenidos curriculares por clase (admin)
  router.register('planificacion-ruta', (container) => renderRutaAcademicaView(container))
  // "Propuestas de Maestros" - revisión ACM de contenido propuesto (curriculo-tres-planos WU #6)
  router.register('maestro-propuestas-pendientes', (container) => renderAcmPropuestasView(container))
  // planificacion-curricular queda bajo academic-admin.router.js (no registrar aquí)
}
