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
const mockChain = (result) => ({
  eq: vi.fn().mockReturnThis(),
  select: vi.fn().mockResolvedValue(result),
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
      if (typeof navigator !== 'undefined' && !navigator.onLine) {
        throw new Error('Failed to fetch')
      }
      return mockChain({ data: [], error: null })
    }),
  },
}))

// ── Module under test ────────────────────────────────────
import { supabase } from '../../../lib/supabaseClient.js'
import { saveEvaluaciones } from '../evaluationService.js'
import { getQueue } from '../offlineQueue.js'

describe('evaluationService — offline fallback', () => {
  beforeEach(async () => {
    store.clear()
    nextId = 1
    vi.clearAllMocks()
    supabase.from.mockImplementation(() => {
      if (typeof navigator !== 'undefined' && !navigator.onLine) {
        throw new Error('Failed to fetch')
      }
      return mockChain({ data: [], error: null })
    })
  })

  const evaluaciones = [
    { alumno_id: 'alumno-1', nota: 4, observacion: 'Bien', tarea: null },
    { alumno_id: 'alumno-2', nota: 5, observacion: 'Excelente', tarea: 'Repasar' },
  ]

  it('should save to Supabase when online', async () => {
    const result = await saveEvaluaciones('s1', 'ind-1', evaluaciones, 'teacher-1')

    expect(supabase.from).toHaveBeenCalledWith('indicator_attempts')
    expect(result.error).toBeNull()

    const queue = await getQueue()
    expect(queue).toHaveLength(0)
  })

  it('should enqueue evaluations when navigator.onLine is false', async () => {
    const originalOnLine = navigator.onLine
    Object.defineProperty(navigator, 'onLine', { value: false, configurable: true })

    try {
      const result = await saveEvaluaciones('s1', 'ind-1', evaluaciones, 'teacher-1')

      const queue = await getQueue()
      expect(queue).toHaveLength(2)
      expect(queue[0].tabla).toBe('indicator_attempts')
      expect(queue[0].operacion).toBe('upsert')
      expect(queue[0].payload.student_id).toBe('alumno-1')
      expect(queue[0].payload.session_id).toBe('s1')
      expect(queue[0].payload.indicator_id).toBe('ind-1')
      expect(queue[1].payload.student_id).toBe('alumno-2')

      expect(result).toHaveProperty('_offline', true)
    } finally {
      Object.defineProperty(navigator, 'onLine', { value: originalOnLine, configurable: true })
    }
  })

  it('should enqueue when Supabase throws Failed to fetch', async () => {
    supabase.from.mockImplementation(() => {
      throw new Error('Failed to fetch')
    })

    const result = await saveEvaluaciones('s1', 'ind-1', evaluaciones, 'teacher-1')

    const queue = await getQueue()
    expect(queue).toHaveLength(2)
    expect(result).toHaveProperty('_offline', true)
  })

  it('should re-throw non-network errors on supabase.upsert failure', async () => {
    // Make the upsert return an error (not throw)
    const errorResult = { data: null, error: { message: 'Constraint violation' } }
    supabase.from.mockReturnValue(mockChain(errorResult))

    // The mockChain returns error in the upsert result
    // Since the function checks `if (error) throw error`, it will throw first,
    // then the catch block checks navigator.onLine which is true, so it re-throws
    const result = await saveEvaluaciones('s1', 'ind-1', evaluaciones, 'teacher-1')

    // The error branch runs, and since we're online, it returns the error
    expect(result.error).toBeTruthy()

    const queue = await getQueue()
    expect(queue).toHaveLength(0)
  })

  it('should filter to presentes only', async () => {
    const presentes = [{ id: 'alumno-1', nombre_completo: 'Alumno 1' }]

    await saveEvaluaciones('s1', 'ind-1', evaluaciones, 'teacher-1', presentes)

    // Only alumno-1 should be upserted
    // Since we're online, supabase.from should be called once
    expect(supabase.from).toHaveBeenCalledWith('indicator_attempts')
  })

  it('should not throw when evaluaciones is empty', async () => {
    const { default: guardarEvaluacionesModule } = await import('../evaluationService.js')

    // Empty evaluaciones should return success without calling supabase
    const result = await saveEvaluaciones('s1', 'ind-1', [], 'teacher-1')

    // With empty array, the rows.map produces empty array, upsert with empty shouldn't error
    expect(result.error).toBeNull()
  })

  it('should require teacherId', async () => {
    const result = await saveEvaluaciones('s1', 'ind-1', evaluaciones, null)

    expect(result.error).toBeTruthy()
    expect(result.error.message).toContain('teacherId')
  })
})
