import { describe, it, expect, beforeEach, vi } from 'vitest'

// observaciones_alumnos has no UNIQUE (sesion_clase_id, alumno_id) in production
// (verified 2026-10-20), so an upsert on that pair always failed and the table
// stayed empty. The service must reuse existing ids and upsert by `id`.
const calls = { lookup: null, upsert: null }

vi.mock('idb', () => ({ openDB: vi.fn(async () => ({ add: vi.fn() })) }))
vi.mock('../../../lib/supabaseClient.js', () => ({
  supabase: {
    from: vi.fn(() => {
      const lookup = { filters: [] }
      const chain = {
        select: vi.fn(() => chain),
        eq: vi.fn((col, val) => { lookup.filters.push(['eq', col, val]); return chain }),
        in: vi.fn((col, val) => {
          lookup.filters.push(['in', col, val])
          calls.lookup = lookup
          return Promise.resolve({ data: [{ id: 'old-1', alumno_id: 'alumno-1' }], error: null })
        }),
        upsert: vi.fn((rows, opts) => { calls.upsert = { rows, opts }; return Promise.resolve({ data: rows, error: null }) }),
      }
      return chain
    }),
  },
}))
vi.mock('../../modules/observaciones/models/observacion.model.js', () => ({
  Observacion: class { constructor(d) { Object.assign(this, d) } toJSON() { return { ...this } } },
}))

import { promocionarObservacionesAlumnos } from '../observationPromotionService.js'

describe('promocionarObservacionesAlumnos — real unique keys', () => {
  beforeEach(() => { calls.lookup = null; calls.upsert = null })

  it('reuses the existing row id and upserts by id instead of a missing natural key', async () => {
    const result = await promocionarObservacionesAlumnos('sesion-1', 'clase-1', 'teacher-1', [
      { alumno_id: 'alumno-1', observacion: 'Mejoró la afinación' },
      { alumno_id: 'alumno-2', observacion: 'Reforzar arco' },
    ])
    expect(result.success).toBe(true)
    expect(calls.lookup.filters).toEqual([
      ['eq', 'sesion_clase_id', 'sesion-1'],
      ['in', 'alumno_id', ['alumno-1', 'alumno-2']],
    ])
    expect(calls.upsert.opts).toMatchObject({ onConflict: 'id' })
    expect(calls.upsert.rows[0].id).toBe('old-1')
    expect(calls.upsert.rows[1].id).toMatch(/^[0-9a-f-]{36}$/)
  })
})
