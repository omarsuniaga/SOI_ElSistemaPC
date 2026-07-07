import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('../../../lib/supabaseClient.js', () => ({
  supabase: { from: vi.fn() },
}))

import { supabase } from '../../../lib/supabaseClient.js'
import { fetchPlanEntradas, insertPlanEntrada, deletePlanEntrada } from '../planEstudiosApi.js'

function buildChain(result) {
  const c = {
    select: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    delete: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    eq:     vi.fn().mockReturnThis(),
    order:  vi.fn().mockReturnThis(),
    single: vi.fn().mockResolvedValue(result),
  }
  c.then = (res) => Promise.resolve(result).then(res)
  return c
}

describe('planEstudiosApi — integration smoke tests', () => {
  beforeEach(() => vi.clearAllMocks())

  it('full create → fetch → delete cycle completes without throwing', async () => {
    const entry = {
      id: 'e1', alumno_id: 'a1', maestro_id: 'm1',
      tipo: 'diagnostico', titulo: 'Nivel base',
      created_at: new Date().toISOString(),
    }

    // insertPlanEntrada
    supabase.from.mockReturnValueOnce(buildChain({ data: entry, error: null }))
    const saved = await insertPlanEntrada({ alumno_id: 'a1', maestro_id: 'm1', tipo: 'diagnostico', titulo: 'Nivel base' })
    expect(saved.id).toBe('e1')
    expect(saved.titulo).toBe('Nivel base')

    // fetchPlanEntradas
    supabase.from.mockReturnValueOnce(buildChain({ data: [entry], error: null }))
    const list = await fetchPlanEntradas('a1')
    expect(list).toHaveLength(1)
    expect(list[0].titulo).toBe('Nivel base')

    // deletePlanEntrada
    supabase.from.mockReturnValueOnce(buildChain({ error: null }))
    await expect(deletePlanEntrada('e1')).resolves.toBeUndefined()
  })

  it('propagates DB constraint violation as Error', async () => {
    supabase.from.mockReturnValueOnce(buildChain({ data: null, error: { message: 'violates check constraint' } }))
    await expect(
      insertPlanEntrada({ alumno_id: 'a1', maestro_id: 'm1', tipo: 'tipo_invalido', titulo: 'X' })
    ).rejects.toThrow('violates check constraint')
  })

  it('all 5 valid tipos can be passed without client-side rejection', async () => {
    const tipos = ['diagnostico', 'logro', 'en_progreso', 'dificultad', 'objetivo']
    for (const tipo of tipos) {
      const entry = { id: `e-${tipo}`, tipo, titulo: `Test ${tipo}`, created_at: new Date().toISOString() }
      supabase.from.mockReturnValueOnce(buildChain({ data: entry, error: null }))
      const result = await insertPlanEntrada({ alumno_id: 'a1', maestro_id: 'm1', tipo, titulo: `Test ${tipo}` })
      expect(result.tipo).toBe(tipo)
    }
  })
})
