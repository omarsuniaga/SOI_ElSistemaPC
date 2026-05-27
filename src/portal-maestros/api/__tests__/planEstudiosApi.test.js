import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('../../../lib/supabaseClient.js', () => ({
  supabase: {
    from: vi.fn(),
  },
}))

import { supabase } from '../../../lib/supabaseClient.js'
import {
  fetchPlanEntradas,
  insertPlanEntrada,
  updatePlanEntrada,
  deletePlanEntrada,
} from '../planEstudiosApi.js'

function mockChain(returnValue) {
  const chain = {
    select:  vi.fn().mockReturnThis(),
    insert:  vi.fn().mockReturnThis(),
    update:  vi.fn().mockReturnThis(),
    delete:  vi.fn().mockReturnThis(),
    eq:      vi.fn().mockReturnThis(),
    order:   vi.fn().mockReturnThis(),
    single:  vi.fn().mockResolvedValue(returnValue),
  }
  chain.then = (resolve) => Promise.resolve(returnValue).then(resolve)
  return chain
}

describe('planEstudiosApi', () => {
  beforeEach(() => vi.clearAllMocks())

  // ── fetchPlanEntradas ─────────────────────────────────────────────────────
  describe('fetchPlanEntradas(alumnoId)', () => {
    it('returns ordered entries for the alumno', async () => {
      const mockData = [
        { id: 'e1', alumno_id: 'a1', tipo: 'diagnostico', titulo: 'Nivel inicial', created_at: '2026-05-01T00:00:00Z' },
        { id: 'e2', alumno_id: 'a1', tipo: 'logro',        titulo: 'Do mayor',      created_at: '2026-05-10T00:00:00Z' },
      ]
      supabase.from.mockReturnValue(mockChain({ data: mockData, error: null }))

      const result = await fetchPlanEntradas('a1')
      expect(supabase.from).toHaveBeenCalledWith('alumno_plan_entradas')
      expect(result).toHaveLength(2)
      expect(result[0].tipo).toBe('diagnostico')
    })

    it('returns empty array when no entries exist', async () => {
      supabase.from.mockReturnValue(mockChain({ data: [], error: null }))
      const result = await fetchPlanEntradas('a1')
      expect(result).toEqual([])
    })

    it('throws when supabase returns an error', async () => {
      supabase.from.mockReturnValue(mockChain({ data: null, error: { message: 'DB error' } }))
      await expect(fetchPlanEntradas('a1')).rejects.toThrow('DB error')
    })
  })

  // ── insertPlanEntrada ─────────────────────────────────────────────────────
  describe('insertPlanEntrada(entrada)', () => {
    it('inserts and returns the new entry', async () => {
      const newEntry = { id: 'e3', alumno_id: 'a1', maestro_id: 'm1', tipo: 'logro', titulo: 'Escala Re mayor' }
      supabase.from.mockReturnValue(mockChain({ data: newEntry, error: null }))

      const result = await insertPlanEntrada({ alumno_id: 'a1', maestro_id: 'm1', tipo: 'logro', titulo: 'Escala Re mayor' })
      expect(result.titulo).toBe('Escala Re mayor')
      expect(result.id).toBe('e3')
    })

    it('throws when titulo is empty', async () => {
      await expect(insertPlanEntrada({ alumno_id: 'a1', maestro_id: 'm1', tipo: 'logro', titulo: '' }))
        .rejects.toThrow('titulo requerido')
    })

    it('throws when titulo is whitespace only', async () => {
      await expect(insertPlanEntrada({ alumno_id: 'a1', maestro_id: 'm1', tipo: 'logro', titulo: '   ' }))
        .rejects.toThrow('titulo requerido')
    })
  })

  // ── updatePlanEntrada ─────────────────────────────────────────────────────
  describe('updatePlanEntrada(id, changes)', () => {
    it('updates the entry and returns updated data', async () => {
      const updated = { id: 'e1', titulo: 'Nivel inicial actualizado' }
      supabase.from.mockReturnValue(mockChain({ data: updated, error: null }))

      const result = await updatePlanEntrada('e1', { titulo: 'Nivel inicial actualizado' })
      expect(result.titulo).toBe('Nivel inicial actualizado')
    })

    it('throws on supabase error', async () => {
      supabase.from.mockReturnValue(mockChain({ data: null, error: { message: 'update failed' } }))
      await expect(updatePlanEntrada('e1', { titulo: 'X' })).rejects.toThrow('update failed')
    })
  })

  // ── deletePlanEntrada ─────────────────────────────────────────────────────
  describe('deletePlanEntrada(id)', () => {
    it('calls delete with the correct id and resolves', async () => {
      supabase.from.mockReturnValue(mockChain({ error: null }))
      await expect(deletePlanEntrada('e1')).resolves.toBeUndefined()
      expect(supabase.from).toHaveBeenCalledWith('alumno_plan_entradas')
    })

    it('throws on supabase error', async () => {
      supabase.from.mockReturnValue(mockChain({ error: { message: 'delete failed' } }))
      await expect(deletePlanEntrada('e1')).rejects.toThrow('delete failed')
    })
  })
})
