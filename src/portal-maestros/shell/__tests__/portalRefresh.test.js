/**
 * Contrato del botón "Actualizar" del header.
 *
 * Lo que tiene que resolver: hoy, para ver datos nuevos, el maestro cierra la
 * app y la vuelve a abrir. El portal cachea en dos niveles — los datos (SWR en
 * viewCache, con respaldo en sessionStorage) y las vistas ya renderizadas — así
 * que navegar a otra pestaña y volver no alcanza: hay que invalidar ambos y
 * volver a pintar la ruta actual.
 */
import { describe, expect, it, vi } from 'vitest'
import { createPortalRefresher } from '../portalRefresh.js'

function armar(overrides = {}) {
  const orden = []
  const opts = {
    invalidateData: vi.fn(() => orden.push('data')),
    invalidateViews: vi.fn(() => orden.push('views')),
    renderView: vi.fn(async () => { orden.push('render') }),
    getCurrentRoute: () => 'hoy',
    checkForUpdate: vi.fn(),
    onStateChange: vi.fn(),
    ...overrides,
  }
  return { refresh: createPortalRefresher(opts), opts, orden }
}

describe('createPortalRefresher', () => {
  it('invalida datos y vistas ANTES de volver a pintar', async () => {
    const { refresh, orden } = armar()

    await refresh()

    expect(orden).toEqual(['data', 'views', 'render'])
  })

  it('vuelve a pintar la ruta en la que está el maestro', async () => {
    const { refresh, opts } = armar({ getCurrentRoute: () => 'asistencia?clase=1' })

    const result = await refresh()

    expect(opts.renderView).toHaveBeenCalledWith('asistencia?clase=1')
    expect(result).toMatchObject({ ok: true, route: 'asistencia?clase=1' })
  })

  it('ignora un segundo toque mientras el primero sigue corriendo', async () => {
    let resolver
    const renderView = vi.fn(() => new Promise((r) => { resolver = r }))
    const { refresh } = armar({ renderView })

    const primera = refresh()
    const segunda = await refresh()
    resolver()
    await primera

    expect(segunda).toMatchObject({ ok: false, skipped: true })
    expect(renderView).toHaveBeenCalledTimes(1)
  })

  it('un fallo no rompe el botón ni deja el refresher trabado', async () => {
    const renderView = vi.fn()
      .mockRejectedValueOnce(new Error('sin red'))
      .mockResolvedValueOnce(undefined)
    const { refresh, opts } = armar({ renderView })

    const fallida = await refresh()
    const siguiente = await refresh()

    expect(fallida).toMatchObject({ ok: false })
    expect(fallida.error).toBeInstanceOf(Error)
    expect(siguiente).toMatchObject({ ok: true })
    expect(opts.onStateChange).toHaveBeenCalledWith('error')
  })

  it('avisa cuándo empieza y cuándo termina, para que el botón muestre progreso', async () => {
    const { refresh, opts } = armar()

    await refresh()

    expect(opts.onStateChange.mock.calls.map(([estado]) => estado)).toEqual(['running', 'done'])
  })

  it('pide al service worker que busque una versión nueva, sin bloquear el refresco', async () => {
    const checkForUpdate = vi.fn(() => new Promise(() => {}))
    const { refresh } = armar({ checkForUpdate })

    const result = await refresh()

    expect(checkForUpdate).toHaveBeenCalled()
    expect(result).toMatchObject({ ok: true })
  })
})
