/**
 * @fileoverview Core authentication functions for Supabase Auth
 * @module core/auth/supabaseAuth
 */

import { supabase } from '../../lib/supabaseClient.js'

/**
 * Registers a new user in Supabase Auth
 * @async
 * @function signUp
 * @param {string} email - User email address
 * @param {string} password - User password
 * @param {Object} userData - Additional user data (metadata)
 * @returns {Promise<{data:Object,error:Object}>} Auth response with user session or error
 */
export async function signUp(email, password, userData = {}) {
  try {
    const result = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: userData,
      },
    })
    return result
  } catch (err) {
    console.error('📝 signUp error:', err)
    throw err
  }
}

/**
 * Authenticates a user with email and password
 * @async
 * @function signIn
 * @param {string} email - User email address
 * @param {string} password - User password
 * @returns {Promise<{data:Object,error:Object}>} Auth response with session or error
 */
export async function signIn(email, password) {
  try {
    const result = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    return result
  } catch (err) {
    console.error('🔐 signIn error:', err)
    throw err
  }
}

/**
 * Signs out the current user
 * @async
 * @function signOut
 * @returns {Promise<{error:Object}>} Error object if failed
 */
export async function signOut() {
  return await supabase.auth.signOut()
}

/**
 * Gets the current authenticated user
 * @async
 * @function getCurrentUser
 * @returns {Promise<{data:Object,error:Object}>} User object or error
 */
export async function getCurrentUser() {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()
  return { data: { user }, error }
}

/**
 * Gets the current session
 * @async
 * @function getSession
 * @returns {Promise<{data:Object,error:Object}>} Session object or error
 */
export async function getSession() {
  const {
    data: { session },
    error,
  } = await supabase.auth.getSession()
  return { data: { session }, error }
}

/**
 * Refreshes the current session token
 * @async
 * @function refreshToken
 * @returns {Promise<{data:Object,error:Object}>} New session or error
 */
export async function refreshToken() {
  const { data, error } = await supabase.auth.refreshSession()
  return { data, error }
}
