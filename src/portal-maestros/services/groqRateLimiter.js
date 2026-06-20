const STORAGE_KEY = 'portal-maestros:groq-usage'

const DEFAULT_LIMITS = {
  requestsPerMinute: 10,
  requestsPerHour: 100,
  cacheTTL: 30 * 60 * 1000,
}

let config = { ...DEFAULT_LIMITS }

export function configureRateLimiter(opts) {
  config = { ...config, ...opts }
}

function _getUsage() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (!stored) return { requests: [], cache: {} }
    return JSON.parse(stored)
  } catch {
    return { requests: [], cache: {} }
  }
}

function _saveUsage(usage) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(usage))
  } catch { /* ignore */ }
}

function _cleanupOldRequests(usage) {
  const now = Date.now()
  const oneHourAgo = now - 3600000
  usage.requests = usage.requests.filter(ts => ts > oneHourAgo)
  return usage
}

function _getCacheEntry(usage, key) {
  const entry = usage.cache[key]
  if (!entry) return null
  if (Date.now() - entry.timestamp > config.cacheTTL) {
    delete usage.cache[key]
    return null
  }
  return entry
}

function _setCacheEntry(usage, key, value) {
  usage.cache[key] = { timestamp: Date.now(), value }
}

export function canMakeRequest() {
  const usage = _cleanupOldRequests(_getUsage())
  const now = Date.now()
  const oneMinuteAgo = now - 60000
  
  const requestsLastMinute = usage.requests.filter(ts => ts > oneMinuteAgo).length
  const requestsLastHour = usage.requests.length
  
  return {
    allowed: requestsLastMinute < config.requestsPerMinute && 
             requestsLastHour < config.requestsPerHour,
    remainingMinute: config.requestsPerMinute - requestsLastMinute,
    remainingHour: config.requestsPerHour - requestsLastHour,
    resetIn: Math.max(60000 - (now - Math.max(...usage.requests.filter(ts => ts > oneMinuteAgo), 0)), 0)
  }
}

export function recordRequest() {
  const usage = _getUsage()
  usage.requests.push(Date.now())
  _saveUsage(usage)
}

export function getCachedResponse(promptKey) {
  const usage = _getUsage()
  const entry = _getCacheEntry(usage, promptKey)
  return entry?.value || null
}

export function setCachedResponse(promptKey, response) {
  const usage = _getUsage()
  _setCacheEntry(usage, promptKey, response)
  _saveUsage(usage)
}

export function clearCache() {
  const usage = _getUsage()
  usage.cache = {}
  _saveUsage(usage)
}

export function getUsageStats() {
  const usage = _cleanupOldRequests(_getUsage())
  const now = Date.now()
  const oneMinuteAgo = now - 60000
  
  return {
    requestsThisMinute: usage.requests.filter(ts => ts > oneMinuteAgo).length,
    requestsThisHour: usage.requests.length,
    cacheSize: Object.keys(usage.cache).length,
    limitMinute: config.requestsPerMinute,
    limitHour: config.requestsPerHour
  }
}

export async function withRateLimit(fn, cacheKey = null) {
  const status = canMakeRequest()
  
  if (!status.allowed) {
    const waitTime = Math.ceil(status.resetIn / 1000)
    throw new Error(`Límite alcanzado. Espera ${waitTime}s antes de intentar de nuevo.`)
  }
  
  if (cacheKey) {
    const cached = getCachedResponse(cacheKey)
    if (cached) {
      return { fromCache: true, data: cached }
    }
  }
  
  const result = await fn()
  
  recordRequest()
  
  if (cacheKey) {
    setCachedResponse(cacheKey, result)
  }
  
  return { fromCache: false, data: result }
}