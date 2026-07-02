import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY ?? import.meta.env.VITE_SUPABASE_KEY

/** @returns {import('@supabase/supabase-js').SupabaseClient | null} */
function createSupabaseClient() {
  if (!supabaseUrl || !supabaseAnonKey) {
    if (import.meta.env.MODE === 'test' || import.meta.env.MODE === 'production') {
      return null
    }
    throw new Error(
      'Faltan variables de entorno de Supabase. Defini VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY en .env.local, y reinicia el servidor de Vite.',
    )
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
