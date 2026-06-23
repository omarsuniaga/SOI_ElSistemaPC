import { describe, test, expect } from 'vitest'
import {
  ESTADOS_ACTIVO,
  CATEGORIAS,
  TRANSICIONES_ESTADO,
  puedeTransitarA,
  validarActivo,
  calcularAntiguedad,
  crearEventoCambioEstado,
  puedeDarseDeBaja,
  motivoNoBaja,
  calcularValorDepreciado,
  badgeEstadoConservacion,
  badgeEstadoUso,
} from './activo.js'

describe('constantes', () => {
  test('ESTADOS_ACTIVO incluye estados esperados', () => {
    expect(ESTADOS_ACTIVO).toContain('disponible')
    expect(ESTADOS_ACTIVO).toContain('prestado')
    expect(ESTADOS_ACTIVO).toContain('en_mantenimiento')
    expect(ESTADOS_ACTIVO).toContain('en_reparacion')
    expect(ESTADOS_ACTIVO).toContain('de_baja')
  })

  test('CATEGORIAS es un array no vacío', () => {
    expect(Array.isArray(CATEGORIAS)).toBe(true)
    expect(CATEGORIAS.length).toBeGreaterThan(0)
  })

  test('TRANSICIONES_ESTADO tiene entradas para cada estado', () => {
    const estados = Object.keys(TRANSICIONES_ESTADO)
    expect(estados.length).toBeGreaterThan(0)
  })
})

describe('puedeTransitarA', () => {
  test('disponible → prestado es válido', () => {
    expect(puedeTransitarA('disponible', 'prestado')).toBe(true)
  })

  test('disponible → en_reparacion es válido', () => {
    expect(puedeTransitarA('disponible', 'en_reparacion')).toBe(true)
  })

  test('prestado → disponible es válido', () => {
    expect(puedeTransitarA('prestado', 'disponible')).toBe(true)
  })

  test('prestado → de_baja NO es válido directo', () => {
    expect(puedeTransitarA('prestado', 'de_baja')).toBe(false)
  })

  test('de_baja no tiene transiciones salientes', () => {
    expect(puedeTransitarA('de_baja', 'disponible')).toBe(false)
  })

  test('estado origen desconocido retorna false', () => {
    expect(puedeTransitarA('inexistente', 'disponible')).toBe(false)
  })
})

describe('calcularAntiguedad', () => {
  test('con fecha_adquisicion definida retorna años', () => {
    const activo = { fecha_adquisicion: '2020-01-15' }
    const antiguedad = calcularAntiguedad(activo)
    expect(antiguedad).toBeGreaterThanOrEqual(6)
    expect(antiguedad).toBeLessThanOrEqual(7)
  })

  test('sin fecha_adquisicion retorna null', () => {
    expect(calcularAntiguedad({})).toBeNull()
  })

  test('con fecha_adquisicion null retorna null', () => {
    expect(calcularAntiguedad({ fecha_adquisicion: null })).toBeNull()
  })
})

describe('puedeDarseDeBaja', () => {
  test('disponible y sin comodato activo → true', () => {
    expect(puedeDarseDeBaja({ estado_uso: 'disponible', activo: true })).toBe(true)
  })

  test('prestado → false', () => {
    expect(puedeDarseDeBaja({ estado_uso: 'prestado', activo: true })).toBe(false)
  })

  test('en_reparacion → false', () => {
    expect(puedeDarseDeBaja({ estado_uso: 'en_reparacion', activo: true })).toBe(false)
  })

  test('activo=false → false', () => {
    expect(puedeDarseDeBaja({ estado_uso: 'disponible', activo: false })).toBe(false)
  })
})

describe('motivoNoBaja', () => {
  test('retorna null cuando puede darse de baja', () => {
    expect(motivoNoBaja({ estado_uso: 'disponible', activo: true })).toBeNull()
  })

  test('explica por qué no puede darse de baja si está prestado', () => {
    const motivo = motivoNoBaja({ estado_uso: 'prestado', activo: true })
    expect(motivo).toMatch(/prestado|comodato/i)
  })

  test('explica si el instrumento está inactivo', () => {
    const motivo = motivoNoBaja({ estado_uso: 'disponible', activo: false })
    expect(motivo).toMatch(/inactivo|baja/i)
  })
})

