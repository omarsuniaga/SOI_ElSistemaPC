import { describe, it, expect } from 'vitest'
import { Clase } from './clase.model.js'

describe('Clase Model', () => {
  describe('constructor', () => {
    it('should create instance with default values', () => {
      const clase = new Clase()
      
      expect(clase.id).toBeNull()
      expect(clase.nombre).toBe('')
      expect(clase.maestro_id).toBeNull()
      expect(clase.maestro_auxiliar_id).toBeNull()
      expect(clase.instrumento).toBe('')
      expect(clase.horarios).toEqual([])
      expect(clase.max_alumnos).toBe(20)
      expect(clase.estado).toBe('activa')
      expect(clase.notas_pedagogicas).toBe('')
    })

    it('should create instance with provided data', () => {
      const data = {
        id: '123',
        nombre: 'Violín Básico',
        maestro_id: 'maestro-1',
        maestro_auxiliar_id: 'maestro-2',
        instrumento: 'violin',
        horarios: [
          { dia: 'lunes', hora_inicio: '08:00', hora_fin: '09:00', salon_id: 'salon-1' }
        ],
        max_alumnos: 15,
        estado: 'activa',
      }
      
      const clase = new Clase(data)
      
      expect(clase.id).toBe('123')
      expect(clase.nombre).toBe('Violín Básico')
      expect(clase.maestro_id).toBe('maestro-1')
      expect(clase.maestro_auxiliar_id).toBe('maestro-2')
      expect(clase.instrumento).toBe('violin')
      expect(clase.horarios).toHaveLength(1)
      expect(clase.max_alumnos).toBe(15)
    })
  })

  describe('validate()', () => {
    it('should return error when nombre is empty', () => {
      const clase = new Clase({ nombre: '', maestro_id: '1', instrumento: 'violin' })
      const errores = clase.validate()
      
      expect(errores).toContain('El nombre es obligatorio')
    })

    it('should return error when nombre is too short', () => {
      const clase = new Clase({ nombre: 'ab', maestro_id: '1', instrumento: 'violin' })
      const errores = clase.validate()
      
      expect(errores).toContain('El nombre debe tener mínimo 3 caracteres')
    })

    it('should return error when nombre is too long', () => {
      const clase = new Clase({ 
        nombre: 'a'.repeat(101), 
        maestro_id: '1', 
        instrumento: 'violin' 
      })
      const errores = clase.validate()
      
      expect(errores).toContain('El nombre no puede exceder 100 caracteres')
    })

    it('should return error when maestro_id is missing', () => {
      const clase = new Clase({ nombre: 'Test', maestro_id: null, instrumento: 'violin' })
      const errores = clase.validate()
      
      expect(errores).toContain('El maestro titular es obligatorio')
    })

    it('should return error when instrumento is missing', () => {
      const clase = new Clase({ nombre: 'Test', maestro_id: '1', instrumento: '' })
      const errores = clase.validate()
      
      expect(errores).toContain('El instrumento es obligatorio')
    })

    it('should return error when no schedules (horarios)', () => {
      const clase = new Clase({ 
        nombre: 'Test', 
        maestro_id: '1', 
        instrumento: 'violin',
        horarios: []
      })
      const errores = clase.validate()
      
      expect(errores).toContain('Debe agregar al menos un horario')
    })

    it('should return error when horario has no dia', () => {
      const clase = new Clase({ 
        nombre: 'Test', 
        maestro_id: '1', 
        instrumento: 'violin',
        horarios: [{ dia: '', hora_inicio: '08:00', hora_fin: '09:00' }]
      })
      const errores = clase.validate()
      
      expect(errores).toContain('El día es obligatorio en todos los horarios')
    })

    it('should return error when horario has no hora_inicio', () => {
      const clase = new Clase({ 
        nombre: 'Test', 
        maestro_id: '1', 
        instrumento: 'violin',
        horarios: [{ dia: 'lunes', hora_inicio: '', hora_fin: '09:00' }]
      })
      const errores = clase.validate()
      
      expect(errores).toContain('La hora de inicio y fin son obligatorias en todos los horarios')
    })

    it('should return error when hora_inicio >= hora_fin', () => {
      const clase = new Clase({ 
        nombre: 'Test', 
        maestro_id: '1', 
        instrumento: 'violin',
        horarios: [{ dia: 'lunes', hora_inicio: '10:00', hora_fin: '09:00' }]
      })
      const errores = clase.validate()
      
      expect(errores).toContain('La hora de inicio debe ser menor que la hora de fin')
    })

    it('should return error when max_alumnos < 1 and has schedules', () => {
      const clase = new Clase({ 
        nombre: 'Test', 
        maestro_id: '1', 
        instrumento: 'violin',
        horarios: [{ dia: 'lunes', hora_inicio: '08:00', hora_fin: '09:00' }],
        max_alumnos: 0
      })
      const errores = clase.validate()
      
      expect(errores).toContain('El máximo de alumnos debe ser al menos 1')
    })

    it('should return error when max_alumnos > 100', () => {
      const clase = new Clase({ 
        nombre: 'Test', 
        maestro_id: '1', 
        instrumento: 'violin',
        max_alumnos: 101
      })
      const errores = clase.validate()
      
      expect(errores).toContain('El máximo de alumnos no puede exceder 100')
    })

    it('should return error when notas exceed 1000 chars', () => {
      const clase = new Clase({ 
        nombre: 'Test', 
        maestro_id: '1', 
        instrumento: 'violin',
        notas_pedagogicas: 'a'.repeat(1001)
      })
      const errores = clase.validate()
      
      expect(errores).toContain('Las notas pedagógicas no pueden exceder 1000 caracteres')
    })

    it('should return empty array when data is valid', () => {
      const clase = new Clase({ 
        nombre: 'Test Clase',
        maestro_id: '1',
        instrumento: 'violin',
        horarios: [
          { dia: 'lunes', hora_inicio: '08:00', hora_fin: '09:00' },
          { dia: 'miercoles', hora_inicio: '10:00', hora_fin: '11:00' }
        ],
        max_alumnos: 20
      })
      const errores = clase.validate()
      
      expect(errores).toEqual([])
    })
  })

  describe('isCompleto()', () => {
    it('should return false when incomplete', () => {
      const clase = new Clase({ nombre: 'Test', maestro_id: '1' })
      expect(clase.isCompleto()).toBe(false)
    })

    it('should return true when complete', () => {
      const clase = new Clase({ 
        nombre: 'Test', 
        maestro_id: '1', 
        instrumento: 'violin',
        horarios: [{ dia: 'lunes', hora_inicio: '08:00', hora_fin: '09:00' }]
      })
      expect(clase.isCompleto()).toBe(true)
    })
  })

  describe('toJSON()', () => {
    it('should return clean JSON object', () => {
      const clase = new Clase({
        id: '123',
        nombre: '  Test Clase  ',
        maestro_id: 'maestro-1',
        maestro_auxiliar_id: 'maestro-2',
        instrumento: '  violin  ',
        max_alumnos: 15,
        estado: 'activa',
        notas_pedagogicas: '  Some notes  ',
        horarios: []
      })
      
      const json = clase.toJSON()
      
      expect(json).toEqual({
        id: '123',
        nombre: 'Test Clase',
        maestro_id: 'maestro-1',
        maestro_auxiliar_id: 'maestro-2',
        instrumento: 'violin',
        max_alumnos: 15,
        estado: 'activa',
        notas_pedagogicas: 'Some notes',
        planificacion_id: null,
      })
    })
  })

  describe('static getEstados()', () => {
    it('should return all estados', () => {
      expect(Clase.getEstados()).toEqual(['activa', 'suspendida', 'finalizada'])
    })
  })

  describe('static getDiasSemana()', () => {
    it('should return all days', () => {
      expect(Clase.getDiasSemana()).toEqual([
        'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'
      ])
    })
  })

  describe('static getEstadoLabel()', () => {
    it('should return correct labels', () => {
      expect(Clase.getEstadoLabel('activa')).toBe('Activa')
      expect(Clase.getEstadoLabel('suspendida')).toBe('Suspendida')
      expect(Clase.getEstadoLabel('finalizada')).toBe('Finalizada')
    })

    it('should return same value for unknown estado', () => {
      expect(Clase.getEstadoLabel('desconocido')).toBe('desconocido')
    })
  })
})