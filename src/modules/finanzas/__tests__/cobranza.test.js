import { describe, test, expect } from 'vitest'
import { calcularEstadoFinanciero } from '../domain/cobranza.js'

const alumnoBase = { id: 'alu-1', nombre_completo: 'Test', exento_mensualidad: false }
const alumnoExento = { ...alumnoBase, exento_mensualidad: true }

describe('calcularEstadoFinanciero', () => {
  test('exento → siempre verde sin evaluar fechas', () => {
    const res = calcularEstadoFinanciero(alumnoExento, [], new Date('2026-06-22'))
    expect(res.estado).toBe('verde')
    expect(res.requiereAprobacionDireccion).toBe(false)
  })

  test('sin pagos → rojo, requiere revisión de Dirección (nunca bloqueo automático)', () => {
    const res = calcularEstadoFinanciero(alumnoBase, [], new Date('2026-06-22'))
    expect(res.estado).toBe('rojo')
    expect(res.requiereAprobacionDireccion).toBe(true)
    expect(res).not.toHaveProperty('bloqueado')
  })

  test('último pago < 30 días → verde', () => {
    const pagos = [{ concepto: 'mensualidad', periodo_mes: '2026-06-01' }]
    const res = calcularEstadoFinanciero(alumnoBase, pagos, new Date('2026-06-22'))
    expect(res.estado).toBe('verde')
  })

  test('mora entre 30 y 59 días → amarillo', () => {
    const pagos = [{ concepto: 'mensualidad', periodo_mes: '2026-05-01' }]
    const res = calcularEstadoFinanciero(alumnoBase, pagos, new Date('2026-06-22'))
    expect(res.estado).toBe('amarillo')
    expect(res.requiereAprobacionDireccion).toBe(false)
  })

  test('mora >= 60 días → rojo, requiere revisión de Dirección', () => {
    const pagos = [{ concepto: 'mensualidad', periodo_mes: '2026-03-01' }]
    const res = calcularEstadoFinanciero(alumnoBase, pagos, new Date('2026-06-22'))
    expect(res.estado).toBe('rojo')
    expect(res.requiereAprobacionDireccion).toBe(true)
  })

  test('respeta los umbrales de finanzas_politica_cobranza en vez de valores fijos', () => {
    const pagos = [{ concepto: 'mensualidad', periodo_mes: '2026-05-01' }]
    // 52 días de mora: con umbrales por defecto (30/60) esto sería 'amarillo';
    // con una política más estricta (15/45) debe pasar a 'rojo' sin tocar código.
    const res = calcularEstadoFinanciero(alumnoBase, pagos, new Date('2026-06-22'), {
      dias_mora_amarilla: 15,
      dias_mora_critica: 45,
    })
    expect(res.estado).toBe('rojo')
  })

  test('ignora conceptos que no son mensualidad', () => {
    const pagos = [{ concepto: 'inscripcion', periodo_mes: '2026-06-01' }]
    const res = calcularEstadoFinanciero(alumnoBase, pagos, new Date('2026-06-22'))
    expect(res.estado).toBe('rojo')
  })

  test('toma el período más reciente cuando hay múltiples pagos', () => {
    const pagos = [
      { concepto: 'mensualidad', periodo_mes: '2026-01-01' },
      { concepto: 'mensualidad', periodo_mes: '2026-06-01' },
    ]
    const res = calcularEstadoFinanciero(alumnoBase, pagos, new Date('2026-06-22'))
    expect(res.estado).toBe('verde')
  })
})
