import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { createAchievementsSummaryModal } from '../AchievementsSummaryModal.js'

/**
 * AchievementsSummaryModal.test.js — Spec B-03
 * (openspec/changes/juego-gamificado-planificacion)
 *
 * El modal ahora recibe logros/racha reales (alumnos_logros/rachas), no el
 * shape del sistema legado (approvedNodes/levelPromoted). El caller
 * (IndicadorGradingModal.js) ya filtra "sin novedades" antes de invocar esto
 * — acá solo se prueba el render dado un `results` no vacío, y el caso
 * `results` vacío/null (no debe montar nada).
 */

describe('createAchievementsSummaryModal', () => {
  let container

  beforeEach(() => {
    container = document.createElement('div')
    document.body.appendChild(container)
  })

  afterEach(() => {
    container.remove()
  })

  it('does not mount anything when results is empty or null (Spec B-03: sin novedades, sin interrupción)', () => {
    createAchievementsSummaryModal(container, [])
    expect(container.querySelector('.pm-modal-overlay')).toBeNull()

    createAchievementsSummaryModal(container, null)
    expect(container.querySelector('.pm-modal-overlay')).toBeNull()
  })

  it('renders the student name and each new logro (nombre + icono)', () => {
    createAchievementsSummaryModal(container, [
      {
        studentName: 'Ana Pérez',
        logrosNuevos: [{ nombre: 'Primera asistencia', descripcion: 'Vino a su primera clase', icono: 'trophy-fill' }],
        rachaActual: 1,
        rachaSubio: false,
      },
    ])

    const html = container.innerHTML
    expect(html).toContain('Ana Pérez')
    expect(html).toContain('Primera asistencia')
    expect(html).toContain('bi-trophy-fill')
  })

  it('escapes student name and logro nombre (XSS safety)', () => {
    createAchievementsSummaryModal(container, [
      { studentName: '<img src=x onerror=alert(1)>', logrosNuevos: [{ nombre: '<script>alert(2)</script>' }] },
    ])

    expect(container.innerHTML).not.toContain('<img src=x')
    expect(container.innerHTML).not.toContain('<script>alert(2)</script>')
  })

  it('shows the racha badge only when rachaSubio is true', () => {
    createAchievementsSummaryModal(container, [
      { studentName: 'Con racha', logrosNuevos: [], rachaActual: 4, rachaSubio: true },
    ])
    expect(container.innerHTML).toContain('bi-fire')
    expect(container.innerHTML).toContain('4 clases seguidas')
    container.innerHTML = ''

    createAchievementsSummaryModal(container, [
      { studentName: 'Sin racha nueva', logrosNuevos: [{ nombre: 'Algo' }], rachaActual: 2, rachaSubio: false },
    ])
    expect(container.innerHTML).not.toContain('bi-fire')
  })

  it('uses singular "clase seguida" when rachaActual is 1', () => {
    createAchievementsSummaryModal(container, [
      { studentName: 'Uno', logrosNuevos: [], rachaActual: 1, rachaSubio: true },
    ])
    expect(container.innerHTML).toContain('1 clase seguida')
    expect(container.innerHTML).not.toContain('1 clases')
  })

  it('resolves the returned promise and removes the modal when the close button is clicked', async () => {
    vi.useFakeTimers()
    const promise = createAchievementsSummaryModal(container, [
      { studentName: 'Ana', logrosNuevos: [{ nombre: 'Logro' }] },
    ])

    const closeBtn = container.querySelector('#pm-achievements-close')
    expect(closeBtn).not.toBeNull()
    closeBtn.click()

    await vi.advanceTimersByTimeAsync(300)
    await promise

    expect(container.querySelector('.pm-modal-overlay')).toBeNull()
    vi.useRealTimers()
  })

  it('renders one item per alumno when multiple results are passed (grupal grading)', () => {
    createAchievementsSummaryModal(container, [
      { studentName: 'Alumno 1', logrosNuevos: [{ nombre: 'Logro A' }] },
      { studentName: 'Alumno 2', logrosNuevos: [{ nombre: 'Logro B' }] },
    ])

    const items = container.querySelectorAll('.pm-achievement-item')
    expect(items.length).toBe(2)
  })
})
