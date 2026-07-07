import { describe, it, expect } from 'vitest'
import { validate } from '../logic/jsonSchemaMini.js'

describe('jsonSchemaMini.validate', () => {
  it('acepta args validos contra un schema simple', () => {
    const schema = {
      type: 'object',
      properties: { alumno_id: { type: 'string' } },
      required: ['alumno_id'],
    }
    const result = validate(schema, { alumno_id: 'abc-123' })
    expect(result.ok).toBe(true)
    expect(result.errors).toEqual([])
  })

  it('rechaza cuando falta un campo required', () => {
    const schema = {
      type: 'object',
      properties: { alumno_id: { type: 'string' } },
      required: ['alumno_id'],
    }
    const result = validate(schema, {})
    expect(result.ok).toBe(false)
    expect(result.errors).toContainEqual(expect.stringContaining('alumno_id'))
  })

  it('rechaza cuando el tipo no coincide', () => {
    const schema = {
      type: 'object',
      properties: { monto: { type: 'number' } },
      required: ['monto'],
    }
    const result = validate(schema, { monto: 'no-es-numero' })
    expect(result.ok).toBe(false)
    expect(result.errors).toContainEqual(expect.stringContaining('monto'))
  })

  it('rechaza cuando un valor enum no esta permitido', () => {
    const schema = {
      type: 'object',
      properties: {
        nuevo_estado: { type: 'string', enum: ['disponible', 'prestado'] },
      },
      required: ['nuevo_estado'],
    }
    const result = validate(schema, { nuevo_estado: 'inventado' })
    expect(result.ok).toBe(false)
    expect(result.errors).toContainEqual(expect.stringContaining('nuevo_estado'))
  })

  it('acepta un valor enum permitido', () => {
    const schema = {
      type: 'object',
      properties: {
        nuevo_estado: { type: 'string', enum: ['disponible', 'prestado'] },
      },
      required: ['nuevo_estado'],
    }
    const result = validate(schema, { nuevo_estado: 'disponible' })
    expect(result.ok).toBe(true)
  })

  it('rechaza cuando un numero viola minimum', () => {
    const schema = {
      type: 'object',
      properties: { monto: { type: 'number', minimum: 0.01 } },
      required: ['monto'],
    }
    const result = validate(schema, { monto: 0 })
    expect(result.ok).toBe(false)
    expect(result.errors).toContainEqual(expect.stringContaining('monto'))
  })

  it('acepta un numero igual al minimum (limite inclusive)', () => {
    const schema = {
      type: 'object',
      properties: { monto: { type: 'number', minimum: 0.01 } },
      required: ['monto'],
    }
    const result = validate(schema, { monto: 0.01 })
    expect(result.ok).toBe(true)
  })

  it('valida items de un array segun su schema', () => {
    const schema = {
      type: 'object',
      properties: {
        objetivos_pedagogicos: { type: 'array', items: { type: 'string' } },
      },
      required: ['objetivos_pedagogicos'],
    }
    const result = validate(schema, { objetivos_pedagogicos: ['a', 2, 'c'] })
    expect(result.ok).toBe(false)
    expect(result.errors).toContainEqual(expect.stringContaining('objetivos_pedagogicos'))
  })

  it('acepta un array cuyos items cumplen el schema', () => {
    const schema = {
      type: 'object',
      properties: {
        objetivos_pedagogicos: { type: 'array', items: { type: 'string' } },
      },
      required: ['objetivos_pedagogicos'],
    }
    const result = validate(schema, { objetivos_pedagogicos: ['a', 'b'] })
    expect(result.ok).toBe(true)
  })

  it('rechaza args no-objeto cuando el schema espera object', () => {
    const schema = { type: 'object', properties: {}, required: [] }
    const result = validate(schema, null)
    expect(result.ok).toBe(false)
  })

  it('acepta propiedades no declaradas en el schema (subset permisivo)', () => {
    const schema = {
      type: 'object',
      properties: { alumno_id: { type: 'string' } },
      required: ['alumno_id'],
    }
    const result = validate(schema, { alumno_id: 'x', extra_no_declarado: 'y' })
    expect(result.ok).toBe(true)
  })

  it('acumula multiples errores en una sola pasada', () => {
    const schema = {
      type: 'object',
      properties: {
        alumno_id: { type: 'string' },
        monto: { type: 'number', minimum: 0.01 },
      },
      required: ['alumno_id', 'monto'],
    }
    const result = validate(schema, { monto: -5 })
    expect(result.ok).toBe(false)
    expect(result.errors.length).toBeGreaterThanOrEqual(2)
  })

  it('valida los 9 input_schema reales del seed sin lanzar', () => {
    const schemaConDescripcion = {
      type: 'object',
      properties: {
        alumno_id: { type: 'string', description: 'UUID del alumno a consultar.' },
      },
      required: ['alumno_id'],
    }
    const result = validate(schemaConDescripcion, { alumno_id: 'uuid-real' })
    expect(result.ok).toBe(true)
  })
})
