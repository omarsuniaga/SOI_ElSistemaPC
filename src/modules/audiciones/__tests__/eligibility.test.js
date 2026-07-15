import { describe, it, expect } from 'vitest'
import { isEligible } from '../domain/eligibility.js'

const validEval = {
  student_id: 'stu-1',
  jurado_id: 'usr-jurado-1',
  afinacion: 3,
  ritmo: 4,
  postura: 5,
  musicalidad: 3,
}

describe('isEligible', () => {
  it('returns true when all 4 criteria are valid integers 1-5', () => {
    expect(isEligible(validEval)).toBe(true)
  })

  it('returns false when any criterion is null', () => {
    expect(isEligible({ ...validEval, postura: null })).toBe(false)
  })

  it('returns false when any criterion is undefined', () => {
    const partial = { ...validEval }
    delete partial.postura
    expect(isEligible(partial)).toBe(false)
  })

  it('returns false when any criterion is 0 (out of range)', () => {
    expect(isEligible({ ...validEval, afinacion: 0 })).toBe(false)
  })

  it('returns false when any criterion is 6 (out of range)', () => {
    expect(isEligible({ ...validEval, ritmo: 6 })).toBe(false)
  })

  it('returns true when any criterion is 5 (within range)', () => {
    expect(isEligible({ ...validEval, ritmo: 5 })).toBe(true)
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
