import { describe, expect, it } from 'vitest'
import { daysUntilEvent, evaluateEventReadiness, EVENT_READINESS } from '../domain/eventReadiness.js'

describe('event readiness', () => {
  it('keeps the weak montage visible in the event result', () => {
    const result = evaluateEventReadiness({ event: { titulo: 'Navidad', fecha_inicio: '2026-12-18', asOf: '2026-12-06' }, montages: [{ label: 'Tchaikovsky', status: 'AT_RISK', reasons: ['4 medidas rojas'] }, { label: 'Mozart', status: 'ON_TRACK', reasons: [] }] })
    expect(result.status).toBe(EVENT_READINESS.AT_RISK)
    expect(result.reasons).toContain('Tchaikovsky: 4 medidas rojas')
    expect(result.daysRemaining).toBe(12)
  })
  it('recalculates countdown and handles cancellation without stale readiness', () => {
    expect(daysUntilEvent('2026-12-12', '2026-12-06')).toBe(6)
    expect(evaluateEventReadiness({ event: { estado: 'CANCELADO', fecha_inicio: '2026-12-18' }, montages: [{ status: 'READY' }] }).status).toBe(EVENT_READINESS.INSUFFICIENT_DATA)
  })
})
