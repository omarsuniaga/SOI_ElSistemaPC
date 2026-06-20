import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Setup mocks BEFORE importing modules
vi.mock('../lib/supabaseClient.js', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          order: vi.fn(() => ({
            limit: vi.fn(() => Promise.resolve({
              data: [],
              error: null
            }))
          }))
        })),
        order: vi.fn(() => ({
          limit: vi.fn(() => Promise.resolve({
            data: [],
            error: null
          }))
        })),
        maybeSingle: vi.fn(() => Promise.resolve({ data: null })),
      })),
      update: vi.fn(() => ({
        eq: vi.fn(() => Promise.resolve({ error: null })),
        neq: vi.fn(() => Promise.resolve({ error: null })),
      })),
      upsert: vi.fn(() => Promise.resolve({ error: null })),
    })),
  },
}));

vi.mock('../portal-maestros/auth/maestroAuth.js', () => ({
  getMaestroLocal: vi.fn(() => ({ id: 'maestro-test-123' })),
}));

vi.mock('../portal-maestros/services/maestroDataService.js', () => ({
  getMisClases: vi.fn(() => Promise.resolve([
    {
      id: 'clase-456',
      nombre: 'Clase de Matemáticas',
    }
  ])),
  getHorariosClases: vi.fn(() => Promise.resolve([
    {
      clase_id: 'clase-456',
      dia: 'lunes',
      hora_inicio: '09:00',
      hora_fin: '10:00',
    }
  ])),
  getSesiones: vi.fn(() => Promise.resolve([])),
}));

vi.mock('../portal-maestros/services/pushService.js', () => ({
  onPushReceived: vi.fn(),
  getSubscriptionStatus: vi.fn(async () => ({
    subscribed: false,
  })),
  isPushSubscribed: vi.fn(async () => false),
  getNotificationPreferences: vi.fn(async () => ({
    push_activo: false,
    recordatorios_activos: true,
  })),
}));

import {
  fetchNotificaciones,
  onNotificacionesChange,
  _isDuplicateNotification,
  _recordNotificationReceived,
  _generateDeduplicationKey,
  DEDUP_WINDOW_MS,
  DEDUP_EXPIRY_MS,
} from '../portal-maestros/services/notificationService.js';

import { getSubscriptionStatus } from '../portal-maestros/services/pushService.js';

