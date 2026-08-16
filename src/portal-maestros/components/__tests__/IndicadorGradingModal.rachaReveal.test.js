import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

/**
 * IndicadorGradingModal.rachaReveal.test.js — Spec R-01, R-02
 * (openspec/changes/racha-visible-en-clase)
 *
 * El botón "Mostrar racha" existe por cada alumno presente y, al tocarlo,
 * invoca `showRachaRevealOverlay` con el valor del snapshot en memoria — y
 * SOLO ahí: guardar una calificación (individual, grupal, o recuperación)
 * nunca debe disparar el overlay por sí solo (Spec R-02).
 */

vi.mock('gsap', () => ({
  default: { to: vi.fn(), fromTo: vi.fn() },
}))

const showRachaRevealOverlaySpy = vi.fn()
vi.mock('../RachaRevealOverlay.js', () => ({
  default: (...args) => showRachaRevealOverlaySpy(...args),
}))

vi.mock('../../services/catalogService.js', () => ({
  getAlumnos: vi.fn().mockResolvedValue([
    { id: 'alu-1', nombre: 'Ana Pérez' },
    { id: 'alu-2', nombre: 'Beto Gómez' },
  ]),
}))

vi.mock('../../services/maestroDataService.js', () => ({
  getAttendanceForClass: vi.fn().mockResolvedValue({ presentes: ['alu-1'], ausentes: ['alu-2'] }),
  getIndicadorEvaluations: vi.fn().mockResolvedValue([]),
  saveIndicadorNota: vi.fn().mockResolvedValue({ nota: 4 }),
  updateRecoveryStatus: vi.fn().mockResolvedValue({ recovery_status: 'recuperado' }),
  getLogrosAlumno: vi.fn().mockResolvedValue([]),
  getRachaAlumno: vi.fn((alumnoId) =>
    Promise.resolve(alumnoId === 'alu-1' ? { racha_actual: 6 } : { racha_actual: 0 })
  ),
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

describe('IndicadorGradingModal — botón "Mostrar racha"', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    document.body.innerHTML = ''
  })

  afterEach(() => {
    document.body.innerHTML = ''
  })

  async function _openModal() {
    await openIndicadorGradingModal({
      claseId: 'clase-1',
      fecha: '2026-08-16',
      indicadorId: 'ind-1',
      indicadorNombre: 'Escala de Do mayor',
      evaluadoPor: 'user-1',
    })
    await flushPromises()
  }

  it('renders one "Mostrar racha" button per alumno presente', async () => {
    await _openModal()
    expect(document.querySelectorAll('.igm-btn-racha').length).toBe(1)
  })

  it('clicking the button invokes showRachaRevealOverlay with the racha from the snapshot (Spec R-01)', async () => {
    await _openModal()

    document.querySelector('.igm-btn-racha[data-alumno-id="alu-1"]').click()

    expect(showRachaRevealOverlaySpy).toHaveBeenCalledTimes(1)
    expect(showRachaRevealOverlaySpy).toHaveBeenCalledWith({ alumnoNombre: 'Ana Pérez', rachaActual: 6 })
  })

  it('saving an individual nota does NOT invoke showRachaRevealOverlay by itself (Spec R-02)', async () => {
    await _openModal()

    document.querySelector('.igm-star[data-value="3"]').click()
    await flushPromises()

    expect(showRachaRevealOverlaySpy).not.toHaveBeenCalled()
  })

  it('confirming a recovery for an ausente does NOT invoke showRachaRevealOverlay by itself (Spec R-02)', async () => {
    await _openModal()

    document.querySelector('.igm-btn-deuda').click()
    const select = document.querySelector('.igm-recovery-select')
    select.value = 'recuperado'
    document.querySelector('.igm-recovery-confirm').click()
    await flushPromises()

    expect(showRachaRevealOverlaySpy).not.toHaveBeenCalled()
  })

  it('the racha reveal button still works after saving a nota (uses the refreshed snapshot)', async () => {
    await _openModal()

    document.querySelector('.igm-star[data-value="3"]').click()
    await flushPromises()

    document.querySelector('.igm-btn-racha[data-alumno-id="alu-1"]').click()

    expect(showRachaRevealOverlaySpy).toHaveBeenCalledTimes(1)
    expect(showRachaRevealOverlaySpy.mock.calls[0][0].alumnoNombre).toBe('Ana Pérez')
  })
})
