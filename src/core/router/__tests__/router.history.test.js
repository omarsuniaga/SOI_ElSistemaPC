import { beforeEach, describe, expect, it, vi } from 'vitest'

// The router imports Bootstrap's Modal only for cleanup; stub it so the module
// loads under jsdom without pulling in the full Bootstrap bundle.
vi.mock('bootstrap', () => ({
  Modal: { getInstance: () => null },
}))

import { router } from '../router.js'

function setup() {
  document.body.innerHTML = '<div id="app"></div>'
  localStorage.clear()
  router.routes = {}
  router.resetHistory()
  router._guardEnabled = false
  // Register a few no-op routes
  for (const id of ['a', 'b', 'c']) {
    router.register(id, () => {})
  }
}

describe('router history / back navigation', () => {
  beforeEach(setup)

  it('starts with no history', () => {
    expect(router.canGoBack()).toBe(false)
  })

  it('pushes the previous route when navigating forward', () => {
    router.navigate('a')
    expect(router.canGoBack()).toBe(false) // nothing before 'a'
    router.navigate('b')
    expect(router.canGoBack()).toBe(true)
    router.navigate('c')
    expect(router._history.map((h) => h.path)).toEqual(['a', 'b'])
  })

  it('back() returns to the previous route without re-pushing', () => {
    router.navigate('a')
    router.navigate('b')
    router.navigate('c')
    router.back()
    expect(localStorage.getItem('current-view')).toBe('b')
    expect(router._history.map((h) => h.path)).toEqual(['a'])
    router.back()
    expect(localStorage.getItem('current-view')).toBe('a')
    expect(router.canGoBack()).toBe(false)
  })

  it('does not push duplicates for a no-op navigation', () => {
    router.navigate('a')
    router.navigate('a')
    expect(router.canGoBack()).toBe(false)
  })

  it('back() is a no-op when history is empty', () => {
    router.navigate('a')
    expect(router.back()).toBe(false)
    expect(localStorage.getItem('current-view')).toBe('a')
  })

  it('skips stale history entries whose route is no longer registered', () => {
    router.navigate('a')
    router.navigate('b')
    // Simulate 'a' being unregistered (e.g. a different portal)
    delete router.routes['a']
    expect(router.back()).toBe(false)
    expect(router.canGoBack()).toBe(false)
  })
})
