/**
 * @fileoverview Authentication manager orchestration layer
 * @module core/auth/authManager
 */

import * as supabaseAuth from './supabaseAuth.js'
import * as sessionStorage from './sessionStorage.js'

let authChangeCallbacks = []

/**
 * Orchestrates user login
 * @async
 * @function login
 * @param {string} email - User email
 * @param {string} password - User password
 * @param {boolean} remember - Whether to persist the session
 * @returns {Promise<{user:Object,session:Object,error:Object}>}
 */
export async function login(email, password, remember = false) {
  console.log('🔑 authManager.login:', email, 'remember:', remember)
  const { data, error } = await supabaseAuth.signIn(email, password)

  console.log('🔑 login result:', { data, error })
  
  if (error) {
    console.error('🔑 login error:', error)
    return { user: null, session: null, error }
  }

  if (data.session) {
    sessionStorage.saveSession(data.session, remember)
  }

  return { user: data.user, session: data.session, error: null }
}

/**
 * Orchestrates user registration
 * @async
 * @function register
 * @param {string} email - User email
 * @param {string} password - User password
 * @param {Object} userData - Additional user metadata
 * @returns {Promise<{user:Object,session:Object,error:Object}>}
 */
export async function register(email, password, userData = {}) {
  const { data, error } = await supabaseAuth.signUp(email, password, userData)

  if (error) {
    return { user: null, session: null, error }
  }

  return { user: data.user, session: data.session, error: null }
}

/**
 * Orchestrates user logout
 * @async
 * @function logout
 * @returns {Promise<{error:Object}>}
 */
export async function logout() {
  const { error } = await supabaseAuth.signOut()

  sessionStorage.clearSession()

  authChangeCallbacks.forEach((callback) => callback(null))
  return { error }
}

/**
 * Checks if user is authenticated
 * @function isAuthenticated
 * @returns {boolean} True if valid session exists
 */
export function isAuthenticated() {
  return sessionStorage.isSessionValid()
}

/**
 * Gets the current user from storage
 * @function getUser
 * @returns {Object|null} User object or null
 */
export function getUser() {
  const session = sessionStorage.getSession()
  return session?.user || null
}

/**
 * Listens for authentication state changes
 * @function onAuthChange
 * @param {Function} callback - Function to call on auth change
 * @returns {Function} Unsubscribe function
 */
export function onAuthChange(callback) {
  authChangeCallbacks.push(callback)

  return () => {
    const index = authChangeCallbacks.indexOf(callback)
    if (index > -1) {
      authChangeCallbacks.splice(index, 1)
    }
  }
}