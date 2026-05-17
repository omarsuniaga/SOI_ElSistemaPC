import { describe, it, expect, beforeEach, vi } from 'vitest'

// Mock the permisos API
vi.mock('../modules/permisos/api/permisosApi.js', () => ({
  obtenerPermisoPorMaestro: vi.fn(),
}))

import { getPermisos } from '../portal-maestros/services/permisoService.js'
import { obtenerPermisoPorMaestro } from '../modules/permisos/api/permisosApi.js'

describe('permisoService.getPermisos()', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })
  it('should return permissions when API succeeds', async () => {
    obtenerPermisoPorMaestro.mockResolvedValueOnce({
      puede_registrar_alumnos: true,
      puede_inscribir_clases: false,
    })

    const result = await getPermisos('maestro_001')
    expect(result).toEqual({
      puede_registrar_alumnos: true,
      puede_inscribir_clases: false,
    })
    expect(obtenerPermisoPorMaestro).toHaveBeenCalledWith('maestro_001')
  })

  it('should return false,false when maestroId is empty (fail-closed)', async () => {
    const result = await getPermisos('')
    expect(result).toEqual({
      puede_registrar_alumnos: false,
      puede_inscribir_clases: false,
    })
    expect(obtenerPermisoPorMaestro).not.toHaveBeenCalled()
  })

  it('should return false,false when maestroId is null (fail-closed)', async () => {
    const result = await getPermisos(null)
    expect(result).toEqual({
      puede_registrar_alumnos: false,
      puede_inscribir_clases: false,
    })
  })

  it('should return false,false when API throws (fail-closed)', async () => {
    obtenerPermisoPorMaestro.mockRejectedValueOnce(new Error('Network error'))

    const result = await getPermisos('maestro_001')
    expect(result).toEqual({
      puede_registrar_alumnos: false,
      puede_inscribir_clases: false,
    })
  })

  it('should return false,false when API returns null (fail-closed)', async () => {
    obtenerPermisoPorMaestro.mockResolvedValueOnce(null)

    const result = await getPermisos('maestro_001')
    expect(result).toEqual({
      puede_registrar_alumnos: false,
      puede_inscribir_clases: false,
    })
  })

  it('should return false,false when API returns undefined (fail-closed)', async () => {
    obtenerPermisoPorMaestro.mockResolvedValueOnce(undefined)

    const result = await getPermisos('maestro_001')
    expect(result).toEqual({
      puede_registrar_alumnos: false,
      puede_inscribir_clases: false,
    })
  })
})
