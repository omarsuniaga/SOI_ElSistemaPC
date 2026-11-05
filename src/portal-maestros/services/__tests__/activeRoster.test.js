import { beforeEach, afterEach, describe, expect, it, vi } from 'vitest'
vi.mock('../../../lib/supabaseClient.js', () => ({ supabase: { from: vi.fn() } }))
vi.mock('../../auth/maestroAuth.js', () => ({ getMaestroLocal: () => ({ id: 'teacher' }) }))
vi.mock('../viewCache.js', () => ({ default: {
  getCached: vi.fn(), set: vi.fn(), invalidate: vi.fn(), invalidateAll: vi.fn(),
} }))
import { supabase } from '../../../lib/supabaseClient.js'
import { getInscripcionesClases } from '../maestroDataService.js'
import viewCache from '../viewCache.js'

describe('active attendance roster', () => {
  beforeEach(() => {
    vi.stubEnv('NODE_ENV', 'development')
    vi.stubEnv('VITEST', '')
    vi.clearAllMocks()
  })
  afterEach(() => vi.unstubAllEnvs())
  it('requires both active enrollment and active alumno', async () => {
    const rows = [
      { alumno_id: 'active', alumnos: { id: 'active', activo: true } },
      { alumno_id: 'inactive', alumnos: { id: 'inactive', activo: false } },
    ]
    const query = {
      select: vi.fn().mockReturnThis(), in: vi.fn().mockReturnThis(), eq: vi.fn().mockReturnThis(),
      then(resolve) { return Promise.resolve({ data: rows, error: null }).then(resolve) },
    }
    supabase.from.mockReturnValue(query)
    expect((await getInscripcionesClases(['c1'], true)).map(row => row.alumno_id)).toEqual(['active'])
    expect(query.select).toHaveBeenCalledWith(expect.stringContaining('alumnos!inner'))
    expect(query.eq).toHaveBeenCalledWith('alumnos.activo', true)
    expect(query.eq).toHaveBeenCalledWith('activo', true)
    expect(viewCache.getCached).not.toHaveBeenCalled()
  })
})
