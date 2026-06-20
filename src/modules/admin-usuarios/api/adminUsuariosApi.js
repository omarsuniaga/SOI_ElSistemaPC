/**
 * @fileoverview API para gestión de usuarios por parte de un administrador.
 * La creación corre en la Edge Function `create-user` (service role) para no
 * afectar la sesión del admin que la invoca.
 * @module modules/admin-usuarios/api/adminUsuariosApi
 */

import { supabase } from '../../../lib/supabaseClient.js'

/**
 * Crea un usuario (admin o maestro) vía Edge Function.
 * @param {{nombre:string, email:string, password:string, rol:'admin'|'maestro'}} payload
 * @returns {Promise<{id:string, email:string, rol:string, estado:string}>}
 */
export async function crearUsuario({ nombre, email, password, rol } = {}) {
  if (!nombre || !email || !password) {
    throw new Error('Nombre, email y contraseña son obligatorios')
  }
  if (rol !== 'admin' && rol !== 'maestro') {
    throw new Error("El rol debe ser 'admin' o 'maestro'")
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
 * Lista usuarios de profiles filtrando por rol.
 * @param {'admin'|'maestro'} rol
 * @returns {Promise<Array<{id:string, email:string, nombre_completo:string, estado:string}>>}
 */
export async function listarUsuariosPorRol(rol) {
  const { data, error } = await supabase
    .from('profiles')
    .select('id, email, nombre_completo, estado, created_at')
    .eq('rol', rol)
    .order('created_at', { ascending: false })

  if (error) {
    throw new Error(error.message || 'Error al listar usuarios')
  }
  return data || []
}
