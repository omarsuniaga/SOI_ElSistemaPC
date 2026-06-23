import { describe, it, expect } from 'vitest'
import { scoreCriteria } from '../domain/scoring.js'

describe('scoreCriteria', () => {
  it('returns total sum of all 8 criteria (S-09)', () => {
    const result = scoreCriteria({
      c1: 4, c2: 3, c3: 4, c4: 4,
      c5: 3, c6: 4, c7: 3, c8: 4,
    })
    expect(result).toBe(29)
  })

  it('returns 8 when all criteria are minimum (1 each)', () => {
    const result = scoreCriteria({
      c1: 1, c2: 1, c3: 1, c4: 1,
      c5: 1, c6: 1, c7: 1, c8: 1,
    })
    expect(result).toBe(8)
  })

  it('returns 32 when all criteria are maximum (4 each)', () => {
    const result = scoreCriteria({
      c1: 4, c2: 4, c3: 4, c4: 4,
      c5: 4, c6: 4, c7: 4, c8: 4,
    })
    expect(result).toBe(32)
  })

  it('throws TypeError when fewer than 8 keys provided', () => {
    expect(() => scoreCriteria({
      c1: 4, c2: 3, c3: 4,
    })).toThrow(TypeError)
  })

  it('throws TypeError when no keys provided', () => {
    expect(() => scoreCriteria({})).toThrow(TypeError)
  })

  it('throws RangeError when any criterion is 0 (below range)', () => {
    expect(() => scoreCriteria({
      c1: 4, c2: 3, c3: 4, c4: 4,
      c5: 0, c6: 4, c7: 3, c8: 4,
    })).toThrow(RangeError)
  })

  it('throws RangeError when any criterion is 5 (above range)', () => {
    expect(() => scoreCriteria({
      c1: 4, c2: 3, c3: 4, c4: 4,
      c5: 3, c6: 4, c7: 3, c8: 5,
    })).toThrow(RangeError)
  })

  it('throws RangeError when any criterion is null', () => {
    expect(() => scoreCriteria({
      c1: 4, c2: 3, c3: null, c4: 4,
      c5: 3, c6: 4, c7: 3, c8: 4,
    })).toThrow(RangeError)
  })

  it('throws RangeError when any criterion is undefined', () => {
    expect(() => scoreCriteria({
      c1: 4, c2: 3, c3: 4, c4: 4,
      c5: 3, c6: 4, c7: 3, c8: undefined,
    })).toThrow(RangeError)
  })
})
