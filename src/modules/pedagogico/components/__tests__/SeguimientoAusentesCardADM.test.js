import { describe, it, expect } from 'vitest'
import { renderSeguimientoAusentesCardADM } from '../SeguimientoAusentesCardADM.js'

describe('SeguimientoAusentesCardADM — tarjeta de Nivel 3', () => {
  it('no dice "Retención de instrumento" cuando aún no hay ninguna retención real registrada', () => {
    const html = renderSeguimientoAusentesCardADM({
      nivel1: 65, nivel2: 38, nivel3: 33,
      contactados72h: 0, totalContactos: 136, sinContacto: 23,
      retencionesActivas: 0, retencionesLevantadas: 0,
    })
    const div = document.createElement('div')
    div.innerHTML = html
    const cardNivel3 = div.querySelector('[data-kpi="nivel-3"]')

    expect(cardNivel3.textContent).not.toContain('Retención de instrumento')
    expect(cardNivel3.textContent).toContain('Alcanzó el umbral de retención')
  })

  it('sí menciona la retención cuando hay retenciones activas reales', () => {
    const html = renderSeguimientoAusentesCardADM({
      nivel1: 10, nivel2: 5, nivel3: 33,
      contactados72h: 5, totalContactos: 50, sinContacto: 2,
      retencionesActivas: 33, retencionesLevantadas: 0,
    })
    const div = document.createElement('div')
    div.innerHTML = html
    const cardNivel3 = div.querySelector('[data-kpi="nivel-3"]')

    expect(cardNivel3.textContent).toContain('Retención de instrumento')
  })
})
