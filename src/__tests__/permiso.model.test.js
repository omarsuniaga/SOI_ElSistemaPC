import { describe, it, expect } from 'vitest'
import { Permiso } from '../modules/permisos/models/permiso.model.js'

describe('Permiso Model', () => {
  describe('constructor', () => {
    it('should create instance with default values', () => {
      const p = new Permiso()
      expect(p.id).toBeNull()
      expect(p.maestro_id).toBe('')
      expect(p.puede_registrar_alumnos).toBe(false)
      expect(p.puede_inscribir_clases).toBe(false)
      expect(p.permisos).toEqual([])
      expect(p.solicitudes).toEqual([])
      expect(p.concedido_por).toBeNull()
      expect(p.creado_en).toBeNull()
      expect(p.actualizado_en).toBeNull()
    })

    it('should create instance with provided data', () => {
      const data = {
        id: 'perm-001',
        maestro_id: 'maestro_001',
        maestro_nombre: 'Carlos Méndez',
        puede_registrar_alumnos: true,
        puede_inscribir_clases: false,
        permisos: ['alumnos:create', 'clases:enroll'],
        solicitudes: ['asistencias:write'],
        concedido_por: 'admin_001',
        creado_en: '2026-01-15T10:00:00Z',
        actualizado_en: '2026-05-01T14:30:00Z',
      }
      const p = new Permiso(data)
      expect(p.id).toBe('perm-001')
      expect(p.maestro_id).toBe('maestro_001')
      expect(p.maestro_nombre).toBe('Carlos Méndez')
      expect(p.puede_registrar_alumnos).toBe(true)
      expect(p.puede_inscribir_clases).toBe(false)
      expect(p.permisos).toEqual(['alumnos:create', 'clases:enroll'])
      expect(p.solicitudes).toEqual(['asistencias:write'])
      expect(p.concedido_por).toBe('admin_001')
      expect(p.creado_en).toBe('2026-01-15T10:00:00Z')
    })

    it('should handle undefined values as defaults', () => {
      const p = new Permiso({ maestro_id: 'm1' })
      expect(p.maestro_id).toBe('m1')
      expect(p.puede_registrar_alumnos).toBe(false)
      expect(p.puede_inscribir_clases).toBe(false)
    })
  })

  describe('validate()', () => {
    it('should return empty array for valid permiso', () => {
      const p = new Permiso({
        maestro_id: 'maestro_001',
        puede_registrar_alumnos: true,
        puede_inscribir_clases: false,
      })
      const errors = p.validate()
      expect(errors).toEqual([])
    })

    it('should return error when maestro_id is missing', () => {
      const p = new Permiso({})
      const errors = p.validate()
      expect(errors).toContain('El ID del maestro es obligatorio')
    })

    it('should return error when maestro_id is empty string', () => {
      const p = new Permiso({ maestro_id: '  ' })
      const errors = p.validate()
      expect(errors).toContain('El ID del maestro es obligatorio')
    })

    it('should return error when puede_registrar_alumnos is not boolean', () => {
      const p = new Permiso({
        maestro_id: 'm1',
        puede_registrar_alumnos: 'yes',
        puede_inscribir_clases: false,
      })
      const errors = p.validate()
      expect(errors).toContain('puede_registrar_alumnos debe ser un valor booleano')
    })

    it('should return error when puede_inscribir_clases is not boolean', () => {
      const p = new Permiso({
        maestro_id: 'm1',
        puede_registrar_alumnos: false,
        puede_inscribir_clases: 1,
      })
      const errors = p.validate()
      expect(errors).toContain('puede_inscribir_clases debe ser un valor booleano')
    })

    it('should return multiple errors for invalid data', () => {
      const p = new Permiso({
        maestro_id: '',
        puede_registrar_alumnos: 'true',
        puede_inscribir_clases: 'false',
      })
      const errors = p.validate()
      expect(errors.length).toBeGreaterThanOrEqual(3)
      expect(errors).toContain('El ID del maestro es obligatorio')
      expect(errors).toContain('puede_registrar_alumnos debe ser un valor booleano')
      expect(errors).toContain('puede_inscribir_clases debe ser un valor booleano')
    })
  })

  describe('toJSON()', () => {
    it('should return a clean object without undefined values', () => {
      const p = new Permiso({
        id: 'perm-001',
        maestro_id: 'maestro_001',
        maestro_nombre: 'Carlos Méndez',
        maestro_email: 'carlos@ejemplo.com',
        puede_registrar_alumnos: true,
        puede_inscribir_clases: false,
      })
      const json = p.toJSON()
      expect(json).toEqual({
        id: 'perm-001',
        maestro_id: 'maestro_001',
        maestro_nombre: 'Carlos Méndez',
        maestro_email: 'carlos@ejemplo.com',
        puede_registrar_alumnos: true,
        puede_inscribir_clases: false,
        permisos: [],
        solicitudes: [],
        concedido_por: null,
        concedido_por_nombre: null,
        creado_en: null,
        actualizado_en: null,
      })
      // Ensure no undefined values
      Object.values(json).forEach(val => {
        expect(val).not.toBeUndefined()
      })
    })

    it('should default boolean flags to false', () => {
      const p = new Permiso({ maestro_id: 'm1' })
      const json = p.toJSON()
      expect(json.puede_registrar_alumnos).toBe(false)
      expect(json.puede_inscribir_clases).toBe(false)
    })
  })
})
