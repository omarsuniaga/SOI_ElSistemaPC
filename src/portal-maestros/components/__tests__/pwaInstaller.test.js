/**
 * Contrato del pwaInstaller después de retirar la cápsula de avisos.
 *
 * La "SOI Smart Insights Bar" flotaba sobre la cabecera del portal (se insertaba
 * con `document.body.prepend`) y rotaba avisos: registros en borrador, clases
 * sin asistencia, perfil incompleto, instalar la app. Se retiró por completo a
 * pedido. Lo que NO se va con ella: capturar el prompt nativo de instalación y
 * el botón "Instalar" de la vista Perfil, que siguen siendo el camino para
 * instalar la PWA.
 */
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { pwaInstaller } from '../pwaInstaller.js'

describe('pwaInstaller', () => {
  beforeEach(() => {
    document.body.innerHTML = ''
    delete window.pwaInstaller
  })

  it('no inserta ninguna cápsula de avisos en el documento', () => {
    pwaInstaller.init()

    expect(document.getElementById('pwa-smart-banner')).toBeNull()
    expect(document.querySelector('.psb-capsule')).toBeNull()
  })

  it('ya no expone el motor de avisos que alimentaba la cápsula', () => {
    // Si alguien vuelve a llamarlo desde una vista, tiene que fallar en las
    // pruebas y no en el portal del maestro.
    expect(pwaInstaller.evaluateInsights).toBeUndefined()
    expect(pwaInstaller._showInsightBanner).toBeUndefined()
    expect(pwaInstaller.dismissBanner).toBeUndefined()
  })

  it('sigue ofreciendo la instalación de la app', () => {
    pwaInstaller.init()

    expect(typeof pwaInstaller.promptInstall).toBe('function')
    expect(window.pwaInstaller).toBe(pwaInstaller)
  })

  it('captura el prompt nativo de instalación sin mostrar nada', () => {
    pwaInstaller.init()

    const evento = new Event('beforeinstallprompt')
    evento.prompt = vi.fn()
    window.dispatchEvent(evento)

    expect(document.getElementById('pwa-smart-banner')).toBeNull()
  })
})
