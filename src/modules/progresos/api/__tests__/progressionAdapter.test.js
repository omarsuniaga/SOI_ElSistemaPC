/**
 * Tests para progressionAdapter.js — curriculo-tres-planos WU #8.
 *
 * DataAdapter pattern: config.isDemoMode enruta a progressionMock.js o
 * progressionApi.js (Supabase), igual que weeklyPlanAdapter.js / routeAdapter.js.
 */
import { describe, expect, it, vi, beforeEach } from 'vitest'

describe('progressionAdapter', () => {
  beforeEach(() => {
    vi.resetModules()
  })

  it('modo demo: delega a progressionMock.getObjetivoActual', async () => {
    vi.doMock('../../../../core/config/config.js', () => ({ config: { isDemoMode: true } }))
    vi.doMock('../progressionMock.js', () => ({ getObjetivoActual: vi.fn().mockResolvedValue({ mock: true }) }))
    vi.doMock('../progressionApi.js', () => ({ getObjetivoActual: vi.fn() }))

    const { getObjetivoActual } = await import('../progressionAdapter.js')
    const mockImpl = await import('../progressionMock.js')

    const result = await getObjetivoActual('alumno-1', 'route-version-1')

    expect(mockImpl.getObjetivoActual).toHaveBeenCalledWith('alumno-1', 'route-version-1')
    expect(result).toEqual({ mock: true })
  })

  it('modo real: delega a progressionApi.getObjetivoActual (Supabase)', async () => {
    vi.doMock('../../../../core/config/config.js', () => ({ config: { isDemoMode: false } }))
    vi.doMock('../progressionMock.js', () => ({ getObjetivoActual: vi.fn() }))
    vi.doMock('../progressionApi.js', () => ({ getObjetivoActual: vi.fn().mockResolvedValue({ real: true }) }))

    const { getObjetivoActual } = await import('../progressionAdapter.js')
    const realImpl = await import('../progressionApi.js')

    const result = await getObjetivoActual('alumno-1', 'route-version-1')

    expect(realImpl.getObjetivoActual).toHaveBeenCalledWith('alumno-1', 'route-version-1')
    expect(result).toEqual({ real: true })
  })
})
