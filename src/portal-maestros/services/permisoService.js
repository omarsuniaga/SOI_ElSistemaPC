/**
 * PermisoService - Servicio para consultar permisos del maestro desde el portal
 * Implementa DataAdapter pattern: usa config.isDemoMode para elegir implementación
 */

import { obtenerPermisoPorMaestro } from '../../modules/permisos/api/permisosApi.js'

/**
 * Obtiene los permisos de un maestro
 * Fail-closed: si la API falla, devuelve { false, false }
 * @param {string} maestroId
 * @returns {Promise<{puede_registrar_alumnos: boolean, puede_inscribir_clases: boolean}>}
 */
export async function getPermisos(maestroId) {
  if (!maestroId) {
    return { puede_registrar_alumnos: false, puede_inscribir_clases: false }
  }

  try {
    const permiso = await obtenerPermisoPorMaestro(maestroId)
    return {
      puede_registrar_alumnos: permiso?.puede_registrar_alumnos ?? false,
      puede_inscribir_clases: permiso?.puede_inscribir_clases ?? false,
    }
  } catch (err) {
    console.warn('[PermisoService] Error obteniendo permisos, fail-closed:', err.message)
    return { puede_registrar_alumnos: false, puede_inscribir_clases: false }
  }
}
