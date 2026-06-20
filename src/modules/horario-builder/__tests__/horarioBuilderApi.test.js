import { describe, it, expect, vi, beforeEach } from 'vitest'

// ─── Config mock — force real mode ────────────────────────────────
vi.mock('../../../core/config/config.js', () => ({
  config: { isDemoMode: false }
}))

// ─── Disponibilidad mock ──────────────────────────────────────────
vi.mock('../../../portal-maestros/api/disponibilidadApi.js', () => ({
  getDisponibilidadBulk: vi.fn().mockResolvedValue([])
}))

// ─── Supabase mock — must not reference outer variables in factory ─
let _currentFromImpl = null

vi.mock('../../../lib/supabaseClient.js', () => ({
  supabase: {
    from: vi.fn((table) => _currentFromImpl ? _currentFromImpl(table) : makeChain([]))
  }
}))

function makeChain(data, error = null) {
  const terminal = Promise.resolve({ data, error })
  return {
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    order: vi.fn().mockReturnValue(terminal),
    single: vi.fn().mockReturnValue(terminal),
    insert: vi.fn().mockReturnThis(),
  }
}

import { supabase } from '../../../lib/supabaseClient.js'
import { fetchSchedulingData } from '../api/horarioBuilderApi.js'

// ─── Tests ────────────────────────────────────────────────────────

describe('HB-F5B — duracion_minutos fallback', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    _currentFromImpl = null
  })

  it('returns null for duracion_minutos when column is absent', async () => {
    const clasesData = [
      { id: 'c1', nombre: 'Violín', maestro_principal_id: 'm1', capacidad_maxima: 10 }
      // No duracion_minutos field — simulates absent column
    ]
    const salonesData = [{ id: 's1', nombre: 'Salon', capacidad: 10, is_active: true }]

    supabase.from.mockImplementation((table) => {
      if (table === 'salones') return makeChain(salonesData)
      if (table === 'clases') return makeChain(clasesData)
      if (table === 'clase_horarios') return makeChain([])
      if (table === 'alumnos_clases') return makeChain([])
      return makeChain([])
    })

    const { clases } = await fetchSchedulingData()
    expect(clases[0].duracion_minutos).toBeNull()
  })

  it('returns value when column exists', async () => {
    const clasesData = [
      { id: 'c1', nombre: 'Violín', maestro_principal_id: 'm1', capacidad_maxima: 10, duracion_minutos: 45 }
    ]
    const salonesData = [{ id: 's1', nombre: 'Salon', capacidad: 10, is_active: true }]

    supabase.from.mockImplementation((table) => {
      if (table === 'salones') return makeChain(salonesData)
      if (table === 'clases') return makeChain(clasesData)
      if (table === 'clase_horarios') return makeChain([])
      if (table === 'alumnos_clases') return makeChain([])
      return makeChain([])
    })

    const { clases } = await fetchSchedulingData()
    expect(clases[0].duracion_minutos).toBe(45)
  })
})
