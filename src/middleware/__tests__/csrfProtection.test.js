import { describe, it, expect, beforeEach, vi } from 'vitest'
import { generateToken, validateToken, getToken, initCSRF } from '../csrfProtection.js'

describe('csrfProtection', () => {
  beforeEach(() => {
    initCSRF()
  })

  it('generates a CSRF token', () => {
    const token = generateToken()
    expect(token).toBeDefined()
    expect(token.length).toBeGreaterThan(10)
  })

  it('generates unique tokens each time', () => {
    const token1 = generateToken()
    const token2 = generateToken()
    expect(token1).not.toBe(token2)
  })

  it('validates correct token', () => {
    const token = generateToken()
    const valid = validateToken(token)
    expect(valid).toBe(true)
  })

  it('rejects invalid token', () => {
    const valid = validateToken('invalid-token')
    expect(valid).toBe(false)
  })

  it('rejects empty token', () => {
    const valid = validateToken('')
    expect(valid).toBe(false)
  })

  it('gets token from storage', () => {
    const token = generateToken()
    const stored = getToken()
    expect(stored).toBe(token)
  })

  it('works with form submission pattern', () => {
    const formToken = generateToken()
    const result = validateToken(formToken)
    expect(result).toBe(true)
  })
})