describe('calcularValorDepreciado', () => {
  test('calcula depreciación lineal a 10 años', () => {
    const activo = { valor_adquisicion: 1000, fecha_adquisicion: '2020-01-01' }
    const valor = calcularValorDepreciado(activo)
    expect(valor).toBeGreaterThan(0)
    expect(valor).toBeLessThan(1000)
  })

  test('sin valor_adquisicion retorna null', () => {
    expect(calcularValorDepreciado({ fecha_adquisicion: '2020-01-01' })).toBeNull()
  })

  test('sin fecha_adquisicion retorna valor_adquisicion completo', () => {
    expect(calcularValorDepreciado({ valor_adquisicion: 500 })).toBe(500)
  })
})

describe('validarActivo', () => {
  test('payload válido retorna array vacío', () => {
    const errores = validarActivo({
      tipo_instrumento: 'Violín',
      codigo_inventario: 'V8-VIO-001',
      estado_uso: 'disponible',
      estado_conservacion: 'bueno',
    })
    expect(errores).toEqual([])
  })

  test('retorna error si falta tipo_instrumento', () => {
    const errores = validarActivo({
      codigo_inventario: 'V8-VIO-001',
    })
    expect(errores).toContain('tipo_instrumento es requerido')
  })

  test('retorna error si codigo_inventario no cumple formato', () => {
    const errores = validarActivo({
      tipo_instrumento: 'Violín',
      codigo_inventario: 'invalido',
    })
    expect(errores.some(e => e.includes('código') || e.includes('codigo'))).toBe(true)
  })

  test('retorna error si estado_uso inválido', () => {
    const errores = validarActivo({
      tipo_instrumento: 'Violín',
      codigo_inventario: 'V8-VIO-001',
      estado_uso: 'irreparable',
    })
    expect(errores.length).toBeGreaterThan(0)
  })

  test('retorna error si estado_conservacion inválido', () => {
    const errores = validarActivo({
      tipo_instrumento: 'Violín',
      codigo_inventario: 'V8-VIO-001',
      estado_uso: 'disponible',
      estado_conservacion: 'destruido',
    })
    expect(errores.length).toBeGreaterThan(0)
  })
})

describe('crearEventoCambioEstado', () => {
  test('crea objeto de evento con datos esperados', () => {
    const evento = crearEventoCambioEstado('act-1', 'disponible', 'prestado', 'user-1')
    expect(evento.activo_id).toBe('act-1')
    expect(evento.tipo_evento).toBe('cambio_estado')
    expect(evento.estado_anterior).toBe('disponible')
    expect(evento.estado_nuevo).toBe('prestado')
    expect(evento.usuario_id).toBe('user-1')
    expect(evento.fecha).toBeDefined()
  })
})

describe('badgeEstadoConservacion', () => {
  test('retorna clase Bootstrap para cada estado conocido', () => {
    expect(badgeEstadoConservacion('excelente')).toMatch(/bg-success/)
    expect(badgeEstadoConservacion('bueno')).toMatch(/bg-primary/)
    expect(badgeEstadoConservacion('regular')).toMatch(/bg-warning/)
    expect(badgeEstadoConservacion('mantenimiento')).toMatch(/bg-orange/)
    expect(badgeEstadoConservacion('de_baja')).toMatch(/bg-danger/)
  })

  test('retorna default para estado desconocido', () => {
    expect(badgeEstadoConservacion('inexistente')).toMatch(/bg-secondary/)
  })
})

describe('badgeEstadoUso', () => {
  test('retorna clase Bootstrap para cada estado conocido', () => {
    expect(badgeEstadoUso('disponible')).toMatch(/bg-success/)
    expect(badgeEstadoUso('prestado')).toMatch(/bg-info/)
    expect(badgeEstadoUso('en_mantenimiento')).toMatch(/bg-warning/)
    expect(badgeEstadoUso('en_reparacion')).not.toBe('')
  })

  test('incluye en_reparacion correctamente', () => {
    expect(badgeEstadoUso('en_reparacion')).toMatch(/bg-danger/)
  })

  test('retorna default para estado desconocido', () => {
    expect(badgeEstadoUso('inexistente')).toMatch(/bg-secondary/)
  })
})
