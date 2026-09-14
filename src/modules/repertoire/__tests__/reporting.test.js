import { describe, expect, it } from 'vitest'
import { buildEventReport, buildFilaReport, buildOrchestraReport, buildPassageReport, buildSectionReport, buildMontageReport, renderReportHtml } from '../domain/reporting.js'

const fila = (sectionId, filaId, state = 'CONSOLIDADO') => ({ sectionId, filaId, filaName: filaId, applicability: 'TOCA', collectiveState: state, students: [] })

describe('repertoire reporting projections', () => {
  it('preserves preparation states and excludes non-applicable measures', () => {
    const report = buildMontageReport({ montage: { id: 'm1' }, measures: [{ aplicabilidad: 'TOCA', estado_preparacion: 'CONSOLIDADO' }, { aplicabilidad: 'SILENCIO', estado_preparacion: 'SIN_ESTUDIAR' }] })
    expect(report.distribution.denominator).toBe(1)
    expect(report.applicability.excluded).toBe(1)
  })
  it('keeps student override visible without downgrading collective fila', () => {
    const report = buildFilaReport({ fila: { id: 'f1' }, evidence: [{ collectiveState: 'CONSOLIDADO', applicability: 'TOCA', students: [{ name: 'Juan', overrideState: 'SIN_ESTUDIAR' }] }] })
    expect(report.collective.counts.CONSOLIDADO).toBe(1)
    expect(report.individualExceptions[0].name).toBe('Juan')
  })
  it('uses fila-equivalent orchestra weighting, not equal section weighting', () => {
    const report = buildOrchestraReport({ evidence: [fila('strings', 's1'), fila('strings', 's2'), fila('woodwinds', 'w1'), fila('woodwinds', 'w2', 'SIN_ESTUDIAR')] })
    const projection = report.aggregation.find((item) => item.measureId === undefined) || report.aggregation[0]
    expect(report.weakFilas).toHaveLength(1)
    expect(projection).toBeDefined()
  })
  it('builds section, passage, event and print-safe projections', () => {
    expect(buildSectionReport({ section: { id: 's1' }, filas: [fila('s1', 'f1')] }).type).toBe('SECTION')
    expect(buildPassageReport({ passage: { id: 'p1' }, measures: [] }).type).toBe('PASSAGE')
    const event = buildEventReport({ event: { id: 'e1', fecha_inicio: '2026-12-01' }, montages: [{ montageId: 'm1', status: 'AT_RISK' }] })
    expect(event.concerns).toHaveLength(1)
    expect(renderReportHtml(event)).toContain('data-report-type="EVENT"')
  })
})
