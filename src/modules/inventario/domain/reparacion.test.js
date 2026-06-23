import { describe, test, expect } from 'vitest'
import {
  ESTADOS_REPARACION,
  TRANSICIONES_REPARACION,
  puedeTransitarReparacion,
  validarReparacion,
  calcularCostoReal,
  diasEnReparacion,
  puedeIngresarAReparacion,
} from './reparacion.js'

describe('ESTADOS_REPARACION', () => {
  test('incluye estados esperados en orden', () => {
    expect(ESTADOS_REPARACION).toEqual(['recibido', 'en_reparacion', 'finalizado', 'entregado'])
  })
})

describe('TRANSICIONES_REPARACION', () => {
  test('recibido → en_reparacion es válida', () => {
    expect(TRANSICIONES_REPARACION.recibido).toContain('en_reparacion')
  })

  test('en_reparacion → finalizado es válida', () => {
    expect(TRANSICIONES_REPARACION.en_reparacion).toContain('finalizado')
  })

  test('finalizado → entregado es válida', () => {
    expect(TRANSICIONES_REPARACION.finalizado).toContain('entregado')
  })

  test('recibido → entregado NO es válida', () => {
    expect(TRANSICIONES_REPARACION.recibido).not.toContain('entregado')
  })
})

describe('puedeTransitarReparacion', () => {
  test('recibido → en_reparacion retorna true', () => {
    expect(puedeTransitarReparacion('recibido', 'en_reparacion')).toBe(true)
  })

  test('recibido → entregado retorna false', () => {
    expect(puedeTransitarReparacion('recibido', 'entregado')).toBe(false)
  })

  test('entregado no puede transitar a ningún estado', () => {
    expect(puedeTransitarReparacion('entregado', 'recibido')).toBe(false)
    expect(puedeTransitarReparacion('entregado', 'finalizado')).toBe(false)
  })

  test('estado origen desconocido retorna false', () => {
    expect(puedeTransitarReparacion('inexistente', 'recibido')).toBe(false)
  })
})

describe('validarReparacion', () => {
  test('payload válido retorna array vacío', () => {
    const errores = validarReparacion({
      activo_id: 'act-1',
      descripcion: 'Cambio de cuerdas',
      tipo_tallerista: 'externo',
      tallerista_nombre: 'Juan Luthier',
      costo_estimado: 500,
    })
    expect(errores).toEqual([])
  })

  test('retorna error si falta activo_id', () => {
    const errores = validarReparacion({ descripcion: 'test', tipo_tallerista: 'externo' })
    expect(errores).toContain('activo_id es requerido')
  })

  test('retorna error si falta descripcion', () => {
    const errores = validarReparacion({ activo_id: 'act-1', tipo_tallerista: 'externo' })
    expect(errores).toContain('descripcion es requerida')
  })

  test('retorna error si falta tipo_tallerista', () => {
    const errores = validarReparacion({ activo_id: 'act-1', descripcion: 'test' })
    expect(errores).toContain('tipo_tallerista es requerido')
  })

  test('retorna error si tipo_tallerista inválido', () => {
    const errores = validarReparacion({ activo_id: 'act-1', descripcion: 'test', tipo_tallerista: 'inexistente' })
    expect(errores.some(e => e.includes('tallerista'))).toBe(true)
  })

  test('retorna error si costo_estimado negativo', () => {
    const errores = validarReparacion({ activo_id: 'act-1', descripcion: 'test', tipo_tallerista: 'externo', costo_estimado: -100 })
    expect(errores.length).toBeGreaterThan(0)
  })

  test('NO retorna error si costo_estimado es 0', () => {
    const errores = validarReparacion({ activo_id: 'act-1', descripcion: 'test', tipo_tallerista: 'externo', tallerista_nombre: 'Juan', costo_estimado: 0 })
    expect(errores).toEqual([])
  })
})

describe('calcularCostoReal', () => {
  test('usa costo_real cuando existe', () => {
    expect(calcularCostoReal({ costo_real: 800, costo_estimado: 500 })).toBe(800)
  })

  test('usa costo_estimado si no hay costo_real', () => {
    expect(calcularCostoReal({ costo_estimado: 500 })).toBe(500)
  })

  test('retorna 0 si no hay costos', () => {
    expect(calcularCostoReal({})).toBe(0)
  })
})

describe('diasEnReparacion', () => {
  test('con fecha_egreso calcula diferencia', () => {
    const resultado = diasEnReparacion({ fecha_ingreso: '2026-06-01', fecha_egreso: '2026-06-10' })
    expect(resultado).toBe(9)
  })

  test('sin fecha_egreso retorna 0', () => {
    const resultado = diasEnReparacion({ fecha_ingreso: '2026-06-01' })
    expect(resultado).toBe(0)
  })

  test('con misma fecha retorna 0', () => {
    const resultado = diasEnReparacion({ fecha_ingreso: '2026-06-01', fecha_egreso: '2026-06-01' })
    expect(resultado).toBe(0)
  })
})

describe('puedeIngresarAReparacion', () => {
  test('activo disponible → true', () => {
    expect(puedeIngresarAReparacion({}, { estado_uso: 'disponible' })).toBe(true)
  })

  test('activo en_reparacion → false', () => {
    expect(puedeIngresarAReparacion({}, { estado_uso: 'en_reparacion' })).toBe(false)
  })

  test('activo de_baja → false', () => {
    expect(puedeIngresarAReparacion({}, { estado_uso: 'de_baja' })).toBe(false)
  })

  test('activo prestado → true (se puede reparar aunque esté prestado)', () => {
    expect(puedeIngresarAReparacion({}, { estado_uso: 'prestado' })).toBe(true)
  })
})
