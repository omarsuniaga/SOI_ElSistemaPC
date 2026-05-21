import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock de configuración para usar modo Demo/Mock de forma predecible
vi.mock('../../src/core/config/config.js', () => ({
  config: { isDemoMode: true },
}))

// Mock de maestroAuth
vi.mock('../../src/portal-maestros/auth/maestroAuth.js', () => ({
  getMaestroLocal: vi.fn(() => ({
    id: 'maestro_003',
    nombre_completo: 'Ana Martínez',
    email: 'ana@colegio.edu.uy'
  }))
}))

import { getPermisos, solicitarPermiso } from '../../src/portal-maestros/services/permisoService.js'
import { obtenerPermisoPorMaestro, actualizarPermiso } from '../../src/modules/permisos/api/permisosApi.js'

describe('Permisos de Colaboración de Inscripción — Flujo de Solicitud y Aprobación', () => {
  const maestroId = 'maestro_003'

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('debe inicializar un maestro sin permisos con arreglos vacíos de forma fail-closed', async () => {
    const perm = await getPermisos('non_existent_maestro')
    expect(perm.puede_registrar_alumnos).toBe(false)
    expect(perm.puede_inscribir_clases).toBe(false)
    expect(perm.solicitudes).toEqual([])
  })

  it('debe registrar una solicitud de permiso correctamente en la cola de solicitudes', async () => {
    // 1. Solicitar el permiso 'alumnos:create'
    const result = await solicitarPermiso(maestroId, 'alumnos:create')
    expect(result.solicitudes).toContain('alumnos:create')

    // 2. Verificar que getPermisos ahora retorna la solicitud pendiente
    const perm = await getPermisos(maestroId)
    expect(perm.puede_registrar_alumnos).toBe(false) // Aún no ha sido concedido
    expect(perm.solicitudes).toContain('alumnos:create')
  })

  it('debe permitir solicitar múltiples permisos de colaboración', async () => {
    // 1. Solicitar el primer permiso
    await solicitarPermiso(maestroId, 'alumnos:create')
    // 2. Solicitar el segundo permiso
    const result = await solicitarPermiso(maestroId, 'clases:enroll')

    expect(result.solicitudes).toContain('alumnos:create')
    expect(result.solicitudes).toContain('clases:enroll')

    // 3. Verificar en getPermisos
    const perm = await getPermisos(maestroId)
    expect(perm.puede_registrar_alumnos).toBe(false)
    expect(perm.puede_inscribir_clases).toBe(false)
    expect(perm.solicitudes).toEqual(['alumnos:create', 'clases:enroll'])
  })

  it('debe procesar la aprobación del administrador concediendo el permiso y depurando la cola de solicitudes', async () => {
    // 1. Aseguramos que tenga solicitudes pendientes
    await solicitarPermiso(maestroId, 'alumnos:create')
    await solicitarPermiso(maestroId, 'clases:enroll')

    // 2. Simulamos la aprobación por parte del administrador para 'alumnos:create'
    const rawPermiso = await obtenerPermisoPorMaestro(maestroId)
    const arrayPermisos = rawPermiso.permisos || []
    if (!arrayPermisos.includes('alumnos:create')) {
      arrayPermisos.push('alumnos:create')
    }
    const solicitudesRestantes = (rawPermiso.solicitudes || []).filter(s => s !== 'alumnos:create')

    const approvalChanges = {
      permisos: arrayPermisos,
      solicitudes: solicitudesRestantes,
      concedido_por: 'admin_test_id',
      concedido_por_nombre: 'Administrador Principal',
      puede_registrar_alumnos: true
    }

    const updated = await actualizarPermiso(maestroId, approvalChanges)
    expect(updated.puede_registrar_alumnos).toBe(true)
    expect(updated.permisos).toContain('alumnos:create')
    expect(updated.solicitudes).not.toContain('alumnos:create')
    expect(updated.solicitudes).toContain('clases:enroll') // Sigue pendiente
    expect(updated.concedido_por).toBe('admin_test_id')
    expect(updated.concedido_por_nombre).toBe('Administrador Principal')

    // 3. Verificar a través del servicio de permisos del Portal de Maestros
    const finalPerm = await getPermisos(maestroId)
    expect(finalPerm.puede_registrar_alumnos).toBe(true) // ¡Ahora sí concedido!
    expect(finalPerm.puede_inscribir_clases).toBe(false) // Sigue sin permiso directo
    expect(finalPerm.solicitudes).toEqual(['clases:enroll']) // Única solicitud restante
  })
})
