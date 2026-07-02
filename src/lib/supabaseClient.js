import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY ?? import.meta.env.VITE_SUPABASE_KEY

// En modo de test o build, permite valores dummy
const isTestEnv = import.meta.env.MODE === 'test' || process.env.NODE_ENV === 'test'
const isBuildEnv = import.meta.env.MODE === 'production' && (!supabaseUrl || !supabaseAnonKey)

if (!supabaseUrl || !supabaseAnonKey) {
  if (isTestEnv || isBuildEnv) {
    console.warn('⚠️  Supabase variables not configured. Using dummy values for build/test.')
  } else {
    throw new Error(
      'Faltan variables de entorno de Supabase. Defini VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY en .env.local, y reinicia el servidor de Vite.',
    )
  }
}

const finalUrl = supabaseUrl || 'https://dummy.supabase.co'
const finalKey = supabaseAnonKey || 'dummy-anon-key'

export const supabase = createClient(finalUrl, finalKey, {
  auth: {
    persistSession: true,       // Token sobrevive cierres de app/navegador
    autoRefreshToken: true,     // Refresca el token automáticamente antes de que expire
    detectSessionInUrl: true,   // Captura tokens OAuth en la URL (magic link, etc.)
    storageKey: 'sb-soi-auth',  // Clave fija en localStorage (independiente del proyecto)
  },
})
