import { describe, it, expect, beforeEach, vi } from 'vitest'
import { initWebVitals, getWebVitals, isSupported } from '../webVitals.js'

describe('webVitals', () => {
  beforeEach(() => {
    vi.stubGlobal('PerformanceObserver', vi.fn())
    vi.stubGlobal('performance', {
      timing: { navigationStart: 1000 },
      now: vi.fn(() => 2500),
    })
  })

  it('checks web vitals support', () => {
    const supported = isSupported()
    expect(typeof supported).toBe('boolean')
  })

  it('initializes web vitals monitoring', () => {
    initWebVitals({ debug: false })
  })

  it('retrieves collected metrics', () => {
    const metrics = getWebVitals()
    expect(metrics).toBeDefined()
    expect(typeof metrics).toBe('object')
  })
})