import { describe, it, expect, beforeEach, vi } from 'vitest'
import { promoteObservations } from '../api/observacionesApi.js'
import { supabase } from '../../../lib/supabaseClient.js'

// Mock the Supabase client
vi.mock('../../../lib/supabaseClient.js', () => ({
  supabase: {
    from: vi.fn()
  }
}))

describe('observacionesApi.promoteObservations Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  function setupMocks(mockData) {
    supabase.from.mockImplementation((table) => {
      const data = mockData[table] || { data: null, error: null }

      // Create a chainable object
      return {
        select: vi.fn().mockResolvedValue(data),
        insert: vi.fn().mockResolvedValue(data),
        eq: vi.fn(function() {
          return this
        }),
        single: vi.fn().mockResolvedValue(data)
      }
    })
  }

  describe('T1: Happy path - Single observation', () => {
    it('should promote one observation and return 200 OK', async () => {
      const sessionId = '550e8400-e29b-41d4-a716-446655440001'
      const alumnoIds = ['alumno-001']

      const mockData = {
        sesiones: { data: [{ id: sessionId, clase_id: 'clase-001' }], error: null },
        observaciones_sesion: {
          data: [
            {
              sesion_id: sessionId,
              alumno_id: 'alumno-001',
              contenido_parsed: { nota: 'Bien' },
              es_borrador: true
            }
          ],
          error: null
        },
        observaciones_alumnos: { data: [], error: null }
      }

      setupMocks(mockData)

      const result = await promoteObservations(sessionId, alumnoIds)

      expect(result.promoted).toBe(1)
      expect(result.skipped).toBe(0)
      expect(result.errors).toHaveLength(0)
    })
  })

  describe('T3: Bulk promote for 5 alumnos', () => {
    it('should promote 10 observations across 5 alumnos', async () => {
      const sessionId = '550e8400-e29b-41d4-a716-446655440003'
      const alumnoIds = ['a1', 'a2', 'a3', 'a4', 'a5']

      const sessionObsData = [
        { sesion_id: sessionId, alumno_id: 'a1', contenido_parsed: { nota: 'Bien' }, es_borrador: true },
        { sesion_id: sessionId, alumno_id: 'a1', contenido_parsed: { nota: 'Muy bien' }, es_borrador: true },
        { sesion_id: sessionId, alumno_id: 'a2', contenido_parsed: { nota: 'Bien' }, es_borrador: true },
        { sesion_id: sessionId, alumno_id: 'a2', contenido_parsed: { nota: 'Excelente' }, es_borrador: true },
        { sesion_id: sessionId, alumno_id: 'a3', contenido_parsed: { nota: 'Bien' }, es_borrador: true },
        { sesion_id: sessionId, alumno_id: 'a3', contenido_parsed: { nota: 'Bien' }, es_borrador: true },
        { sesion_id: sessionId, alumno_id: 'a4', contenido_parsed: { nota: 'Bien' }, es_borrador: true },
        { sesion_id: sessionId, alumno_id: 'a4', contenido_parsed: { nota: 'Regular' }, es_borrador: true },
        { sesion_id: sessionId, alumno_id: 'a5', contenido_parsed: { nota: 'Bien' }, es_borrador: true },
        { sesion_id: sessionId, alumno_id: 'a5', contenido_parsed: { nota: 'Necesita mejorar' }, es_borrador: true }
      ]

      const mockData = {
        sesiones: { data: [{ id: sessionId, clase_id: 'clase-001' }], error: null },
        observaciones_sesion: { data: sessionObsData, error: null },
        observaciones_alumnos: { data: [], error: null }
      }

      setupMocks(mockData)

      const result = await promoteObservations(sessionId, alumnoIds)

      expect(result.promoted).toBe(10)
      expect(result.skipped).toBe(0)
      expect(result.errors).toHaveLength(0)
    })
  })

  describe('T5: RLS deny - Unauthenticated', () => {
    it('should return 401 when auth token is missing', async () => {
      const sessionId = '550e8400-e29b-41d4-a716-446655440005'
      const alumnoIds = ['alumno-001']

      const mockData = {
        sesiones: { data: [{ id: sessionId, clase_id: 'clase-001' }], error: null },
        observaciones_sesion: { data: null, error: { code: 'PGRST401', message: 'Permission denied' } },
        observaciones_alumnos: { data: [], error: null }
      }

      setupMocks(mockData)

      const result = await promoteObservations(sessionId, alumnoIds)

      expect(result.promoted).toBe(0)
      expect(result.skipped).toBe(0)
      expect(result.errors).toHaveLength(1)
      expect(result.errors[0].code).toBe('INSUFFICIENT_PERMISSION')
    })
  })

  describe('T6: RLS deny - Maestro not in clase', () => {
    it('should return 401 when maestro is not in the clase', async () => {
      const sessionId = '550e8400-e29b-41d4-a716-446655440006'
      const alumnoIds = ['alumno-001']

      const mockData = {
        sesiones: { data: [{ id: sessionId, clase_id: 'clase-001' }], error: null },
        observaciones_sesion: { data: null, error: { code: 'PGRST401', message: 'Permission denied' } },
        observaciones_alumnos: { data: [], error: null }
      }

      setupMocks(mockData)

      const result = await promoteObservations(sessionId, alumnoIds)

      expect(result.errors[0].code).toBe('INSUFFICIENT_PERMISSION')
    })
  })

  describe('T8: Empty alumno_ids array', () => {
    it('should return 200 OK with zero promoted', async () => {
      const sessionId = '550e8400-e29b-41d4-a716-446655440008'
      const alumnoIds = []

      const result = await promoteObservations(sessionId, alumnoIds)

      expect(result.promoted).toBe(0)
      expect(result.skipped).toBe(0)
      expect(result.errors).toHaveLength(0)
    })
  })

  describe('T9: Invalid sesion_id (404)', () => {
    it('should return 404 when session is not found', async () => {
      const sessionId = '00000000-0000-0000-0000-000000000000'
      const alumnoIds = ['alumno-001']

      const mockData = {
        sesiones: { data: [], error: null },
        observaciones_sesion: { data: [], error: null },
        observaciones_alumnos: { data: [], error: null }
      }

      setupMocks(mockData)

      const result = await promoteObservations(sessionId, alumnoIds)

      expect(result.errors).toHaveLength(1)
      expect(result.errors[0].code).toBe('INVALID_SESSION')
    })
  })

  describe('T10: Malformed input - Missing sesion_id', () => {
    it('should return 400 when sesion_id is missing', async () => {
      const result = await promoteObservations(null, ['alumno-001'])

      expect(result.promoted).toBe(0)
      expect(result.skipped).toBe(0)
      expect(result.errors).toHaveLength(1)
      expect(result.errors[0].code).toBe('INVALID_INPUT')
    })
  })

  describe('T10: Malformed input - Non-array alumno_ids', () => {
    it('should return 400 when alumno_ids is not an array', async () => {
      const sessionId = '550e8400-e29b-41d4-a716-446655440010'

      const result = await promoteObservations(sessionId, 'not-an-array')

      expect(result.errors).toHaveLength(1)
      expect(result.errors[0].code).toBe('INVALID_INPUT')
    })
  })

  describe('T4: Dedup on re-promotion', () => {
    it('should skip already-promoted observations', async () => {
      const sessionId = '550e8400-e29b-41d4-a716-446655440004'
      const alumnoIds = ['alumno-001']

      const mockData = {
        sesiones: { data: [{ id: sessionId, clase_id: 'clase-001' }], error: null },
        observaciones_sesion: {
          data: [
            {
              sesion_id: sessionId,
              alumno_id: 'alumno-001',
              contenido_parsed: { nota: 'Bien' },
              es_borrador: true
            }
          ],
          error: null
        },
        observaciones_alumnos: {
          data: [
            {
              sesion_id: sessionId,
              alumno_id: 'alumno-001',
              contenido_parsed: { nota: 'Bien' },
              origen: 'sesion'
            }
          ],
          error: null
        }
      }

      setupMocks(mockData)

      const result = await promoteObservations(sessionId, alumnoIds)

      expect(result.promoted).toBe(0)
      expect(result.skipped).toBe(1)
      expect(result.errors).toHaveLength(0)
    })
  })
})
