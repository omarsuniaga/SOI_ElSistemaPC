import { describe, test, expect } from 'vitest'
import {
  CUOTA_ESTADOS,
  buildCuotaForCiclo,
  canTransitionTo,
  applyPagoToCuota,
  calcularMoraInfo,
  isCuotaVencida,
  cuotaEsLiquidable,
} from '../domain/cuota.js'

describe('CUOTA_ESTADOS', () => {
  test('exports all 7 estados', () => {
    const estados = Object.values(CUOTA_ESTADOS)
    expect(estados).toContain('pendiente')
    expect(estados).toContain('pagada')
    expect(estados).toContain('vencida')
    expect(estados).toContain('en_mora')
    expect(estados).toContain('exonerada')
    expect(estados).toContain('becada')
    expect(estados).toContain('pre_pagada')
    expect(estados).toHaveLength(7)
  })
})

describe('buildCuotaForCiclo', () => {
  const base = { familia_id: 'fam-1', alumno_id: 'alu-1', ciclo_mes: 6, ciclo_anio: 2026, monto_base: 300, concepto: 'mensualidad' }

  test('builds cuota with estado pendiente', () => {
    const c = buildCuotaForCiclo(base)
    expect(c.estado).toBe('pendiente')
  })

  test('fecha_vencimiento is day 5 of ciclo_mes/ciclo_anio', () => {
    const c = buildCuotaForCiclo(base)
    expect(c.fecha_vencimiento).toBe('2026-06-05')
  })

  test('fecha_vencimiento pads month with leading zero', () => {
    const c = buildCuotaForCiclo({ ...base, ciclo_mes: 3 })
    expect(c.fecha_vencimiento).toBe('2026-03-05')
  })

  test('monto_final equals monto_base by default', () => {
    const c = buildCuotaForCiclo(base)
    expect(c.monto_final).toBe(300)
  })

  test('includes all required fields', () => {
    const c = buildCuotaForCiclo(base)
    expect(c.familia_id).toBe('fam-1')
    expect(c.alumno_id).toBe('alu-1')
    expect(c.ciclo_mes).toBe(6)
    expect(c.ciclo_anio).toBe(2026)
    expect(c.concepto).toBe('mensualidad')
  })
})

describe('canTransitionTo', () => {
  test('pendiente → pagada is valid', () => expect(canTransitionTo('pendiente', 'pagada')).toBe(true))
  test('pendiente → vencida is valid', () => expect(canTransitionTo('pendiente', 'vencida')).toBe(true))
  test('pendiente → exonerada is valid', () => expect(canTransitionTo('pendiente', 'exonerada')).toBe(true))
  test('pendiente → becada is valid', () => expect(canTransitionTo('pendiente', 'becada')).toBe(true))
  test('pendiente → pre_pagada is valid', () => expect(canTransitionTo('pendiente', 'pre_pagada')).toBe(true))
  test('vencida → pagada is valid', () => expect(canTransitionTo('vencida', 'pagada')).toBe(true))
  test('vencida → en_mora is valid', () => expect(canTransitionTo('vencida', 'en_mora')).toBe(true))
  test('vencida → exonerada is valid', () => expect(canTransitionTo('vencida', 'exonerada')).toBe(true))
  test('en_mora → pagada is valid', () => expect(canTransitionTo('en_mora', 'pagada')).toBe(true))
  test('en_mora → exonerada is valid', () => expect(canTransitionTo('en_mora', 'exonerada')).toBe(true))
  test('pagada → pendiente is invalid', () => expect(canTransitionTo('pagada', 'pendiente')).toBe(false))
  test('exonerada → pagada is invalid', () => expect(canTransitionTo('exonerada', 'pagada')).toBe(false))
  test('becada → pagada is invalid', () => expect(canTransitionTo('becada', 'pagada')).toBe(false))
})

describe('applyPagoToCuota', () => {
  const cuota = { id: 'c1', monto_final: 300, estado: 'pendiente' }

  test('full payment → pagada, montoRestante=0', () => {
    const r = applyPagoToCuota(cuota, 300)
    expect(r.newEstado).toBe('pagada')
    expect(r.montoRestante).toBe(0)
    expect(r.montoCubierto).toBe(300)
  })

  test('partial payment → pendiente state stays, montoRestante > 0', () => {
    const r = applyPagoToCuota(cuota, 100)
    expect(r.newEstado).toBe('pendiente')
    expect(r.montoRestante).toBe(200)
    expect(r.montoCubierto).toBe(100)
  })

  test('overpayment covers the cuota, sobrante not tracked here', () => {
    const r = applyPagoToCuota(cuota, 400)
    expect(r.newEstado).toBe('pagada')
    expect(r.montoCubierto).toBe(300)
    expect(r.montoRestante).toBe(0)
  })
})

describe('calcularMoraInfo', () => {
  test('today < fecha_vencimiento → esAlDia', () => {
    const cuota = { fecha_vencimiento: '2026-07-05' }
    const r = calcularMoraInfo(cuota, new Date('2026-06-22'))
    expect(r.esAlDia).toBe(true)
    expect(r.esVencida).toBe(false)
    expect(r.esMora).toBe(false)
    expect(r.diasMora).toBe(0)
  })

  test('1-30 days past vencimiento → esVencida', () => {
    const cuota = { fecha_vencimiento: '2026-06-01' }
    const r = calcularMoraInfo(cuota, new Date('2026-06-22'))
    expect(r.esVencida).toBe(true)
    expect(r.esMora).toBe(false)
    expect(r.diasMora).toBe(21)
  })

  test('>30 days past vencimiento → esMora', () => {
    const cuota = { fecha_vencimiento: '2026-05-01' }
    const r = calcularMoraInfo(cuota, new Date('2026-06-22'))
    expect(r.esMora).toBe(true)
    expect(r.esVencida).toBe(false)
    expect(r.diasMora).toBeGreaterThan(30)
  })
})

describe('isCuotaVencida', () => {
  test('returns true when past fecha_vencimiento', () => {
    expect(isCuotaVencida({ fecha_vencimiento: '2026-01-01' }, new Date('2026-06-22'))).toBe(true)
  })

  test('returns false when not yet past fecha_vencimiento', () => {
    expect(isCuotaVencida({ fecha_vencimiento: '2026-12-31' }, new Date('2026-06-22'))).toBe(false)
  })
})

describe('cuotaEsLiquidable', () => {
  test('pendiente → liquidable', () => expect(cuotaEsLiquidable({ estado: 'pendiente' })).toBe(true))
  test('vencida → liquidable', () => expect(cuotaEsLiquidable({ estado: 'vencida' })).toBe(true))
  test('en_mora → liquidable', () => expect(cuotaEsLiquidable({ estado: 'en_mora' })).toBe(true))
  test('pagada → not liquidable', () => expect(cuotaEsLiquidable({ estado: 'pagada' })).toBe(false))
  test('exonerada → not liquidable', () => expect(cuotaEsLiquidable({ estado: 'exonerada' })).toBe(false))
  test('becada → not liquidable', () => expect(cuotaEsLiquidable({ estado: 'becada' })).toBe(false))
})
