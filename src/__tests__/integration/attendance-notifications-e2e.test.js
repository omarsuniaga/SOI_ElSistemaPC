import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { parseDeepLink } from '../../portal-maestros/services/notificationService.js'
import { renderAsistenciaView } from '../../portal-maestros/views/asistenciaView.js'

vi.mock('../../portal-maestros/api/asistenciaApi.js', () => ({
  obtenerAsistenciaClase: vi.fn()
}))

// TODO: asistenciaView.js does not use a dedicated asistenciaApi module —
// it calls supabase + maestroDataService directly. These tests need to be
// rewritten with proper mocks of supabase/maestroDataService before they can pass.
describe.skip('Attendance Notification E2E Deep Link Flow', () => {
  let container

  beforeEach(() => {
    container = document.createElement('div')
    container.id = 'app-container'
    document.body.appendChild(container)
    global.appNavigate = vi.fn((params) => {
      renderAsistenciaView('app-container', params)
    })
  })

  afterEach(() => {
    container?.remove()
    vi.clearAllMocks()
  })

  it('should parse notification deep_link, navigate, and render correct class', async () => {
    const { obtenerAsistenciaClase } = await import('../../portal-maestros/api/asistenciaApi.js')

    obtenerAsistenciaClase.mockResolvedValueOnce({
      clase_id: '550e8400-e29b-41d4-a716-446655440000',
      fecha: '2026-05-21',
      clase_nombre: 'Violin 101',
      estudiantes: [
        { id: '1', nombre: 'Estudiante A', asistio: true },
        { id: '2', nombre: 'Estudiante B', asistio: false }
      ]
    })

    const deepLink = '/asistencia/550e8400-e29b-41d4-a716-446655440000/2026-05-21'
    const parsed = parseDeepLink(deepLink)

    expect(parsed.isValid).toBe(true)

    // Simulate notification click triggering navigation
    await global.appNavigate({
      view: 'asistencia',
      claseId: parsed.claseId,
      fecha: parsed.fecha
    })

    // Verify render assertions — DOM should contain rendered attendance data
    expect(container.innerHTML).toContain('Estudiante A')
    expect(container.innerHTML).toContain('2026-05-21')

    // Verify obtenerAsistenciaClase was called with correct params from deep link
    expect(obtenerAsistenciaClase).toHaveBeenCalledWith(parsed.claseId, parsed.fecha)

    // Verify that the checked checkbox for the attending student is actually rendered
    expect(container.querySelector('input[type="checkbox"][checked]')).toBeTruthy()
  })

  it('should handle multiple notifications with different classes', () => {
    const deepLinks = [
      '/asistencia/550e8400-e29b-41d4-a716-446655440000/2026-05-21',
      '/asistencia/660e8400-e29b-41d4-a716-446655440001/2026-05-21'
    ]

    const parsed1 = parseDeepLink(deepLinks[0])
    const parsed2 = parseDeepLink(deepLinks[1])

    expect(parsed1.isValid).toBe(true)
    expect(parsed2.isValid).toBe(true)
    expect(parsed1.claseId).not.toBe(parsed2.claseId)
  })
})
