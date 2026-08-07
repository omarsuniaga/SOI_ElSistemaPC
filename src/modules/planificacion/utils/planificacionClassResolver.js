function _getRawEstado(plan) {
  return String(plan?.estado || '')
    .trim()
    .toLowerCase()
}

function _getStructuredUnits(plan) {
  if (Array.isArray(plan?.objetivosEstructurados) && plan.objetivosEstructurados.length > 0) {
    return plan.objetivosEstructurados
  }

  if (
    Array.isArray(plan?.contenidos) &&
    plan.contenidos.length > 0 &&
    typeof plan.contenidos[0] === 'object'
  ) {
    return plan.contenidos
  }

  return []
}

function _hasTextualContent(plan) {
  return Boolean(
    String(plan?.contenido || '').trim() ||
    String(plan?.tema || plan?.titulo || '').trim(),
  )
}

function _getPlanPriority(plan) {
  const estado = _getRawEstado(plan)
  const unidades = _getStructuredUnits(plan)

  let score = 0

  if (unidades.length > 0) score += 500
  else if (_hasTextualContent(plan)) score += 100

  if (['activa', 'cerrada', 'publicada', 'revisado', 'aprobada'].includes(estado)) score += 50
  else if (['borrador', 'planificado', 'revisada'].includes(estado)) score += 20
  else if (['archivada', 'archivado'].includes(estado)) score -= 50

  return score
}

function _getPlanTimestamp(plan) {
  const candidates = [plan?.updated_at, plan?.created_at, plan?.fecha_inicio]
  for (const value of candidates) {
    const time = new Date(value || 0).getTime()
    if (!Number.isNaN(time) && time > 0) return time
  }
  return 0
}

export function sameClaseId(idA, idB) {
  if (idA == null || idB == null) return false
  const cleanA = String(idA).trim().toLowerCase().replace(/^clase-/, '')
  const cleanB = String(idB).trim().toLowerCase().replace(/^clase-/, '')
  return cleanA === cleanB && cleanA.length > 0
}

export function selectBestPlanForClass(plans = [], { claseId, maestroId = null } = {}) {
  if (!claseId || !Array.isArray(plans) || plans.length === 0) return null

  const byClass = plans.filter((plan) => sameClaseId(plan?.clase_id || plan?.claseId, claseId))
  if (byClass.length === 0) return null

  const sameTeacher = maestroId
    ? byClass.filter((plan) => String(plan?.maestro_id || plan?.maestroId || '') === String(maestroId))
    : []

  const pool = sameTeacher.length > 0 ? sameTeacher : byClass

  return [...pool].sort((a, b) => {
    const scoreDiff = _getPlanPriority(b) - _getPlanPriority(a)
    if (scoreDiff !== 0) return scoreDiff

    const timeDiff = _getPlanTimestamp(b) - _getPlanTimestamp(a)
    if (timeDiff !== 0) return timeDiff

    return String(b?.id || '').localeCompare(String(a?.id || ''))
  })[0]
}
