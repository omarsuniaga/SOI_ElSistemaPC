import { describe, it, expect } from 'vitest'
import { aggregateResults } from '../domain/aggregation.js'

const sections = [
  { id: 'sec-1', name: 'Cuerdas' },
  { id: 'sec-2', name: 'Vientos' },
]

const students = [
  { id: 'stu-1', name: 'Ana García', section_id: 'sec-1' },
  { id: 'stu-2', name: 'Bruno López', section_id: 'sec-2' },
  { id: 'stu-3', name: 'Carla Martín', section_id: 'sec-1' },
]

const evaluacionAlta = {
  student_id: 'stu-1',
  jurado_id: 'usr-jurado-1',
  c1: 4, c2: 4, c3: 4, c4: 4,
  c5: 4, c6: 4, c7: 4, c8: 4,
}

const evaluacionMedia = {
  student_id: 'stu-1',
  jurado_id: 'usr-jurado-2',
  c1: 3, c2: 3, c3: 3, c4: 3,
  c5: 3, c6: 3, c7: 3, c8: 3,
}

const evaluacionBaja = {
  student_id: 'stu-2',
  jurado_id: 'usr-jurado-1',
  c1: 2, c2: 2, c3: 2, c4: 2,
  c5: 2, c6: 2, c7: 2, c8: 2,
}

describe('aggregateResults', () => {
  it('aggregates two jurado evaluations for one student (mean of scores)', () => {
    const evals = [evaluacionAlta, evaluacionMedia]
    const results = aggregateResults(evals, students, sections)

    expect(results).toHaveLength(1)
    expect(results[0].student_id).toBe('stu-1')
    expect(results[0].student_name).toBe('Ana García')
    expect(results[0].section_name).toBe('Cuerdas')
    expect(results[0].avg_score).toBe(28)
    expect(results[0].group).toBe('A')
    expect(results[0].jurado_count).toBe(2)
  })

  it('assigns correct group via assignGroup(avg_score)', () => {
    const evals = [evaluacionBaja]
    const results = aggregateResults(evals, students, sections)

    expect(results[0].student_id).toBe('stu-2')
    expect(results[0].avg_score).toBe(16)
    expect(results[0].group).toBe('C')
  })

  it('sorts by section name ASC, then group ASC, then score DESC', () => {
    const extraStudent = { id: 'stu-3', name: 'Carla Martín', section_id: 'sec-1' }
    const extraEval = {
      student_id: 'stu-3',
      jurado_id: 'usr-jurado-3',
      c1: 1, c2: 1, c3: 1, c4: 1,
      c5: 1, c6: 1, c7: 1, c8: 1,
    }
    const results = aggregateResults([evaluacionAlta, evaluacionBaja, extraEval], [students[0], students[1], extraStudent], sections)

    expect(results).toHaveLength(3)
    expect(results[0].student_name).toBe('Ana García')
    expect(results[0].section_name).toBe('Cuerdas')
    expect(results[1].student_name).toBe('Carla Martín')
    expect(results[1].section_name).toBe('Cuerdas')
    expect(results[2].student_name).toBe('Bruno López')
    expect(results[2].section_name).toBe('Vientos')
    expect(results[0].avg_score).toBeGreaterThan(results[1].avg_score)
  })

  it('returns empty array when evaluations is empty', () => {
    const results = aggregateResults([], students, sections)
    expect(results).toEqual([])
  })

  it('excludes students with no evaluations', () => {
    const evals = [evaluacionAlta]
    const results = aggregateResults(evals, students, sections)
    expect(results).toHaveLength(1)
    expect(results.every(r => r.student_id !== 'stu-3')).toBe(true)
  })
})
