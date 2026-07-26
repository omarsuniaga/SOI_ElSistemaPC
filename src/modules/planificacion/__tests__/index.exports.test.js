import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock all dependencies of index.js
vi.mock('../api/planificacionAdapter.js', () => ({}))
vi.mock('../models/planificacion.model.js', () => ({ Planificacion: {} }))
vi.mock('../hooks/usePlanificacion.js', () => ({ usePlanificacion: vi.fn() }))
vi.mock('../planificacion.router.js', () => ({ registerRoutesPlanificacion: vi.fn() }))
vi.mock('../views/planificacionView.js', () => ({ renderPlanificacionView: vi.fn() }))
vi.mock('../components/aprobacionPlanificacionesModal.js', () => ({ openAprobacionPlanificacionesModal: vi.fn() }))
vi.mock('../utils/dslParser.js', () => ({ parseDsl: vi.fn(), highlightDsl: vi.fn(), getTokenSummary: vi.fn(), validateDsl: vi.fn() }))
vi.mock('../components/dslEditor.js', () => ({ createDslEditor: vi.fn() }))
vi.mock('../components/dslToolbar.js', () => ({ createDslToolbar: vi.fn(), createDslEditorWithToolbar: vi.fn() }))
vi.mock('../components/alumnoPickerModal.js', () => ({ createAlumnoPickerModal: vi.fn() }))
vi.mock('../views/clasePlanificacionView.js', () => ({ renderClasePlanificacionView: vi.fn() }))
vi.mock('../components/evaluacionClaseModal.js', () => ({ renderEvaluacionClaseModal: vi.fn() }))
vi.mock('../components/progresoAlumnosPanel.js', () => ({ renderProgresoAlumnosPanel: vi.fn() }))
vi.mock('../components/curriculumLinkerPanel.js', () => ({ renderCurriculumLinkerPanel: vi.fn() }))
vi.mock('../hooks/useClasePlanificacion.js', () => ({ useClasePlanificacion: vi.fn() }))

describe('planificacion module index.js exports', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.resetModules()
  })

  it('exports renderClasePlanificacionView', async () => {
    const mod = await import('../index.js')
    expect(mod.renderClasePlanificacionView).toBeDefined()
  })

  it('exports renderEvaluacionClaseModal', async () => {
    const mod = await import('../index.js')
    expect(mod.renderEvaluacionClaseModal).toBeDefined()
  })

  it('exports renderProgresoAlumnosPanel', async () => {
    const mod = await import('../index.js')
    expect(mod.renderProgresoAlumnosPanel).toBeDefined()
  })

  it('exports renderCurriculumLinkerPanel', async () => {
    const mod = await import('../index.js')
    expect(mod.renderCurriculumLinkerPanel).toBeDefined()
  })

  it('exports useClasePlanificacion', async () => {
    const mod = await import('../index.js')
    expect(mod.useClasePlanificacion).toBeDefined()
  })

  it('still exports all existing exports', async () => {
    const mod = await import('../index.js')
    expect(mod.Planificacion).toBeDefined()
    expect(mod.usePlanificacion).toBeDefined()
    expect(mod.registerRoutesPlanificacion).toBeDefined()
    expect(mod.renderPlanificacionView).toBeDefined()
    expect(mod.parseDsl).toBeDefined()
    expect(mod.createDslEditor).toBeDefined()
  })
})
