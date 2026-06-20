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

  describe('validate()', () => {
    it('should return error when calificacion is > 5', () => {
      const p = new Progreso({ 
        alumno_id: 'a1', 
        clase_id: 'c1', 
        tipo_evaluacion: 'final', 
        calificacion: 5.1 
      })
      const errores = p.validate()
      expect(errores).toContain('La calificación debe estar entre 0.0 y 5.0')
    })

    it('should return error when calificacion is < 0', () => {
      const p = new Progreso({ 
        alumno_id: 'a1', 
        clase_id: 'c1', 
        tipo_evaluacion: 'final', 
        calificacion: -0.1 
      })
      const errores = p.validate()
      expect(errores).toContain('La calificación debe estar entre 0.0 y 5.0')
    })

    it('should return error for missing required fields', () => {
      const p = new Progreso()
      const errores = p.validate()
      expect(errores).toContain('El alumno es obligatorio')
      expect(errores).toContain('La clase es obligatoria')
      expect(errores).toContain('El tipo de evaluación es obligatorio')
    })
  })

  describe('toJSON()', () => {
    it('should return clean object for DB', () => {
      const p = new Progreso({
        alumno_id: 'a1',
        clase_id: 'c1',
        tipo_evaluacion: 'continua',
        calificacion: 4,
        observaciones: '  Muy bien  '
      })
      const json = p.toJSON()
      expect(json.tipo_evaluacion).toBe('continua')
      expect(json.calificacion).toBe(4)
      expect(json.observaciones).toBe('Muy bien')
    })
  })
})
