// src/modules/asistencias/api/__tests__/asistenciasApi.test.js
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { registrarAsistenciaBulk } from '../asistenciasApi.js'
import { getSesionesPorRango } from '../asistenciasSupabase.js'
import { supabase } from '../../../../lib/supabaseClient.js'

vi.mock('../../../../lib/supabaseClient.js', () => ({
  supabase: {
    from: vi.fn(),
    rpc: vi.fn()
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

// ─── FASE 2: regresión del bug real reportado por el usuario ───────────────
// Caso: Concierto Institucional 10-sep-2026 — sesión auto-justificada vía
// emergente_id, cero filas en `asistencias`, el sistema la marcaba como
// "sesión sin asistencia". Estos tests ejercitan la función REAL
// getSesionesPorRango() (no un mock de su propio resultado) mockeando la
// cadena de supabase.from(...).select(...).order(...) para devolver filas
// crudas, tal como llegarían de Postgres.

function makeSupabaseChain(rows) {
  const chain = { data: rows, error: null }
  chain.select = vi.fn(() => chain)
  chain.order = vi.fn(() => chain)
  chain.gte = vi.fn(() => chain)
  chain.lte = vi.fn(() => chain)
  chain.eq = vi.fn(() => chain)
  return chain
}

describe('getSesionesPorRango - Emergente ID Classification (Fase 2)', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('sesión con emergente_id y 0 asistencias NO se marca sin_asistencias (bug real)', async () => {
    const rows = [
      {
        id: 'ses-1',
        fecha: '2026-09-10',
        hora_inicio: '18:00',
        hora_fin: '20:00',
        tema_principal: null,
        observaciones_generales: null,
        estado: 'registrada',
        clase_id: 'clase-1',
        emergente_id: 'emergente-raiz-1',
        clases: {
          id: 'clase-1',
          nombre: 'Orquesta',
          instrumento: 'Orquesta',
          maestro_principal_id: 'm1',
          maestros: { id: 'm1', nombre_completo: 'Omar' },
        },
        asistencias: [],
        confirmaciones_emergentes: [],
      },
    ]
    supabase.from.mockReturnValue(makeSupabaseChain(rows))

    const result = await getSesionesPorRango({
      fechaInicio: '2026-09-10',
      fechaFin: '2026-09-10',
    })
    const sesion = result[0].sesiones[0]

    expect(sesion.totalRegistros).toBe(0)
    expect(sesion.emergente_id).toBe('emergente-raiz-1')
    expect(sesion.es_justificada_por_emergente).toBe(true)
    expect(sesion.estado_clasificacion).not.toBe('sin_asistencias_registradas')
    expect(sesion.estado_clasificacion).toBe('pendiente_confirmacion_actividad')
  })

  it('sesión sin emergente_id y 0 asistencias SÍ se marca sin_asistencias (caso normal intacto)', async () => {
    const rows = [
      {
        id: 'ses-2',
        fecha: '2026-09-11',
        hora_inicio: '10:00',
        hora_fin: '11:00',
        tema_principal: null,
        observaciones_generales: null,
        estado: 'pendiente',
        clase_id: 'clase-2',
        emergente_id: null,
        clases: {
          id: 'clase-2',
          nombre: 'Piano',
          instrumento: 'Piano',
          maestro_principal_id: 'm2',
          maestros: { id: 'm2', nombre_completo: 'Ana' },
        },
        asistencias: [],
        confirmaciones_emergentes: [],
      },
    ]
    supabase.from.mockReturnValue(makeSupabaseChain(rows))

    const result = await getSesionesPorRango({
      fechaInicio: '2026-09-11',
      fechaFin: '2026-09-11',
    })
    const sesion = result[0].sesiones[0]

    expect(sesion.es_justificada_por_emergente).toBe(false)
    expect(sesion.estado_clasificacion).toBe('sin_asistencias_registradas')
  })

  it('confirmación "sí" del maestro clasifica la sesión como justificada', async () => {
    const rows = [
      {
        id: 'ses-3',
        fecha: '2026-09-10',
        hora_inicio: '16:00',
        hora_fin: '17:00',
        estado: 'registrada',
        clase_id: 'clase-3',
        emergente_id: 'emergente-raiz-1',
        clases: {
          id: 'clase-3',
          nombre: 'Guitarra',
          instrumento: 'Guitarra',
          maestro_principal_id: 'm3',
          maestros: { id: 'm3', nombre_completo: 'Braylin' },
        },
        asistencias: [],
        confirmaciones_emergentes: [{ id: 'conf-1', respuesta: 'si', estado_validacion: 'validado' }],
      },
    ]
    supabase.from.mockReturnValue(makeSupabaseChain(rows))

    const result = await getSesionesPorRango({
      fechaInicio: '2026-09-10',
      fechaFin: '2026-09-10',
    })
    expect(result[0].sesiones[0].estado_clasificacion).toBe('justificada_por_actividad_institucional')
  })

  it('confirmación "no_aplica" clasifica la sesión como actividad_no_aplicable', async () => {
    const rows = [
      {
        id: 'ses-4',
        fecha: '2026-09-10',
        hora_inicio: '09:00',
        hora_fin: '10:00',
        estado: 'registrada',
        clase_id: 'clase-4',
        emergente_id: 'emergente-raiz-1',
        clases: {
          id: 'clase-4',
          nombre: 'Violín',
          instrumento: 'Violín',
          maestro_principal_id: 'm4',
          maestros: { id: 'm4', nombre_completo: 'Isabella' },
        },
        asistencias: [],
        confirmaciones_emergentes: [{ id: 'conf-2', respuesta: 'no_aplica', estado_validacion: 'validado' }],
      },
    ]
    supabase.from.mockReturnValue(makeSupabaseChain(rows))

    const result = await getSesionesPorRango({
      fechaInicio: '2026-09-10',
      fechaFin: '2026-09-10',
    })
    expect(result[0].sesiones[0].estado_clasificacion).toBe('actividad_no_aplicable')
  })
})
