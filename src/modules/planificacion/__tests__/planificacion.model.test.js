import { describe, it, expect } from 'vitest'
import { Planificacion } from '../models/planificacion.model.js'

describe('Planificacion Model', () => {
  describe('constructor', () => {
    it('should create instance with default values', () => {
      const p = new Planificacion()
      expect(p.id).toBeNull()
      expect(p.estado).toBe('planificado')
      expect(p.recursos).toEqual([])
    })
  })

  describe('validate()', () => {
    it('should return error when tema is empty', () => {
      const p = new Planificacion({ tema: '', clase_id: 'c1' })
      const errores = p.validate()
      expect(errores).toContain('El tema es obligatorio')
    })

    it('should return error when tema is too short', () => {
      const p = new Planificacion({ tema: 'Ab', clase_id: 'c1' })
      const errores = p.validate()
      expect(errores).toContain('El tema debe tener mínimo 3 caracteres')
    })

    it('should return error when clase_id is missing', () => {
      const p = new Planificacion({ tema: 'Tema de prueba', clase_id: null })
      const errores = p.validate()
      expect(errores).toContain('La clase es obligatoria')
    })

    it('should return error for invalid status transition (not implemented yet, placeholder)', () => {
      // Logic for state machine will be added in Phase 1 GREEN
      const p = new Planificacion({ tema: 'Valid', clase_id: 'c1', estado: 'invalid' })
      const errores = p.validate()
      expect(errores).toContain('El estado no es válido')
    })
  })

  describe('State Logic', () => {
    it('should identify editable states', () => {
      const p1 = new Planificacion({ estado: 'planificado' })
      expect(p1.canEdit()).toBe(true)

      const p2 = new Planificacion({ estado: 'revisado' })
      expect(p2.canEdit()).toBe(false)
    })
  })

  describe('toJSON()', () => {
    it('should include notas_dsl in serialized output', () => {
      const p = new Planificacion({
        tema: 'Clase de prueba',
        clase_id: 'clase_001',
        notas_dsl: '# DSL content\nalumno:"Juan Pérez" asiste',
      })
      const json = p.toJSON()
      expect(json.notas_dsl).toBe('# DSL content\nalumno:"Juan Pérez" asiste')
    })

    it('should default notas_dsl to null when empty', () => {
      const p = new Planificacion({
        tema: 'Clase de prueba',
        clase_id: 'clase_001',
        notas_dsl: '',
      })
      const json = p.toJSON()
      expect(json.notas_dsl).toBeNull()
    })
  })
})
