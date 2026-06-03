import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY ?? import.meta.env.VITE_SUPABASE_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Faltan variables de entorno de Supabase. Defini VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY en .env.local, y reinicia el servidor de Vite.',
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
