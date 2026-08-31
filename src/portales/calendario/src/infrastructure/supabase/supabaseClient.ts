import { supabase as sharedSupabase } from '../../../../../lib/supabaseClient.js';
import type { SupabaseClient } from '@supabase/supabase-js';

/**
 * Re-export the shared singleton SupabaseClient instance.
 * Avoids initializing multiple GoTrueClient instances under the same 'sb-soi-auth' storageKey.
 */
export const supabase: SupabaseClient | null = sharedSupabase;
