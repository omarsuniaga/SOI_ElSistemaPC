/**
 * Tests for rulesEngine.js
 * @module guidance/rules/__tests__
 */

import { describe, it, expect, vi } from 'vitest'
import { createRulesEngine } from '../rules/rulesEngine.js'

const makeContext = (overrides = {}) => ({
  view: 'asistencia',
  role: 'maestro',
  data: {},
  timestamp: Date.now(),
  isFirstVisit: false,
  ...overrides,
})

describe('createRulesEngine', () => {
  it('should create an engine with no rules', () => {
    const engine = createRulesEngine()
    expect(engine.getRules()).toEqual([])
  })

  it('should create an engine with initial rules', () => {
    const rule = {
      id: 'test-1',
      category: 'proactive',
      priority: 'high',
      condition: () => true,
      message: 'Test',
      action: 'Do test',
      views: ['*'],
      roles: ['*'],
    }
    const engine = createRulesEngine([rule])
    expect(engine.getRules()).toHaveLength(1)
  })

  it('should register new rules', () => {
    const engine = createRulesEngine()
    engine.register([{
      id: 'r1',
      category: 'proactive',
      priority: 'medium',
      condition: () => true,
      message: 'msg',
      action: 'act',
      views: ['*'],
      roles: ['*'],
    }])
    expect(engine.getRules()).toHaveLength(1)
  })

  it('should unregister rules by id', () => {
    const engine = createRulesEngine([
      { id: 'r1', category: 'proactive', priority: 'high', condition: () => true, message: '', action: '', views: ['*'], roles: ['*'] },
      { id: 'r2', category: 'reactive', priority: 'low', condition: () => true, message: '', action: '', views: ['*'], roles: ['*'] },
    ])
    engine.unregister(['r1'])
    expect(engine.getRules()).toHaveLength(1)
    expect(engine.getRules()[0].id).toBe('r2')
  })

  it('should evaluate rules and return triggered ones', () => {
    const engine = createRulesEngine([
      {
        id: 'match',
        category: 'proactive',
        priority: 'high',
        condition: (ctx) => ctx.view === 'asistencia',
        message: 'Match!',
        action: 'Do it',
        views: ['asistencia'],
        roles: ['*'],
      },
      {
        id: 'no-match',
        category: 'proactive',
        priority: 'medium',
        condition: (ctx) => ctx.view === 'metricas',
        message: 'No match',
        action: 'Skip',
        views: ['metricas'],
        roles: ['*'],
      },
    ])

    const result = engine.evaluate(makeContext())
    expect(result.proactive.some(r => r.id === 'match')).toBe(true)
    expect(result.proactive.some(r => r.id === 'no-match')).toBe(false)
  })

  it('should filter by role', () => {
    const engine = createRulesEngine([
      {
        id: 'admin-only',
        category: 'reactive',
        priority: 'high',
        condition: () => true,
        message: 'Admin only',
        action: 'Admin act',
        views: ['*'],
        roles: ['admin'],
      },
    ])

    const result = engine.evaluate(makeContext({ role: 'maestro' })
    )
    expect(result.reactive).toHaveLength(0)
  })

  it('should respect wildcard views', () => {
    const engine = createRulesEngine([
      {
        id: 'all-views',
        category: 'proactive',
        priority: 'high',
        condition: () => true,
        message: 'All views',
        action: 'Act',
        views: ['*'],
        roles: ['*'],
      },
    ])

    const result = engine.evaluate(makeContext({ view: 'whatever' }))
    expect(result.proactive).toHaveLength(1)
  })

  it('should sort by priority', () => {
    const engine = createRulesEngine([
      { id: 'low', category: 'proactive', priority: 'low', condition: () => true, message: '', action: '', views: ['*'], roles: ['*'] },
      { id: 'critical', category: 'proactive', priority: 'critical', condition: () => true, message: '', action: '', views: ['*'], roles: ['*'] },
      { id: 'high', category: 'proactive', priority: 'high', condition: () => true, message: '', action: '', views: ['*'], roles: ['*'] },
    ])

    const result = engine.evaluate(makeContext())
    expect(result.proactive[0].priority).toBe('critical')
    expect(result.proactive[1].priority).toBe('high')
  })

  it('should limit proactive to 3 (critical/high only)', () => {
    const rules = Array.from({ length: 6 }, (_, i) => ({
      id: `r${i}`,
      category: 'proactive',
      priority: 'high',
      condition: () => true,
      message: `Rule ${i}`,
      action: `Act ${i}`,
      views: ['*'],
      roles: ['*'],
    }))

    const engine = createRulesEngine(rules)
    const result = engine.evaluate(makeContext())
    expect(result.proactive.length).toBe(3)
  })

  it('should separate alerts from proactive/reactive', () => {
    const engine = createRulesEngine([
      { id: 'a1', category: 'alert', priority: 'critical', condition: () => true, message: '', action: '', views: ['*'], roles: ['*'] },
      { id: 'p1', category: 'proactive', priority: 'high', condition: () => true, message: '', action: '', views: ['*'], roles: ['*'] },
      { id: 'r1', category: 'reactive', priority: 'medium', condition: () => true, message: '', action: '', views: ['*'], roles: ['*'] },
    ])

    const result = engine.evaluate(makeContext())
    expect(result.alerts).toHaveLength(1)
    expect(result.proactive).toHaveLength(1)
    expect(result.reactive).toHaveLength(1)
    expect(result.total).toBe(3)
  })

  it('should handle condition errors gracefully', () => {
    const engine = createRulesEngine([
      {
        id: 'broken',
        category: 'proactive',
        priority: 'high',
        condition: () => { throw new Error('broken') },
        message: '',
        action: '',
        views: ['*'],
        roles: ['*'],
      },
      {
        id: 'working',
        category: 'proactive',
        priority: 'high',
        condition: () => true,
        message: 'Works',
        action: '',
        views: ['*'],
        roles: ['*'],
      },
    ])

    const result = engine.evaluate(makeContext())
    expect(result.proactive.some(r => r.id === 'working')).toBe(true)
    expect(result.proactive.some(r => r.id === 'broken')).toBe(false)
  })

  it('should notify listeners on register/unregister', () => {
    const engine = createRulesEngine()
    const callback = vi.fn()
    engine.onChange(callback)

    engine.register([{ id: 'x', category: 'proactive', priority: 'high', condition: () => true, message: '', action: '', views: ['*'], roles: ['*'] }])
    expect(callback).toHaveBeenCalled()

    engine.unregister(['x'])
    expect(callback).toHaveBeenCalledTimes(2)
  })

  it('getRulesByCategory should filter correctly', () => {
    const engine = createRulesEngine([
      { id: 'a', category: 'alert', priority: 'high', condition: () => true, message: '', action: '', views: ['*'], roles: ['*'] },
      { id: 'p', category: 'proactive', priority: 'high', condition: () => true, message: '', action: '', views: ['*'], roles: ['*'] },
    ])
    expect(engine.getRulesByCategory('alert')).toHaveLength(1)
    expect(engine.getRulesByCategory('proactive')).toHaveLength(1)
    expect(engine.getRulesByCategory('reactive')).toHaveLength(0)
  })
})
