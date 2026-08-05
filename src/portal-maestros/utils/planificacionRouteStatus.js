import { selectBestPlanForClass } from '../../modules/planificacion/utils/planificacionClassResolver.js'

function parseLegacyObjectives(source) {
  if (Array.isArray(source)) return source
  if (typeof source !== 'string') return []

  try {
    const parsed = JSON.parse(source)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

export function countUnitsFromPlanificacion(plan) {
  if (!plan) return 0

  if (Array.isArray(plan.objetivosEstructurados) && plan.objetivosEstructurados.length > 0) {
    return plan.objetivosEstructurados.length
  }

  if (
    Array.isArray(plan.contenidos) &&
    plan.contenidos.length > 0 &&
    typeof plan.contenidos[0] === 'object'
  ) {
    return plan.contenidos.length
  }

  const legacyUnits = parseLegacyObjectives(plan.objetivos)
  if (legacyUnits.length > 0) return legacyUnits.length

  return 0
}

export function countUnitsFromHierarchy(levels = []) {
  return Array.isArray(levels) ? levels.filter(Boolean).length : 0
}

export function resolveClassRouteStatus({
  planificaciones = [],
  claseId,
  maestroId = null,
  hierarchyLevels = [],
} = {}) {
  const planClase = selectBestPlanForClass(planificaciones, { claseId, maestroId })
  const unitsFromPlan = countUnitsFromPlanificacion(planClase)

  if (unitsFromPlan > 0) {
    return {
      tieneRuta: true,
      unidadesCount: unitsFromPlan,
      source: 'planificacion',
      planClase,
    }
  }

  const unitsFromHierarchy = countUnitsFromHierarchy(hierarchyLevels)
  if (unitsFromHierarchy > 0) {
    return {
      tieneRuta: true,
      unidadesCount: unitsFromHierarchy,
      source: 'jerarquia',
      planClase,
    }
  }

  return {
    tieneRuta: false,
    unidadesCount: 0,
    source: 'none',
    planClase,
  }
}
