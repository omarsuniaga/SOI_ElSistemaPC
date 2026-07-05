import {
  login as authLogin,
  register as authRegister,
  logout as authLogout,
  isAuthenticated as authIsAuthenticated,
  getUser as authGetUser,
} from '../../../core/auth/authManager.js'
import { getSession, clearSession, saveSession } from '../../../core/auth/sessionStorage.js'
import { supabase } from '../../../lib/supabaseClient.js'

const state = {
  user: null,
  session: null,
  loading: true,
  error: null,
  listeners: [],
}

function notifyListeners() {
  state.listeners.forEach((callback) => callback(state))
}

export function subscribe(callback) {
  state.listeners.push(callback)
  return () => {
    state.listeners = state.listeners.filter((cb) => cb !== callback)
  }
}

import { config } from '../../../core/config/config.js'

async function login(email, password, remember = false) {
  state.loading = true
  state.error = null
  notifyListeners()

  // MODO DEMO: Login especial que no requiere Supabase
  if (email === 'demo@soi.com' && password === 'demo123') {
    const mockUser = {
      id: 'demo-user-id',
      email: 'demo@soi.com',
      user_metadata: { full_name: 'Usuario Demo' },
      role: 'admin',
    }
    const mockSession = { user: mockUser, access_token: 'demo-token' }

    // Activar modo demo persistente
    localStorage.setItem('demo_mode', 'true')
    // Forzar recarga de config (ya que es un objeto estático)
    config.isDemoMode = true

    saveSession(mockSession, remember)

    state.user = mockUser
    state.session = mockSession
    state.loading = false
    notifyListeners()
    return { success: true, user: mockUser, session: mockSession }
  }

  try {
    const result = await authLogin(email, password, remember)

    // Validar respuesta
    const hasError = result?.error && (result.error.message || result.error)
    const hasUser = result?.user && !hasError

    state.user = hasUser ? result.user : null
    state.session = hasUser ? result.session : null
    state.loading = false
    notifyListeners()

    if (hasError) {
      const errorMsg =
        typeof hasError === 'string' ? hasError : hasError.message || 'Error desconocido'
      return { success: false, error: errorMsg }
    }

    if (hasUser) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('rol, estado')
        .eq('id', result.user.id)
        .maybeSingle()

      if (profile?.estado === 'pendiente') {
        await supabase.auth.signOut()
        clearSession()
        state.user = null
        state.session = null
        notifyListeners()
        return { success: true, pendingApproval: true }
      }
      if (profile?.estado === 'rechazado') {
        await supabase.auth.signOut()
        clearSession()
        state.user = null
        state.session = null
        notifyListeners()
        return { success: true, rejected: true }
      }

      // Guarda de rol: el portal admin es exclusivo de administradores.
      // Un maestro (u otro rol) debe usar su propio portal.
      if (profile?.rol !== 'admin') {
        await supabase.auth.signOut()
        clearSession()
        state.user = null
        state.session = null
        notifyListeners()
        return {
          success: false,
          error: 'Esta cuenta no tiene acceso al portal de administración. Usá el portal de maestros.',
        }
      }
    }

    return { success: hasUser, user: state.user, session: state.session }
  } catch (error) {
    state.loading = false
    state.error = error.message
    notifyListeners()
    return { success: false, error: error.message }
  }
}

async function register(email, password, userData) {
  state.loading = true
  state.error = null
  notifyListeners()

  try {
    const result = await authRegister(email, password, userData)
    state.user = result.user
    state.session = result.session
    state.loading = false
    notifyListeners()

    const hasUser = !result.error && !!result.user
    const needsConfirmation = hasUser && !result.session

    return {
      ...result,
      success: hasUser,
      needsConfirmation,
      message: needsConfirmation
        ? 'Registro exitoso. Tu cuenta está pendiente de aprobación por un administrador.'
        : undefined,
    }
  } catch (error) {
    state.loading = false
    state.error = error.message
    notifyListeners()
    return { success: false, error: error.message }
  }
}

function logout() {
  authLogout()
  localStorage.removeItem('demo_mode')
  config.isDemoMode = false
  state.user = null
  state.session = null
  state.error = null
  notifyListeners()
}

function getUser() {
  return authGetUser()
}

function isAuthenticated() {
  // Si el state ya tiene user (cargado por refreshAuth), es confiable
  if (state.user) return true
  // Fallback al custom storage
  return authIsAuthenticated()
}

async function refreshAuth() {
  // Supabase ya persiste su propia sesión en localStorage.
  // La usamos directamente como fuente de verdad.
  const {
    data: { session },
    error,
  } = await supabase.auth.getSession()

  if (error || !session) {
    clearSession()
    state.user = null
    state.session = null
    state.loading = false
    notifyListeners()
    return { authenticated: false }
  }

  // Sincronizar custom storage para que isAuthenticated() siga funcionando
  const persistent = getSession()?.persistent ?? true
  saveSession(session, persistent)

  state.session = session
  state.user = session.user
  state.loading = false
  notifyListeners()
  return { authenticated: true, user: state.user }
}

refreshAuth()

export const useAuth = {
  subscribe,
  login,
  register,
  logout,
  getUser,
  isAuthenticated,
  notifyListeners,
  refreshAuth,
  getState: () => ({ ...state }),
}
