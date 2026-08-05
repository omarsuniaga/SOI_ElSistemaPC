import { describe, it, expect, vi, beforeEach } from 'vitest'

const mockRouter = { register: vi.fn() }
vi.mock('../../../core/router/router.js', () => ({ router: mockRouter }))

const mockRenderMaestroPlanificacionView = vi.fn()
const mockRenderAcmAprobacionView = vi.fn()
const mockRenderCoberturaView = vi.fn()
const mockRenderAcmPropuestasView = vi.fn()
const mockRenderClasePlanificacionView = vi.fn()
const mockRenderDisenadorView = vi.fn()
const mockRenderRutaPedagogicaView = vi.fn()
const mockRenderPlanificacionPrintView = vi.fn()

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
vi.mock('../views/PlanificacionPrintView.js', () => ({
  renderPlanificacionPrintView: mockRenderPlanificacionPrintView,
}))

describe('planificacion.router - planificacion routes', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('registers clase and print routes', async () => {
    const { registerRoutesPlanificacion } = await import('../planificacion.router.js')

    registerRoutesPlanificacion()

    const routeCalls = mockRouter.register.mock.calls.map((c) => c[0])
    expect(routeCalls).toContain('planificacion-clase')
    expect(routeCalls).toContain('planificacion-print')
  })

  it('the planificacion-clase route calls renderClasePlanificacionView', async () => {
    const { registerRoutesPlanificacion } = await import('../planificacion.router.js')

    registerRoutesPlanificacion()

    const claseRoute = mockRouter.register.mock.calls.find((c) => c[0] === 'planificacion-clase')
    expect(claseRoute).toBeTruthy()

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

  it('the planificacion-print route calls renderPlanificacionPrintView with params', async () => {
    const { registerRoutesPlanificacion } = await import('../planificacion.router.js')

    registerRoutesPlanificacion()

    const printRoute = mockRouter.register.mock.calls.find((c) => c[0] === 'planificacion-print')
    expect(printRoute).toBeTruthy()

    const mockContainer = document.createElement('div')
    printRoute[1](mockContainer, { scope: 'class', claseId: 'clase-55', output: 'pdf' })

    expect(mockRenderPlanificacionPrintView).toHaveBeenCalledWith(
      mockContainer,
      expect.objectContaining({ scope: 'class', claseId: 'clase-55', output: 'pdf' }),
    )
  })
})
