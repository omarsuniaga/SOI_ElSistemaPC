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
