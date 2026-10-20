import { describe, it, expect, vi } from 'vitest'

vi.mock('../../../lib/supabaseClient.js', () => ({ supabase: { rpc: vi.fn(), from: vi.fn() } }))
vi.mock('../offlineQueue.js', () => ({ enqueue: vi.fn() }))

import { buildCierrePayload, cerrarSesion, getRegistrosSesion } from '../bitacoraCloseService.js'
import { parseBitacora } from '../../../shared/utils/bitacoraParser.js'

const roster = [
  { id: 'g', nombre_completo: 'Gerali Denisse Lugo Batista' },
  { id: 'le', nombre_completo: 'Lesly Ramírez Leonardo' },
  { id: 'sa', nombre_completo: 'Santa Isaura Castillo Diaz' },
  { id: 'ye', nombre_completo: 'Yereni Esther Germain Michel' },
]
const allPresent = { g: 'P', le: 'P', sa: 'P', ye: 'P' }
const INCIDENT = '#Gerali Denisse Lugo Batista ha perdido agilidad. #Lesly Ramírez Leonardo esta mejorando. ' +
  '#Santa Isaura Castillo Diaz y #Yereni Esther Germain Michel estan ganando afinacion. #todos tienen problemas en la proyeccion.'

const sequentialIds = () => {
  let n = 0
  return () => `id-${++n}`
}

const build = (overrides = {}) => buildCierrePayload({
  sesionId: 's1',
  contenido: INCIDENT,
  alumnos: roster,
  estado: allPresent,
  parsed: parseBitacora(INCIDENT, { roster, attendance: allPresent }),
  newId: sequentialIds(),
  ...overrides,
})

describe('buildCierrePayload: registros from parseBitacora', () => {
  it('turns the 2026-10-20 incident into 4 individual rows (shared grupo for Santa y Yereni) plus 1 grupo row', () => {
    const { payload, problemas, sinAsignar } = build()

    expect(problemas).toEqual([])
    expect(sinAsignar).toEqual([])
    expect(payload.registros).toHaveLength(5)

    const [g, le, sa, ye, todos] = payload.registros
    expect(g).toMatchObject({ alumno_id: 'g', alcance: 'alumno', tipo: 'desempeno', origen: 'escrito', indicador_id: null })
    expect(g.texto).toContain('agilidad')
    expect(g.texto).not.toContain('mejorando')
    expect(le).toMatchObject({ alumno_id: 'le', alcance: 'alumno' })
    expect(le.texto).toContain('mejorando')
    expect(le.texto).not.toContain('agilidad')

    expect(sa.alumno_id).toBe('sa')
    expect(ye.alumno_id).toBe('ye')
    expect(sa.grupo_registro_id).toBe(ye.grupo_registro_id)
    expect(sa.grupo_registro_id).not.toBe(g.grupo_registro_id)
    expect(sa.texto).toBe(ye.texto)
    expect(sa.texto).toContain('afinacion')

    expect(todos).toMatchObject({ alcance: 'grupo', tipo: 'desempeno', indicador_id: null })
    expect(todos.alumno_id).toBeUndefined()
    expect(todos.texto).toContain('proyeccion')
    expect(todos.grupo_registro_id).not.toBe(sa.grupo_registro_id)
  })

  it('never repeats a sentence across individual students (only the shared mention repeats it)', () => {
    const { payload } = build()
    const individual = payload.registros.filter(r => r.alcance === 'alumno')
    const texts = individual.map(r => `${r.alumno_id}:${r.texto}`)
    expect(new Set(individual.map(r => r.texto)).size).toBe(3)
    expect(texts).toHaveLength(4)
  })

  it('copies evidence text and offsets, and the contenido note untouched', () => {
    const parsed = parseBitacora(INCIDENT, { roster, attendance: allPresent })
    const { payload } = build({ parsed })
    const first = parsed.registros[0]
    expect(payload.registros[0].evidencia).toBe(first.evidencia.texto)
    expect(payload.registros[0].evidencia_inicio).toBe(first.evidencia.inicio)
    expect(payload.registros[0].evidencia_fin).toBe(first.evidencia.fin)
    expect(payload.contenido).toBe(INCIDENT)
    expect(payload.sesion_id).toBe('s1')
  })

  it('does not write the grupo row with an alumno_id', () => {
    const { payload } = build()
    const grupo = payload.registros.find(r => r.alcance === 'grupo')
    expect(grupo).not.toHaveProperty('alumno_id')
  })

  it('treats T (tarde) as present and writes its rows', () => {
    const estado = { g: 'T', le: 'A', sa: 'P', ye: 'P' }
    const { payload, problemas } = build({ estado, parsed: parseBitacora(INCIDENT, { roster, attendance: { g: 'T', le: 'A', sa: 'P', ye: 'P' } }) })
    expect(payload.registros.some(r => r.alumno_id === 'g')).toBe(true)
    expect(problemas.some(p => p.alumnoId === 'le')).toBe(false)
  })
})

