import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

/**
 * Initialize Supabase client with auth configuration.
 * Throws error if required environment variables are missing (except in test mode).
 */
function createSupabaseClientInstance(): SupabaseClient | null {
  if (!supabaseUrl || !supabaseAnonKey) {
    if (import.meta.env.MODE === 'test' || import.meta.env.MODE === 'production') {
      return null;
    }
    throw new Error(
      'Faltan variables de entorno de Supabase. Define VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY en .env.local, y reinicia el servidor de Vite.'
    );
  }

  return createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      // Mismo storageKey que src/lib/supabaseClient.js (Admin + Portal Maestros):
      // comparte sesión entre portales en vez de pedir login por separado.
      storageKey: 'sb-soi-auth',
    },
  });
}

export const supabase = createSupabaseClientInstance();
