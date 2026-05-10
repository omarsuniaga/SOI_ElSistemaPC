import { describe, it, expect, beforeEach, vi } from 'vitest'
import { resolveRutaIdForClaseWithFuzzy } from '../rutaService.js'

// Mock dependencies
vi.mock('../maestroDataService.js', () => ({
  getMisClases: vi.fn(),
}))

vi.mock('../../../lib/supabaseClient.js', () => ({
  supabase: {
    from: vi.fn(),
  },
}))

describe('rutaService - Fuzzy Matching for Routes', () => {
  let getMisClasesMock
  let supabaseMock

  beforeEach(async () => {
    const { getMisClases } = await import('../maestroDataService.js')
    const { supabase } = await import('../../../lib/supabaseClient.js')

    getMisClasesMock = getMisClases
    supabaseMock = supabase

    vi.clearAllMocks()
  })

  describe('resolveRutaIdForClaseWithFuzzy', () => {
    it('should find exact instrument match', async () => {
      getMisClasesMock.mockResolvedValue([
        { id: 'clase-1', instrumento: 'violin' },
      ])

      const maybeSingleMock = vi.fn().mockResolvedValue({
        data: { id: 'route-1', route_versions: [{ id: 'rv-1' }] },
        error: null,
      })
      const limitMock = vi.fn().mockReturnValue({ maybeSingle: maybeSingleMock })
      const eqMock = vi.fn().mockReturnValue({ limit: limitMock })
      const ilikeMock = vi.fn().mockReturnValue({ eq: eqMock })
      const selectMock = vi.fn().mockReturnValue({ ilike: ilikeMock })
      const fromMock = vi.fn().mockReturnValue({ select: selectMock })

      supabaseMock.from.mockImplementation(fromMock)

      const result = await resolveRutaIdForClaseWithFuzzy('clase-1')

      expect(result).toBe('rv-1')
    })

    it('should find fuzzy match when exact match not found', async () => {
      getMisClasesMock.mockResolvedValue([
        { id: 'clase-1', instrumento: 'violín' }, // with accent
      ])

      let callCount = 0
      const fromMock = vi.fn().mockImplementation((table) => {
        if (table === 'routes' && callCount === 0) {
          // First call - exact match query
          callCount++
          const maybeSingleMock = vi.fn().mockResolvedValue({
            data: null,
            error: null,
          })
          const limitMock = vi.fn().mockReturnValue({ maybeSingle: maybeSingleMock })
          const eqMock = vi.fn().mockReturnValue({ limit: limitMock })
          const ilikeMock = vi.fn().mockReturnValue({ eq: eqMock })
          const selectMock = vi.fn().mockReturnValue({ ilike: ilikeMock })
          return { select: selectMock }
        } else {
          // Second call - fuzzy match query (all routes)
          const eqMock = vi.fn().mockResolvedValue({
            data: [{ id: 'route-1', instrument: 'violín', route_versions: [{ id: 'rv-1' }] }],
            error: null,
          })
          const selectMock = vi.fn().mockReturnValue({ eq: eqMock })
          return { select: selectMock }
        }
      })

      supabaseMock.from.mockImplementation(fromMock)

      const result = await resolveRutaIdForClaseWithFuzzy('clase-1')

      // Should still find a match through fuzzy matching fallback
      expect(typeof result).toBe('string')
    })

    it('should return null when clase not found', async () => {
      getMisClasesMock.mockResolvedValue([])

      const result = await resolveRutaIdForClaseWithFuzzy('clase-nonexistent')

      expect(result).toBeNull()
      expect(supabaseMock.from).not.toHaveBeenCalled()
    })

    it('should handle error gracefully', async () => {
      getMisClasesMock.mockResolvedValue([
        { id: 'clase-1', instrumento: 'violin' },
      ])

      let callCount = 0
      const fromMock = vi.fn().mockImplementation((table) => {
        if (table === 'routes' && callCount === 0) {
          // First call - exact match query
          callCount++
          const maybeSingleMock = vi.fn().mockResolvedValue({
            data: null,
            error: null,
          })
          const limitMock = vi.fn().mockReturnValue({ maybeSingle: maybeSingleMock })
          const eqMock = vi.fn().mockReturnValue({ limit: limitMock })
          const ilikeMock = vi.fn().mockReturnValue({ eq: eqMock })
          const selectMock = vi.fn().mockReturnValue({ ilike: ilikeMock })
          return { select: selectMock }
        } else {
          // Second call - error
          const eqMock = vi.fn().mockResolvedValue({
            data: null,
            error: new Error('Database error'),
          })
          const selectMock = vi.fn().mockReturnValue({ eq: eqMock })
          return { select: selectMock }
        }
      })

      supabaseMock.from.mockImplementation(fromMock)

      const result = await resolveRutaIdForClaseWithFuzzy('clase-1')

      expect(result).toBeNull()
    })

    it('should handle multiple instruments separated by comma', async () => {
      getMisClasesMock.mockResolvedValue([
        { id: 'clase-1', instrumento: 'violin, viola, cello' },
      ])

      const maybeSingleMock = vi.fn().mockResolvedValue({
        data: { id: 'route-1', route_versions: [{ id: 'rv-1' }] },
        error: null,
      })
      const limitMock = vi.fn().mockReturnValue({ maybeSingle: maybeSingleMock })
      const eqMock = vi.fn().mockReturnValue({ limit: limitMock })
      const ilikeMock = vi.fn().mockReturnValue({ eq: eqMock })
      const selectMock = vi.fn().mockReturnValue({ ilike: ilikeMock })
      const fromMock = vi.fn().mockReturnValue({ select: selectMock })

      supabaseMock.from.mockImplementation(fromMock)

      const result = await resolveRutaIdForClaseWithFuzzy('clase-1')

      expect(result).toBe('rv-1')
    })

    it('should not make query when no clases found', async () => {
      getMisClasesMock.mockResolvedValue([])

      const result = await resolveRutaIdForClaseWithFuzzy('clase-1')

      expect(result).toBeNull()
      expect(supabaseMock.from).not.toHaveBeenCalled()
    })
  })
})
