import { describe, expect, it } from 'vitest'
import {
  aggregatePreparation,
  daysRemaining,
  isPreparationDenominator,
  validateMontajeDates
} from '../domain/repertoireFoundation.js'

describe('repertoire foundation', () => {
  it('keeps applicability separate from preparation denominator', () => {
    expect(isPreparationDenominator('TOCA')).toBe(true)
    expect(isPreparationDenominator('TACET')).toBe(false)
    expect(isPreparationDenominator('DESCONOCIDO')).toBe(false)
  })

  it('aggregates only applicable measures', () => {
    expect(aggregatePreparation([
      { aplicabilidad: 'TOCA', estado_preparacion: 'CONSOLIDADO' },
      { aplicabilidad: 'TOCA', estado_preparacion: 'DOMINADO' },
      { aplicabilidad: 'TACET', estado_preparacion: 'SIN_ESTUDIAR' },
      { aplicabilidad: 'DESCONOCIDO', estado_preparacion: 'SIN_EVALUAR' }
    ])).toMatchObject({ total: 2, percentage: 50, counts: { CONSOLIDADO: 1, DOMINADO: 1 } })
  })

  it('rejects inverted montaje dates', () => {
    expect(() => validateMontajeDates({ fecha_inicio: '2026-10-10', fecha_objetivo: '2026-10-09' })).toThrow()
  })

  it('calculates target days using calendar dates', () => {
    expect(daysRemaining('2026-12-18', new Date('2026-12-01T22:00:00-04:00'))).toBe(17)
  })
})
