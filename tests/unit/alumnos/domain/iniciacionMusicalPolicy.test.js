import { describe, it, expect } from 'vitest'
import {
  calcularFechaElegibleAudicion,
  estaEnPeriodoIniciacion,
  puedeAudicionarHoy,
  descripcionPolitica,
  iniciacionMusicalPolicy,
} from '../../../../src/modules/alumnos/domain/iniciacionMusicalPolicy.js'

describe('calcularFechaElegibleAudicion', () => {
  it('returns fechaIngreso + 3 months as ISO date string', () => {
    expect(calcularFechaElegibleAudicion('2026-06-01')).toBe('2026-09-01')
  })

  it('handles month-end rollover correctly (Jan 31 + 3m = Apr 30)', () => {
    expect(calcularFechaElegibleAudicion('2026-01-31')).toBe('2026-04-30')
  })

  it('throws for null input', () => {
    expect(() => calcularFechaElegibleAudicion(null)).toThrow()
  })

  it('throws for invalid date string', () => {
    expect(() => calcularFechaElegibleAudicion('bad-date')).toThrow()
  })
})

describe('estaEnPeriodoIniciacion', () => {
  it('returns true when today is within 6 months of fechaIngreso', () => {
    // fechaIngreso = 2026-01-01, today = 2026-05-28 => 4.9 months, within 6
    expect(estaEnPeriodoIniciacion('2026-01-01', new Date('2026-05-28'))).toBe(true)
  })

  it('returns false when today is past 6 months', () => {
    // fechaIngreso = 2025-11-01, today = 2026-05-28 => ~6.9 months, past 6
    expect(estaEnPeriodoIniciacion('2025-11-01', new Date('2026-05-28'))).toBe(false)
  })

  it('returns true on the day of ingreso', () => {
    expect(estaEnPeriodoIniciacion('2026-05-28', new Date('2026-05-28'))).toBe(true)
  })

  it('returns false for a date in the future', () => {
    // fechaIngreso is in the future — not yet started
    expect(estaEnPeriodoIniciacion('2026-12-01', new Date('2026-05-28'))).toBe(false)
  })
})

describe('puedeAudicionarHoy', () => {
  it('returns true when today is exactly at +3 months', () => {
    expect(puedeAudicionarHoy('2026-02-28', new Date('2026-05-28'))).toBe(true)
  })

  it('returns true when today is between +3m and +6m', () => {
    expect(puedeAudicionarHoy('2026-01-01', new Date('2026-05-28'))).toBe(true)
  })

  it('returns false when today is before +3 months', () => {
    // fechaIngreso = 2026-05-01, today = 2026-05-28 => only 27 days in
    expect(puedeAudicionarHoy('2026-05-01', new Date('2026-05-28'))).toBe(false)
  })

  it('returns false when today is after +6 months', () => {
    // fechaIngreso = 2025-11-01, today = 2026-05-28 => past 6m
    expect(puedeAudicionarHoy('2025-11-01', new Date('2026-05-28'))).toBe(false)
  })
})

describe('descripcionPolitica', () => {
  it('returns a non-empty string', () => {
    const desc = descripcionPolitica()
    expect(typeof desc).toBe('string')
    expect(desc.length).toBeGreaterThan(0)
  })
})

describe('iniciacionMusicalPolicy (composite facade)', () => {
  it('returns iniciacion_musical_requerida=true for beginner (no knowledge)', () => {
    const result = iniciacionMusicalPolicy({ tiene_conocimientos_musicales: false }, '2026-06-01')
    expect(result.iniciacion_musical_requerida).toBe(true)
    expect(result.fecha_fin_iniciacion).toBe('2026-12-01')
    expect(result.fecha_elegible_audicion).toBe('2026-09-01')
  })

  it('returns iniciacion_musical_requerida=false for experienced student', () => {
    const result = iniciacionMusicalPolicy(
      { tiene_conocimientos_musicales: true, nivel_lectura_musical: 'avanzado' },
      '2026-06-01'
    )
    expect(result.iniciacion_musical_requerida).toBe(false)
    expect(result.fecha_fin_iniciacion).toBeNull()
    expect(result.fecha_elegible_audicion).toBeNull()
  })

  it('requires iniciacion when conocimientos=true but nivel is not avanzado', () => {
    const result = iniciacionMusicalPolicy(
      { tiene_conocimientos_musicales: true, nivel_lectura_musical: 'basico' },
      '2026-06-01'
    )
    expect(result.iniciacion_musical_requerida).toBe(true)
  })

  it('uses fechaIngreso as the anchor for dates', () => {
    const result = iniciacionMusicalPolicy({ tiene_conocimientos_musicales: false }, '2026-01-31')
    expect(result.fecha_elegible_audicion).toBe('2026-04-30')
    expect(result.fecha_fin_iniciacion).toBe('2026-07-31')
  })
})
