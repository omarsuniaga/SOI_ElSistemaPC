import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'

import { router } from '../router.js'

describe('router query params', () => {
  beforeEach(() => {
    router.routes = {}
    router._guardEnabled = false
    router._authCheck = null
    router._publicRoutes = ['login', 'register']
    document.body.innerHTML = '<div id="app"></div>'
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
})
