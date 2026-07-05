import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock function for Service Worker API
let mockSubscriptionData = null;
const mockGetSubscription = vi.fn(async () => mockSubscriptionData);

// Create mock navigator with proper Service Worker APIs
const createMockNavigator = (supportsPush = true) => {
  if (supportsPush) {
    return {
      serviceWorker: {
        ready: Promise.resolve({
          pushManager: {
            getSubscription: mockGetSubscription,
          },
        }),
      },
      userAgent: 'test-agent',
    };
  }
  return {
    serviceWorker: undefined,
    userAgent: 'test-agent',
  };
};

// Setup global mocks
vi.stubGlobal('navigator', createMockNavigator(true));
vi.stubGlobal('PushManager', {});
vi.stubGlobal('Notification', { permission: 'default' });

// Mock supabase
vi.mock('../../../lib/supabaseClient.js', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => Promise.resolve({ data: null })),
      upsert: vi.fn(() => Promise.resolve({ error: null })),
      update: vi.fn(() => ({ eq: vi.fn(() => Promise.resolve({ error: null })) })),
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
    mockSubscriptionData = null;
  });

  describe('getSubscriptionStatus', () => {
    it('should return object with subscribed property', async () => {
      mockSubscriptionData = null;
      const status = await getSubscriptionStatus();
      expect(status).toHaveProperty('subscribed');
      expect(typeof status.subscribed).toBe('boolean');
    });

    it('should return subscribed false when no active subscription', async () => {
      mockSubscriptionData = null;
      const status = await getSubscriptionStatus();
      expect(status.subscribed).toBe(false);
    });

    it('should return subscribed true with truncated endpoint when subscribed', async () => {
      const longEndpoint = 'https://fcm.googleapis.com/fcm/send/test-endpoint-12345-very-long';
      mockSubscriptionData = {
        endpoint: longEndpoint,
      };
      const status = await getSubscriptionStatus();
      expect(status.subscribed).toBe(true);
      expect(status.endpoint).toBeDefined();
      expect(status.endpoint).toContain('...');
      expect(status.endpoint.length).toBeLessThan(longEndpoint.length);
    });

    it('should handle errors gracefully', async () => {
      mockGetSubscription.mockRejectedValueOnce(new Error('ServiceWorker error'));
      const status = await getSubscriptionStatus();
      expect(status.subscribed).toBe(false);
      expect(status.error).toBeDefined();
    });
  });

  describe('isPushSupported', () => {
    it('should return true when all APIs are available', () => {
      vi.stubGlobal('navigator', {
        serviceWorker: { ready: Promise.resolve({}) },
        userAgent: 'test',
      });
      vi.stubGlobal('window', { PushManager: true, Notification: {} });
      expect(isPushSupported()).toBe(true);
    });

    it('should return false when serviceWorker not available', () => {
      vi.stubGlobal('navigator', { userAgent: 'test' });
      expect(isPushSupported()).toBe(false);
    });

    it('should return false when PushManager not available', () => {
      vi.stubGlobal('navigator', {
        serviceWorker: { ready: Promise.resolve({}) },
        userAgent: 'test',
      });
      vi.stubGlobal('window', { Notification: {} });
      expect(isPushSupported()).toBe(false);
    });

    it('should return false when Notification not available', () => {
      vi.stubGlobal('navigator', {
        serviceWorker: { ready: Promise.resolve({}) },
        userAgent: 'test',
      });
      vi.stubGlobal('window', { PushManager: true });
      expect(isPushSupported()).toBe(false);
    });
  });

  describe('onPushReceived', () => {
    it('should register a callback function without error', () => {
      const mockCallback = vi.fn();
      expect(() => onPushReceived(mockCallback)).not.toThrow();
    });

    it('should accept a function callback', () => {
      const callback = (event) => {
        console.log('Push received:', event);
      };
      expect(() => onPushReceived(callback)).not.toThrow();
    });

    it('should allow registering multiple callbacks', () => {
      const callback1 = vi.fn();
      const callback2 = vi.fn();
      expect(() => {
        onPushReceived(callback1);
        onPushReceived(callback2);
      }).not.toThrow();
    });
  });
});
