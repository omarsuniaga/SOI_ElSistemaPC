import { beforeEach, describe, expect, it, vi } from 'vitest'
const { rpc, from } = vi.hoisted(() => ({ rpc: vi.fn(), from: vi.fn() }))
vi.mock('../../../../lib/supabaseClient.js', () => ({ supabase: { rpc, from } }))
import { decide, saveEvaluation, getContext } from '../real.js'
describe('real initiation adapter', () => {
  beforeEach(() => rpc.mockReset())
  it('uses the authenticated evaluator instead of accepting a caller-supplied identity', async () => {
    rpc.mockResolvedValue({ data: { id: 'evaluation' } })
    await saveEvaluation({ candidato_id: 'candidate', ronda: 1, notas: { ritmo: 3 }, observacion: 'Escucha', jurado_id: 'forged-user' })
    expect(rpc).toHaveBeenCalledWith('iniciacion_guardar_valoracion', { p_candidato: 'candidate', p_ronda: 1, p_notas: { ritmo: 3 }, p_observacion: 'Escucha', p_clase: null })
  })
  it('sends the expected version to the transactional decision operation', async () => {
    rpc.mockResolvedValue({ data: { estado: 'invitado' } })
    await decide({ candidato_id: 'candidate', version: 2, accion: 'invitar', datos: { observacion: 'Evidencia' } })
    expect(rpc).toHaveBeenCalledWith('iniciacion_decidir', { p_candidato: 'candidate', p_version: 2, p_accion: 'invitar', p_datos: { observacion: 'Evidencia' } })
  })
  it('surfaces a missing migration and propagates denied access', async () => {
    rpc.mockResolvedValueOnce({ error: { code: 'PGRST202' } }).mockResolvedValueOnce({ error: { code: '42501', message: 'Sin permiso' } })
    await expect(getContext()).rejects.toThrow('aún no está habilitado')
    await expect(getContext()).rejects.toThrow('Sin permiso')
  })
})
