export const PRIORITY_CATEGORIES = Object.freeze({ CRITICAL_BLOCKER: 'CRITICAL_BLOCKER', REGRESSION_RISK: 'REGRESSION_RISK', MILESTONE_BEHIND: 'MILESTONE_BEHIND', DEADLINE_RISK: 'DEADLINE_RISK', TEMPO_GAP: 'TEMPO_GAP', STALE_REHEARSAL_EVIDENCE: 'STALE_REHEARSAL_EVIDENCE', UNASSESSED_RISK: 'UNASSESSED_RISK', STUDENT_EXCEPTION: 'STUDENT_EXCEPTION', LOW_URGENCY: 'LOW_URGENCY' })
const urgencyRank = { CRITICAL: 0, HIGH: 1, MEDIUM: 2, LOW: 3 }

export function buildPriorityCandidate({ id, label, scope, states = [], target = null, daysRemaining = null, recentRegressions = 0, lastWorkedDaysAgo = null, lastEvaluatedDaysAgo = null, difficulty = null, tempoActual = null, tempoTarget = null, critical = false, studentException = false } = {}) {
  const reasons = []
  if (critical && states.some((state) => state === 'SIN_ESTUDIAR')) reasons.push(PRIORITY_CATEGORIES.CRITICAL_BLOCKER)
  if (recentRegressions > 0) reasons.push(PRIORITY_CATEGORIES.REGRESSION_RISK)
  if (target?.thresholdPercent != null && target.actualPercent < target.thresholdPercent) reasons.push(PRIORITY_CATEGORIES.MILESTONE_BEHIND)
  if (daysRemaining != null && daysRemaining < 0 && reasons.includes(PRIORITY_CATEGORIES.MILESTONE_BEHIND)) reasons.push(PRIORITY_CATEGORIES.DEADLINE_RISK)
  if (tempoTarget != null && tempoActual != null && tempoActual < tempoTarget) reasons.push(PRIORITY_CATEGORIES.TEMPO_GAP)
  if (lastWorkedDaysAgo != null && lastWorkedDaysAgo > 7) reasons.push(PRIORITY_CATEGORIES.STALE_REHEARSAL_EVIDENCE)
  if (states.includes('SIN_EVALUAR')) reasons.push(PRIORITY_CATEGORIES.UNASSESSED_RISK)
  if (studentException) reasons.push(PRIORITY_CATEGORIES.STUDENT_EXCEPTION)
  if (!reasons.length) reasons.push(PRIORITY_CATEGORIES.LOW_URGENCY)
  const urgency = reasons.includes(PRIORITY_CATEGORIES.CRITICAL_BLOCKER) || reasons.includes(PRIORITY_CATEGORIES.DEADLINE_RISK) || recentRegressions >= 2 ? 'CRITICAL' : reasons.includes(PRIORITY_CATEGORIES.MILESTONE_BEHIND) || reasons.includes(PRIORITY_CATEGORIES.TEMPO_GAP) ? 'HIGH' : reasons.includes(PRIORITY_CATEGORIES.STALE_REHEARSAL_EVIDENCE) || reasons.includes(PRIORITY_CATEGORIES.UNASSESSED_RISK) ? 'MEDIUM' : 'LOW'
  return { id, label, scope, urgency, reasons, currentStates: states, target, daysRemaining, recentRegressions, lastWorkedDaysAgo, lastEvaluatedDaysAgo, difficulty, tempoGap: tempoTarget == null || tempoActual == null ? null : tempoTarget - tempoActual, why: reasons.join(' · ') }
}

export function prioritizeCandidates(candidates = []) { return [...candidates].sort((a, b) => urgencyRank[a.urgency] - urgencyRank[b.urgency] || (b.recentRegressions || 0) - (a.recentRegressions || 0) || String(a.label).localeCompare(String(b.label))) }

export function deduplicateCandidates(candidates = []) { const grouped = new Map(); candidates.forEach((candidate) => { const key = candidate.passageId || candidate.filaId || candidate.id; const existing = grouped.get(key); grouped.set(key, existing ? { ...existing, reasons: [...new Set([...existing.reasons, ...candidate.reasons])], why: [...new Set([...existing.reasons, ...candidate.reasons])].join(' · '), underlying: [...(existing.underlying || [existing.id]), candidate.id] } : candidate) }); return [...grouped.values()] }
