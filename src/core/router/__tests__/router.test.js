import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'

import { router } from '../router.js'

describe('router query params', () => {
  beforeEach(() => {
    router.routes = {}
    router._guardEnabled = false
    router._authCheck = null
    router._publicRoutes = ['login', 'register']
    document.body.innerHTML = '<div id="app"></div>'
    localStorage.clear()
  })

  afterEach(() => {
    document.body.innerHTML = ''
  })

  it('parses query string params and forwards them to the route handler', () => {
    const render = vi.fn()
    router.register('planificacion-disenador', render)

    router.navigate('planificacion-disenador?clase=clase-123&parentRoute=planificacion')

    expect(render).toHaveBeenCalledWith(
      expect.any(HTMLDivElement),
      {
        clase: 'clase-123',
        parentRoute: 'planificacion',
      },
    )
  })

  it('merges explicit params over query string params', () => {
    const render = vi.fn()
    router.register('planificacion-ruta', render)

    router.navigate('planificacion-ruta?clase=clase-123', { claseId: 'clase-999' })

    expect(render).toHaveBeenCalledWith(
      expect.any(HTMLDivElement),
      {
        clase: 'clase-123',
        claseId: 'clase-999',
      },
    )
  })

  it('preserves the protected route and merged params when auth redirects to login', () => {
    const login = vi.fn()
    router.register('login', login)
    router.register('planificacion-ruta', vi.fn())
    router.setAuthGuard(() => false, ['login', 'register'])

    router.navigate('planificacion-ruta?clase=clase-123', {
      claseId: 'clase-999',
      parentRoute: 'planificacion',
    })

    expect(login).toHaveBeenCalledWith(expect.any(HTMLDivElement), {})
    expect(localStorage.getItem('intended-route')).toBe('planificacion-ruta')
    expect(JSON.parse(localStorage.getItem('intended-route-params'))).toEqual({
      clase: 'clase-123',
      claseId: 'clase-999',
      parentRoute: 'planificacion',
    })
  })

  it('falls back to dir-score before programas for an unknown route', () => {
    const dirScore = vi.fn()
    const programas = vi.fn()
    router.register('programas', programas)
    router.register('dir-score', dirScore)

    router.navigate('ruta-inexistente')

    expect(dirScore).toHaveBeenCalledWith(expect.any(HTMLDivElement), {})
    expect(programas).not.toHaveBeenCalled()
    expect(localStorage.getItem('current-view')).toBe('dir-score')
  })

  it('restores stored params when init resumes the current view', () => {
    const render = vi.fn()
    router.register('clases', render)
    localStorage.setItem('current-view', 'clases')
    localStorage.setItem('current-view-params', JSON.stringify({ selectedId: 'clase-42' }))

    router.init()

    expect(render).toHaveBeenCalledWith(expect.any(HTMLDivElement), {
      selectedId: 'clase-42',
    })
  })

  it('emits one routeChanged event with the resolved route', () => {
    router.register('alumnos', vi.fn())
    const listener = vi.fn()
    window.addEventListener('routeChanged', listener, { once: true })

    router.navigate('alumnos?instrumento=violin')

    expect(listener).toHaveBeenCalledOnce()
    expect(listener.mock.calls[0][0].detail).toBe('alumnos')
  })
})
