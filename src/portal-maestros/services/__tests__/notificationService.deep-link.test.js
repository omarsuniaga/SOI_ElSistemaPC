// src/portal-maestros/services/__tests__/notificationService.deep-link.test.js
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { parseDeepLink, navigateToDeepLink } from '../notificationService.js'

describe('Deep Link Handling', () => {
  beforeEach(() => {
    // Mock window.appNavigate so navigateToDeepLink can call it
    globalThis.window.appNavigate = vi.fn()
    globalThis.mockNavigate = globalThis.window.appNavigate
  })

  it('should parse deep_link and extract claseId and fecha', () => {
    const deepLink = '/asistencia/550e8400-e29b-41d4-a716-446655440000/2026-05-21'
    const result = parseDeepLink(deepLink)

    expect(result).toEqual({
      claseId: '550e8400-e29b-41d4-a716-446655440000',
      fecha: '2026-05-21',
      isValid: true
    })
  })

  it('should return isValid false for malformed deep_link', () => {
    const deepLink = '/asistencia/invalid'
    const result = parseDeepLink(deepLink)

    expect(result.isValid).toBe(false)
  })

  it('should navigate to asistenciaView with claseId and fecha', () => {
    const deepLink = '/asistencia/550e8400-e29b-41d4-a716-446655440000/2026-05-21'
    navigateToDeepLink(deepLink)

    expect(globalThis.mockNavigate).toHaveBeenCalledWith({
      view: 'asistencia',
      claseId: '550e8400-e29b-41d4-a716-446655440000',
      fecha: '2026-05-21'
    })
  })
})
