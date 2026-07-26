import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

// ── Mocks ──────────────────────────────────────────────────────────────────────
vi.mock('../services/evaluacionClaseService.js', () => ({
  registrarEvaluacion: vi.fn(),
  obtenerEvaluacionesPorClase: vi.fn(),
  obtenerEvaluacionPorAlumno: vi.fn(),
}))

vi.mock('../../../shared/components/AppModal.js', () => ({
  AppModal: {
    open: vi.fn(),
    close: vi.fn(),
  },
}))

vi.mock('../../../shared/components/AppToast.js', () => ({
  AppToast: {
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
  },
}))

const mockAlumnos = [
  { id: 'al-1', nombre_completo: 'Luis García' },
  { id: 'al-2', nombre_completo: 'María López' },
]

const mockIndicadores = [
  { id: 'ind-1', description: 'Entonación precisa', node_nombre: 'Escalas' },
  { id: 'ind-2', description: 'Ritmo estable', node_nombre: 'Ritmo' },
]

// ── Tests ──────────────────────────────────────────────────────────────────────
describe('evaluacionClaseModal', () => {
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

  describe('renderEvaluacionClaseModal', () => {
    it('creates a modal overlay element', async () => {
      const { renderEvaluacionClaseModal } = await import('../components/evaluacionClaseModal.js')

      renderEvaluacionClaseModal({
        claseId: 'clase-1',
        alumnos: mockAlumnos,
        indicadores: mockIndicadores,
      })

      const overlay = document.querySelector('.eval-modal-overlay')
      expect(overlay).toBeTruthy()
    })

    it('displays the title with class context', async () => {
      const { renderEvaluacionClaseModal } = await import('../components/evaluacionClaseModal.js')

      renderEvaluacionClaseModal({
        claseId: 'clase-1',
        alumnos: mockAlumnos,
        indicadores: mockIndicadores,
      })

      const title = document.querySelector('.eval-modal-title')
      expect(title).toBeTruthy()
      expect(title.textContent).toContain('Evaluación')
    })

    it('renders student selector with all students', async () => {
      const { renderEvaluacionClaseModal } = await import('../components/evaluacionClaseModal.js')

      renderEvaluacionClaseModal({
        claseId: 'clase-1',
        alumnos: mockAlumnos,
        indicadores: mockIndicadores,
      })

      const select = document.querySelector('#eval-alumno-select')
      expect(select).toBeTruthy()
      const options = select.querySelectorAll('option')
      // 1 placeholder + 2 students
      expect(options.length).toBe(3)
      expect(options[1].textContent).toContain('Luis García')
      expect(options[2].textContent).toContain('María López')
    })

    it('renders indicator rows for evaluation', async () => {
      const { renderEvaluacionClaseModal } = await import('../components/evaluacionClaseModal.js')

      renderEvaluacionClaseModal({
        claseId: 'clase-1',
        alumnos: mockAlumnos,
        indicadores: mockIndicadores,
      })

      const rows = document.querySelectorAll('.eval-indicator-row')
      expect(rows.length).toBe(2)
    })

    it('renders estado dropdown with correct options', async () => {
      const { renderEvaluacionClaseModal } = await import('../components/evaluacionClaseModal.js')

      renderEvaluacionClaseModal({
        claseId: 'clase-1',
        alumnos: mockAlumnos,
        indicadores: mockIndicadores,
      })

      const selects = document.querySelectorAll('.eval-estado-select')
      expect(selects.length).toBe(2)
      // Check first select has the expected options
      const options = selects[0].querySelectorAll('option')
      const optionValues = Array.from(options).map((o) => o.value)
      expect(optionValues).toContain('sin_evaluar')
      expect(optionValues).toContain('inicia')
      expect(optionValues).toContain('en_progreso')
      expect(optionValues).toContain('avanzado')
      expect(optionValues).toContain('dominado')
    })

    it('renders nota input fields', async () => {
      const { renderEvaluacionClaseModal } = await import('../components/evaluacionClaseModal.js')

      renderEvaluacionClaseModal({
        claseId: 'clase-1',
        alumnos: mockAlumnos,
        indicadores: mockIndicadores,
      })

      const inputs = document.querySelectorAll('.eval-nota-input')
      expect(inputs.length).toBe(2)
      inputs.forEach((inp) => {
        expect(inp.type).toBe('number')
        expect(inp.min).toBe('1')
        expect(inp.max).toBe('5')
      })
    })

    it('renders observaciones textarea for each indicator', async () => {
      const { renderEvaluacionClaseModal } = await import('../components/evaluacionClaseModal.js')

      renderEvaluacionClaseModal({
        claseId: 'clase-1',
        alumnos: mockAlumnos,
        indicadores: mockIndicadores,
      })

      const textareas = document.querySelectorAll('.eval-observaciones-input')
      expect(textareas.length).toBe(2)
    })

    it('removes overlay from DOM on cancel button click', async () => {
      const { renderEvaluacionClaseModal } = await import('../components/evaluacionClaseModal.js')

      renderEvaluacionClaseModal({
        claseId: 'clase-1',
        alumnos: mockAlumnos,
        indicadores: mockIndicadores,
      })

      const overlay = document.querySelector('.eval-modal-overlay')
      expect(overlay).toBeTruthy()

      const cancelBtn = overlay.querySelector('.eval-modal-cancel')
      expect(cancelBtn).toBeTruthy()
      cancelBtn.click()

      // Wait for the 200ms animation timeout in close()
      await new Promise((r) => setTimeout(r, 250))
      expect(document.querySelector('.eval-modal-overlay')).toBeNull()
    })
  })

  describe('pre-populated evaluation data', () => {
    it('pre-fills existing evaluation data when provided', async () => {
      const { renderEvaluacionClaseModal } = await import('../components/evaluacionClaseModal.js')

      const evaluacionesExistentes = [
        { indicator_id: 'ind-1', alumno_id: 'al-1', nota: 4, estado: 'avanzado', observaciones: 'Bien' },
      ]

      renderEvaluacionClaseModal({
        claseId: 'clase-1',
        alumnos: mockAlumnos,
        indicadores: mockIndicadores,
        evaluaciones: evaluacionesExistentes,
        alumnoPreseleccionado: 'al-1',
      })

      // The nota input for ind-1 should be pre-filled
      const notaInputs = document.querySelectorAll('.eval-nota-input')
      expect(notaInputs[0].value).toBe('4')

      const estadoSelects = document.querySelectorAll('.eval-estado-select')
      expect(estadoSelects[0].value).toBe('avanzado')
    })
  })

  describe('save evaluation', () => {
    it('saves evaluations via service when save button clicked', async () => {
      const { registrarEvaluacion } = await import('../services/evaluacionClaseService.js')
      registrarEvaluacion.mockResolvedValue({ id: 'eval-1' })

      const onSave = vi.fn()
      const { renderEvaluacionClaseModal } = await import('../components/evaluacionClaseModal.js')

      renderEvaluacionClaseModal({
        claseId: 'clase-1',
        alumnos: mockAlumnos,
        indicadores: mockIndicadores,
        onSave,
      })

      // Select a student
      const alumnoSelect = document.querySelector('#eval-alumno-select')
      alumnoSelect.value = 'al-1'
      alumnoSelect.dispatchEvent(new Event('change'))

      // Fill in evaluation data for first indicator
      const notaInput = document.querySelector('.eval-nota-input')
      notaInput.value = '4'
      notaInput.dispatchEvent(new Event('input'))

      const estadoSelect = document.querySelector('.eval-estado-select')
      estadoSelect.value = 'avanzado'
      estadoSelect.dispatchEvent(new Event('change'))

      // Click save
      const saveBtn = document.querySelector('.eval-modal-save')
      saveBtn.click()

      // Wait for async
      await new Promise((r) => setTimeout(r, 100))

      expect(registrarEvaluacion).toHaveBeenCalled()
      expect(onSave).toHaveBeenCalled()
    })
  })
})
