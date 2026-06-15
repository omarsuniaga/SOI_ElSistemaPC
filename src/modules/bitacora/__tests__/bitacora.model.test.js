import { describe, it, expect } from 'vitest'
import { BitacoraRegistro } from '../models/bitacora.model.js'

describe('BitacoraRegistro.calcularSemaforo', () => {
  it('should return "verde" when bien_count >= 70% of total', () => {
    const result = BitacoraRegistro.calcularSemaforo({
      bien_count: 7,
      regular_count: 2,
      mal_count: 1,
      total_registros: 10,
    })
    expect(result).toBe('verde')
  })

  it('should return "verde" at exactly 70% threshold', () => {
    const result = BitacoraRegistro.calcularSemaforo({
      bien_count: 7,
      regular_count: 3,
      mal_count: 0,
      total_registros: 10,
    })
    expect(result).toBe('verde')
  })

  it('should return "naranja" when mixed — does not meet verde or rojo thresholds', () => {
    const result = BitacoraRegistro.calcularSemaforo({
      bien_count: 5,
      regular_count: 3,
      mal_count: 2,
      total_registros: 10,
    })
    expect(result).toBe('naranja')
  })

  it('should return "rojo" when mal_count > 50% of total', () => {
    const result = BitacoraRegistro.calcularSemaforo({
      bien_count: 2,
      regular_count: 1,
      mal_count: 6,
      total_registros: 9,
    })
    expect(result).toBe('rojo')
  })

  it('should return "rojo" at exactly > 50% threshold (e.g. 5 of 9)', () => {
    const result = BitacoraRegistro.calcularSemaforo({
      bien_count: 2,
      regular_count: 2,
      mal_count: 5,
      total_registros: 9,
    })
    expect(result).toBe('rojo')
  })

  it('should return "rojo" when mal_count exceeds half exactly (e.g. 6 of 10)', () => {
    const result = BitacoraRegistro.calcularSemaforo({
      bien_count: 2,
      regular_count: 2,
      mal_count: 6,
      total_registros: 10,
    })
    expect(result).toBe('rojo')
  })

  it('should NOT return rojo when mal_count equals half (e.g. 5 of 10)', () => {
    const result = BitacoraRegistro.calcularSemaforo({
      bien_count: 3,
      regular_count: 2,
      mal_count: 5,
      total_registros: 10,
    })
    expect(result).not.toBe('rojo')
  })

  it('should return "gris" when total_registros is 0', () => {
    const result = BitacoraRegistro.calcularSemaforo({
      bien_count: 0,
      regular_count: 0,
      mal_count: 0,
      total_registros: 0,
    })
    expect(result).toBe('gris')
  })
})

describe('BitacoraRegistro.validate', () => {
  it('should reject a future date', () => {
    const future = new Date()
    future.setDate(future.getDate() + 1)
    const futureStr = future.toISOString().split('T')[0]

    const registro = new BitacoraRegistro({
      claseId: 'clase_001',
      objetivoId: 'obj_001',
      fecha: futureStr,
      notas: [{ alumno_id: 'a1', nota: 'bien' }],
    })
    const errors = registro.validate()
    expect(errors).toContain('La fecha no puede ser posterior a hoy')
  })

  it('should reject empty notas array', () => {
    const registro = new BitacoraRegistro({
      claseId: 'clase_001',
      objetivoId: 'obj_001',
      fecha: '2026-06-15',
      notas: [],
    })
    const errors = registro.validate()
    expect(errors).toContain('La lista de notas no puede estar vacía')
  })

  it('should reject invalid nota value', () => {
    const registro = new BitacoraRegistro({
      claseId: 'clase_001',
      objetivoId: 'obj_001',
      fecha: '2026-06-15',
      notas: [{ alumno_id: 'a1', nota: 'excelente' }],
    })
    const errors = registro.validate()
    expect(errors.some(e => /nota no válida|excelente/i.test(e))).toBe(true)
  })

  it('should accept a valid payload with no errors', () => {
    const registro = new BitacoraRegistro({
      claseId: 'clase_001',
      objetivoId: 'obj_001',
      fecha: '2026-06-15',
      notas: [
        { alumno_id: 'a1', nota: 'bien' },
        { alumno_id: 'a2', nota: 'regular' },
        { alumno_id: 'a3', nota: 'mal' },
      ],
    })
    const errors = registro.validate()
    expect(errors.length).toBe(0)
  })
})

describe('BitacoraRegistro.toJSON', () => {
  it('should return a clean payload for adapter persistence', () => {
    const data = {
      claseId: 'clase_001',
      objetivoId: 'obj_001',
      fecha: '2026-06-15',
      notas: [
        { alumno_id: 'a1', nota: 'bien' },
        { alumno_id: 'a2', nota: 'regular' },
      ],
    }
    const registro = new BitacoraRegistro(data)
    const json = registro.toJSON()

    expect(json).not.toHaveProperty('id')
    expect(json.claseId).toBe('clase_001')
    expect(json.objetivoId).toBe('obj_001')
    expect(json.fecha).toBe('2026-06-15')
    expect(json.notas).toEqual(data.notas)
  })
})
