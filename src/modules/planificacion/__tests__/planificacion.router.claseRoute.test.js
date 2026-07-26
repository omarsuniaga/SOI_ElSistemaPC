import { describe, it, expect, vi, beforeEach } from 'vitest'

// ── Mocks ──────────────────────────────────────────────────────────────────────
// All mock paths must resolve to the same module the production code imports.
// From __tests__/ → ../../../ resolves to src/ level.

const mockRouter = { register: vi.fn() }
vi.mock('../../../core/router/router.js', () => ({ router: mockRouter }))

const mockRenderPlanificacionView = vi.fn()
const mockRenderCoberturaView = vi.fn()
vi.mock('../views/planificacionView.js', () => ({
  renderPlanificacionView: mockRenderPlanificacionView,
  renderCoberturaView: mockRenderCoberturaView,
}))

vi.mock('../views/rutaAcademicaView.js', () => ({
  renderRutaAcademicaView: vi.fn(),
}))

vi.mock('../views/acmProuestasView.js', () => ({
  renderAcmPropuestasView: vi.fn(),
}))

vi.mock('../views/clasePlanificacionView.js', () => ({
  renderClasePlanificacionView: vi.fn(),
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

    expect(renderClasePlanificacionView).toHaveBeenCalledWith(mockContainer)
  })
})
