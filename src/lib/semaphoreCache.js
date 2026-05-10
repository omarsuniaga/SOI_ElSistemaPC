/**
 * SemaphoreCache - A time-based cache for storing semaphore states.
 * Each entry expires after a configurable TTL (time-to-live).
 */
export class SemaphoreCache {
  /**
   * @param {Object} options
   * @param {number} options.ttl - Time-to-live in milliseconds (default: 60000 = 60 seconds)
   */
  constructor(options = {}) {
    this.ttl = options.ttl ?? 60000
    this.store = new Map()
  }

  /**
   * Set a value with automatic expiry.
   * @param {string} key
   * @param {string} value - semaphore state ('green', 'yellow', 'gray')
   */
  set(key, value) {
    const expiry = Date.now() + this.ttl
    this.store.set(key, { value, expiry })
  }

  /**
   * Get a value if it exists and hasn't expired.
   * @param {string} key
   * @returns {string|null}
   */
  get(key) {
    const entry = this.store.get(key)
    if (!entry) return null

    if (Date.now() > entry.expiry) {
      this.store.delete(key)
      return null
    }

    return entry.value
  }

  /**
   * Check if a key exists and hasn't expired.
   * @param {string} key
   * @returns {boolean}
   */
  has(key) {
    const entry = this.store.get(key)
    if (!entry) return false

    if (Date.now() > entry.expiry) {
      this.store.delete(key)
      return false
    }

    return true
  }

  /**
   * Remove a key from the cache.
   * @param {string} key
   */
  delete(key) {
    this.store.delete(key)
  }

  /**
   * Clear all entries from the cache.
   */
  clear() {
    this.store.clear()
  }

  /**
   * Get the number of non-expired entries in the cache.
   * @returns {number}
   */
  size() {
    let count = 0
    for (const [key, entry] of this.store) {
      if (Date.now() > entry.expiry) {
        this.store.delete(key)
      } else {
        count++
      }
    }
    return count
  }

  /**
   * Set multiple entries at once.
   * @param {Map<string, string>} batch
   */
  batchSet(batch) {
    for (const [key, value] of batch) {
      this.set(key, value)
    }
  }

  /**
   * Get multiple entries at once. Only returns non-expired entries.
   * @param {string[]} keys
   * @returns {Map<string, string>}
   */
  batchGet(keys) {
    const result = new Map()
    for (const key of keys) {
      const value = this.get(key)
      if (value !== null) {
        result.set(key, value)
      }
    }
    return result
  }

  /**
   * Remove all entries that start with a given prefix.
   * @param {string} prefix
   */
  invalidatePrefix(prefix) {
    const keysToDelete = []
    for (const key of this.store.keys()) {
      if (key.startsWith(prefix)) {
        keysToDelete.push(key)
      }
    }
    for (const key of keysToDelete) {
      this.store.delete(key)
    }
  }
}
