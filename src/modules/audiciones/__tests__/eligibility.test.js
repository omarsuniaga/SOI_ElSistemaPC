import { describe, it, expect } from 'vitest'
import { isEligible } from '../domain/eligibility.js'

const validEval = {
  student_id: 'stu-1',
  jurado_id: 'usr-jurado-1',
  c1: 3, c2: 3, c3: 3, c4: 3,
  c5: 3, c6: 3, c7: 3, c8: 3,
}

describe('isEligible', () => {
  it('returns true when all 8 criteria are valid integers 1-4', () => {
    expect(isEligible(validEval)).toBe(true)
  })

  it('returns false when any criterion is null', () => {
    expect(isEligible({ ...validEval, c3: null })).toBe(false)
  })

  it('returns false when any criterion is undefined', () => {
    const partial = { ...validEval }
    delete partial.c5
    expect(isEligible(partial)).toBe(false)
  })

  it('returns false when any criterion is 0 (out of range)', () => {
    expect(isEligible({ ...validEval, c1: 0 })).toBe(false)
  })

  it('returns false when any criterion is 5 (out of range)', () => {
    expect(isEligible({ ...validEval, c2: 5 })).toBe(false)
  })

  it('returns false when student_id is missing', () => {
    const noStudent = { ...validEval }
    delete noStudent.student_id
    expect(isEligible(noStudent)).toBe(false)
  })

  it('returns false when jurado_id is missing', () => {
    const noJurado = { ...validEval }
    delete noJurado.jurado_id
    expect(isEligible(noJurado)).toBe(false)
  })

  it('returns false when student_id is null', () => {
    expect(isEligible({ ...validEval, student_id: null })).toBe(false)
  })

  it('returns false when jurado_id is undefined', () => {
    const noJurado = { ...validEval, jurado_id: undefined }
    expect(isEligible(noJurado)).toBe(false)
  })
})
