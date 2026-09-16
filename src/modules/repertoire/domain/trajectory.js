import { ESTADOS_PREPARACION } from './repertoireFoundation.js'

export const TARGET_STATES = ESTADOS_PREPARACION.filter((state) => state !== 'SIN_EVALUAR')
export const TRAJECTORY_STATUS = Object.freeze({ AHEAD: 'AHEAD', ON_TRACK: 'ON_TRACK', AT_RISK: 'AT_RISK', REGRESSING: 'REGRESSING', INSUFFICIENT_DATA: 'INSUFFICIENT_DATA' })

export function createTarget({ montageId, scope = 'montage', filaId = null, passageId = null, studentId = null, targetState = null, targetDate = null, thresholdPercent = null, targetTempo = null, priority = null, notes = '', createdBy } = {}) {
  if (!montageId || !createdBy) throw new TypeError('El objetivo requiere montaje y creador')
  if (targetState && !TARGET_STATES.includes(targetState)) throw new RangeError('Estado objetivo inválido')
  if (!targetState && thresholdPercent == null && targetTempo == null) throw new TypeError('El objetivo requiere estado, umbral o tempo')
  if (thresholdPercent != null && (!Number.isFinite(Number(thresholdPercent)) || Number(thresholdPercent) < 0 || Number(thresholdPercent) > 100)) throw new RangeError('Umbral inválido')
  return { montageId, scope, filaId, passageId, studentId, targetState, targetDate, thresholdPercent: thresholdPercent == null ? null : Number(thresholdPercent), targetTempo: targetTempo == null ? null : Number(targetTempo), priority, notes, createdBy }
}

export function createMilestone({ targetId, label, targetDate, targetState = null, thresholdPercent = null, targetTempo = null, notes = '' } = {}) {
  if (!targetId || !label?.trim() || !targetDate) throw new TypeError('El hito requiere objetivo, nombre y fecha')
  if (targetState && !TARGET_STATES.includes(targetState)) throw new RangeError('Estado de hito inválido')
  return { targetId, label: label.trim(), targetDate, targetState, thresholdPercent, targetTempo, notes }
}

export function daysRemaining(targetDate, asOf = new Date()) {
  if (!targetDate) return null
  return Math.ceil((Date.parse(`${targetDate}T00:00:00Z`) - Date.parse(`${new Date(asOf).toISOString().slice(0, 10)}T00:00:00Z`)) / 86400000)
}

function rank(state) { return ESTADOS_PREPARACION.indexOf(state) }

export function evaluateTrajectory({ target, milestones = [], measureStates = [], transitionEvents = [], criticalMeasureIds = [], actualTempo = null, asOf = new Date() } = {}) {
  const states = measureStates.filter((item) => item.applicability !== 'SILENCIO' && item.applicability !== 'TACET' && item.applicability !== 'NO_APLICA')
  const distribution = Object.fromEntries(ESTADOS_PREPARACION.map((state) => [state, states.filter((item) => item.state === state).length]))
  const applicableCount = states.length
  const achievedCount = target?.targetState ? states.filter((item) => rank(item.state) >= rank(target.targetState)).length : 0
  const actualPercent = applicableCount ? Number(((achievedCount / applicableCount) * 100).toFixed(2)) : 0
  const thresholdMet = target?.thresholdPercent == null || actualPercent >= target.thresholdPercent
  const stateMet = !target?.targetState || achievedCount === applicableCount || (target.thresholdPercent != null && thresholdMet)
  const tempoMet = target?.targetTempo == null || (actualTempo != null && actualTempo >= target.targetTempo)
  const referenceTime = new Date(asOf).getTime()
  const recentRegression = transitionEvents.some((event) => rank(event.newState || event.new_state) < rank(event.previousState || event.previous_state) && (referenceTime - new Date(event.createdAt || event.created_at).getTime()) <= 7 * 86400000)
  const blockers = states.filter((item) => criticalMeasureIds.includes(item.measureId) && (!target?.targetState || rank(item.state) < rank(target.targetState))).map((item) => item.measureId)
  const days = daysRemaining(target?.targetDate, asOf)
  const status = recentRegression ? TRAJECTORY_STATUS.REGRESSING : !applicableCount && target?.targetTempo == null ? TRAJECTORY_STATUS.INSUFFICIENT_DATA : stateMet && tempoMet ? (days != null && days > 0 ? TRAJECTORY_STATUS.AHEAD : TRAJECTORY_STATUS.ON_TRACK) : TRAJECTORY_STATUS.AT_RISK
  const delta = target?.thresholdPercent == null ? null : Number((actualPercent - target.thresholdPercent).toFixed(2))
  return { status, target, actual: { applicableCount, achievedCount, percent: actualPercent, distribution, tempo: actualTempo, tempoGap: target?.targetTempo == null || actualTempo == null ? null : target.targetTempo - actualTempo }, delta, timeRemainingDays: days, criticalBlockers: blockers, recentRegressions: recentRegression ? transitionEvents.filter((event) => rank(event.newState || event.new_state) < rank(event.previousState || event.previous_state)) : [], dataCoverage: applicableCount ? `${applicableCount} medidas aplicables` : 'Sin evidencia verificable', reason: recentRegression ? 'Existen regresiones recientes en el alcance.' : !tempoMet ? `El tempo actual está ${target.targetTempo - (actualTempo || 0)} BPM por debajo del objetivo.` : stateMet ? 'La evidencia actual cumple el objetivo.' : `El avance actual está ${Math.abs(delta ?? 0)} puntos por debajo del umbral.`, milestones: [...milestones].sort((a, b) => new Date(a.targetDate) - new Date(b.targetDate)) }
}
