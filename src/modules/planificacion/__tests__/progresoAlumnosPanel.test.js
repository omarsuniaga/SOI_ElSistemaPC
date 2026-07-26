import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

// ── Mocks ──────────────────────────────────────────────────────────────────────
vi.mock('../services/evaluacionClaseService.js', () => ({
  obtenerEvaluacionesPorClase: vi.fn(),
  obtenerProgresoAlumnos: vi.fn(),
}))

const mockAlumnos = [
  { id: 'al-1', nombre_completo: 'Luis García' },
  { id: 'al-2', nombre_completo: 'María López' },
  { id: 'al-3', nombre_completo: 'Pedro Martínez' },
]

const mockIndicadores = [
  { id: 'ind-1', description: 'Entonación precisa', node_nombre: 'Escalas' },
  { id: 'ind-2', description: 'Ritmo estable', node_nombre: 'Ritmo' },
  { id: 'ind-3', description: 'Postura correcta', node_nombre: 'Técnica' },
]

const mockEvaluaciones = [
  // Luis: dominado ind-1, en_progreso ind-2, sin_evaluar ind-3
  { alumno_id: 'al-1', indicator_id: 'ind-1', estado: 'dominado', nota: 5 },
  { alumno_id: 'al-1', indicator_id: 'ind-2', estado: 'en_progreso', nota: 3 },
  // María: en_progreso ind-1, dominado ind-2, en_progreso ind-3
  { alumno_id: 'al-2', indicator_id: 'ind-1', estado: 'en_progreso', nota: 3 },
  { alumno_id: 'al-2', indicator_id: 'ind-2', estado: 'dominado', nota: 4 },
  { alumno_id: 'al-2', indicator_id: 'ind-3', estado: 'en_progreso', nota: 3 },
  // Pedro: sin_evaluar ind-1, inicia ind-2, sin_evaluar ind-3
  { alumno_id: 'al-3', indicator_id: 'ind-2', estado: 'inicia', nota: 2 },
]

const mockProgresoAlumnos = [
  { alumno_id: 'al-1', alumno_nombre: 'Luis García', total: 3, dominados: 1, en_progreso: 1, sin_evaluar: 1 },
  { alumno_id: 'al-2', alumno_nombre: 'María López', total: 3, dominados: 1, en_progreso: 2, sin_evaluar: 0 },
  { alumno_id: 'al-3', alumno_nombre: 'Pedro Martínez', total: 3, dominados: 0, en_progreso: 0, sin_evaluar: 2 },
]

