export const SIGNAL_TYPES = Object.freeze({ DEADLINE_APPROACHING: 'DEADLINE_APPROACHING', MILESTONE_MISSED: 'MILESTONE_MISSED', CRITICAL_BOTTLENECK: 'CRITICAL_BOTTLENECK', RECENT_REGRESSION: 'RECENT_REGRESSION', EVENT_DATE_CHANGED: 'EVENT_DATE_CHANGED', EVENT_POSTPONED: 'EVENT_POSTPONED', EVENT_CANCELLED: 'EVENT_CANCELLED', EVENT_READINESS_DETERIORATED: 'EVENT_READINESS_DETERIORATED', TEMPO_GAP_NEAR_EVENT: 'TEMPO_GAP_NEAR_EVENT', STALE_CRITICAL_REHEARSAL: 'STALE_CRITICAL_REHEARSAL', CRITICAL_UNASSESSED_MATERIAL: 'CRITICAL_UNASSESSED_MATERIAL', STUDENT_CRITICAL_EXCEPTION: 'STUDENT_CRITICAL_EXCEPTION' })
const severity = { CRITICAL: 0, HIGH: 1, MEDIUM: 2, LOW: 3 }
const actionable = (type) => !['DEADLINE_APPROACHING'].includes(type)

export function signal({ signalType, sourceEntityType, sourceEntityId, reason, evidence = {}, deepLink = null, severityLevel = 'MEDIUM', montageId = null, eventId = null, scope = null, createdAt = new Date().toISOString() } = {}) {
  if (!signalType || !sourceEntityType || !sourceEntityId || !reason) throw new TypeError('Señal incompleta')
  return { signalType, severity: severityLevel, sourceEntityType, sourceEntityId, montageId, eventId, scope, reason, evidence, deepLink, createdAt, dedupeKey: `${signalType}:${sourceEntityType}:${sourceEntityId}:${scope || 'global'}`, lifecycle: 'OPEN', actionable: actionable(signalType) }
}

export function generateSignals({ trajectory: _trajectory = null, priorities = [], eventReadiness = null, now = new Date() } = {}) {
  const signals = priorities.flatMap((candidate) => (candidate.reasons || []).filter((reason) => ['CRITICAL_BLOCKER', 'REGRESSION_RISK', 'TEMPO_GAP', 'STALE_REHEARSAL_EVIDENCE', 'UNASSESSED_RISK', 'STUDENT_EXCEPTION'].includes(reason)).map((reason) => signal({ signalType: { CRITICAL_BLOCKER: SIGNAL_TYPES.CRITICAL_BOTTLENECK, REGRESSION_RISK: SIGNAL_TYPES.RECENT_REGRESSION, TEMPO_GAP: SIGNAL_TYPES.TEMPO_GAP_NEAR_EVENT, STALE_REHEARSAL_EVIDENCE: SIGNAL_TYPES.STALE_CRITICAL_REHEARSAL, UNASSESSED_RISK: SIGNAL_TYPES.CRITICAL_UNASSESSED_MATERIAL, STUDENT_EXCEPTION: SIGNAL_TYPES.STUDENT_CRITICAL_EXCEPTION }[reason], sourceEntityType: candidate.scope || 'measure', sourceEntityId: candidate.id, reason: candidate.why || reason, evidence: candidate, deepLink: candidate.deepLink || null, severityLevel: candidate.urgency || 'MEDIUM', montageId: candidate.montageId, eventId: candidate.eventId })))
  if (eventReadiness?.status === 'AT_RISK' || eventReadiness?.status === 'CRITICAL') signals.push(signal({ signalType: SIGNAL_TYPES.EVENT_READINESS_DETERIORATED, sourceEntityType: 'event', sourceEntityId: eventReadiness.event?.id || 'event', eventId: eventReadiness.event?.id, reason: eventReadiness.reasons?.join(' · ') || 'La preparación del evento se deterioró', severityLevel: eventReadiness.status === 'CRITICAL' ? 'CRITICAL' : 'HIGH', createdAt: now.toISOString() }))
  return signals.filter((item, index, all) => all.findIndex((candidate) => candidate.dedupeKey === item.dedupeKey) === index).sort((a, b) => severity[a.severity] - severity[b.severity])
}

export function resolveSignal(signalItem, lifecycle = 'RESOLVED') { if (!['OPEN', 'ACKNOWLEDGED', 'RESOLVED', 'SUPERSEDED'].includes(lifecycle)) throw new RangeError('Ciclo de señal inválido'); return { ...signalItem, lifecycle, resolvedAt: lifecycle === 'RESOLVED' ? new Date().toISOString() : signalItem.resolvedAt } }

export function shouldDeliver(existing, incoming, { now = new Date(), reminderHours = 24 } = {}) {
  if (!existing || existing.lifecycle === 'RESOLVED' || existing.lifecycle === 'SUPERSEDED') return true
  if (severity[incoming.severity] < severity[existing.severity]) return true
  if (JSON.stringify(existing.evidence) !== JSON.stringify(incoming.evidence)) return true
  return (new Date(now).getTime() - new Date(existing.updatedAt || existing.createdAt).getTime()) >= reminderHours * 3600000
}

export function resolveRecipients({ role, assignedFilaIds = [], signalScope = {} } = {}) {
  if (role === 'direccion') return { scope: 'orchestra', filaIds: null }
  if (role === 'ACM' || role === 'coordinacion_academica') return { scope: 'section', filaIds: signalScope.filaIds || null }
  return { scope: 'assigned', filaIds: assignedFilaIds }
}
