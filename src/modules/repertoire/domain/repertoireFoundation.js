export const MONTAJE_ESTADOS = Object.freeze([
  'PLANIFICADO',
  'EN_LECTURA',
  'EN_MONTAJE',
  'CONSOLIDANDO',
  'LISTO',
  'ESTRENADO',
  'ARCHIVADO'
])

export const APLICABILIDAD_COMPAS = Object.freeze([
  'TOCA',
  'SILENCIO',
  'TACET',
  'NO_APLICA',
  'DESCONOCIDO'
])

export const ESTADOS_PREPARACION = Object.freeze([
  'SIN_EVALUAR',
  'SIN_ESTUDIAR',
  'CON_DIFICULTAD',
  'DOMINADO',
  'CONSOLIDADO'
])

export const PREPARATION_DENOMINATOR_STATES = new Set(['TOCA'])

export function assertEnum(value, allowed, field) {
  if (!allowed.includes(value)) {
    throw new RangeError(`${field} inválido: ${value}`)
  }
  return value
}

export function validateMontajeDates({ fecha_inicio = null, fecha_objetivo = null } = {}) {
  if (fecha_inicio && fecha_objetivo && fecha_objetivo < fecha_inicio) {
    throw new RangeError('fecha_objetivo no puede ser anterior a fecha_inicio')
  }
  return true
}

export function daysRemaining(targetDate, today = new Date()) {
  if (!targetDate) return null
  const target = new Date(`${targetDate}T00:00:00Z`)
  const base = new Date(today)
  // Ambas fechas se reducen a su día calendario en UTC. Antes `base` usaba
  // getFullYear/getMonth/getDate (hora LOCAL del runtime) mientras `target` se
  // parseaba en UTC: el resultado dependía del huso horario de la máquina que
  // ejecuta el código (daba 17 en UTC-4, 16 en UTC/CI para el mismo instante).
  const baseUtc = Date.UTC(base.getUTCFullYear(), base.getUTCMonth(), base.getUTCDate())
  const targetUtc = Date.UTC(target.getUTCFullYear(), target.getUTCMonth(), target.getUTCDate())
  return Math.ceil((targetUtc - baseUtc) / 86400000)
}

export function isPreparationDenominator(applicability) {
  return PREPARATION_DENOMINATOR_STATES.has(applicability)
}

export function aggregatePreparation(cells) {
  const evaluated = cells.filter((cell) => isPreparationDenominator(cell.aplicabilidad))
  const counts = Object.fromEntries(ESTADOS_PREPARACION.map((state) => [state, 0]))
  for (const cell of evaluated) counts[cell.estado_preparacion] = (counts[cell.estado_preparacion] || 0) + 1
  return {
    total: evaluated.length,
    counts,
    percentage: evaluated.length === 0
      ? 0
      : Math.round((counts.CONSOLIDADO / evaluated.length) * 100)
  }
}
