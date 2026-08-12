/**
 * ViewCache - Capa de Cache SWR (Stale-While-Revalidate) para el Portal Maestros.
 *
 * Características:
 *  1. Cache en memoria con expiración por TTL.
 *  2. Soporte SWR (getStale): devuelve datos de inmediato (<1ms) y permite refrescar en segundo plano.
 *  3. Respaldo en sessionStorage para restaurar datos críticos en arranques y recargas de página.
 */

const CACHE_TTL = {
  misClases: 600000,       // 10 minutos — cambian rara vez
  horarios: 600000,        // 10 minutos — cambian rara vez
  sesiones: 120000,        // 2 minutos — se invalida manualmente al guardar
  inscripciones: 600000,   // 10 minutos — cambian rara vez
  salones: 3600000,        // 1 hora
  ausencias: 120000,       // 2 minutos
  metricasSesiones: 120000, // 2 minutos
  alumnos: 300000,         // 5 minutos
}

const STORAGE_PREFIX = 'pm_cache_'
const PERSISTENT_TTL_KEYS = new Set(['misClases', 'horarios', 'salones', 'inscripciones'])

let cache = new Map()
let cacheMeta = new Map()

// Cargar backup inicial de sessionStorage si existe
try {
  if (typeof window !== 'undefined' && window.sessionStorage) {
    for (let i = 0; i < window.sessionStorage.length; i++) {
      const storageKey = window.sessionStorage.key(i)
      if (storageKey?.startsWith(STORAGE_PREFIX)) {
        const raw = window.sessionStorage.getItem(storageKey)
        if (raw) {
          const { key, data, timestamp, ttl } = JSON.parse(raw)
          cache.set(key, data)
          cacheMeta.set(key, { timestamp, ttl })
        }
      }
    }
  }
} catch {
  // Ignorar errores de sessionStorage (modo incógnito estricto o cuotas)
}

function _isValid(key) {
  const meta = cacheMeta.get(key)
  if (!meta) return false
  return Date.now() - meta.timestamp < meta.ttl
}

function _set(key, data, ttl, persist = false) {
  cache.set(key, data)
  const meta = { timestamp: Date.now(), ttl: ttl || 60000 }
  cacheMeta.set(key, meta)

  if (persist && typeof window !== 'undefined' && window.sessionStorage) {
    try {
      window.sessionStorage.setItem(
        `${STORAGE_PREFIX}${key}`,
        JSON.stringify({ key, data, timestamp: meta.timestamp, ttl: meta.ttl }),
      )
    } catch {
      // Ignore quota exceeded
    }
  }
}

export function get(key) {
  if (!_isValid(key)) {
    return null
  }
  return cache.get(key)
}

/**
 * Obtiene datos en modo SWR (Stale-While-Revalidate).
 * Devuelve los datos existentes de inmediato (aunque hayan expirado)
 * e indica con `isStale` si se debe disparar un refresco en segundo plano.
 *
 * @param {string} key
 * @returns {{ data: any, isStale: boolean } | null}
 */
export function getStale(key) {
  if (!cache.has(key)) return null
  const data = cache.get(key)
  const isStale = !_isValid(key)
  return { data, isStale }
}

export function set(key, data, ttlKey) {
  const ttl = CACHE_TTL[ttlKey] || 60000
  const persist = PERSISTENT_TTL_KEYS.has(ttlKey)
  _set(key, data, ttl, persist)
}

export function invalidate(pattern) {
  for (const key of cache.keys()) {
    if (key.includes(pattern)) {
      cache.delete(key)
      cacheMeta.delete(key)
      if (typeof window !== 'undefined' && window.sessionStorage) {
        try {
          window.sessionStorage.removeItem(`${STORAGE_PREFIX}${key}`)
        } catch {
          // Ignore
        }
      }
    }
  }
}

export function invalidateAll() {
  cache.clear()
  cacheMeta.clear()
  if (typeof window !== 'undefined' && window.sessionStorage) {
    try {
      const keysToRemove = []
      for (let i = 0; i < window.sessionStorage.length; i++) {
        const k = window.sessionStorage.key(i)
        if (k?.startsWith(STORAGE_PREFIX)) keysToRemove.push(k)
      }
      keysToRemove.forEach((k) => window.sessionStorage.removeItem(k))
    } catch {
      // Ignore
    }
  }
}

export function getCached(key) {
  return get(key)
}

export function keys() {
  return [...cache.keys()]
}

export default { get, getStale, set, invalidate, invalidateAll, getCached, _keys: keys }