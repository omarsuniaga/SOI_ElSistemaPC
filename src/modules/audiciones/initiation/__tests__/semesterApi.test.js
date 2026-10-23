import { beforeEach, describe, it, expect, vi } from 'vitest'
const { rpc } = vi.hoisted(() => ({ rpc: vi.fn() }))
vi.mock('../../../../lib/supabaseClient.js', () => ({ supabase: { rpc } }))
vi.mock('../../../../core/config/config.js', () => ({ config: { isDemoMode: false } }))
import { semesterRealAdapter } from '../semesterApi.js'
describe('Semester real DataAdapter boundary', () => {
  beforeEach(() => rpc.mockReset())
  it('uses the single authenticated RPC and preserves versions and independent destination identity', async () => {
    rpc.mockResolvedValue({ data: { estado: 'invitado', version: 1 }, error: null })
    const data = { invitacion_id: 'destination-1', version: 0, disponibilidad_confirmada: true }
    expect(await semesterRealAdapter.execute('incorporar', data)).toEqual({
      estado: 'invitado',
      version: 1,
    })
    expect(rpc).toHaveBeenCalledWith('iniciacion_semestre', {
      p_accion: 'incorporar',
      p_datos: data,
    })
  })
  it('never reports success for a missing migration or denied request', async () => {
    rpc
      .mockResolvedValueOnce({ error: { code: 'PGRST202' } })
      .mockResolvedValueOnce({ error: { code: '42501', message: 'Solo receptor asignado' } })
    await expect(semesterRealAdapter.execute('contexto')).rejects.toThrow('no se ha guardado')
    await expect(semesterRealAdapter.execute('incorporar')).rejects.toThrow(
      'Solo receptor asignado',
    )
  })
})
