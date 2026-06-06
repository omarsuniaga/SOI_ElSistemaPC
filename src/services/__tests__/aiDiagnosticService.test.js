import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mocking dependencies
vi.mock('../../portal-maestros/services/groqService.js', () => ({
  callGroq: vi.fn(),
  parseGroqJSON: vi.fn((raw) => JSON.parse(raw))
}))

vi.mock('../dbOptimizer.js', () => ({
  getQueryStats: vi.fn(),
  getIndexes: vi.fn()
}))

vi.mock('../errorReporter.js', () => ({
  getRecentErrors: vi.fn()
}))

vi.mock('../swCaching.js', () => ({
  getCacheVersion: vi.fn()
}))

import { runAIDiagnostic } from '../aiDiagnosticService.js'
import { callGroq } from '../../portal-maestros/services/groqService.js'
import { getQueryStats } from '../dbOptimizer.js'
import { getRecentErrors } from '../errorReporter.js'
import { getCacheVersion } from '../swCaching.js'

describe('aiDiagnosticService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('runs diagnostic successfully and returns structured JSON from AI', async () => {
    getQueryStats.mockReturnValue({ totalQueries: 10, slowQueries: 0, indexHits: 9, indexMisses: 1 })
    getRecentErrors.mockReturnValue([])
    getCacheVersion.mockReturnValue('v1')

    const mockResponse = JSON.stringify({
      healthScore: 95,
      findings: [{ severity: 'info', msg: 'System healthy' }],
      recommendations: {
        sql: null,
        cache: 'keep',
        advice: 'No action needed.'
      }
    })

    callGroq.mockResolvedValue(mockResponse)

    const result = await runAIDiagnostic()

    expect(callGroq).toHaveBeenCalled()
    expect(result.healthScore).toBe(95)
    expect(result.findings).toHaveLength(1)
    expect(result.findings[0].msg).toBe('System healthy')
    expect(result.recommendations.cache).toBe('keep')
    expect(result.recommendations.sql).toBeNull()
  })

  it('falls back gracefully to local analysis when callGroq fails', async () => {
    getQueryStats.mockReturnValue({ totalQueries: 50, slowQueries: 5, indexHits: 10, indexMisses: 40 })
    getRecentErrors.mockReturnValue([{ message: 'Failed network' }])
    getCacheVersion.mockReturnValue('v1')

    callGroq.mockRejectedValue(new Error('Rate limit exceeded'))

    const result = await runAIDiagnostic()

    expect(result.healthScore).toBe(70) // lowered due to errors
    expect(result.findings).toHaveLength(3) // 1 error finding, 1 miss finding, 1 basic local diagnostic msg
    expect(result.findings[0].severity).toBe('critical')
    expect(result.findings[1].severity).toBe('warning')
    expect(result.recommendations.cache).toBe('clear')
    expect(result.recommendations.sql).toContain('CREATE INDEX')
    expect(result.recommendations.advice).toContain('Conexión con el servicio de IA no disponible')
  })
})
