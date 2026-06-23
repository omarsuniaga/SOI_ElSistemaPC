import { describe, test, expect } from 'vitest'
import { validateFamilia, buildFamiliaRecord, isFamiliaActiva } from '../domain/familia.js'

describe('validateFamilia', () => {
  test('valid with required nombre_familia', () => {
    const result = validateFamilia({ nombre_familia: 'Los García' })
    expect(result.valid).toBe(true)
    expect(result.errors).toHaveLength(0)
  })

  test('invalid when nombre_familia is missing', () => {
    const result = validateFamilia({})
    expect(result.valid).toBe(false)
    expect(result.errors).toContain('nombre_familia es requerido')
  })

  test('invalid when nombre_familia is empty string', () => {
    const result = validateFamilia({ nombre_familia: '' })
    expect(result.valid).toBe(false)
    expect(result.errors).toContain('nombre_familia es requerido')
  })

  test('invalid when nombre_familia is only whitespace', () => {
    const result = validateFamilia({ nombre_familia: '   ' })
    expect(result.valid).toBe(false)
    expect(result.errors).toContain('nombre_familia es requerido')
  })
})

describe('buildFamiliaRecord', () => {
  test('builds record with correct defaults', () => {
    const record = buildFamiliaRecord({ nombre_familia: 'Los Pérez' })
    expect(record.nombre_familia).toBe('Los Pérez')
    expect(record.activa).toBe(true)
    expect(record.datos_extra).toEqual({})
  })

  test('preserves provided activa value', () => {
    const record = buildFamiliaRecord({ nombre_familia: 'Los Pérez', activa: false })
    expect(record.activa).toBe(false)
  })

  test('preserves provided datos_extra', () => {
    const extra = { telefono: '0414-000-0000' }
    const record = buildFamiliaRecord({ nombre_familia: 'Los Pérez', datos_extra: extra })
    expect(record.datos_extra).toEqual(extra)
  })

  test('does not include id (db assigns it)', () => {
    const record = buildFamiliaRecord({ nombre_familia: 'Los Pérez' })
    expect(record.id).toBeUndefined()
  })
})

describe('isFamiliaActiva', () => {
  test('returns true when activa is true', () => {
    expect(isFamiliaActiva({ activa: true })).toBe(true)
  })

  test('returns false when activa is false', () => {
    expect(isFamiliaActiva({ activa: false })).toBe(false)
  })

  test('returns false when activa is undefined', () => {
    expect(isFamiliaActiva({})).toBe(false)
  })
})
