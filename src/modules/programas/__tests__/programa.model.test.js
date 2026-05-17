import { describe, it, expect } from 'vitest'
import { Programa } from '../models/programa.model.js'

describe('Programa Model', () => {
  const validLevels = ['1', '2', '3', 'inicial', 'intermedio', 'avanzado']

  describe('constructor', () => {
    it('should create instance with default values', () => {
      const p = new Programa()
      expect(p.id).toBeNull()
      expect(p.nombre).toBe('')
      expect(p.activo).toBe(true)
    })

    it('should create instance with provided data', () => {
      const data = {
        id: 'prog-123',
        nombre: 'Cuerdas Sinfónicas',
        nivel: 'avanzado',
        activo: false
      }
      const p = new Programa(data)
      expect(p.id).toBe('prog-123')
      expect(p.nombre).toBe('Cuerdas Sinfónicas')
      expect(p.nivel).toBe('avanzado')
      expect(p.activo).toBe(false)
    })
  })

  describe('validate', () => {
    it('should return error if name is empty', () => {
      const p = new Programa({ nivel: 'inicial' })
      const errors = p.validate(validLevels)
      expect(errors).toContain('El nombre del programa es obligatorio')
    })

    it('should return error if name is too long', () => {
      const p = new Programa({ nombre: 'A'.repeat(101), nivel: 'inicial' })
      const errors = p.validate(validLevels)
      expect(errors).toContain('El nombre no puede exceder los 100 caracteres')
    })

    it('should return error if level is missing', () => {
      const p = new Programa({ nombre: 'Test' })
      const errors = p.validate(validLevels)
      expect(errors).toContain('El nivel es obligatorio')
    })

    it('should return error if level is not in valid list', () => {
      const p = new Programa({ nombre: 'Test', nivel: 'invalid-level' })
      const errors = p.validate(validLevels)
      expect(errors).toContain('El nivel seleccionado no es válido')
    })

    it('should return error if description is too long', () => {
      const p = new Programa({ 
        nombre: 'Test', 
        nivel: 'inicial', 
        descripcion: 'D'.repeat(501) 
      })
      const errors = p.validate(validLevels)
      expect(errors).toContain('La descripción no puede exceder los 500 caracteres')
    })

    it('should return error if duration is negative', () => {
      const p = new Programa({ 
        nombre: 'Test', 
        nivel: 'inicial', 
        duracion_anios: -1 
      })
      const errors = p.validate(validLevels)
      expect(errors).toContain('La duración debe ser un número positivo')
    })

    it('should return no errors for valid data', () => {
      const p = new Programa({ 
        nombre: 'Teoría Musical', 
        nivel: '1',
        duracion_anios: 2
      })
      const errors = p.validate(validLevels)
      expect(errors.length).toBe(0)
    })
  })

  describe('toJSON', () => {
    it('should return a clean object for API', () => {
      const p = new Programa({
        nombre: '  Piano Complementario  ',
        nivel: 'intermedio',
        duracion_anios: 3
      })
      const json = p.toJSON()
      expect(json.nombre).toBe('Piano Complementario')
      expect(json.nivel).toBe('intermedio')
      expect(json.duracion_anios).toBe(3)
      expect(json).not.toHaveProperty('id')
      expect(json).not.toHaveProperty('created_at')
    })
  })
})
