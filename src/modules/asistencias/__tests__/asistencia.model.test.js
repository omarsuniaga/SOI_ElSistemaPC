import { describe, it, expect } from 'vitest'
import { Asistencia } from '../models/asistencia.model.js'

describe('Asistencia Model', () => {
  describe('normalization', () => {
    it('should normalize legacy "P" to "presente"', () => {
      const a = new Asistencia({ estado: 'P' })
      expect(a.estado).toBe('presente')
    })

    it('should normalize legacy "A" to "ausente"', () => {
      const a = new Asistencia({ estado: 'A' })
      expect(a.estado).toBe('ausente')
    })

    it('should normalize legacy "J" to "justificado"', () => {
      const a = new Asistencia({ estado: 'J' })
      expect(a.estado).toBe('justificado')
    })

    it('should maintain "presente" if already correct', () => {
      const a = new Asistencia({ estado: 'presente' })
      expect(a.estado).toBe('presente')
    })

    it('should return short code for UI via getShortCode()', () => {
      const a = new Asistencia({ estado: 'presente' })
      expect(a.getShortCode()).toBe('P')
      
      const b = new Asistencia({ estado: 'ausente' })
      expect(b.getShortCode()).toBe('A')
      
      const c = new Asistencia({ estado: 'justificado' })
      expect(c.getShortCode()).toBe('J')
    })
  })

  describe('validate()', () => {
    it('should return error for invalid states', () => {
      const a = new Asistencia({ 
        clase_id: 'c1', 
        student_id: 's1', 
        fecha: '2026-01-01', 
        estado: 'invalid' 
      })
      const errors = a.validate()
      expect(errors).toContain('Estado no válido. Debe ser presente, ausente o justificado')
    })

    it('should return no errors for valid data', () => {
      const a = new Asistencia({ 
        clase_id: 'c1', 
        student_id: 's1', 
        fecha: '2026-01-01', 
        estado: 'presente' 
      })
      const errors = a.validate()
      expect(errors.length).toBe(0)
    })
  })

  describe('toJSON()', () => {
    it('should return full names for DB persistence', () => {
      const a = new Asistencia({ 
        clase_id: 'c1', 
        student_id: 's1', 
        fecha: '2026-01-01', 
        estado: 'P' 
      })
      const json = a.toJSON()
      expect(json.estado).toBe('presente')
    })
  })
})
