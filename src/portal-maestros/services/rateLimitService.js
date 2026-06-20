/**
 * Client-side rate limiting
 */

const requestLog = new Map()

/**
 * Check if a request is allowed based on rate limits
 * @param {string} key - Unique identifier for the request type
 * @param {number} limit - Max requests in window
 * @param {number} windowMs - Time window in milliseconds
 * @returns {boolean}
 */
export function isAllowed(key, limit = 60, windowMs = 60000) {
  const now = Date.now()
  let timestamps = requestLog.get(key) || []
  
  // Cleanup old timestamps
  timestamps = timestamps.filter(ts => now - ts < windowMs)
  
  if (timestamps.length >= limit) {
    return false
  }
  
  timestamps.push(now)
  requestLog.set(key, timestamps)
  return true
}

export default { isAllowed }
