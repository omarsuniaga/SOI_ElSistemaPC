import { describe, it, expect } from 'vitest'
import { Progreso } from '../models/progreso.model.js'

describe('Progreso Model', () => {
  describe('normalization', () => {
    it('should normalize legacy "evaluacion_tipo" to "tipo_evaluacion"', () => {
      const p = new Progreso({ evaluacion_tipo: 'parcial' })
      expect(p.tipo_evaluacion).toBe('parcial')
    })

    it('should convert grade to float', () => {
      const p = new Progreso({ calificacion: '4.5' })
      expect(p.calificacion).toBe(4.5)
    })
  })

  describe('validate() — calificacion range 0–10', () => {
    it('should accept calificacion = 0 (boundary)', () => {
      const p = new Progreso({ alumno_id: 'a1', clase_id: 'c1', tipo_evaluacion: 'final', calificacion: 0 })
      const errores = p.validate()
      expect(errores.some(e => e.includes('calificación'))).toBe(false)
    })

    it('should accept calificacion = 5 (regression: previously valid)', () => {
      const p = new Progreso({ alumno_id: 'a1', clase_id: 'c1', tipo_evaluacion: 'final', calificacion: 5 })
      const errores = p.validate()
      expect(errores.some(e => e.includes('calificación'))).toBe(false)
    })

    it('should accept calificacion = 10 (new upper boundary)', () => {
      const p = new Progreso({ alumno_id: 'a1', clase_id: 'c1', tipo_evaluacion: 'final', calificacion: 10 })
      const errores = p.validate()
      expect(errores.some(e => e.includes('calificación'))).toBe(false)
    })

    it('should reject calificacion = 10.1 (above max)', () => {
      const p = new Progreso({ alumno_id: 'a1', clase_id: 'c1', tipo_evaluacion: 'final', calificacion: 10.1 })
      const errores = p.validate()
      expect(errores.some(e => e.includes('calificación') && e.includes('0') && e.includes('10'))).toBe(true)
    })

    it('should reject calificacion = -0.1 (below min)', () => {
      const p = new Progreso({ alumno_id: 'a1', clase_id: 'c1', tipo_evaluacion: 'final', calificacion: -0.1 })
      const errores = p.validate()
      expect(errores.some(e => e.includes('calificación') && e.includes('0') && e.includes('10'))).toBe(true)
    })

    it('error message should mention "0 y 10"', () => {
      const p = new Progreso({ alumno_id: 'a1', clase_id: 'c1', tipo_evaluacion: 'final', calificacion: 11 })
      const errores = p.validate()
      expect(errores.some(e => /0 y 10/.test(e))).toBe(true)
    })
  })

  describe('validate() — existing required fields', () => {
    it('should return error for missing required fields', () => {
      const p = new Progreso()
      const errores = p.validate()
      expect(errores).toContain('El alumno es obligatorio')
      expect(errores).toContain('La clase es obligatoria')
      expect(errores).toContain('El tipo de evaluación es obligatorio')
    })
  })

  describe('toJSON() — correct DB column names', () => {
    it('should emit evaluacion_tipo (not tipo_evaluacion)', () => {
      const p = new Progreso({
        alumno_id: 'a1',
        clase_id: 'c1',
        tipo_evaluacion: 'continua',
        calificacion: 4,
        estado: 'en_progreso',
      })
      const json = p.toJSON()
      expect(json).toHaveProperty('evaluacion_tipo', 'continua')
      expect(json).not.toHaveProperty('tipo_evaluacion')
    })

    it('should emit estado_cualitativo (not estado)', () => {
      const p = new Progreso({
        alumno_id: 'a1',
        clase_id: 'c1',
        tipo_evaluacion: 'continua',
        estado: 'completado',
      })
      const json = p.toJSON()
      expect(json).toHaveProperty('estado_cualitativo', 'completado')
      expect(json).not.toHaveProperty('estado')
    })

    it('should trim observaciones', () => {
      const p = new Progreso({
        alumno_id: 'a1',
        clase_id: 'c1',
        tipo_evaluacion: 'continua',
        calificacion: 4,
        observaciones: '  Muy bien  ',
      })
      const json = p.toJSON()
      expect(json.observaciones).toBe('Muy bien')
    })
  })
})
