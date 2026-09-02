import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { AppToast } from '../AppToast.js'

const toasts = () => document.querySelectorAll('.app-toast:not(.app-toast--hiding)')

describe('AppToast', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    document.getElementById('app-toast-container')?.remove()
  })

  afterEach(() => {
    AppToast.dismissAll()
    vi.runOnlyPendingTimers()
    vi.useRealTimers()
    document.getElementById('app-toast-container')?.remove()
  })

  it('deduplica mensajes idénticos en un solo toast con contador', () => {
    AppToast.info('Guardando cambios')
    AppToast.info('Guardando cambios')
    AppToast.info('Guardando cambios')

    expect(toasts()).toHaveLength(1)
    expect(document.querySelector('.app-toast__count')?.textContent).toBe('x3')
  })

  it('no deja más de 3 toasts visibles a la vez', () => {
    for (let i = 0; i < 6; i++) AppToast.success(`Mensaje distinto ${i}`)
    vi.advanceTimersByTime(400) // deja correr la animación de salida

    expect(toasts().length).toBeLessThanOrEqual(3)
  })

  it('progress() muta el mismo toast al resolver, sin apilar', () => {
    const handle = AppToast.progress('Cargando nómina...')
    expect(toasts()).toHaveLength(1)
    expect(document.querySelector('.app-toast__title').textContent).toBe('Procesando')

    handle.success('Nómina lista')
    expect(toasts()).toHaveLength(1)
    expect(document.querySelector('.app-toast__title').textContent).toBe('Éxito')
    expect(document.querySelector('.app-toast__msg').textContent).toContain('Nómina lista')
  })

  it('progress() es pegajoso: no se auto-cierra hasta resolver o descartar', () => {
    AppToast.progress('Trabajando...')
    vi.advanceTimersByTime(30000)
    expect(toasts()).toHaveLength(1)
  })

  it('un toast normal se auto-cierra pasado su tiempo', () => {
    AppToast.success('Listo')
    expect(toasts()).toHaveLength(1)
    vi.advanceTimersByTime(3200 + 400)
    expect(toasts()).toHaveLength(0)
  })

  it('mantiene compatibilidad con la API previa (no lanza y devuelve handle)', () => {
    expect(() => {
      const h = AppToast.error('algo falló')
      h.dismiss()
    }).not.toThrow()
  })
})
