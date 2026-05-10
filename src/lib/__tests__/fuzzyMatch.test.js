import { describe, it, expect } from 'vitest'
import { fuzzyMatch, levenshteinDistance } from '../fuzzyMatch.js'

describe('fuzzyMatch - Levenshtein distance matching', () => {
  describe('levenshteinDistance', () => {
    it('should return 0 for identical strings', () => {
      expect(levenshteinDistance('hello', 'hello')).toBe(0)
      expect(levenshteinDistance('', '')).toBe(0)
    })

    it('should return correct distance for different strings', () => {
      expect(levenshteinDistance('cat', 'hat')).toBe(1)
      expect(levenshteinDistance('kitten', 'sitting')).toBe(3)
    })

    it('should handle empty strings', () => {
      expect(levenshteinDistance('', 'abc')).toBe(3)
      expect(levenshteinDistance('abc', '')).toBe(3)
    })

    it('should be symmetric', () => {
      const d1 = levenshteinDistance('abc', 'def')
      const d2 = levenshteinDistance('def', 'abc')
      expect(d1).toBe(d2)
    })

    it('should handle case sensitivity', () => {
      // By default it's case-sensitive
      expect(levenshteinDistance('Hello', 'hello')).toBe(1)
    })

    it('should calculate distance for longer strings', () => {
      const d = levenshteinDistance('algorithm', 'altruistic')
      expect(d).toBeGreaterThan(0)
      expect(d).toBeLessThanOrEqual(Math.max('algorithm'.length, 'altruistic'.length))
    })
  })

  describe('fuzzyMatch', () => {
    it('should return exact match with score 1.0', () => {
      const result = fuzzyMatch('violin', 'violin')
      expect(result).toBe(1.0)
    })

    it('should return high score for similar strings', () => {
      const result = fuzzyMatch('violin', 'violín')
      expect(result).toBeGreaterThan(0.7)
    })

    it('should return 0 for completely different strings', () => {
      const result = fuzzyMatch('violin', 'piano')
      expect(result).toBeLessThan(0.5)
    })

    it('should handle empty strings', () => {
      expect(fuzzyMatch('', '')).toBe(1.0)
      expect(fuzzyMatch('test', '')).toBeLessThan(1.0)
      expect(fuzzyMatch('', 'test')).toBeLessThan(1.0)
    })

    it('should be case-insensitive', () => {
      const s1 = fuzzyMatch('Violin', 'violin')
      const s2 = fuzzyMatch('PIANO', 'piano')
      expect(s1).toBe(1.0)
      expect(s2).toBe(1.0)
    })

    it('should handle partial matches', () => {
      const result = fuzzyMatch('violin', 'violi')
      expect(result).toBeGreaterThan(0.8)
    })

    it('should scale score between 0 and 1', () => {
      const test_cases = [
        { a: 'hello', b: 'hallo' },
        { a: 'test', b: 'best' },
        { a: 'programming', b: 'programmer' },
      ]

      for (const { a, b } of test_cases) {
        const score = fuzzyMatch(a, b)
        expect(score).toBeGreaterThanOrEqual(0)
        expect(score).toBeLessThanOrEqual(1.0)
      }
    })
  })

  describe('Instrument matching scenarios', () => {
    it('should match common instruments with tolerance', () => {
      const instruments = [
        ['violin', 'violín'],
        ['piano', 'piano'],
        ['guitarra', 'guitarra'],
        ['flauta', 'flauta'],
        ['oboe', 'oboe'],
      ]

      for (const [a, b] of instruments) {
        const score = fuzzyMatch(a, b)
        expect(score).toBeGreaterThan(0.8)
      }
    })

    it('should distinguish between different instruments', () => {
      const score1 = fuzzyMatch('violin', 'viola')
      const score2 = fuzzyMatch('violin', 'piano')

      expect(score1).toBeGreaterThan(score2)
    })

    it('should handle accented characters', () => {
      const result = fuzzyMatch('violín', 'violin')
      expect(result).toBeGreaterThan(0.7)
    })
  })
})
