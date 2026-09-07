/**
 * Supabase Infrastructure Client
 * Reads environment variables safely with fallback handling.
 */
import { getValidAccessToken } from './SupabaseAuthClient';

export interface SupabaseConfig {
  url: string;
  anonKey: string;
  isConfigured: boolean;
}

export function getSupabaseConfig(): SupabaseConfig {
  const metaEnv = (import.meta as any).env || {};
  // No fallback a una URL de producción hardcodeada: si falta la variable de
  // entorno, `isConfigured` debe quedar en `false` y el banner de estado debe
  // mostrar `offline_blocked` en vez de conectar silenciosamente a un
  // proyecto Supabase fijo en el código fuente.
  const url = metaEnv.VITE_SUPABASE_URL || '';
  // SECURITY: the browser client must only ever use the anon key. The service_role
  // key bypasses RLS and must never be read, referenced, or bundled here — see
  // SupabaseSettingsView's own "Prohibido en Frontend" notice.
  const anonKey = metaEnv.VITE_SUPABASE_ANON_KEY || '';
  const isConfigured = Boolean(url && url.startsWith('http') && anonKey && anonKey.length > 10);

  return {
    url,
    anonKey,
    isConfigured
  };
}

export async function checkSupabaseConnection(): Promise<boolean> {
  const config = getSupabaseConfig();
  if (!config.isConfigured) return false;

  try {
    // Note: this creates a module cycle with SupabaseAuthClient (which
    // imports getSupabaseConfig from here). Safe in practice — neither
    // import is used at module-evaluation time, only inside function bodies
    // called well after both modules have finished initializing.
    const sessionToken = await getValidAccessToken();

    // 'familias' (not 'alumnos') deliberately: familias has real RLS
    // policies for admin/cajero/representante, so this check reflects
    // whether the CURRENT session can actually reach Receivables data —
    // 'alumnos' has RLS enabled with zero policies (deny-all for everyone,
    // authenticated or not), which would make this check misleading either way.
    const res = await fetch(`${config.url}/rest/v1/familias?select=id&limit=1`, {
      headers: {
        'apikey': config.anonKey,
        'Authorization': `Bearer ${sessionToken || config.anonKey}`
      }
    });
    return res.ok;
  } catch (e) {
    return false;
  }
}
