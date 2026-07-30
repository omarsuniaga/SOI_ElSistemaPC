/**
 * Tests for maestro-rules.js
 * @module guidance/rules/__tests__
 */

import { describe, it, expect } from 'vitest'
import { PROACTIVE_RULES, REACTIVE_RULES, ALERT_RULES, getAllMaestroRules } from '../rules/rules/maestro-rules.js'

describe('maestro-rules', () => {
  const maestroCtx = { view: 'asistencia', role: 'maestro', data: {}, isFirstVisit: false }
  const adminCtx = { view: 'asistencia', role: 'admin', data: {}, isFirstVisit: false }

  describe('PROACTIVE_RULES', () => {
    it('should have proactive rules', () => {
      expect(PROACTIVE_RULES.length).toBeGreaterThan(0)
    })

    it('each rule should have required fields', () => {
      for (const rule of PROACTIVE_RULES) {
        expect(rule).toHaveProperty('id')
        expect(rule).toHaveProperty('category', 'proactive')
        expect(rule).toHaveProperty('priority')
        expect(rule).toHaveProperty('condition')
        expect(rule).toHaveProperty('message')
        expect(rule).toHaveProperty('action')
        expect(rule).toHaveProperty('views')
        expect(rule).toHaveProperty('roles')
        expect(typeof rule.condition).toBe('function')
      }
    })

    it('attendance time rule should fire when after 9am and not all marked', () => {
      const rule = PROACTIVE_RULES.find(r => r.id === 'maestro-att-time')
      expect(rule).toBeDefined()
      expect(rule.condition(maestroCtx, { isAfter9am: true, allMarked: false, total: 10 })).toBe(true)
      expect(rule.condition(maestroCtx, { isAfter9am: false, allMarked: false, total: 10 })).toBe(false)
      expect(rule.condition(maestroCtx, { isAfter9am: true, allMarked: true, total: 10 })).toBe(false)
    })

    it('preinscritos rule should fire when hasNewStudents', () => {
      const rule = PROACTIVE_RULES.find(r => r.id === 'maestro-preinscritos-new')
      expect(rule).toBeDefined()
      expect(rule.condition(maestroCtx, { hasNewStudents: true })).toBe(true)
      expect(rule.condition(maestroCtx, { hasNewStudents: false })).toBe(false)
    })

    it('onboarding rule should fire on first visit', () => {
      const rule = PROACTIVE_RULES.find(r => r.id === 'maestro-onboarding-hoy')
      expect(rule).toBeDefined()
      expect(rule.condition({ ...maestroCtx, isFirstVisit: true }, {})).toBe(true)
      expect(rule.condition({ ...maestroCtx, isFirstVisit: false }, {})).toBe(false)
    })
  })

  describe('REACTIVE_RULES', () => {
    it('should have reactive rules', () => {
      expect(REACTIVE_RULES.length).toBeGreaterThan(0)
    })

    it('each rule should have category reactive', () => {
      for (const rule of REACTIVE_RULES) {
        expect(rule.category).toBe('reactive')
      }
    })

    it('absence rule should fire when hasAbsences', () => {
      const rule = REACTIVE_RULES.find(r => r.id === 'maestro-absence-justification')
      expect(rule).toBeDefined()
      expect(rule.condition(maestroCtx, { hasAbsences: true })).toBe(true)
      expect(rule.condition(maestroCtx, { hasAbsences: false })).toBe(false)
    })
  })

  describe('ALERT_RULES', () => {
    it('should have alert rules', () => {
      expect(ALERT_RULES.length).toBeGreaterThan(0)
    })

    it('each rule should have category alert', () => {
      for (const rule of ALERT_RULES) {
        expect(rule.category).toBe('alert')
      }
    })

    it('critical late attendance should fire when after 9am and no students loaded', () => {
      const rule = ALERT_RULES.find(r => r.id === 'maestro-att-critical-late')
      expect(rule).toBeDefined()
      expect(rule.condition(maestroCtx, { isAfter9am: true, noStudentsLoaded: true })).toBe(true)
      expect(rule.condition(maestroCtx, { isAfter9am: false, noStudentsLoaded: true })).toBe(false)
    })
  })

  describe('getAllMaestroRules', () => {
    it('should return all rules combined', () => {
      const all = getAllMaestroRules()
      expect(all.length).toBe(
        PROACTIVE_RULES.length + REACTIVE_RULES.length + ALERT_RULES.length
      )
    })

    it('should have unique ids across all categories', () => {
      const all = getAllMaestroRules()
      const ids = all.map(r => r.id)
      expect(new Set(ids).size).toBe(ids.length)
    })
  })
})
