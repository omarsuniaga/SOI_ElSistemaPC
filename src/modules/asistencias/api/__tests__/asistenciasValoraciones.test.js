import { describe, it, expect, vi, beforeEach } from 'vitest'
import { supabase } from '../../../../lib/supabaseClient.js'
import { getValoracionesSesion, guardarValoracionesSesion, registrarAsistenciaBulk as bulkReal } from '../asistenciasSupabase.js'
import * as mock from '../mocks/asistenciasMock.js'

vi.mock('../../../../lib/supabaseClient.js', () => ({ supabase: { from: vi.fn(), rpc: vi.fn() } }))

const SESION = 'ses-1'
const rows = [
  { id: 'r1', alumno_id: 'a', estado: 'presente', valoracion: null },
  { id: 'r2', alumno_id: 'b', estado: 'ausente', valoracion: null },
  { id: 'r3', alumno_id: 'd', estado: 'tarde', valoracion: 3 },
]

function wire() {
  const updates = []
  supabase.from.mockImplementation(() => ({
    select: () => ({ eq: () => Promise.resolve({ data: rows, error: null }) }),
    update: (patch) => ({ eq: (_c, id) => ({ eq: () => { updates.push({ id, patch }); return Promise.resolve({ error: null }) } }) }),
  }))
  return updates
}

describe('real adapter · valoraciones de sesión', () => {
  beforeEach(() => vi.clearAllMocks())

  it('recovers saved ratings, keeping null (sin evaluar) apart from 0', async () => {
    wire()
    const out = await getValoracionesSesion(SESION)
    expect(out.map(r => r.valoracion)).toEqual([null, null, 3])
  })

  it('corrects existing rows with UPDATE (no insert), skips absent students, null clears', async () => {
    const updates = wire()
    const result = await guardarValoracionesSesion(SESION, [
      { alumno_id: 'a', valoracion: 0 },
      { alumno_id: 'b', valoracion: 5 },
      { alumno_id: 'd', valoracion: null },
    ], { actorId: 'user-1' })
    expect(result.saved.sort()).toEqual(['a', 'd'])
    expect(result.rejected).toEqual([{ alumno_id: 'b', reason: 'no_presente' }])
    const a = updates.find(u => u.id === 'r1').patch
    expect(a.valoracion).toBe(0)
    expect(a.valorada_por).toBe('user-1')
    const d = updates.find(u => u.id === 'r3').patch
    expect(d).toMatchObject({ valoracion: null, valorada_por: null, valorada_at: null })
    expect(updates.some(u => u.id === 'r2')).toBe(false)
  })

  it('surfaces a write failure instead of reporting success', async () => {
    supabase.from.mockImplementation(() => ({
      select: () => ({ eq: () => Promise.resolve({ data: rows, error: null }) }),
      update: () => ({ eq: () => ({ eq: () => Promise.resolve({ error: { message: 'boom' } }) }) }),
    }))
    await expect(guardarValoracionesSesion(SESION, [{ alumno_id: 'a', valoracion: 1 }])).rejects.toThrow(/valoraci/i)
  })

  it('rejects an out-of-range rating before touching the database', async () => {
    const updates = wire()
    await expect(guardarValoracionesSesion(SESION, [{ alumno_id: 'a', valoracion: 6 }])).rejects.toThrow(RangeError)
    expect(updates).toHaveLength(0)
  })
})

describe('demo adapter · valoraciones de sesión', () => {
  it('saves, corrects without duplicating, survives re-registering attendance, and drops it when marked absent', async () => {
    const date = '2026-10-20'
    const base = { sesion_clase_id: 'demo-ses', clase_id: 'demo-clase', fecha: date }
    await mock.registrarAsistenciaBulk([
      { ...base, alumno_id: 'p1', estado: 'P' }, { ...base, alumno_id: 'p2', estado: 'A' },
    ])
    let res = await mock.guardarValoracionesSesion('demo-ses', [
      { alumno_id: 'p1', valoracion: 4 }, { alumno_id: 'p2', valoracion: 5 },
    ])
    expect(res.saved).toEqual(['p1'])
    expect(res.rejected).toEqual([{ alumno_id: 'p2', reason: 'no_presente' }])

    await mock.guardarValoracionesSesion('demo-ses', [{ alumno_id: 'p1', valoracion: 0 }])
    let stored = await mock.getValoracionesSesion('demo-ses')
    expect(stored.filter(r => r.alumno_id === 'p1')).toHaveLength(1)
    expect(stored.find(r => r.alumno_id === 'p1').valoracion).toBe(0)

    await mock.registrarAsistenciaBulk([{ ...base, alumno_id: 'p1', estado: 'P' }])
    stored = await mock.getValoracionesSesion('demo-ses')
    expect(stored.find(r => r.alumno_id === 'p1').valoracion).toBe(0)

    await mock.registrarAsistenciaBulk([{ ...base, alumno_id: 'p1', estado: 'A' }])
    stored = await mock.getValoracionesSesion('demo-ses')
    expect(stored.find(r => r.alumno_id === 'p1').valoracion).toBeNull()
  })
})

void bulkReal
