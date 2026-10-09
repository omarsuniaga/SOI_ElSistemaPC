import { beforeEach, describe, expect, it, vi } from 'vitest'

const calls = []
const chain = (table) => {
  const rec = { table }
  const api = {
    insert: vi.fn((v) => { rec.insert = v; calls.push(rec); return Promise.resolve({ error: null }) }),
    upsert: vi.fn((v, o) => { rec.upsert = v; rec.opts = o; calls.push(rec); return Promise.resolve({ error: null }) }),
    update: vi.fn((v) => {
      rec.update = v
      return { eq: vi.fn((c, val) => { rec.eq = [c, val]; calls.push(rec); return Promise.resolve({ error: null }) }) }
    }),
  }
  return api
}

vi.mock('../../../lib/supabaseClient.js', () => ({
  supabase: { from: vi.fn((t) => chain(t)) },
}))

import { syncQueueItem } from '../queueSyncHandler.js'

describe('syncQueueItem', () => {
  beforeEach(() => { calls.length = 0 })

  it('sesiones_clase insert se hace como upsert por clave natural, para que dos inserts offline no choquen', async () => {
    await syncQueueItem({
      tabla: 'sesiones_clase',
      operacion: 'insert',
      payload: { clase_id: 'c1', fecha: '2026-10-08', maestro_id: 'm1', contenido: 'texto' },
    })
    expect(calls[0].upsert).toMatchObject({ contenido: 'texto' })
    expect(calls[0].opts).toEqual({ onConflict: 'clase_id,fecha,maestro_id' })
    expect(calls[0].insert).toBeUndefined()
  })

  it('otras tablas siguen usando insert simple', async () => {
    await syncQueueItem({ tabla: 'observaciones_sesion', operacion: 'insert', payload: { a: 1 } })
    expect(calls[0].insert).toEqual([{ a: 1 }])
  })

  it('update por id quita el id del cuerpo', async () => {
    await syncQueueItem({ tabla: 'sesiones_clase', operacion: 'update', payload: { id: 's1', contenido: 'x' } })
    expect(calls[0].update).toEqual({ contenido: 'x' })
    expect(calls[0].eq).toEqual(['id', 's1'])
  })

  it('traduce contenido_dsl y asistencias a las columnas reales', async () => {
    await syncQueueItem({
      tabla: 'sesiones_clase',
      operacion: 'update',
      payload: { id: 's1', contenido_dsl: 'viejo', asistencias: [1] },
    })
    expect(calls[0].update).toEqual({ contenido: 'viejo', asistencia: [1] })
  })
})
