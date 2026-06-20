/**
 * Basic CSRF Protection Service
 */

const TOKEN_KEY = 'pm-csrf-token'

export function generateCSRFToken() {
  const token = Math.random().toString(36).substring(2) + Date.now().toString(36)
  localStorage.setItem(TOKEN_KEY, token)
  return token
}

export function getCSRFToken() {
  let token = localStorage.getItem(TOKEN_KEY)
  if (!token) {
    token = generateCSRFToken()
  }
  return token
}

export function validateCSRFToken(receivedToken) {
  const storedToken = localStorage.getItem(TOKEN_KEY)
  return storedToken && storedToken === receivedToken
}

export default {
  generateCSRFToken,
  getCSRFToken,
  validateCSRFToken
}
