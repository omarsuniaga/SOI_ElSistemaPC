import { describe, it, expect } from 'vitest'
import { buildConfirmedLesson, validateLessonReview, fallbackLessonReview, attendanceSignature } from '../lessonReview.js'
const roster = [
  { id: 's', nombre: 'Samuel Sosa' }, { id: 'a', nombre: 'Sara Pérez' },
  { id: 'l', nombre: 'Luis Rojas' }, { id: 's2', nombre: 'Samuel Pérez' },
]
const attendance = { s: 'P', a: 'T', l: 'A', s2: 'J' }
const original = 'Samuel y Sara lograron la escala, pero Luis no pudo.'
const blocks = [
  { source: 'Samuel y Sara lograron la escala,', text: 'Samuel y Sara lograron la escala.', kind: 'observacion', scope: 'seleccionar', studentIds: ['s', 'a'] },
  { source: 'pero Luis no pudo.', text: 'Luis no pudo.', kind: 'sugerencia', scope: 'seleccionar', studentIds: ['l'] },
]
describe('lesson review guardrails', () => {
  it('separates opposite evidence without inventing a grade', () => {
    const review = validateLessonReview(original, { blocks }, roster)
    expect(review.blocks).toHaveLength(2)
    expect(review.blocks[0]).not.toHaveProperty('nota')
    expect(review.blocks[1].text).toContain('no pudo')
  })
  it('rejects a response that drops the negative clause', () => {
    expect(() => validateLessonReview(original, { blocks: [blocks[0]] }, roster)).toThrow(/omitió/)
  })
  it('rejects invented evidence and foreign IDs', () => {
    expect(() => validateLessonReview(original, { blocks: [{ ...blocks[0], source: 'inventado' }] }, roster)).toThrow()
    expect(() => validateLessonReview(original, { blocks: [{ ...blocks[0], studentIds: ['foreign'] }, blocks[1]] }, roster)).toThrow(/fuera/)
  })
  it('requires explicit recipients and excludes absent and justified students', () => {
    expect(() => buildConfirmedLesson([blocks[1]], roster, attendance)).toThrow(/presentes/)
    expect(() => buildConfirmedLesson([{ ...blocks[0], studentIds: ['s2'] }], roster, attendance)).toThrow()
    expect(() => buildConfirmedLesson([{ ...blocks[0], studentIds: [] }], roster, attendance)).toThrow(/Confirma/)
  })
  it('serializes individual comments separately and without numeric assessment', () => {
    const dsl = buildConfirmedLesson([blocks[0]], roster, attendance)
    expect(dsl.split('\n')).toHaveLength(2)
    expect(dsl).toContain('#Samuel Sosa')
    expect(dsl).toContain('#Sara Pérez')
    expect(dsl).not.toContain('#Luis')
    expect(dsl).not.toContain('/5')
  })
  it('uses the existing collective token only after teacher confirmation', () => {
    expect(buildConfirmedLesson([{ ...blocks[0], kind: 'contenido', scope: 'presentes', text: 'Escala de Do' }], roster, attendance))
      .toBe('#todos [Escala de Do]')
    expect(() => buildConfirmedLesson([{ ...blocks[0], scope: 'presentes' }], roster, {})).toThrow()
  })
  it('retains the complete original in demo/offline fallback', () => {
    expect(fallbackLessonReview(original).blocks[0]).toMatchObject({ text: original, scope: 'seleccionar', studentIds: [] })
  })
  it('handles emoji offsets and rejects stale attendance snapshots', () => {
    const text = '🎻 Hoy escalas.'
    expect(validateLessonReview(text, { blocks: [{ source: text, text, kind: 'contenido' }] }, roster).blocks).toHaveLength(1)
    expect(attendanceSignature(roster, attendance)).not.toBe(attendanceSignature(roster, { ...attendance, l: 'P' }))
  })
  it('keeps no recipients implicit for an empty roster', () => {
    expect(() => buildConfirmedLesson([{ text: 'Escala', kind: 'contenido', scope: 'presentes' }], [], {})).toThrow()
  })
})
