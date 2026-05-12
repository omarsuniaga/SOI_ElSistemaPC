/**
 * Service Worker Caching Strategy
 * Implements offline-first caching for PWA
 */

const CACHE_VERSION = 'v1'
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/sw.js',
]

const CACHE_STRATEGIES = {
  STATIC: 'cache-first',
  API: 'network-first',
  DYNAMIC: 'stale-while-revalidate',
}

const NO_CACHE_PATHS = [
  '/auth/',
  '/login',
  '/logout',
]

/**
 * Get caching strategy for a request
 * @param {string} url - Request URL
 * @returns {string} Strategy name
 */
export function getCacheStrategy(url) {
  if (url.includes('/static/') || url.includes('.js') || url.includes('.css') || url.includes('.woff')) {
    return CACHE_STRATEGIES.STATIC
  }
  
  if (url.includes('/api/')) {
    if (url.includes('/notifications') || url.includes('/messages')) {
      return CACHE_STRATEGIES.DYNAMIC
    }
    return CACHE_STRATEGIES.API
  }
  
  return CACHE_STRATEGIES.STATIC
}

/**
 * Determine if request should be cached
 * @param {string} url - Request URL
 * @returns {boolean}
 */
export function shouldCache(url) {
  for (const noCache of NO_CACHE_PATHS) {
    if (url.includes(noCache)) {
      return false
    }
  }
  
  if (url.includes('/api/')) {
    return true
  }
  
  if (url.includes('/static/') || url.includes('.js') || url.includes('.css')) {
    return true
  }
  
  return false
}

/**
 * Get current cache version
 * @returns {string}
 */
export function getCacheVersion() {
  return CACHE_VERSION
}

/**
 * Get list of static assets to cache
 * @returns {string[]}
 */
export function getStaticAssets() {
  return [...STATIC_ASSETS]
}

/**
 * Clear app cache
 * @returns {Promise<Object>}
 */
export async function clearAppCache() {
  if (typeof caches === 'undefined') {
    return { success: false, error: 'Caches API not available' }
  }
  
  try {
    const cacheNames = await caches.keys()
    const deletePromises = cacheNames.map(name => caches.delete(name))
    await Promise.all(deletePromises)
    
    console.log('[SW] All caches cleared')
    return { success: true, deleted: cacheNames.length }
  } catch (error) {
    console.error('[SW] Failed to clear cache:', error)
    return { success: false, error: error.message }
  }
}

/**
 * Cache a specific response
 * @param {string} cacheName - Cache name
 * @param {Request} request - Request
 * @param {Response} response - Response
 */
export async function cacheResponse(cacheName, request, response) {
  if (typeof caches === 'undefined') return
  
  try {
    const cache = await caches.open(cacheName)
    await cache.put(request, response.clone())
  } catch (error) {
    console.warn('[SW] Failed to cache response:', error)
  }
}

/**
 * Get cached response if available
 * @param {string} url - Request URL
 * @returns {Promise<Response|null>}
 */
export async function getCachedResponse(url) {
  if (typeof caches === 'undefined') return null
  
  try {
    const cache = await caches.open(CACHE_VERSION)
    return await cache.match(url)
  } catch (error) {
    return null
  }
}

/**
 * Register service worker
 * @returns {Promise<Registration|null>}
 */
export async function registerServiceWorker() {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
    console.warn('[SW] Service Worker not supported')
    return null
  }
  
  try {
    const registration = await navigator.serviceWorker.register('/sw.js', {
      scope: '/',
    })
    
    console.log('[SW] Registered:', registration.scope)
    return registration
  } catch (error) {
    console.error('[SW] Registration failed:', error)
    return null
  }
}

export default {
  getCacheStrategy,
  shouldCache,
  getCacheVersion,
  getStaticAssets,
  clearAppCache,
  cacheResponse,
  getCachedResponse,
  registerServiceWorker,
}