import { beforeEach, describe, expect, it, vi } from 'vitest'

const calls = []
let insertError = null
const chain = (table) => {
  const rec = { table, eqs: [] }
  const eqChain = () => {
    const c = { eq: vi.fn((col, val) => { rec.eqs.push([col, val]); return c }), then: (res) => { calls.push(rec); return Promise.resolve({ error: null }).then(res) } }
    return c
  }
  return {
    insert: vi.fn((v) => { rec.insert = v; calls.push(rec); return Promise.resolve({ error: insertError }) }),
    upsert: vi.fn((v, o) => { rec.upsert = v; rec.opts = o; calls.push(rec); return Promise.resolve({ error: null }) }),
    update: vi.fn((v) => { rec.update = v; return eqChain() }),
  }
}

vi.mock('../../../lib/supabaseClient.js', () => ({
  supabase: { from: vi.fn((t) => chain(t)) },
}))

import { syncQueueItem } from '../queueSyncHandler.js'

describe('syncQueueItem', () => {
  beforeEach(() => { calls.length = 0; insertError = null })

  it('sesiones_clase insert simple cuando la fila no existe', async () => {
    await syncQueueItem({
      tabla: 'sesiones_clase',
      operacion: 'insert',
      payload: { clase_id: 'c1', fecha: '2026-10-08', maestro_id: 'm1', contenido: 'texto', borrador: true },
    })
    expect(calls[0].insert).toEqual([{ clase_id: 'c1', fecha: '2026-10-08', maestro_id: 'm1', contenido: 'texto', borrador: true }])
  })

  it('si la fila ya existe (23505) actualiza contenido y asistencia sin tocar borrador/estado', async () => {
    insertError = { code: '23505', message: 'duplicate key' }
    await syncQueueItem({
      tabla: 'sesiones_clase',
      operacion: 'insert',
      payload: {
        clase_id: 'c1', fecha: '2026-10-08', maestro_id: 'm1',
        contenido: 'texto', asistencia: [1], borrador: true, estado: 'pendiente',
      },
    })
    const upd = calls.find((c) => c.update)
    expect(upd.update).toEqual({ contenido: 'texto', asistencia: [1] })
    expect(upd.eqs).toEqual([['clase_id', 'c1'], ['fecha', '2026-10-08'], ['maestro_id', 'm1']])
  })

  it('otras tablas siguen usando insert simple', async () => {
    await syncQueueItem({ tabla: 'observaciones_sesion', operacion: 'insert', payload: { a: 1 } })
    expect(calls[0].insert).toEqual([{ a: 1 }])
  })

  it('update por id quita el id del cuerpo', async () => {
    await syncQueueItem({ tabla: 'sesiones_clase', operacion: 'update', payload: { id: 's1', contenido: 'x' } })
    expect(calls[0].update).toEqual({ contenido: 'x' })
    expect(calls[0].eqs).toEqual([['id', 's1']])
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
