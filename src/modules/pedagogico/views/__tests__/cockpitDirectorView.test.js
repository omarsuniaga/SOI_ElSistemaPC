import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderCockpitDirectorView } from '../cockpitDirectorView.js'

// ─── Module mocks ────────────────────────────────────────────────────────────

vi.mock('../../../../lib/supabaseClient.js', () => ({
  supabase: { from: vi.fn() },
}))

const mockRouter = vi.hoisted(() => ({ navigate: vi.fn() }))
vi.mock('../../../../core/router/router.js', () => ({
  router: mockRouter,
}))

vi.mock('../../../shared/components/AppModal.js', () => ({
  AppModal: { open: vi.fn() },
}))

vi.mock('../../services/studentRiskDetectorService.js', () => ({
  analyzeAllStudentsRisk: vi.fn(),
}))

vi.mock('../../services/studentCasesService.js', () => ({
  createStudentCase: vi.fn(),
}))

// ─── Helpers ─────────────────────────────────────────────────────────────────

import { supabase } from '../../../../lib/supabaseClient.js'
import { analyzeAllStudentsRisk } from '../../services/studentRiskDetectorService.js'

function mockChain(data) {
  const chain = {
    select: vi.fn(() => chain),
    eq: vi.fn(() => chain),
    neq: vi.fn(() => chain),
    order: vi.fn().mockResolvedValue(data),
    then: vi.fn((onFulfilled) => Promise.resolve(data).then(onFulfilled)),
  }
  return chain
}

const EMPTY_COUNT = { count: 0, data: null, error: null }
const EMPTY_DATA = { data: [], error: null }

// ─── Tests ───────────────────────────────────────────────────────────────────

describe('cockpitDirectorView', () => {
  let container

  beforeEach(() => {
    container = document.createElement('div')
    container.id = 'test-container'
    document.body.appendChild(container)
    vi.clearAllMocks()
  })

  afterEach(() => {
    container?.remove()
  })

  it('renders skeleton on initial load', async () => {
    // Don't resolve supabase immediately, so skeleton stays
    supabase.from.mockReturnValue(new Promise(() => {}))
    renderCockpitDirectorView(container)
    expect(container.querySelector('.spinner-border')).toBeTruthy()
  })

  it('renders KPI cards with fetched data', async () => {
    supabase.from.mockImplementation((table) => {
      if (table === 'alumnos') return mockChain({ count: 42, data: [], error: null })
      if (table === 'perfil_conocimiento') {
        // First call: perfil count; second call: problemas count
        return mockChain({ count: 20, data: [], error: null })
      }
      if (table === 'student_case_alerts') return mockChain({ count: 5, data: null, error: null })
      return mockChain(EMPTY_COUNT)
    })
    analyzeAllStudentsRisk.mockResolvedValue([])

    await renderCockpitDirectorView(container)
    await new Promise((resolve) => setTimeout(resolve, 100))

    expect(container.textContent).toContain('42')
    expect(container.textContent).toContain('20')
    expect(container.textContent).toContain('0') // conProblemas (no data)
    expect(container.textContent).toContain('5')
    expect(container.textContent).toContain('Alumnos activos')
    expect(container.textContent).toContain('Con perfil')
    expect(container.textContent).toContain('Con problemas')
    expect(container.textContent).toContain('Casos pendientes')
  })

  it('renders empty table when no students have perfil data', async () => {
    supabase.from.mockReturnValue(mockChain(EMPTY_COUNT))
    analyzeAllStudentsRisk.mockResolvedValue([])

    await renderCockpitDirectorView(container)
    await new Promise((resolve) => setTimeout(resolve, 100))

    expect(container.textContent).toContain('No hay alumnos con datos')
  })

  it('renders table rows with student data from supabase', async () => {
    const alumnos = [
      {
        id: 'a1',
        nombre_completo: 'Ana García',
        instrumento_principal: 'Violín',
        nivel_actual: '3',
      },
      {
        id: 'a2',
        nombre_completo: 'Luis Pérez',
        instrumento_principal: 'Piano',
        nivel_actual: '2',
      },
    ]

    // Mock the order of supabase calls:
    let callCount = 0
    supabase.from.mockImplementation((table) => {
      callCount++
      if (table === 'alumnos') {
        // First alumnos call is for KPI count, second is for table data
        return mockChain({ count: 2, data: alumnos, error: null })
      }
      if (table === 'perfil_conocimiento') return mockChain({ count: 2, data: [], error: null })
      if (table === 'student_case_alerts') return mockChain({ count: 0, data: null, error: null })
      return mockChain(EMPTY_DATA)
    })
    analyzeAllStudentsRisk.mockResolvedValue([
      { alumnoId: 'a1', nivelRiesgo: 'bajo', score: 1, razones: ['1 problema confirmado'] },
      { alumnoId: 'a2', nivelRiesgo: 'alto', score: 3, razones: ['3 problemas confirmados'] },
    ])

    await renderCockpitDirectorView(container)
    await new Promise((resolve) => setTimeout(resolve, 100))

    expect(container.textContent).toContain('Ana García')
    expect(container.textContent).toContain('Luis Pérez')
    expect(container.textContent).toContain('Violín')
    expect(container.textContent).toContain('Piano')
  })

  it('renders error state when supabase throws', async () => {
    supabase.from.mockImplementation(() => {
      throw new Error('Network error')
    })

    await renderCockpitDirectorView(container)
    await new Promise((resolve) => setTimeout(resolve, 100))

    expect(container.textContent).toContain('Error al cargar el Cockpit')
    expect(container.textContent).toContain('Network error')
  })

  it('includes search input and filter dropdowns', async () => {
    supabase.from.mockReturnValue(mockChain(EMPTY_COUNT))
    analyzeAllStudentsRisk.mockResolvedValue([])

    await renderCockpitDirectorView(container)
    await new Promise((resolve) => setTimeout(resolve, 100))

    expect(container.querySelector('#cockpit-search')).toBeTruthy()
    expect(container.querySelector('#cockpit-filtro-riesgo')).toBeTruthy()
    expect(container.querySelector('#cockpit-filtro-problemas')).toBeTruthy()
    expect(container.querySelector('#cockpit-analizar')).toBeTruthy()
    expect(container.querySelector('#cockpit-analizar').textContent).toContain('Analizar')
  })

  it('shows Mostrando count at the bottom', async () => {
    supabase.from.mockImplementation((table) => {
      if (table === 'alumnos')
        return mockChain({
          count: 2,
          data: [
            {
              id: 'a1',
              nombre_completo: 'Ana García',
              instrumento_principal: 'Violín',
              nivel_actual: '3',
            },
          ],
          error: null,
        })
      if (table === 'perfil_conocimiento') return mockChain({ count: 1, data: [], error: null })
      if (table === 'student_case_alerts') return mockChain({ count: 0, data: null, error: null })
      return mockChain(EMPTY_DATA)
    })
    analyzeAllStudentsRisk.mockResolvedValue([])

    await renderCockpitDirectorView(container)
    await new Promise((resolve) => setTimeout(resolve, 100))

    expect(container.textContent).toMatch(/Mostrando\s+1\s+alumno/)
  })
})
