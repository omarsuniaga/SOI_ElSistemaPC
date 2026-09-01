/**
 * @fileoverview API para gestión de usuarios por parte de administración.
 * La creación corre en la Edge Function `create-user` (service role) para no
 * afectar la sesión del admin que la invoca.
 */

import { supabase } from '../../../lib/supabaseClient.js'
import {
  getPortalCatalog,
  getAuthorizedPortales,
  setUserPortales,
  getAssignedPortalIds
} from '../../../core/auth/portalAccessService.js'

export let ROLES_USUARIO = []

/**
 * Carga los roles disponibles desde Supabase system_config
 */
export async function cargarRolesSistema() {
  const { data, error } = await supabase
    .from('system_config')
    .select('value')
    .eq('key', 'available_roles')
    .single()
    
  if (!error && data?.value) {
    try {
      ROLES_USUARIO = JSON.parse(data.value)
    } catch (e) {
      console.warn('Error parsing available_roles from system_config', e)
    }
  }
  
  if (ROLES_USUARIO.length === 0) {
    // Fallback in case of config missing
    ROLES_USUARIO = [
      'superadmin',
      'admin',
      'direccion',
      'coordinacion_academica',
      'maestro',
      'monitor',
      'finanzas',
      'operaciones',
      'representante',
      'alumno',
      'jurado',
      'user'
    ]
  }
  return ROLES_USUARIO
}

/**
 * Crea un usuario vía Edge Function y opcionalmente asigna portales.
 * @param {{nombre:string, email:string, password:string, rol:string, portales?:string[]}} payload
 * @returns {Promise<{id:string, email:string, rol:string, estado:string}>}
 */
export async function crearUsuario({ nombre, email, password, rol, portales = [] } = {}) {
  if (!nombre || !email || !password) {
    throw new Error('Nombre, email y contraseña son obligatorios')
  }

  if (ROLES_USUARIO.length > 0 && !ROLES_USUARIO.includes(rol)) {
    throw new Error(`Rol inválido. Debe ser uno de: ${ROLES_USUARIO.join(', ')}`)
  }

  const { data, error } = await supabase.functions.invoke('create-user', {
    body: { nombre, email, password, rol },
  })

  if (error) {
    // FunctionsHttpError trae solo un mensaje genérico ("Edge Function
    // returned a non-2xx status code"); el motivo real viene en el body de
    // error.context (la Response de la función). Sin esto, cualquier 400/403
    // del servidor se mostraba como un error opaco e inútil.
    let detalle = ''
    try {
      const body = await error.context?.json()
      detalle = body?.error || ''
    } catch (_) { /* context no era JSON o ya se consumió */ }
    throw new Error(detalle || error.message || 'Error al crear el usuario')
  }
  if (data?.error) {
    throw new Error(data.error)
  }
  if (!data?.ok || !data?.user) {
    throw new Error('Respuesta inesperada del servidor')
  }

  const user = data.user
  let portalesResult = null

  // Si se seleccionaron portales específicos, asignarlos
  if (Array.isArray(portales) && portales.length > 0 && user.id) {
    try {
      portalesResult = await setUserPortales(user.id, portales)
    } catch (assignErr) {
      console.warn('Usuario creado pero hubo un error asignando portales iniciales:', assignErr)
      portalesResult = { success: false, error: assignErr.message }
    }
  }

  return {
    ...user,
    portalesResult
  }
}

/**
 * Lista usuarios de profiles con información de portales asignados.
 * @param {{rol?: string}} [options]
 * @returns {Promise<Array<{id:string, email:string, nombre_completo:string, rol:string, estado:string, portales_asignados?:string[]}>>}
 */
export async function listarUsuarios(options = {}) {
  const { rol } = options

  let query = supabase
    .from('profiles')
    .select(`
      id, 
      email, 
      nombre_completo, 
      rol, 
      estado, 
      created_at,
      user_portal_access!user_id ( portal_id )
    `)
    .order('created_at', { ascending: false })

  if (rol) {
    query = query.eq('rol', rol)
  }

  const { data, error } = await query

  if (error) {
    throw new Error(error.message || 'Error al listar usuarios')
  }

  return (data || []).map(u => ({
    ...u,
    portales_asignados: (u.user_portal_access || []).map(p => p.portal_id)
  }))
}

/**
 * Actualiza el rol asignado a un usuario en profiles.
 * @param {string} userId
 * @param {string} rol
 * @returns {Promise<Object>}
 */
export async function actualizarRolUsuario(userId, rol) {
  if (!userId || !rol) throw new Error('ID de usuario y rol son requeridos')
  const { data, error } = await supabase
    .from('profiles')
    .update({ rol })
    .eq('id', userId)
    .select('id, email, rol, estado')
    .single()

  if (error) throw new Error(error.message || 'Error al actualizar rol del usuario')
  return data
}

/**
 * Actualiza el estado (activo/inactivo/suspendido) de un usuario en profiles.
 * @param {string} userId
 * @param {string} estado
 * @returns {Promise<Object>}
 */
export async function actualizarEstadoUsuario(userId, estado) {
  if (!userId || !estado) throw new Error('ID de usuario y estado son requeridos')
  const { data, error } = await supabase
    .from('profiles')
    .update({ estado })
    .eq('id', userId)
    .select('id, email, rol, estado')
    .single()

  if (error) throw new Error(error.message || 'Error al actualizar estado del usuario')
  return data
}

/**
 * Lista usuarios de profiles filtrando por rol.
 * @param {string} rol
 * @returns {Promise<Array<{id:string, email:string, nombre_completo:string, rol:string, estado:string}>>}
 */
export async function listarUsuariosPorRol(rol) {
  return listarUsuarios({ rol })
}

export {
  getPortalCatalog,
  getAuthorizedPortales,
  setUserPortales,
  getAssignedPortalIds
}
