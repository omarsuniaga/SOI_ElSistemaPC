import { describe, it, expect, beforeEach, vi } from 'vitest'

vi.mock('../../../modules/permisos/api/permisosApi.js', () => ({
  obtenerPermisoPorMaestro: vi.fn(),
}))

import { getPermisos } from '../permisoService.js'
import { obtenerPermisoPorMaestro } from '../../../modules/permisos/api/permisosApi.js'

function dateOffset(days) {
  const d = new Date()
  d.setDate(d.getDate() + days)
  return d.toISOString().slice(0, 10)
}

const TODAY = dateOffset(0)
const YESTERDAY = dateOffset(-1)
const TOMORROW = dateOffset(1)

const FULL_PERMISOS = {
  puede_registrar_alumnos: true,
  puede_inscribir_clases: true,
  permisos: ['alumnos:create', 'clases:enroll', 'planificacion:write', 'asistencias:write'],
}

const FAIL_CLOSED = {
  puede_registrar_alumnos: false,
  puede_inscribir_clases: false,
  puede_planificar: false,
  puede_asistir: false,
}

describe('permisoService.getPermisos() — expiry behavior', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns all false when permiso is expired (fecha_fin = yesterday)', async () => {
    obtenerPermisoPorMaestro.mockResolvedValueOnce({
      ...FULL_PERMISOS,
      fecha_inicio: YESTERDAY,
      fecha_fin: YESTERDAY,
    })
    const result = await getPermisos('maestro_001')
    expect(result).toEqual(FAIL_CLOSED)
  })

  it('returns all false when permiso is not yet active (fecha_inicio = tomorrow)', async () => {
    obtenerPermisoPorMaestro.mockResolvedValueOnce({
      ...FULL_PERMISOS,
      fecha_inicio: TOMORROW,
      fecha_fin: null,
    })
    const result = await getPermisos('maestro_001')
    expect(result).toEqual(FAIL_CLOSED)
  })

  it('returns normal permissions when fecha_fin is null (permanent, active)', async () => {
    obtenerPermisoPorMaestro.mockResolvedValueOnce({
      ...FULL_PERMISOS,
      fecha_inicio: YESTERDAY,
      fecha_fin: null,
    })
    const result = await getPermisos('maestro_001')
    expect(result).toEqual({
      puede_registrar_alumnos: true,
      puede_inscribir_clases: true,
      puede_planificar: true,
      puede_asistir: true,
    })
  })

  it('returns all false when no row in DB (existing fail-closed behavior preserved)', async () => {
    obtenerPermisoPorMaestro.mockResolvedValueOnce(null)
    const result = await getPermisos('maestro_001')
    expect(result).toEqual(FAIL_CLOSED)
  })

  it('returns normal permissions when fecha_fin equals today (boundary: still valid)', async () => {
    obtenerPermisoPorMaestro.mockResolvedValueOnce({
      ...FULL_PERMISOS,
      fecha_inicio: YESTERDAY,
      fecha_fin: TODAY,
    })
    const result = await getPermisos('maestro_001')
    expect(result).toEqual({
      puede_registrar_alumnos: true,
      puede_inscribir_clases: true,
      puede_planificar: true,
      puede_asistir: true,
    })
  })
})
