import { describe, test, expect } from 'vitest'
import {
  puedeAsignarse,
  motivoNoAsignable,
  TIPOS_COMODATO,
  puedeIntercambiarse,
  intercambiar,
  diasHastaVencimiento,
  estaVencido,
  puedeRenovarse,
  renovar,
  PALETA_VENCIMIENTO,
  estadoVencimiento,
} from '../domain/comodato.js'

const activoDisponible = {
  id: 'act-1',
  activo: true,
  estado_conservacion: 'bueno',
  estado_uso: 'disponible',
}

describe('TIPOS_COMODATO', () => {
  test('incluye tipos esperados', () => {
    expect(TIPOS_COMODATO).toContain('escolar')
    expect(TIPOS_COMODATO).toContain('anual')
    expect(TIPOS_COMODATO).toContain('eventual')
  })
})

describe('puedeAsignarse', () => {
  test('activo disponible en buen estado → puede asignarse', () => {
    expect(puedeAsignarse(activoDisponible)).toBe(true)
  })

  test('instrumento en mantenimiento → no puede asignarse', () => {
    expect(puedeAsignarse({ ...activoDisponible, estado_conservacion: 'mantenimiento' })).toBe(false)
  })

  test('instrumento de baja → no puede asignarse', () => {
    expect(puedeAsignarse({ ...activoDisponible, estado_conservacion: 'de_baja' })).toBe(false)
  })

  test('instrumento ya prestado → no puede asignarse', () => {
    expect(puedeAsignarse({ ...activoDisponible, estado_uso: 'prestado' })).toBe(false)
  })

  test('instrumento inactivo (activo=false) → no puede asignarse', () => {
    expect(puedeAsignarse({ ...activoDisponible, activo: false })).toBe(false)
  })

  test('excelente y disponible → puede asignarse', () => {
    expect(puedeAsignarse({ ...activoDisponible, estado_conservacion: 'excelente' })).toBe(true)
  })
})

describe('motivoNoAsignable', () => {
  test('retorna null cuando puede asignarse', () => {
    expect(motivoNoAsignable(activoDisponible)).toBeNull()
  })

  test('explica correctamente cuando está prestado', () => {
    const motivo = motivoNoAsignable({ ...activoDisponible, estado_uso: 'prestado' })
    expect(motivo).toMatch(/comodato/i)
  })
})

describe('puedeIntercambiarse', () => {
  const comodatoActivo = { id: 'c-1', activo_id: 'act-1', estado: 'activo' }
  const activoDisponible = { id: 'act-2', activo: true, estado_uso: 'disponible' }

  test('comodato activo y activo destino disponible → true', () => {
    expect(puedeIntercambiarse(comodatoActivo, activoDisponible)).toBe(true)
  })

  test('comodato devuelto → false', () => {
    expect(puedeIntercambiarse({ ...comodatoActivo, estado: 'devuelto' }, activoDisponible)).toBe(false)
  })

  test('activo destino en reparación → false', () => {
    expect(puedeIntercambiarse(comodatoActivo, { ...activoDisponible, estado_uso: 'en_reparacion' })).toBe(false)
  })

  test('activo destino de baja → false', () => {
    expect(puedeIntercambiarse(comodatoActivo, { ...activoDisponible, estado_uso: 'de_baja' })).toBe(false)
  })

  test('activo destino inactivo → false', () => {
    expect(puedeIntercambiarse(comodatoActivo, { ...activoDisponible, activo: false })).toBe(false)
  })
})

describe('intercambiar', () => {
  test('intercambia activos entre dos comodatos correctamente', () => {
    const resultado = intercambiar(
      { id: 'c-1', activo_id: 'act-1', estado: 'activo' },
      { id: 'c-2', activo_id: 'act-2', estado: 'activo' },
      { id: 'act-1', activo: true, estado_uso: 'prestado' },
      { id: 'act-2', activo: true, estado_uso: 'disponible' },
    )
    expect(resultado.comodatoOrigenActualizado.activo_id).toBe('act-2')
    expect(resultado.comodatoDestinoActualizado.activo_id).toBe('act-1')
    expect(resultado.comodatoOrigenActualizado.intercambiado_con_id).toBe('c-2')
    expect(resultado.comodatoDestinoActualizado.intercambiado_con_id).toBe('c-1')
  })

  test('lanza error si no puede intercambiarse', () => {
    expect(() => intercambiar(
      { id: 'c-1', activo_id: 'act-1', estado: 'devuelto' },
      { id: 'c-2', activo_id: 'act-2', estado: 'activo' },
      { id: 'act-1', activo: true, estado_uso: 'disponible' },
      { id: 'act-2', activo: true, estado_uso: 'disponible' },
    )).toThrow()
  })
})

describe('diasHastaVencimiento', () => {
  test('con fecha futura retorna positivo', () => {
    const hoy = new Date()
    hoy.setHours(0, 0, 0, 0)
    const futuro = new Date(hoy)
    futuro.setDate(futuro.getDate() + 15)
    const y = futuro.getFullYear()
    const m = String(futuro.getMonth() + 1).padStart(2, '0')
    const d = String(futuro.getDate()).padStart(2, '0')
    const comodato = { fecha_vencimiento: `${y}-${m}-${d}` }
    expect(diasHastaVencimiento(comodato)).toBe(15)
  })

  test('sin fecha_vencimiento retorna null', () => {
    expect(diasHastaVencimiento({})).toBeNull()
  })
})

