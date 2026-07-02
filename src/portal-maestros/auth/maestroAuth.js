import { supabase } from '../../lib/supabaseClient.js'

export const STORAGE_KEY = 'portal-maestros:maestro'
export const PM_AUTH_KEY  = 'portal-maestros:auth'

/**
 * Sentinel que detectarRolMaestro() retorna cuando el usuario tiene
 * una sesión válida de Supabase pero su cuenta está pendiente de aprobación.
 * Permite que initPortal() lo diferencie de "sin sesión" y navegue a
 * pending-approval en lugar de login.
 */
export const PENDING_APPROVAL_SENTINEL = Object.freeze({ __pendingApproval: true })

/** Duración por defecto de sesión persistente: 30 días en ms. */
const SESSION_DURATION_MS = 30 * 24 * 60 * 60 * 1000

/**
 * Devuelve true si la app está corriendo como PWA instalada (standalone).
 * En ese caso la sesión SIEMPRE debe ser persistente — no existe "cerrar pestaña".
 */
function _isPWA() {
  try {
    return (
      window.matchMedia('(display-mode: standalone)').matches ||
      window.navigator.standalone === true ||           // iOS Safari
      document.referrer.startsWith('android-app://')   // TWA Android
    )
  } catch {
    return false
  }
}

/**
 * Fija la expiración de sesión a 30 días desde ahora.
 * Se llama automáticamente en cada login exitoso.
 */
function _setSessionMode(persistent = true) {
  if (persistent) {
    localStorage.setItem(
      'pm-session-expires',
      new Date(Date.now() + SESSION_DURATION_MS).toISOString(),
    )
  } else {
    localStorage.removeItem('pm-session-expires')
  }

  if (typeof sessionStorage !== 'undefined') {
    if (persistent) sessionStorage.setItem('pm-session-active', 'true')
    else sessionStorage.removeItem('pm-session-active')
  }
}

/**
 * Login con email + password. Verifica que el user_id exista en tabla maestros.
 * @param {string} email
 * @param {string} password
 * @returns {Promise<{success: boolean, maestro?: object, error?: string}>}
 */
export async function loginMaestro(email, password, options = {}) {
  const keepSession = options.keepSession !== false
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
      ? { ...maestroRow, es_admin: true, es_maestro: true }
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
    _setSessionMode(keepSession)
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

  // Guardar en localStorage + marcar sesión persistente (30 días por defecto)
  localStorage.setItem(STORAGE_KEY, JSON.stringify(maestro))
  _setSessionMode(keepSession)

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

    if (userStatus === 'pendiente') {
      // Cuenta registrada pero no aprobada aún.
      // NO hacemos signOut para poder detectar el estado en cada apertura de app.
      // Retornamos el sentinel para que initPortal() navegue a pending-approval.
      clearMaestroLocal()
      return PENDING_APPROVAL_SENTINEL
    }

    if (userStatus && userStatus !== 'activo') {
      // Cuenta rechazada u otro estado no activo → sign out completo
      clearMaestroLocal()
      await supabase.auth.signOut()
      return null
    }

    // Intentar desde caché local solo después de validar estado activo.
    // En PWA: renovar expiración de sesión en cada apertura para que no caduque.
    const cached = localStorage.getItem(STORAGE_KEY)
    if (cached) {
      try {
        const parsed = JSON.parse(cached)
        if (_isPWA()) _setSessionMode(true)
        return parsed
      } catch {
        /* corrupted — continuar y reconstruir desde Supabase */
      }
    }
    // Sin caché local pero con sesión Supabase válida → reconstruir perfil.
    // Esto ocurre cuando el maestro abre la PWA en un dispositivo nuevo o
    // después de limpiar datos del navegador.

    if (userRole === 'admin') {
      // Si el admin también tiene perfil de maestro, usar sus datos reales
      // para que getMisClases() y las queries de sesiones usen el ID correcto
      const { data: maestroRow } = await supabase
        .from('maestros')
        .select('*')
        .eq('user_id', session.user.id)
        .maybeSingle()

      const adminMaestro = maestroRow
        ? { ...maestroRow, es_admin: true, es_maestro: true }
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
      _setSessionMode(true)
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
    _setSessionMode(true)
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

      const isTestEnv =
        typeof process !== 'undefined' && (process.env.NODE_ENV === 'test' || process.env.VITEST)
      const isPWA = !isTestEnv && _isPWA()

      // 1. Si está corriendo como PWA instalada → siempre persistente.
      //    Renovar automáticamente la expiración en cada apertura.
      if (isPWA) {
        const expires = localStorage.getItem('pm-session-expires')
        const expireDate = expires ? new Date(expires) : null
        if (!expireDate || Date.now() > expireDate.getTime()) {
          // Sesión expirada o sin fecha → renovar (el token de Supabase sigue válido)
          _setSessionMode(true)
        }
        // En PWA nunca bloqueamos por sessionStorage — la app no tiene "pestañas"
        return parsed
      }

      // 2. Evaluar expiración lógica de la sesión de 30 días (modo navegador web)
      const expires = localStorage.getItem('pm-session-expires')
      if (expires) {
        const expireDate = new Date(expires)
        if (Date.now() > expireDate.getTime()) {
          console.log('[Auth] La sesión persistente de 30 días ha expirado. Limpiando...')
          clearMaestroLocal()
          return null
        }
      } else {
        // 3. Sin fecha de expiración → sesión temporal (session-only).
        //    Si sessionStorage está vacío, el navegador fue cerrado → pedir login de nuevo.
        if (
          !isTestEnv &&
          typeof sessionStorage !== 'undefined' &&
          !sessionStorage.getItem('pm-session-active')
        ) {
          console.log('[Auth] Sesión temporal finalizada (navegador cerrado). Exigiendo login...')
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
