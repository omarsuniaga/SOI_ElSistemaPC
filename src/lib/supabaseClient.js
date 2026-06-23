import { createClient } from '@supabase/supabase-js'

const supabaseUrl = (typeof import.meta !== 'undefined' && import.meta.env)
  ? import.meta.env.VITE_SUPABASE_URL
  : process.env.VITE_SUPABASE_URL

const supabaseAnonKey = (typeof import.meta !== 'undefined' && import.meta.env)
  ? (import.meta.env.VITE_SUPABASE_ANON_KEY ?? import.meta.env.VITE_SUPABASE_KEY)
  : (process.env.VITE_SUPABASE_ANON_KEY ?? process.env.VITE_SUPABASE_KEY)

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Faltan variables de entorno de Supabase. Defini VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY, y reinicia el servidor.',
  )
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,       // Token sobrevive cierres de app/navegador
    autoRefreshToken: true,     // Refresca el token automáticamente antes de que expire
    detectSessionInUrl: true,   // Captura tokens OAuth en la URL (magic link, etc.)
    storageKey: 'sb-soi-auth',  // Clave fija en localStorage (independiente del proyecto)
  },
})
