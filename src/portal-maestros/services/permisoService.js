/**
 * PermisoService - Servicio para consultar permisos del maestro desde el portal
 * Implementa DataAdapter pattern: usa config.isDemoMode para elegir implementación
 */

import { obtenerPermisoPorMaestro } from '../../modules/permisos/api/permisosApi.js'
import { esVigente } from '../../modules/permisos/services/esVigente.js'

/**
 * Obtiene los permisos de un maestro
 * Fail-closed: si la API falla, devuelve { false, false, ... }
 * @param {string} maestroId
 * @returns {Promise<{puede_registrar_alumnos: boolean, puede_inscribir_clases: boolean, puede_planificar: boolean, puede_asistir: boolean}>}
 */
export async function getPermisos(maestroId) {
  const failClosed = {
    puede_registrar_alumnos: false,
    puede_inscribir_clases: false,
    puede_planificar: false,
    puede_asistir: false
  }

  if (!maestroId) {
    return failClosed
  }

  try {
    const permiso = await obtenerPermisoPorMaestro(maestroId)
    if (!permiso) return failClosed

    // Expiry check — fail-closed if permiso is not currently active
    if (!esVigente(permiso)) return failClosed

    // Mapeo desde arreglo de permisos (prioridad) o booleanos (fallback)
    const permisosArray = permiso.permisos || []
    
    return {
      puede_registrar_alumnos: permisosArray.includes('alumnos:create') || (permiso.puede_registrar_alumnos ?? false),
      puede_inscribir_clases: permisosArray.includes('clases:enroll') || (permiso.puede_inscribir_clases ?? false),
      puede_planificar: permisosArray.includes('planificacion:write') || false,
      puede_asistir: permisosArray.includes('asistencias:write') || false
    }
  } catch (err) {
    console.warn('[PermisoService] Error obteniendo permisos, fail-closed:', err.message)
    return failClosed
  }
}
