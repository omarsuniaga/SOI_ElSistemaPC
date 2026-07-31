// src/modules/asistencias/api/__tests__/asistenciasApi.test.js
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { registrarAsistenciaBulk, obtenerAsistenciaDelDia } from '../asistenciasApi.js'
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

// ── Tarea 3.2 (mapa-gamificado-planificacion): gate de asistencia para Modo Sesión (REQ-03) ──
describe('obtenerAsistenciaDelDia — gate REQ-03 (Modo Sesión exige asistencia ya tomada)', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns tomada=false and presentes=[] when there is no attendance recorded for that clase+fecha', async () => {
    const eqFecha = vi.fn().mockResolvedValue({ data: [], error: null })
    const eqClase = vi.fn().mockReturnValue({ eq: eqFecha })
    const selectMock = vi.fn().mockReturnValue({ eq: eqClase })
    supabase.from.mockReturnValue({ select: selectMock })

    const result = await obtenerAsistenciaDelDia({ claseId: 'clase-1', fecha: '2026-07-30' })

    expect(result).toEqual({ tomada: false, presentes: [] })
    expect(supabase.from).toHaveBeenCalledWith('asistencias')
  })

  it('returns tomada=true and only the PRESENTE students when attendance was taken (REQ-03, REQ-05 roster)', async () => {
    const rows = [
      { id: 'a1', estado: 'presente', alumno_id: 'al-1', alumnos: { id: 'al-1', nombre_completo: 'Ana Pérez' } },
      { id: 'a2', estado: 'ausente', alumno_id: 'al-2', alumnos: { id: 'al-2', nombre_completo: 'Luis Gómez' } },
      { id: 'a3', estado: 'justificado', alumno_id: 'al-3', alumnos: { id: 'al-3', nombre_completo: 'Pedro Ruiz' } },
    ]
    const eqFecha = vi.fn().mockResolvedValue({ data: rows, error: null })
    const eqClase = vi.fn().mockReturnValue({ eq: eqFecha })
    const selectMock = vi.fn().mockReturnValue({ eq: eqClase })
    supabase.from.mockReturnValue({ select: selectMock })

    const result = await obtenerAsistenciaDelDia({ claseId: 'clase-1', fecha: '2026-07-30' })

    expect(result.tomada).toBe(true)
    expect(result.presentes).toEqual([{ id: 'al-1', nombre: 'Ana Pérez' }])
  })

  it('returns tomada=false without querying Supabase when claseId or fecha is missing', async () => {
    const result = await obtenerAsistenciaDelDia({ claseId: null, fecha: '2026-07-30' })
    expect(result).toEqual({ tomada: false, presentes: [] })
    expect(supabase.from).not.toHaveBeenCalled()
  })
})
