import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('../../../lib/supabaseClient.js', () => ({
  supabase: {
    from: vi.fn(),
  },
}))

import { supabase } from '../../../lib/supabaseClient.js'
import { crearProgreso, actualizarProgreso, eliminarProgreso } from '../api/progresosApi.js'

/**
 * Build a deep-chainable mock where every method returns 'this',
 * except the terminal that resolves with `resolvedValue`.
 * Any method in `terminalMap` will return a Promise instead of `this`.
 */
function makeChain(terminalMap = {}) {
  const chain = {}
  const methods = ['insert', 'update', 'delete', 'select', 'eq', 'single', 'not', 'order']
  methods.forEach(m => {
    if (terminalMap[m] !== undefined) {
      chain[m] = vi.fn().mockResolvedValue(terminalMap[m])
    } else {
      chain[m] = vi.fn().mockReturnValue(chain)
    }
  })
  return chain
}

describe('progresosApi — structured error handling', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('crearProgreso', () => {
    it('should throw VALIDATION error with "0 y 10" message when calificacion = 11', async () => {
      let caughtError
      try {
        await crearProgreso({ alumno_id: 'a1', clase_id: 'c1', evaluacion_tipo: 'parcial', calificacion: 11 })
      } catch (e) {
        caughtError = e
      }
      expect(caughtError).toBeDefined()
      expect(caughtError.code).toBe('VALIDATION')
      expect(caughtError.message).toMatch(/0 y 10/)
    })

    it('should NOT throw a calificacion error when calificacion = 5 (regression)', async () => {
      const chain = makeChain({ select: { data: [{ id: 'new-id', alumno_id: 'a1' }], error: null } })
      supabase.from.mockReturnValue(chain)

      const result = await crearProgreso({ alumno_id: 'a1', clase_id: 'c1', evaluacion_tipo: 'parcial', calificacion: 5 })
      expect(result).toBeDefined()
    })

    it('should throw RLS_DENIED when Supabase returns 42501', async () => {
      const chain = makeChain({ select: { data: null, error: { code: '42501', message: 'row-level security' } } })
      supabase.from.mockReturnValue(chain)

      await expect(
        crearProgreso({ alumno_id: 'a1', clase_id: 'c1', evaluacion_tipo: 'parcial', calificacion: 5 })
      ).rejects.toMatchObject({ code: 'RLS_DENIED' })
    })

    it('should throw DUPLICATE when Supabase returns 23505', async () => {
      const chain = makeChain({ select: { data: null, error: { code: '23505', message: 'duplicate key' } } })
      supabase.from.mockReturnValue(chain)

      await expect(
        crearProgreso({ alumno_id: 'a1', clase_id: 'c1', evaluacion_tipo: 'parcial', calificacion: 5 })
      ).rejects.toMatchObject({ code: 'DUPLICATE' })
    })
  })

  describe('actualizarProgreso', () => {
    it('should throw VALIDATION error when calificacion > 10', async () => {
      await expect(
        actualizarProgreso('prog-1', { calificacion: 12 })
      ).rejects.toMatchObject({ code: 'VALIDATION' })
    })

    it('should throw RLS_DENIED on 42501', async () => {
      // update().eq().select() chain
      const chain = makeChain({ select: { data: null, error: { code: '42501', message: 'rls' } } })
      supabase.from.mockReturnValue(chain)

      await expect(
        actualizarProgreso('prog-1', { calificacion: 8 })
      ).rejects.toMatchObject({ code: 'RLS_DENIED' })
    })
  })

  describe('eliminarProgreso', () => {
    it('should throw RLS_DENIED on 42501', async () => {
      // delete().eq() chain — eq is the terminal here
      const chain = makeChain({ eq: { error: { code: '42501', message: 'rls' } } })
      supabase.from.mockReturnValue(chain)

      await expect(eliminarProgreso('prog-1')).rejects.toMatchObject({ code: 'RLS_DENIED' })
    })
  })
})
