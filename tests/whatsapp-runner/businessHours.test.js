import { describe, it, expect } from 'vitest'
import { dentroDeVentana } from '../../src/services/whatsapp-runner/businessHours.js'

// America/Santo_Domingo es UTC-4 todo el año (sin DST).
// 2026-09-07 es lunes. 2026-09-12 es sábado, 2026-09-13 domingo.
const V = { inicio: '10:00', fin: '19:00', soloDiasHabiles: true, tz: 'America/Santo_Domingo' }

describe('dentroDeVentana', () => {
  it('lunes 14:00 local -> dentro', () => {
    expect(dentroDeVentana(new Date('2026-09-07T18:00:00Z'), V)).toBe(true) // 14:00 RD
  })

  it('lunes 09:59 local -> fuera (antes de la ventana)', () => {
    expect(dentroDeVentana(new Date('2026-09-07T13:59:00Z'), V)).toBe(false) // 09:59 RD
  })

  it('lunes 10:00 local -> dentro (borde inclusivo)', () => {
    expect(dentroDeVentana(new Date('2026-09-07T14:00:00Z'), V)).toBe(true)
  })

  it('lunes 19:00 local -> fuera (borde exclusivo)', () => {
    expect(dentroDeVentana(new Date('2026-09-07T23:00:00Z'), V)).toBe(false)
  })

  it('lunes 18:59 local -> dentro', () => {
    expect(dentroDeVentana(new Date('2026-09-07T22:59:00Z'), V)).toBe(true)
  })

  it('sábado 14:00 local -> fuera (solo días hábiles)', () => {
    expect(dentroDeVentana(new Date('2026-09-12T18:00:00Z'), V)).toBe(false)
  })

  it('domingo 14:00 local -> fuera', () => {
    expect(dentroDeVentana(new Date('2026-09-13T18:00:00Z'), V)).toBe(false)
  })

  it('sábado 14:00 con soloDiasHabiles=false -> dentro', () => {
    expect(dentroDeVentana(new Date('2026-09-12T18:00:00Z'), { ...V, soloDiasHabiles: false })).toBe(true)
  })

  it('ventana que cruza medianoche (22:00-06:00)', () => {
    const nocturna = { inicio: '22:00', fin: '06:00', soloDiasHabiles: false, tz: V.tz }
    expect(dentroDeVentana(new Date('2026-09-08T03:00:00Z'), nocturna)).toBe(true) // 23:00 RD
    expect(dentroDeVentana(new Date('2026-09-08T14:00:00Z'), nocturna)).toBe(false) // 10:00 RD
  })

  it('formato de ventana inválido -> no bloquea', () => {
    expect(dentroDeVentana(new Date('2026-09-07T18:00:00Z'), { inicio: 'xx', fin: 'yy', soloDiasHabiles: false })).toBe(true)
  })

  it('acepta timestamp numérico o string', () => {
    const ts = Date.parse('2026-09-07T18:00:00Z')
    expect(dentroDeVentana(ts, V)).toBe(true)
    expect(dentroDeVentana('2026-09-07T18:00:00Z', V)).toBe(true)
  })
})
