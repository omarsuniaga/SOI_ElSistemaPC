import { describe, it, expect } from 'vitest'
import { esVigente } from '../esVigente.js'

// Helper: returns a date string offset by N days from today
function dateOffset(days) {
  const d = new Date()
  d.setDate(d.getDate() + days)
  return d.toISOString().slice(0, 10)
}

const TODAY = dateOffset(0)
const YESTERDAY = dateOffset(-1)
const TOMORROW = dateOffset(1)

describe('esVigente(permiso)', () => {
  it('returns true when fecha_fin is null (permanent)', () => {
    expect(esVigente({ fecha_inicio: YESTERDAY, fecha_fin: null })).toBe(true)
  })

  it('returns true when fecha_fin is tomorrow (not yet expired)', () => {
    expect(esVigente({ fecha_inicio: YESTERDAY, fecha_fin: TOMORROW })).toBe(true)
  })

  it('returns true when fecha_fin equals today (boundary: same day is valid)', () => {
    expect(esVigente({ fecha_inicio: YESTERDAY, fecha_fin: TODAY })).toBe(true)
  })

  it('returns false when fecha_fin was yesterday (expired)', () => {
    expect(esVigente({ fecha_inicio: YESTERDAY, fecha_fin: YESTERDAY })).toBe(false)
  })

  it('returns false when fecha_inicio is tomorrow (not yet active)', () => {
    expect(esVigente({ fecha_inicio: TOMORROW, fecha_fin: null })).toBe(false)
  })

  it('returns true when fecha_inicio equals today (starts today = active)', () => {
    expect(esVigente({ fecha_inicio: TODAY, fecha_fin: null })).toBe(true)
  })

  it('returns true when fecha_inicio is yesterday (already active, no end)', () => {
    expect(esVigente({ fecha_inicio: YESTERDAY, fecha_fin: null })).toBe(true)
  })

  it('returns false when row is null (fail-closed)', () => {
    expect(esVigente(null)).toBe(false)
  })

  it('returns false when row is undefined (fail-closed)', () => {
    expect(esVigente(undefined)).toBe(false)
  })
})
