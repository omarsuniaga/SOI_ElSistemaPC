import { describe, it, expect, vi } from 'vitest'
import { batchPromoteSessionObservations } from '../services/cronPromoteObservations.js'

// Mock promoteObservations function at module level (BEFORE describe)
vi.mock('../api/observacionesApi.js', () => ({
  promoteObservations: vi.fn(async (sessionId, alumnoIds) => ({
    promoted: alumnoIds.length,
    skipped: 0,
    errors: []
  }))
}))

/**
 * T-D-02: batchPromoteSessionObservations() service function tests
 *
 * Unit tests following TDD pattern: RED → GREEN → TRIANGULATE → REFACTOR
 */

describe('batchPromoteSessionObservations Service', () => {
  // Helper to build a mock Supabase client with chainable query builder
  function buildMockSupabase(pendingSessions = [], alumnosBySessionId = {}, promoteResults = {}) {
    return {
      from: vi.fn((table) => {
        const builder = {
          select: vi.fn(function() {
            return this
          }),
          neq: vi.fn(function(col, val) {
            // Query pending sessions
            if (table === 'sesiones_clase' && col === 'fecha_fin' && val === null) {
              return {
                eq: vi.fn(function(col2, val2) {
                  if (col2 === 'es_promocionado' && val2 === false) {
                    return Promise.resolve({ data: pendingSessions, error: null })
                  }
                  return Promise.resolve({ data: [], error: null })
                })
              }
            }
            return this
          }),
          eq: vi.fn(function(col, val) {
            // Query alumnos for a session
            if (table === 'alumnos_clases' && col === 'clase_id') {
              return Promise.resolve({
                data: alumnosBySessionId[val] || [],
                error: null
              })
            }
            // Update session
            if (table === 'sesiones_clase' && col === 'id') {
              return Promise.resolve({ data: null, error: null })
            }
            return this
          }),
          update: vi.fn(function(updates) {
            return {
              eq: vi.fn(function(col, val) {
                return Promise.resolve({ data: null, error: null })
              })
            }
          })
        }
        return builder
      })
    }
  }

  describe('T1: Single session with multiple alumnos (happy path)', () => {
    it('should promote a single session with 3 alumnos', async () => {
      const { promoteObservations } = await import('../api/observacionesApi.js')

      // Setup: one pending session with 3 alumnos
      const mockSupabase = buildMockSupabase(
        [{ id: 's1', fecha_fin: '2026-05-17T14:30:00Z', es_promocionado: false }],
        { s1: [{ alumno_id: 'a1' }, { alumno_id: 'a2' }, { alumno_id: 'a3' }] }
      )

      // Act
      const result = await batchPromoteSessionObservations(mockSupabase, promoteObservations)

      // Assert: processed=1 (one session), promoted=1 (one session marked as promoted)
      expect(result.processed).toBe(1)
      expect(result.promoted).toBe(1)
      expect(result.errors).toHaveLength(0)
      expect(promoteObservations).toHaveBeenCalledWith('s1', ['a1', 'a2', 'a3'])
    })
  })

  describe('T2: Multiple sessions in batch (happy path)', () => {
    it('should promote 5 sessions', async () => {
      const { promoteObservations } = await import('../api/observacionesApi.js')

      // Setup: 5 pending sessions
      const mockSupabase = buildMockSupabase(
        [
          { id: 's1', fecha_fin: '2026-05-17T14:30:00Z', es_promocionado: false },
          { id: 's2', fecha_fin: '2026-05-17T14:30:00Z', es_promocionado: false },
          { id: 's3', fecha_fin: '2026-05-17T14:30:00Z', es_promocionado: false },
          { id: 's4', fecha_fin: '2026-05-17T14:30:00Z', es_promocionado: false },
          { id: 's5', fecha_fin: '2026-05-17T14:30:00Z', es_promocionado: false }
        ],
        {
          s1: [{ alumno_id: 'a1' }, { alumno_id: 'a2' }],
          s2: [{ alumno_id: 'a1' }],
          s3: [{ alumno_id: 'a2' }],
          s4: [{ alumno_id: 'a3' }],
          s5: [{ alumno_id: 'a1' }, { alumno_id: 'a3' }]
        }
      )

      // Act
      const result = await batchPromoteSessionObservations(mockSupabase, promoteObservations)

      // Assert: processed=5, promoted=5, no errors
      expect(result.processed).toBe(5)
      expect(result.promoted).toBe(5)
      expect(result.errors).toHaveLength(0)
    })
  })

  describe('T3: Partial failure in batch (one API error)', () => {
    it('should continue batch when one session API call fails', async () => {
      const { promoteObservations } = await import('../api/observacionesApi.js')

      // Mock that fails for s3
      const mockPromote = vi.fn(async (sessionId, alumnoIds) => {
        if (sessionId === 's3') {
          return {
            promoted: 0,
            skipped: 0,
            errors: [{ message: 'RLS policy rejected: maestro role mismatch' }]
          }
        }
        return { promoted: alumnoIds.length, skipped: 0, errors: [] }
      })

      const mockSupabase = buildMockSupabase(
        [
          { id: 's1', fecha_fin: '2026-05-17T14:30:00Z', es_promocionado: false },
          { id: 's2', fecha_fin: '2026-05-17T14:30:00Z', es_promocionado: false },
          { id: 's3', fecha_fin: '2026-05-17T14:30:00Z', es_promocionado: false },
          { id: 's4', fecha_fin: '2026-05-17T14:30:00Z', es_promocionado: false },
          { id: 's5', fecha_fin: '2026-05-17T14:30:00Z', es_promocionado: false }
        ],
        {
          s1: [{ alumno_id: 'a1' }],
          s2: [{ alumno_id: 'a1' }],
          s3: [{ alumno_id: 'a1' }],
          s4: [{ alumno_id: 'a1' }],
          s5: [{ alumno_id: 'a1' }]
        }
      )

      // Act
      const result = await batchPromoteSessionObservations(mockSupabase, mockPromote)

      // Assert: processed=5 (all checked), promoted=4 (one failed), errors=1
      expect(result.processed).toBe(5)
      expect(result.promoted).toBe(4)
      expect(result.errors).toHaveLength(1)
      expect(result.errors[0].sessionId).toBe('s3')
    })
  })

  describe('T4: No pending sessions (empty batch)', () => {
    it('should return zero counts when no sessions are pending', async () => {
      const { promoteObservations } = await import('../api/observacionesApi.js')
      const mockSupabase = buildMockSupabase([], {})

      // Act
      const result = await batchPromoteSessionObservations(mockSupabase, promoteObservations)

      // Assert: processed=0, promoted=0, no errors
      expect(result.processed).toBe(0)
      expect(result.promoted).toBe(0)
      expect(result.errors).toHaveLength(0)
    })
  })

  describe('T5: Idempotence (dryRun mode)', () => {
    it('should not update es_promocionado when dryRun=true', async () => {
      const { promoteObservations } = await import('../api/observacionesApi.js')
      const mockSupabase = buildMockSupabase(
        [{ id: 's1', fecha_fin: '2026-05-17T14:30:00Z', es_promocionado: false }],
        { s1: [{ alumno_id: 'a1' }] }
      )

      // Spy on update calls
      const updateSpy = vi.fn(function() {
        return {
          eq: vi.fn(async () => ({ data: null, error: null }))
        }
      })
      mockSupabase.from('sesiones_clase').update = updateSpy

      // Act with dryRun=true
      const result = await batchPromoteSessionObservations(mockSupabase, promoteObservations, { dryRun: true })

      // Assert: promoted=1 but update was NOT called
      expect(result.promoted).toBe(1)
      expect(updateSpy).not.toHaveBeenCalled()
    })
  })

  describe('T6: Query error handling', () => {
    it('should return error when initial query fails', async () => {
      const { promoteObservations } = await import('../api/observacionesApi.js')
      const mockSupabase = {
        from: vi.fn((table) => {
          if (table === 'sesiones_clase') {
            return {
              select: vi.fn(function() {
                return this
              }),
              neq: vi.fn(function(col, val) {
                return {
                  eq: vi.fn(async () => ({
                    data: null,
                    error: { message: 'Database connection failed' }
                  }))
                }
              })
            }
          }
          return { select: vi.fn(() => Promise.resolve({ data: [], error: null })) }
        })
      }

      // Act
      const result = await batchPromoteSessionObservations(mockSupabase, promoteObservations)

      // Assert: error recorded, no sessions processed
      expect(result.processed).toBe(0)
      expect(result.promoted).toBe(0)
      expect(result.errors).toHaveLength(1)
      expect(result.errors[0].message).toContain('Database')
    })
  })
})
