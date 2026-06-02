import { describe, it, expect } from 'vitest'
import { Clase } from './clase.model.js'

describe('Clase Model', () => {
  describe('constructor', () => {
    it('should create instance with default values', () => {
      const clase = new Clase()

      expect(clase.id).toBeNull()
      expect(clase.nombre).toBe('')
      expect(clase.maestro_id).toBeNull()
      expect(clase.programa_id).toBeNull()
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
        programa_id: 'prog-1',
        maestro_auxiliar_id: 'maestro-2',
        instrumento: 'violin',
        horarios: [{ dia: 'lunes', hora_inicio: '08:00', hora_fin: '09:00', salon_id: 'salon-1' }],
        max_alumnos: 15,
        estado: 'activa',
      }

      const clase = new Clase(data)

      expect(clase.id).toBe('123')
      expect(clase.nombre).toBe('Violín Básico')
      expect(clase.maestro_id).toBe('maestro-1')
      expect(clase.programa_id).toBe('prog-1')
      expect(clase.maestro_auxiliar_id).toBe('maestro-2')
      expect(clase.instrumento).toBe('violin')
      expect(clase.horarios).toHaveLength(1)
      expect(clase.max_alumnos).toBe(15)
    })
  })

  describe('validate()', () => {
    it('should return error when nombre is empty', () => {
      const clase = new Clase({
        nombre: '',
        maestro_id: '1',
        programa_id: '1',
        instrumento: 'violin',
      })
      const errores = clase.validate()
      expect(errores).toContain('El nombre es obligatorio')
    })

    it('should return error when maestro_id is missing', () => {
      const clase = new Clase({
        nombre: 'Test',
        maestro_id: null,
        programa_id: '1',
        instrumento: 'violin',
      })
      const errores = clase.validate()
      expect(errores).toContain('El maestro titular es obligatorio')
    })

    it('should return error when programa_id is missing', () => {
      const clase = new Clase({
        nombre: 'Test',
        maestro_id: '1',
        programa_id: null,
        instrumento: 'violin',
      })
      const errores = clase.validate()
      expect(errores).toContain('El programa es obligatorio')
    })

    it('should return error when no schedules (horarios)', () => {
      const clase = new Clase({
        nombre: 'Test',
        maestro_id: '1',
        programa_id: '1',
        instrumento: 'violin',
        horarios: [],
      })
      const errores = clase.validate()
      expect(errores).toContain('Debe agregar al menos un horario')
    })

    describe('Multi-schedule internal overlap', () => {
      it('should return error if two slots overlap on the same day', () => {
        const clase = new Clase({
          nombre: 'Test Overlap',
          maestro_id: '1',
          programa_id: '1',
          instrumento: 'piano',
          horarios: [
            { dia: 'lunes', hora_inicio: '08:00', hora_fin: '10:00', salon_id: 's1' },
            { dia: 'lunes', hora_inicio: '09:00', hora_fin: '11:00', salon_id: 's1' },
          ],
        })
        const errores = clase.validate()
        expect(errores).toContain('Existen horarios solapados en la misma clase (Lunes)')
      })

      it('should allow multiple slots on the same day if they dont overlap', () => {
        const clase = new Clase({
          nombre: 'Test No Overlap',
          maestro_id: '1',
          programa_id: '1',
          instrumento: 'piano',
          horarios: [
            { dia: 'lunes', hora_inicio: '08:00', hora_fin: '09:00', salon_id: 's1' },
            { dia: 'lunes', hora_inicio: '10:00', hora_fin: '11:00', salon_id: 's1' },
          ],
        })
        const errores = clase.validate()
        const overlapError = errores.find((e) => e.includes('solapados'))
        expect(overlapError).toBeUndefined()
      })

      it('should allow multiple slots on the same day if they are adjacent/consecutive', () => {
        const clase = new Clase({
          nombre: 'Test Adjacent',
          maestro_id: '1',
          programa_id: '1',
          instrumento: 'piano',
          horarios: [
            { dia: 'lunes', hora_inicio: '08:00', hora_fin: '09:00', salon_id: 's1' },
            { dia: 'lunes', hora_inicio: '09:00', hora_fin: '10:00', salon_id: 's1' },
          ],
        })
        const errores = clase.validate()
        const overlapError = errores.find((e) => e.includes('solapados'))
        expect(overlapError).toBeUndefined()
      })
    })

    it('should return error when hora_inicio >= hora_fin', () => {
      const clase = new Clase({
        nombre: 'Test',
        maestro_id: '1',
        programa_id: '1',
        instrumento: 'violin',
        horarios: [{ dia: 'lunes', hora_inicio: '10:00', hora_fin: '09:00' }],
      })
      const errores = clase.validate()
      expect(errores).toContain('La hora de inicio debe ser menor que la hora de fin')
    })
  })

  describe('toJSON()', () => {
    it('should return clean JSON object', () => {
      const clase = new Clase({
        id: '123',
        nombre: '  Test Clase  ',
        maestro_id: 'maestro-1',
        programa_id: 'prog-1',
        maestro_auxiliar_id: 'maestro-2',
        instrumento: '  violin  ',
        max_alumnos: 15,
        estado: 'activa',
        notas_pedagogicas: '  Some notes  ',
        horarios: [],
      })

      const json = clase.toJSON()

      expect(json).toEqual({
        id: '123',
        nombre: 'Test Clase',
        maestro_principal_id: 'maestro-1',
        maestro_suplente_id: 'maestro-2',
        programa_id: 'prog-1',
        instrumento: 'violin',
        capacidad_maxima: 15,
        estado: 'activa',
        descripcion: 'Some notes',
        tipo_clase: 'grupal',
        ruta_id: null,
      })
    })
  })
})
