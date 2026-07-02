/**
 * PermisoService - Servicio para consultar permisos del maestro desde el portal
 * Implementa DataAdapter pattern: usa solicitudes_permisos table + permisosSupabase.js
 */

import { obtenerPermisoPorMaestro, crearSolicitud, obtenerSolicitudPorMaestro } from '../../modules/permisos/api/permisosSupabase.js'

/**
 * Obtiene los permisos de un maestro
 * Fail-closed: si la API falla, devuelve { false, false, ... }
 * @param {string} maestroId
 * @returns {Promise<{puede_registrar_alumnos: boolean, puede_inscribir_clases: boolean, puede_planificar: boolean, puede_asistir: boolean, solicitudes: Array, solicitud_actual: Object|null}>}
 */
export async function getPermisos(maestroId) {
  const failClosed = {
    puede_registrar_alumnos: false,
    puede_inscribir_clases: false,
    puede_planificar: false,
    puede_asistir: false,
    solicitudes: [],
    solicitud_actual: null
  }

  if (!maestroId) {
    return failClosed
  }

  try {
    // Obtener solicitud actual para verificar estado pendiente
    let solicitud_actual = null
    try {
      solicitud_actual = await obtenerSolicitudPorMaestro(maestroId)
    } catch (err) {
      // Solicitud table may not exist yet, continue without it
      console.debug('[PermisoService] No solicitud found or table not ready:', err.message)
    }

    const permiso = await obtenerPermisoPorMaestro(maestroId)
    if (!permiso) {
      const solicitudAprobada = solicitud_actual?.estado === 'aprobado' ? solicitud_actual : null
      return {
        ...failClosed,
        puede_registrar_alumnos: solicitudAprobada?.solicita_alumnos ?? false,
        puede_inscribir_clases: solicitudAprobada?.solicita_clases ?? false,
        solicitud_actual,
      }
    }

    // Mapeo desde arreglo de permisos (prioridad) o booleanos (fallback).
    // Compatibilidad: existen datos históricos con nombres legacy
    // ('registrar_alumnos'/'inscribir_clases') y datos nuevos con scopes
    // ('alumnos:create'/'clases:enroll').
    const permisosArray = permiso.permisos || []
    const solicitudes = permiso.solicitudes || []
    const solicitudAprobada = solicitud_actual?.estado === 'aprobado' ? solicitud_actual : null
    const puedeRegistrarAlumnos =
      permisosArray.includes('alumnos:create') ||
      permisosArray.includes('registrar_alumnos') ||
      (permiso.puede_registrar_alumnos ?? false) ||
      (solicitudAprobada?.solicita_alumnos ?? false)
    const puedeInscribirClases =
      permisosArray.includes('clases:enroll') ||
      permisosArray.includes('inscribir_clases') ||
      permisosArray.includes('clases:create') ||
      (permiso.puede_inscribir_clases ?? false) ||
      (solicitudAprobada?.solicita_clases ?? false)

    return {
      puede_registrar_alumnos: puedeRegistrarAlumnos,
      puede_inscribir_clases: puedeInscribirClases,
      puede_planificar: permisosArray.includes('planificacion:write') || false,
      puede_asistir: permisosArray.includes('asistencias:write') || false,
      solicitudes: solicitudes,
      solicitud_actual: solicitud_actual
    }
  } catch (err) {
    console.warn('[PermisoService] Error obteniendo permisos, fail-closed:', err.message)
    return failClosed
  }
}

/**
 * Obtiene la solicitud actual de un maestro (último estado)
 * @param {string} maestroId
 * @returns {Promise<Object|null>}
 */
export async function obtenerSolicitudActual(maestroId) {
  if (!maestroId) {
    return null
  }

  try {
    const solicitud = await obtenerSolicitudPorMaestro(maestroId)
    return solicitud
  } catch (err) {
    console.warn('[PermisoService] Error obteniendo solicitud actual:', err.message)
    return null
  }
}

/**
 * Envía una solicitud de permiso para un maestro
 * Crea/actualiza una solicitud en solicitudes_permisos table
 * @param {string} maestroId
 * @param {string} permisoKey - 'alumnos:create' o 'clases:enroll'
 * @returns {Promise<Object>}
 */
export async function solicitarPermiso(maestroId, permisoKey) {
  if (!maestroId || !permisoKey) {
    throw new Error('ID de maestro y clave de permiso son requeridos')
  }

  // Mapear clave de permiso a flags de solicitud
  const solicita_alumnos = permisoKey === 'alumnos:create'
  const solicita_clases = permisoKey === 'clases:enroll'

  if (!solicita_alumnos && !solicita_clases) {
    throw new Error('Clave de permiso no reconocida: ' + permisoKey)
  }

  try {
    // Intentar crear la solicitud
    const solicitud = await crearSolicitud(maestroId, solicita_alumnos, solicita_clases)
    return solicitud
  } catch (err) {
    // Si ya existe una solicitud pendiente, obtener la actual
    if (err.message?.includes('solicitud pendiente')) {
      const solicitudActual = await obtenerSolicitudActual(maestroId)
      return solicitudActual || {}
    }
    throw err
  }
}
