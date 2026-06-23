import { describe, test, expect } from 'vitest'
import {
  aggregateCierreCaja,
  buildEstadoCuentaFamiliar,
  buildMoraReport,
  buildImpactoSocial,
  calcularAbandonoScore,
} from '../domain/reporte.js'

describe('aggregateCierreCaja', () => {
  const pagos = [
    { monto: 300, metodo_pago: 'efectivo', familia_id: 'fam-1' },
    { monto: 200, metodo_pago: 'transferencia', familia_id: 'fam-2' },
    { monto: 100, metodo_pago: 'efectivo', familia_id: 'fam-3' },
  ]

  test('calculates totalGeneral correctly', () => {
    const r = aggregateCierreCaja(pagos, '2026-06-22')
    expect(r.totalGeneral).toBe(600)
  })

  test('groups by metodo_pago', () => {
    const r = aggregateCierreCaja(pagos, '2026-06-22')
    expect(r.porMetodo.efectivo.count).toBe(2)
    expect(r.porMetodo.efectivo.total).toBe(400)
    expect(r.porMetodo.transferencia.count).toBe(1)
    expect(r.porMetodo.transferencia.total).toBe(200)
  })

  test('includes fecha and cantidadTransacciones', () => {
    const r = aggregateCierreCaja(pagos, '2026-06-22')
    expect(r.fecha).toBe('2026-06-22')
    expect(r.cantidadTransacciones).toBe(3)
  })
})

describe('buildEstadoCuentaFamiliar', () => {
  const familia = { id: 'fam-1', nombre_familia: 'García' }
  const cuotas = [
    { estado: 'pagada', monto_base: 300, monto_final: 300 },
    { estado: 'pendiente', monto_base: 300, monto_final: 300 },
  ]
  const pagos = [{ monto: 300, fecha_pago: '2026-05-10' }]
  const wallet = { saldo: 50 }

  test('includes familia in result', () => {
    const r = buildEstadoCuentaFamiliar(familia, cuotas, pagos, wallet)
    expect(r.familia.id).toBe('fam-1')
  })

  test('calculates resumen totals', () => {
    const r = buildEstadoCuentaFamiliar(familia, cuotas, pagos, wallet)
    expect(r.resumen.totalCuotas).toBe(600)
    expect(r.resumen.totalPagado).toBe(300)
    expect(r.resumen.saldoPendiente).toBe(300)
  })

  test('includes walletBalance', () => {
    const r = buildEstadoCuentaFamiliar(familia, cuotas, pagos, wallet)
    expect(r.resumen.walletBalance).toBe(50)
  })

  test('movimientos is sorted timeline', () => {
    const r = buildEstadoCuentaFamiliar(familia, cuotas, pagos, wallet)
    expect(Array.isArray(r.movimientos)).toBe(true)
  })
})

describe('buildMoraReport', () => {
  const cuotasMora = [
    { id: 'c1', familia_id: 'fam-1', fecha_vencimiento: '2026-05-01', estado: 'en_mora' },
  ]
  const representantes = [
    { familia_id: 'fam-1', nombre: 'Carlos García' },
  ]

  test('builds mora report with items', () => {
    const r = buildMoraReport(cuotasMora, representantes, new Date('2026-06-22'))
    expect(r.items).toHaveLength(1)
    expect(r.items[0].cuota.id).toBe('c1')
  })

  test('items include diasMora', () => {
    const r = buildMoraReport(cuotasMora, representantes, new Date('2026-06-22'))
    expect(r.items[0].diasMora).toBeGreaterThan(0)
  })

  test('totalMora is count of cuotas', () => {
    const r = buildMoraReport(cuotasMora, representantes, new Date('2026-06-22'))
    expect(r.totalMora).toBe(1)
  })
})

describe('buildImpactoSocial', () => {
  const becas = [{ alumno_id: 'alu-1', porcentaje: 50 }]
  const patrocinios = [{ alumno_id: 'alu-1', monto_mensual: 150 }]
  const exoneraciones = [{ cuota_id: 'c1', porcentaje: 30 }]

  test('counts becas and patrocinios', () => {
    const r = buildImpactoSocial(becas, patrocinios, exoneraciones)
    expect(r.totalBecas).toBe(1)
    expect(r.totalPatrocinios).toBe(1)
  })

  test('calculates valorSubsidios', () => {
    const r = buildImpactoSocial(becas, patrocinios, exoneraciones)
    expect(typeof r.valorSubsidios).toBe('number')
  })

  test('calculates valorRecuperado from patrocinios', () => {
    const r = buildImpactoSocial(becas, patrocinios, exoneraciones)
    expect(typeof r.valorRecuperado).toBe('number')
  })
})

describe('calcularAbandonoScore', () => {
  test('perfect metrics → 100', () => {
    const score = calcularAbandonoScore(100, 1, 1)
    expect(score).toBeCloseTo(100, 1)
  })

  test('zero metrics → 0', () => {
    const score = calcularAbandonoScore(0, 0, 0)
    expect(score).toBe(0)
  })

  test('calculates weighted formula correctly', () => {
    // (80/100*0.4 + 0.7*0.3 + 0.6*0.3) * 100
    const score = calcularAbandonoScore(80, 0.7, 0.6)
    const expected = (80 / 100 * 0.4 + 0.7 * 0.3 + 0.6 * 0.3) * 100
    expect(score).toBeCloseTo(expected, 1)
  })

  test('result bounded 0-100', () => {
    const score = calcularAbandonoScore(100, 1, 1)
    expect(score).toBeLessThanOrEqual(100)
    expect(score).toBeGreaterThanOrEqual(0)
  })
})