describe('estaVencido', () => {
  test('retorna true si fecha_vencimiento = ayer', () => {
    const ayer = new Date()
    ayer.setDate(ayer.getDate() - 1)
    // Construir la fecha con partes LOCALES (no toISOString/UTC) para que coincida
    // con cómo estaVencido parsea el string como medianoche local — evita el
    // off-by-one por zona horaria (ej. UTC-4 de noche).
    const comodato = {
      fecha_vencimiento: `${ayer.getFullYear()}-${String(ayer.getMonth() + 1).padStart(2, '0')}-${String(ayer.getDate()).padStart(2, '0')}`,
    }
    expect(estaVencido(comodato)).toBe(true)
  })

  test('retorna false si fecha_vencimiento = mañana', () => {
    const maniana = new Date()
    maniana.setDate(maniana.getDate() + 1)
    const comodato = { fecha_vencimiento: maniana.toISOString().split('T')[0] }
    expect(estaVencido(comodato)).toBe(false)
  })

  test('retorna false si no tiene fecha_vencimiento', () => {
    expect(estaVencido({})).toBe(false)
  })
})

describe('puedeRenovarse', () => {
  test('comodato próximo a vencer (<= 30 días) → true', () => {
    const futuro = new Date()
    futuro.setDate(futuro.getDate() + 7)
    const comodato = { estado: 'activo', fecha_vencimiento: futuro.toISOString().split('T')[0] }
    expect(puedeRenovarse(comodato)).toBe(true)
  })

  test('comodato vencido → true (puede renovarse)', () => {
    const ayer = new Date()
    ayer.setDate(ayer.getDate() - 1)
    const comodato = { estado: 'activo', fecha_vencimiento: ayer.toISOString().split('T')[0] }
    expect(puedeRenovarse(comodato)).toBe(true)
  })

  test('comodato con vencimiento lejano → false', () => {
    const futuro = new Date()
    futuro.setDate(futuro.getDate() + 60)
    const comodato = { estado: 'activo', fecha_vencimiento: futuro.toISOString().split('T')[0] }
    expect(puedeRenovarse(comodato)).toBe(false)
  })

  test('comodato devuelto → false', () => {
    const futuro = new Date()
    futuro.setDate(futuro.getDate() + 7)
    const comodato = { estado: 'devuelto', fecha_vencimiento: futuro.toISOString().split('T')[0] }
    expect(puedeRenovarse(comodato)).toBe(false)
  })

  test('comodato sin fecha_vencimiento → false', () => {
    expect(puedeRenovarse({ estado: 'activo' })).toBe(false)
  })
})

describe('renovar', () => {
  test('retorna payload con renovado_de_id = comodatoViejo.id', () => {
    const futuro = new Date()
    futuro.setDate(futuro.getDate() + 7)
    const payload = renovar({
      id: 'c-1',
      activo_id: 'act-1',
      alumno_id: 'al-1',
      estado: 'activo',
      tipo_comodato: 'escolar',
      fecha_vencimiento: futuro.toISOString().split('T')[0],
    })
    expect(payload.renovado_de_id).toBe('c-1')
    expect(payload.activo_id).toBe('act-1')
    expect(payload.estado).toBe('activo')
  })

  test('lanza error si no puede renovarse', () => {
    expect(() => renovar({ id: 'c-1', estado: 'devuelto' })).toThrow()
  })
})

describe('PALETA_VENCIMIENTO', () => {
  test('días > 30 retorna verde', () => {
    expect(PALETA_VENCIMIENTO(45)).toMatch(/bg-success/)
  })

  test('días entre 7 y 30 retorna amarillo', () => {
    expect(PALETA_VENCIMIENTO(15)).toMatch(/bg-warning/)
  })

  test('días < 7 retorna rojo', () => {
    expect(PALETA_VENCIMIENTO(3)).toMatch(/bg-danger/)
  })

  test('null o undefined retorna secondary', () => {
    expect(PALETA_VENCIMIENTO(null)).toMatch(/bg-secondary/)
    expect(PALETA_VENCIMIENTO(undefined)).toMatch(/bg-secondary/)
  })
})

describe('estadoVencimiento', () => {
  test('activo con vencimiento lejano retorna verde', () => {
    const futuro = new Date()
    futuro.setDate(futuro.getDate() + 45)
    const estado = estadoVencimiento({ fecha_vencimiento: futuro.toISOString().split('T')[0] })
    expect(estado.clase).toMatch(/bg-success/)
  })

  test('vencido retorna rojo', () => {
    const ayer = new Date()
    ayer.setDate(ayer.getDate() - 3)
    const estado = estadoVencimiento({ fecha_vencimiento: ayer.toISOString().split('T')[0] })
    expect(estado.clase).toMatch(/bg-danger/)
    expect(estado.label).toMatch(/Vencido/)
  })
})
