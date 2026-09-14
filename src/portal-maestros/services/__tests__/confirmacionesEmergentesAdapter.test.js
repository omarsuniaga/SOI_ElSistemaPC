import { beforeEach, describe, expect, it, vi } from 'vitest'

describe('confirmacionesEmergentesAdapter', () => {
  beforeEach(() => {
    vi.resetModules()
  })

  it('modo demo: delega a confirmacionesEmergentesMock', async () => {
    vi.doMock('../../../core/config/config.js', () => ({
      config: { isDemoMode: true }
    }))

    const mockConfirmar = vi.fn().mockResolvedValue({ id: 'conf-mock-123', respuesta: 'si' })
    const mockPendientes = vi.fn().mockResolvedValue([{ id: 'p-1', estado: 'pendiente' }])
    const mockActividad = vi.fn().mockResolvedValue({ id: 'act-1', actividad: 'Concierto Mock' })
    const mockAlcance = vi.fn().mockResolvedValue([{ id: 'conf-1' }])
    const mockMaestrosAlcance = vi.fn().mockResolvedValue(['m1', 'm2'])

    vi.doMock('../confirmacionesEmergentesMock.js', () => ({
      confirmarActividad: mockConfirmar,
      obtenerConfirmacionesPendientes: mockPendientes,
      obtenerActividadPorId: mockActividad,
      obtenerActividadesPorAlcance: mockAlcance,
      obtenerMaestrosAfectadosPorAlcance: mockMaestrosAlcance
    }))

    vi.doMock('../confirmacionesEmergentesService.js', () => ({
      confirmarActividad: vi.fn(),
      obtenerConfirmacionesPendientes: vi.fn(),
      obtenerActividadPorId: vi.fn(),
      obtenerActividadesPorAlcance: vi.fn(),
      obtenerMaestrosAfectadosPorAlcance: vi.fn()
    }))

    const adapter = await import('../confirmacionesEmergentesAdapter.js')

    const datos = { actividad_id: 'a1', maestro_id: 'm1', fecha: '2026-09-15', respuesta: 'si' }
    const resConfirmar = await adapter.confirmarActividad(datos)
    expect(resConfirmar).toEqual({ id: 'conf-mock-123', respuesta: 'si' })
    expect(mockConfirmar).toHaveBeenCalledWith(datos)

    const resPendientes = await adapter.obtenerConfirmacionesPendientes('m1')
    expect(resPendientes).toEqual([{ id: 'p-1', estado: 'pendiente' }])
    expect(mockPendientes).toHaveBeenCalledWith('m1')

    const resAct = await adapter.obtenerActividadPorId('a1')
    expect(resAct).toEqual({ id: 'act-1', actividad: 'Concierto Mock' })
    expect(mockActividad).toHaveBeenCalledWith('a1')

    const resAlcance = await adapter.obtenerActividadesPorAlcance('m1', '2026-09-15')
    expect(resAlcance).toEqual([{ id: 'conf-1' }])
    expect(mockAlcance).toHaveBeenCalledWith('m1', '2026-09-15')

    const resMaestros = await adapter.obtenerMaestrosAfectadosPorAlcance({ alcance_tipo: 'institucion' })
    expect(resMaestros).toEqual(['m1', 'm2'])
    expect(mockMaestrosAlcance).toHaveBeenCalledWith({ alcance_tipo: 'institucion' })
  })

  it('modo real: delega a confirmacionesEmergentesService (Supabase)', async () => {
    vi.doMock('../../../core/config/config.js', () => ({
      config: { isDemoMode: false }
    }))

    const serviceConfirmar = vi.fn().mockResolvedValue({ id: 'conf-real-456', respuesta: 'no_se' })
    const servicePendientes = vi.fn().mockResolvedValue([{ id: 'p-real-1', estado: 'pendiente' }])
    const serviceActividad = vi.fn().mockResolvedValue({ id: 'act-real-1', actividad: 'Concierto Real' })
    const serviceAlcance = vi.fn().mockResolvedValue([{ id: 'conf-real-1' }])
    const serviceMaestros = vi.fn().mockResolvedValue(['m-real-1'])

    vi.doMock('../confirmacionesEmergentesMock.js', () => ({
      confirmarActividad: vi.fn(),
      obtenerConfirmacionesPendientes: vi.fn(),
      obtenerActividadPorId: vi.fn(),
      obtenerActividadesPorAlcance: vi.fn(),
      obtenerMaestrosAfectadosPorAlcance: vi.fn()
    }))

    vi.doMock('../confirmacionesEmergentesService.js', () => ({
      confirmarActividad: serviceConfirmar,
      obtenerConfirmacionesPendientes: servicePendientes,
      obtenerActividadPorId: serviceActividad,
      obtenerActividadesPorAlcance: serviceAlcance,
      obtenerMaestrosAfectadosPorAlcance: serviceMaestros
    }))

    const adapter = await import('../confirmacionesEmergentesAdapter.js')

    const datos = { actividad_id: 'a1', maestro_id: 'm1', fecha: '2026-09-15', respuesta: 'no_se' }
    const resConfirmar = await adapter.confirmarActividad(datos)
    expect(resConfirmar).toEqual({ id: 'conf-real-456', respuesta: 'no_se' })
    expect(serviceConfirmar).toHaveBeenCalledWith(datos)

    const resPendientes = await adapter.obtenerConfirmacionesPendientes('m1')
    expect(resPendientes).toEqual([{ id: 'p-real-1', estado: 'pendiente' }])
    expect(servicePendientes).toHaveBeenCalledWith('m1')

    const resAct = await adapter.obtenerActividadPorId('a1')
    expect(resAct).toEqual({ id: 'act-real-1', actividad: 'Concierto Real' })
    expect(serviceActividad).toHaveBeenCalledWith('a1')

    const resAlcance = await adapter.obtenerActividadesPorAlcance('m1', '2026-09-15')
    expect(resAlcance).toEqual([{ id: 'conf-real-1' }])
    expect(serviceAlcance).toHaveBeenCalledWith('m1', '2026-09-15')

    const resMaestros = await adapter.obtenerMaestrosAfectadosPorAlcance({ alcance_tipo: 'programa' })
    expect(resMaestros).toEqual(['m-real-1'])
    expect(serviceMaestros).toHaveBeenCalledWith({ alcance_tipo: 'programa' })
  })
})
