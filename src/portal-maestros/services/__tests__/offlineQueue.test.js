import { describe, it, expect, beforeEach, vi } from 'vitest'

// ── Mock idb ─────────────────────────────────────────────
const store = new Map()
let nextId = 1

const mockDb = {
  add: vi.fn(async (storeName, value) => {
    const id = nextId++
    store.set(id, { ...value, id })
    return id
  }),
  getAll: vi.fn(async (storeName) => {
    return Array.from(store.values())
  }),
  get: vi.fn(async (storeName, id) => {
    return store.get(id) || undefined
  }),
  delete: vi.fn(async (storeName, id) => {
    store.delete(id)
  }),
  put: vi.fn(async (storeName, value) => {
    const existing = Array.from(store.values()).find((v) => v.id === value.id)
    if (existing) {
      store.set(value.id, { ...existing, ...value })
    } else {
      const id = nextId++
      store.set(id, { ...value, id })
    }
  }),
  count: vi.fn(async (storeName) => {
    return store.size
  }),
  clear: vi.fn(async (storeName) => {
    store.clear()
  }),
  createObjectStore: vi.fn((name, opts) => ({
    createIndex: vi.fn(),
  })),
  objectStoreNames: { contains: vi.fn(() => false) },
  close: vi.fn(),
  transaction: vi.fn((storeName, mode) => ({
    store: {
      clear: vi.fn(async () => {
        store.clear()
      }),
    },
    done: Promise.resolve(),
  })),
}

vi.mock('idb', () => ({
  openDB: vi.fn(async (dbName, version, { upgrade } = {}) => {
    if (upgrade) {
      upgrade(mockDb)
    }
    return mockDb
  }),
}))

// ── Module under test ────────────────────────────────────
import {
  enqueue,
  getQueue,
  dequeue,
  clearQueue,
  processQueue,
  getQueueCount,
} from '../offlineQueue.js'

describe('offlineQueue', () => {
  beforeEach(async () => {
    store.clear()
    nextId = 1
    vi.clearAllMocks()
  })

  describe('enqueue', () => {
    it('should add an item to the queue', async () => {
      await enqueue({ tabla: 'sesiones_clase', operacion: 'insert', payload: { id: 's1' } })
      const queue = await getQueue()
      expect(queue).toHaveLength(1)
      expect(queue[0].tabla).toBe('sesiones_clase')
      expect(queue[0].operacion).toBe('insert')
      expect(queue[0].payload).toEqual({ id: 's1' })
    })

    it('should set initial intentos to 0 and created_at', async () => {
      await enqueue({ tabla: 'asistencias', operacion: 'upsert', payload: {} })
      const queue = await getQueue()
      expect(queue[0].intentos).toBe(0)
      expect(queue[0].created_at).toBeDefined()
      expect(() => new Date(queue[0].created_at)).not.toThrow()
    })

    it('should auto-increment id for each item', async () => {
      await enqueue({ tabla: 'a', operacion: 'insert', payload: {} })
      await enqueue({ tabla: 'b', operacion: 'update', payload: {} })
      const queue = await getQueue()
      expect(queue[0].id).toBe(1)
      expect(queue[1].id).toBe(2)
    })
  })

  describe('getQueue', () => {
    it('should return empty array when queue is empty', async () => {
      const queue = await getQueue()
      expect(queue).toEqual([])
    })

    it('should return all items in FIFO order', async () => {
      await enqueue({ tabla: 'first', operacion: 'insert', payload: { order: 1 } })
      await enqueue({ tabla: 'second', operacion: 'update', payload: { order: 2 } })
      const queue = await getQueue()
      expect(queue).toHaveLength(2)
      expect(queue[0].tabla).toBe('first')
      expect(queue[1].tabla).toBe('second')
    })
  })

  describe('getQueueCount', () => {
    it('should return 0 when queue is empty', async () => {
      const count = await getQueueCount()
      expect(count).toBe(0)
    })

    it('should return the number of pending items', async () => {
      await enqueue({ tabla: 'a', operacion: 'insert', payload: {} })
      await enqueue({ tabla: 'b', operacion: 'insert', payload: {} })
      await enqueue({ tabla: 'c', operacion: 'insert', payload: {} })
      const count = await getQueueCount()
      expect(count).toBe(3)
    })

    it('should decrease after dequeue', async () => {
      await enqueue({ tabla: 'a', operacion: 'insert', payload: {} })
      await enqueue({ tabla: 'b', operacion: 'insert', payload: {} })
      expect(await getQueueCount()).toBe(2)
      const queue = await getQueue()
      await dequeue(queue[0].id)
      expect(await getQueueCount()).toBe(1)
    })
  })

  describe('dequeue', () => {
    it('should remove an item by id', async () => {
      await enqueue({ tabla: 'x', operacion: 'insert', payload: {} })
      const queue = await getQueue()
      await dequeue(queue[0].id)
      expect(await getQueue()).toHaveLength(0)
    })

    it('should not throw when dequeuing a non-existent id', async () => {
      await expect(dequeue(999)).resolves.toBeUndefined()
    })
  })

  describe('clearQueue', () => {
    it('should remove all items', async () => {
      await enqueue({ tabla: 'a', operacion: 'insert', payload: {} })
      await enqueue({ tabla: 'b', operacion: 'insert', payload: {} })
      await clearQueue()
      expect(await getQueue()).toHaveLength(0)
      expect(await getQueueCount()).toBe(0)
    })
  })

  describe('processQueue', () => {
    it('should call syncFn for each item in order', async () => {
      await enqueue({ tabla: 't1', operacion: 'insert', payload: { id: 1 } })
      await enqueue({ tabla: 't2', operacion: 'insert', payload: { id: 2 } })

      const syncFn = vi.fn()
      await processQueue(syncFn)

      expect(syncFn).toHaveBeenCalledTimes(2)
      expect(syncFn.mock.calls[0][0].tabla).toBe('t1')
      expect(syncFn.mock.calls[1][0].tabla).toBe('t2')
    })

    it('should dequeue items after successful sync', async () => {
      await enqueue({ tabla: 't1', operacion: 'insert', payload: {} })
      await enqueue({ tabla: 't2', operacion: 'insert', payload: {} })

      await processQueue(async () => {})
      expect(await getQueueCount()).toBe(0)
    })

    it('should retry on failure up to 5 times then discard', async () => {
      await enqueue({ tabla: 't1', operacion: 'insert', payload: {} })

      const syncFn = vi.fn().mockRejectedValue(new Error('DB error'))

      // First attempt
      await processQueue(syncFn)
      expect(await getQueueCount()).toBe(1)

      // Check intentos incremented
      const queue = await getQueue()
      expect(queue[0].intentos).toBe(1)

      // Simulate 5 more failures (6 total calls → triggers discard)
      for (let i = 0; i < 5; i++) {
        await processQueue(syncFn)
      }

      // After 5 failed attempts, item should be discarded
      expect(await getQueueCount()).toBe(0)
    })

    it('should continue processing remaining items after one fails', async () => {
      await enqueue({ tabla: 'fail', operacion: 'insert', payload: {} })
      await enqueue({ tabla: 'ok', operacion: 'insert', payload: {} })

      let callCount = 0
      await processQueue(async (item) => {
        callCount++
        if (item.tabla === 'fail') throw new Error('fail')
      })

      // First item failed, retry count = 1
      expect(await getQueueCount()).toBe(1)

      // Verify remaining is the failed one
      const queue = await getQueue()
      expect(queue[0].tabla).toBe('fail')
    })
  })
})
