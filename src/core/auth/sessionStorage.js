/**
 * @fileoverview Session storage utilities for persisting auth session
 * @module core/auth/sessionStorage
 */

const SESSION_KEY = 'auth-session'

/**
 * Saves the authentication session
 * @function saveSession
 * @param {Object} session - Supabase session object
 * @param {boolean} persistent - Whether to use localStorage or sessionStorage
 * @returns {void}
 */
export function saveSession(session, persistent = true) {
  const sessionData = {
    access_token: session.access_token,
    refresh_token: session.refresh_token,
    user: session.user,
    expires_at: session.expires_at,
    persistent
  }
  
  const storage = persistent ? localStorage : sessionStorage
  storage.setItem(SESSION_KEY, JSON.stringify(sessionData))
  
  // Si guardamos en uno, limpiamos el otro para evitar conflictos
  if (persistent) {
    sessionStorage.removeItem(SESSION_KEY)
  } else {
    localStorage.removeItem(SESSION_KEY)
  }
}

/**
 * Retrieves the session from storage
 * @function getSession
 * @returns {Object|null} Session object or null if not found
 */
export function getSession() {
  // Intentar en ambos
  const storedLocal = localStorage.getItem(SESSION_KEY)
  const storedSession = sessionStorage.getItem(SESSION_KEY)
  
  const stored = storedLocal || storedSession
  if (!stored) return null

  try {
    return JSON.parse(stored)
  } catch {
    return null
  }
}

/**
 * Clears the session from all storage
 * @function clearSession
 * @returns {void}
 */
export function clearSession() {
  localStorage.removeItem(SESSION_KEY)
  sessionStorage.removeItem(SESSION_KEY)
}

/**
 * Checks if the stored session is valid (not expired)
 * @function isSessionValid
 * @returns {boolean} True if session exists and is not expired
 */
export function isSessionValid() {
  const session = getSession()
  if (!session || !session.expires_at) return false

  // Supabase expires_at está en segundos, Date.now() en milisegundos
  // Agregamos un margen de 10 segundos por las dudas
  return (Date.now() / 1000) < (session.expires_at - 10)
}

/**
 * Updates the session with a new token
 * @function refreshSession
 * @param {Object} newSession - New session with updated token
 * @returns {void}
 */
export function refreshSession(newSession) {
  const current = getSession()
  if (newSession.access_token && newSession.user) {
    saveSession(newSession, current?.persistent ?? true)
  }
}