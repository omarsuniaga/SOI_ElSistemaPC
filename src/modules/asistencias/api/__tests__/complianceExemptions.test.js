import { describe, it, expect, vi } from 'vitest'
const { rpc } = vi.hoisted(() => ({ rpc: vi.fn() }))
vi.mock('../../../../lib/supabaseClient.js', () => ({ supabase: {
  rpc,
  from: () => ({ select: () => ({ eq: () => ({ single: async () => ({ data: { fecha_inicio:'2026-08-10', fecha_fin:'2026-12-20' } }) }) }) }),
} }))
import { obtenerEstadoCumplimientoMaestro } from '../asistenciasSupabase.js'
describe('cumplimiento del período comparte el evaluador canónico', () => {
  it('consulta semestres largos y excluye exoneraciones y futuras de obligaciones', async () => {
    rpc.mockResolvedValueOnce({ data: [{estado:'exonerada'},{estado:'registrada'},{estado:'vencida'}] })
      .mockResolvedValueOnce({ data: [{estado:'futura'}] })
    const result = await obtenerEstadoCumplimientoMaestro('m','p')
    expect(rpc).toHaveBeenCalledTimes(2)
    expect(result).toEqual({ esCompleto:false, pendientesCount:1, totalCount:2 })
  })
  it('no presenta solvencia si falla la consulta', async () => {
    rpc.mockRejectedValueOnce(new Error('Sin conexión'))
    await expect(obtenerEstadoCumplimientoMaestro('m','p')).rejects.toThrow('Sin conexión')
  })
})
