/**
 * ViewCache - Cache en memoria para datos de vistas del Portal Maestros
 * Evita consultas redundantes a Supabase al navegar entre vistas
 */

const CACHE_TTL = {
  misClases: 600000,       // 10 minutos — cambian rara vez
  horarios: 600000,        // 10 minutos — cambian rara vez
  sesiones: 120000,        // 2 minutos — se invalida manualmente al guardar
  inscripciones: 600000,   // 10 minutos — cambian rara vez
  salones: 3600000,        // 1 hora
  ausencias: 120000,       // 2 minutos
  metricasSesiones: 120000 // 2 minutos
}

let cache = new Map()
let cacheMeta = new Map()

function _isValid(key) {
  const meta = cacheMeta.get(key)
  if (!meta) return false
  return Date.now() - meta.timestamp < meta.ttl
}

function _set(key, data, ttl) {
  cache.set(key, data)
  cacheMeta.set(key, { timestamp: Date.now(), ttl: ttl || 60000 })
}

export function get(key) {
  if (!_isValid(key)) {
    cache.delete(key)
    cacheMeta.delete(key)
    return null
  }
  return cache.get(key)
}

export function set(key, data, ttlKey) {
  const ttl = CACHE_TTL[ttlKey] || 60000
  _set(key, data, ttl)
}

export function invalidate(pattern) {
  for (const key of cache.keys()) {
    if (key.includes(pattern)) {
      cache.delete(key)
      cacheMeta.delete(key)
    }
  }
}

export function invalidateAll() {
  cache.clear()
  cacheMeta.clear()
}

export function getCached(key) {
  return get(key)
}

export function keys() {
  return [...cache.keys()]
}

export default { get, set, invalidate, invalidateAll, getCached, _keys: keys }