describe('buildCierrePayload: unmarked, absent and justified students', () => {
  it('moves a mention to an unmarked student into problemas and not into the payload', () => {
    const attendance = { g: 'P', le: null, sa: 'P', ye: 'P' }
    const parsed = parseBitacora(INCIDENT, { roster, attendance })
    const { payload, problemas } = build({ estado: attendance, parsed })

    expect(payload.registros.some(r => r.alumno_id === 'le')).toBe(false)
    expect(problemas).toEqual([
      expect.objectContaining({ tipo: 'no_presente', alumnoId: 'le', nombre: 'Lesly Ramírez Leonardo' }),
    ])
    expect(problemas[0].texto).toContain('mejorando')
  })

  it('treats A and J as not present (rows dropped, problema emitted, shared rows keep present partner)', () => {
    const estado = { g: 'P', le: 'J', sa: 'A', ye: 'P' }
    const parsed = parseBitacora(INCIDENT, { roster, attendance: {} })
    const { payload, problemas } = build({ estado, parsed })

    expect(payload.registros.map(r => r.alumno_id)).toEqual(['g', 'ye'])
    expect(problemas.map(p => [p.tipo, p.alumnoId])).toEqual([
      ['no_presente', 'le'],
      ['no_presente', 'sa'],
    ])
  })

  it('omits the grupo row and emits sin_presentes when no student is present', () => {
    const estado = { g: 'A', le: 'A', sa: 'J', ye: 'A' }
    const parsed = parseBitacora(INCIDENT, { roster, attendance: allPresent })
    const { payload, problemas } = build({ estado, parsed })

    expect(payload.registros).toEqual([])
    expect(problemas).toContainEqual({ tipo: 'sin_presentes', texto: expect.stringContaining('proyeccion') })
  })
})

describe('buildCierrePayload: asistencia mapping', () => {
  const alumnos = [
    { id: 'p', nombre_completo: 'Presente' },
    { id: 't', nombre_completo: 'Tarde' },
    { id: 'a', nombre_completo: 'Ausente' },
    { id: 'j', nombre_completo: 'Justificado' },
    { id: 'n', nombre_completo: 'Sin marcar' },
    { id: 'u', nombre_completo: 'Indefinido' },
  ]
  const estado = { p: 'P', t: 'T', a: 'A', j: 'J', n: null }

  it('maps P/A/J/T to presente/ausente/justificado/tarde and omits unmarked students', () => {
    const { payload } = buildCierrePayload({
      sesionId: 's1',
      contenido: 'Clase tranquila.',
      alumnos,
      estado,
      parsed: parseBitacora('Clase tranquila.', { roster: alumnos }),
      newId: sequentialIds(),
    })
    expect(payload.asistencia).toEqual([
      { alumno_id: 'p', estado: 'presente' },
      { alumno_id: 't', estado: 'tarde' },
      { alumno_id: 'a', estado: 'ausente' },
      { alumno_id: 'j', estado: 'justificado' },
    ])
  })
})

describe('buildCierrePayload: valoraciones', () => {
  const alumnos = ['p1', 'p2', 'p3', 'p4', 'p5', 'p6', 'p7', 'ab'].map(id => ({ id, nombre_completo: id }))
  const estado = { p1: 'P', p2: 'P', p3: 'P', p4: 'P', p5: 'P', p6: 'P', p7: 'P', ab: 'A' }
  const parsed = parseBitacora('Clase tranquila.', { roster: alumnos })

  it('keeps integers 0..5 for present students only and drops everything else silently', () => {
    const valoraciones = { p1: 0, p2: 5, p3: 6, p4: -1, p5: 3.5, p6: 'x', p7: null, ab: 3 }
    const { payload } = buildCierrePayload({ sesionId: 's1', contenido: 'Clase tranquila.', alumnos, estado, parsed, valoraciones, newId: sequentialIds() })
    expect(payload.valoraciones).toEqual([
      { alumno_id: 'p1', valoracion: 0 },
      { alumno_id: 'p2', valoracion: 5 },
    ])
  })

  it('sends no valoraciones by default', () => {
    const { payload } = buildCierrePayload({ sesionId: 's1', contenido: 'Clase tranquila.', alumnos, estado, parsed, newId: sequentialIds() })
    expect(payload.valoraciones).toEqual([])
  })

  it('never derives a valoracion from the note text', () => {
    const contenido = 'Excelente clase, 5 de 5 para todos.'
    const { payload } = buildCierrePayload({ sesionId: 's1', contenido, alumnos, estado, parsed: parseBitacora(contenido, { roster: alumnos }), newId: sequentialIds() })
    expect(payload.valoraciones).toEqual([])
  })
})

describe('buildCierrePayload: determinism', () => {
  it('produces the same payload for the same inputs and an injected newId', () => {
    const first = build()
    const second = build()
    expect(second).toEqual(first)
    expect(first.payload.registros[0].grupo_registro_id).toBe('id-1')
    expect(first.payload.registros[0].id).toBe('id-2')
  })
})

