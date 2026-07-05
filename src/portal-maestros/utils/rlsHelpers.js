import { supabase } from '../../lib/supabaseClient.js'

/**
 * Fetches the current user's profile status (estado and rol) from Supabase.
 * Returns null if there is no session or if the query fails.
 * Fail-soft: errors are logged and return null without crashing the UI.
 *
 * @returns {Promise<{ estado: string, rol: string } | null>}
 */
export async function getProfileStatus() {
  try {
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    if (sessionError || !session?.user?.id) {
      return null
    }

    const { data, error } = await supabase
      .from('profiles')
      .select('estado, rol')
      .eq('id', session.user.id)
      .single()

    if (error || !data) {
      return null
    }

    return { estado: data.estado, rol: data.rol }
  } catch (err) {
    console.warn('[rlsHelpers] Error fetching profile status:', err.message)
    return null
  }
}

/**
 * Convenience function that returns true only if the current profile's estado is 'activo'.
 * Fail-soft: returns false on any error.
 *
 * @returns {Promise<boolean>}
 */
export async function isProfileActive() {
  const status = await getProfileStatus()
  return status?.estado === 'activo'
}
