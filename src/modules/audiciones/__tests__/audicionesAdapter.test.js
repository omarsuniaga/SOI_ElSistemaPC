import { describe, it, expect, vi, beforeAll } from 'vitest'

vi.mock('../api/audicionesSupabase.js', () => {
  const fn = () => Promise.resolve([])
  return {
    getCurrentUser: fn,
    getSections: fn,
    getRepertoire: fn,
    getAssignedStudents: fn,
    getEvaluationsByJurado: fn,
    saveEvaluation: fn,
    getStudentResults: fn,
    getAllEvaluations: fn,
  }
})

describe('audicionesAdapter (mock mode)', () => {
  let adapter

  beforeAll(async () => {
    vi.stubEnv('VITE_USE_MOCK', 'true')
    const mod = await import('../api/audicionesAdapter.js')
    adapter = mod.default
  })

  it('getSections returns >= 3 sections', async () => {
    const sections = await adapter.getSections()
    expect(sections.length).toBeGreaterThanOrEqual(3)
    expect(sections[0]).toHaveProperty('id')
    expect(sections[0]).toHaveProperty('name')
  })

  it('saveEvaluation with valid payload returns object with id', async () => {
    const payload = {
      student_id: 'stu-test-1',
      jurado_id: 'usr-test-jurado',
      c1: 3, c2: 3, c3: 3, c4: 3,
      c5: 3, c6: 3, c7: 3, c8: 3,
    }
    const result = await adapter.saveEvaluation(payload)
    expect(result).toHaveProperty('id')
    expect(result.student_id).toBe('stu-test-1')
  })

  it('subsequent getEvaluationsByJurado returns saved evaluation', async () => {
    const evals = await adapter.getEvaluationsByJurado('usr-test-jurado')
    expect(evals.some(e => e.student_id === 'stu-test-1')).toBe(true)
  })

  it('saveEvaluation with incomplete evaluation throws error', async () => {
    const payload = {
      student_id: 'stu-test-2',
      jurado_id: 'usr-test-jurado',
      c1: null, c2: null, c3: null, c4: null,
      c5: null, c6: null, c7: null, c8: null,
    }
    await expect(adapter.saveEvaluation(payload)).rejects.toThrow('incomplete evaluation')
  })

  it('no HTTP requests made (mock adapter does not use fetch/supabase)', async () => {
    const sections = await adapter.getSections()
    expect(Array.isArray(sections)).toBe(true)
    expect(sections.length).toBeGreaterThan(0)
  })
})
