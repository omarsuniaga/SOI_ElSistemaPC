import { describe, expect, it } from 'vitest'
import { fechaCivilActividad, fechasActividad, fechaSantoDomingo } from '../institutionalDates.js'

describe('institutional dates', () => {
  it('keeps a late Wednesday in Santo Domingo when UTC has reached Thursday', () => {
    expect(fechaSantoDomingo(new Date('2026-10-29T01:30:00Z'))).toBe('2026-10-28')
    expect(fechaCivilActividad('2026-10-29 01:30:00+00')).toBe('2026-10-28')
  })

  it('preserves legacy midnight date markers and local midnight writes', () => {
    expect(fechaCivilActividad('2026-10-28 00:00:00+00')).toBe('2026-10-28')
    expect(fechaCivilActividad('2026-10-28 04:00:00+00')).toBe('2026-10-28')
  })

  it('enumerates inclusive dates across months', () => {
    expect(fechasActividad('2026-10-31', '2026-11-01')).toEqual(['2026-10-31', '2026-11-01'])
  })
})
