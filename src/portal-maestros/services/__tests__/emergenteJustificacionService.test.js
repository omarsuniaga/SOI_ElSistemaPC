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
function makeChain({ data = null, error = null, resolveOnEqCall = 1, inResolves = false } = {}) {
  let eqCalls = 0
  const chain = {
    select: vi.fn().mockReturnThis(),
    // clase_horarios ya no filtra por `dia` en el servidor (bug de tildes:
    // ver normalizeDia en el archivo fuente) — .in() es ahora la llamada
    // terminal para esa query, por eso resuelve directo cuando inResolves=true.
    in: inResolves ? vi.fn().mockResolvedValue({ data, error }) : vi.fn().mockReturnThis(),
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
  fecha: '2026-05-29', // viernes
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
      return makeChain({ data: [], inResolves: true })
    })

    const result = await autoJustificarClasesProgramadas(EMERGENTE, MAESTRO_ID)

    expect(result).toEqual({ justificadas: 0, errores: [] })
  })

  it('retorna { justificadas:0, errores:[] } si hay horarios pero ninguno coincide con el día de la semana', async () => {
    supabase.from.mockImplementation((table) => {
      if (table === 'clases')
        return makeChain({ data: [{ id: 'clase-1', nombre: 'Guitarra' }] })
      if (table === 'clase_horarios')
        // EMERGENTE.fecha es viernes; estos horarios son de otro día
        return makeChain({
          data: [{ clase_id: 'clase-1', dia: 'lunes', hora_inicio: '16:00', hora_fin: '17:00' }],
          inResolves: true,
        })
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
            { clase_id: 'clase-1', dia: 'viernes', hora_inicio: '16:00', hora_fin: '17:00' },
            { clase_id: 'clase-2', dia: 'viernes', hora_inicio: '17:00', hora_fin: '18:00' },
          ],
          inResolves: true,
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
        return makeChain({
          data: [{ clase_id: 'clase-1', dia: 'viernes', hora_inicio: '16:00', hora_fin: '17:00' }],
          inResolves: true,
        })
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

  it('los alumnos que participan en la actividad quedan presentes y el resto justificado', async () => {
    const upsertMock = vi.fn().mockResolvedValue({ error: null })

    supabase.from.mockImplementation((table) => {
      if (table === 'clases')
        return makeChain({ data: [{ id: 'clase-1', nombre: 'Seccional' }] })
      if (table === 'clase_horarios')
        return makeChain({
          data: [{ clase_id: 'clase-1', dia: 'viernes', hora_inicio: '16:00', hora_fin: '17:00' }],
          inResolves: true,
        })
      if (table === 'alumnos_clases')
        return makeChain({
          data: [{ alumno_id: 'participa' }, { alumno_id: 'no-participa' }],
          resolveOnEqCall: 2,
        })
      if (table === 'sesiones_clase')
        return { upsert: upsertMock }
    })

    // La fila insertada de la actividad trae los alumnos elegidos en `asistencia`
    const conParticipantes = { ...EMERGENTE, asistencia: [{ alumno_id: 'participa' }, { alumno_id: 'de-otra-clase' }] }
    await autoJustificarClasesProgramadas(conParticipantes, MAESTRO_ID)

    const [payload] = upsertMock.mock.calls[0]
    expect(payload.asistencia).toEqual([
      { alumno_id: 'participa', estado: 'presente' },
      { alumno_id: 'no-participa', estado: 'justificado' },
    ])
    expect(payload.contenido).not.toContain('Todos los alumnos quedan justificados')
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
            { clase_id: 'clase-1', dia: 'viernes', hora_inicio: '16:00', hora_fin: '17:00' },
            { clase_id: 'clase-2', dia: 'viernes', hora_inicio: '17:00', hora_fin: '18:00' },
          ],
          inResolves: true,
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
        return makeChain({
          data: [{ clase_id: 'clase-1', dia: 'viernes', hora_inicio: '16:00', hora_fin: '17:00' }],
          inResolves: true,
        })
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

// ─── Regresión: bug real de producción (tildes en día de la semana) ────────
// Caso real: taller emergente del 2026-09-05 (sábado) con el maestro Omar
// Suniaga nunca justificó "Taller 2dos Violines" porque clase_horarios.dia
// está guardado como "sábado" (con tilde) pero el código comparaba contra
// "sabado" (sin tilde) con igualdad exacta — nunca matcheaba, y la clase
// quedaba huérfana (emergente_id NULL, 0 asistencias) en todas las métricas.
describe('autoJustificarClasesProgramadas — bug de tildes en día de la semana', () => {
  beforeEach(() => vi.clearAllMocks())

  it('matchea "sábado" (con tilde en la BD) aunque el código interno use "sabado" (sin tilde)', async () => {
    const upsertMock = vi.fn().mockResolvedValue({ error: null })
    const emergenteSabado = {
      id: 'emergente-taller-cuerdas',
      fecha: '2026-09-05', // sábado
      actividad: 'Taller de Cuerdas con Efraín Lara',
      motivo: 'El maestro Efraín Lara estuvo de visita en la sede',
    }

    supabase.from.mockImplementation((table) => {
      if (table === 'clases')
        return makeChain({ data: [{ id: 'clase-violines', nombre: 'Taller 2dos Violines' }] })
      if (table === 'clase_horarios')
        return makeChain({
          // dato real de producción: "dia" viene CON tilde
          data: [{ clase_id: 'clase-violines', dia: 'sábado', hora_inicio: '09:00', hora_fin: '11:00' }],
          inResolves: true,
        })
      if (table === 'alumnos_clases')
        return makeChain({ data: [{ alumno_id: 'a1' }], resolveOnEqCall: 2 })
      if (table === 'sesiones_clase')
        return { upsert: upsertMock }
    })

    const result = await autoJustificarClasesProgramadas(emergenteSabado, MAESTRO_ID)

    expect(result.justificadas).toBe(1)
    expect(result.errores).toHaveLength(0)
    expect(upsertMock).toHaveBeenCalledTimes(1)
    const [payload] = upsertMock.mock.calls[0]
    expect(payload.emergente_id).toBe('emergente-taller-cuerdas')
    expect(payload.asistencia).toEqual([{ alumno_id: 'a1', estado: 'justificado' }])
  })

  it('matchea "miércoles" (con tilde) igual que "miercoles" (sin tilde)', async () => {
    const upsertMock = vi.fn().mockResolvedValue({ error: null })
    const emergenteMiercoles = {
      id: 'emergente-x',
      fecha: '2026-09-02', // miércoles
      actividad: 'Actividad especial',
      motivo: 'Motivo',
    }

    supabase.from.mockImplementation((table) => {
      if (table === 'clases')
        return makeChain({ data: [{ id: 'clase-1', nombre: 'Piano' }] })
      if (table === 'clase_horarios')
        return makeChain({
          data: [{ clase_id: 'clase-1', dia: 'miércoles', hora_inicio: '10:00', hora_fin: '11:00' }],
          inResolves: true,
        })
      if (table === 'alumnos_clases')
        return makeChain({ data: [], resolveOnEqCall: 2 })
      if (table === 'sesiones_clase')
        return { upsert: upsertMock }
    })

    const result = await autoJustificarClasesProgramadas(emergenteMiercoles, MAESTRO_ID)

    expect(result.justificadas).toBe(1)
    expect(upsertMock).toHaveBeenCalledTimes(1)
  })
})
