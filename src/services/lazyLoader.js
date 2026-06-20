/**
 * Lazy Loader for Routes
 * Implements code splitting for non-critical routes
 */

const routeCache = new Map()
const preloadedRoutes = new Set()

/**
 * Create a lazy-loaded route
 * @param {string} path - Route path
 * @param {Function} loader - Function that returns a promise with the component
 * @returns {Object} Route object with loader method
 */
export function lazyLoadRoute(path, loader) {
  return {
    path,
    loader: async () => {
      if (routeCache.has(path)) {
        console.log(`[LazyLoader] Cache hit: ${path}`)
        return routeCache.get(path)
      }

      console.log(`[LazyLoader] Loading: ${path}`)
      const startTime = performance.now()
      
      try {
        const component = await loader()
        const duration = performance.now() - startTime
        
        routeCache.set(path, component)
        
        if (duration > 1000) {
          console.warn(`[LazyLoader] Slow load: ${path} (${duration.toFixed(0)}ms)`)
        }
        
        return component
      } catch (error) {
        console.error(`[LazyLoader] Failed to load ${path}:`, error)
        throw error
      }
    },
    isLoaded: () => routeCache.has(path),
  }
}

/**
 * Preload a route for faster navigation
 * @param {string} path - Route path
 * @param {Object} routes - Registered routes
 */
export async function preloadRoute(path, routes = {}) {
  if (preloadedRoutes.has(path)) {
    return
  }

  const route = routes[path]
  if (!route || !route.loader) {
    console.warn(`[LazyLoader] Cannot preload unknown route: ${path}`)
    return
  }

  console.log(`[LazyLoader] Preloading: ${path}`)
  await route.loader()
  preloadedRoutes.add(path)
}

/**
 * Get list of loaded routes
 * @returns {string[]} Array of loaded route paths
 */
export function getLoadedRoutes() {
  return Array.from(routeCache.keys())
}

/**
 * Clear the route cache
 */
export function clearCache() {
  routeCache.clear()
  preloadedRoutes.clear()
  console.log('[LazyLoader] Cache cleared')
}

/**
 * Get cache statistics
 */
export function getCacheStats() {
  return {
    loadedRoutes: routeCache.size,
    preloadedRoutes: preloadedRoutes.size,
    cacheKeys: Array.from(routeCache.keys()),
  }
}

/**
 * Dynamic import wrapper for code splitting
 * @param {string} modulePath - Path to module
 */
export function dynamicImport(modulePath) {
  console.log(`[LazyLoader] Dynamic import: ${modulePath}`)
  return import(modulePath)
}

export default {
  lazyLoadRoute,
  preloadRoute,
  getLoadedRoutes,
  clearCache,
  getCacheStats,
  dynamicImport,
}