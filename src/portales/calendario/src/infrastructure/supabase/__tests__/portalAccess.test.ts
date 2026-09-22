import { describe, test, expect, vi } from 'vitest';
import { hasCalendarPortalAccess } from '../portalAccess';

describe('hasCalendarPortalAccess (verifica contra has_portal_access)', () => {
  test('true solo cuando la base responde true', async () => {
    const rpc = vi.fn().mockResolvedValue({ data: true, error: null });
    await expect(hasCalendarPortalAccess({ rpc })).resolves.toBe(true);
    expect(rpc).toHaveBeenCalledWith('has_portal_access', { p_portal_id: 'CAL' });
  });

  test('false cuando la base responde false', async () => {
    const rpc = vi.fn().mockResolvedValue({ data: false, error: null });
    await expect(hasCalendarPortalAccess({ rpc })).resolves.toBe(false);
  });

  test('falla cerrada: error de la RPC, excepción o valor no booleano => false', async () => {
    await expect(hasCalendarPortalAccess({ rpc: vi.fn().mockResolvedValue({ data: null, error: { message: 'x' } }) })).resolves.toBe(false);
    await expect(hasCalendarPortalAccess({ rpc: vi.fn().mockRejectedValue(new Error('net')) })).resolves.toBe(false);
    await expect(hasCalendarPortalAccess({ rpc: vi.fn().mockResolvedValue({ data: 'true', error: null }) })).resolves.toBe(false);
  });
});
