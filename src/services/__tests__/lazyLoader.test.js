import { describe, it, expect, beforeEach, vi } from 'vitest'
import { lazyLoadRoute, preloadRoute, getLoadedRoutes, clearCache } from '../lazyLoader.js'

describe('lazyLoader', () => {
  beforeEach(() => {
    clearCache()
    vi.stubGlobal('import', vi.fn((path) => Promise.resolve({ default: vi.fn() })))
  })

  it('lazy loads a route on first access', async () => {
    const loadFn = vi.fn(() => Promise.resolve({ render: vi.fn() }))
    const route = lazyLoadRoute('/test', loadFn)
    
    const component = await route.loader()
    expect(loadFn).toHaveBeenCalled()
    expect(component).toBeDefined()
  })

  it('caches loaded routes', async () => {
    const loadFn = vi.fn(() => Promise.resolve({ render: vi.fn() }))
    const route = lazyLoadRoute('/test', loadFn)
    
    await route.loader()
    await route.loader()
    
    expect(loadFn).toHaveBeenCalledTimes(1)
  })

  it('tracks loaded routes', async () => {
    const loadFn = vi.fn(() => Promise.resolve({ render: vi.fn() }))
    const route = lazyLoadRoute('/test', loadFn)
    
    await route.loader()
    const loaded = getLoadedRoutes()
    expect(loaded).toContain('/test')
  })

  it('preloads route on demand', async () => {
    const loadFn = vi.fn(() => Promise.resolve({ render: vi.fn() }))
    const route = lazyLoadRoute('/test', loadFn)
    
    const routes = { '/test': route }
    await preloadRoute('/test', routes)
    expect(loadFn).toHaveBeenCalled()
  })

  it('clears cache', async () => {
    const loadFn = vi.fn(() => Promise.resolve({ render: vi.fn() }))
    const route = lazyLoadRoute('/test', loadFn)
    
    await route.loader()
    clearCache()
    
    await route.loader()
    expect(loadFn).toHaveBeenCalledTimes(2)
  })
})