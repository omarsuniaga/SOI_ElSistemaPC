import { describe, it, expect } from 'vitest'
import { scoreCriteria } from '../domain/scoring.js'

describe('scoreCriteria', () => {
  it('returns total sum of all 8 criteria (S-09)', () => {
    const result = scoreCriteria({ c1: 4, c2: 3, c3: 4, c4: 4, c5: 3, c6: 4, c7: 3, c8: 4 })
    expect(result).toBe(29)
  })

  it('returns 8 when all criteria are minimum (1 each)', () => {
    expect(scoreCriteria({ c1: 1, c2: 1, c3: 1, c4: 1, c5: 1, c6: 1, c7: 1, c8: 1 })).toBe(8)
  })

  it('returns 32 when all criteria are maximum (4 each)', () => {
    expect(scoreCriteria({ c1: 4, c2: 4, c3: 4, c4: 4, c5: 4, c6: 4, c7: 4, c8: 4 })).toBe(32)
  })

  it('throws TypeError when fewer than 8 keys provided', () => {
    expect(() => scoreCriteria({ c1: 1, c2: 2 })).toThrow(TypeError)
  })

  it('throws TypeError when no keys provided', () => {
    expect(() => scoreCriteria({})).toThrow(TypeError)
  })

  it('throws RangeError when any criterion is 0 (below range)', () => {
    expect(() => scoreCriteria({ c1: 1, c2: 2, c3: 3, c4: 4, c5: 5, c6: 6, c7: 0, c8: 8 })).toThrow(RangeError)
  })

  it('throws RangeError when any criterion is 5 (above range)', () => {
    expect(() => scoreCriteria({ c1: 1, c2: 2, c3: 3, c4: 4, c5: 5, c6: 6, c7: 7, c8: 5 })).toThrow(RangeError)
  })

  it('throws RangeError when any criterion is null', () => {
    expect(() => scoreCriteria({ c1: 3, c2: 3, c3: 3, c4: null, c5: 3, c6: 3, c7: 3, c8: 3 })).toThrow(RangeError)
  })

  it('throws RangeError when any criterion is undefined', () => {
    const partial = { c1: 3, c2: 3, c3: 3, c5: 3, c6: 3, c7: 3, c8: 3 }
    expect(() => scoreCriteria(partial)).toThrow(TypeError)
  })
})
