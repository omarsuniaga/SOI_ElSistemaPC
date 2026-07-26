import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

// ── Mocks ──────────────────────────────────────────────────────────────────────
vi.mock('../services/clasePlanificacionService.js', () => ({
  asignarRutaAClase: vi.fn(),
  obtenerRutaActivaPorClase: vi.fn(),
}))

vi.mock('../services/claseObjetivosService.js', () => ({
  agregarObjetivos: vi.fn(),
  obtenerObjetivosPorPlanificacion: vi.fn(),
}))

const mockRutas = [
  {
    id: 'rv-1',
    name: 'Violín Nivel 1',
    instrumento: 'Violín',
    levels: [
      {
        id: 'lev-1',
        name: 'Nivel 1',
        nodes: [
          {
            id: 'node-1',
            name: 'Escalas mayores',
            indicators: [
              { id: 'ind-1', description: 'Entonación precisa de escala mayor' },
              { id: 'ind-2', description: 'Ritmo uniforme en escala' },
            ],
          },
          {
            id: 'node-2',
            name: 'Postura',
            indicators: [
              { id: 'ind-3', description: 'Postura correcta del instrumento' },
            ],
          },
        ],
      },
    ],
  },
]

// ── Tests ──────────────────────────────────────────────────────────────────────
describe('curriculumLinkerPanel', () => {
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

  describe('renderCurriculumLinkerPanel', () => {
    it('renders a panel with route selector', async () => {
      const { renderCurriculumLinkerPanel } = await import('../components/curriculumLinkerPanel.js')

      renderCurriculumLinkerPanel(container, {
        claseId: 'clase-1',
        rutas: mockRutas,
      })

      const select = container.querySelector('#cl-route-select')
      expect(select).toBeTruthy()
      // 1 placeholder + 1 route
      expect(select.querySelectorAll('option').length).toBe(2)
    })

    it('displays route name in selector', async () => {
      const { renderCurriculumLinkerPanel } = await import('../components/curriculumLinkerPanel.js')

      renderCurriculumLinkerPanel(container, {
        claseId: 'clase-1',
        rutas: mockRutas,
      })

      expect(container.textContent).toContain('Violín Nivel 1')
    })

    it('shows empty state when no routes available', async () => {
      const { renderCurriculumLinkerPanel } = await import('../components/curriculumLinkerPanel.js')

      renderCurriculumLinkerPanel(container, {
        claseId: 'clase-1',
        rutas: [],
      })

      expect(container.textContent).toContain('Sin rutas')
    })

    it('shows levels and nodes when route is selected', async () => {
      const { renderCurriculumLinkerPanel } = await import('../components/curriculumLinkerPanel.js')

      renderCurriculumLinkerPanel(container, {
        claseId: 'clase-1',
        rutas: mockRutas,
      })

      // Simulate route selection
      const select = container.querySelector('#cl-route-select')
      select.value = 'rv-1'
      select.dispatchEvent(new Event('change'))

      expect(container.textContent).toContain('Escalas mayores')
      expect(container.textContent).toContain('Postura')
    })

    it('renders checkboxes for each indicator', async () => {
      const { renderCurriculumLinkerPanel } = await import('../components/curriculumLinkerPanel.js')

      renderCurriculumLinkerPanel(container, {
        claseId: 'clase-1',
        rutas: mockRutas,
      })

      // Select route
      const select = container.querySelector('#cl-route-select')
      select.value = 'rv-1'
      select.dispatchEvent(new Event('change'))

      const checkboxes = container.querySelectorAll('.cl-indicator-checkbox')
      expect(checkboxes.length).toBe(3) // 3 indicators across 2 nodes
    })

    it('selects all button checks all checkboxes', async () => {
      const { renderCurriculumLinkerPanel } = await import('../components/curriculumLinkerPanel.js')

      renderCurriculumLinkerPanel(container, {
        claseId: 'clase-1',
        rutas: mockRutas,
      })

      // Select route
      const select = container.querySelector('#cl-route-select')
      select.value = 'rv-1'
      select.dispatchEvent(new Event('change'))

      // Click select all
      const selectAllBtn = container.querySelector('#cl-select-all')
      expect(selectAllBtn).toBeTruthy()
      selectAllBtn.click()

      const checkboxes = container.querySelectorAll('.cl-indicator-checkbox')
      const allChecked = Array.from(checkboxes).every((cb) => cb.checked)
      expect(allChecked).toBe(true)
    })

    it('dispatches objetivos:linked when save is clicked', async () => {
      const svc = await import('../services/claseObjetivosService.js')
      svc.agregarObjetivos.mockResolvedValue([])

      const { renderCurriculumLinkerPanel } = await import('../components/curriculumLinkerPanel.js')

      const onLinked = vi.fn()
      renderCurriculumLinkerPanel(container, {
        claseId: 'clase-1',
        rutas: mockRutas,
        planificacionId: 'plan-1',
        classCurriculumPlanId: 'ccp-1',
        onLinked,
      })

      // Select route
      const select = container.querySelector('#cl-route-select')
      select.value = 'rv-1'
      select.dispatchEvent(new Event('change'))

      // Select all
      container.querySelector('#cl-select-all').click()

      // Click save
      const saveBtn = container.querySelector('.cl-save-btn')
      expect(saveBtn).toBeTruthy()
      saveBtn.click()

      await new Promise((r) => setTimeout(r, 100))

      expect(svc.agregarObjetivos).toHaveBeenCalled()
      expect(onLinked).toHaveBeenCalled()
    })

    it('shows count of selected indicators', async () => {
      const { renderCurriculumLinkerPanel } = await import('../components/curriculumLinkerPanel.js')

      renderCurriculumLinkerPanel(container, {
        claseId: 'clase-1',
        rutas: mockRutas,
      })

      // Select route
      const select = container.querySelector('#cl-route-select')
      select.value = 'rv-1'
      select.dispatchEvent(new Event('change'))

      // Select some checkboxes manually
      const checkboxes = container.querySelectorAll('.cl-indicator-checkbox')
      checkboxes[0].click()
      checkboxes[1].click()

      const countEl = container.querySelector('.cl-selected-count')
      expect(countEl).toBeTruthy()
      expect(countEl.textContent).toContain('2')
    })
  })
})
