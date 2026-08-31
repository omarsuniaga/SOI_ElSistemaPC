// src/shared/utils/__tests__/dynamicImport.test.js
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { importarConReintento, marcarCargaExitosa } from '../dynamicImport.js'

const errCarga = () =>
  new TypeError('Failed to fetch dynamically imported module: http://x/y.js')

describe('importarConReintento', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    try { window.sessionStorage.clear() } catch { /* noop */ }
  })
  afterEach(() => {
    vi.useRealTimers()
    vi.restoreAllMocks()
  })

  it('devuelve el módulo al primer intento cuando no hay error', async () => {
    const mod = { default: 'X' }
    const thunk = vi.fn().mockResolvedValue(mod)
    await expect(importarConReintento(thunk, { nombre: 't' })).resolves.toBe(mod)
    expect(thunk).toHaveBeenCalledTimes(1)
  })

  it('reintenta un fallo de carga y resuelve cuando el reintento funciona', async () => {
    const mod = { default: 'X' }
    const thunk = vi.fn()
      .mockRejectedValueOnce(errCarga())
      .mockResolvedValueOnce(mod)

    const p = importarConReintento(thunk, { nombre: 't', backoffMs: [10] })
    await vi.advanceTimersByTimeAsync(50)
    await expect(p).resolves.toBe(mod)
    expect(thunk).toHaveBeenCalledTimes(2)
  })

  it('NO reintenta un error real del módulo (lo propaga de una)', async () => {
    const boom = new ReferenceError('foo is not defined')
    const thunk = vi.fn().mockRejectedValue(boom)
    await expect(
      importarConReintento(thunk, { nombre: 't', recargarSiFalla: false }),
    ).rejects.toBe(boom)
    expect(thunk).toHaveBeenCalledTimes(1)
  })

  it('tras agotar reintentos fuerza UN reload y no vuelve a recargar', async () => {
    const reload = vi.fn()
    const orig = window.location
    Object.defineProperty(window, 'location', {
      configurable: true,
      value: { ...orig, reload },
    })

    const thunk = vi.fn().mockRejectedValue(errCarga())
    importarConReintento(thunk, { nombre: 't', reintentos: 2, backoffMs: [5, 5] })
    await vi.advanceTimersByTimeAsync(100)

    expect(reload).toHaveBeenCalledTimes(1)
    expect(thunk).toHaveBeenCalledTimes(3) // intento inicial + 2 reintentos
    expect(window.sessionStorage.getItem('dynImportReload')).toBe('1')

    // Segunda ronda en la misma sesión: ya no recarga, propaga el error.
    await expect(
      importarConReintento(thunk, { nombre: 't', reintentos: 0 }),
    ).rejects.toThrow(/dynamically imported module/)
    expect(reload).toHaveBeenCalledTimes(1)

    Object.defineProperty(window, 'location', { configurable: true, value: orig })
  })

  it('marcarCargaExitosa limpia la marca de reload', () => {
    try { window.sessionStorage.setItem('dynImportReload', '1') } catch { /* noop */ }
    marcarCargaExitosa()
    expect(window.sessionStorage.getItem('dynImportReload')).toBeNull()
  })
})
