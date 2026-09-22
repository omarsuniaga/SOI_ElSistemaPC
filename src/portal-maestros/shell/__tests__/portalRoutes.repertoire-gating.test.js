/**
 * Repertorio y Seccional están deshabilitadas para todo maestro: son vistas
 * sin terminar. Antes tenían una compuerta de piloto (`isRepertoirePilotUser`)
 * que las mostraba a una lista de maestros; ahora quedan ocultas siempre,
 * sin importar esa compuerta ni las variables VITE_REPERTOIRE_*.
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

describe('Repertorio y Seccional deshabilitadas para todo maestro', () => {
  beforeEach(() => {
    isRepertoirePilotUser.mockReset()
    renderSeccionalView.mockClear()
    renderRepertoireView.mockClear()
  })

  describe('pestañas del portal', () => {
    it.each([false, true])('nunca las muestra, sea o no piloto (isRepertoirePilotUser=%s)', (esPiloto) => {
      isRepertoirePilotUser.mockReturnValue(esPiloto)

      const ids = buildTabs(PERMISOS, 'maestro-1').map((t) => t.id)

      expect(ids).not.toContain('repertorio')
      expect(ids).not.toContain('seccional')
    })

    it('no toca las pestañas de siempre', () => {
      const ids = buildTabs(PERMISOS, 'maestro-1').map((t) => t.id)

      expect(ids).toEqual(['fechas', 'hoy', 'planificacion', 'metricas'])
    })
  })

  describe('acceso por URL', () => {
    it.each([false, true])('rebota seccional a hoy sin renderizarla, sea o no piloto (isRepertoirePilotUser=%s)', async (esPiloto) => {
      isRepertoirePilotUser.mockReturnValue(esPiloto)
      const ctx = contexto()

      await renderViewContent('seccional', document.createElement('div'), {}, new URLSearchParams(), ctx)

      expect(ctx.router.navigate).toHaveBeenCalledWith('hoy')
      expect(renderSeccionalView).not.toHaveBeenCalled()
    })

    it.each([false, true])('rebota repertorio a hoy sin renderizarlo, sea o no piloto (isRepertoirePilotUser=%s)', async (esPiloto) => {
      isRepertoirePilotUser.mockReturnValue(esPiloto)
      const ctx = contexto()

      await renderViewContent('repertorio', document.createElement('div'), {}, new URLSearchParams(), ctx)

      expect(ctx.router.navigate).toHaveBeenCalledWith('hoy')
      expect(renderRepertoireView).not.toHaveBeenCalled()
    })
  })
})
