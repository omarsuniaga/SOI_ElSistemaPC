import { describe, it, expect, vi, beforeEach } from 'vitest'

// ── Mocks ──────────────────────────────────────────────────────────────────────
// All mock paths must resolve to the same module the production code imports.
// From __tests__/ → ../../../ resolves to src/ level.

const mockRouter = { register: vi.fn() }
vi.mock('../../../core/router/router.js', () => ({ router: mockRouter }))

const mockRenderMaestroPlanificacionView = vi.fn()
const mockRenderAcmAprobacionView = vi.fn()
const mockRenderCoberturaView = vi.fn()
const mockRenderAcmPropuestasView = vi.fn()
const mockRenderClasePlanificacionView = vi.fn()
const mockRenderDisenadorView = vi.fn()
const mockRenderRutaPedagogicaView = vi.fn()

vi.mock('../views/MaestroPlanificacionView.js', () => ({
  renderMaestroPlanificacionView: mockRenderMaestroPlanificacionView,
}))

vi.mock('../views/AcmAprobacionView.js', () => ({
  renderAcmAprobacionView: mockRenderAcmAprobacionView,
}))

vi.mock('../views/CoberturaCurricularView.js', () => ({
  renderCoberturaCurricularView: mockRenderCoberturaView,
}))

vi.mock('../views/acmPropuestasView.js', () => ({
  renderAcmPropuestasView: mockRenderAcmPropuestasView,
}))

vi.mock('../views/clasePlanificacionView.js', () => ({
  renderClasePlanificacionView: mockRenderClasePlanificacionView,
}))
vi.mock('../views/DisenadorCurricularView.js', () => ({
  renderDisenadorCurricularView: mockRenderDisenadorView,
}))
vi.mock('../views/RutaPedagogicaView.js', () => ({
  renderRutaPedagogicaView: mockRenderRutaPedagogicaView,
}))

// ── Tests ──────────────────────────────────────────────────────────────────────
describe('planificacion.router - planificacion-clase route', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('registers a planificacion-clase route', async () => {
    const { registerRoutesPlanificacion } = await import('../planificacion.router.js')

    registerRoutesPlanificacion()

    const routeCalls = mockRouter.register.mock.calls.map((c) => c[0])
    expect(routeCalls).toContain('planificacion-clase')
  })

  it('the planificacion-clase route calls renderClasePlanificacionView', async () => {
    const { renderClasePlanificacionView } = await import('../views/clasePlanificacionView.js')
    const { registerRoutesPlanificacion } = await import('../planificacion.router.js')

    registerRoutesPlanificacion()

    // Find the planificacion-clase route handler
    const claseRoute = mockRouter.register.mock.calls.find((c) => c[0] === 'planificacion-clase')
    expect(claseRoute).toBeTruthy()

    // Call the handler with a mock container
    const mockContainer = document.createElement('div')
    claseRoute[1](mockContainer)

    expect(mockRenderClasePlanificacionView).toHaveBeenCalledWith(mockContainer, {})
  })

  it('the planificacion-disenador route forwards class params to renderDisenadorCurricularView', async () => {
    const { registerRoutesPlanificacion } = await import('../planificacion.router.js')

    registerRoutesPlanificacion()

    const disenadorRoute = mockRouter.register.mock.calls.find((c) => c[0] === 'planificacion-disenador')
    expect(disenadorRoute).toBeTruthy()

    const mockContainer = document.createElement('div')
    disenadorRoute[1](mockContainer, { clase: 'clase-123', parentRoute: 'planificacion-ruta' })

    expect(mockRenderDisenadorView).toHaveBeenCalledWith(
      mockContainer,
      expect.objectContaining({ claseId: 'clase-123', parentRoute: 'planificacion-ruta' }),
    )
  })
})
