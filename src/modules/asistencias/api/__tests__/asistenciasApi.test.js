// src/modules/asistencias/api/__tests__/asistenciasApi.test.js
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { registrarAsistenciaBulk } from '../asistenciasApi.js'
import { supabase } from '../../../../lib/supabaseClient.js'

vi.mock('../../../../lib/supabaseClient.js', () => ({
  supabase: {
    from: vi.fn()
  }
}))

describe('registrarAsistenciaBulk - Student Validation', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should validate that all alumno_ids exist before attempting UPSERT', async () => {
    const asistencias = [
      { sesion_clase_id: '1', clase_id: 'c1', alumno_id: 'a1', fecha: '2026-05-20', estado: 'P' },
      { sesion_clase_id: '1', clase_id: 'c1', alumno_id: 'a999', fecha: '2026-05-20', estado: 'A' }
    ]

    const inMock = vi.fn().mockResolvedValueOnce({
      data: [{ id: 'a1' }],
      error: null
    })
    const selectMock = vi.fn().mockReturnValue({ in: inMock })

    supabase.from.mockReturnValue({ select: selectMock })

    await expect(registrarAsistenciaBulk(asistencias))
      .rejects
      .toThrow(/alumnos.*no existen|existe/i)
  })

  it('should succeed when all alumno_ids are valid', async () => {
    const asistencias = [
      { sesion_clase_id: '1', clase_id: 'c1', alumno_id: 'a1', fecha: '2026-05-20', estado: 'P' },
      { sesion_clase_id: '1', clase_id: 'c1', alumno_id: 'a2', fecha: '2026-05-20', estado: 'A' }
    ]

    const inMock = vi.fn().mockResolvedValueOnce({
      data: [{ id: 'a1' }, { id: 'a2' }],
      error: null
    })
    const selectMock = vi.fn().mockReturnValue({ in: inMock })

    const upsertSelectMock = vi.fn().mockResolvedValue({
      data: [
        { alumno_id: 'a1', estado: 'presente' },
        { alumno_id: 'a2', estado: 'ausente' }
      ],
      error: null
    })
    const upsertMock = vi.fn().mockReturnValue({ select: upsertSelectMock })

    supabase.from
      .mockReturnValueOnce({ select: selectMock })
      .mockReturnValueOnce({ upsert: upsertMock })

    const result = await registrarAsistenciaBulk(asistencias)

    expect(result).toHaveLength(2)
    expect(result[0].estado).toBe('presente')
  })
})

describe('registrarAsistenciaBulk - Constraint Error Detection', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should detect constraint error with various Supabase error formats', async () => {
    const asistencias = [
      { sesion_clase_id: '1', clase_id: 'c1', alumno_id: 'a1', fecha: '2026-05-20', estado: 'P' }
    ]

    const inMock = vi.fn().mockResolvedValue({ data: [{ id: 'a1' }], error: null })
    const selectMock = vi.fn().mockReturnValue({ in: inMock })

    const upsertSelectMock = vi.fn().mockResolvedValue({
      data: null,
      error: {
        message: 'duplicate key value violates unique constraint "uk_asistencias_clase_alumno_fecha"'
      }
    })
    const upsertMock = vi.fn().mockReturnValue({ select: upsertSelectMock })

    // INSERT fallback returns empty array successfully
    const insertSelectMock = vi.fn().mockResolvedValue({ data: [], error: null })
    const insertMock = vi.fn().mockReturnValue({ select: insertSelectMock })

    supabase.from
      .mockReturnValueOnce({ select: selectMock })
      .mockReturnValueOnce({ upsert: upsertMock })
      .mockReturnValueOnce({ insert: insertMock })

    const result = await registrarAsistenciaBulk(asistencias)
    expect(result).toBeDefined()
  })

  it('should throw error if constraint error is not related to unique constraint', async () => {
    const asistencias = [
      { sesion_clase_id: '1', clase_id: 'c1', alumno_id: 'a1', fecha: '2026-05-20', estado: 'P' }
    ]

    const inMock = vi.fn().mockResolvedValue({ data: [{ id: 'a1' }], error: null })
    const selectMock = vi.fn().mockReturnValue({ in: inMock })

    const upsertSelectMock = vi.fn().mockResolvedValue({
      data: null,
      error: { message: 'Invalid foreign key constraint' }
    })
    const upsertMock = vi.fn().mockReturnValue({ select: upsertSelectMock })

    supabase.from
      .mockReturnValueOnce({ select: selectMock })
      .mockReturnValueOnce({ upsert: upsertMock })

    await expect(registrarAsistenciaBulk(asistencias))
      .rejects
      .toThrow(/registrar las asistencias/i)
  })
})
