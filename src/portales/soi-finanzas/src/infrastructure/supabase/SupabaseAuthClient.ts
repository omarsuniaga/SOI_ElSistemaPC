/**
 * Minimal Supabase Auth client (GoTrue REST, no @supabase/supabase-js
 * dependency — consistent with this app's existing hand-rolled REST client).
 *
 * Without a real authenticated session, every table/RPC call is rejected by
 * Postgres GRANTs before RLS even runs (the `anon` role has no privileges on
 * familias/representantes/cuotas/pagos or on fn_registrar_pago_transaccional).
 * A logged-in `authenticated` session is required for any of Receivables to
 * work — this mirrors the official FIN portal's own login gate in fin.js.
 */
import { getSupabaseConfig } from './SupabaseClient';

export interface AuthSession {
  accessToken: string;
  refreshToken: string;
  expiresAt: number; // epoch seconds
  userId: string;
  email: string;
}

export interface AuthorizedProfile {
  id: string;
  nombreCompleto: string;
  rol: string;
}

const SESSION_STORAGE_KEY = 'SOI_FINANZAS_AUTH_SESSION_V1';

export function getStoredSession(): AuthSession | null {
  try {
    if (typeof window === 'undefined' || !window.localStorage) return null;
    const raw = localStorage.getItem(SESSION_STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as AuthSession;
  } catch {
    return null;
  }
}

function setStoredSession(session: AuthSession | null): void {
  if (typeof window === 'undefined' || !window.localStorage) return;
  if (session) {
    localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
  } else {
    localStorage.removeItem(SESSION_STORAGE_KEY);
  }
}

function toSession(payload: any): AuthSession {
  return {
    accessToken: payload.access_token,
    refreshToken: payload.refresh_token,
    expiresAt: payload.expires_at ?? Math.floor(Date.now() / 1000) + (payload.expires_in ?? 3600),
    userId: payload.user?.id,
    email: payload.user?.email
  };
}

async function gotrueError(res: Response): Promise<string> {
  const body = await res.json().catch(() => ({} as any));
  return body?.error_description || body?.msg || body?.message || `HTTP ${res.status}`;
}

/**
 * Authenticates AND authorizes: a valid Supabase Auth account is not enough
 * on its own — only profiles.rol IN ('admin','cajero') may use this portal,
 * matching fn_registrar_pago_transaccional's own server-side check. If the
 * account is valid but not authorized, the session is discarded and an
 * error is returned instead of leaving an unauthorized session active.
 */
export async function signInAndAuthorize(
  email: string,
  password: string
): Promise<{ success: boolean; session?: AuthSession; profile?: AuthorizedProfile; error?: string }> {
  const config = getSupabaseConfig();
  if (!config.isConfigured) {
    return { success: false, error: 'Supabase no está configurado (VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY).' };
  }

  const authRes = await fetch(`${config.url}/auth/v1/token?grant_type=password`, {
    method: 'POST',
    headers: { apikey: config.anonKey, 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });

  if (!authRes.ok) {
    return { success: false, error: await gotrueError(authRes) };
  }

  const session = toSession(await authRes.json());
  setStoredSession(session);

  // Authorization check: only admin/cajero may register payments or view Receivables.
  const profileRes = await fetch(
    `${config.url}/rest/v1/profiles?id=eq.${session.userId}&select=id,nombre_completo,rol`,
    {
      headers: {
        apikey: config.anonKey,
        Authorization: `Bearer ${session.accessToken}`
      }
    }
  );

  if (!profileRes.ok) {
    setStoredSession(null);
    return { success: false, error: 'No se pudo verificar el perfil de acceso.' };
  }

  const rows = await profileRes.json();
  const profileRow = Array.isArray(rows) ? rows[0] : null;

  if (!profileRow || !['admin', 'finanzas'].includes(profileRow.rol)) {
    setStoredSession(null);
    return { success: false, error: 'No autorizado: su cuenta no tiene rol de administrador o finanzas en el portal FIN.' };
  }

  return {
    success: true,
    session,
    profile: { id: profileRow.id, nombreCompleto: profileRow.nombre_completo || email, rol: profileRow.rol }
  };
}

export async function refreshSession(): Promise<AuthSession | null> {
  const config = getSupabaseConfig();
  const current = getStoredSession();
  if (!config.isConfigured || !current?.refreshToken) return null;

  const res = await fetch(`${config.url}/auth/v1/token?grant_type=refresh_token`, {
    method: 'POST',
    headers: { apikey: config.anonKey, 'Content-Type': 'application/json' },
    body: JSON.stringify({ refresh_token: current.refreshToken })
  });

  if (!res.ok) {
    setStoredSession(null);
    return null;
  }

  const session = toSession(await res.json());
  setStoredSession(session);
  return session;
}

/** Returns a currently-valid access token for authenticated REST/RPC calls, refreshing first if needed. Null when no session exists (caller should fall back to the anon key for calls that don't require auth). */
export async function getValidAccessToken(): Promise<string | null> {
  let session = getStoredSession();
  if (!session) return null;

  const nowPlusSkew = Math.floor(Date.now() / 1000) + 30;
  if (session.expiresAt <= nowPlusSkew) {
    session = await refreshSession();
  }
  return session?.accessToken || null;
}

export function signOut(): void {
  setStoredSession(null);
}

/**
 * Re-validates a persisted session on app load (e.g. after a page refresh).
 * Refreshes the token if needed and re-checks profiles.rol — a role change
 * or revoked account is caught here, not just at the original login.
 */
export async function restoreSession(): Promise<AuthorizedProfile | null> {
  const config = getSupabaseConfig();
  const token = await getValidAccessToken();
  const session = getStoredSession();
  if (!config.isConfigured || !token || !session) return null;

  const profileRes = await fetch(
    `${config.url}/rest/v1/profiles?id=eq.${session.userId}&select=id,nombre_completo,rol`,
    { headers: { apikey: config.anonKey, Authorization: `Bearer ${token}` } }
  );
  if (!profileRes.ok) {
    setStoredSession(null);
    return null;
  }

  const rows = await profileRes.json();
  const profileRow = Array.isArray(rows) ? rows[0] : null;
  if (!profileRow || !['admin', 'finanzas'].includes(profileRow.rol)) {
    setStoredSession(null);
    return null;
  }

  return { id: profileRow.id, nombreCompleto: profileRow.nombre_completo || session.email, rol: profileRow.rol };
}
