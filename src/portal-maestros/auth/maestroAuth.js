import { supabase } from '../../lib/supabaseClient.js'

export const STORAGE_KEY = 'portal-maestros:maestro'
export const PM_AUTH_KEY = 'portal-maestros:auth'

/**
 * Login con email + password. Verifica que el user_id exista en tabla maestros.
 * @param {string} email
 * @param {string} password
 * @returns {Promise<{success: boolean, maestro?: object, error?: string}>}
 */
export async function loginMaestro(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })

  if (error || !data.user) {
    return { success: false, error: error?.message || 'Error de autenticación' }
  }

  // Verificar que el usuario tiene rol de maestro
  const { data: maestro, error: errMaestro } = await supabase
    .from('maestros')
    .select('*')
    .eq('user_id', data.user.id)
    .single()

  if (errMaestro || !maestro) {
    await supabase.auth.signOut()
    return { success: false, error: 'No tenés acceso de maestro en este sistema.' }
  }

  // Guardar en localStorage para acceso rápido
  localStorage.setItem(STORAGE_KEY, JSON.stringify(maestro))

  return { success: true, maestro, session: data.session }
}

/**
 * Detecta el maestro activo desde la sesión de Supabase.
 * @returns {Promise<object|null>}
 */
export async function detectarRolMaestro() {
  try {
    const { data: { session } } = await supabase.auth.getSession()

    if (!session) {
      localStorage.removeItem(STORAGE_KEY)
      return null
    }

    // Intentar desde caché local primero
    const cached = localStorage.getItem(STORAGE_KEY)
    if (cached) {
      try { return JSON.parse(cached) } catch { /* corrupted, continuar */ }
    }

    // Buscar en Supabase
    const { data: maestro, error } = await supabase
      .from('maestros')
      .select('*')
      .eq('user_id', session.user.id)
      .single()

    if (error || !maestro) {
      localStorage.removeItem(STORAGE_KEY)
      return null
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(maestro))
    return maestro
  } catch (err) {
    console.error('[Auth] Error in detectarRolMaestro:', err.message)
    return null
  }
}

/**
 * Cierra sesión del portal maestros.
 */
export async function logoutPortal() {
  localStorage.removeItem(STORAGE_KEY)
  await supabase.auth.signOut()
}

/**
 * Devuelve el maestro cacheado en localStorage (sync, sin await).
 * @returns {object|null}
 */
export function getMaestroLocal() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export function clearMaestroLocal() {
  localStorage.removeItem(STORAGE_KEY)
  localStorage.removeItem(PM_AUTH_KEY)
}
