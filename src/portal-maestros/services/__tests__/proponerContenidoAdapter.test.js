/**
 * Tests para proponerContenidoAdapter.js — curriculo-tres-planos WU #8.
 */
import { describe, expect, it, vi, beforeEach } from 'vitest'

describe('proponerContenidoAdapter', () => {
  beforeEach(() => {
    vi.resetModules()
  })

  it('modo demo: delega a proponerContenidoMock', async () => {
    vi.doMock('../../../core/config/config.js', () => ({ config: { isDemoMode: true } }))
    vi.doMock('../proponerContenidoMock.js', () => ({ enviarPropuesta: vi.fn().mockResolvedValue({ mock: true }) }))
    vi.doMock('../proponerContenidoService.js', () => ({ enviarPropuesta: vi.fn() }))

    const adapter = await import('../proponerContenidoAdapter.js')
    const result = await adapter.enviarPropuesta({}, { maestroId: 'm1', claseId: 'c1' })
    expect(result).toEqual({ mock: true })
  })

  it('modo real: delega a proponerContenidoService (Supabase)', async () => {
    vi.doMock('../../../core/config/config.js', () => ({ config: { isDemoMode: false } }))
    vi.doMock('../proponerContenidoMock.js', () => ({ enviarPropuesta: vi.fn() }))
    vi.doMock('../proponerContenidoService.js', () => ({ enviarPropuesta: vi.fn().mockResolvedValue({ real: true }) }))

    const adapter = await import('../proponerContenidoAdapter.js')
    const result = await adapter.enviarPropuesta({}, { maestroId: 'm1', claseId: 'c1' })
    expect(result).toEqual({ real: true })
  })
})
