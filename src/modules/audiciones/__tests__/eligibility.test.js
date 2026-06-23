import { describe, it, expect } from 'vitest'
import { isEligible } from '../domain/eligibility.js'

describe('isEligible', () => {
  const validEval = {
    student_id: 'stu-1',
    jurado_id: 'usr-jurado-1',
    c1: 3, c2: 4, c3: 3, c4: 4,
    c5: 3, c6: 4, c7: 3, c8: 4,
  }

  it('returns true when all 8 criteria are valid integers 1-4', () => {
    expect(isEligible(validEval)).toBe(true)
  })

  it('returns false when any criterion is null', () => {
    expect(isEligible({ ...validEval, c3: null })).toBe(false)
  })

  it('returns false when any criterion is undefined', () => {
    expect(isEligible({ ...validEval, c7: undefined })).toBe(false)
  })

  it('returns false when any criterion is 0 (out of range)', () => {
    expect(isEligible({ ...validEval, c2: 0 })).toBe(false)
  })

  it('returns false when any criterion is 5 (out of range)', () => {
    expect(isEligible({ ...validEval, c5: 5 })).toBe(false)
  })

  it('returns false when student_id is missing', () => {
    const { student_id, ...rest } = validEval
    expect(isEligible(rest)).toBe(false)
  })

  it('returns false when jurado_id is missing', () => {
    const { jurado_id, ...rest } = validEval
    expect(isEligible(rest)).toBe(false)
  })

  it('returns false when student_id is null', () => {
    expect(isEligible({ ...validEval, student_id: null })).toBe(false)
  })

  it('returns false when jurado_id is undefined', () => {
    expect(isEligible({ ...validEval, jurado_id: undefined })).toBe(false)
  })
})
