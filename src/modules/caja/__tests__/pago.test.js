import { describe, test, expect } from 'vitest'
import { METODOS_PAGO, buildPago, distribuirPago, validatePagoMetodo } from '../domain/pago.js'

describe('METODOS_PAGO', () => {
  test('exports all valid methods', () => {
    expect(METODOS_PAGO).toContain('efectivo')
    expect(METODOS_PAGO).toContain('transferencia')
    expect(METODOS_PAGO).toContain('pago_movil')
    expect(METODOS_PAGO).toContain('tarjeta')
    expect(METODOS_PAGO).toContain('mixto')
    expect(METODOS_PAGO).toContain('tercero')
    expect(METODOS_PAGO).toContain('link_externo')
  })
})

describe('validatePagoMetodo', () => {
  test('efectivo is valid', () => expect(validatePagoMetodo('efectivo')).toBe(true))
  test('transferencia is valid', () => expect(validatePagoMetodo('transferencia')).toBe(true))
  test('unknown method is invalid', () => expect(validatePagoMetodo('bitcoin')).toBe(false))
  test('empty string is invalid', () => expect(validatePagoMetodo('')).toBe(false))
})

describe('buildPago', () => {
  const base = { familia_id: 'fam-1', cuota_ids: ['c1'], monto: 300, metodo_pago: 'efectivo', cajero_id: 'usr-1', notas: '' }

  test('builds pago with required fields', () => {
    const p = buildPago(base)
    expect(p.familia_id).toBe('fam-1')
    expect(p.cuota_ids).toEqual(['c1'])
    expect(p.monto).toBe(300)
    expect(p.metodo_pago).toBe('efectivo')
    expect(p.cajero_id).toBe('usr-1')
  })

  test('includes fecha_pago timestamp', () => {
    const p = buildPago(base)
    expect(p.fecha_pago).toBeTruthy()
    expect(new Date(p.fecha_pago).getTime()).not.toBeNaN()
  })

  test('does not include id (db assigns it)', () => {
    const p = buildPago(base)
    expect(p.id).toBeUndefined()
  })
})

describe('distribuirPago', () => {
  const cuotas = [
    { id: 'c1', monto_final: 300, estado: 'vencida', fecha_vencimiento: '2026-04-05' },
    { id: 'c2', monto_final: 200, estado: 'pendiente', fecha_vencimiento: '2026-06-05' },
  ]

  test('applies greedy oldest-first distribution', () => {
    const r = distribuirPago(cuotas, 300)
    expect(r.distribucion[0].cuota_id).toBe('c1')
    expect(r.distribucion[0].montoCubierto).toBe(300)
    expect(r.distribucion[0].newEstado).toBe('pagada')
  })

  test('covers multiple cuotas when enough payment', () => {
    const r = distribuirPago(cuotas, 500)
    expect(r.distribucion).toHaveLength(2)
    expect(r.distribucion[0].newEstado).toBe('pagada')
    expect(r.distribucion[1].newEstado).toBe('pagada')
    expect(r.montoSobrante).toBe(0)
  })

  test('returns sobrante when payment exceeds total', () => {
    const r = distribuirPago(cuotas, 600)
    expect(r.montoSobrante).toBe(100)
  })

  test('partial payment leaves remainder', () => {
    const r = distribuirPago(cuotas, 100)
    expect(r.distribucion[0].montoCubierto).toBe(100)
    expect(r.distribucion[0].montoRestante).toBe(200)
    expect(r.distribucion[0].newEstado).toBe('vencida')
  })
})
