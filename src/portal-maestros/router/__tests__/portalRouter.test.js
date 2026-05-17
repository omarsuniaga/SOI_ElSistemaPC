/**
 * Tests for view transition classes on route change
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { createPortalRouter } from '../portalRouter.js'

describe('View Transitions', () => {
  let router

  beforeEach(() => {
    // Setup minimal DOM for router
    document.body.innerHTML = '<div class="pm-view-container"></div>'

    // Mock window.location
    Object.defineProperty(window, 'location', {
      value: { pathname: '/', hash: '' },
      writable: true,
    })

    // Mock history
    window.history.pushState = vi.fn()
    window.history.replaceState = vi.fn()

    router = createPortalRouter()
  })

  afterEach(() => {
    document.body.innerHTML = ''
  })

  it('should add pm-view-enter class when a new view is dispatched', () => {
    router.on('test-route', () => {
      const view = document.createElement('div')
      view.className = 'pm-view-content active'
      view.textContent = 'Test View'
      document.querySelector('.pm-view-container').appendChild(view)
    })

    router._dispatch('test-route')

    const viewEl = document.querySelector('.pm-view-content.active')
    expect(viewEl).toBeTruthy()
    expect(viewEl.classList.contains('pm-view-enter')).toBe(true)
  })

  it('should add pm-view-enter-active after requestAnimationFrame', () => new Promise(done => {
    router.on('test-route', () => {
      const view = document.createElement('div')
      view.className = 'pm-view-content active'
      view.textContent = 'Test View'
      document.querySelector('.pm-view-container').appendChild(view)
    })

    router._dispatch('test-route')

    const viewEl = document.querySelector('.pm-view-content.active')

    // rAF fires asynchronously; use rAF to check after the callback
    requestAnimationFrame(() => {
      expect(viewEl.classList.contains('pm-view-enter-active')).toBe(true)
      done()
    })
  }))

  it('should not apply transition if _dispatch is called with same route', () => {
    router.on('same-route', () => {
      const view = document.createElement('div')
      view.className = 'pm-view-content active'
      view.textContent = 'Same View'
      document.querySelector('.pm-view-container').appendChild(view)
    })

    router._dispatch('same-route')
    const viewEl = document.querySelector('.pm-view-content.active')

    // Clear to test second call doesn't re-add
    viewEl.classList.remove('pm-view-enter', 'pm-view-enter-active')
    router._dispatch('same-route')

    // Second call to same route should be no-op (early return)
    expect(viewEl.classList.contains('pm-view-enter')).toBe(false)
  })

  it('should not break if no pm-view-content.active exists', () => {
    router.on('empty-route', () => {
      // Handler that doesn't create any view
    })

    // Should not throw
    expect(() => router._dispatch('empty-route')).not.toThrow()
  })
})
