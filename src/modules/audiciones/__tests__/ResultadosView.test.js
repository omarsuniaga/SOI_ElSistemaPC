import { describe, it, expect, vi, beforeAll } from 'vitest'
import { createResultadosView } from '../views/ResultadosView.js'

const mockResults = [
  { student_id: 'stu-1', student_name: 'Ana García', section_name: 'Violines I', avg_score: 3.0, group: 'B' },
  { student_id: 'stu-3', student_name: 'Carla Martín', section_name: 'Violines I', avg_score: 4.0, group: 'A' },
]

const mockAdapter = {
  getStudentResults: vi.fn().mockResolvedValue(mockResults),
}

describe('ResultadosView', () => {
  let container

  beforeAll(() => {
    container = document.createElement('div')
    createResultadosView(container, mockAdapter)
  })

  it('loads results on mount', () => {
    expect(mockAdapter.getStudentResults).toHaveBeenCalledOnce()
  })

  it('renders table with student rows', () => {
    const rows = container.querySelectorAll('tbody tr')
    expect(rows.length).toBe(2)
    expect(rows[0].textContent).toContain('Ana García')
    expect(rows[1].textContent).toContain('Carla Martín')
  })

  it('renders group badge with correct color class', () => {
    const badges = container.querySelectorAll('tbody .badge')
    expect(badges.length).toBe(2)
    expect(badges[0].className).toContain('bg-primary')
    expect(badges[1].className).toContain('bg-success')
  })

  it('shows — for null avg_score or group', async () => {
    const adapterWithNull = { getStudentResults: vi.fn().mockResolvedValue([
      { student_id: 'stu-x', student_name: 'Test', section_name: 'X', avg_score: null, group: null },
    ])}
    const c2 = document.createElement('div')
    createResultadosView(c2, adapterWithNull)
    await vi.waitFor(() => {
      expect(c2.textContent).toContain('—')
    })
  })

  it('renders export CSV button', async () => {
    const btn = container.querySelector('#export-csv')
    expect(btn).toBeTruthy()
    expect(btn.textContent).toContain('Exportar')
  })

  it('handles error from adapter gracefully', async () => {
    const errorAdapter = { getStudentResults: vi.fn().mockRejectedValue(new Error('fail')) }
    const c3 = document.createElement('div')
    createResultadosView(c3, errorAdapter)
    await vi.waitFor(() => {
      expect(c3.querySelector('.alert-danger')).toBeTruthy()
    })
  })
})
