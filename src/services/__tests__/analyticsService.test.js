import { describe, it, expect, beforeEach, vi } from 'vitest'
import { trackEvent, setUser, initAnalytics, isEnabled } from '../analyticsService.js'

describe('analyticsService', () => {
  beforeEach(() => {
    initAnalytics({ enabled: false })
  })

  it('initializes with disabled by default', () => {
    expect(isEnabled()).toBe(false)
  })

  it('initializes with consent', () => {
    initAnalytics({ enabled: true, consent: true })
    expect(isEnabled()).toBe(true)
  })

  it('tracks events when enabled', () => {
    initAnalytics({ enabled: true, consent: true })
    const result = trackEvent('page_view', { path: '/dashboard' })
    expect(result).toBe(true)
  })

  it('skips tracking when disabled', () => {
    initAnalytics({ enabled: false })
    const result = trackEvent('page_view', { path: '/dashboard' })
    expect(result).toBe(false)
  })

  it('sets user context', () => {
    initAnalytics({ enabled: true, consent: true })
    setUser('user-123', { role: 'teacher' })
    expect(isEnabled()).toBe(true)
  })
})