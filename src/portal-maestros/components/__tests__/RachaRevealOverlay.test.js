import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

/**
 * RachaRevealOverlay.test.js — Spec R-01, R-03, R-04
 * (openspec/changes/racha-visible-en-clase)
 *
 * No se prueba la animación de GSAP en sí (mock), solo: (1) el mensaje
 * correcto por tier, (2) que NUNCA aparece vocabulario de pérdida en ningún
 * caso (incluida una racha reiniciada en 1), (3) que solo se renderiza el
 * alumno pasado como parámetro (nunca otro — estructuralmente imposible de
 * comparar), (4) cierre y resolución de la promesa.
 */

const gsapToSpy = vi.fn()
vi.mock('gsap', () => ({
  default: { to: (...args) => gsapToSpy(...args) },
}))

import showRachaRevealOverlay from '../RachaRevealOverlay.js'

const VOCABULARIO_DE_PERDIDA = [/perdiste/i, /perdió/i, /rota/i, /rompió/i, /se rompi/i, /fallaste/i, /fracas/i]

describe('showRachaRevealOverlay', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    document.body.innerHTML = ''
  })

  afterEach(() => {
    document.body.innerHTML = ''
  })

  it('resolves immediately without mounting anything when alumnoNombre is missing', async () => {
    await showRachaRevealOverlay({ rachaActual: 5 })
    expect(document.querySelector('.rro-overlay')).toBeNull()
  })

  it('shows a welcome message (no bare "0") when the alumno has no rachas row yet', () => {
    showRachaRevealOverlay({ alumnoNombre: 'Ana', rachaActual: null })
    const html = document.body.innerHTML
    expect(html).toContain('comenzar tu racha')
    expect(html).not.toContain('rro-numero')
  })

  it('treats rachaActual: 0 the same as null (IndicadorGradingModal\'s achievementsBaseline defaults to 0, not null)', () => {
    showRachaRevealOverlay({ alumnoNombre: 'Ana', rachaActual: 0 })
    const html = document.body.innerHTML
    expect(html).toContain('comenzar tu racha')
    expect(html).not.toContain('rro-numero')
    expect(html).not.toContain('Racha de 0 clases')
  })

  it('shows a positive "starting over" message for racha = 1, never mentioning a prior higher streak', () => {
    showRachaRevealOverlay({ alumnoNombre: 'Ana', rachaActual: 1 })
    const html = document.body.innerHTML
    expect(html).toContain('nueva racha')
    expect(html).not.toMatch(/antes|anterior|más alta/i)
  })

  it.each([2, 3, 4])('shows the "sigue así" tier for racha = %i', (racha) => {
    showRachaRevealOverlay({ alumnoNombre: 'Ana', rachaActual: racha })
    expect(document.body.innerHTML).toContain(`Racha de ${racha} clases`)
  })

  it.each([5, 10, 40])('shows the "increíble" tier for racha = %i', (racha) => {
    showRachaRevealOverlay({ alumnoNombre: 'Ana', rachaActual: racha })
    expect(document.body.innerHTML).toContain(`increíble de ${racha} clases`)
  })

  it('NEVER uses loss-related vocabulary, for any racha value including a reset streak (Spec R-03)', () => {
    for (const rachaActual of [null, 0, 1, 2, 5, 20]) {
      document.body.innerHTML = ''
      showRachaRevealOverlay({ alumnoNombre: 'Ana', rachaActual })
      const html = document.body.innerHTML
      for (const pattern of VOCABULARIO_DE_PERDIDA) {
        expect(html).not.toMatch(pattern)
      }
    }
  })

  it('only renders the given alumno — never another student\'s name or data (Spec R-03)', () => {
    showRachaRevealOverlay({ alumnoNombre: 'Beto Gómez', rachaActual: 7 })
    const html = document.body.innerHTML
    expect(html).toContain('Beto Gómez')
    // Un solo bloque .rro-card — no hay lista ni comparación de alumnos
    expect(document.querySelectorAll('.rro-card').length).toBe(1)
  })

  it('escapes the alumno name (XSS safety)', () => {
    showRachaRevealOverlay({ alumnoNombre: '<img src=x onerror=alert(1)>', rachaActual: 3 })
    expect(document.body.innerHTML).not.toContain('<img src=x')
  })

  it('animates the number with gsap when rachaActual > 0', () => {
    showRachaRevealOverlay({ alumnoNombre: 'Ana', rachaActual: 6 })
    expect(gsapToSpy).toHaveBeenCalledTimes(1)
    const [, opts] = gsapToSpy.mock.calls[0]
    expect(opts).toMatchObject({ valor: 6, duration: expect.any(Number) })
  })

  it('does not animate with gsap when there is no racha yet', () => {
    showRachaRevealOverlay({ alumnoNombre: 'Ana', rachaActual: null })
    expect(gsapToSpy).not.toHaveBeenCalled()
  })

  it('resolves the returned promise and removes the overlay when closed', async () => {
    vi.useFakeTimers()
    const promise = showRachaRevealOverlay({ alumnoNombre: 'Ana', rachaActual: 4 })

    const closeBtn = document.querySelector('#rro-cerrar')
    expect(closeBtn).not.toBeNull()
    closeBtn.click()

    await vi.advanceTimersByTimeAsync(250)
    await promise

    expect(document.querySelector('.rro-overlay')).toBeNull()
    vi.useRealTimers()
  })
})
