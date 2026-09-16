import { describe, expect, it } from 'vitest'
import { aggregateOrchestraPreparation, aggregateSectionalPreparation } from '../domain/sectionalAggregation.js'

const fila = (filaId, filaName, collectiveState, students = [], applicability = 'TOCA') => ({ sectionId: 'maderas', measureId: '42', filaId, filaName, collectiveState, students, applicability })

describe('sectional aggregation', () => {
  it('weights global evidence by fila-equivalents, not sections or student headcount', () => {
    const evidence = [
      ...Array.from({ length: 8 }, (_, i) => ({ sectionId: 'cuerdas', filaId: `c${i}`, measureId: '42', applicability: 'TOCA', collectiveState: 'CONSOLIDADO', students: Array(20).fill({}) })),
      { sectionId: 'maderas', filaId: 'm1', measureId: '42', applicability: 'TOCA', collectiveState: 'SIN_ESTUDIAR', students: [{}] },
      { sectionId: 'maderas', filaId: 'm2', measureId: '42', applicability: 'TOCA', collectiveState: 'CONSOLIDADO', students: Array(30).fill({}) }
    ]
    const [result] = aggregateOrchestraPreparation({ evidence })
    expect(result.distribution.counts.CONSOLIDADO).toBe(9)
    expect(result.distribution.counts.SIN_ESTUDIAR).toBe(1)
    expect(result.distribution.percentages.CONSOLIDADO).toBe(90)
    expect(result.affectedSectionCount).toBe(2)
    expect(result.sectionProjections.find((section) => section.sectionId === 'maderas').criticalFilaCount).toBe(1)
  })

  it('propagates derived fractions and preserves applicability categories and critical evidence', () => {
    const [result] = aggregateOrchestraPreparation({ evidence: [
      { sectionId: 'cuerdas', filaId: 'c', measureId: '100', applicability: 'TOCA', collectiveState: 'CONSOLIDADO', students: [{ overrideState: 'DOMINADO' }] },
      { sectionId: 'maderas', filaId: 'm', measureId: '100', applicability: 'TOCA', students: [{ state: 'CON_DIFICULTAD' }, { state: 'DOMINADO' }] },
      { sectionId: 'metales', filaId: 't1', measureId: '100', applicability: 'TACET', collectiveState: 'DOMINADO' },
      { sectionId: 'metales', filaId: 't2', measureId: '100', applicability: 'SILENCIO', collectiveState: 'DOMINADO' },
      { sectionId: 'percusion', filaId: 'p', measureId: '100', applicability: 'NO_APLICA', collectiveState: 'DOMINADO' },
      { sectionId: 'percusion', filaId: '100?', measureId: '100', applicability: 'DESCONOCIDO', collectiveState: 'DOMINADO' },
      { sectionId: 'percusion', filaId: 'u', measureId: '100', applicability: 'TOCA', collectiveState: null, students: [] },
      { sectionId: 'percusion', filaId: 'critical', measureId: '100', applicability: 'TOCA', collectiveState: 'DOMINADO', students: [{ critical: true }] }
    ] })
    expect(result.distribution.counts.SIN_EVALUAR).toBe(1)
    expect(result.distribution.counts.CON_DIFICULTAD).toBe(0.5)
    expect(result.distribution.counts.DOMINADO).toBe(1.5)
    expect(result.excludedFilaCount).toBe(3)
    expect(result.unresolvedFilaCount).toBe(1)
    expect(result.criticalStudentExceptions).toBe(1)
    expect(result.sectionProjections.every((section) => section.sectionId)).toBe(true)
  })

  it('is deterministic for large mixed-orchestra evidence', () => {
    const evidence = Array.from({ length: 1000 * 24 }, (_, index) => ({ sectionId: `s${index % 4}`, filaId: `f${index % 24}`, measureId: String(Math.floor(index / 24) + 1), applicability: index % 31 === 0 ? 'TACET' : 'TOCA', collectiveState: index % 3 === 0 ? 'DOMINADO' : 'SIN_EVALUAR', students: [] }))
    const started = performance.now()
    const first = aggregateOrchestraPreparation({ evidence })
    const second = aggregateOrchestraPreparation({ evidence })
    expect(first).toEqual(second)
    expect(first).toHaveLength(1000)
    expect(performance.now() - started).toBeLessThan(3500)
  })
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
