/**
 * Tests for processKnowledge.js
 * @module guidance/knowledge/__tests__
 */

import { describe, it, expect } from 'vitest'
import { PROCESS_RULES, getRulesForView, getRulesByPriority, getProcessNames } from '../knowledge/processKnowledge.js'

describe('processKnowledge', () => {
  it('should export PROCESS_RULES array with rules', () => {
    expect(PROCESS_RULES).toBeDefined()
    expect(Array.isArray(PROCESS_RULES)).toBe(true)
    expect(PROCESS_RULES.length).toBeGreaterThan(0)
  })

  it('each rule should have required fields', () => {
    for (const rule of PROCESS_RULES) {
      expect(rule).toHaveProperty('id')
      expect(rule).toHaveProperty('process')
      expect(rule).toHaveProperty('trigger')
      expect(rule).toHaveProperty('message')
      expect(rule).toHaveProperty('action')
      expect(rule).toHaveProperty('priority')
      expect(rule).toHaveProperty('views')
      expect(rule).toHaveProperty('roles')
      expect(Array.isArray(rule.views)).toBe(true)
      expect(Array.isArray(rule.roles)).toBe(true)
      expect(['critical', 'high', 'medium', 'low']).toContain(rule.priority)
    }
  })

  it('should have unique rule ids', () => {
    const ids = PROCESS_RULES.map(r => r.id)
    const uniqueIds = new Set(ids)
    expect(ids.length).toBe(uniqueIds.size)
  })

  it('getRulesForView should return rules for a specific view', () => {
    const rules = getRulesForView('asistencia')
    expect(rules.length).toBeGreaterThan(0)
    expect(rules.every(r => r.views.includes('asistencia') || r.views.includes('*'))).toBe(true)
  })

  it('getRulesForView should filter by role', () => {
    const rules = getRulesForView('asistencia', 'admin')
    // admin has no asistencia rules in our data
    expect(rules.every(r => r.roles.includes('*') || r.roles.includes('admin'))).toBe(true)
  })

  it('getRulesForView should include wildcard roles', () => {
    const rules = getRulesForView('hoy', 'maestro')
    expect(rules.some(r => r.roles.includes('*'))).toBe(true)
  })

  it('getRulesByPriority should filter correctly', () => {
    const critical = getRulesByPriority('critical')
    expect(critical.every(r => r.priority === 'critical')).toBe(true)
    expect(critical.length).toBeGreaterThan(0)
  })

  it('getProcessNames should return unique process names', () => {
    const names = getProcessNames()
    expect(names.length).toBeGreaterThan(0)
    expect(new Set(names).size).toBe(names.length)
  })

  it('should have rules for key processes', () => {
    const processes = getProcessNames()
    expect(processes).toContain('control_asistencia')
    expect(processes).toContain('preinscripciones')
    expect(processes).toContain('calificaciones')
  })
})