describe('cerrarSesion', () => {
  const payload = { sesion_id: 's1', contenido: 'x', asistencia: [], registros: [], valoraciones: [] }
  const item = {
    tabla: 'registros_sesion',
    operacion: 'rpc',
    preservar: true,
    payload: { fn: 'cerrar_sesion', args: { p_payload: payload } },
  }

  const makeClient = impl => ({ rpc: vi.fn(impl) })

  it('calls the RPC with p_payload and returns data without queuing on success', async () => {
    const client = makeClient(async () => ({ data: { sesion_id: 's1', presentes: 4 }, error: null }))
    const enqueueFn = vi.fn()
    const result = await cerrarSesion(payload, { client, enqueueFn, isOnline: () => true })

    expect(client.rpc).toHaveBeenCalledWith('cerrar_sesion', { p_payload: payload })
    expect(result).toEqual({ data: { sesion_id: 's1', presentes: 4 }, queued: false })
    expect(enqueueFn).not.toHaveBeenCalled()
  })

  it('enqueues exactly one rpc item with the same payload when offline', async () => {
    const client = makeClient(async () => ({ data: null, error: new Error('Failed to fetch') }))
    const enqueueFn = vi.fn(async () => {})
    const result = await cerrarSesion(payload, { client, enqueueFn, isOnline: () => false })

    expect(enqueueFn).toHaveBeenCalledTimes(1)
    expect(enqueueFn).toHaveBeenCalledWith(item)
    expect(result).toEqual({ data: null, queued: true })
  })

  it('enqueues when the RPC returns a Failed to fetch error while online', async () => {
    const client = makeClient(async () => ({ data: null, error: { message: 'TypeError: Failed to fetch' } }))
    const enqueueFn = vi.fn(async () => {})
    const result = await cerrarSesion(payload, { client, enqueueFn, isOnline: () => true })

    expect(enqueueFn).toHaveBeenCalledWith(item)
    expect(result).toEqual({ data: null, queued: true })
  })

  it('enqueues when the RPC throws a network error', async () => {
    const client = makeClient(async () => { throw new Error('Failed to fetch') })
    const enqueueFn = vi.fn(async () => {})
    const result = await cerrarSesion(payload, { client, enqueueFn, isOnline: () => true })

    expect(enqueueFn).toHaveBeenCalledWith(item)
    expect(result.queued).toBe(true)
  })

  it.each(['NetworkError when attempting to fetch resource.', 'Network request failed'])(
    'treats "%s" as a network failure',
    async message => {
      const client = makeClient(async () => ({ data: null, error: { message } }))
      const enqueueFn = vi.fn(async () => {})
      const result = await cerrarSesion(payload, { client, enqueueFn, isOnline: () => true })
      expect(enqueueFn).toHaveBeenCalledTimes(1)
      expect(result.queued).toBe(true)
    },
  )

  it.each([
    ['42501', 'permission denied for function cerrar_sesion'],
    ['22023', 'la sesión no existe'],
    ['P0001', 'el alumno no está presente'],
  ])('throws business error %s without enqueuing', async (code, message) => {
    const client = makeClient(async () => ({ data: null, error: { message, code } }))
    const enqueueFn = vi.fn(async () => {})

    const error = await cerrarSesion(payload, { client, enqueueFn, isOnline: () => true }).catch(e => e)
    expect(error).toBeInstanceOf(Error)
    expect(error.message).toBe(message)
    expect(error.code).toBe(code)
    expect(enqueueFn).not.toHaveBeenCalled()
  })

  it('does not enqueue a thrown business error with a code', async () => {
    const client = makeClient(async () => { throw Object.assign(new Error('forbidden'), { code: '42501' }) })
    const enqueueFn = vi.fn(async () => {})
    await expect(cerrarSesion(payload, { client, enqueueFn, isOnline: () => true })).rejects.toThrow('forbidden')
    expect(enqueueFn).not.toHaveBeenCalled()
  })
})

describe('getRegistrosSesion', () => {
  function queryClient(result) {
    const chain = {}
    chain.select = vi.fn(() => chain)
    chain.eq = vi.fn(() => chain)
    chain.order = vi.fn(async () => result)
    return { client: { from: vi.fn(() => chain) }, chain }
  }

  it('reads confirmed rows of the session ordered by created_at', async () => {
    const rows = [{ id: 'r1' }, { id: 'r2' }]
    const { client, chain } = queryClient({ data: rows, error: null })

    const result = await getRegistrosSesion('s1', { client })

    expect(client.from).toHaveBeenCalledWith('registros_sesion')
    expect(chain.select).toHaveBeenCalledWith('*')
    expect(chain.eq).toHaveBeenCalledWith('sesion_clase_id', 's1')
    expect(chain.eq).toHaveBeenCalledWith('estado', 'confirmado')
    expect(chain.order).toHaveBeenCalledWith('created_at', { ascending: true })
    expect(result).toEqual(rows)
  })

  it('throws when the query fails', async () => {
    const { client } = queryClient({ data: null, error: { message: 'RLS denied' } })
    await expect(getRegistrosSesion('s1', { client })).rejects.toMatchObject({ message: 'RLS denied' })
  })
})
