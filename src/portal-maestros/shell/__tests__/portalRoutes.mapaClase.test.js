/**
 * portalRoutes.mapaClase.test.js — Tarea 3.8 (openspec/changes/mapa-gamificado-planificacion)
 *
 * Registra la ruta `planificacion-mapa-clase` que hace alcanzable por una
 * ruta real a `MapaClaseView.js` (Tarea 3.2, existía sin cablear
 * deliberadamente hasta esta tarea — ver apply-progress.md batch 5).
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('../../../modules/planificacion/views/MapaClaseView.js', () => ({
  renderMapaClaseView: vi.fn().mockResolvedValue(undefined),
}))

import { renderMapaClaseView } from '../../../modules/planificacion/views/MapaClaseView.js'
import { setupRouterRoutes, renderViewContent, CACHEABLE_VIEWS } from '../portalRoutes.js'

function makeRouter() {
  const handlers = {}
  return {
    on: vi.fn((route, fn) => { handlers[route] = fn }),
    onNotFound: vi.fn(),
    navigate: vi.fn(),
    _handlers: handlers,
  }
}

describe('portalRoutes — planificacion-mapa-clase (Tarea 3.8)', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('setupRouterRoutes registra la ruta planificacion-mapa-clase', () => {
    const router = makeRouter()
    setupRouterRoutes(router, false, vi.fn())

    const registeredRoutes = router.on.mock.calls.map(([route]) => route)
    expect(registeredRoutes).toContain('planificacion-mapa-clase')
  })

  it('renderViewContent invoca renderMapaClaseView con claseId y maestroId', async () => {
    const container = document.createElement('div')
    const router = { navigate: vi.fn() }

    await renderViewContent(
      'planificacion-mapa-clase',
      container,
      {},
      new URLSearchParams('clase=clase-1'),
      {
        router,
        permisos: {},
        maestroId: 'maestro-1',
        showLoginScreen: vi.fn(),
        cleanupPushService: vi.fn(),
        stopRealtime: vi.fn(),
        logoutMaestro: vi.fn(),
      },
    )

    expect(renderMapaClaseView).toHaveBeenCalledWith(container, {
      claseId: 'clase-1',
      maestroId: 'maestro-1',
    })
  })

  it('planificacion-mapa-clase NO es cacheable (sensible a asistencia/sesión del día, igual que "asistencia")', () => {
    expect(CACHEABLE_VIEWS.has('planificacion-mapa-clase')).toBe(false)
  })
})
