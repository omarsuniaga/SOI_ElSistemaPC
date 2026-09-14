import { describe, expect, it } from 'vitest'
import { generateSignals, resolveRecipients, resolveSignal, shouldDeliver, SIGNAL_TYPES } from '../domain/signals.js'

describe('repertoire signals', () => {
  it('generates deterministic deduplicated signals from priority projections', () => {
    const signals = generateSignals({ priorities: [{ id: 'p1', scope: 'passage', urgency: 'CRITICAL', reasons: ['CRITICAL_BLOCKER', 'REGRESSION_RISK'], why: '4 measures red' }, { id: 'p1', scope: 'passage', urgency: 'CRITICAL', reasons: ['CRITICAL_BLOCKER'], why: 'same evidence' }] })
    expect(signals.map((item) => item.signalType)).toEqual([SIGNAL_TYPES.CRITICAL_BOTTLENECK, SIGNAL_TYPES.RECENT_REGRESSION])
    expect(signals).toHaveLength(2)
  })
  it('keeps event readiness signal actionable and lifecycle resolvable', () => {
    const [item] = generateSignals({ eventReadiness: { status: 'AT_RISK', event: { id: 'e1' }, reasons: ['Tchaikovsky behind'] } })
    expect(item.signalType).toBe(SIGNAL_TYPES.EVENT_READINESS_DETERIORATED)
    expect(resolveSignal(item).lifecycle).toBe('RESOLVED')
  })
  it('does not redeliver unchanged evidence but allows escalation and scoped recipients', () => {
    const existing = { lifecycle: 'OPEN', severity: 'HIGH', evidence: { red: 4 }, createdAt: '2026-09-14T10:00:00Z' }
    expect(shouldDeliver(existing, { ...existing })).toBe(false)
    expect(shouldDeliver(existing, { ...existing, severity: 'CRITICAL' })).toBe(true)
    expect(resolveRecipients({ role: 'teacher', assignedFilaIds: ['fila-1'] })).toEqual({ scope: 'assigned', filaIds: ['fila-1'] })
  })
})
