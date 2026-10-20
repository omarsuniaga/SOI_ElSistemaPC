import { describe, it, expect } from 'vitest'
import { buildClassHistory } from '../classHistoryService.js'
import { buildClassHealthData } from '../classHealthService.js'
const day = (fecha, id = 'a', content = 'Escalas') => ({ fecha, clases: [{ clase_id: id,
  clase_nombre: 'Violín', presentes: 1, observacion_sesion: content,
  asistencias: [{ alumno_id: 's1', estado: 'presente' }] }] })
describe('class history', () => {
  it('isolates exact IDs, retains missing months and deduplicates students', () => {
    const data = buildClassHistory([day('2026-01-02'), day('2026-03-02'), day('2026-02-02', 'b')], 'a')
    expect(data.months.map(m => m.key)).toEqual(['2026-01', '2026-02', '2026-03'])
    expect(data.months[1].data).toBeNull()
    expect(data.entries).toHaveLength(2)
    expect(data.students).toHaveLength(1)
  })
  it('filters dates without claiming the first filtered date is the start', () => {
    const data = buildClassHistory([day('2026-01-02'), day('2026-03-02')], 'a', { from: '2026-03-01' })
    expect(data.firstRecorded).toBe('2026-01-02')
    expect(data.entries).toHaveLength(1)
  })
  it('handles no records', () => expect(buildClassHistory([], 'a').months).toEqual([]))
  it('does not penalize repeated musical practice', () => {
    const repeated = buildClassHealthData([day('2026-01-02'), day('2026-01-03')], { year: 2026, monthIndex: 0 })
    expect(repeated.classes[0].healthScore).toBe(100)
  })
})

import { buildStudentClassHistory } from '../classHistoryService.js'
it('links notes by ID and marks missed content for verification without asserting mastery', () => {
  const report = { entries: [{ id: 'x', date: '2026-09-01', content: 'Arco', attendance: [
    { alumno_id: 'a', estado: 'presente' }, { alumno_id: 'b', estado: 'ausente' },
  ] }] }
  const details = { x: { observaciones: [{ alumnoId: 'a', descripcion: 'Buen control' }, { alumnoId: 'b', descripcion: 'Revisar postura' }] } }
  expect(buildStudentClassHistory(report, { id: 'a' }, details).records[0]).toMatchObject({ notes: ['Buen control'], participation: 'Asistió: contenido grupal, dominio no evaluado' })
  expect(buildStudentClassHistory(report, { id: 'b' }, details).records[0].participation).toContain('pendiente de verificar')
  expect(buildStudentClassHistory(report, { id: 'c' }, details).records).toEqual([])
})

import { defaultClassHistoryRange } from '../classHistoryService.js'
it('defaults to three calendar months ending today in Santo Domingo', () => {
  expect(defaultClassHistoryRange(new Date('2026-10-20T15:00:00Z'))).toEqual({ from: '2026-07-20', to: '2026-10-20' })
  expect(defaultClassHistoryRange(new Date('2026-05-31T15:00:00Z'))).toEqual({ from: '2026-02-28', to: '2026-05-31' })
})

import { findStudentMention } from '../classHistoryService.js'
it('finds explicit names, preserves offsets, rejects ambiguous first names and partial words', () => {
  const a = { id: 'a', name: 'María Pérez' }
  expect(findStudentMention('María mejoró el arco', a, [a])).toEqual({ start: 0, end: 5 })
  expect(findStudentMention('María mejoró', a, [a, { name: 'María Díaz' }])).toBeNull()
  expect(findStudentMention('Mariana mejoró', a, [a])).toBeNull()
  expect(findStudentMention('MARIA PEREZ mejoró', a, [a, { name: 'María Díaz' }])).toEqual({ start: 0, end: 11 })
})

it('shows the teacher rating only for attendees, keeps 0 apart from unrated, and flags missing data', () => {
  const report = { entries: [
    { id: 's1', date: '2026-09-01', content: 'Arco', attendance: [] },
    { id: 's2', date: '2026-09-08', content: 'Escalas', attendance: [] },
    { id: 's3', date: '2026-09-15', content: 'Vibrato', attendance: [] },
  ] }
  const asis = (estado, valoracion) => ({ asistencias: [{ alumnoId: 'a', estado, valoracion }], observaciones: [], valoracionesDisponibles: true })
  const details = { s1: asis('presente', 0), s2: asis('tarde', null), s3: asis('ausente', 5) }
  const { records, ratingSummary } = buildStudentClassHistory(report, { id: 'a' }, details)
  expect(records.map(r => [r.ratingStatus, r.rating])).toEqual([['rated', 0], ['unrated', null], ['not_applicable', null]])
  expect(records[0].ratingText).toBe('0 estrellas')
  expect(records[1].ratingText).toBe('Sin evaluar')
  expect(records[2].ratingText).toContain('No aplica')
  expect(ratingSummary).toEqual({ rated: 1, unrated: 1, average: 0 })

  const missing = buildStudentClassHistory(report, { id: 'a' }, { s1: { asistencias: [{ alumnoId: 'a', estado: 'presente' }], observaciones: [], valoracionesDisponibles: false } })
  expect(missing.records[0].ratingStatus).toBe('unavailable')
  const noDetail = buildStudentClassHistory({ entries: [{ id: 'x', date: '2026-09-01', content: '', attendance: [{ alumno_id: 'a', estado: 'presente' }] }] }, { id: 'a' }, {})
  expect(noDetail.records[0].ratingStatus).toBe('unavailable')
})
