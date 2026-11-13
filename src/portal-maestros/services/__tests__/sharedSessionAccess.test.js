import { beforeEach, describe, expect, it, vi } from 'vitest'
const { from, classes } = vi.hoisted(() => ({ from: vi.fn(), classes: { select: vi.fn().mockReturnThis(), eq: vi.fn() } }))
vi.mock('../../../lib/supabaseClient.js', () => ({ supabase: { from } }))
import { applySharedSessionAccess } from '../sharedSessionAccess.js'
beforeEach(() => { vi.clearAllMocks(); from.mockReturnValue(classes) })
describe('lectura compartida de sesiones', () => {
  it('incluye las sesiones del titular solo por las clases con suplencia asignada', async () => {
    classes.eq.mockResolvedValue({ data: [{ id: 'class-1' }, { id: 'class-1' }], error: null })
    const query = { or: vi.fn().mockResolvedValue({ data: [{ id: 'session-titular' }] }), eq: vi.fn() }
    expect(await applySharedSessionAccess(query, 'substitute')).toEqual({ data: [{ id: 'session-titular' }] })
    expect(classes.eq).toHaveBeenCalledWith('maestro_suplente_id', 'substitute')
    expect(query.or).toHaveBeenCalledWith('maestro_id.eq.substitute,clase_id.in.(class-1)')
  })
  it('conserva las sesiones propias cuando no hay suplencias', async () => {
    classes.eq.mockResolvedValue({ data: [], error: null })
    const query = { eq: vi.fn().mockResolvedValue({ data: [] }), or: vi.fn() }
    await applySharedSessionAccess(query, 'titular')
    expect(query.eq).toHaveBeenCalledWith('maestro_id', 'titular')
    expect(query.or).not.toHaveBeenCalled()
  })
  it('no amplía el acceso si falla la consulta de asignaciones', async () => {
    classes.eq.mockResolvedValue({ error: new Error('RLS') })
    await expect(applySharedSessionAccess({}, 'teacher')).rejects.toThrow('RLS')
  })
})
