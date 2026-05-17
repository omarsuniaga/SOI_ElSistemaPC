import { describe, it, expect } from 'vitest'
import { Observacion } from '../models/observacion.model.js'

describe('Observacion Model', () => {
  describe('constructor', () => {
    it('should create instance with default values', () => {
      const o = new Observacion()
      expect(o.id).toBeNull()
      expect(o.tipo).toBe('comportamiento')
      expect(o.estado).toBe('abierta')
    })
  })

  describe('validate()', () => {
    it('should return error if title is too short', () => {
      const o = new Observacion({ titulo: 'Abc', alumno_id: 'a1', descripcion: 'D'.repeat(25) })
      const err = o.validate()
      expect(err).toContain('El título debe tener mínimo 5 caracteres')
    })

    it('should return error if description is too short', () => {
      const o = new Observacion({ titulo: 'Titulo Largo', alumno_id: 'a1', descripcion: 'Corta' })
      const err = o.validate()
      expect(err).toContain('La descripción debe tener mínimo 20 caracteres')
    })

    it('should return error for missing student', () => {
      const o = new Observacion({ titulo: 'Titulo Largo', descripcion: 'D'.repeat(25) })
      const err = o.validate()
      expect(err).toContain('El alumno es obligatorio')
    })

    it('should pass with valid data', () => {
      const o = new Observacion({ 
        titulo: 'Buen desempeño', 
        alumno_id: 'a1', 
        descripcion: 'El alumno ha mostrado una mejora significativa en clase.' 
      })
      const err = o.validate()
      expect(err.length).toBe(0)
    })
  })

  describe('toJSON()', () => {
    it('should return clean object for DB', () => {
      const o = new Observacion({
        titulo: 'Test',
        descripcion: 'D'.repeat(25),
        prioridad: 'alta'
      })
      const json = o.toJSON()
      expect(json.prioridad).toBe('alta')
      expect(json).not.toHaveProperty('created_at')
    })
  })
})
