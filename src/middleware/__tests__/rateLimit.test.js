import { describe, it, expect, beforeEach, vi } from 'vitest'
import { checkRateLimit, getRateLimitStatus, initRateLimit, cleanup } from '../rateLimit.js'

describe('rateLimit', () => {
  beforeEach(() => {
    cleanup()
    initRateLimit({ windowMs: 60000, max: 5 })
  })

  it('allows requests under limit', () => {
    const result = checkRateLimit('user-1')
    expect(result.allowed).toBe(true)
    expect(result.remaining).toBe(5)
  })

  it('tracks multiple requests', () => {
    checkRateLimit('user-1')
    checkRateLimit('user-1')
    const result = checkRateLimit('user-1')
    expect(result.allowed).toBe(true)
    expect(result.remaining).toBe(3)
  })

  it('blocks when limit exceeded', () => {
    for (let i = 0; i < 5; i++) {
      checkRateLimit('user-1')
    }
    const result = checkRateLimit('user-1')
    expect(result.allowed).toBe(false)
  })

  it('tracks per-user limits', () => {
    for (let i = 0; i < 5; i++) {
      checkRateLimit('user-1')
    }
    const result = checkRateLimit('user-2')
    expect(result.allowed).toBe(true)
    expect(result.remaining).toBe(5)
  })

  it('resets after window expires', async () => {
    initRateLimit({ windowMs: 100, max: 2 })
    checkRateLimit('user-1')
    checkRateLimit('user-1')
    const blocked = checkRateLimit('user-1')
    expect(blocked.allowed).toBe(false)
    
    await new Promise(resolve => setTimeout(resolve, 150))
    
    const allowed = checkRateLimit('user-1')
    expect(allowed.allowed).toBe(true)
  })

  it('gets rate limit status', () => {
    checkRateLimit('user-1')
    checkRateLimit('user-1')
    const status = getRateLimitStatus('user-1')
    expect(status.total).toBe(5)
    expect(status.used).toBe(2)
    expect(status.remaining).toBe(3)
  })
})