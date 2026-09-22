import { describe, it, expect, vi, beforeEach } from 'vitest'
import { setNavigationCallbacks, invalidateCalendarioViews } from '../navigationHooks.js'

/**
 * 'fechas', 'calendario' y 'clases' son tres nombres de ruta distintos que
 * cargan el MISMO módulo (calendarioView.js) — ver VIEW_LOADERS en
 * portalRoutes.js. El caché de vistas renderizadas (_viewRendered en
 * main-maestros.js) es por nombre de ruta, no por módulo: invalidar solo
 * 'calendario' deja 'fechas' (la pestaña real del menú) con el DOM viejo.
 */
describe('invalidateCalendarioViews', () => {
  let invalidateView

  beforeEach(() => {
    invalidateView = vi.fn()
    setNavigationCallbacks(invalidateView, vi.fn())
  })

  it('invalida los tres alias de ruta del calendario, no solo "calendario"', () => {
    invalidateCalendarioViews()

    expect(invalidateView).toHaveBeenCalledWith('fechas')
    expect(invalidateView).toHaveBeenCalledWith('calendario')
    expect(invalidateView).toHaveBeenCalledWith('clases')
    expect(invalidateView).toHaveBeenCalledTimes(3)
  })
})
