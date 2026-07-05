/**
 * Tests para propuestasAdapter.js — curriculo-tres-planos WU #8.
 */
import { describe, expect, it, vi, beforeEach } from 'vitest'

describe('propuestasAdapter', () => {
  beforeEach(() => {
    vi.resetModules()
  })

  it('modo demo: delega a propuestasMock', async () => {
    vi.doMock('../../../../core/config/config.js', () => ({ config: { isDemoMode: true } }))
    vi.doMock('../propuestasMock.js', () => ({
      listarPropuestasPendientes: vi.fn().mockResolvedValue(['mock']),
      publicarPropuesta: vi.fn(),
      devolverPropuesta: vi.fn(),
    }))
    vi.doMock('../propuestasApi.js', () => ({
      listarPropuestasPendientes: vi.fn(),
      publicarPropuesta: vi.fn(),
      devolverPropuesta: vi.fn(),
    }))

    const adapter = await import('../propuestasAdapter.js')
    const result = await adapter.listarPropuestasPendientes()
    expect(result).toEqual(['mock'])
  })

  it('modo real: delega a propuestasApi (Supabase)', async () => {
    vi.doMock('../../../../core/config/config.js', () => ({ config: { isDemoMode: false } }))
    vi.doMock('../propuestasMock.js', () => ({
      listarPropuestasPendientes: vi.fn(),
      publicarPropuesta: vi.fn(),
      devolverPropuesta: vi.fn(),
    }))
    vi.doMock('../propuestasApi.js', () => ({
      listarPropuestasPendientes: vi.fn().mockResolvedValue(['real']),
      publicarPropuesta: vi.fn(),
      devolverPropuesta: vi.fn(),
    }))

    const adapter = await import('../propuestasAdapter.js')
    const result = await adapter.listarPropuestasPendientes()
    expect(result).toEqual(['real'])
  })
})
