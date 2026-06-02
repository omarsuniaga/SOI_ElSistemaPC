import { describe, it, expect, beforeEach, vi } from 'vitest'

// ── Mock idb (for enqueue fallback) ──────────────────────
const store = new Map()
let nextId = 1

const mockDb = {
  add: vi.fn(async (_, value) => {
    const id = nextId++
    store.set(id, { ...value, id })
    return id
  }),
  getAll: vi.fn(async () => Array.from(store.values())),
  delete: vi.fn(async (_, id) => {
    store.delete(id)
  }),
  put: vi.fn(async (_, value) => {
    if (value.id && store.has(value.id)) {
      store.set(value.id, { ...store.get(value.id), ...value })
    } else {
      const id = nextId++
      store.set(id, { ...value, id })
    }
  }),
  count: vi.fn(async () => store.size),
  clear: vi.fn(async () => store.clear()),
  createObjectStore: vi.fn(() => ({ createIndex: vi.fn() })),
  objectStoreNames: { contains: vi.fn(() => false) },
  close: vi.fn(),
}

vi.mock('idb', () => ({
  openDB: vi.fn(async () => mockDb),
}))

// ── Mock supabase ────────────────────────────────────────
const mockSupabaseChain = (result) => ({
  eq: vi.fn().mockReturnThis(),
  select: vi.fn().mockReturnThis(),
  single: vi.fn().mockResolvedValue(result),
  limit: vi.fn().mockReturnThis(),
  order: vi.fn().mockReturnThis(),
  maybeSingle: vi.fn().mockResolvedValue(result),
  delete: vi.fn().mockReturnThis(),
  insert: vi.fn().mockReturnThis(),
  update: vi.fn().mockReturnThis(),
  upsert: vi.fn().mockResolvedValue(result),
})

vi.mock('../../../lib/supabaseClient.js', () => ({
  supabase: {
    from: vi.fn(() => {
      // Simular fallo de red cuando estamos offline
      if (typeof navigator !== 'undefined' && !navigator.onLine) {
        throw new Error('Failed to fetch')
      }
      return mockSupabaseChain({ data: null, error: null })
    }),
  },
}))

// ── Module under test ────────────────────────────────────
import { supabase } from '../../../lib/supabaseClient.js'
import { saveObservation } from '../autoDraftService.js'
import { getQueue } from '../offlineQueue.js'

describe('autoDraftService — offline fallback', () => {
  beforeEach(async () => {
    store.clear()
    nextId = 1
    vi.clearAllMocks()
  })

  describe('saveObservation', () => {
    const params = [
      'session-1',
      'teacher-1',
      'contenido raw de prueba',
      { indicador_id: 'ind-1', evaluaciones: [] },
      null,
      null,
    ]

    it('should save to Supabase when online', async () => {
      const result = await saveObservation(...params)

      // Should NOT have enqueued
      const queue = await getQueue()
      expect(queue).toHaveLength(0)

      // Should have called supabase
      expect(supabase.from).toHaveBeenCalledWith('observaciones_sesion')
    })

    it('should enqueue to IndexedDB when navigator.onLine is false', async () => {
      // Simular offline
      const originalOnLine = navigator.onLine
      Object.defineProperty(navigator, 'onLine', { value: false, configurable: true })

      try {
        const result = await saveObservation(...params)

        // Should have enqueued
        const queue = await getQueue()
        expect(queue).toHaveLength(1)
        expect(queue[0].tabla).toBe('observaciones_sesion')
        expect(queue[0].operacion).toBe('upsert')
        expect(queue[0].payload.sesion_id).toBe('session-1')
        expect(queue[0].payload.contenido_raw).toBe('contenido raw de prueba')

        // Should return offline marker
        expect(result).toHaveProperty('_offline', true)
      } finally {
        Object.defineProperty(navigator, 'onLine', { value: originalOnLine, configurable: true })
      }
    })

    it('should enqueue when Supabase throws a network error', async () => {
      // Make supabase.from reject with a network-like error
      supabase.from.mockImplementation(() => {
        throw new Error('Failed to fetch')
      })

      const result = await saveObservation(...params)

      const queue = await getQueue()
      expect(queue).toHaveLength(1)
      expect(queue[0].tabla).toBe('observaciones_sesion')
      expect(result).toHaveProperty('_offline', true)
    })

    it('should re-throw non-network errors', async () => {
      supabase.from.mockImplementation(() => {
        throw new Error('RLS policy violation')
      })

      await expect(saveObservation(...params)).rejects.toThrow('RLS policy violation')

      // Should NOT have enqueued
      const queue = await getQueue()
      expect(queue).toHaveLength(0)
    })

    it('should preserve contenidos when enqueuing offline', async () => {
      Object.defineProperty(navigator, 'onLine', { value: false, configurable: true })

      try {
        await saveObservation('s1', 't1', 'raw text', { data: true }, 'ia-dsl', 'mejorado')

        const queue = await getQueue()
        expect(queue[0].payload.contenido_raw).toBe('raw text')
        expect(queue[0].payload.contenido_parsed).toEqual({ data: true })
        expect(queue[0].payload.contenido_ia_dsl).toBe('ia-dsl')
        expect(queue[0].payload.contenido_ia_mejorado).toBe('mejorado')
        expect(queue[0].payload.es_borrador).toBe(false)
      } finally {
        Object.defineProperty(navigator, 'onLine', { value: true, configurable: true })
      }
    })
  })
})
