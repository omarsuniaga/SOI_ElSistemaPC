/**
 * RegistrarContenidoModal.test.js — TDD tests for T9
 *
 * RED: written before the component exists.
 * Tests: render, validation, submit calls adapter, success/cancel callbacks.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('../api/bitacoraAdapter.js', () => ({
  registrarSesion: vi.fn(),
  getSemaforoPorClase: vi.fn(),
  getContenidosDeClase: vi.fn(),
  getHistorialContenido: vi.fn(),
}))

import { registrarSesion } from '../api/bitacoraAdapter.js'
import { renderRegistrarContenidoModal } from '../components/RegistrarContenidoModal.js'

const TODAY = new Date().toISOString().slice(0, 10)
const TOMORROW = new Date(Date.now() + 86400000).toISOString().slice(0, 10)

const PROPS = {
  claseId: 'clase-001',
  objetivoId: 'obj-1',
  objetivoDescripcion: 'Escalas mayores',
  alumnos: [
    { id: 'al-1', nombre_completo: 'Ana García' },
    { id: 'al-2', nombre_completo: 'Bruno Pérez' },
  ],
}

describe('renderRegistrarContenidoModal', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    registrarSesion.mockResolvedValue({ sessionId: 'ses-new' })
  })

  it('renders the objetivo description', () => {
    const container = document.createElement('div')
    renderRegistrarContenidoModal(container, PROPS)

    expect(container.innerHTML).toContain('Escalas mayores')
  })

  it('renders one row per alumno', () => {
    const container = document.createElement('div')
    renderRegistrarContenidoModal(container, PROPS)

    expect(container.innerHTML).toContain('Ana García')
    expect(container.innerHTML).toContain('Bruno Pérez')
  })

  it('defaults fecha to today', () => {
    const container = document.createElement('div')
    renderRegistrarContenidoModal(container, PROPS)

    const fechaInput = container.querySelector('#modal-fecha')
    expect(fechaInput?.value).toBe(TODAY)
  })

  it('renders nota selectors (bien/regular/mal) per alumno', () => {
    const container = document.createElement('div')
    renderRegistrarContenidoModal(container, PROPS)

    const selects = container.querySelectorAll('select[data-alumno-id]')
    expect(selects.length).toBe(PROPS.alumnos.length)
  })

  it('calls registrarSesion with correct payload on submit when all fields valid', async () => {
    const onSaved = vi.fn()
    const container = document.createElement('div')
    renderRegistrarContenidoModal(container, { ...PROPS, onSaved })

    // Select nota for each alumno
    container.querySelectorAll('select[data-alumno-id]').forEach((sel) => {
      sel.value = 'bien'
      sel.dispatchEvent(new Event('change'))
    })

    // Submit the form
    const form = container.querySelector('form')
    form?.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }))

    await new Promise((r) => setTimeout(r, 0))

    expect(registrarSesion).toHaveBeenCalledWith({
      claseId: 'clase-001',
      objetivoId: 'obj-1',
      fecha: TODAY,
      notas: [
        { alumnoId: 'al-1', nota: 'bien' },
        { alumnoId: 'al-2', nota: 'bien' },
      ],
      observacion: null,
    })
  })

  it('calls onSaved callback after successful submit', async () => {
    const onSaved = vi.fn()
    const container = document.createElement('div')
    renderRegistrarContenidoModal(container, { ...PROPS, onSaved })

    container.querySelectorAll('select[data-alumno-id]').forEach((sel) => {
      sel.value = 'bien'
    })

    const form = container.querySelector('form')
    form?.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }))

    await new Promise((r) => setTimeout(r, 10))

    expect(onSaved).toHaveBeenCalled()
  })

  it('does NOT call registrarSesion when fecha is in the future', async () => {
    const container = document.createElement('div')
    renderRegistrarContenidoModal(container, PROPS)

    const fechaInput = container.querySelector('#modal-fecha')
    if (fechaInput) fechaInput.value = TOMORROW

    const form = container.querySelector('form')
    form?.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }))

    await new Promise((r) => setTimeout(r, 0))

    expect(registrarSesion).not.toHaveBeenCalled()
  })

  it('calls onCancel callback when cancel button is clicked', () => {
    const onCancel = vi.fn()
    const container = document.createElement('div')
    renderRegistrarContenidoModal(container, { ...PROPS, onCancel })

    const cancelBtn = container.querySelector('[data-action="cancel"]')
    cancelBtn?.click()

    expect(onCancel).toHaveBeenCalled()
  })

  it('prefills fecha when prefillFecha prop is provided', () => {
    const container = document.createElement('div')
    renderRegistrarContenidoModal(container, { ...PROPS, prefillFecha: '2026-05-10' })
    const fechaInput = container.querySelector('#modal-fecha')
    expect(fechaInput?.value).toBe('2026-05-10')
  })

  it('prefills observacion when prefillObservacion prop is provided', () => {
    const container = document.createElement('div')
    renderRegistrarContenidoModal(container, { ...PROPS, prefillObservacion: 'Clase muy buena' })
    const obs = container.querySelector('#modal-observacion')
    expect(obs?.value).toBe('Clase muy buena')
  })

  it('keeps today as default fecha when prefillFecha is not provided', () => {
    const container = document.createElement('div')
    renderRegistrarContenidoModal(container, PROPS) // no prefillFecha
    const fechaInput = container.querySelector('#modal-fecha')
    expect(fechaInput?.value).toBe(TODAY)
  })
})
