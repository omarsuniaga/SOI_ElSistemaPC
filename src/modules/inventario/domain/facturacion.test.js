import { describe, test, expect } from 'vitest'
import {
  METODOS_PAGO,
  calcularIVA,
  calcularTotal,
  formatearMoneda,
  validarFactura,
  puedeAnularse,
  liquidarFactura,
  formatearNumeroFactura,
} from './facturacion.js'

describe('METODOS_PAGO', () => {
  test('incluye métodos esperados', () => {
    expect(METODOS_PAGO).toContain('efectivo')
    expect(METODOS_PAGO).toContain('transferencia')
    expect(METODOS_PAGO).toContain('deposito')
    expect(METODOS_PAGO).toContain('tarjeta')
  })
})

describe('calcularIVA', () => {
  test('calcula IVA al 18% por defecto', () => {
    expect(calcularIVA(100)).toBe(18)
  })

  test('calcula IVA con tasa personalizada', () => {
    expect(calcularIVA(100, 0.16)).toBe(16)
  })

  test('IVA de 0 es 0', () => {
    expect(calcularIVA(0)).toBe(0)
  })
})

describe('calcularTotal', () => {
  test('suma subtotal e impuestos', () => {
    expect(calcularTotal(500, 90)).toBe(590)
  })

  test('con impuestos en 0', () => {
    expect(calcularTotal(500, 0)).toBe(500)
  })
})

describe('formatearMoneda', () => {
  test('formatea con símbolo RD y 2 decimales', () => {
    const formateado = formatearMoneda(1500)
    expect(formateado).toMatch(/RD/)
    expect(formateado).toMatch(/1500/)
  })

  test('formatea centavos correctamente', () => {
    const formateado = formatearMoneda(1500.5)
    expect(formateado).toMatch(/\.50/)
  })
})

describe('formatearNumeroFactura', () => {
  test('formatea con prefijo FACT y año', () => {
    const resultado = formatearNumeroFactura(1)
    expect(resultado).toMatch(/^FACT-\d{4}-00001$/)
  })

  test('formatea número 123 como 00123', () => {
    const resultado = formatearNumeroFactura(123)
    expect(resultado).toMatch(/-00123$/)
  })
})

describe('validarFactura', () => {
  test('payload válido retorna array vacío', () => {
    const errores = validarFactura({
      reparacion_id: 'rep-1',
      monto_total: 1000,
      metodo_pago: 'efectivo',
      tipo_factura: 'institucion',
    })
    expect(errores).toEqual([])
  })

  test('retorna error si falta reparacion_id', () => {
    const errores = validarFactura({ monto_total: 1000, metodo_pago: 'efectivo' })
    expect(errores).toContain('reparacion_id es requerido')
  })

  test('retorna error si monto_total <= 0', () => {
    const errores = validarFactura({ reparacion_id: 'rep-1', monto_total: 0, metodo_pago: 'efectivo' })
    expect(errores).toContain('monto_total debe ser mayor a 0')
  })

  test('retorna error si metodo_pago inválido', () => {
    const errores = validarFactura({ reparacion_id: 'rep-1', monto_total: 1000, metodo_pago: 'bitcoin' })
    expect(errores.some(e => e.includes('metodo_pago'))).toBe(true)
  })

  test('retorna error si tipo_factura inválido', () => {
    const errores = validarFactura({ reparacion_id: 'rep-1', monto_total: 1000, metodo_pago: 'efectivo', tipo_factura: 'gobierno' })
    expect(errores.some(e => e.includes('tipo_factura'))).toBe(true)
  })
})

describe('puedeAnularse', () => {
  test('factura pendiente → true', () => {
    expect(puedeAnularse({ estado_pago: 'pendiente' })).toBe(true)
  })

  test('factura pagada → false', () => {
    expect(puedeAnularse({ estado_pago: 'pagado' })).toBe(false)
  })

  test('factura ya anulada → false', () => {
    expect(puedeAnularse({ estado_pago: 'anulada' })).toBe(false)
  })
})

describe('liquidarFactura', () => {
  test('cambia estado_pago a pagado', () => {
    const factura = { id: 'fac-1', estado_pago: 'pendiente' }
    const liquidada = liquidarFactura(factura)
    expect(liquidada.estado_pago).toBe('pagado')
  })

  test('agrega fecha_pago', () => {
    const factura = { id: 'fac-1', estado_pago: 'pendiente' }
    const liquidada = liquidarFactura(factura)
    expect(liquidada.fecha_pago).toBeDefined()
  })

  test('no muta el objeto original', () => {
    const factura = { id: 'fac-1', estado_pago: 'pendiente' }
    const liquidada = liquidarFactura(factura)
    expect(factura.estado_pago).toBe('pendiente')
    expect(liquidada).not.toBe(factura)
  })
})
