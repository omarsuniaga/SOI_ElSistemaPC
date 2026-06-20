import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('../../../lib/supabaseClient.js', () => ({
  supabase: { from: vi.fn() },
}))

import { supabase } from '../../../lib/supabaseClient.js'
import { autoJustificarClasesProgramadas } from '../emergenteJustificacionService.js'

/**
 * Crea una cadena de Supabase donde eq() devuelve `this` las primeras N-1 veces
 * y resuelve la promesa en la llamada N. Evita el problema de claves duplicadas
 * en objetos literales cuando hay múltiples .eq() en cadena.
 */
function makeChain({ data = null, error = null, resolveOnEqCall = 1 } = {}) {
  let eqCalls = 0
  const chain = {
    select: vi.fn().mockReturnThis(),
    in: vi.fn().mockReturnThis(),
    or: vi.fn().mockResolvedValue({ data, error }),
    eq: vi.fn().mockImplementation(() => {
      eqCalls++
      return eqCalls >= resolveOnEqCall
        ? Promise.resolve({ data, error })
        : chain
    }),
  }
  return chain
}

const MAESTRO_ID = 'maestro-uuid'
const EMERGENTE = {
  id: 'emergente-uuid',
  fecha: '2026-05-29', // jueves
  actividad: 'Concierto Institucional',
  motivo: 'Concierto',
}

describe('autoJustificarClasesProgramadas', () => {
  beforeEach(() => vi.clearAllMocks())

  it('retorna { justificadas:0, errores:[] } si el maestro no tiene clases', async () => {
    supabase.from.mockImplementation(() => makeChain({ data: [] }))

    const result = await autoJustificarClasesProgramadas(EMERGENTE, MAESTRO_ID)

    expect(result).toEqual({ justificadas: 0, errores: [] })
  })

  it('retorna { justificadas:0, errores:[] } si no hay horarios para ese día de la semana', async () => {
    supabase.from.mockImplementation((table) => {
      if (table === 'clases')
        return makeChain({ data: [{ id: 'clase-1', nombre: 'Guitarra' }] })
      // clase_horarios devuelve vacío → no hay horario ese día
      return makeChain({ data: [] })
    })

    const result = await autoJustificarClasesProgramadas(EMERGENTE, MAESTRO_ID)

    expect(result).toEqual({ justificadas: 0, errores: [] })
  })

  it('crea una sesión justificada por cada clase programada ese día', async () => {
    const upsertMock = vi.fn().mockResolvedValue({ error: null })

    supabase.from.mockImplementation((table) => {
      if (table === 'clases')
        return makeChain({ data: [{ id: 'clase-1', nombre: 'Guitarra' }, { id: 'clase-2', nombre: 'Piano' }] })
      if (table === 'clase_horarios')
        return makeChain({
          data: [
            { clase_id: 'clase-1', hora_inicio: '16:00', hora_fin: '17:00' },
            { clase_id: 'clase-2', hora_inicio: '17:00', hora_fin: '18:00' },
          ],
        })
      if (table === 'alumnos_clases')
        // Cadena con 2 .eq() antes de resolver
        return makeChain({ data: [{ alumno_id: 'alumno-1' }], resolveOnEqCall: 2 })
      if (table === 'sesiones_clase')
        return { upsert: upsertMock }
    })

    const result = await autoJustificarClasesProgramadas(EMERGENTE, MAESTRO_ID)

    expect(result.justificadas).toBe(2)
    expect(result.errores).toHaveLength(0)
    expect(upsertMock).toHaveBeenCalledTimes(2)
  })

  it('el payload del upsert incluye los campos correctos', async () => {
    const upsertMock = vi.fn().mockResolvedValue({ error: null })

    supabase.from.mockImplementation((table) => {
      if (table === 'clases')
        return makeChain({ data: [{ id: 'clase-1', nombre: 'Guitarra' }] })
      if (table === 'clase_horarios')
        return makeChain({ data: [{ clase_id: 'clase-1', hora_inicio: '16:00', hora_fin: '17:00' }] })
      if (table === 'alumnos_clases')
        return makeChain({ data: [{ alumno_id: 'alumno-1' }], resolveOnEqCall: 2 })
      if (table === 'sesiones_clase')
        return { upsert: upsertMock }
    })

    await autoJustificarClasesProgramadas(EMERGENTE, MAESTRO_ID)

    const [payload, opts] = upsertMock.mock.calls[0]
    expect(payload.emergente_id).toBe('emergente-uuid')
    expect(payload.estado).toBe('registrada')
    expect(payload.borrador).toBe(false)
    expect(payload.asistencia).toEqual([{ alumno_id: 'alumno-1', estado: 'justificado' }])
    expect(payload.contenido).toContain('Concierto Institucional')
    expect(payload.contenido).toContain('Concierto')
    expect(opts.onConflict).toBe('clase_id,fecha,maestro_id')
  })

  it('continúa procesando las demás clases si una falla (error parcial)', async () => {
    let upsertCalls = 0
    const upsertMock = vi.fn().mockImplementation(() => {
      upsertCalls++
      // Primera clase → error, segunda → OK
      return Promise.resolve(upsertCalls === 1 ? { error: { message: 'DB error' } } : { error: null })
    })

    supabase.from.mockImplementation((table) => {
      if (table === 'clases')
        return makeChain({ data: [{ id: 'clase-1', nombre: 'Guitarra I' }, { id: 'clase-2', nombre: 'Piano' }] })
      if (table === 'clase_horarios')
        return makeChain({
          data: [
            { clase_id: 'clase-1', hora_inicio: '16:00', hora_fin: '17:00' },
            { clase_id: 'clase-2', hora_inicio: '17:00', hora_fin: '18:00' },
          ],
        })
      if (table === 'alumnos_clases')
        return makeChain({ data: [], resolveOnEqCall: 2 })
      if (table === 'sesiones_clase')
        return { upsert: upsertMock }
    })

    const result = await autoJustificarClasesProgramadas(EMERGENTE, MAESTRO_ID)

    expect(result.justificadas).toBe(1)
    expect(result.errores).toHaveLength(1)
    expect(result.errores[0]).toContain('Guitarra I')
  })

  it('el upsert usa onConflict correcto para idempotencia', async () => {
    const upsertMock = vi.fn().mockResolvedValue({ error: null })

    supabase.from.mockImplementation((table) => {
      if (table === 'clases')
        return makeChain({ data: [{ id: 'clase-1', nombre: 'Guitarra' }] })
      if (table === 'clase_horarios')
        return makeChain({ data: [{ clase_id: 'clase-1', hora_inicio: '16:00', hora_fin: '17:00' }] })
      if (table === 'alumnos_clases')
        return makeChain({ data: [], resolveOnEqCall: 2 })
      if (table === 'sesiones_clase')
        return { upsert: upsertMock }
    })

    await autoJustificarClasesProgramadas(EMERGENTE, MAESTRO_ID)

    const [, opts] = upsertMock.mock.calls[0]
    expect(opts.onConflict).toBe('clase_id,fecha,maestro_id')
  })
})
