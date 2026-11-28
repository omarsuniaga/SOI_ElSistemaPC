import { beforeEach, describe, expect, it, vi } from 'vitest'

const calls = []
let insertError = null
let upsertError = null
const chain = (table) => {
  const rec = { table, eqs: [] }
  const eqChain = () => {
    const c = { eq: vi.fn((col, val) => { rec.eqs.push([col, val]); return c }), then: (res) => { calls.push(rec); return Promise.resolve({ error: null }).then(res) } }
    return c
  }
  return {
    insert: vi.fn((v) => { rec.insert = v; calls.push(rec); return Promise.resolve({ error: insertError }) }),
    upsert: vi.fn((v, o) => { rec.upsert = v; rec.opts = o; calls.push(rec); return Promise.resolve({ error: upsertError }) }),
    update: vi.fn((v) => { rec.update = v; return eqChain() }),
  }
}

vi.mock('../../../lib/supabaseClient.js', () => ({
  supabase: { from: vi.fn((t) => chain(t)) },
}))

import { syncQueueItem } from '../queueSyncHandler.js'

describe('syncQueueItem', () => {
  beforeEach(() => { calls.length = 0; insertError = null; upsertError = null })

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

  describe('operacion upsert (progreso académico)', () => {
    it('student_node_progress usa upsert con onConflict student_id,node_id y no insert', async () => {
      const payload = { student_id: 'st1', node_id: 'n1', status: 'approved', last_attempt_at: '2026-10-11T00:00:00.000Z' }
      await syncQueueItem({ tabla: 'student_node_progress', operacion: 'upsert', payload })
      expect(calls).toHaveLength(1)
      expect(calls[0].upsert).toEqual(payload)
      expect(calls[0].opts).toEqual({ onConflict: 'student_id,node_id' })
      expect(calls[0].insert).toBeUndefined()
    })

    it('student_level_progress usa upsert con onConflict student_id,level_id y no insert', async () => {
      const payload = { student_id: 'st1', level_id: 'l1', status: 'approved', completed_at: '2026-10-11T00:00:00.000Z' }
      await syncQueueItem({ tabla: 'student_level_progress', operacion: 'upsert', payload })
      expect(calls).toHaveLength(1)
      expect(calls[0].upsert).toEqual(payload)
      expect(calls[0].opts).toEqual({ onConflict: 'student_id,level_id' })
      expect(calls[0].insert).toBeUndefined()
    })

    it('un error de Supabase en upsert se propaga para que la cola conserve el item', async () => {
      upsertError = { code: '42501', message: 'permission denied' }
      await expect(
        syncQueueItem({ tabla: 'student_level_progress', operacion: 'upsert', payload: { student_id: 'st1', level_id: 'l1' } }),
      ).rejects.toEqual(upsertError)
    })

    it('upsert sobre una tabla sin conflicto declarado falla de forma cerrada sin tocar Supabase', async () => {
      await expect(
        syncQueueItem({ tabla: 'asistencias', operacion: 'upsert', payload: { a: 1 } }),
      ).rejects.toThrow(/asistencias/)
      expect(calls).toHaveLength(0)
    })

    it('una operación desconocida lanza error y no se trata como éxito', async () => {
      await expect(
        syncQueueItem({ tabla: 'student_node_progress', operacion: 'merge', payload: { student_id: 'st1' } }),
      ).rejects.toThrow(/merge/)
      expect(calls).toHaveLength(0)
    })
  })
})