describe('Notification System Integration', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.clearAllMocks();
  });

  describe('Complete polling + push + deduplication flow', () => {
    it('should handle single notification without duplicates', async () => {
      const now = Date.now();
      vi.setSystemTime(now);

      const notification = {
        id: 'notif-single-123',
        tipo: 'recordatorio_clase',
        clase_id: 'clase-single-456',
        titulo: 'Clase próxima',
        mensaje: 'Tu clase empieza en 15 minutos',
        created_at: new Date().toISOString(),
      };

      // Step 1: Check not duplicate on first arrival
      expect(_isDuplicateNotification(notification)).toBe(false);

      // Step 2: Record it as received
      _recordNotificationReceived(notification);

      // Step 3: Check it's now duplicate (prevents polling from returning it again)
      expect(_isDuplicateNotification(notification)).toBe(true);

      // Step 4: Advance time past expiry window (121 seconds)
      vi.setSystemTime(now + 121 * 1000);

      // Step 5: After expiry, it should be eligible for deduplication again
      expect(_isDuplicateNotification(notification)).toBe(false);
    });

    it('should prevent duplicates when same notification arrives via polling and push', async () => {
      // Fix time at the start of a minute to ensure 5s jump stays in same bucket (DEDUP_WINDOW_MS = 60s)
      const now = new Date('2026-05-17T10:00:00Z').getTime();
      vi.setSystemTime(now);

      const notification = {
        id: 'notif-pollingpush-001',
        tipo: 'recordatorio_clase',
        clase_id: 'clase-pollingpush-001',
        titulo: 'Clase próxima',
        mensaje: 'Tu clase empieza en 15 minutos',
        created_at: new Date().toISOString(),
      };

      // Simulate: notification arrives via polling
      _recordNotificationReceived(notification);
      expect(_isDuplicateNotification(notification)).toBe(true);

      // Simulate: same notification arrives via push 5 seconds later
      vi.setSystemTime(now + 5 * 1000);

      // Push service checks before adding to notifications list
      const shouldIgnorePushDuplicate = _isDuplicateNotification(notification);
      expect(shouldIgnorePushDuplicate).toBe(true);
    });

    it('should handle multiple different notifications without cross-contamination', async () => {
      const notif1 = {
        id: 'notif-multi-1',
        tipo: 'recordatorio_clase',
        clase_id: 'clase-multi-1',
        created_at: new Date().toISOString(),
      };

      const notif2 = {
        id: 'notif-multi-2',
        tipo: 'recordatorio_clase',
        clase_id: 'clase-multi-2',
        created_at: new Date().toISOString(),
      };

      // Both should be new initially
      expect(_isDuplicateNotification(notif1)).toBe(false);
      expect(_isDuplicateNotification(notif2)).toBe(false);

      // Record first
      _recordNotificationReceived(notif1);
      expect(_isDuplicateNotification(notif1)).toBe(true);

      // Second should still be new
      expect(_isDuplicateNotification(notif2)).toBe(false);

      // Record second
      _recordNotificationReceived(notif2);
      expect(_isDuplicateNotification(notif1)).toBe(true);
      expect(_isDuplicateNotification(notif2)).toBe(true);
    });

    it('should handle different notification types for same class', async () => {
      const recordatorio = {
        id: 'notif-types-1',
        tipo: 'recordatorio_clase',
        clase_id: 'clase-types-001',
        created_at: new Date().toISOString(),
      };

      const sinRegistrar = {
        id: 'notif-types-2',
        tipo: 'sesion_sin_registrar',
        clase_id: 'clase-types-001',
        created_at: new Date().toISOString(),
      };

      // Both should be independent
      _recordNotificationReceived(recordatorio);
      expect(_isDuplicateNotification(recordatorio)).toBe(true);
      expect(_isDuplicateNotification(sinRegistrar)).toBe(false);

      _recordNotificationReceived(sinRegistrar);
      expect(_isDuplicateNotification(recordatorio)).toBe(true);
      expect(_isDuplicateNotification(sinRegistrar)).toBe(true);
    });

    it('should respect DEDUP_WINDOW_MS for minute bucketing', () => {
      const now = Date.now();
      // Set time to a specific point well within a minute bucket (e.g., 10s into a bucket)
      const bucketStartTime = Math.floor(now / DEDUP_WINDOW_MS) * DEDUP_WINDOW_MS + 10000;
      vi.setSystemTime(bucketStartTime);

      const notif = {
        id: 'notif-bucket-test',
        tipo: 'recordatorio_clase',
        clase_id: 'clase-bucket-test',
        created_at: new Date().toISOString(),
      };

      const key1 = _generateDeduplicationKey(notif);

      // Move forward 20 seconds (still in same bucket)
      vi.setSystemTime(bucketStartTime + 20 * 1000);
      const key2 = _generateDeduplicationKey(notif);

      // Should be in same minute bucket
      expect(key1).toBe(key2);

      // Move to next minute bucket (past 60 seconds)
      vi.setSystemTime(bucketStartTime + 70 * 1000);
      const key3 = _generateDeduplicationKey(notif);

      // Should be in different bucket (DEDUP_WINDOW_MS = 60000 ms)
      expect(key3).not.toBe(key1);
    });

    it('should expire old deduplication keys automatically', () => {
      const now = Date.now();
      // Set time to a specific point well within a minute bucket
      const bucketStartTime = Math.floor(now / DEDUP_WINDOW_MS) * DEDUP_WINDOW_MS + 10000;
      vi.setSystemTime(bucketStartTime);

      const notification = {
        id: 'notif-expire-test',
        tipo: 'recordatorio_clase',
        clase_id: 'clase-expire-test',
        created_at: new Date().toISOString(),
      };

      // Record at time T (this creates key with minuteBucket at T)
      _recordNotificationReceived(notification);
      expect(_isDuplicateNotification(notification)).toBe(true);

      // Move forward 20 seconds (within same minute bucket)
      vi.setSystemTime(bucketStartTime + 20 * 1000);
      expect(_isDuplicateNotification(notification)).toBe(true);

      // Move forward 130 seconds - past DEDUP_EXPIRY_MS (120s)
      // The cleanup will remove expired keys
      vi.setSystemTime(bucketStartTime + 130 * 1000);
      expect(_isDuplicateNotification(notification)).toBe(false);
    });
  });

  describe('Listener pattern integration', () => {
    it('should notify listeners when notifications change', async () => {
      const mockCallback = vi.fn();

      // Subscribe to changes
      const unsubscribe = onNotificacionesChange(mockCallback);

      // Should be called immediately with current state (empty)
      expect(mockCallback).toHaveBeenCalledTimes(1);
      expect(mockCallback).toHaveBeenCalledWith([]);

      unsubscribe();
    });

    it('should allow unsubscribing from notifications', async () => {
      const mockCallback = vi.fn();
      const unsubscribe = onNotificacionesChange(mockCallback);

      expect(mockCallback).toHaveBeenCalledTimes(1);
      mockCallback.mockClear();

      // Unsubscribe
      unsubscribe();

      // Fetch should not trigger this callback anymore
      await fetchNotificaciones();

      expect(mockCallback).not.toHaveBeenCalled();
    });
  });

  describe('Push subscription status', () => {
    it('should return subscription status from push service', async () => {
      const status = await getSubscriptionStatus();

      expect(status).toBeDefined();
      expect(status).toHaveProperty('subscribed');
      expect(typeof status.subscribed).toBe('boolean');
    });

    it('should handle unsubscribed state', async () => {
      const status = await getSubscriptionStatus();
      expect(status.subscribed).toBe(false);
    });
  });

  describe('Edge cases', () => {
    it('should handle null/undefined notification fields gracefully', () => {
      const notif = {
        id: 'notif-edge-case',
        // missing tipo
        // missing clase_id
        created_at: new Date().toISOString(),
      };

      // Should not throw
      expect(() => {
        const key = _generateDeduplicationKey(notif);
        _recordNotificationReceived(notif);
        _isDuplicateNotification(notif);
      }).not.toThrow();
    });

    it('should handle notifications with only alumno_id', () => {
      const notif = {
        id: 'notif-alumno-only',
        tipo: 'mensaje_alumno',
        alumno_id: 'alumno-edge-789',
        created_at: new Date().toISOString(),
      };

      const key = _generateDeduplicationKey(notif);
      expect(key).toContain('alumno-edge-789');

      _recordNotificationReceived(notif);
      expect(_isDuplicateNotification(notif)).toBe(true);
    });

    it('should handle timestamp-less notifications', () => {
      const notif = {
        id: 'notif-no-ts-edge',
        tipo: 'test',
        clase_id: 'clase-no-ts-test',
        // no created_at
      };

      expect(() => {
        _recordNotificationReceived(notif);
        _isDuplicateNotification(notif);
      }).not.toThrow();
    });

    it('should handle rapid successive calls', () => {
      const notif = {
        id: 'notif-rapid-calls',
        tipo: 'recordatorio_clase',
        clase_id: 'clase-rapid-calls',
      };

      // Rapid checks and records
      for (let i = 0; i < 10; i++) {
        expect(_isDuplicateNotification(notif)).toBe(i > 0);
        if (i === 0) {
          _recordNotificationReceived(notif);
        }
      }
    });
  });

  describe('Real-world scenario: polling + manual push', () => {
    it('should prevent duplicate when notification is fetched then pushed', async () => {
      const now = Date.now();
      vi.setSystemTime(now);

      const notification = {
        id: 'notif-real-world',
        tipo: 'recordatorio_clase',
        clase_id: 'clase-456',
        titulo: 'Clase próxima',
        mensaje: 'Tu clase empieza en 15 minutos',
        estado: 'enviada',
        created_at: new Date().toISOString(),
      };

      // Scenario 1: fetchNotificaciones (polling) gets the notification
      // It checks deduplication
      let isDupBeforeRecord = _isDuplicateNotification(notification);
      expect(isDupBeforeRecord).toBe(false);

      // Records it so push won't duplicate
      _recordNotificationReceived(notification);

      // Scenario 2: Push notification arrives 2 seconds later (within same minute bucket)
      vi.setSystemTime(now + 2 * 1000);

      // Service checks before adding to UI
      const isDupAfterRecord = _isDuplicateNotification(notification);
      expect(isDupAfterRecord).toBe(true);

      // UI would only show notification once
    });

    it('should allow new notifications within expiry window but different types', () => {
      const recordatorio = {
        id: 'notif-realworld-rec',
        tipo: 'recordatorio_clase',
        clase_id: 'clase-realworld-001',
        created_at: new Date().toISOString(),
      };

      const actualizacion = {
        id: 'notif-realworld-upd',
        tipo: 'actualizacion_clase',
        clase_id: 'clase-realworld-001',
        created_at: new Date().toISOString(),
      };

      // First notification arrives
      _recordNotificationReceived(recordatorio);
      expect(_isDuplicateNotification(recordatorio)).toBe(true);

      // Different type for same class should not be blocked
      expect(_isDuplicateNotification(actualizacion)).toBe(false);

      _recordNotificationReceived(actualizacion);
      expect(_isDuplicateNotification(actualizacion)).toBe(true);

      // Both are now deduped independently
    });
  });
});
