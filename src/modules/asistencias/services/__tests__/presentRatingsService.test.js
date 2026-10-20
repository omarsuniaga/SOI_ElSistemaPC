import { describe, it, expect } from 'vitest'
import {
  isRatableState, normalizeRating, ratingSummaryText, ratingLabel, partitionRatings, summarizeRatings, formatAverage,
} from '../presentRatingsService.js'

describe('present ratings domain', () => {
  it('only presents (and late) are ratable; absent, justified and unmarked are not', () => {
    for (const s of ['P', 'presente', 'T', 'tarde']) expect(isRatableState(s)).toBe(true)
    for (const s of ['A', 'ausente', 'J', 'justificado', null, undefined, '']) expect(isRatableState(s)).toBe(false)
  })

  it('keeps zero distinct from "Sin evaluar"', () => {
    expect(normalizeRating(0)).toBe(0)
    expect(normalizeRating('0')).toBe(0)
    expect(normalizeRating(null)).toBeNull()
    expect(normalizeRating(undefined)).toBeNull()
    expect(normalizeRating('')).toBeNull()
    expect(normalizeRating(5)).toBe(5)
    expect(ratingLabel(null)).toBe('Sin evaluar')
    expect(ratingLabel(0)).toBe('0 estrellas')
    expect(ratingLabel(0)).not.toBe(ratingLabel(null))
    expect(ratingLabel(4)).toContain('4/5')
  })

  it.each([-1, 6, 2.5, 'x', NaN])('rejects invalid value %s', (v) => {
    expect(() => normalizeRating(v)).toThrow(RangeError)
  })

  const rows = [
    { id: 'r1', alumno_id: 'a', estado: 'presente' },
    { id: 'r2', alumno_id: 'b', estado: 'ausente' },
    { id: 'r3', alumno_id: 'c', estado: 'justificado' },
    { id: 'r4', alumno_id: 'd', estado: 'tarde' },
  ]

  it('updates existing rows only, rejecting absent, justified and unsaved students', () => {
    const { updates, rejected } = partitionRatings(rows, [
      { alumno_id: 'a', valoracion: 0 },
      { alumno_id: 'b', valoracion: 5 },
      { alumno_id: 'c', valoracion: 3 },
      { alumno_id: 'd', valoracion: null },
      { alumno_id: 'zzz', valoracion: 4 },
    ])
    expect(updates).toEqual([
      { id: 'r1', alumno_id: 'a', valoracion: 0 },
      { id: 'r4', alumno_id: 'd', valoracion: null },
    ])
    expect(rejected).toEqual([
      { alumno_id: 'b', reason: 'no_presente' },
      { alumno_id: 'c', reason: 'no_presente' },
      { alumno_id: 'zzz', reason: 'sin_asistencia' },
    ])
  })

  it('a repeated student collapses to one update (last value wins), never two', () => {
    const { updates } = partitionRatings(rows, [
      { alumno_id: 'a', valoracion: 2 }, { alumno_id: 'a', valoracion: 4 },
    ])
    expect(updates).toEqual([{ id: 'r1', alumno_id: 'a', valoracion: 4 }])
  })

  it('averages only evaluated entries; zero counts, unrated does not', () => {
    expect(summarizeRatings([5, 0, null, 3])).toEqual({ rated: 3, unrated: 1, average: 2.7 })
    expect(summarizeRatings([null, null])).toEqual({ rated: 0, unrated: 2, average: null })
    expect(summarizeRatings([])).toEqual({ rated: 0, unrated: 0, average: null })
    expect(formatAverage(2.7)).toBe('2,7')
    expect(formatAverage(null)).toBe('—')
  })

  it('summary text never shows an empty average', () => {
    expect(ratingSummaryText({ rated: 2, unrated: 1, average: 2.5 })).toBe('promedio 2,5/5 (2 evaluadas, 1 sin evaluar)')
    expect(ratingSummaryText({ rated: 0, unrated: 3, average: null })).toBe('sin valoraciones (3 sin evaluar)')
    expect(ratingSummaryText({ rated: 0, unrated: 0, average: null })).toBe('')
  })
})
