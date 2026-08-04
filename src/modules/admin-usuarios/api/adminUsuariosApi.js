/**
 * @fileoverview API para gestión de usuarios por parte de administración.
 * La creación corre en la Edge Function `create-user` (service role) para no
 * afectar la sesión del admin que la invoca.
 */

import { supabase } from '../../../lib/supabaseClient.js'

export const ROLES_USUARIO = [
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
  'user',
]

/**
 * Crea un usuario vía Edge Function.
 * @param {{nombre:string, email:string, password:string, rol:string}} payload
 * @returns {Promise<{id:string, email:string, rol:string, estado:string}>}
 */
export async function crearUsuario({ nombre, email, password, rol } = {}) {
  if (!nombre || !email || !password) {
    throw new Error('Nombre, email y contraseña son obligatorios')
  }

  if (!ROLES_USUARIO.includes(rol)) {
    throw new Error(`Rol inválido. Debe ser uno de: ${ROLES_USUARIO.join(', ')}`)
  }

  const { data, error } = await supabase.functions.invoke('create-user', {
    body: { nombre, email, password, rol },
  })

  if (error) {
    throw new Error(error.message || 'Error al crear el usuario')
  }
  if (data?.error) {
    throw new Error(data.error)
  }
  if (!data?.ok || !data?.user) {
    throw new Error('Respuesta inesperada del servidor')
  }

  return data.user
}

/**
 * Lista usuarios de profiles. Permite filtrar opcionalmente por rol.
 * @param {{rol?: string}} [options]
 * @returns {Promise<Array<{id:string, email:string, nombre_completo:string, rol:string, estado:string}>>}
 */
export async function listarUsuarios(options = {}) {
  const { rol } = options

  let query = supabase
    .from('profiles')
    .select('id, email, nombre_completo, rol, estado, created_at')
    .order('created_at', { ascending: false })

  if (rol) {
    query = query.eq('rol', rol)
  }

  const { data, error } = await query

  if (error) {
    throw new Error(error.message || 'Error al listar usuarios')
  }

  return data || []
}

/**
 * Lista usuarios de profiles filtrando por rol.
 * @param {string} rol
 * @returns {Promise<Array<{id:string, email:string, nombre_completo:string, rol:string, estado:string}>>}
 */
export async function listarUsuariosPorRol(rol) {
  return listarUsuarios({ rol })
}
