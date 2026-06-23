import { describe, test, expect } from 'vitest'
import { checkAutoAprobacion, calcularMontoCargo, isStockBajo, buildAsignacion } from '../domain/accesorio.js'

describe('checkAutoAprobacion', () => {
  const acc = { id: 'acc-1', precio_unitario: 200, categoria: 'instrumentos' }
  const auth = { activa: true, monto_maximo: 500, categorias_incluidas: [] }

  test('auto-approved when active, price within limit, no category filter', () => {
    expect(checkAutoAprobacion(acc, auth)).toBe(true)
  })

  test('not approved when autorizacion is inactive', () => {
    expect(checkAutoAprobacion(acc, { ...auth, activa: false })).toBe(false)
  })

  test('not approved when price exceeds monto_maximo', () => {
    expect(checkAutoAprobacion({ ...acc, precio_unitario: 600 }, auth)).toBe(false)
  })

  test('approved when category is in categorias_incluidas', () => {
    const authWithCats = { ...auth, categorias_incluidas: ['instrumentos', 'libros'] }
    expect(checkAutoAprobacion(acc, authWithCats)).toBe(true)
  })

  test('not approved when category not in categorias_incluidas', () => {
    const authWithCats = { ...auth, categorias_incluidas: ['libros'] }
    expect(checkAutoAprobacion(acc, authWithCats)).toBe(false)
  })
})

describe('calcularMontoCargo', () => {
  test('returns precio_unitario * cantidad', () => {
    const acc = { precio_unitario: 200 }
    expect(calcularMontoCargo(acc, 3)).toBe(600)
  })

  test('cantidad 1 returns precio_unitario', () => {
    const acc = { precio_unitario: 150 }
    expect(calcularMontoCargo(acc, 1)).toBe(150)
  })
})

describe('isStockBajo', () => {
  test('stock_actual <= stock_minimo → true', () => {
    expect(isStockBajo({ stock_actual: 2, stock_minimo: 2 })).toBe(true)
    expect(isStockBajo({ stock_actual: 1, stock_minimo: 2 })).toBe(true)
  })

  test('stock_actual > stock_minimo → false', () => {
    expect(isStockBajo({ stock_actual: 5, stock_minimo: 2 })).toBe(false)
  })
})

describe('buildAsignacion', () => {
  const base = { accesorio_id: 'acc-1', alumno_id: 'alu-1', familia_id: 'fam-1', cantidad: 1, precio_unitario: 200, aprobacionRequerida: false }

  test('builds asignacion with all required fields', () => {
    const a = buildAsignacion(base)
    expect(a.accesorio_id).toBe('acc-1')
    expect(a.alumno_id).toBe('alu-1')
    expect(a.familia_id).toBe('fam-1')
    expect(a.cantidad).toBe(1)
    expect(a.precio_unitario).toBe(200)
  })

  test('estado defaults to pendiente when approval not required', () => {
    const a = buildAsignacion(base)
    expect(a.estado).toBe('pendiente')
  })

  test('aprobacion_requerida false when not needed', () => {
    const a = buildAsignacion(base)
    expect(a.aprobacion_requerida).toBe(false)
  })

  test('aprobacion_requerida true when needed', () => {
    const a = buildAsignacion({ ...base, aprobacionRequerida: true })
    expect(a.aprobacion_requerida).toBe(true)
  })
})
