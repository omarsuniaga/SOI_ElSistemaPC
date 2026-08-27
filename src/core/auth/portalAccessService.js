/**
 * @fileoverview Servicio unificado de control de acceso a portales y permisos dinámicos.
 * @module core/auth/portalAccessService
 */

import { supabase } from '../../lib/supabaseClient.js'

/**
 * Catálogo estático de respaldo en caso de que la red falle.
 */
export const DEFAULT_PORTAL_CATALOG = [
  { portal_id: 'SUPERADMIN', nombre: 'SuperAdmin Master', ruta: '/admin.html', roles_default: ['superadmin'], icono: 'bi-shield-lock-fill' },
  { portal_id: 'ADM', nombre: 'Portal Administración', ruta: '/adm.html', roles_default: ['superadmin', 'admin', 'coordinacion_academica'], icono: 'bi-briefcase-fill' },
  { portal_id: 'ACM', nombre: 'Portal Académico', ruta: '/acm.html', roles_default: ['superadmin', 'admin', 'direccion', 'coordinacion_academica'], icono: 'bi-mortarboard-fill' },
  { portal_id: 'FIN', nombre: 'Portal Finanzas SOI', ruta: '/soi-finanzas.html', roles_default: ['superadmin', 'admin', 'finanzas'], icono: 'bi-cash-coin' },
  { portal_id: 'CAL', nombre: 'Portal Calendario', ruta: '/calendario.html', roles_default: ['superadmin', 'admin', 'direccion', 'coordinacion_academica', 'maestro', 'monitor', 'operaciones'], icono: 'bi-calendar3' },
  { portal_id: 'MAE', nombre: 'Portal Docente', ruta: '/index.html', roles_default: ['superadmin', 'admin', 'maestro', 'monitor'], icono: 'bi-person-video3' },
  { portal_id: 'COM', nombre: 'Portal Comunicaciones', ruta: '/com.html', roles_default: ['superadmin', 'admin', 'direccion', 'coordinacion_academica'], icono: 'bi-megaphone-fill' },
  { portal_id: 'TEC', nombre: 'Portal Técnico', ruta: '/tecnico.html', roles_default: ['superadmin', 'admin', 'operaciones'], icono: 'bi-wrench-adjustable' },
  { portal_id: 'LUT', nombre: 'Portal Lutería', ruta: '/luteria.html', roles_default: ['superadmin', 'admin', 'operaciones'], icono: 'bi-music-note-beamed' },
  { portal_id: 'SIM', nombre: 'Portal Simulador', ruta: '/simulador.html', roles_default: ['superadmin', 'admin'], icono: 'bi-sliders' },
  { portal_id: 'AUD', nombre: 'Portal Audiciones', ruta: '/audiciones.html', roles_default: ['superadmin', 'admin', 'jurado', 'direccion'], icono: 'bi-award-fill' }
]

/**
 * Obtiene el catálogo completo de portales activos.
 * @returns {Promise<Array>}
 */
export async function getPortalCatalog() {
  if (!supabase) return DEFAULT_PORTAL_CATALOG

  try {
    const { data, error } = await supabase
      .from('portal_catalog')
      .select('*')
      .eq('is_active', true)
      .order('orden', { ascending: true })

    if (error || !data || data.length === 0) {
      console.warn('⚠️ No se pudo cargar portal_catalog desde BD, usando fallback:', error?.message)
      return DEFAULT_PORTAL_CATALOG
    }
    return data
  } catch (err) {
    console.error('Error al consultar portal_catalog:', err)
    return DEFAULT_PORTAL_CATALOG
  }
}

/**
 * Obtiene los portales a los que el usuario tiene acceso (asignados o por rol).
 * @param {string} [userId]
 * @returns {Promise<Array>}
 */
export async function getAuthorizedPortales(userId) {
  if (!supabase) return DEFAULT_PORTAL_CATALOG

  try {
    const { data, error } = await supabase.rpc('get_user_portales', {
      p_user_id: userId || null
    })

    if (error) {
      console.warn('⚠️ RPC get_user_portales falló, evaluando fallback en cliente:', error.message)
      return await getFallbackAuthorizedPortales(userId)
    }

    return Array.isArray(data) ? data : []
  } catch (err) {
    console.error('Error ejecutando get_user_portales:', err)
    return await getFallbackAuthorizedPortales(userId)
  }
}

/**
 * Fallback seguro en caso de desconexión RPC.
 */
async function getFallbackAuthorizedPortales(userId) {
  if (!supabase || !userId) return DEFAULT_PORTAL_CATALOG

  try {
    const { data: profile } = await supabase
      .from('profiles')
      .select('rol')
      .eq('id', userId)
      .maybeSingle()

    const rol = profile?.rol || 'user'
    if (rol === 'superadmin') return DEFAULT_PORTAL_CATALOG

    // Consultar asignaciones explícitas en user_portal_access
    const { data: accessData } = await supabase
      .from('user_portal_access')
      .select('portal_id')
      .eq('user_id', userId)

    const assignedIds = new Set((accessData || []).map(a => a.portal_id.toUpperCase()))
    const catalog = await getPortalCatalog()

    return catalog.filter(p => 
      assignedIds.has(p.portal_id.toUpperCase()) || 
      (p.roles_default && p.roles_default.includes(rol))
    )
  } catch (err) {
    console.error('Error en fallback de portales:', err)
    return []
  }
}

/**
 * Verifica si el usuario actual o proporcionado tiene acceso a un portal específico.
 * @param {string} portalId
 * @param {Object} [options]
 * @param {string} [options.userId]
 * @param {string} [options.role]
 * @returns {Promise<boolean>}
 */
export async function checkPortalAccess(portalId, options = {}) {
  const normId = (portalId || '').toUpperCase().trim()
  if (!normId) return false

  if (options.role === 'superadmin') return true

  if (supabase) {
    try {
      const { data, error } = await supabase.rpc('has_portal_access', {
        p_portal_id: normId,
        p_user_id: options.userId || null
      })

      if (!error && typeof data === 'boolean') {
        return data
      }
    } catch (err) {
      console.warn('has_portal_access RPC falló, usando validación local:', err)
    }
  }

  // Fallback local
  const portales = await getAuthorizedPortales(options.userId)
  return portales.some(p => p.portal_id.toUpperCase() === normId)
}

/**
 * Asigna los portales habilitados para un usuario (Requiere rol Admin o SuperAdmin).
 * @param {string} userId
 * @param {Array<string>} portalIds
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export async function setUserPortales(userId, portalIds) {
  if (!supabase || !userId) {
    return { success: false, error: 'Cliente no disponible o userId inválido' }
  }

  try {
    const { data, error } = await supabase.rpc('set_user_portales', {
      p_user_id: userId,
      p_portal_ids: portalIds
    })

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true, data }
  } catch (err) {
    return { success: false, error: err.message }
  }
}

/**
 * Obtiene solo los IDs de portales explícitamente asignados en BD a un usuario.
 * @param {string} userId
 * @returns {Promise<Array<string>>}
 */
export async function getAssignedPortalIds(userId) {
  if (!supabase || !userId) return []

  try {
    const { data, error } = await supabase
      .from('user_portal_access')
      .select('portal_id')
      .eq('user_id', userId)

    if (error || !data) return []
    return data.map(d => d.portal_id)
  } catch (err) {
    console.error('Error al consultar user_portal_access:', err)
    return []
  }
}
