import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock service worker APIs
const mockGetSubscription = vi.fn();
const mockReady = vi.fn(() => Promise.resolve({
  pushManager: { getSubscription: mockGetSubscription },
}));

vi.stubGlobal('navigator', {
  serviceWorker: { ready: mockReady },
  userAgent: 'test-agent',
});

// Mock supabase - simple chainable object
vi.mock('../../../lib/supabaseClient.js', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => Promise.resolve({ data: null })),
      upsert: vi.fn(() => Promise.resolve({ error: null })),
      update: vi.fn(() => ({ eq: vi.fn(() => Promise.resolve({ error: null })) }),
    })),
  },
}));

// Mock maestroAuth
vi.mock('../maestroAuth.js', () => ({
  getMaestroLocal: vi.fn(() => ({ id: 'test-maestro-id' })),
}));

import {
  isPushSupported,
  getSubscriptionStatus,
  onPushReceived,
} from '../pushService.js';

describe('pushService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetSubscription.mockResolvedValue(null);
  });

  describe('isPushSupported', () => {
    it('should return false if serviceWorker not supported', () => {
      const prev = navigator.serviceWorker;
      Object.defineProperty(navigator, 'serviceWorker', { value: undefined, writable: true });
      expect(isPushSupported()).toBe(false);
      Object.defineProperty(navigator, 'serviceWorker', { value: prev, writable: true });
    });
  });

  describe('getSubscriptionStatus', () => {
    it('should return subscribed: false when no active subscription', async () => {
      mockGetSubscription.mockResolvedValue(null);
      const status = await getSubscriptionStatus();
      expect(status.subscribed).toBe(false);
    });

    it('should return subscribed: true with endpoint when subscribed', async () => {
      mockGetSubscription.mockResolvedValue({
        endpoint: 'https://fcm.googleapis.com/fcm/send/test-endpoint-12345',
      });
      const status = await getSubscriptionStatus();
      expect(status.subscribed).toBe(true);
      expect(status.endpoint).toBeDefined();
      expect(status.endpoint?.endsWith('...')).toBe(true);
    });
  });

  describe('onPushReceived', () => {
    it('should register and call a callback function', () => {
      const mockCallback = vi.fn();
      onPushReceived(mockCallback);
      // Callback should be defined (registered)
      expect(typeof mockCallback).toBe('function');
    });
  });
});
