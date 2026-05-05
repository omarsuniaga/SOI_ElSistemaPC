import { describe, it, expect, beforeEach, vi } from 'vitest'

// Mock de idb: devuelve un store en memoria
vi.mock('idb', () => {
  const store = new Map()
  const mockDB = {
    add: vi.fn(async (storeName, item) => {
      const id = Date.now() + Math.random()
      store.set(id, { ...item, id })
      return id
    }),
    getAll: vi.fn(async () => [...store.values()]),
    delete: vi.fn(async (storeName, id) => store.delete(id)),
    transaction: vi.fn(() => ({ store: { getAll: vi.fn(async () => [...store.values()]) } })),
  }
  return {
    openDB: vi.fn(async () => mockDB),
    __mockDB: mockDB,
    __store: store,
  }
})

import { enqueue, getQueue, dequeue, clearQueue } from '../../src/portal-maestros/services/offlineQueue.js'

describe('offlineQueue', () => {
  beforeEach(async () => {
    const { __store } = await import('idb')
    __store.clear()
  })

  it('enqueue adds item to the queue', async () => {
    await enqueue({ tabla: 'sesiones_clase', operacion: 'insert', payload: { id: '1' } })
    const queue = await getQueue()
    expect(queue.length).toBe(1)
    expect(queue[0].tabla).toBe('sesiones_clase')
    expect(queue[0].operacion).toBe('insert')
  })

  it('dequeue removes item from queue', async () => {
    const { __mockDB } = await import('idb')
    await enqueue({ tabla: 'asistencia_sesion', operacion: 'insert', payload: { id: '2' } })
    const queue = await getQueue()
    await dequeue(queue[0].id)
    expect(__mockDB.delete).toHaveBeenCalled()
  })

  it('getQueue returns all pending items', async () => {
    await enqueue({ tabla: 'sesiones_clase', operacion: 'insert', payload: { id: 'a' } })
    await enqueue({ tabla: 'sesiones_clase', operacion: 'update', payload: { id: 'b' } })
    const queue = await getQueue()
    expect(queue.length).toBe(2)
  })
})
