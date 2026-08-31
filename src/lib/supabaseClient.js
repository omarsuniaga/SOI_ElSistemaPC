import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY ?? import.meta.env.VITE_SUPABASE_KEY

/** @returns {import('@supabase/supabase-js').SupabaseClient | null} */
function createSupabaseClient() {
  if (!supabaseUrl || !supabaseAnonKey) {
    console.warn(
      '[supabaseClient] Variables de entorno de Supabase no detectadas. Operando con adaptadores/mock.',
    )
    return null
  }
  return createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      storageKey: 'sb-soi-auth',
    },
  })
}

export const supabase = createSupabaseClient()
