/**
 * Compuerta del piloto de Repertorio sobre la navegación del portal.
 *
 * `repertorio` nació cerrado: pestaña y ruta dependen de `isRepertoirePilotUser`.
 * Su vista hermana `seccional` quedó abierta a todo maestro y, peor, se dibuja
 * con `createSectionalDemoAdapter()` — datos inventados con apariencia de reales.
 * Estas pruebas fijan que ambas rutas compartan la misma compuerta.
 */
import { beforeEach, describe, expect, it, vi } from 'vitest'

const { isRepertoirePilotUser } = vi.hoisted(() => ({ isRepertoirePilotUser: vi.fn() }))

vi.mock('../../../modules/repertoire/api/repertoirePilotAccess.js', () => ({ isRepertoirePilotUser }))
vi.mock('../../views/seccionalView.js', () => ({ renderSeccionalView: vi.fn() }))
vi.mock('../../views/repertorioView.js', () => ({ renderRepertoireView: vi.fn() }))

import { buildTabs, renderViewContent } from '../portalRoutes.js'
import { renderSeccionalView } from '../../views/seccionalView.js'
import { renderRepertoireView } from '../../views/repertorioView.js'

const PERMISOS = { puede_inscribir_clases: false }

function contexto() {
  return {
    maestroId: 'maestro-1',
    permisos: PERMISOS,
    router: { navigate: vi.fn() },
    showLoginScreen: vi.fn(),
    cleanupPushService: vi.fn(),
    stopRealtime: vi.fn(),
    logoutMaestro: vi.fn(),
  }
}

describe('compuerta del piloto de Repertorio', () => {
  beforeEach(() => {
    isRepertoirePilotUser.mockReset()
    renderSeccionalView.mockClear()
    renderRepertoireView.mockClear()
  })

  describe('pestañas del portal', () => {
    it('esconde Repertorio y Seccional cuando el maestro no es piloto', () => {
      isRepertoirePilotUser.mockReturnValue(false)

      const ids = buildTabs(PERMISOS, 'maestro-1').map((t) => t.id)

      expect(ids).not.toContain('repertorio')
      expect(ids).not.toContain('seccional')
    })

    it('muestra ambas cuando el maestro sí es piloto', () => {
      isRepertoirePilotUser.mockReturnValue(true)

      const ids = buildTabs(PERMISOS, 'maestro-1').map((t) => t.id)

      expect(ids).toContain('repertorio')
      expect(ids).toContain('seccional')
    })

    it('no toca las pestañas de siempre', () => {
      isRepertoirePilotUser.mockReturnValue(false)

      const ids = buildTabs(PERMISOS, 'maestro-1').map((t) => t.id)

      expect(ids).toEqual(['fechas', 'hoy', 'planificacion', 'metricas'])
    })
  })

  describe('acceso por URL', () => {
    it('rebota seccional a hoy cuando el maestro no es piloto', async () => {
      isRepertoirePilotUser.mockReturnValue(false)
      const ctx = contexto()

      await renderViewContent('seccional', document.createElement('div'), {}, new URLSearchParams(), ctx)

      expect(ctx.router.navigate).toHaveBeenCalledWith('hoy')
      expect(renderSeccionalView).not.toHaveBeenCalled()
    })

    it('rebota repertorio a hoy cuando el maestro no es piloto', async () => {
      isRepertoirePilotUser.mockReturnValue(false)
      const ctx = contexto()

      await renderViewContent('repertorio', document.createElement('div'), {}, new URLSearchParams(), ctx)

      expect(ctx.router.navigate).toHaveBeenCalledWith('hoy')
      expect(renderRepertoireView).not.toHaveBeenCalled()
    })

    it('deja pasar seccional al piloto', async () => {
      isRepertoirePilotUser.mockReturnValue(true)
      const ctx = contexto()

      await renderViewContent('seccional', document.createElement('div'), {}, new URLSearchParams(), ctx)

      expect(ctx.router.navigate).not.toHaveBeenCalled()
      expect(renderSeccionalView).toHaveBeenCalled()
    })
  })
})
