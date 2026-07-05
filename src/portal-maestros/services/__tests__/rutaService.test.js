import { describe, it, expect, beforeEach, vi } from 'vitest'
import { loadSemaphoresInBatch, getSemaphoreCacheKey } from '../rutaService.js'
import { SemaphoreCache } from '../../../lib/semaphoreCache.js'

// Mock dependencies
vi.mock('../evaluationService.js', () => ({
  getSemaphoreForNode: vi.fn(),
}))

vi.mock('../../lib/supabaseClient.js', () => ({
  supabase: {
    from: vi.fn(),
  },
}))

describe('rutaService - Batch Semaphore Operations', () => {
  let semaphoreCache

  beforeEach(() => {
    semaphoreCache = new SemaphoreCache({ ttl: 60000 })
    vi.clearAllMocks()
  })

  describe('getSemaphoreCacheKey', () => {
    it('should create a cache key from nodeId and claseId', () => {
      const key = getSemaphoreCacheKey('node-123', 'clase-456')
      expect(key).toBe('node-123:clase-456')
    })

    it('should handle various nodeId and claseId formats', () => {
      const key1 = getSemaphoreCacheKey('abc', '123')
      const key2 = getSemaphoreCacheKey('node-abc-def', 'clase-xyz-123')

      expect(key1).toBe('abc:123')
      expect(key2).toBe('node-abc-def:clase-xyz-123')
    })
  })

  describe('loadSemaphoresInBatch', () => {
    it('should load semaphores for multiple nodes efficiently', async () => {
      const { getSemaphoreForNode } = await import('../evaluationService.js')

      getSemaphoreForNode.mockImplementation((nodeId, claseId) => {
        const states = {
          'node-1': { semaphore: 'green' },
          'node-2': { semaphore: 'yellow' },
          'node-3': { semaphore: 'gray' },
        }
        return Promise.resolve(states[nodeId] || { semaphore: 'gray' })
      })

      const nodeIds = ['node-1', 'node-2', 'node-3']
      const claseId = 'clase-1'

      const results = await loadSemaphoresInBatch(nodeIds, claseId, semaphoreCache)

      expect(results).toEqual(
        new Map([
          ['node-1', 'green'],
          ['node-2', 'yellow'],
          ['node-3', 'gray'],
        ])
      )
    })

    it('should use cache for previously loaded semaphores', async () => {
      const { getSemaphoreForNode } = await import('../evaluationService.js')

      getSemaphoreForNode.mockResolvedValue({ semaphore: 'green' })

      const nodeIds = ['node-1', 'node-2']
      const claseId = 'clase-1'

      // First call
      await loadSemaphoresInBatch(nodeIds, claseId, semaphoreCache)

      // Second call should use cache
      await loadSemaphoresInBatch(nodeIds, claseId, semaphoreCache)

      // Should only have called getSemaphoreForNode once per unique node
      expect(getSemaphoreForNode).toHaveBeenCalledTimes(2)
    })

    it('should handle mixed cached and uncached nodes', async () => {
      const { getSemaphoreForNode } = await import('../evaluationService.js')

      getSemaphoreForNode.mockResolvedValue({ semaphore: 'yellow' })

      const claseId = 'clase-1'

      // Pre-populate cache for node-1
      semaphoreCache.set(getSemaphoreCacheKey('node-1', claseId), 'green')

      const nodeIds = ['node-1', 'node-2', 'node-3']
      const results = await loadSemaphoresInBatch(nodeIds, claseId, semaphoreCache)

      expect(results.get('node-1')).toBe('green') // from cache
      expect(results.get('node-2')).toBe('yellow') // fetched
      expect(results.get('node-3')).toBe('yellow') // fetched
    })

    it('should handle empty node list', async () => {
      const claseId = 'clase-1'
      const results = await loadSemaphoresInBatch([], claseId, semaphoreCache)

      expect(results).toEqual(new Map())
    })

    it('should handle errors gracefully by returning gray state', async () => {
      const { getSemaphoreForNode } = await import('../evaluationService.js')

      getSemaphoreForNode.mockImplementation((nodeId) => {
        if (nodeId === 'node-2') {
          return Promise.reject(new Error('Network error'))
        }
        return Promise.resolve({ semaphore: 'green' })
      })

      const nodeIds = ['node-1', 'node-2', 'node-3']
      const claseId = 'clase-1'

      const results = await loadSemaphoresInBatch(nodeIds, claseId, semaphoreCache)

      expect(results.get('node-1')).toBe('green')
      expect(results.get('node-2')).toBe('gray') // error fallback
      expect(results.get('node-3')).toBe('green')
    })
  })

  describe('Cache invalidation scenarios', () => {
    it('should support invalidating semaphores for a specific clase', () => {
      const claseId = 'clase-1'
      semaphoreCache.set(getSemaphoreCacheKey('node-1', claseId), 'green')
      semaphoreCache.set(getSemaphoreCacheKey('node-2', claseId), 'yellow')
      semaphoreCache.set(getSemaphoreCacheKey('node-1', 'clase-2'), 'gray')

      // Invalidate all semaphores for clase-1
      semaphoreCache.invalidatePrefix(`node-1:${claseId}`)

      expect(semaphoreCache.has(getSemaphoreCacheKey('node-1', claseId))).toBe(false)
      expect(semaphoreCache.has(getSemaphoreCacheKey('node-2', claseId))).toBe(true)
      expect(semaphoreCache.has(getSemaphoreCacheKey('node-1', 'clase-2'))).toBe(true)
    })
  })
})
