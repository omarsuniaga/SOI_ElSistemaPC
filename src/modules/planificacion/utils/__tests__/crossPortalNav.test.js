import { describe, it, expect, vi, afterEach } from 'vitest'
import { navegarConClase } from '../crossPortalNav.js'

/**
 * crossPortalNav.test.js
 *
 * Portal Maestros y ACM/ADM corren routers incompatibles entre sí: uno lee
 * el claseId de un query string embebido en el nombre de ruta
 * (`window.location.search`), el otro lo recibe como objeto de params y no
 * toca la URL para nada. Pasar el id "a la manera equivocada" no truena con
 * un error — el destino simplemente no recibe la clase y vuelve a
 * defaultear a la primera de la lista, el mismo síntoma que este helper
 * vino a corregir. Por eso se prueban ambas formas explícitamente.
 */
describe('navegarConClase', () => {
  afterEach(() => {
    delete window.router
  })

  it('Portal Maestros (router sin .routes): embebe el clase en el query string del nombre de ruta', () => {
    const navigate = vi.fn()
    window.router = { navigate } // portalRouter.js no expone `.routes`

    navegarConClase('planificacion-mapa-clase', 'clase-1')

    expect(navigate).toHaveBeenCalledWith('planificacion-mapa-clase?clase=clase-1')
  })

  it('router central (expone .routes como objeto): pasa el claseId como params, no en el string', () => {
    const navigate = vi.fn()
    window.router = { navigate, routes: { 'planificacion-mapa-clase': vi.fn() } }

    navegarConClase('planificacion-mapa-clase', 'clase-1')

    expect(navigate).toHaveBeenCalledWith('planificacion-mapa-clase', { claseId: 'clase-1' })
  })

  it('sin claseId, navega al destino tal cual en cualquiera de los dos routers', () => {
    const navigatePortal = vi.fn()
    window.router = { navigate: navigatePortal }
    navegarConClase('planificacion-acm', null)
    expect(navigatePortal).toHaveBeenCalledWith('planificacion-acm')

    const navigateCentral = vi.fn()
    window.router = { navigate: navigateCentral, routes: {} }
    navegarConClase('planificacion-acm', null)
    expect(navigateCentral).toHaveBeenCalledWith('planificacion-acm', {})
  })

  it('no explota si window.router no existe todavía', () => {
    delete window.router
    expect(() => navegarConClase('planificacion-mapa-clase', 'clase-1')).not.toThrow()
  })
})
