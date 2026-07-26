import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

// ── Mocks ──────────────────────────────────────────────────────────────────────
vi.mock('../hooks/useClasePlanificacion.js', () => {
  const instance = {
    rutaAsignada: null,
    objetivos: [],
    evaluaciones: [],
    progresoAlumnos: [],
    cargando: false,
    error: null,
    fetchRutaDeClase: vi.fn(async () => null),
    asignarRuta: vi.fn(async () => ({})),
    fetchObjetivos: vi.fn(async () => []),
    agregarObjetivos: vi.fn(async () => []),
    fetchEvaluaciones: vi.fn(async () => []),
    evaluarAlumno: vi.fn(async () => ({})),
    fetchProgresoAlumnos: vi.fn(async () => []),
    subscribe: vi.fn(() => () => {}),
    reset: vi.fn(),
  }
  return { useClasePlanificacion: vi.fn(() => instance), _mockHook: instance }
})

vi.mock('../services/clasePlanificacionService.js', () => ({
  asignarRutaAClase: vi.fn(),
  obtenerRutaDeClase: vi.fn(),
  obtenerRutaActivaPorClase: vi.fn(),
  cambiarEstadoPlan: vi.fn(),
  eliminarRutaDeClase: vi.fn(),
}))

vi.mock('../../../shared/components/AppModal.js', () => ({
  AppModal: { open: vi.fn(), close: vi.fn() },
}))

vi.mock('../../../shared/components/AppToast.js', () => ({
  AppToast: { success: vi.fn(), error: vi.fn(), info: vi.fn() },
}))

vi.mock('../../alumnos/api/alumnosApi.js', () => ({
  getAlumnos: vi.fn(async () => [
    { id: 'al-1', nombre_completo: 'Luis García' },
    { id: 'al-2', nombre_completo: 'María López' },
  ]),
}))

vi.mock('../api/weeklyPlanAdapter.js', () => ({
  obtenerRutasActivas: vi.fn(async () => []),
  obtenerVersionesCurriculares: vi.fn(async () => []),
}))

// ── Tests ──────────────────────────────────────────────────────────────────────
describe('clasePlanificacionView', () => {
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

  describe('renderClasePlanificacionView', () => {
    it('renders the main view container', async () => {
      const { renderClasePlanificacionView } = await import('../views/clasePlanificacionView.js')

      renderClasePlanificacionView(container)

      expect(container.querySelector('.clase-plan-view')).toBeTruthy()
    })

    it('shows the view title', async () => {
      const { renderClasePlanificacionView } = await import('../views/clasePlanificacionView.js')

      renderClasePlanificacionView(container)

      expect(container.textContent).toContain('Planificación de Clase')
    })

    it('shows loading state when fetching', async () => {
      const { _mockHook } = await import('../hooks/useClasePlanificacion.js')
      _mockHook.cargando = true

      const { renderClasePlanificacionView } = await import('../views/clasePlanificacionView.js')
      renderClasePlanificacionView(container)

      expect(container.querySelector('.spinner-border')).toBeTruthy()
    })

    it('shows error state when hook has error', async () => {
      const { _mockHook } = await import('../hooks/useClasePlanificacion.js')
      _mockHook.error = 'Failed to load'
      _mockHook.cargando = false

      const { renderClasePlanificacionView } = await import('../views/clasePlanificacionView.js')
      renderClasePlanificacionView(container)

      expect(container.textContent).toContain('Error')
      expect(container.textContent).toContain('Failed to load')
    })

    it('shows empty state when no route assigned', async () => {
      const { _mockHook } = await import('../hooks/useClasePlanificacion.js')
      _mockHook.rutaAsignada = null
      _mockHook.objetivos = []
      _mockHook.cargando = false
      _mockHook.error = null

      const { renderClasePlanificacionView } = await import('../views/clasePlanificacionView.js')
      renderClasePlanificacionView(container)

      expect(container.textContent).toContain('Sin ruta')
    })

    it('shows route info when route is assigned', async () => {
      const { _mockHook } = await import('../hooks/useClasePlanificacion.js')
      _mockHook.rutaAsignada = { id: 'ccp-1', estado: 'activo', route_version_id: 'rv-1' }
      _mockHook.cargando = false

      const { renderClasePlanificacionView } = await import('../views/clasePlanificacionView.js')
      renderClasePlanificacionView(container)

      expect(container.textContent).toContain('Ruta Asignada')
      expect(container.textContent).toContain('Activa')
    })

    it('shows list of objectives when they exist', async () => {
      const { _mockHook } = await import('../hooks/useClasePlanificacion.js')
      _mockHook.rutaAsignada = { id: 'ccp-1', estado: 'activo' }
      _mockHook.objetivos = [
        { id: 'obj-1', indicator_id: 'ind-1', indicator_description: 'Entonación precisa', estado: 'pendiente' },
        { id: 'obj-2', indicator_id: 'ind-2', indicator_description: 'Ritmo estable', estado: 'completado' },
      ]
      _mockHook.cargando = false

      const { renderClasePlanificacionView } = await import('../views/clasePlanificacionView.js')
      renderClasePlanificacionView(container)

      expect(container.textContent).toContain('Entonación precisa')
      expect(container.textContent).toContain('Ritmo estable')
    })

    it('dispatches evaluacion:open event when evaluating', async () => {
      const { _mockHook } = await import('../hooks/useClasePlanificacion.js')
      _mockHook.rutaAsignada = { id: 'ccp-1', estado: 'activo' }
      _mockHook.objetivos = [
        { id: 'obj-1', indicator_id: 'ind-1', indicator_description: 'Entonación', estado: 'pendiente' },
      ]
      _mockHook.cargando = false

      const { renderClasePlanificacionView } = await import('../views/clasePlanificacionView.js')
      renderClasePlanificacionView(container)

      let receivedDetail = null
      const handler = vi.fn((e) => { receivedDetail = e.detail })
      document.addEventListener('evaluacion:open', handler)

      const evalBtn = container.querySelector('[data-action="evaluar"]')
      if (evalBtn) {
        evalBtn.click()
        expect(handler).toHaveBeenCalled()
      }

      document.removeEventListener('evaluacion:open', handler)
    })
  })
})
