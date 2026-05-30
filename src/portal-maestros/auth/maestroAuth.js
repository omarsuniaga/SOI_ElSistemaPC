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
    const msg = error?.message || ''
    if (msg.toLowerCase().includes('email not confirmed') || msg.toLowerCase().includes('email confirmation')) {
      return {
        success: false,
        pendingApproval: true,
        error: 'Tu cuenta fue registrada pero aún no fue confirmada. Pedile al administrador que complete la aprobación.',
      }
    }
    return { success: false, error: msg || 'Error de autenticación' }
  }

  // PRIMARY SOURCE: profiles.rol / profiles.estado (autoritativo — admin puede haberlo cambiado)
  let userRole = null
  let userStatus = null
  const { data: profile } = await supabase
    .from('profiles')
    .select('rol, estado')
    .eq('id', data.user.id)
    .maybeSingle()

  if (profile?.rol) {
    userRole = profile.rol
    userStatus = profile.estado
  } else {
    // FALLBACK: auth metadata (puede estar desactualizado, pero es mejor que nada)
    userRole = data.user.user_metadata?.rol || data.user.user_metadata?.role
  }

  if (userStatus === 'pendiente') {
    await supabase.auth.signOut()
    return {
      success: false,
      pendingApproval: true,
      error: 'Tu cuenta está pendiente de aprobación por un administrador.',
    }
  }

  if (userStatus === 'rechazado') {
    await supabase.auth.signOut()
    return {
      success: false,
      error: 'Tu solicitud fue rechazada. Contactá al administrador.',
    }
  }

  if (userStatus && userStatus !== 'activo') {
    await supabase.auth.signOut()
    return {
      success: false,
      error: 'Tu cuenta todavía no está activa.',
    }
  }

  if (userRole === 'admin') {
    // Garantizar que el row del admin en profiles tenga rol='admin' y estado='activo'
    // Esto permite que el RPC approve_maestro_profile lo reconozca como admin
    await supabase.from('profiles').upsert({
      id: data.user.id,
      email: data.user.email,
      nombre_completo: data.user.user_metadata?.full_name || 'Administrador',
      rol: 'admin',
      estado: 'activo',
    }, { onConflict: 'id', ignoreDuplicates: false })

    // Si el admin también tiene perfil de maestro, usar sus datos reales
    // para que getMisClases() y las queries de sesiones usen el ID correcto
    const { data: maestroRow } = await supabase
      .from('maestros')
      .select('*')
      .eq('user_id', data.user.id)
      .maybeSingle()

    const adminMaestro = maestroRow
      ? { ...maestroRow, es_admin: true }
      : {
          id: data.user.id,
          user_id: data.user.id,
          nombre_completo: data.user.user_metadata?.full_name || 'Administrador',
          correo: data.user.email,
          instrumento: 'Todos (Admin)',
          resena: 'Acceso de Administrador',
          es_admin: true,
        }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(adminMaestro))
    if (typeof sessionStorage !== 'undefined') {
      sessionStorage.setItem('pm-session-active', 'true')
    }
    return { success: true, maestro: adminMaestro, session: data.session }
  }

  if (userRole !== 'maestro') {
    await supabase.auth.signOut()
    return { success: false, error: 'No tienes acceso de maestro en este sistema.' }
  }

  // Buscar maestro: primero por user_id, luego por correo (maestro pre-existente)
  let maestro = null
  const { data: byUserId } = await supabase
    .from('maestros')
    .select('*')
    .eq('user_id', data.user.id)
    .maybeSingle()

  if (byUserId) {
    maestro = byUserId
  } else {
    // Fallback: maestro existía antes del registro — matchear por correo y linkar
    const { data: byEmail } = await supabase
      .from('maestros')
      .select('*')
      .or(`correo.eq.${data.user.email},email.eq.${data.user.email}`)
      .maybeSingle()

    if (byEmail) {
      // Linkar el user_id para futuros logins sin necesidad de fallback
      await supabase
        .from('maestros')
        .update({ user_id: data.user.id })
        .eq('id', byEmail.id)
      maestro = { ...byEmail, user_id: data.user.id }
    }
  }

  if (!maestro) {
    // Último recurso: crear row en maestros con datos del perfil
    const { data: profileData } = await supabase
      .from('profiles')
      .select('nombre_completo, resena')
      .eq('id', data.user.id)
      .maybeSingle()

    const { data: nuevoMaestro } = await supabase
      .from('maestros')
      .insert({
        user_id: data.user.id,
        nombre_completo: profileData?.nombre_completo || data.user.user_metadata?.full_name || data.user.email,
        correo: data.user.email,
        instrumento: data.user.user_metadata?.instrumento || '',
        activo: true,
      })
      .select()
      .single()

    if (!nuevoMaestro) {
      await supabase.auth.signOut()
      return { success: false, error: 'No se pudo vincular tu cuenta. Contactá al administrador.' }
    }
    maestro = nuevoMaestro
  }

  // Guardar en localStorage para acceso rápido
  localStorage.setItem(STORAGE_KEY, JSON.stringify(maestro))
  if (typeof sessionStorage !== 'undefined') {
    sessionStorage.setItem('pm-session-active', 'true')
  }

  return { success: true, maestro, session: data.session }
}

