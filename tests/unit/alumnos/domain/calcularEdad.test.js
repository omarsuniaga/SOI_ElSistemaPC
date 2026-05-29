import { describe, it, expect } from 'vitest'
import { calcularEdad } from '../../../../src/modules/alumnos/domain/calcularEdad.js'

describe('calcularEdad', () => {
  it('returns correct completed years for a known birthday', () => {
    // Born 2010-01-15, today = 2026-05-28 => 16 years
    expect(calcularEdad('2010-01-15', new Date('2026-05-28'))).toBe(16)
  })

  it('returns 0 for a child born this year before today', () => {
    expect(calcularEdad('2026-01-01', new Date('2026-05-28'))).toBe(0)
  })

  it('does not count next birthday yet (birthday after today)', () => {
    // Born 2010-12-01, today = 2026-05-28 => still 15 (birthday hasn't happened yet)
    expect(calcularEdad('2010-12-01', new Date('2026-05-28'))).toBe(15)
  })

  it('counts birthday correctly when today IS the birthday', () => {
    expect(calcularEdad('2010-05-28', new Date('2026-05-28'))).toBe(16)
  })

  it('handles leap year birthday (Feb 29)', () => {
    // Born 2000-02-29, today = 2026-05-28 => 26 years
    expect(calcularEdad('2000-02-29', new Date('2026-05-28'))).toBe(26)
  })

  it('throws for a future date', () => {
    expect(() => calcularEdad('2030-01-01', new Date('2026-05-28'))).toThrow()
  })

  it('throws for null input', () => {
    expect(() => calcularEdad(null)).toThrow()
  })

  it('throws for empty string', () => {
    expect(() => calcularEdad('')).toThrow()
  })

  it('throws for invalid date string', () => {
    expect(() => calcularEdad('not-a-date')).toThrow()
  })

  it('uses today by default (smoke test — just checks it returns a number)', () => {
    const age = calcularEdad('2000-01-01')
    expect(typeof age).toBe('number')
    expect(age).toBeGreaterThan(0)
  })
})
