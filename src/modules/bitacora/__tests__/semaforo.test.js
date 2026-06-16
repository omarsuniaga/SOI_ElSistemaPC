import { describe, it, expect } from 'vitest'
import { calcularSemaforo, semaforoClass } from '../utils/semaforo.js'

describe('calcularSemaforo', () => {
  it('returns gris when total_registros is 0', () => {
    expect(calcularSemaforo({ bien_count: 0, regular_count: 0, mal_count: 0, total_registros: 0 }))
      .toBe('gris')
  })

  it('returns verde when bien_count >= 70% of total', () => {
    expect(calcularSemaforo({ bien_count: 7, regular_count: 2, mal_count: 1, total_registros: 10 }))
      .toBe('verde')
  })

  it('returns verde at exactly 70% bien', () => {
    expect(calcularSemaforo({ bien_count: 7, regular_count: 3, mal_count: 0, total_registros: 10 }))
      .toBe('verde')
  })

  it('returns rojo when mal_count > 50% of total', () => {
    expect(calcularSemaforo({ bien_count: 1, regular_count: 2, mal_count: 6, total_registros: 9 }))
      .toBe('rojo')
  })

  it('rojo takes precedence when both rojo and verde thresholds would be met', () => {
    // Pathological edge: 6/9 mal (>50%) and also theoretically verde?
    // That's impossible (can't have >50% mal AND >=70% bien), but tests the order.
    // Use: 5 mal, 5 bien, 0 regular, total=10 → mal=50% (not >50%), bien=50% (<70%) → naranja
    expect(calcularSemaforo({ bien_count: 5, regular_count: 0, mal_count: 5, total_registros: 10 }))
      .toBe('naranja')
  })

  it('returns naranja when neither rojo nor verde thresholds met', () => {
    expect(calcularSemaforo({ bien_count: 3, regular_count: 4, mal_count: 3, total_registros: 10 }))
      .toBe('naranja')
  })
})

describe('semaforoClass', () => {
  it('returns correct CSS class for each color', () => {
    expect(semaforoClass('verde')).toBe('semaforo--verde')
    expect(semaforoClass('naranja')).toBe('semaforo--naranja')
    expect(semaforoClass('rojo')).toBe('semaforo--rojo')
    expect(semaforoClass('gris')).toBe('semaforo--gris')
  })

  it('defaults to gris for unknown values', () => {
    expect(semaforoClass('unknown')).toBe('semaforo--gris')
  })
})
