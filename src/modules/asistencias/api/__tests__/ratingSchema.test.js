import { beforeEach, describe, it, expect, vi } from 'vitest'
const mocks = vi.hoisted(() => ({ response: {}, from: vi.fn() }))
vi.mock('../../../../lib/supabaseClient.js', () => ({
  supabase: { from: mocks.from },
}))
vi.mock('../../../../portal-maestros/services/substituteAuditService.js', () => ({
  logSubstituteActivity: vi.fn(), isSubstituteAssignment: vi.fn(),
}))
import { getValoracionesSesion } from '../asistenciasSupabase.js'

describe('getValoracionesSesion schema readiness', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mocks.from.mockImplementation(() => ({ select: () => ({ eq: async () => mocks.response }) }))
  })
  it('preserves a missing-column error as schema-unavailable instead of returning null ratings', async () => {
    mocks.response = { data: null, error: { code: '42703', message: 'column asistencias.valoracion does not exist' } }
    await expect(getValoracionesSesion('ses')).rejects.toMatchObject({ code: 'RATINGS_SCHEMA_UNAVAILABLE' })
  })
  it('returns explicit zero separately from not evaluated after the migration', async () => {
    mocks.response = { data: [{ alumno_id: 'a', valoracion: 0 }, { alumno_id: 'b', valoracion: null }], error: null }
    expect(await getValoracionesSesion('ses')).toEqual([
      { alumno_id: 'a', valoracion: 0 }, { alumno_id: 'b', valoracion: null },
    ])
  })
})
