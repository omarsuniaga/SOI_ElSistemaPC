import { describe, expect, it } from 'vitest'
import {
  createShadowCapabilityChange,
  getShadowApprovalTransition,
  shadowApprovalStates,
  transitionShadowCapabilityChange,
  validateShadowCapabilityPayload,
} from './shadowCapabilityApproval.js'

const payload = Object.freeze({
  changeId: 'shadow-acm-clases-write',
  portalId: 'ACM',
  moduleId: 'clases',
  capabilityId: 'write',
  operation: 'propose-enable',
  reasonCode: 'catalog-owner',
  rollbackPlan: Object.freeze({ strategy: 'discard-proposal', verification: 'navigation-smoke' }),
})

const timestamp = (() => {
  let index = 0
  return () => `2026-08-12T00:00:0${index += 1}.000Z`
})()

describe('shadow capability approval workflow', () => {
  it('only permits the conservative review path through simulation', () => {
    const draft = createShadowCapabilityChange(payload, { now: timestamp })
    const submitted = transitionShadowCapabilityChange(draft, 'submit', { now: timestamp })
    const approved = transitionShadowCapabilityChange(submitted, 'approve', { now: timestamp })
    const simulated = transitionShadowCapabilityChange(approved, 'simulate', { now: timestamp })

    expect([draft.status, submitted.status, approved.status, simulated.status]).toEqual(['draft', 'submitted', 'approved', 'simulated'])
    expect(simulated.auditEvents.map(event => event.to)).toEqual(['draft', 'submitted', 'approved', 'simulated'])
    expect(getShadowApprovalTransition('submitted', 'reject')).toBe('rejected')
    expect(getShadowApprovalTransition('rejected', 'revise')).toBe('draft')
    expect(shadowApprovalStates).not.toContain('applied')
  })

  it('rejects invalid transitions and requires a rollback plan before approval', () => {
    const draft = createShadowCapabilityChange({ ...payload, rollbackPlan: null }, { now: timestamp })
    const submitted = transitionShadowCapabilityChange(draft, 'submit', { now: timestamp })

    expect(() => transitionShadowCapabilityChange(draft, 'simulate', { now: timestamp })).toThrow('Cannot simulate')
    expect(() => transitionShadowCapabilityChange(submitted, 'approve', { now: timestamp })).toThrow('rollback plan')
    expect(() => transitionShadowCapabilityChange(submitted, 'revise', { now: timestamp })).toThrow('Cannot revise')
  })

  it('accepts only PII-free structural payload fields', () => {
    const hasError = (result, substr) => result.some(e => e.includes(substr))
    expect(hasError(validateShadowCapabilityPayload({ ...payload, approverName: 'Ana' }), 'unsupported fields')).toBe(true)
    expect(hasError(validateShadowCapabilityPayload({ ...payload, rationale: 'Contact Ana' }), 'unsupported fields')).toBe(true)
    expect(hasError(validateShadowCapabilityPayload({ ...payload, rollbackPlan: { strategy: 'discard-proposal', verification: 'navigation-smoke', note: 'Call Ana' } }), 'cannot include free-form')).toBe(true)
  })

  it('returns immutable changes and audit events without altering the previous state', () => {
    const draft = createShadowCapabilityChange(payload, { now: timestamp })
    const submitted = transitionShadowCapabilityChange(draft, 'submit', { now: timestamp })

    expect(Object.isFrozen(draft)).toBe(true)
    expect(Object.isFrozen(draft.auditEvents)).toBe(true)
    expect(Object.isFrozen(draft.auditEvents[0])).toBe(true)
    expect(Object.isFrozen(draft.rollbackPlan)).toBe(true)
    expect(draft.status).toBe('draft')
    expect(draft.auditEvents).toHaveLength(1)
    expect(submitted.auditEvents).toHaveLength(2)
    expect(submitted.auditEvents).not.toBe(draft.auditEvents)
  })
})
