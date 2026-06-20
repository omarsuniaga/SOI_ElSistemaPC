import { describe, it, expect } from 'vitest'
import { Alumno } from '../models/alumno.model.js'

describe('Alumno model', () => {
  it('uses nombre not name', () => {
    const a = new Alumno({ name: 'Juan', nombre: 'Pedro' })
    expect(a.nombre).toBe('Pedro')
    expect(a.name).toBeUndefined()
  })

  it('uses is_active not es_activo', () => {
    const a = new Alumno({ es_activo: false, is_active: true })
    expect(a.is_active).toBe(true)
    expect(a.es_activo).toBeUndefined()
  })

  it('does not have section field', () => {
    const a = new Alumno({ section: 'Violín' })
    expect(a.section).toBeUndefined()
  })

  it('does not have ensemble_id field', () => {
    const a = new Alumno({ ensemble_id: 'abc' })
    expect(a.ensemble_id).toBeUndefined()
  })

  it('does not have acudiente field', () => {
    const a = new Alumno({ acudiente: 'María' })
    expect(a.acudiente).toBeUndefined()
  })

  it('validate checks nombre not name', () => {
    const a = new Alumno({ nombre: 'Juan Pérez' })
    const errors = a.validate()
    expect(errors).not.toContain('El nombre es obligatorio')
  })

  it('toJSON excludes deprecated fields', () => {
    const a = new Alumno({ nombre: 'Ana' })
    const json = a.toJSON()
    expect(json.nombre).toBe('Ana')
    expect(json.section).toBeUndefined()
    expect(json.ensemble_id).toBeUndefined()
    expect(json.acudiente).toBeUndefined()
    expect(json.es_activo).toBeUndefined()
  })
})