// ── Tests ──────────────────────────────────────────────────────────────────────
describe('progresoAlumnosPanel', () => {
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

  describe('renderProgresoAlumnosPanel', () => {
    it('shows loading state initially', async () => {
      const svc = await import('../services/evaluacionClaseService.js')
      svc.obtenerEvaluacionesPorClase.mockReturnValue(new Promise(() => {})) // never resolves

      const { renderProgresoAlumnosPanel } = await import('../components/progresoAlumnosPanel.js')
      renderProgresoAlumnosPanel(container, {
        claseId: 'clase-1',
        alumnos: mockAlumnos,
        indicadores: mockIndicadores,
      })

      expect(container.querySelector('.spinner-border')).toBeTruthy()
    })

    it('renders progress matrix after loading', async () => {
      const svc = await import('../services/evaluacionClaseService.js')
      svc.obtenerEvaluacionesPorClase.mockResolvedValue(mockEvaluaciones)

      const { renderProgresoAlumnosPanel } = await import('../components/progresoAlumnosPanel.js')
      renderProgresoAlumnosPanel(container, {
        claseId: 'clase-1',
        alumnos: mockAlumnos,
        indicadores: mockIndicadores,
      })

      await new Promise((r) => setTimeout(r, 100))

      // Matrix table exists
      const table = container.querySelector('.progress-matrix-table')
      expect(table).toBeTruthy()
    })

    it('displays student names as row headers', async () => {
      const svc = await import('../services/evaluacionClaseService.js')
      svc.obtenerEvaluacionesPorClase.mockResolvedValue(mockEvaluaciones)

      const { renderProgresoAlumnosPanel } = await import('../components/progresoAlumnosPanel.js')
      renderProgresoAlumnosPanel(container, {
        claseId: 'clase-1',
        alumnos: mockAlumnos,
        indicadores: mockIndicadores,
      })

      await new Promise((r) => setTimeout(r, 100))

      expect(container.textContent).toContain('Luis García')
      expect(container.textContent).toContain('María López')
      expect(container.textContent).toContain('Pedro Martínez')
    })

    it('displays indicator names as column headers', async () => {
      const svc = await import('../services/evaluacionClaseService.js')
      svc.obtenerEvaluacionesPorClase.mockResolvedValue(mockEvaluaciones)

      const { renderProgresoAlumnosPanel } = await import('../components/progresoAlumnosPanel.js')
      renderProgresoAlumnosPanel(container, {
        claseId: 'clase-1',
        alumnos: mockAlumnos,
        indicadores: mockIndicadores,
      })

      await new Promise((r) => setTimeout(r, 100))

      expect(container.textContent).toContain('Entonación precisa')
      expect(container.textContent).toContain('Ritmo estable')
      expect(container.textContent).toContain('Postura correcta')
    })

    it('renders traffic-light colored cells', async () => {
      const svc = await import('../services/evaluacionClaseService.js')
      svc.obtenerEvaluacionesPorClase.mockResolvedValue(mockEvaluaciones)

      const { renderProgresoAlumnosPanel } = await import('../components/progresoAlumnosPanel.js')
      renderProgresoAlumnosPanel(container, {
        claseId: 'clase-1',
        alumnos: mockAlumnos,
        indicadores: mockIndicadores,
      })

      await new Promise((r) => setTimeout(r, 100))

      // Green cells (dominado)
      const greenCells = container.querySelectorAll('.progress-cell--dominado')
      expect(greenCells.length).toBe(2) // Luis ind-1, María ind-2

      // Yellow cells (en_progreso)
      const yellowCells = container.querySelectorAll('.progress-cell--en_progreso')
      expect(yellowCells.length).toBe(3) // Luis ind-2, María ind-1, María ind-3

      // Gray cells (sin_evaluar)
      const grayCells = container.querySelectorAll('.progress-cell--sin_evaluar')
      expect(grayCells.length).toBe(3) // Luis ind-3, Pedro ind-1, Pedro ind-3

      // Red cells (inicia)
      const redCells = container.querySelectorAll('.progress-cell--inicia')
      expect(redCells.length).toBe(1) // Pedro ind-2
    })

    it('dispatches evaluacion:open event when cell is clicked', async () => {
      const svc = await import('../services/evaluacionClaseService.js')
      svc.obtenerEvaluacionesPorClase.mockResolvedValue(mockEvaluaciones)

      const { renderProgresoAlumnosPanel } = await import('../components/progresoAlumnosPanel.js')
      renderProgresoAlumnosPanel(container, {
        claseId: 'clase-1',
        alumnos: mockAlumnos,
        indicadores: mockIndicadores,
      })

      await new Promise((r) => setTimeout(r, 100))

      let receivedDetail = null
      const handler = vi.fn((e) => { receivedDetail = e.detail })
      document.addEventListener('evaluacion:open', handler)

      const cell = container.querySelector('.progress-cell')
      expect(cell).toBeTruthy()
      cell.click()

      expect(handler).toHaveBeenCalledTimes(1)
      expect(receivedDetail).toHaveProperty('alumnoId')
      expect(receivedDetail).toHaveProperty('indicatorId')

      document.removeEventListener('evaluacion:open', handler)
    })

    it('shows per-alumno summary cards', async () => {
      const svc = await import('../services/evaluacionClaseService.js')
      svc.obtenerEvaluacionesPorClase.mockResolvedValue(mockEvaluaciones)

      const { renderProgresoAlumnosPanel } = await import('../components/progresoAlumnosPanel.js')
      renderProgresoAlumnosPanel(container, {
        claseId: 'clase-1',
        alumnos: mockAlumnos,
        indicadores: mockIndicadores,
      })

      await new Promise((r) => setTimeout(r, 100))

      const summaryCards = container.querySelectorAll('.alumno-summary-card')
      expect(summaryCards.length).toBe(3)
    })

    it('shows per-indicator summary', async () => {
      const svc = await import('../services/evaluacionClaseService.js')
      svc.obtenerEvaluacionesPorClase.mockResolvedValue(mockEvaluaciones)

      const { renderProgresoAlumnosPanel } = await import('../components/progresoAlumnosPanel.js')
      renderProgresoAlumnosPanel(container, {
        claseId: 'clase-1',
        alumnos: mockAlumnos,
        indicadores: mockIndicadores,
      })

      await new Promise((r) => setTimeout(r, 100))

      const indicatorSummary = container.querySelectorAll('.indicador-summary-row')
      expect(indicatorSummary.length).toBe(3)
    })

    it('shows error state when service fails', async () => {
      const svc = await import('../services/evaluacionClaseService.js')
      svc.obtenerEvaluacionesPorClase.mockRejectedValue(new Error('Network fail'))

      const { renderProgresoAlumnosPanel } = await import('../components/progresoAlumnosPanel.js')
      renderProgresoAlumnosPanel(container, {
        claseId: 'clase-1',
        alumnos: mockAlumnos,
        indicadores: mockIndicadores,
      })

      await new Promise((r) => setTimeout(r, 100))

      expect(container.textContent).toContain('Error')
    })
  })
})
