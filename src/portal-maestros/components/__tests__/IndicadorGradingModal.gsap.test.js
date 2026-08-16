import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

/**
 * IndicadorGradingModal.gsap.test.js — Spec C-01
 * (openspec/changes/juego-gamificado-planificacion)
 *
 * `TeacherRouteBuilder.js`/`teacherRouteMapPanel.js` (los archivos que
 * design.md asumía como target de la transición GSAP) NO tienen ningún mapa
 * visual de progreso en Sistema B — es un formulario de edición de
 * estructura, sin coloreado dinámico. El único lugar donde un "nodo"
 * (estrella) cambia de color/estado como resultado directo de una
 * evaluación es el star-rating de IndicadorGradingModal.js — ahí se aplica
 * la transición GSAP (`gsap.to`/`gsap.fromTo`) en vez de la reasignación
 * instantánea de clase CSS que había antes.
 *
 * No se prueba la animación en sí (no testeable de forma útil en
 * Vitest/jsdom) — solo que GSAP se invoca con los parámetros esperados.
 */

const gsapToSpy = vi.fn()
const gsapFromToSpy = vi.fn()
vi.mock('gsap', () => ({
  default: { to: (...args) => gsapToSpy(...args), fromTo: (...args) => gsapFromToSpy(...args) },
}))

vi.mock('../../services/catalogService.js', () => ({
  getAlumnos: vi.fn().mockResolvedValue([{ id: 'alu-1', nombre: 'Ana Pérez' }]),
}))

vi.mock('../../services/maestroDataService.js', () => ({
  getAttendanceForClass: vi.fn().mockResolvedValue({ presentes: ['alu-1'], ausentes: [] }),
  getIndicadorEvaluations: vi.fn().mockResolvedValue([]),
  saveIndicadorNota: vi.fn().mockResolvedValue({ nota: 4 }),
  updateRecoveryStatus: vi.fn(),
  getLogrosAlumno: vi.fn().mockResolvedValue([]),
  getRachaAlumno: vi.fn().mockResolvedValue({ racha_actual: 1 }),
}))

vi.mock('../../services/maestroRouteService.js', () => ({
  checkPrerequisiteSatisfied: vi.fn().mockResolvedValue(true),
  getDirectPrerequisite: vi.fn().mockResolvedValue(null),
}))

vi.mock('../../services/groqService.js', () => ({
  analyzeIndicadorObservation: vi.fn(),
}))

import { openIndicadorGradingModal } from '../IndicadorGradingModal.js'

function flushPromises() {
  return new Promise((resolve) => setTimeout(resolve, 0))
}

describe('IndicadorGradingModal — transición GSAP en el star-rating', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    document.body.innerHTML = ''
  })

  afterEach(() => {
    document.body.innerHTML = ''
  })

  it('anima color y escala con gsap al calificar (en vez de solo reasignar la clase CSS)', async () => {
    await openIndicadorGradingModal({
      claseId: 'clase-1',
      fecha: '2026-08-16',
      indicadorId: 'ind-1',
      indicadorNombre: 'Escala de Do mayor',
      evaluadoPor: 'user-1',
    })
    await flushPromises()

    const starBtn = document.querySelector('.igm-star[data-value="3"]')
    expect(starBtn).not.toBeNull()

    starBtn.click()
    await flushPromises()

    expect(gsapToSpy).toHaveBeenCalled()
    const [, colorArgs] = gsapToSpy.mock.calls[0]
    expect(colorArgs).toMatchObject({ color: expect.any(String), duration: expect.any(Number) })

    expect(gsapFromToSpy).toHaveBeenCalled()
    const [, , scaleArgs] = gsapFromToSpy.mock.calls[0]
    expect(scaleArgs).toMatchObject({ scale: expect.any(Number) })

    // El toggle de clase se conserva como estado final persistente (fallback CSS)
    expect(starBtn.classList.contains('igm-star-filled')).toBe(true)
  })

  it('sigue marcando la clase igm-star-filled aunque gsap anime por encima (no rompe el estado final)', async () => {
    await openIndicadorGradingModal({
      claseId: 'clase-1',
      fecha: '2026-08-16',
      indicadorId: 'ind-1',
      indicadorNombre: 'Escala de Do mayor',
      evaluadoPor: 'user-1',
    })
    await flushPromises()

    const stars = document.querySelectorAll('.igm-star')
    stars[2].click() // 3 estrellas
    await flushPromises()

    const filled = [...document.querySelectorAll('.igm-star')].filter((s) => s.classList.contains('igm-star-filled'))
    expect(filled.length).toBe(3)
  })
})
