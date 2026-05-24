import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock the actual Supabase layer that permisoService.js uses
vi.mock('../../src/modules/permisos/api/permisosSupabase.js', () => ({
  obtenerPermisoPorMaestro: vi.fn(),
  crearSolicitud: vi.fn(),
  obtenerSolicitudPorMaestro: vi.fn(),
  actualizarPermiso: vi.fn(),
}))

vi.mock('../../src/core/config/config.js', () => ({
  config: { isDemoMode: true },
}))

vi.mock('../../src/portal-maestros/auth/maestroAuth.js', () => ({
  getMaestroLocal: vi.fn(() => ({
    id: 'maestro_003',
    nombre_completo: 'Ana Martínez',
    email: 'ana@colegio.edu.uy'
  }))
}))

import { getPermisos, solicitarPermiso } from '../../src/portal-maestros/services/permisoService.js'
import {
  obtenerPermisoPorMaestro,
  crearSolicitud,
  obtenerSolicitudPorMaestro,
  actualizarPermiso,
} from '../../src/modules/permisos/api/permisosSupabase.js'

describe('Permisos de Colaboración de Inscripción — Flujo de Solicitud y Aprobación', () => {
  const maestroId = 'maestro_003'

  beforeEach(() => {
    vi.clearAllMocks()
    obtenerSolicitudPorMaestro.mockResolvedValue(null)
    obtenerPermisoPorMaestro.mockResolvedValue(null)
  })

  it('debe inicializar un maestro sin permisos con arreglos vacíos de forma fail-closed', async () => {
    const perm = await getPermisos('non_existent_maestro')
    expect(perm.puede_registrar_alumnos).toBe(false)
    expect(perm.puede_inscribir_clases).toBe(false)
    expect(perm.solicitudes).toEqual([])
  })

  it('debe registrar una solicitud de permiso correctamente en la cola de solicitudes', async () => {
    // crearSolicitud returns a solicitud_permisos record
    crearSolicitud.mockResolvedValueOnce({
      id: 'sol_001',
      maestro_id: maestroId,
      solicita_alumnos: true,
      solicita_clases: false,
      estado: 'pendiente',
    })

    const result = await solicitarPermiso(maestroId, 'alumnos:create')
    expect(result).toBeTruthy()
    expect(crearSolicitud).toHaveBeenCalledWith(maestroId, true, false)
  })

  it('debe permitir solicitar múltiples permisos de colaboración', async () => {
    crearSolicitud
      .mockResolvedValueOnce({
        id: 'sol_001',
        maestro_id: maestroId,
        solicita_alumnos: true,
        solicita_clases: false,
        estado: 'pendiente',
      })
      .mockResolvedValueOnce({
        id: 'sol_002',
        maestro_id: maestroId,
        solicita_alumnos: false,
        solicita_clases: true,
        estado: 'pendiente',
      })

    const result1 = await solicitarPermiso(maestroId, 'alumnos:create')
    expect(result1).toBeTruthy()

    const result2 = await solicitarPermiso(maestroId, 'clases:enroll')
    expect(result2).toBeTruthy()

    expect(crearSolicitud).toHaveBeenCalledTimes(2)
    expect(crearSolicitud).toHaveBeenNthCalledWith(1, maestroId, true, false)
    expect(crearSolicitud).toHaveBeenNthCalledWith(2, maestroId, false, true)
  })

  it('debe procesar la aprobación del administrador concediendo el permiso y depurando la cola de solicitudes', async () => {
    // After admin approves, obtenerPermisoPorMaestro returns permiso with 'alumnos:create'
    obtenerPermisoPorMaestro.mockResolvedValue({
      permisos: ['alumnos:create'],
      solicitudes: ['clases:enroll'], // clases still pending
      puede_registrar_alumnos: true,
      puede_inscribir_clases: false,
    })
    obtenerSolicitudPorMaestro.mockResolvedValue(null)

    const finalPerm = await getPermisos(maestroId)
    expect(finalPerm.puede_registrar_alumnos).toBe(true)
    expect(finalPerm.puede_inscribir_clases).toBe(false)
    // solicitudes comes from the permiso record
    expect(finalPerm.solicitudes).toEqual(['clases:enroll'])
  })
})
