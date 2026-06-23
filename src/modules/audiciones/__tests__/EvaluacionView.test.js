import { describe, it, expect, vi, beforeAll } from 'vitest'
import { createEvaluacionView } from '../views/EvaluacionView.js'

const mockStudents = [
  { id: 'stu-1', full_name: 'Ana García', section_id: 'sec-1' },
  { id: 'stu-2', full_name: 'Bruno López', section_id: 'sec-2' },
]

const mockEval = {
  id: 'eval-1',
  student_id: 'stu-1',
  jurado_id: 'usr-jurado-1',
  c1: 3, c2: 4, c3: 3, c4: 4,
  c5: 3, c6: 4, c7: 3, c8: 4,
}

const mockAdapter = {
  getAssignedStudents: vi.fn().mockResolvedValue(mockStudents),
  getEvaluationsByJurado: vi.fn().mockResolvedValue([mockEval]),
  saveEvaluation: vi.fn().mockResolvedValue({ id: 'eval-new', ...mockEval }),
}

describe('EvaluacionView', () => {
  let container

  beforeAll(() => {
    container = document.createElement('div')
    createEvaluacionView(container, mockAdapter)
  })

  it('loads students and evaluations on mount', () => {
    expect(mockAdapter.getAssignedStudents).toHaveBeenCalledWith('usr-jurado-1')
    expect(mockAdapter.getEvaluationsByJurado).toHaveBeenCalledWith('usr-jurado-1')
  })

  it('renders student list with cards', () => {
    const buttons = container.querySelectorAll('[data-student-id]')
    expect(buttons.length).toBe(2)
    expect(buttons[0].textContent).toContain('Ana García')
    expect(buttons[1].textContent).toContain('Bruno López')
  })

  it('renders evaluation form area with placeholder text', () => {
    expect(container.querySelector('#evaluation-form')).toBeTruthy()
    expect(container.querySelector('#evaluation-form').textContent).toContain('Selecciona')
  })

  it('clicking a student card loads their evaluation into form', () => {
    const btn = container.querySelector('[data-student-id="stu-1"]')
    btn.click()
    const selects = container.querySelectorAll('[data-key]')
    expect(selects.length).toBe(8)
  })

  it('save button is present', () => {
    const saveBtn = container.querySelector('button[type="submit"]')
    expect(saveBtn).toBeTruthy()
    expect(saveBtn.textContent).toContain('Guardar')
  })
})
