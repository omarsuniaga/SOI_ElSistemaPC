import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderAsistenciaView } from '../asistenciaView.js'

vi.mock('../../api/asistenciaApi.js', () => ({
  obtenerAsistenciaClase: vi.fn().mockResolvedValue({
    clase_id: '550e8400-e29b-41d4-a716-446655440000',
    fecha: '2026-05-21',
    estudiantes: [
      { id: '1', nombre: 'Estudiante 1', asistio: null },
      { id: '2', nombre: 'Estudiante 2', asistio: true }
    ]
  })
}))

describe('Asistencia View Direct Navigation', () => {
  let container

  beforeEach(() => {
    container = document.createElement('div')
    container.id = 'asistencia-container'
    document.body.appendChild(container)
  })

  afterEach(() => {
    container?.remove()
  })

  it('should load and render specific class asistencia when claseId and fecha are provided', async () => {
    const params = {
      claseId: '550e8400-e29b-41d4-a716-446655440000',
      fecha: '2026-05-21'
    }

    await renderAsistenciaView('asistencia-container', params)

    expect(container.innerHTML).toContain('Estudiante 1')
    expect(container.innerHTML).toContain('Estudiante 2')
    expect(container.innerHTML).toContain('2026-05-21')
  })

  it('should have title showing class date', async () => {
    const params = {
      claseId: '550e8400-e29b-41d4-a716-446655440000',
      fecha: '2026-05-21'
    }

    await renderAsistenciaView('asistencia-container', params)

    const titleElement = container.querySelector('h2, h3, [data-testid="asistencia-title"]')
    expect(titleElement?.textContent).toContain('2026-05-21')
  })
})
