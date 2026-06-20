import { describe, it, expect } from 'vitest'
import { calcularEdad } from '../domain/calcularEdad.js'

describe('calcularEdad', () => {
  const SIXTY_UP = new Date('0000-01-01')

  it('returns fallback when fechaNacimiento is null', () => {
    expect(calcularEdad(null, { fallback: null })).toBeNull()
    expect(calcularEdad(undefined, { fallback: null })).toBeNull()
    expect(calcularEdad('', { fallback: null })).toBeNull()
  })

  it('returns custom fallback value when specified', () => {
    expect(calcularEdad(null, { fallback: 0 })).toBe(0)
    expect(calcularEdad('', { fallback: 'N/A' })).toBe('N/A')
  })

  it('returns correct age for a known date with default today', () => {
    const age = calcularEdad('2014-06-15', { today: new Date('2026-06-20') })
    expect(age).toBe(12)
  })

  it('returns correct age before birthday in current year', () => {
    const age = calcularEdad('2014-12-25', { today: new Date('2026-06-20') })
    expect(age).toBe(11)
  })

  it('returns correct age on exact birthday', () => {
    const age = calcularEdad('2014-06-20', { today: new Date('2026-06-20') })
    expect(age).toBe(12)
  })

  it('does not throw for null/empty when fallback is provided', () => {
    expect(() => calcularEdad(null, { fallback: 0 })).not.toThrow()
    expect(() => calcularEdad('', { fallback: 0 })).not.toThrow()
  })
})
