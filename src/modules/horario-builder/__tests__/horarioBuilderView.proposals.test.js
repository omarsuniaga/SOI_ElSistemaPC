import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest'

vi.mock('../api/horarioBuilderApi.js', () => ({
  fetchSchedulingData: vi.fn(),
  saveScheduleRun: vi.fn(),
  getScheduleRuns: vi.fn().mockResolvedValue([]),
}))

vi.mock('../api/scheduleFeedbackApi.js', () => ({
  getCurrentUserIsAdmin: vi.fn().mockResolvedValue(false),
  getRunFeedback: vi.fn().mockResolvedValue([]),
  addFeedback: vi.fn(),
  updateScheduleRunEstado: vi.fn(),
}))

const { mockGenerateMultipleProposals } = vi.hoisted(() => ({
  mockGenerateMultipleProposals: vi.fn(),
}))
vi.mock('../domain/multiProposalGenerator.js', () => ({
  generateMultipleProposals: mockGenerateMultipleProposals,
}))

import { fetchSchedulingData } from '../api/horarioBuilderApi.js'
import { init } from '../views/horarioBuilderView.js'

const MOCK_ASSIGNMENT = {
  clase_id: 'c1',
  clase_nombre: 'Violín',
  instrumento: 'Violín',
  maestro_id: 'm1',
  maestro_nombre: 'Prof. García',
  salon_id: 's1',
  salon_nombre: 'Sala A',
  dia: 'lunes',
  hora_inicio: '10:00',
  hora_fin: '11:00',
  duracion: 60,
  locked: false,
  hasConflict: false,
  color: 'hsl(120,70%,88%)',
}

const MOCK_PROPOSALS = [
  {
    id: 1,
    assignments: [MOCK_ASSIGNMENT],
    noAsignadas: [],
    metricas: { totalClases: 1, clasesAsignadas: 1, score: 100 },
    fingerprint: 'fp1',
    _duplicate: false,
  },
  {
    id: 2,
    assignments: [],
    noAsignadas: [],
    metricas: { totalClases: 1, clasesAsignadas: 0, score: 0 },
    fingerprint: 'fp2',
    _duplicate: false,
  },
  {
    id: 3,
    assignments: [],
    noAsignadas: [],
    metricas: { totalClases: 1, clasesAsignadas: 0, score: 0 },
    fingerprint: 'fp1',
    _duplicate: true,
  },
]

const MOCK_DATA = {
  clases: [{ id: 'c1', nombre: 'Violín', maestro_principal_id: 'm1', total_alumnos: 5 }],
  maestros: [{ id: 'm1', nombre: 'Prof. García', disponibilidad: {} }],
  salones: [{ id: 's1', nombre: 'Sala A', capacidad: 15, is_active: true }],
}

function flushAsync() {
  return new Promise((r) => setTimeout(r, 0))
}

// ─── F4D — Export buttons render ─────────────────────────────────────────────

describe('F4D — export buttons in toolbar', () => {
  let container

  beforeEach(() => {
    container = document.createElement('div')
    document.body.appendChild(container)
    init(container)
  })

  afterEach(() => {
    document.body.removeChild(container)
    vi.clearAllMocks()
  })

  it('renders #btn-export-excel in toolbar', () => {
    expect(container.querySelector('#btn-export-excel')).not.toBeNull()
  })

  it('renders #btn-export-pdf in toolbar', () => {
    expect(container.querySelector('#btn-export-pdf')).not.toBeNull()
  })

  it('export buttons are disabled before generate', () => {
    expect(container.querySelector('#btn-export-excel').disabled).toBe(true)
    expect(container.querySelector('#btn-export-pdf').disabled).toBe(true)
  })
})

// ─── F4B + F4C — Proposal tabs after generate ────────────────────────────────

describe('F4B + F4C — proposal tabs after generate', () => {
  let container

  beforeEach(() => {
    container = document.createElement('div')
    document.body.appendChild(container)
    fetchSchedulingData.mockResolvedValue(MOCK_DATA)
    mockGenerateMultipleProposals.mockReturnValue(MOCK_PROPOSALS)
    init(container)
  })

  afterEach(() => {
    document.body.removeChild(container)
    vi.clearAllMocks()
  })

  it('renders 3 proposal tabs after generate', async () => {
    container.querySelector('#hb-generate-btn').click()
    await flushAsync()
    const tabs = container.querySelectorAll('.hb-proposal-tab')
    expect(tabs).toHaveLength(3)
  })

  it('first tab is active after generate', async () => {
    container.querySelector('#hb-generate-btn').click()
    await flushAsync()
    const tabs = container.querySelectorAll('.hb-proposal-tab')
    expect(tabs[0].classList.contains('hb-proposal-tab--active')).toBe(true)
  })

  it('changes active proposal on tab 2 click', async () => {
    container.querySelector('#hb-generate-btn').click()
    await flushAsync()
    const tabs = container.querySelectorAll('.hb-proposal-tab')
    tabs[1].click()
    const updatedTabs = container.querySelectorAll('.hb-proposal-tab')
    expect(updatedTabs[1].classList.contains('hb-proposal-tab--active')).toBe(true)
    expect(updatedTabs[0].classList.contains('hb-proposal-tab--active')).toBe(false)
  })

  it('active tab badge shows % assigned and conflict count', async () => {
    container.querySelector('#hb-generate-btn').click()
    await flushAsync()
    const wrapper = container.querySelector('#hb-proposal-tabs-wrapper')
    expect(wrapper.textContent).toMatch(/\d+%/)
    expect(wrapper.textContent).toMatch(/\d+ conflicto/)
  })

  it('duplicate proposal tab has --duplicate modifier class', async () => {
    container.querySelector('#hb-generate-btn').click()
    await flushAsync()
    const dupTab = container.querySelector('.hb-proposal-tab--duplicate')
    expect(dupTab).not.toBeNull()
  })

  it('calls generateMultipleProposals, not generateOptimizedSchedule (F4C)', async () => {
    container.querySelector('#hb-generate-btn').click()
    await flushAsync()
    expect(mockGenerateMultipleProposals).toHaveBeenCalledOnce()
  })

  it('export buttons are enabled after successful generate', async () => {
    container.querySelector('#hb-generate-btn').click()
    await flushAsync()
    expect(container.querySelector('#btn-export-excel').disabled).toBe(false)
    expect(container.querySelector('#btn-export-pdf').disabled).toBe(false)
  })
})
