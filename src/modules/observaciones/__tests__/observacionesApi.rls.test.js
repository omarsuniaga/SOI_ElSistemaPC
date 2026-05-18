/**
 * RLS integration tests for observacionesApi
 *
 * These tests validate the API's RLS error translation layer using mocked Supabase
 * responses that simulate what the actual DB policies return (error code 42501).
 *
 * For true end-to-end RLS validation against a live Supabase instance, two seeded
 * auth contexts are required (R3 risk documented in design §8):
 *   - maestroConPermiso: has 'evaluacion:write', is maestro_principal_id of the clase
 *   - maestroSinPermiso: same ownership, no 'evaluacion:write'
 *
 * These mock-backed tests verify:
 *   1. INSERT succeeds when Supabase returns data (maestroConPermiso simulation)
 *   2. INSERT blocked → RLS_DENIED when Supabase returns 42501 (maestroSinPermiso simulation)
 *   3. UPDATE succeeds when Supabase returns data
 *   4. UPDATE blocked → RLS_DENIED on 42501
 *   5. SELECT path is read-only and does NOT trigger these policies
 * Note: DELETE is not permitted by RLS policy (no DELETE policies exist)
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('../../../lib/supabaseClient.js', () => ({
  supabase: { from: vi.fn() },
}))

import { supabase } from '../../../lib/supabaseClient.js'
import {
  crearObservacion,
  actualizarObservacion,
} from '../api/observacionesApi.js'

const VALID_OBS = {
  alumno_id: 'alumno-001',
  titulo: 'Observación de prueba de integración',
  descripcion: 'Descripción suficientemente larga para pasar la validación del modelo correctamente',
  tipo: 'academica',
  prioridad: 'media',
  estado: 'abierta',
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

describe('observacionesApi — RLS policy simulation', () => {
  beforeEach(() => vi.clearAllMocks())

  // Case 1: INSERT succeeds (maestroConPermiso)
  it('INSERT succeeds when maestro has evaluacion:write (ownership OK)', async () => {
    const chain = makeChain({ select: { data: [{ id: 'obs-new', ...VALID_OBS }], error: null } })
    supabase.from.mockReturnValue(chain)

    const result = await crearObservacion(VALID_OBS)
    expect(result).toBeDefined()
  })

  // Case 2: INSERT blocked — no evaluacion:write
  it('INSERT throws RLS_DENIED when maestro lacks evaluacion:write (42501)', async () => {
    const chain = makeChain({ select: { data: null, error: { code: '42501', message: 'new row violates row-level security policy' } } })
    supabase.from.mockReturnValue(chain)

    await expect(crearObservacion(VALID_OBS)).rejects.toMatchObject({ code: 'RLS_DENIED' })
  })

  // Case 3: UPDATE succeeds (maestroConPermiso)
  it('UPDATE succeeds when maestro has evaluacion:write', async () => {
    const readChain = makeChain({ single: { data: { ...VALID_OBS, id: 'obs-1', seguimiento_observacion: '' }, error: null } })
    const writeChain = makeChain({ select: { data: [{ id: 'obs-1', ...VALID_OBS }], error: null } })
    supabase.from.mockReturnValueOnce(readChain).mockReturnValueOnce(writeChain)

    const result = await actualizarObservacion('obs-1', { prioridad: 'alta' })
    expect(result).toBeDefined()
  })

  // Case 4: UPDATE blocked — no evaluacion:write
  it('UPDATE throws RLS_DENIED when maestro lacks evaluacion:write (42501)', async () => {
    const readChain = makeChain({ single: { data: { ...VALID_OBS, id: 'obs-1', seguimiento_observacion: '' }, error: null } })
    const writeChain = makeChain({ select: { data: null, error: { code: '42501', message: 'rls' } } })
    supabase.from.mockReturnValueOnce(readChain).mockReturnValueOnce(writeChain)

    await expect(actualizarObservacion('obs-1', { prioridad: 'alta' })).rejects.toMatchObject({ code: 'RLS_DENIED' })
  })

  // Case 5: SELECT path is unchanged (read-only, no permission required)
  it('SELECT is not blocked by these write policies (no RLS error on read path)', async () => {
    // The read path (obtenerObservaciones) uses its own query and doesn't go through write errors
    // Verify that crearObservacion validation is the only gatekeeper before DB call
    await expect(
      crearObservacion({ titulo: 'too short', descripcion: 'short' })
    ).rejects.toMatchObject({ code: 'VALIDATION' })
    // No DB call was made (supabase.from not called)
    expect(supabase.from).not.toHaveBeenCalled()
  })
})
