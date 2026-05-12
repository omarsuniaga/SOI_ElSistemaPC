import { describe, it, expect, beforeEach, vi } from 'vitest'
import { optimizeQuery, getIndexes, explainQuery, getQueryStats } from '../dbOptimizer.js'

describe('dbOptimizer', () => {
  beforeEach(() => {
    vi.stubGlobal('console', { ...console, log: vi.fn(), warn: vi.fn() })
  })

  it('returns defined indexes', () => {
    const indexes = getIndexes()
    expect(indexes).toBeDefined()
    expect(Array.isArray(indexes)).toBe(true)
  })

  it('has observations indexes', () => {
    const indexes = getIndexes()
    const obsIndex = indexes.find(i => i.table === 'observations')
    expect(obsIndex).toBeDefined()
    expect(obsIndex.columns).toContain('student_id')
  })

  it('optimizes query with WHERE clause', () => {
    const query = { table: 'observations', where: { student_id: '123' } }
    const optimized = optimizeQuery(query)
    expect(optimized.optimized).toBe(true)
    expect(optimized.usesIndex).toBe(true)
  })

  it('detects missing indexes', () => {
    const query = { table: 'observations', where: { texto: 'test' } }
    const optimized = optimizeQuery(query)
    expect(optimized.suggestIndex).toBeDefined()
  })

  it('explains query plan', () => {
    const query = { table: 'students', where: { id: '123' } }
    const explanation = explainQuery(query)
    expect(explanation).toBeDefined()
    expect(explanation.type).toBeDefined()
  })

  it('tracks query stats', () => {
    const stats = getQueryStats()
    expect(stats.totalQueries).toBeDefined()
    expect(stats.slowQueries).toBeDefined()
  })
})