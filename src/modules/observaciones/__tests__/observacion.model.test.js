import { describe, it, expect } from 'vitest'
import { Observacion } from '../models/observacion.model.js'

describe('Observacion Model', () => {
  describe('constructor', () => {
    it('default tipo should be academica (not comportamiento)', () => {
      const o = new Observacion()
      expect(o.tipo).toBe('academica')
    })

    it('default estado should be abierta', () => {
      const o = new Observacion()
      expect(o.estado).toBe('abierta')
    })

    it('should accept each of the 7 canonical tipos', () => {
      const canonical = ['academica', 'conductual', 'asistencia', 'tecnica', 'motivacional', 'administrativa', 'otra']
      canonical.forEach(tipo => {
        const o = new Observacion({ tipo })
        expect(o.tipo).toBe(tipo)
      })
    })

    it('should normalize legacy "comportamiento" → conductual via constructor', () => {
      const o = new Observacion({ tipo: 'comportamiento' })
      expect(o.tipo).toBe('conductual')
    })

    it('should normalize legacy "academico" → academica via constructor', () => {
      const o = new Observacion({ tipo: 'academico' })
      expect(o.tipo).toBe('academica')
    })

    it('should normalize legacy "social" → otra via constructor', () => {
      const o = new Observacion({ tipo: 'social' })
      expect(o.tipo).toBe('otra')
    })

    it('should normalize legacy "disciplina" → conductual via constructor', () => {
      const o = new Observacion({ tipo: 'disciplina' })
      expect(o.tipo).toBe('conductual')
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

    it('should pass with valid canonical tipo', () => {
      const o = new Observacion({
        titulo: 'Buen desempeño',
        alumno_id: 'a1',
        descripcion: 'El alumno ha mostrado una mejora significativa en clase.',
        tipo: 'academica',
      })
      const err = o.validate()
      expect(err.length).toBe(0)
    })

    it('should fail validate() when tipo is unknown after normalization', () => {
      const o = new Observacion({
        titulo: 'Titulo largo',
        alumno_id: 'a1',
        descripcion: 'D'.repeat(25),
        tipo: 'foobar',
      })
      // foobar cannot be normalized; tipo stays 'foobar'; validate() must reject it
      const err = o.validate()
      expect(err.some(e => e.includes('tipo'))).toBe(true)
    })
  })

  describe('static getTipos()', () => {
    it('should return 7 tipos matching the canonical set', () => {
      const tipos = Observacion.getTipos()
      expect(tipos).toHaveLength(7)
      const canonical = ['academica', 'conductual', 'asistencia', 'tecnica', 'motivacional', 'administrativa', 'otra']
      canonical.forEach(t => expect(tipos.map(x => x.value)).toContain(t))
    })
  })

  describe('toJSON()', () => {
    it('should return clean object for DB', () => {
      const o = new Observacion({
        titulo: 'Test',
        descripcion: 'D'.repeat(25),
        prioridad: 'alta',
      })
      const json = o.toJSON()
      expect(json.prioridad).toBe('alta')
      expect(json).not.toHaveProperty('created_at')
    })
  })
})
