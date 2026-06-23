import { describe, it, expect } from 'vitest'
import { assignGroup } from '../domain/groupAssignment.js'

describe('assignGroup', () => {
  it('returns A for score >= 28 (S-09: score=29)', () => {
    expect(assignGroup(29)).toBe('A')
  })

  it('returns A at exact boundary (score=28)', () => {
    expect(assignGroup(28)).toBe('A')
  })

  it('returns B for score 27 (below A threshold)', () => {
    expect(assignGroup(27)).toBe('B')
  })

  it('returns B at exact boundary (score=20, S-10)', () => {
    expect(assignGroup(20)).toBe('B')
  })

  it('returns C for score 19 (below B threshold)', () => {
    expect(assignGroup(19)).toBe('C')
  })

  it('returns C at exact boundary (score=12, S-11)', () => {
    expect(assignGroup(12)).toBe('C')
  })

  it('returns D for score 11 (below C threshold)', () => {
    expect(assignGroup(11)).toBe('D')
  })

  it('returns D at exact boundary (score=8, S-12)', () => {
    expect(assignGroup(8)).toBe('D')
  })

  it('throws RangeError for score below 8', () => {
    expect(() => assignGroup(7)).toThrow(RangeError)
  })

  it('throws RangeError for score above 32', () => {
    expect(() => assignGroup(33)).toThrow(RangeError)
  })
})
