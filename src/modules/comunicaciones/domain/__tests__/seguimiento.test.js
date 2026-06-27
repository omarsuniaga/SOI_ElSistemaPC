import { describe, test, expect } from 'vitest'
import {
  CANALES,
  RESULTADOS,
  esAbierto,
  esSeguimientoVencido,
  esSeguimientoHoy,
  diasParaProxima,
  clasificarAgenda,
} from '../seguimiento.js'

const HOY = new Date('2026-06-25T12:00:00')
const reg = (over = {}) => ({
  estado: 'abierto',
  requiere_seguimiento: true,
  proxima_fecha: '2026-06-25',
  ...over,
})

describe('catálogos', () => {
  test('CANALES incluye los 5 canales estándar', () => {
    expect(Object.keys(CANALES)).toEqual(
      expect.arrayContaining(['llamada', 'whatsapp', 'correo', 'reunion', 'otro']),
    )
  })
  test('RESULTADOS limita a 5 disposition codes (estándar CRM)', () => {
    expect(Object.keys(RESULTADOS)).toHaveLength(5)
    expect(Object.keys(RESULTADOS)).toEqual(
      expect.arrayContaining(['contactado', 'buzon_no_contesto', 'reagendar', 'sin_interes', 'resuelto']),
    )
  })
})

describe('esAbierto', () => {
  test('true si estado abierto', () => {
    expect(esAbierto(reg({ estado: 'abierto' }))).toBe(true)
  })
  test('false si cerrado', () => {
    expect(esAbierto(reg({ estado: 'cerrado' }))).toBe(false)
  })
})

describe('esSeguimientoVencido', () => {
  test('vencido: proxima_fecha pasada, abierto, requiere seguimiento', () => {
    expect(esSeguimientoVencido(reg({ proxima_fecha: '2026-06-20' }), HOY)).toBe(true)
  })
  test('no vencido si la fecha es hoy', () => {
    expect(esSeguimientoVencido(reg({ proxima_fecha: '2026-06-25' }), HOY)).toBe(false)
  })
  test('no vencido si está cerrado', () => {
    expect(esSeguimientoVencido(reg({ proxima_fecha: '2026-06-20', estado: 'cerrado' }), HOY)).toBe(false)
  })
  test('no vencido si no requiere seguimiento', () => {
    expect(esSeguimientoVencido(reg({ proxima_fecha: '2026-06-20', requiere_seguimiento: false }), HOY)).toBe(false)
  })
  test('no vencido si no hay proxima_fecha', () => {
    expect(esSeguimientoVencido(reg({ proxima_fecha: null }), HOY)).toBe(false)
  })
})

describe('esSeguimientoHoy', () => {
  test('true si proxima_fecha es hoy y abierto', () => {
    expect(esSeguimientoHoy(reg({ proxima_fecha: '2026-06-25' }), HOY)).toBe(true)
  })
  test('false si es otro día', () => {
    expect(esSeguimientoHoy(reg({ proxima_fecha: '2026-06-26' }), HOY)).toBe(false)
  })
})

describe('diasParaProxima', () => {
  test('0 para hoy', () => {
    expect(diasParaProxima(reg({ proxima_fecha: '2026-06-25' }), HOY)).toBe(0)
  })
  test('positivo para futuro', () => {
    expect(diasParaProxima(reg({ proxima_fecha: '2026-06-28' }), HOY)).toBe(3)
  })
  test('negativo para pasado', () => {
    expect(diasParaProxima(reg({ proxima_fecha: '2026-06-22' }), HOY)).toBe(-3)
  })
  test('null si no hay fecha', () => {
    expect(diasParaProxima(reg({ proxima_fecha: null }), HOY)).toBeNull()
  })
})

describe('clasificarAgenda', () => {
  test('separa en vencidos, hoy y próximos', () => {
    const registros = [
      reg({ id: 'a', proxima_fecha: '2026-06-20' }), // vencido
      reg({ id: 'b', proxima_fecha: '2026-06-25' }), // hoy
      reg({ id: 'c', proxima_fecha: '2026-06-30' }), // próximo
      reg({ id: 'd', proxima_fecha: '2026-06-19', estado: 'cerrado' }), // ignorado (cerrado)
      reg({ id: 'e', requiere_seguimiento: false, proxima_fecha: '2026-06-21' }), // ignorado
    ]
    const res = clasificarAgenda(registros, HOY)
    expect(res.vencidos.map((r) => r.id)).toEqual(['a'])
    expect(res.hoy.map((r) => r.id)).toEqual(['b'])
    expect(res.proximos.map((r) => r.id)).toEqual(['c'])
  })
  test('lista vacía no rompe', () => {
    const res = clasificarAgenda([], HOY)
    expect(res).toEqual({ vencidos: [], hoy: [], proximos: [] })
  })
})
