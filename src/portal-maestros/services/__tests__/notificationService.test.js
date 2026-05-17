import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock supabase - simple chainable object
vi.mock('../../../lib/supabaseClient.js', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => Promise.resolve({ data: [], error: null })),
      maybeSingle: vi.fn(() => Promise.resolve({ data: null })),
      upsert: vi.fn(() => Promise.resolve({ error: null })),
      update: vi.fn(() => ({ eq: vi.fn(() => Promise.resolve({ error: null })) })),
    })),
  },
}));

// Mock maestroAuth
vi.mock('../maestroAuth.js', () => ({
  getMaestroLocal: vi.fn(() => ({ id: 'test-maestro-id' })),
}));

// Mock maestroDataService
vi.mock('./maestroDataService.js', () => ({
  getMisClases: vi.fn(() => []),
  getHorariosClases: vi.fn(() => []),
  getSesiones: vi.fn(() => []),
}));

// Mock pushService import to avoid circular deps during test
vi.mock('../pushService.js', () => ({ onPushReceived: vi.fn() }));

import {
  _isDuplicateNotification,
  _recordNotificationReceived,
  _generateDeduplicationKey,
  getDedupCount,
  POLL_INTERVAL_MS,
  DEDUP_WINDOW_MS,
  DEDUP_EXPIRY_MS,
} from '../notificationService.js';

describe('Deduplication Logic', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  describe('_generateDeduplicationKey', () => {
    it('should generate consistent key for same notification type and ID', () => {
      const notification = {
        id: 'notif-1',
        tipo: 'recordatorio_clase',
        clase_id: 'clase-123',
      };

      const key1 = _generateDeduplicationKey(notification);
      const key2 = _generateDeduplicationKey(notification);

      expect(key1).toBe(key2);
      expect(key1).toContain('recordatorio_clase');
      expect(key1).toContain('clase-123');
    });

    it('should use clase_id if available', () => {
      const notif = { tipo: 'recordatorio_clase', clase_id: 'clase-123' };
      const key = _generateDeduplicationKey(notif);
      expect(key).toContain('clase-123');
    });

    it('should fallback to alumno_id if clase_id not available', () => {
      const notif = { tipo: 'sesion_sin_registrar', alumno_id: 'alumno-456' };
      const key = _generateDeduplicationKey(notif);
      expect(key).toContain('alumno-456');
    });

    it('should fallback to notification id if neither clase_id nor alumno_id', () => {
      const notif = { id: 'notif-789', tipo: 'mensaje_admin' };
      const key = _generateDeduplicationKey(notif);
      expect(key).toContain('notif-789');
    });

    it('should use generic fallback if no ID fields', () => {
      const notif = { tipo: 'generic_event' };
      const key = _generateDeduplicationKey(notif);
      expect(key).toContain('generic_event');
      expect(key).toContain('generic');
    });

    it('should include minute bucket for temporal grouping', () => {
      const notif = { tipo: 'test', id: 'x' };
      const key = _generateDeduplicationKey(notif);
      const parts = key.split(':');
      expect(parts.length).toBe(3);
      expect(Number(parts[2])).toBeGreaterThan(0);
    });
  });

  describe('_isDuplicateNotification', () => {
    it('should return false for new notification', () => {
      const notif = {
        id: 'new-1',
        tipo: 'recordatorio_clase',
        clase_id: 'clase-new',
      };

      const isDup = _isDuplicateNotification(notif);
      expect(isDup).toBe(false);
    });

    it('should return true if notification recorded as received', () => {
      const notif = {
        id: 'dup-1',
        tipo: 'recordatorio_clase',
        clase_id: 'clase-dup',
      };

      _recordNotificationReceived(notif);
      const isDup = _isDuplicateNotification(notif);
      expect(isDup).toBe(true);
    });

    it('should return false for different tipo same clase_id', () => {
      const notif1 = { tipo: 'recordatorio_clase', clase_id: 'clase-a' };
      const notif2 = { tipo: 'sesion_sin_registrar', clase_id: 'clase-a' };

      _recordNotificationReceived(notif1);
      expect(_isDuplicateNotification(notif1)).toBe(true);
      expect(_isDuplicateNotification(notif2)).toBe(false);
    });

    it('should return false for same tipo different clase_id', () => {
      const notif1 = { tipo: 'recordatorio_clase', clase_id: 'clase-a' };
      const notif2 = { tipo: 'recordatorio_clase', clase_id: 'clase-b' };

      _recordNotificationReceived(notif1);
      expect(_isDuplicateNotification(notif1)).toBe(true);
      expect(_isDuplicateNotification(notif2)).toBe(false);
    });

    it('should expire keys after DEDUP_EXPIRY_MS', () => {
      const now = Date.now();
      vi.setSystemTime(now);

      const notif = {
        id: 'expire-1',
        tipo: 'recordatorio_clase',
        clase_id: 'clase-expire',
      };

      _recordNotificationReceived(notif);
      expect(_isDuplicateNotification(notif)).toBe(true);

      // Advance time past expiry (120 seconds + buffer)
      vi.setSystemTime(now + 121 * 1000);
      expect(_isDuplicateNotification(notif)).toBe(false);
    });
  });

  describe('getDedupCount', () => {
    beforeEach(() => {
      // Advance clock past DEDUP_EXPIRY_MS (120s) to flush entries from previous tests
      vi.setSystemTime(Date.now() + 200 * 1000);
    });

    it('should return 0 when no notifications were recorded', () => {
      expect(getDedupCount()).toBe(0);
    });

    it('should return the number of unique dedup keys within window', () => {
      const notif1 = { id: 'n1', tipo: 'recordatorio_clase', clase_id: 'clase-a' };
      const notif2 = { id: 'n2', tipo: 'recordatorio_clase', clase_id: 'clase-b' };
      const notif3 = { id: 'n3', tipo: 'sesion_sin_registrar', clase_id: 'clase-a' };

      _recordNotificationReceived(notif1);
      expect(getDedupCount()).toBe(1);

      _recordNotificationReceived(notif2);
      expect(getDedupCount()).toBe(2);

      _recordNotificationReceived(notif3);
      expect(getDedupCount()).toBe(3);
    });

    it('should not count duplicate notifications for same key twice', () => {
      const notif = { id: 'dup-x', tipo: 'recordatorio_clase', clase_id: 'clase-dup' };

      _recordNotificationReceived(notif);
      _recordNotificationReceived(notif); // same key within window

      expect(getDedupCount()).toBe(1); // still 1 because same key
    });

    it('should decrease count after keys expire', () => {
      const now = Date.now();
      vi.setSystemTime(now);

      const notif1 = { id: 'e1', tipo: 'recordatorio_clase', clase_id: 'clase-exp' };
      const notif2 = { id: 'e2', tipo: 'recordatorio_clase', clase_id: 'clase-exp2' };

      _recordNotificationReceived(notif1);
      _recordNotificationReceived(notif2);
      expect(getDedupCount()).toBe(2);

      // Advance past expiry
      vi.setSystemTime(now + 121 * 1000);
      expect(getDedupCount()).toBe(0);
      vi.setSystemTime(now);
    });
  });

  describe('Polling Interval Constants', () => {
    it('should define POLL_INTERVAL_MS as 30 seconds', () => {
      expect(POLL_INTERVAL_MS).toBe(30000);
    });

    it('should define DEDUP_WINDOW_MS as 60 seconds', () => {
      expect(DEDUP_WINDOW_MS).toBe(60000);
    });

    it('should define DEDUP_EXPIRY_MS as 120 seconds', () => {
      expect(DEDUP_EXPIRY_MS).toBe(120000);
    });
  });
});
