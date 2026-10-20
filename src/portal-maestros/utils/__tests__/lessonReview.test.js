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
  describe('fallback split by explicit mentions', () => {
    const group = [
      { id: 'g', nombre_completo: 'Gerali Denisse Lugo Batista' },
      { id: 'le', nombre_completo: 'Lesly Ramírez Leonardo' },
      { id: 'sa', nombre_completo: 'Santa Isaura Castillo Diaz' },
      { id: 'ye', nombre_completo: 'Yereni Esther Germain Michel' },
    ]
    const att = { g: 'P', le: 'P', sa: 'P', ye: 'P' }
    const text = '#Gerali Denisse Lugo Batista ha perdido agilidad. #Lesly Ramírez Leonardo esta mejorando. ' +
      '#Santa Isaura Castillo Diaz y #Yereni Esther Germain Michel estan ganando afinacion. #todos tienen problemas en la proyeccion.'

    it('gives each student only their own sentence instead of repeating the whole text', () => {
      const review = fallbackLessonReview(text, '', group)
      expect(review.blocks.map(b => b.studentIds)).toEqual([['g'], ['le'], ['sa', 'ye'], []])
      expect(review.blocks[3].scope).toBe('presentes')
      const dsl = buildConfirmedLesson(review.blocks, group, att)
      const lines = dsl.split('\n')
      expect(lines).toHaveLength(5)
      expect(lines.filter(l => l.includes('ha perdido agilidad'))).toHaveLength(1)
      expect(lines.filter(l => l.includes('mejorando'))).toHaveLength(1)
      expect(lines[0]).toMatch(/^#Gerali Denisse Lugo Batista /)
      expect(lines.at(-1)).toMatch(/^#todos /)
    })
    it('covers every letter of the original so the review stays lossless', () => {
      const review = fallbackLessonReview(text, '', group)
      const sources = review.blocks.map(b => b.source).join('')
      expect(sources.replace(/\s/g, '')).toBe(text.replace(/\s/g, ''))
    })
    it('keeps text before the first mention as an unassigned block', () => {
      const review = fallbackLessonReview('Clase muy buena. #Lesly Ramírez Leonardo avanza.', '', group)
      expect(review.blocks).toHaveLength(2)
      expect(review.blocks[0]).toMatchObject({ studentIds: [], scope: 'seleccionar' })
      expect(review.blocks[1].studentIds).toEqual(['le'])
    })
    it('ignores unknown names and keeps one block when nothing can be resolved', () => {
      expect(fallbackLessonReview('#Desconocido hizo algo.', '', group).blocks).toHaveLength(1)
    })
    it('matches names without regard to accents or case', () => {
      expect(fallbackLessonReview('#lesly ramirez leonardo avanza.', '', group).blocks[0].studentIds).toEqual(['le'])
    })
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
