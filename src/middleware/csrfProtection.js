/**
 * CSRF Protection Middleware
 * Token-based CSRF protection for state-changing requests
 */

let currentToken = null
let tokenHistory = new Set()

function generateRandomToken(length = 32) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let result = ''
  const values = new Uint32Array(length)
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    crypto.getRandomValues(values)
  } else {
    for (let i = 0; i < length; i++) {
      values[i] = Math.floor(Math.random() * chars.length)
    }
  }
  for (let i = 0; i < length; i++) {
    result += chars[values[i] % chars.length]
  }
  return result
}

/**
 * Initialize CSRF protection
 * @param {Object} options
 */
export function initCSRF(options = {}) {
  currentToken = generateRandomToken(options.length || 32)
  tokenHistory.clear()
  tokenHistory.add(currentToken)
  console.log('[CSRF] Initialized')
}

/**
 * Generate a new CSRF token
 * @returns {string} CSRF token
 */
export function generateToken() {
  currentToken = generateRandomToken()
  tokenHistory.add(currentToken)
  
  if (tokenHistory.size > 10) {
    const oldest = tokenHistory.values().next().value
    tokenHistory.delete(oldest)
  }
  
  return currentToken
}

/**
 * Validate CSRF token
 * @param {string} token - Token to validate
 * @returns {boolean} Whether token is valid
 */
export function validateToken(token) {
  if (!token || typeof token !== 'string') {
    return false
  }
  
  if (token === currentToken) {
    return true
  }
  
  if (tokenHistory.has(token)) {
    return true
  }
  
  return false
}

/**
 * Get current CSRF token
 * @returns {string|null} Current token
 */
export function getToken() {
  return currentToken
}

/**
 * Create hidden input for forms
 * @returns {string} HTML input element
 */
export function createTokenInput() {
  return `<input type="hidden" name="csrf" value="${currentToken}">`
}

/**
 * CSRF middleware for fetch/XHR requests
 * @param {Object} options - Fetch options
 * @returns {Object} Modified fetch options
 */
export function csrfMiddleware(options = {}) {
  const csrfToken = getToken()
  
  if (!csrfToken) {
    console.warn('[CSRF] No token available')
    return options
  }
  
  return {
    ...options,
    headers: {
      ...options.headers,
      'X-CSRF-Token': csrfToken,
    },
  }
}

export default {
  initCSRF,
  generateToken,
  validateToken,
  getToken,
  createTokenInput,
  csrfMiddleware,
}