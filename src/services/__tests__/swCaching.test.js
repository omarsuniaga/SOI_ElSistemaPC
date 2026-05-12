import { describe, it, expect, beforeEach, vi } from 'vitest'
import { getCacheStrategy, shouldCache, getCacheVersion, clearAppCache } from '../swCaching.js'

describe('swCaching', () => {
  beforeEach(() => {
    vi.stubGlobal('caches', {
      open: vi.fn(() => Promise.resolve({
        put: vi.fn(),
        match: vi.fn(),
        keys: vi.fn(),
        delete: vi.fn(),
      })),
      keys: vi.fn(() => Promise.resolve([])),
    })
  })

  it('returns cache-first strategy for static assets', () => {
    const strategy = getCacheStrategy('/static/app.js')
    expect(strategy).toBe('cache-first')
  })

  it('returns stale-while-revalidate for real-time API calls', () => {
    const strategy = getCacheStrategy('/api/notifications')
    expect(strategy).toBe('stale-while-revalidate')
  })

  it('returns network-first for data API calls', () => {
    const strategy = getCacheStrategy('/api/students')
    expect(strategy).toBe('network-first')
  })

  it('determines if request should be cached', () => {
    expect(shouldCache('/static/style.css')).toBe(true)
    expect(shouldCache('/api/data')).toBe(true)
    expect(shouldCache('/auth/login')).toBe(false)
  })

  it('gets cache version', () => {
    const version = getCacheVersion()
    expect(version).toBeDefined()
    expect(version).toMatch(/^v\d+$/)
  })

  it('clears app cache', async () => {
    const result = await clearAppCache()
    expect(result.success).toBe(true)
  })
})