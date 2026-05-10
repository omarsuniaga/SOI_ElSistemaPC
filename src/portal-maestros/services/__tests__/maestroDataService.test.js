import { describe, it, expect, beforeEach, vi } from 'vitest'
import { invalidateClasesCache } from '../maestroDataService.js'

// Mock dependencies
vi.mock('../viewCache.js', () => ({
  default: {
    getCached: vi.fn(),
    set: vi.fn(),
    invalidate: vi.fn(),
    invalidateAll: vi.fn(),
    _keys: vi.fn(() => []),
  },
}))

describe('maestroDataService - Force Refresh', () => {
  let viewCacheMock

  beforeEach(async () => {
    const viewCache = await import('../viewCache.js')
    viewCacheMock = viewCache.default
    vi.clearAllMocks()
  })

  describe('invalidateClasesCache', () => {
    it('should invalidate all class-related caches', () => {
      invalidateClasesCache()

      expect(viewCacheMock.invalidate).toHaveBeenCalledWith('mis_clases')
      expect(viewCacheMock.invalidate).toHaveBeenCalledWith('horarios')
      expect(viewCacheMock.invalidate).toHaveBeenCalledWith('inscripciones')
      expect(viewCacheMock.invalidate).toHaveBeenCalledWith('sesiones')
    })

    it('should invalidate exactly 4 caches', () => {
      invalidateClasesCache()
      expect(viewCacheMock.invalidate).toHaveBeenCalledTimes(4)
    })

    it('should handle multiple calls without errors', () => {
      expect(() => {
        invalidateClasesCache()
        invalidateClasesCache()
      }).not.toThrow()
    })
  })
})
