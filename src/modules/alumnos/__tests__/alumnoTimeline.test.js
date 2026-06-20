/**
 * alumnoTimeline.test.js
 * B06: AlumnoTimeline cleanup tests
 *   - no Chinese/corrupted characters in production output
 *   - no Math.random for event generation
 *   - empty state when isDemoMode=false and events=[]
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock loadJsonMock to avoid actual file reads
vi.mock('../../../core/utils/loadJsonMock.js', () => ({
  loadJsonMock: vi.fn().mockResolvedValue({ alumnos: [] }),
}))

import { AlumnoTimeline } from '../components/alumnoTimeline.js'

const mockAlumno = {
  id: 'alumno-001',
  nombre: 'Test Alumno',
}

describe('B06 — AlumnoTimeline cleanup', () => {
  let container

  beforeEach(() => {
    container = document.createElement('div')
    document.body.appendChild(container)
    vi.clearAllMocks()
  })

  afterEach(() => {
    if (container.parentNode) {
      document.body.removeChild(container)
    }
  })

  it('does not use Math.random for event generation', async () => {
    const randomSpy = vi.spyOn(Math, 'random')

    const timeline = new AlumnoTimeline(container)
    // Trigger parsearEventos with an empty alumno (no actual events to generate)
    // The key: after fix, Math.random must NOT be called at all
    timeline.render([])

    expect(randomSpy).not.toHaveBeenCalled()
    randomSpy.mockRestore()
  })

  it('render() does not produce Chinese/corrupted characters in output', () => {
    const timeline = new AlumnoTimeline(container)
    timeline.render([])

    const html = container.innerHTML
    // CJK Unified Ideographs block: U+4E00 to U+9FFF
    expect(html).not.toMatch(/[一-鿿]/)
  })

  it('shows empty state text when events array is empty', () => {
    const timeline = new AlumnoTimeline(container)
    timeline.render([])

    const html = container.innerHTML
    // Must show some form of empty state — no events registered
    const hasEmptyState =
      html.includes('Sin actividad') ||
      html.includes('Sin eventos') ||
      html.includes('no hay') ||
      html.includes('vacío') ||
      html.includes('empty') ||
      html.includes('registrad')

    expect(hasEmptyState).toBe(true)
  })

  it('render() with events does NOT call Math.random', () => {
    const randomSpy = vi.spyOn(Math, 'random')

    const events = [
      { id: 'e1', fecha: '2026-06-01', tipo: 'asistencia', descripcion: 'Asistió a clase', icon: 'bi-calendar-check' },
    ]

    const timeline = new AlumnoTimeline(container)
    timeline.render(events)

    expect(randomSpy).not.toHaveBeenCalled()
    randomSpy.mockRestore()
  })

  it('render() with events displays event description without corruption', () => {
    const events = [
      { id: 'e1', fecha: '2026-06-01', tipo: 'asistencia', descripcion: 'Asistió a clase', icon: 'bi-calendar-check' },
      { id: 'e2', fecha: '2026-05-30', tipo: 'progreso', descripcion: 'Avanzó en su progreso', icon: 'bi-graph-up' },
    ]

    const timeline = new AlumnoTimeline(container)
    timeline.render(events)

    const html = container.innerHTML
    expect(html).toContain('Asistió a clase')
    expect(html).not.toMatch(/[一-鿿]/)
  })

  it('load() with alumnoId not in mock data calls renderEmpty', async () => {
    const { loadJsonMock } = await import('../../../core/utils/loadJsonMock.js')
    loadJsonMock.mockResolvedValueOnce({ alumnos: [] })

    const timeline = new AlumnoTimeline(container)
    const renderEmptySpy = vi.spyOn(timeline, 'renderEmpty')

    await timeline.load('nonexistent-id')

    expect(renderEmptySpy).toHaveBeenCalled()
  })
})
