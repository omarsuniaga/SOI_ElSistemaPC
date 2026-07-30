/**
 * planificacionView.js — Clean View Delegate for Planificación Module
 *
 * Clean Architecture Delegate: Routes to specialized focused views based on viewMode.
 */
import { renderMaestroPlanificacionView } from './MaestroPlanificacionView.js'
import { renderAcmAprobacionView } from './AcmAprobacionView.js'
import { renderCoberturaCurricularView } from './CoberturaCurricularView.js'
import { renderClasePlanificacionView } from './clasePlanificacionView.js'

export async function renderPlanificacionView(container, { viewMode = 'maestro' } = {}) {
  if (!container) return

  if (viewMode === 'admin' || viewMode === 'acm') {
    return renderAcmAprobacionView(container)
  }

  if (viewMode === 'cobertura') {
    return renderCoberturaCurricularView(container)
  }

  if (viewMode === 'clase-plan' || viewMode === 'clase') {
    return renderClasePlanificacionView(container)
  }

  // Default: Vista del maestro
  return renderMaestroPlanificacionView(container)
}

export async function renderCoberturaView(container) {
  return renderCoberturaCurricularView(container)
}
