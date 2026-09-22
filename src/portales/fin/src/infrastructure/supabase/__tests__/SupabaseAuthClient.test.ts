import { describe, test, expect, vi, afterEach } from 'vitest';
import { hasFinPortalAccess } from '../SupabaseAuthClient';

const cfg = { url: 'https://x.supabase.co', anonKey: 'anon' };

afterEach(() => vi.unstubAllGlobals());

describe('hasFinPortalAccess (verifica contra has_portal_access, sin lista de roles fija)', () => {
  test('true solo cuando la base responde true', async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, json: async () => true });
    vi.stubGlobal('fetch', fetchMock);

    await expect(hasFinPortalAccess(cfg, 'tok')).resolves.toBe(true);

    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe('https://x.supabase.co/rest/v1/rpc/has_portal_access');
    expect(JSON.parse(init.body)).toEqual({ p_portal_id: 'FIN' });
    expect(init.headers.Authorization).toBe('Bearer tok');
  });

  test('false cuando la base responde false, aunque el rol fuera admin', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, json: async () => false }));
    await expect(hasFinPortalAccess(cfg, 'tok')).resolves.toBe(false);
  });

  test('falla cerrada: error de red => false (antes se confiaba en el rol)', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('network')));
    await expect(hasFinPortalAccess(cfg, 'tok')).resolves.toBe(false);
  });

  test('falla cerrada: respuesta no ok o no booleana => false', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false, json: async () => true }));
    await expect(hasFinPortalAccess(cfg, 'tok')).resolves.toBe(false);
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, json: async () => 'true' }));
    await expect(hasFinPortalAccess(cfg, 'tok')).resolves.toBe(false);
  });
});