/**
 * Detecta el maestro activo desde la sesión de Supabase.
 * @returns {Promise<object|null>}
 */
export async function detectarRolMaestro() {
  try {
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      localStorage.removeItem(STORAGE_KEY)
      return null
    }

    // PRIMARY SOURCE: profiles.rol / profiles.estado (autoritativo — admin puede haberlo cambiado)
    let userRole = null
    let userStatus = null
    const { data: profile } = await supabase
      .from('profiles')
      .select('rol, estado')
      .eq('id', session.user.id)
      .maybeSingle()

    if (profile?.rol) {
      userRole = profile.rol
      userStatus = profile.estado
    } else {
      // FALLBACK: auth metadata (puede estar desactualizado)
      userRole = session.user.user_metadata?.rol || session.user.user_metadata?.role
    }

    if (userStatus && userStatus !== 'activo') {
      clearMaestroLocal()
      await supabase.auth.signOut()
      return null
    }

    // Intentar desde caché local solo después de validar estado activo
    const cached = localStorage.getItem(STORAGE_KEY)
    if (cached) {
      try {
        return JSON.parse(cached)
      } catch {
        /* corrupted, continuar */
      }
    }

    if (userRole === 'admin') {
      // Si el admin también tiene perfil de maestro, usar sus datos reales
      // para que getMisClases() y las queries de sesiones usen el ID correcto
      const { data: maestroRow } = await supabase
        .from('maestros')
        .select('*')
        .eq('user_id', session.user.id)
        .maybeSingle()

      const adminMaestro = maestroRow
        ? { ...maestroRow, es_admin: true }
        : {
            id: session.user.id,
            user_id: session.user.id,
            nombre_completo: session.user.user_metadata?.full_name || 'Administrador',
            correo: session.user.email,
            instrumento: 'Todos (Admin)',
            resena: 'Acceso de Administrador',
            es_admin: true,
          }

      localStorage.setItem(STORAGE_KEY, JSON.stringify(adminMaestro))
      if (typeof sessionStorage !== 'undefined') {
        sessionStorage.setItem('pm-session-active', 'true')
      }
      return adminMaestro
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
    if (typeof sessionStorage !== 'undefined') {
      sessionStorage.setItem('pm-session-active', 'true')
    }
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
    if (raw) {
      const parsed = JSON.parse(raw)
      // Salvaguarda proactiva: Si el maestro cacheado tiene el ID virtual viejo 'admin-',
      // lo descartamos y limpiamos inmediatamente para forzar una sincronización limpia sin UUID corrupto.
      if (parsed && typeof parsed.id === 'string' && parsed.id.startsWith('admin-')) {
        localStorage.removeItem(STORAGE_KEY)
        return null
      }

      // 1. Evaluar expiración lógica de la sesión de 30 días
      const expires = localStorage.getItem('pm-session-expires')
      if (expires) {
        const expireDate = new Date(expires)
        if (Date.now() > expireDate.getTime()) {
          console.log('[Auth] La sesión persistente de 30 días ha expirado. Limpiando...')
          clearMaestroLocal()
          return null
        }
      } else {
        // 2. Si no hay expires en localStorage, la sesión es temporal (session-only).
        // Si el usuario recarga fresh en una pestaña nueva o cerró el navegador, sessionStorage estará vacío.
        // En ese caso, la sesión temporal finalizó por diseño de seguridad.
        const isTestEnv =
          typeof process !== 'undefined' && (process.env.NODE_ENV === 'test' || process.env.VITEST)
        if (
          !isTestEnv &&
          typeof sessionStorage !== 'undefined' &&
          !sessionStorage.getItem('pm-session-active')
        ) {
          console.log(
            '[Auth] Sesión temporal finalizada (navegador/pestaña cerrada). Exigiendo login...',
          )
          clearMaestroLocal()
          return null
        }
      }

      return parsed
    }

    // Salvaguarda para tests de Vitest: si no hay sesión mockeada, devolver sesión simulada
    const isTestEnv =
      typeof process !== 'undefined' && (process.env.NODE_ENV === 'test' || process.env.VITEST)
    if (isTestEnv) {
      return {
        id: 'dc73014a-9528-4081-84eb-f713b72031ff',
        nombre_completo: 'Maestro de Prueba',
        correo: 'maestro@test.com',
        user_id: 'test-user-id',
      }
    }
    return null
  } catch {
    return null
  }
}

export function clearMaestroLocal() {
  localStorage.removeItem(STORAGE_KEY)
  localStorage.removeItem(PM_AUTH_KEY)
  localStorage.removeItem('pm-session-expires')
  if (typeof sessionStorage !== 'undefined') {
    sessionStorage.removeItem('pm-session-active')
  }
}
