import { describe, expect, it } from 'vitest'
import { aggregateSectionalPreparation } from '../domain/sectionalAggregation.js'

const fila = (filaId, filaName, collectiveState, students = [], applicability = 'TOCA') => ({ sectionId: 'maderas', measureId: '42', filaId, filaName, collectiveState, students, applicability })

describe('sectional aggregation', () => {
  it('weights filas equally, not by student headcount', () => {
    const [result] = aggregateSectionalPreparation({ evidence: [fila('flauta', 'Flauta', 'SIN_ESTUDIAR', Array(8).fill({})), fila('oboe', 'Oboe', 'CONSOLIDADO', [{}]), fila('clarinete', 'Clarinete', 'DOMINADO', Array(6).fill({})), fila('fagot', 'Fagot', 'DOMINADO', Array(2).fill({}))] })
    expect(result.distribution.percentages).toMatchObject({ SIN_ESTUDIAR: 25, DOMINADO: 50, CONSOLIDADO: 25 })
  })
  it('excludes rests and preserves unresolved applicability', () => {
    const [result] = aggregateSectionalPreparation({ evidence: [fila('a', 'A', 'SIN_ESTUDIAR'), fila('b', 'B', 'DOMINADO', [], 'TACET'), fila('c', 'C', 'CONSOLIDADO', [], 'DESCONOCIDO')] })
    expect(result.applicableFilaCount).toBe(1)
    expect(result.excludedFilaCount).toBe(1)
    expect(result.unresolvedFilaCount).toBe(1)
    expect(result.distribution.percentages.SIN_ESTUDIAR).toBe(100)
  })
  it('derives one fila distribution from students when no collective state exists', () => {
    const [result] = aggregateSectionalPreparation({ evidence: [fila('clarinete', 'Clarinete', null, [{ state: 'DOMINADO' }, { state: 'DOMINADO' }, { state: 'DOMINADO' }, { state: 'CONSOLIDADO' }, { state: 'CONSOLIDADO' }, { state: 'CONSOLIDADO' }])] })
    expect(result.filas[0].source).toBe('DERIVED_FROM_STUDENTS')
    expect(result.distribution.percentages).toMatchObject({ DOMINADO: 50, CONSOLIDADO: 50 })
  })
  it('keeps collective state primary while exposing critical student exceptions', () => {
    const [result] = aggregateSectionalPreparation({ evidence: [fila('oboe', 'Oboe', 'CONSOLIDADO', [{ overrideState: 'SIN_ESTUDIAR' }])] })
    expect(result.distribution.percentages.CONSOLIDADO).toBe(100)
    expect(result.criticalStudentExceptions).toBe(1)
  })
  it('aggregates 1000 measures with stable linear work', () => {
    const evidence = Array.from({ length: 1000 }, (_, index) => [
      { ...fila('flauta', 'Flauta', 'SIN_ESTUDIAR', [], 'TOCA'), measureId: String(index + 1) },
      { ...fila('oboe', 'Oboe', 'CONSOLIDADO', [], 'TOCA'), measureId: String(index + 1) }
    ]).flat()
    const started = performance.now()
    const result = aggregateSectionalPreparation({ evidence })
    expect(result).toHaveLength(1000)
    expect(performance.now() - started).toBeLessThan(1000)
  })
})
