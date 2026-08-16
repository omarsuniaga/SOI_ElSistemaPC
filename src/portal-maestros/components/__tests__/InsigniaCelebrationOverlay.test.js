import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

/**
 * InsigniaCelebrationOverlay.test.js — Spec C-02
 * (openspec/changes/juego-gamificado-planificacion)
 *
 * `@rive-app/canvas-lite` se carga vía import() dinámico (mockeado acá) —
 * no se prueba la animación de Rive en sí, solo que: (1) el overlay se
 * monta con el nombre/ícono del logro, (2) intenta cargar el runtime real,
 * (3) si falla (Tarea 3.9: no existe un .riv real todavía) cae al fallback
 * CSS sin romper el overlay, y (4) se puede cerrar y resuelve la promesa.
 */

let riveOnLoadError = null
const riveConstructorSpy = vi.fn((opts) => {
  riveOnLoadError = opts.onLoadError
})

vi.mock('@rive-app/canvas-lite', () => ({
  Rive: function MockRive(opts) {
    riveConstructorSpy(opts)
  },
  Fit: { Contain: 'contain' },
  Layout: function MockLayout(opts) {
    return opts
  },
  Alignment: { Center: 'center' },
}))

import showInsigniaCelebrationOverlay from '../InsigniaCelebrationOverlay.js'

function flushPromises() {
  return new Promise((resolve) => setTimeout(resolve, 0))
}

describe('showInsigniaCelebrationOverlay', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    riveOnLoadError = null
    document.body.innerHTML = ''
  })

  afterEach(() => {
    document.body.innerHTML = ''
  })

  it('resolves immediately without mounting anything when no logro is passed', async () => {
    await showInsigniaCelebrationOverlay(null)
    expect(document.querySelector('.ico-overlay')).toBeNull()
  })

  it('mounts the overlay with the logro name/icono and attempts to load the Rive runtime', async () => {
    const promise = showInsigniaCelebrationOverlay({ nombre: 'Primera asistencia', icono: 'trophy-fill' })
    await flushPromises()

    expect(document.querySelector('.ico-overlay')).not.toBeNull()
    expect(document.body.innerHTML).toContain('Primera asistencia')
    expect(document.body.innerHTML).toContain('bi-trophy-fill')
    expect(riveConstructorSpy).toHaveBeenCalledTimes(1)

    document.querySelector('#ico-cerrar').click()
    await promise
  })

  it('falls back to the emoji placeholder when the Rive runtime fails to load the .riv asset (no real asset yet, Tarea 3.9)', async () => {
    const promise = showInsigniaCelebrationOverlay({ nombre: 'Constancia inicial' })
    await flushPromises()

    expect(typeof riveOnLoadError).toBe('function')
    riveOnLoadError()

    expect(document.querySelector('.ico-fallback-emoji')).not.toBeNull()

    document.querySelector('#ico-cerrar').click()
    await promise
  })

  it('resolves the returned promise and removes the overlay when closed', async () => {
    const promise = showInsigniaCelebrationOverlay({ nombre: 'Logro' })
    await flushPromises()

    document.querySelector('#ico-cerrar').click()
    await promise

    expect(document.querySelector('.ico-overlay')).toBeNull()
  })
})
