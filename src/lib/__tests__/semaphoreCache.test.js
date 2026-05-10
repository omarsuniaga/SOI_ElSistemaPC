import { describe, it, expect, beforeEach, vi } from 'vitest'
import { SemaphoreCache } from '../semaphoreCache.js'

describe('SemaphoreCache', () => {
  let cache

  beforeEach(() => {
    cache = new SemaphoreCache()
  })

  describe('constructor', () => {
    it('should create instance with default ttl', () => {
      expect(cache).toBeDefined()
      expect(cache.ttl).toBe(60000) // 60 seconds default
    })

    it('should create instance with custom ttl', () => {
      const customCache = new SemaphoreCache({ ttl: 120000 })
      expect(customCache.ttl).toBe(120000)
    })
  })

  describe('set', () => {
    it('should store a value with key', () => {
      cache.set('node-1', 'green')
      expect(cache.get('node-1')).toBe('green')
    })

    it('should overwrite existing value', () => {
      cache.set('node-1', 'green')
      cache.set('node-1', 'yellow')
      expect(cache.get('node-1')).toBe('yellow')
    })

    it('should handle multiple keys', () => {
      cache.set('node-1', 'green')
      cache.set('node-2', 'yellow')
      cache.set('node-3', 'gray')

      expect(cache.get('node-1')).toBe('green')
      expect(cache.get('node-2')).toBe('yellow')
      expect(cache.get('node-3')).toBe('gray')
    })
  })

  describe('get', () => {
    it('should return null for non-existent key', () => {
      expect(cache.get('non-existent')).toBeNull()
    })

    it('should return cached value before expiry', () => {
      cache.set('node-1', 'green')
      expect(cache.get('node-1')).toBe('green')
    })

    it('should return null for expired entry', (done) => {
      const shortTtl = new SemaphoreCache({ ttl: 50 })
      shortTtl.set('node-1', 'green')

      setTimeout(() => {
        expect(shortTtl.get('node-1')).toBeNull()
        done()
      }, 100)
    })
  })

  describe('has', () => {
    it('should return true for existing key', () => {
      cache.set('node-1', 'green')
      expect(cache.has('node-1')).toBe(true)
    })

    it('should return false for non-existent key', () => {
      expect(cache.has('node-1')).toBe(false)
    })

    it('should return false for expired key', (done) => {
      const shortTtl = new SemaphoreCache({ ttl: 50 })
      shortTtl.set('node-1', 'green')

      setTimeout(() => {
        expect(shortTtl.has('node-1')).toBe(false)
        done()
      }, 100)
    })
  })

  describe('delete', () => {
    it('should remove a key', () => {
      cache.set('node-1', 'green')
      cache.delete('node-1')
      expect(cache.has('node-1')).toBe(false)
    })

    it('should not throw for non-existent key', () => {
      expect(() => cache.delete('non-existent')).not.toThrow()
    })
  })

  describe('clear', () => {
    it('should remove all keys', () => {
      cache.set('node-1', 'green')
      cache.set('node-2', 'yellow')
      cache.clear()

      expect(cache.has('node-1')).toBe(false)
      expect(cache.has('node-2')).toBe(false)
    })
  })

  describe('size', () => {
    it('should return number of keys', () => {
      cache.set('node-1', 'green')
      cache.set('node-2', 'yellow')
      expect(cache.size()).toBe(2)
    })

    it('should return 0 for empty cache', () => {
      expect(cache.size()).toBe(0)
    })

    it('should not count expired entries', (done) => {
      const shortTtl = new SemaphoreCache({ ttl: 50 })
      shortTtl.set('node-1', 'green')

      setTimeout(() => {
        expect(shortTtl.size()).toBe(0)
        done()
      }, 100)
    })
  })

  describe('batchSet', () => {
    it('should set multiple entries at once', () => {
      const batch = new Map([
        ['node-1', 'green'],
        ['node-2', 'yellow'],
        ['node-3', 'gray'],
      ])
      cache.batchSet(batch)

      expect(cache.get('node-1')).toBe('green')
      expect(cache.get('node-2')).toBe('yellow')
      expect(cache.get('node-3')).toBe('gray')
    })

    it('should handle empty batch', () => {
      cache.batchSet(new Map())
      expect(cache.size()).toBe(0)
    })
  })

  describe('batchGet', () => {
    it('should return map of cached values', () => {
      cache.set('node-1', 'green')
      cache.set('node-2', 'yellow')

      const keys = ['node-1', 'node-2']
      const result = cache.batchGet(keys)

      expect(result.get('node-1')).toBe('green')
      expect(result.get('node-2')).toBe('yellow')
    })

    it('should only return keys that exist and are not expired', () => {
      cache.set('node-1', 'green')
      cache.set('node-2', 'yellow')

      const keys = ['node-1', 'node-2', 'node-3']
      const result = cache.batchGet(keys)

      expect(result.size).toBe(2)
      expect(result.has('node-3')).toBe(false)
    })
  })

  describe('invalidatePrefix', () => {
    it('should remove entries matching prefix', () => {
      cache.set('node-1', 'green')
      cache.set('node-2', 'yellow')
      cache.set('clase-1', 'gray')

      cache.invalidatePrefix('node-')

      expect(cache.has('node-1')).toBe(false)
      expect(cache.has('node-2')).toBe(false)
      expect(cache.has('clase-1')).toBe(true)
    })

    it('should not throw for non-matching prefix', () => {
      cache.set('node-1', 'green')
      expect(() => cache.invalidatePrefix('clase-')).not.toThrow()
    })
  })
})
