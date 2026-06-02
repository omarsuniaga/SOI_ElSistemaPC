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
      return mockChain({ data: [{ id: 'obs-1' }], error: null })
    }),
  },
}))

// Mock Observacion model
vi.mock('../../modules/observaciones/models/observacion.model.js', () => ({
  Observacion: class {
    constructor(data) {
      Object.assign(this, data)
    }
    toJSON() {
      return { ...this }
    }
  },
}))

// ── Module under test ────────────────────────────────────
import { supabase } from '../../../lib/supabaseClient.js'
import { promocionarObservacionesAlumnos } from '../observationPromotionService.js'
import { getQueue } from '../offlineQueue.js'

describe('observationPromotionService — offline fallback', () => {
  beforeEach(async () => {
    store.clear()
    nextId = 1
    vi.clearAllMocks()
    supabase.from.mockImplementation(() => {
      if (typeof navigator !== 'undefined' && !navigator.onLine) {
        throw new Error('Failed to fetch')
      }
      return mockChain({ data: [{ id: 'obs-1' }], error: null })
    })
  })

  const evaluaciones = [
    { alumno_id: 'alumno-1', observacion: 'Progresando bien' },
    { alumno_id: 'alumno-2', observacion: 'Necesita reforzar' },
  ]

  it('should save to Supabase when online', async () => {
    const result = await promocionarObservacionesAlumnos(
      'sesion-1',
      'clase-1',
      'teacher-1',
      evaluaciones,
      'Violín',
    )

    expect(result.success).toBe(true)
    expect(supabase.from).toHaveBeenCalledWith('observaciones_alumnos')

    const queue = await getQueue()
    expect(queue).toHaveLength(0)
  })

  it('should enqueue observations when navigator.onLine is false', async () => {
    const originalOnLine = navigator.onLine
    Object.defineProperty(navigator, 'onLine', { value: false, configurable: true })

    try {
      const result = await promocionarObservacionesAlumnos(
        'sesion-1',
        'clase-1',
        'teacher-1',
        evaluaciones,
        'Violín',
      )

      const queue = await getQueue()
      expect(queue).toHaveLength(2)
      expect(queue[0].tabla).toBe('observaciones_alumnos')
      expect(queue[0].operacion).toBe('upsert')
      expect(queue[0].payload.alumno_id).toBe('alumno-1')
      expect(queue[1].payload.alumno_id).toBe('alumno-2')

      expect(result).toHaveProperty('_offline', true)
    } finally {
      Object.defineProperty(navigator, 'onLine', { value: originalOnLine, configurable: true })
    }
  })

  it('should return early when evaluaciones is empty', async () => {
    const result = await promocionarObservacionesAlumnos(
      'sesion-1',
      'clase-1',
      'teacher-1',
      [],
      'Violín',
    )

    expect(result.success).toBe(true)
    // Should not have called supabase at all
    expect(supabase.from).not.toHaveBeenCalled()
  })

  it('should filter to presentes only', async () => {
    const presentes = [{ id: 'alumno-1' }]

    const result = await promocionarObservacionesAlumnos(
      'sesion-1',
      'clase-1',
      'teacher-1',
      evaluaciones,
      'Violín',
      presentes,
    )

    expect(result.success).toBe(true)
    // Should have been called for observaciones_alumnos
    expect(supabase.from).toHaveBeenCalledWith('observaciones_alumnos')
  })

  it('should skip evaluaciones without observation text', async () => {
    const mixedEvaluaciones = [
      { alumno_id: 'alumno-1', observacion: 'Tiene texto' },
      { alumno_id: 'alumno-2', observacion: '' },
      { alumno_id: 'alumno-3', observacion: null },
    ]

    const originalOnLine = navigator.onLine
    Object.defineProperty(navigator, 'onLine', { value: false, configurable: true })

    try {
      const result = await promocionarObservacionesAlumnos(
        'sesion-1',
        'clase-1',
        'teacher-1',
        mixedEvaluaciones,
        'Violín',
      )

      const queue = await getQueue()
      // Only alumno-1 has text, so only 1 item
      expect(queue).toHaveLength(1)
      expect(queue[0].payload.alumno_id).toBe('alumno-1')
      expect(result).toHaveProperty('_offline', true)
    } finally {
      Object.defineProperty(navigator, 'onLine', { value: originalOnLine, configurable: true })
    }
  })

  it('should enqueue when Supabase throws Failed to fetch', async () => {
    supabase.from.mockImplementation(() => {
      throw new Error('Failed to fetch')
    })

    const result = await promocionarObservacionesAlumnos(
      'sesion-1',
      'clase-1',
      'teacher-1',
      evaluaciones,
      'Violín',
    )

    const queue = await getQueue()
    expect(queue).toHaveLength(2)
    expect(result).toHaveProperty('_offline', true)
    expect(result.success).toBe(true)
  })

  it('should return error on non-network supabase failure', async () => {
    supabase.from.mockReturnValue(mockChain({ data: null, error: { message: 'RLS violation' } }))

    const result = await promocionarObservacionesAlumnos(
      'sesion-1',
      'clase-1',
      'teacher-1',
      evaluaciones,
      'Violín',
    )

    expect(result.success).toBe(false)
    expect(result.error).toBeTruthy()

    // Should NOT have enqueued
    const queue = await getQueue()
    expect(queue).toHaveLength(0)
  })

  it('should assign correct fields to each observation', async () => {
    const originalOnLine = navigator.onLine
    Object.defineProperty(navigator, 'onLine', { value: false, configurable: true })

    try {
      await promocionarObservacionesAlumnos(
        'sesion-1',
        'clase-1',
        'teacher-1',
        evaluaciones,
        'Piano',
      )

      const queue = await getQueue()
      expect(queue[0].payload.sesion_clase_id).toBe('sesion-1')
      expect(queue[0].payload.clase_id).toBe('clase-1')
      expect(queue[0].payload.maestro_id).toBe('teacher-1')
      expect(queue[0].payload.tipo).toBe('academico')
      expect(queue[0].payload.titulo).toContain('Piano')
    } finally {
      Object.defineProperty(navigator, 'onLine', { value: originalOnLine, configurable: true })
    }
  })
})
