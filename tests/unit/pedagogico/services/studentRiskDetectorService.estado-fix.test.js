/**
 * T0.1: Unit tests for studentRiskDetectorService estado filter bug fix
 * Tests that detectAttendanceRisk counts only estado='ausente' (not 'A', 'P', 'J', 'T')
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock getActiveRuleByTipo
const mockGetActiveRuleByTipo = vi.fn()
vi.mock('../../../../src/modules/pedagogico/services/seguimientoRulesService.js', () => ({
  getActiveRuleByTipo: (...args) => mockGetActiveRuleByTipo(...args),
}))

// Define mock functions OUTSIDE vi.mock
const mockSelect = vi.fn()
const mockEq = vi.fn()
const mockGte = vi.fn()
const mockLte = vi.fn()
const mockFrom = vi.fn()

vi.mock('../../../../src/lib/supabaseClient.js', () => ({
  supabase: {
    from: (...args) => mockFrom(...args),
  },
}))

import { detectAttendanceRisk } from '../../../../src/modules/pedagogico/services/studentRiskDetectorService.js'

describe('studentRiskDetectorService.estado-fix', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Setup mock chain: from().select().eq().gte().lte()
    mockLte.mockResolvedValue({ data: [], error: null })
    mockGte.mockReturnValue({ lte: mockLte })
    mockEq.mockReturnValue({ gte: mockGte })
    mockSelect.mockReturnValue({ eq: mockEq })
    mockFrom.mockReturnValue({ select: mockSelect })
  })

  it('should count rows with estado=ausente correctly', async () => {
    const alumnoId = 'test-alumno-1'
    const rule = {
      config: { contar_justificadas: false },
    }

    mockGetActiveRuleByTipo.mockResolvedValue(rule)

    // Setup the return value for this test
    mockLte.mockResolvedValueOnce({
      data: [
        { estado: 'ausente', fecha: '2026-09-01' },
        { estado: 'ausente', fecha: '2026-09-02' },
        { estado: 'ausente', fecha: '2026-09-03' },
      ],
      error: null,
    })

    const result = await detectAttendanceRisk(alumnoId)

    expect(result.count).toBe(3)
    expect(result.tipo).toBe('asistencia_irregular')
  })

  it('should NOT count rows with estado=presente', async () => {
    const alumnoId = 'test-alumno-2'
    const rule = { config: { contar_justificadas: false } }

    mockGetActiveRuleByTipo.mockResolvedValue(rule)
    mockLte.mockResolvedValueOnce({
      data: [
        { estado: 'presente', fecha: '2026-09-01' },
        { estado: 'presente', fecha: '2026-09-02' },
      ],
      error: null,
    })

    const result = await detectAttendanceRisk(alumnoId)

    // Should be 0 because no ausentes
    expect(result.count).toBe(0)
    expect(result.razon).toBeNull()
  })

  it('should NOT count rows with estado=justificado when contar_justificadas=false', async () => {
    const alumnoId = 'test-alumno-3'
    const rule = { config: { contar_justificadas: false } }

    mockGetActiveRuleByTipo.mockResolvedValue(rule)
    mockLte.mockResolvedValueOnce({
      data: [
        { estado: 'justificado', fecha: '2026-09-01' },
        { estado: 'justificado', fecha: '2026-09-02' },
      ],
      error: null,
    })

    const result = await detectAttendanceRisk(alumnoId)

    // Should be 0 when contar_justificadas=false
    expect(result.count).toBe(0)
  })

  it('should count mixed rows: ausente+presente, filtering only ausente', async () => {
    const alumnoId = 'test-alumno-4'
    const rule = { config: { contar_justificadas: false } }

    mockGetActiveRuleByTipo.mockResolvedValue(rule)
    mockLte.mockResolvedValueOnce({
      data: [
        { estado: 'ausente', fecha: '2026-09-01' },
        { estado: 'presente', fecha: '2026-09-02' },
        { estado: 'ausente', fecha: '2026-09-03' },
        { estado: 'justificado', fecha: '2026-09-04' },
      ],
      error: null,
    })

    const result = await detectAttendanceRisk(alumnoId)

    // Should count only 2 (the ausentes)
    expect(result.count).toBe(2)
  })

  it('should NOT count legacy estado=A (old bug)', async () => {
    const alumnoId = 'test-alumno-5'
    const rule = { config: { contar_justificadas: false } }

    mockGetActiveRuleByTipo.mockResolvedValue(rule)
    mockLte.mockResolvedValueOnce({
      data: [
        { estado: 'A', fecha: '2026-09-01' },  // legacy code - should NOT count after fix
        { estado: 'ausente', fecha: '2026-09-02' },  // correct code - should count
      ],
      error: null,
    })

    const result = await detectAttendanceRisk(alumnoId)

    // After the fix: should count only 1 (the 'ausente'), not the legacy 'A'
    expect(result.count).toBe(1)
  })

  it('should return 0 count when all data is empty', async () => {
    const alumnoId = 'test-alumno-6'
    const rule = { config: { contar_justificadas: false } }

    mockGetActiveRuleByTipo.mockResolvedValue(rule)
    mockLte.mockResolvedValueOnce({
      data: [],
      error: null,
    })

    const result = await detectAttendanceRisk(alumnoId)

    expect(result.count).toBe(0)
    expect(result.razon).toBeNull()
  })
})
