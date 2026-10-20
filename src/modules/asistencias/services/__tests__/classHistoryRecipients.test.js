import { describe, it, expect } from 'vitest'
import { studentLessonContent } from '../classHistoryService.js'
describe('confirmed lesson recipients in class history', () => {
  const content = '#todos [Escala de Do]\n#Samuel Sosa Logró la escala.\n#Sara Pérez (Reforzar cambios de arco)';
  it('keeps common content and only the selected individual comment', () => {
    expect(studentLessonContent(content, { name: 'Samuel Sosa' })).toContain('[Escala de Do]')
    expect(studentLessonContent(content, { name: 'Samuel Sosa' })).not.toContain('Reforzar')
    expect(studentLessonContent(content, { name: 'Sara Pérez' })).not.toContain('Logró')
  })
  it('does not attribute tagged participation content to absentees', () => {
    expect(studentLessonContent(content, { name: 'Samuel Sosa' }, false)).toBe('')
  })
  it('preserves legacy untagged content without reinterpreting it', () => {
    expect(studentLessonContent('Hoy se practicó arco.', { name: 'Samuel Sosa' })).toBe('Hoy se practicó arco.')
  })
})
