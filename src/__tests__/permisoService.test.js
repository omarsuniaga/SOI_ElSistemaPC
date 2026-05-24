import { describe, it, expect, beforeEach, vi } from 'vitest'

// Mock the actual module permisoService.js imports from
vi.mock('../modules/permisos/api/permisosSupabase.js', () => ({
  obtenerPermisoPorMaestro: vi.fn(),
  crearSolicitud: vi.fn(),
  obtenerSolicitudPorMaestro: vi.fn(),
}))

import { getPermisos } from '../portal-maestros/services/permisoService.js'
import {
  obtenerPermisoPorMaestro,
  obtenerSolicitudPorMaestro,
} from '../modules/permisos/api/permisosSupabase.js'

describe('permisoService.getPermisos()', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Default: no pending solicitud
    obtenerSolicitudPorMaestro.mockResolvedValue(null)
  })

  it('should return permissions when API succeeds', async () => {
    obtenerPermisoPorMaestro.mockResolvedValueOnce({
      puede_registrar_alumnos: true,
      puede_inscribir_clases: false,
      permisos: [],
      solicitudes: [],
    })

    const result = await getPermisos('maestro_001')
    expect(result).toEqual({
      puede_registrar_alumnos: true,
      puede_inscribir_clases: false,
      puede_planificar: false,
      puede_asistir: false,
      solicitudes: [],
      solicitud_actual: null,
    })
    expect(obtenerPermisoPorMaestro).toHaveBeenCalledWith('maestro_001')
  })

  it('should map permisos array to boolean flags', async () => {
    obtenerPermisoPorMaestro.mockResolvedValueOnce({
      permisos: ['alumnos:create', 'planificacion:write'],
      solicitudes: [],
    })

    const result = await getPermisos('maestro_001')
    expect(result).toEqual({
      puede_registrar_alumnos: true,
      puede_inscribir_clases: false,
      puede_planificar: true,
      puede_asistir: false,
      solicitudes: [],
      solicitud_actual: null,
    })
  })

  it('should return fail-closed when maestroId is empty', async () => {
    const result = await getPermisos('')
    expect(result).toEqual({
      puede_registrar_alumnos: false,
      puede_inscribir_clases: false,
      puede_planificar: false,
      puede_asistir: false,
      solicitudes: [],
      solicitud_actual: null,
    })
    expect(obtenerPermisoPorMaestro).not.toHaveBeenCalled()
  })

  it('should return fail-closed when maestroId is null', async () => {
    const result = await getPermisos(null)
    expect(result).toEqual({
      puede_registrar_alumnos: false,
      puede_inscribir_clases: false,
      puede_planificar: false,
      puede_asistir: false,
      solicitudes: [],
      solicitud_actual: null,
    })
  })

  it('should return fail-closed when API throws (fail-closed)', async () => {
    obtenerPermisoPorMaestro.mockRejectedValueOnce(new Error('Network error'))

    const result = await getPermisos('maestro_001')
    expect(result).toEqual({
      puede_registrar_alumnos: false,
      puede_inscribir_clases: false,
      puede_planificar: false,
      puede_asistir: false,
      solicitudes: [],
      solicitud_actual: null,
    })
  })

  it('should return fail-closed when API returns null', async () => {
    obtenerPermisoPorMaestro.mockResolvedValueOnce(null)

    const result = await getPermisos('maestro_001')
    expect(result).toEqual({
      puede_registrar_alumnos: false,
      puede_inscribir_clases: false,
      puede_planificar: false,
      puede_asistir: false,
      solicitudes: [],
      solicitud_actual: null,
    })
  })

  it('should return fail-closed when API returns undefined', async () => {
    obtenerPermisoPorMaestro.mockResolvedValueOnce(undefined)

    const result = await getPermisos('maestro_001')
    expect(result).toEqual({
      puede_registrar_alumnos: false,
      puede_inscribir_clases: false,
      puede_planificar: false,
      puede_asistir: false,
      solicitudes: [],
      solicitud_actual: null,
    })
  })
})
