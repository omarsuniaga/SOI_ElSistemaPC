import { ESTADOS_PREPARACION } from './repertoireFoundation.js'

export const TREND_CLASSIFICATIONS = Object.freeze({ IMPROVING: 'IMPROVING', STABLE: 'STABLE', REGRESSING: 'REGRESSING', MIXED: 'MIXED', INSUFFICIENT_EVIDENCE: 'INSUFFICIENT_EVIDENCE' })
export const CORRELATION_LABELS = Object.freeze({ WORKED_WITHOUT_STATE_CHANGE: 'WORKED_WITHOUT_STATE_CHANGE', WORKED_THEN_IMPROVED: 'WORKED_THEN_IMPROVED', WORKED_THEN_REGRESSED: 'WORKED_THEN_REGRESSED', STATE_CHANGED_WITHOUT_RECENT_WORK: 'STATE_CHANGED_WITHOUT_RECENT_WORK', NO_RECENT_WORK: 'NO_RECENT_WORK', INSUFFICIENT_EVIDENCE: 'INSUFFICIENT_EVIDENCE' })

const rank = (state) => ESTADOS_PREPARACION.indexOf(state)

export function createPreparationTransition({ montageId, filaId = null, studentId = null, measureId, previousState, newState, actorId = null, scope = 'collective', source = 'PREPARATION_MUTATION', sessionId = null, createdAt = new Date().toISOString(), bulkOperationId = null } = {}) {
  if (!montageId || !measureId || !newState || !ESTADOS_PREPARACION.includes(newState)) throw new TypeError('Transición de preparación inválida')
  if (previousState != null && !ESTADOS_PREPARACION.includes(previousState)) throw new TypeError('Estado previo inválido')
  return { montageId, filaId, studentId, measureId, previousState, newState, actorId, scope, source, sessionId, createdAt, bulkOperationId }
}

export function sortHistory(events = []) { return [...events].sort((a, b) => new Date(a.createdAt || a.created_at) - new Date(b.createdAt || b.created_at)) }

export function classifyCorrelation({ workEvents = [], transitionEvents = [], windowDays = 7, asOf = new Date() } = {}) {
  if (!workEvents.length && !transitionEvents.length) return CORRELATION_LABELS.INSUFFICIENT_EVIDENCE
  if (!workEvents.length) return transitionEvents.length ? CORRELATION_LABELS.STATE_CHANGED_WITHOUT_RECENT_WORK : CORRELATION_LABELS.NO_RECENT_WORK
  const latestWork = Math.max(...workEvents.map((event) => new Date(event.createdAt || event.created_at || event.sessionDate).getTime()))
  if (!transitionEvents.length) return (new Date(asOf).getTime() - latestWork) > windowDays * 86400000 ? CORRELATION_LABELS.NO_RECENT_WORK : CORRELATION_LABELS.WORKED_WITHOUT_STATE_CHANGE
  const lastWork = Math.max(...workEvents.map((event) => new Date(event.createdAt || event.created_at || event.sessionDate).getTime()))
  const related = transitionEvents.filter((event) => { const delta = new Date(event.createdAt || event.created_at).getTime() - lastWork; return delta >= 0 && delta <= windowDays * 86400000 })
  if (!related.length) return CORRELATION_LABELS.WORKED_WITHOUT_STATE_CHANGE
  const transition = related[related.length - 1]
  if (rank(transition.newState || transition.new_state) > rank(transition.previousState || transition.previous_state)) return CORRELATION_LABELS.WORKED_THEN_IMPROVED
  if (rank(transition.newState || transition.new_state) < rank(transition.previousState || transition.previous_state)) return CORRELATION_LABELS.WORKED_THEN_REGRESSED
  return CORRELATION_LABELS.WORKED_WITHOUT_STATE_CHANGE
}

export function classifyTrend(events = []) {
  const transitions = events.filter((event) => event.previousState != null || event.previous_state != null)
  const improved = transitions.filter((event) => rank(event.newState || event.new_state) > rank(event.previousState || event.previous_state)).length
  const regressed = transitions.filter((event) => rank(event.newState || event.new_state) < rank(event.previousState || event.previous_state)).length
  const unchanged = transitions.length - improved - regressed
  const classification = !transitions.length ? TREND_CLASSIFICATIONS.INSUFFICIENT_EVIDENCE : improved && regressed ? TREND_CLASSIFICATIONS.MIXED : regressed ? TREND_CLASSIFICATIONS.REGRESSING : improved ? TREND_CLASSIFICATIONS.IMPROVING : TREND_CLASSIFICATIONS.STABLE
  return { classification, counts: { improved, regressed, unchanged }, explanation: `${improved} medidas mejoraron, ${regressed} regresaron y ${unchanged} no cambiaron` }
}

export function buildTimeline({ preparationEvents = [], sessionEvidence = [], observations = [] } = {}) {
  return sortHistory([...preparationEvents.map((event) => ({ ...event, eventType: 'PREPARATION_STATE' })), ...sessionEvidence.map((event) => ({ ...event, eventType: 'SESSION_WORK', source: 'SESSION_WORK' })), ...observations.map((event) => ({ ...event, eventType: 'OBSERVATION', source: 'OBSERVATION' }))])
}
