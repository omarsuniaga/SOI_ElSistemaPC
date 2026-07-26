import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

// ── Mocks ──────────────────────────────────────────────────────────────────────
vi.mock('../api/planificacionAdapter.js', () => ({
  obtenerMaestros: vi.fn(async () => []),
  obtenerClases: vi.fn(async () => []),
  obtenerPlantillasPlanificacion: vi.fn(async () => []),
  obtenerCoberturaCurricular: vi.fn(async () => []),
  obtenerCoberturaEvaluacion: vi.fn(async () => []),
  crearPlanificacion: vi.fn(),
  actualizarPlanificacion: vi.fn(),
  eliminarPlanificacion: vi.fn(),
  marcarRevisadasMasivo: vi.fn(),
}))

vi.mock('../api/weeklyPlanAdapter.js', () => ({
  obtenerFuentesCurriculares: vi.fn(async () => []),
  obtenerVersionesCurriculares: vi.fn(async () => []),
  obtenerRutasActivas: vi.fn(async () => []),
  publicarVersionCurricular: vi.fn(),
  crearRutaActiva: vi.fn(),
}))

vi.mock('../hooks/usePlanificacion.js', () => ({
  usePlanificacion: vi.fn(() => ({
    planificaciones: [],
    fetchPlanificacionesConDetalles: vi.fn(async () => []),
    setPage: vi.fn(async () => {}),
    setFilters: vi.fn(async () => {}),
    maestroActualId: null,
    currentPage: 1,
    pageSize: 20,
    totalCount: 0,
    searchTerm: '',
    filterClaseId: '',
    filterEstado: '',
  })),
}))

vi.mock('../hooks/useClasePlanificacion.js', () => ({
  useClasePlanificacion: vi.fn(() => ({
    rutaAsignada: null,
    objetivos: [],
    cargando: false,
    error: null,
    subscribe: vi.fn(() => () => {}),
    fetchRutaDeClase: vi.fn(async () => null),
  })),
}))

vi.mock('../views/clasePlanificacionView.js', () => ({
  renderClasePlanificacionView: vi.fn(),
}))

vi.mock('../../../shared/components/AppModal.js', () => ({
  AppModal: { open: vi.fn(), close: vi.fn() },
}))

vi.mock('../../../shared/components/AppToast.js', () => ({
  AppToast: { success: vi.fn(), error: vi.fn(), info: vi.fn() },
}))

vi.mock('../../../shared/components/HelpPanel.js', () => ({
  HelpPanel: { open: vi.fn() },
}))

vi.mock('../../alumnos/api/alumnosApi.js', () => ({
  getAlumnos: vi.fn(async () => []),
}))

vi.mock('../../clases/utils/clasesUtils.js', () => ({
  escapeHTML: vi.fn((s) => s || ''),
}))

// ── Tests ──────────────────────────────────────────────────────────────────────
describe('planificacionView - clase tab', () => {
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

  describe('planificacionView with clase tab', () => {
    it('renders the "Planificación de Clase" tab button', async () => {
      const { renderPlanificacionView } = await import('../views/planificacionView.js')
      await renderPlanificacionView(container, { viewMode: 'maestro', skipFetch: true })

      const tabsContainer = container.querySelector('#planificacion-tabs')
      expect(tabsContainer).toBeTruthy()

      const tabBtns = tabsContainer.querySelectorAll('.planificacion-segment-btn')
      const tabTexts = Array.from(tabBtns).map((btn) => btn.textContent.trim())
      expect(tabTexts.some((t) => t.includes('Clase'))).toBe(true)
    })

    it('has a tab-content div for clase-plan', async () => {
      const { renderPlanificacionView } = await import('../views/planificacionView.js')
      await renderPlanificacionView(container, { viewMode: 'maestro', skipFetch: true })

      const tabContent = container.querySelector('#tab-content-clase-plan')
      expect(tabContent).toBeTruthy()
    })

    it('calls renderClasePlanificacionView when clase-plan tab is activated', async () => {
      const { renderClasePlanificacionView } = await import('../views/clasePlanificacionView.js')
      const { renderPlanificacionView } = await import('../views/planificacionView.js')
      await renderPlanificacionView(container, { viewMode: 'maestro', skipFetch: true })

      // Click the clase tab
      const claseTab = container.querySelector('[data-tab="clase-plan"]')
      expect(claseTab).toBeTruthy()
      claseTab.click()

      // Wait for async import
      await new Promise((r) => setTimeout(r, 100))

      expect(renderClasePlanificacionView).toHaveBeenCalled()
    })
  })
})
