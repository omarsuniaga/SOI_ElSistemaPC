import { describe, it, expect, beforeEach, vi } from 'vitest'
import { createPortalRouter } from '../../src/portal-maestros/router/portalRouter.js'

describe('portalRouter', () => {
  let router

  beforeEach(() => {
    window.location.hash = ''
    router = createPortalRouter()
  })

  it('devuelve ruta actual desde hash', () => {
    window.location.hash = '#/hoy'
    expect(router.currentRoute()).toBe('hoy')
  })

  it('devuelve ruta por defecto si hash está vacío', () => {
    window.location.hash = ''
    expect(router.currentRoute()).toBe('hoy')
  })

  it('navigate cambia el hash y dispara handlers', () => {
    const handler = vi.fn()
    router.on('hoy', handler)
    router.navigate('hoy')
    expect(window.location.hash).toBe('#/hoy')
  })

  it('registrar handler para ruta desconocida usa fallback', () => {
    const fallback = vi.fn()
    router.onNotFound(fallback)
    router.navigate('inexistente')
    router._dispatch('inexistente')
    expect(fallback).toHaveBeenCalled()
  })
})
