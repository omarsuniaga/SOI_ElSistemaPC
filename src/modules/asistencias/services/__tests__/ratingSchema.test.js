import { describe, it, expect } from 'vitest'
import { isRatingSchemaMissing, RatingSchemaUnavailableError } from '../presentRatingsService.js'
describe('rating schema readiness', () => {
  it('identifies only missing rating columns', () => {
    expect(isRatingSchemaMissing({ code: '42703', message: 'column asistencias.valoracion does not exist' })).toBe(true)
    expect(isRatingSchemaMissing({ code: 'PGRST204', message: "Could not find the 'valorada_por' column" })).toBe(true)
    expect(isRatingSchemaMissing({ code: '42703', message: 'column other_field does not exist' })).toBe(false)
    expect(isRatingSchemaMissing({ code: '42501', message: 'permission denied: valoracion' })).toBe(false)
    expect(isRatingSchemaMissing({ message: 'network error' })).toBe(false)
    expect(isRatingSchemaMissing(null)).toBe(false)
  })
  it('preserves the deployment cause without pretending all students are unrated', () => {
    const cause = { code: '42703' }
    const error = new RatingSchemaUnavailableError(cause)
    expect(error.code).toBe('RATINGS_SCHEMA_UNAVAILABLE')
    expect(error.cause).toBe(cause)
  })
})
