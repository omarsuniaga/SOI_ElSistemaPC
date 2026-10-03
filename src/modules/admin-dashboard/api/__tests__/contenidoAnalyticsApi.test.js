import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('../../../../lib/supabaseClient.js', () => ({
  supabase: { from: vi.fn() },
}))
vi.mock('../../periodos/api/periodosApi.js', () => ({
  getPeriodoActivo: vi.fn(() => Promise.resolve(null)),
}))

import { supabase } from '../../../../lib/supabaseClient.js'
import { getAnalisisContenidoPedagogico } from '../contenidoAnalyticsApi.js'

// Cadena mínima: select().gte().lte() resuelve, o select().in() resuelve,
// o select().eq() resuelve, o select() solo resuelve — según lo que use cada tabla.
function makeChain(result) {
  const chain = { ...result }
  chain.select = vi.fn(() => chain)
  chain.gte = vi.fn(() => chain)
  chain.lte = vi.fn(() => chain)
  chain.in = vi.fn(() => chain)
  chain.eq = vi.fn(() => chain)
  chain.not = vi.fn(() => chain)
  return chain
}

describe('getAnalisisContenidoPedagogico — columna real tema_principal (bug 42703)', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  function mockTablas({ sesiones = [], clases = [], maestros = [] } = {}) {
    const chains = {}
    supabase.from.mockImplementation((table) => {
      if (table === 'sesiones_clase') return (chains.sesiones = makeChain({ data: sesiones, error: null }))
      if (table === 'contenidos_sesion') return makeChain({ data: [], error: null })
      if (table === 'observaciones_sesion') return makeChain({ data: [], error: null })
      if (table === 'clases') return makeChain({ data: clases, error: null })
      if (table === 'maestros') return makeChain({ data: maestros, error: null })
      return makeChain({ data: [], error: null })
    })
    return chains
  }

  it('consulta sesiones_clase con tema_principal, NUNCA con la columna inexistente "tema"', async () => {
    const chains = mockTablas({ sesiones: [] })

    await getAnalisisContenidoPedagogico({ tipo: 'mes' })

    expect(chains.sesiones.select).toHaveBeenCalledTimes(1)
    const columnasSeleccionadas = chains.sesiones.select.mock.calls[0][0]

    expect(columnasSeleccionadas).toContain('tema_principal')
    expect(columnasSeleccionadas).not.toMatch(/(^|[^_])\btema\b(?!_principal)/)
  })

  it('usa tema_principal (no contenido) como descripción cuando ambos existen, para clasificar el tema trabajado', async () => {
    mockTablas({
      sesiones: [
        {
          id: 'ses-1',
          fecha: '2026-09-10',
          estado: 'registrada',
          clase_id: 'clase-1',
          maestro_id: 'm1',
          tema_principal: 'Escalas mayores y arpegios',
          contenido: 'Texto libre distinto',
        },
      ],
      clases: [{ id: 'clase-1', nombre: 'Piano I', instrumento: 'Piano', maestro_principal_id: 'm1', maestro_id: null }],
      maestros: [{ id: 'm1', user_id: 'u1', nombre_completo: 'Ana', especialidad: 'Piano' }],
    })

    const resultado = await getAnalisisContenidoPedagogico({ tipo: 'mes' })

    expect(resultado.temasRecientes).toHaveLength(1)
    expect(resultado.temasRecientes[0].tema).toBe('Escalas mayores y arpegios')
    expect(resultado.temasRecientes[0].instrumento).toBe('Piano')
  })

  it('no revienta ni pierde datos cuando tema_principal viene vacío (usa contenido como fallback)', async () => {
    mockTablas({
      sesiones: [
        {
          id: 'ses-2',
          fecha: '2026-09-11',
          estado: 'registrada',
          clase_id: 'clase-2',
          maestro_id: 'm2',
          tema_principal: null,
          contenido: 'Repaso de repertorio del mes',
        },
      ],
      clases: [{ id: 'clase-2', nombre: 'Guitarra I', instrumento: 'Guitarra', maestro_principal_id: 'm2', maestro_id: null }],
    })

    const resultado = await getAnalisisContenidoPedagogico({ tipo: 'mes' })

    expect(resultado.temasRecientes).toHaveLength(1)
    expect(resultado.temasRecientes[0].tema).toBe('Repaso de repertorio del mes')
  })
})
