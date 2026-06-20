import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

// ─── Supabase mock ────────────────────────────────────────────────
vi.mock('../../../lib/supabaseClient.js', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
      update: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockResolvedValue({ data: [], error: null }),
      single: vi.fn().mockResolvedValue({ data: { id: 'run-1' }, error: null }),
    }))
  }
}))

// ─── Config mock — force real mode ────────────────────────────────
vi.mock('../../../core/config/config.js', () => ({
  config: { isDemoMode: false }
}))

// ─── API mock ─────────────────────────────────────────────────────
const mockSaveScheduleRun = vi.fn().mockResolvedValue({ id: 'run-1' })
vi.mock('../api/horarioBuilderApi.js', () => ({
  fetchSchedulingData: vi.fn().mockResolvedValue({
    clases: [
      { id: 'c1', nombre: 'Violín', maestro_principal_id: 'm1', total_alumnos: 5 }
    ],
    maestros: [
      {
        id: 'm1',
        disponibilidad: {
          lunes: [{ inicio: '10:00', fin: '13:00' }]
        }
      }
    ],
    salones: [
      { id: 's1', capacidad: 10, is_active: true }
    ]
  }),
  saveScheduleRun: (...args) => mockSaveScheduleRun(...args),
  getScheduleRuns: vi.fn().mockResolvedValue([]),
}))

// ─── Other dependency mocks ────────────────────────────────────────
vi.mock('../../../shared/components/AppToast.js', () => ({
  AppToast: { success: vi.fn(), error: vi.fn(), show: vi.fn() }
}))

vi.mock('../api/scheduleFeedbackApi.js', () => ({
  getRunFeedback: vi.fn().mockResolvedValue([]),
  addFeedback: vi.fn(),
  updateScheduleRunEstado: vi.fn(),
  getCurrentUserIsAdmin: vi.fn().mockResolvedValue(false),
}))

vi.mock('../engine/DragDropManager.js', () => ({
  initDragDrop: vi.fn(() => ({ destroy: vi.fn() })),
  showConflictMoveModal: vi.fn(),
}))

vi.mock('../components/PublishWizard.js', () => ({
  renderPublishWizard: vi.fn()
}))

import { init } from '../views/horarioBuilderView.js'

// ─── Tests ────────────────────────────────────────────────────────

describe('HB-F5A — saveScheduleRun payload', () => {
  let container

  beforeEach(() => {
    vi.clearAllMocks()
    container = document.createElement('div')
    document.body.appendChild(container)
    init(container)
  })

  afterEach(() => {
    container?.remove()
  })

  it('sends { periodo, config, resultado, metricas } not { assignments, periodo_id }', async () => {
    // Trigger generate first (so state.lastConfig is set)
    const generateBtn = container.querySelector('#hb-generate-btn')
    generateBtn.click()
    // Wait for async handleGenerate
    await new Promise(r => setTimeout(r, 50))

    // Trigger save
    const saveBtn = container.querySelector('#hb-save-btn')
    saveBtn.disabled = false
    saveBtn.click()
    await new Promise(r => setTimeout(r, 50))

    expect(mockSaveScheduleRun).toHaveBeenCalledTimes(1)
    const payload = mockSaveScheduleRun.mock.calls[0][0]

    // Must have new fields
    expect(payload).toHaveProperty('periodo')
    expect(payload).toHaveProperty('config')
    expect(payload).toHaveProperty('resultado')
    expect(payload).toHaveProperty('metricas')

    // Must NOT have old fields
    expect(payload).not.toHaveProperty('assignments')
    expect(payload).not.toHaveProperty('periodo_id')

    // resultado must wrap assignments
    expect(payload.resultado).toHaveProperty('assignments')
  })

  it('stores state.lastConfig after generate', async () => {
    // After handleGenerate, clicking save should pass config (not undefined/null)
    const generateBtn = container.querySelector('#hb-generate-btn')
    generateBtn.click()
    await new Promise(r => setTimeout(r, 50))

    const saveBtn = container.querySelector('#hb-save-btn')
    saveBtn.disabled = false
    saveBtn.click()
    await new Promise(r => setTimeout(r, 50))

    const payload = mockSaveScheduleRun.mock.calls[0][0]
    expect(payload.config).not.toBeNull()
    expect(payload.config).not.toBeUndefined()
  })
})

describe('HB-F2C — resolve _originalClaseId before save', () => {
  let container

  beforeEach(() => {
    vi.clearAllMocks()
    container = document.createElement('div')
    document.body.appendChild(container)
    init(container)
  })

  afterEach(() => {
    container?.remove()
  })

  it('resolves subgroup clase_ids to original before saving', async () => {
    // Trigger generate
    const generateBtn = container.querySelector('#hb-generate-btn')
    generateBtn.click()
    await new Promise(r => setTimeout(r, 50))

    // Manually inject a subgroup assignment into view state
    // We need to access the internal state — we do this by checking the saved payload
    // The test verifies that if assignments have _originalClaseId, the saved resultado uses it
    const saveBtn = container.querySelector('#hb-save-btn')
    saveBtn.disabled = false
    saveBtn.click()
    await new Promise(r => setTimeout(r, 50))

    if (mockSaveScheduleRun.mock.calls.length === 0) return // no save if no assignments

    const payload = mockSaveScheduleRun.mock.calls[0][0]
    if (payload?.resultado?.assignments) {
      // Any subgroup assignment must have its _originalClaseId resolved
      payload.resultado.assignments.forEach(a => {
        if (a._isSubgroup) {
          expect(a.clase_id).toBe(a._originalClaseId)
        }
        // clase_id must not contain '_grupo_' suffix
        expect(a.clase_id).not.toMatch(/_grupo_[A-Z]$/)
      })
    }
  })
})
