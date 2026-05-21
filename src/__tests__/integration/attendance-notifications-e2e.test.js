import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { parseDeepLink, navigateToDeepLink } from '../../portal-maestros/services/notificationService.js'

describe('Attendance Notification E2E Deep Link Flow', () => {
  let container

  beforeEach(() => {
    container = document.createElement('div')
    container.id = 'asistencia-container'
    document.body.appendChild(container)
    window.appNavigate = vi.fn()
  })

  afterEach(() => {
    container?.remove()
    delete window.appNavigate
  })

  it('should parse deep link and navigate to specific class attendance', () => {
    const deepLink = '/asistencia/550e8400-e29b-41d4-a716-446655440000/2026-05-20'

    const parsed = parseDeepLink(deepLink)
    expect(parsed.isValid).toBe(true)
    expect(parsed.claseId).toBe('550e8400-e29b-41d4-a716-446655440000')
    expect(parsed.fecha).toBe('2026-05-20')

    navigateToDeepLink(deepLink)
    expect(window.appNavigate).toHaveBeenCalledWith({
      view: 'asistencia',
      claseId: '550e8400-e29b-41d4-a716-446655440000',
      fecha: '2026-05-20'
    })
  })

  it('should handle multiple notifications with different classes', () => {
    const deepLinks = [
      '/asistencia/550e8400-e29b-41d4-a716-446655440000/2026-05-20',
      '/asistencia/660e8400-e29b-41d4-a716-446655440001/2026-05-20'
    ]

    const parsed1 = parseDeepLink(deepLinks[0])
    const parsed2 = parseDeepLink(deepLinks[1])

    expect(parsed1.claseId).not.toBe(parsed2.claseId)
    expect(parsed1.isValid).toBe(true)
    expect(parsed2.isValid).toBe(true)
    expect(parsed1.fecha).toBe(parsed2.fecha)
  })

  it('should handle malformed deep links gracefully', () => {
    const malformedLinks = [
      '/asistencia/invalid-uuid/2026-05-20',
      '/asistencia/550e8400-e29b-41d4-a716-446655440000/invalid-date',
      '/wrong-path/some-id/2026-05-20'
    ]

    malformedLinks.forEach(link => {
      const parsed = parseDeepLink(link)
      expect(parsed.isValid).toBe(false)
    })
  })
})
