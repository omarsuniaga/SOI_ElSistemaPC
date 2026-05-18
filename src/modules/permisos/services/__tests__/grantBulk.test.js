import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock the permisosSupabase module before importing grantBulk
vi.mock('../../api/permisosSupabase.js', () => ({
  actualizarPermiso: vi.fn(),
}))

import { grantBulk } from '../grantBulk.js'
import { actualizarPermiso } from '../../api/permisosSupabase.js'

const PERMISO_KEY = 'alumnos:create'

describe('grantBulk(maestroIds, permisoKey)', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('all-ok: returns all maestroIds in succeeded when all upserts resolve', async () => {
    const ids = ['m1', 'm2', 'm3']
    actualizarPermiso.mockResolvedValue({ maestro_id: 'm1' })

    const result = await grantBulk(ids, PERMISO_KEY)

    expect(result.succeeded).toEqual(ids)
    expect(result.failed).toEqual([])
    expect(actualizarPermiso).toHaveBeenCalledTimes(3)
  })

  it('all-fail: returns all maestroIds in failed when all upserts reject', async () => {
    const ids = ['m1', 'm2']
    actualizarPermiso.mockRejectedValue(new Error('DB error'))

    const result = await grantBulk(ids, PERMISO_KEY)

    expect(result.succeeded).toEqual([])
    expect(result.failed).toEqual(ids)
  })

  it('partial: some succeed, some fail — each ends in correct bucket', async () => {
    const ids = ['m1', 'm2', 'm3']
    actualizarPermiso
      .mockResolvedValueOnce({ maestro_id: 'm1' })
      .mockRejectedValueOnce(new Error('fail'))
      .mockResolvedValueOnce({ maestro_id: 'm3' })

    const result = await grantBulk(ids, PERMISO_KEY)

    expect(result.succeeded).toEqual(['m1', 'm3'])
    expect(result.failed).toEqual(['m2'])
  })

  it('empty array: no-op — returns empty succeeded and failed, calls actualizarPermiso 0 times', async () => {
    const result = await grantBulk([], PERMISO_KEY)

    expect(result.succeeded).toEqual([])
    expect(result.failed).toEqual([])
    expect(actualizarPermiso).not.toHaveBeenCalled()
  })

  it('passes permisoKey in the permisos array when calling actualizarPermiso', async () => {
    actualizarPermiso.mockResolvedValue({ maestro_id: 'm1' })

    await grantBulk(['m1'], PERMISO_KEY)

    expect(actualizarPermiso).toHaveBeenCalledWith(
      'm1',
      expect.objectContaining({ permisos: expect.arrayContaining([PERMISO_KEY]) })
    )
  })
})
