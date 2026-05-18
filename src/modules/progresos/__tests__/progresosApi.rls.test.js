/**
 * RLS integration tests for progresosApi
 *
 * Validates the API's RLS error translation layer using mocked Supabase responses.
 * Mirrors the 7-case harness from observacionesApi.rls.test.js for the progresos table.
 *
 * True end-to-end DB policy verification requires two Supabase auth contexts (R3):
 *   - maestroConPermiso: has 'evaluacion:write', maestro_en_clase(clase_id) = true
 *   - maestroSinPermiso: same ownership shape, no 'evaluacion:write'
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('../../../lib/supabaseClient.js', () => ({
  supabase: { from: vi.fn() },
}))

import { supabase } from '../../../lib/supabaseClient.js'
import { crearProgreso, actualizarProgreso } from '../api/progresosApi.js'

const VALID_PROGRESO = {
  alumno_id: 'alumno-001',
  clase_id: 'clase-001',
  evaluacion_tipo: 'parcial',
  calificacion: 8,
}

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

describe('progresosApi — RLS policy simulation', () => {
  beforeEach(() => vi.clearAllMocks())

  // Case 1: INSERT succeeds (maestroConPermiso)
  it('INSERT succeeds when maestro has evaluacion:write + maestro_en_clase', async () => {
    const chain = makeChain({ select: { data: [{ id: 'prog-new', ...VALID_PROGRESO }], error: null } })
    supabase.from.mockReturnValue(chain)

    const result = await crearProgreso(VALID_PROGRESO)
    expect(result).toBeDefined()
  })

  // Case 2: INSERT blocked — no evaluacion:write
  it('INSERT throws RLS_DENIED when maestro lacks evaluacion:write (42501)', async () => {
    const chain = makeChain({ select: { data: null, error: { code: '42501', message: 'new row violates row-level security policy' } } })
    supabase.from.mockReturnValue(chain)

    await expect(crearProgreso(VALID_PROGRESO)).rejects.toMatchObject({ code: 'RLS_DENIED' })
  })

  // Case 3: INSERT blocked — wrong clase (maestro_en_clase = false)
  it('INSERT throws RLS_DENIED when maestro_en_clase returns false (42501)', async () => {
    const chain = makeChain({ select: { data: null, error: { code: '42501', message: 'row-level security' } } })
    supabase.from.mockReturnValue(chain)

    await expect(
      crearProgreso({ ...VALID_PROGRESO, clase_id: 'clase-ajena' })
    ).rejects.toMatchObject({ code: 'RLS_DENIED' })
  })

  // Case 4: UPDATE succeeds (maestroConPermiso)
  it('UPDATE succeeds when maestro has evaluacion:write', async () => {
    const chain = makeChain({ select: { data: [{ id: 'prog-1', ...VALID_PROGRESO }], error: null } })
    supabase.from.mockReturnValue(chain)

    const result = await actualizarProgreso('prog-1', { calificacion: 9 })
    expect(result).toBeDefined()
  })

  // Case 5: UPDATE blocked — no evaluacion:write
  it('UPDATE throws RLS_DENIED when maestro lacks evaluacion:write (42501)', async () => {
    const chain = makeChain({ select: { data: null, error: { code: '42501', message: 'rls' } } })
    supabase.from.mockReturnValue(chain)

    await expect(actualizarProgreso('prog-1', { calificacion: 9 })).rejects.toMatchObject({ code: 'RLS_DENIED' })
  })

})
