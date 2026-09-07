import { getSupabaseConfig } from './SupabaseClient';
import { getValidAccessToken } from './SupabaseAuthClient';
import { Database } from './database.types';

export class SupabaseFetchError extends Error {
  constructor(
    public readonly endpoint: string,
    public readonly status: number,
    public readonly errorDetails: string
  ) {
    super(`[Supabase ${endpoint}] HTTP ${status}: ${errorDetails}`);
    this.name = 'SupabaseFetchError';
  }
}

/**
 * Type-safe fetch client for Supabase REST API and RPC endpoints.
 * Automatically injects headers and validates HTTP status.
 */
export async function supabaseRest<T = any>(
  pathAndQuery: string,
  options: {
    method?: 'GET' | 'POST' | 'PATCH' | 'DELETE';
    body?: any;
    prefer?: 'return=representation' | 'return=minimal' | 'count=exact';
    headers?: Record<string, string>;
  } = {}
): Promise<T> {
  const config = getSupabaseConfig();
  if (!config.isConfigured) {
    throw new Error('Supabase no está configurado en las variables de entorno (VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY).');
  }

  const cleanPath = pathAndQuery.startsWith('/') ? pathAndQuery.slice(1) : pathAndQuery;
  const url = `${config.url}/rest/v1/${cleanPath}`;

  // RLS on familias/representantes/cuotas/pagos/wallet_movimientos requires a
  // real authenticated-role session (get_user_role() reads auth.uid()). The
  // anon key alone is rejected at the GRANT level before RLS even runs.
  const sessionToken = await getValidAccessToken();

  const defaultHeaders: Record<string, string> = {
    'apikey': config.anonKey,
    'Authorization': `Bearer ${sessionToken || config.anonKey}`,
    'Content-Type': 'application/json',
    ...(options.prefer ? { 'Prefer': options.prefer } : {}),
    ...(options.headers || {})
  };

  const response = await fetch(url, {
    method: options.method || 'GET',
    headers: defaultHeaders,
    body: options.body !== undefined ? JSON.stringify(options.body) : undefined
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new SupabaseFetchError(cleanPath, response.status, errorText);
  }

  // Handle 204 No Content
  if (response.status === 204) {
    return null as any;
  }

  return await response.json();
}

/**
 * Invoke authoritative Postgres RPC procedure
 */
export async function supabaseRpc<TReturn = any, TArgs = Record<string, any>>(
  rpcName: keyof Database['public']['Functions'] | string,
  args: TArgs
): Promise<TReturn> {
  return await supabaseRest<TReturn>(`rpc/${String(rpcName)}`, {
    method: 'POST',
    body: args
  });
}
