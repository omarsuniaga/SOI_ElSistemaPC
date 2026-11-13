import { beforeEach, describe, expect, it, vi } from 'vitest'
const { query, classes } = vi.hoisted(() => ({
  query: { select: vi.fn().mockReturnThis(), or: vi.fn() },
  classes: [
    { id: 'principal', maestro_principal_id: 'teacher' },
    { id: 'suplente', maestro_suplente_id: 'teacher' },
    { id: 'legacy', maestro_id: 'teacher' },
    { id: 'titular-demo', maestro_titular_id: 'teacher' },
    { id: 'auxiliar', maestro_auxiliar_id: 'teacher' },
    { id: 'ajeno', maestro_principal_id: 'other' },
  ],
}))
vi.mock('../../../../lib/supabaseClient.js', () => ({ supabase: { from: () => query } }))
vi.mock('../../../../assets/data/mocks/clases.json', () => ({ default: { clases: classes } }))
import * as real from '../sesionesSupabase.js'
import * as demo from '../mocks/sesionesMock.js'
beforeEach(() => { vi.clearAllMocks(); query.or.mockResolvedValue({ data: [], error: null }) })
describe('clases disponibles para registrar en planificación', () => {
  it('incluye titular, suplente y asignaciones heredadas en modo real', async () => {
    await real.obtenerClasesDelMaestro('teacher')
    expect(query.or).toHaveBeenCalledWith('maestro_principal_id.eq.teacher,maestro_suplente_id.eq.teacher,maestro_id.eq.teacher,maestro_auxiliar_id.eq.teacher')
  })
  it('ofrece las mismas asignaciones en demo y excluye maestros ajenos', async () => {
    expect((await demo.obtenerClasesDelMaestro('teacher')).map(c => c.id)).toEqual(['principal', 'suplente', 'legacy', 'titular-demo', 'auxiliar'])
  })
  it('no devuelve clases sin asignar cuando falta maestroId', async () => {
    expect(await demo.obtenerClasesDelMaestro(null)).toEqual([])
    expect(await real.obtenerClasesDelMaestro(null)).toEqual([])
    expect(query.or).not.toHaveBeenCalled()
  })
})
