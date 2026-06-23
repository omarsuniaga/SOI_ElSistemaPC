import { describe, test, expect } from 'vitest'
import { buildExoneracion, calcularMontoExonerado, validateExoneracion } from '../domain/exoneracion.js'

describe('validateExoneracion', () => {
  test('valid parcial exoneracion', () => {
    const r = validateExoneracion({ cuota_id: 'c1', familia_id: 'f1', tipo: 'parcial', porcentaje: 50, motivo: 'Motivo', aprobado_por: 'u1' })
    expect(r.valid).toBe(true)
    expect(r.errors).toHaveLength(0)
  })

  test('invalid when tipo=total but porcentaje != 100', () => {
    const r = validateExoneracion({ cuota_id: 'c1', familia_id: 'f1', tipo: 'total', porcentaje: 80, motivo: 'Motivo', aprobado_por: 'u1' })
    expect(r.valid).toBe(false)
    expect(r.errors).toContain('porcentaje debe ser 100 para exoneración total')
  })

  test('valid when tipo=total and porcentaje=100', () => {
    const r = validateExoneracion({ cuota_id: 'c1', familia_id: 'f1', tipo: 'total', porcentaje: 100, motivo: 'Motivo', aprobado_por: 'u1' })
    expect(r.valid).toBe(true)
  })

  test('invalid when motivo is missing', () => {
    const r = validateExoneracion({ cuota_id: 'c1', familia_id: 'f1', tipo: 'parcial', porcentaje: 50, aprobado_por: 'u1' })
    expect(r.valid).toBe(false)
    expect(r.errors).toContain('motivo es requerido')
  })

  test('invalid when aprobado_por is missing', () => {
    const r = validateExoneracion({ cuota_id: 'c1', familia_id: 'f1', tipo: 'parcial', porcentaje: 50, motivo: 'M' })
    expect(r.valid).toBe(false)
    expect(r.errors).toContain('aprobado_por es requerido')
  })

  test('invalid when porcentaje out of range (>100)', () => {
    const r = validateExoneracion({ cuota_id: 'c1', familia_id: 'f1', tipo: 'parcial', porcentaje: 110, motivo: 'M', aprobado_por: 'u1' })
    expect(r.valid).toBe(false)
  })
})

describe('buildExoneracion', () => {
  const base = { cuota_id: 'c1', familia_id: 'f1', tipo: 'parcial', porcentaje: 50, motivo: 'M', aprobado_por: 'u1' }

  test('builds exoneracion record', () => {
    const e = buildExoneracion(base)
    expect(e.cuota_id).toBe('c1')
    expect(e.tipo).toBe('parcial')
    expect(e.porcentaje).toBe(50)
  })

  test('tipo=total forces porcentaje=100', () => {
    const e = buildExoneracion({ ...base, tipo: 'total', porcentaje: 100 })
    expect(e.porcentaje).toBe(100)
  })
})

describe('calcularMontoExonerado', () => {
  const cuota = { monto_base: 300 }

  test('50% exoneracion = 150', () => {
    const e = { porcentaje: 50 }
    expect(calcularMontoExonerado(cuota, e)).toBe(150)
  })

  test('100% exoneracion = full amount', () => {
    const e = { porcentaje: 100 }
    expect(calcularMontoExonerado(cuota, e)).toBe(300)
  })

  test('0% exoneracion = 0', () => {
    const e = { porcentaje: 0 }
    expect(calcularMontoExonerado(cuota, e)).toBe(0)
  })
})
