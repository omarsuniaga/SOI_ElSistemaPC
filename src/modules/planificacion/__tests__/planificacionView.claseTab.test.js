import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

vi.mock('../api/planificacionAdapter.js', () => ({
  obtenerMaestros: vi.fn(async () => []),
  obtenerClases: vi.fn(async () => []),
  obtenerPlantillasPlanificacion: vi.fn(async () => []),
  obtenerCoberturaCurricular: vi.fn(async () => []),
  obtenerCoberturaEvaluacion: vi.fn(async () => []),
  obtenerPlanificacionesConDetalles: vi.fn(async () => []),
  crearPlanificacion: vi.fn(),
  actualizarPlanificacion: vi.fn(),
  eliminarPlanificacion: vi.fn(),
  marcarRevisadasMasivo: vi.fn(),
}))

vi.mock('../views/clasePlanificacionView.js', () => ({
  renderClasePlanificacionView: vi.fn(),
}))

vi.mock('../views/MaestroPlanificacionView.js', () => ({
  renderMaestroPlanificacionView: vi.fn(),
}))

vi.mock('../views/AcmAprobacionView.js', () => ({
  renderAcmAprobacionView: vi.fn(),
}))

vi.mock('../views/CoberturaCurricularView.js', () => ({
  renderCoberturaCurricularView: vi.fn(),
}))

describe('planificacionView clean delegate', () => {
  let container

  beforeEach(() => {
    container = document.createElement('div')
    document.body.appendChild(container)
    vi.resetModules()
  })

  afterEach(() => {
    document.body.removeChild(container)
    vi.clearAllMocks()
  })

  it('routes to MaestroPlanificacionView by default', async () => {
    const { renderMaestroPlanificacionView } = await import('../views/MaestroPlanificacionView.js')
    const { renderPlanificacionView } = await import('../views/planificacionView.js')
    await renderPlanificacionView(container, { viewMode: 'maestro' })

    expect(renderMaestroPlanificacionView).toHaveBeenCalledWith(container)
  })

  it('routes to AcmAprobacionView for admin or acm viewMode', async () => {
    const { renderAcmAprobacionView } = await import('../views/AcmAprobacionView.js')
    const { renderPlanificacionView } = await import('../views/planificacionView.js')
    await renderPlanificacionView(container, { viewMode: 'admin' })

    expect(renderAcmAprobacionView).toHaveBeenCalledWith(container)
  })

  it('routes to renderClasePlanificacionView for clase-plan viewMode', async () => {
    const { renderClasePlanificacionView } = await import('../views/clasePlanificacionView.js')
    const { renderPlanificacionView } = await import('../views/planificacionView.js')
    await renderPlanificacionView(container, { viewMode: 'clase-plan' })

    expect(renderClasePlanificacionView).toHaveBeenCalledWith(container)
  })
})
