/**
 * Rate Limiting Middleware
 * 100 requests per minute per user
 */

const userRequests = new Map()
const cleanupTimers = new Map()

let config = {
  windowMs: 60000,
  max: 100,
}

/**
 * Initialize rate limiter
 * @param {Object} options
 * @param {number} options.windowMs - Time window in ms
 * @param {number} options.max - Max requests per window
 */
export function initRateLimit(options = {}) {
  config = { ...config, ...options }
  console.log(`[RateLimit] Initialized: ${config.max} requests per ${config.windowMs}ms`)
}

/**
 * Check rate limit for user
 * @param {string} userId - User identifier
 * @returns {Object} Rate limit status
 */
export function checkRateLimit(userId) {
  if (!userId) {
    return { allowed: false, error: 'No user ID provided' }
  }

  const now = Date.now()
  const windowStart = now - config.windowMs

  let userData = userRequests.get(userId)
  
  if (!userData || userData.windowStart < windowStart) {
    userData = {
      windowStart: now,
      requests: [],
    }
    userRequests.set(userId, userData)
  }

  const recentRequests = userData.requests.filter(ts => ts > windowStart)
  userData.requests = recentRequests

  const remaining = config.max - recentRequests.length
  const allowed = remaining > 0

  if (allowed) {
    userData.requests.push(now)
    scheduleCleanup(userId)
  }

  return {
    allowed,
    remaining: Math.max(0, remaining),
    total: config.max,
    resetTime: userData.windowStart + config.windowMs,
  }
}

/**
 * Get rate limit status for user
 * @param {string} userId - User identifier
 */
export function getRateLimitStatus(userId) {
  const now = Date.now()
  const windowStart = now - config.windowMs

  const userData = userRequests.get(userId)
  
  if (!userData) {
    return {
      total: config.max,
      used: 0,
      remaining: config.max,
    }
  }

  const recentRequests = userData.requests.filter(ts => ts > windowStart)

  return {
    total: config.max,
    used: recentRequests.length,
    remaining: Math.max(0, config.max - recentRequests.length),
    resetTime: userData.windowStart + config.windowMs,
  }
}

/**
 * Schedule cleanup for user data
 * @param {string} userId
 */
function scheduleCleanup(userId) {
  if (cleanupTimers.has(userId)) {
    clearTimeout(cleanupTimers.get(userId))
  }

  const timer = setTimeout(() => {
    userRequests.delete(userId)
    cleanupTimers.delete(userId)
  }, config.windowMs * 2)

  cleanupTimers.set(userId, timer)
}

/**
 * Clean up all rate limit data
 */
export function cleanup() {
  userRequests.clear()
  cleanupTimers.forEach(timer => clearTimeout(timer))
  cleanupTimers.clear()
}

/**
 * Express/framework compatible middleware
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 * @param {Function} next - Next middleware
 */
export function rateLimitMiddleware(req, res, next) {
  const userId = req.user?.id || req.ip || 'anonymous'
  const result = checkRateLimit(userId)

  res.set('X-RateLimit-Limit', config.max)
  res.set('X-RateLimit-Remaining', result.remaining)
  res.set('X-RateLimit-Reset', Math.ceil(result.resetTime / 1000))

  if (!result.allowed) {
    const error = new Error('Rate limit exceeded')
    error.statusCode = 429
    error.retryAfter = Math.ceil(config.windowMs / 1000)
    return next(error)
  }

  next()
}

export default {
  initRateLimit,
  checkRateLimit,
  getRateLimitStatus,
  cleanup,
  rateLimitMiddleware,
}