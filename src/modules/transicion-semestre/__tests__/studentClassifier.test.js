import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { createStudentClassifier } from '../components/StudentClassifier.js'

vi.mock('../api/studentClassifier.js', () => ({
  fuzzySearch: vi.fn(),
  getInstrumentFacets: vi.fn(),
}))

import { fuzzySearch, getInstrumentFacets } from '../api/studentClassifier.js'

const mockStudents = [
  { id: 's1', nombre_completo: 'Juan Garcia', cedula: '402-1234567-8', telefono: '809-555-1234', instrumento_principal: 'Piano' },
  { id: 's2', nombre_completo: 'Maria Lopez', cedula: '402-9876543-2', telefono: '809-555-5678', instrumento_principal: 'Violin' },
  { id: 's3', nombre_completo: 'Pedro Rodriguez', cedula: '402-1112223-4', telefono: '809-555-9012', instrumento_principal: 'Guitarra' },
  { id: 's4', nombre_completo: 'Ana Martinez', cedula: '402-4445556-7', telefono: '809-555-3456', instrumento_principal: 'Piano' },
]

const mockFacets = [
  { instrumento: 'Piano', count: 2 },
  { instrumento: 'Violin', count: 1 },
  { instrumento: 'Guitarra', count: 1 },
]

function makeContainer() {
  const div = document.createElement('div')
  document.body.appendChild(div)
  return div
}

function cleanup(container) {
  document.body.removeChild(container)
}

describe('StudentClassifier', () => {
  let container

  beforeEach(() => {
    vi.clearAllMocks()
    container = makeContainer()
    // Default: fuzzySearch returns all students unfiltered
    fuzzySearch.mockImplementation((query, students) => {
      if (!query || query.trim() === '') return [...students]
      return students.filter(s => s.nombre_completo.toLowerCase().includes(query.toLowerCase()))
    })
    getInstrumentFacets.mockReturnValue(mockFacets)
  })

  afterEach(() => {
    cleanup(container)
  })

  it('should render all students with checkboxes', () => {
    const classifier = createStudentClassifier(container, {
      students: mockStudents,
      onSelectionChange: vi.fn(),
    })

    const checkboxes = container.querySelectorAll('.ts-student-check')
    expect(checkboxes).toHaveLength(4)

    classifier.destroy()
  })

  it('should call fuzzySearch when search input changes', () => {
    const classifier = createStudentClassifier(container, {
      students: mockStudents,
      onSelectionChange: vi.fn(),
    })

    const input = container.querySelector('.ts-search-input')
    input.value = 'Juan'
    input.dispatchEvent(new Event('input'))

    expect(fuzzySearch).toHaveBeenCalledWith('Juan', mockStudents, expect.objectContaining({
      filters: expect.any(Object),
    }))

    classifier.destroy()
  })

  it('should render instrument filter dropdown from facets', () => {
    const classifier = createStudentClassifier(container, {
      students: mockStudents,
      onSelectionChange: vi.fn(),
    })

    const select = container.querySelector('.ts-instrument-filter')
    expect(select).not.toBeNull()

    const options = select.querySelectorAll('option')
    // "Todos" + 3 instruments
    expect(options).toHaveLength(4)
    expect(options[0].textContent).toContain('Todos')

    classifier.destroy()
  })

  it('should call onSelectionChange when a student checkbox is toggled', () => {
    const onSelectionChange = vi.fn()
    const classifier = createStudentClassifier(container, {
      students: mockStudents,
      onSelectionChange,
    })

    const checkboxes = container.querySelectorAll('.ts-student-check')
    checkboxes[0].click()

    expect(onSelectionChange).toHaveBeenCalled()
    const selected = classifier.getSelected()
    expect(selected).toContain('s1')

    classifier.destroy()
  })

  it('should toggle all visible students with select-all checkbox', () => {
    const onSelectionChange = vi.fn()
    const classifier = createStudentClassifier(container, {
      students: mockStudents,
      onSelectionChange,
    })

    const selectAll = container.querySelector('.ts-select-all')
    selectAll.click()

    const selected = classifier.getSelected()
    expect(selected).toHaveLength(4)
    expect(selected).toContain('s1')
    expect(selected).toContain('s4')

    classifier.destroy()
  })

  it('should show indeterminate state on select-all when some but not all are checked', () => {
    const classifier = createStudentClassifier(container, {
      students: mockStudents,
      onSelectionChange: vi.fn(),
    })

    const checkboxes = container.querySelectorAll('.ts-student-check')
    checkboxes[0].click()
    checkboxes[1].click()

    const selectAll = container.querySelector('.ts-select-all')
    expect(selectAll.indeterminate).toBe(true)
    expect(selectAll.checked).toBe(false)

    classifier.destroy()
  })

  it('should show all checked state when every student is selected', () => {
    const classifier = createStudentClassifier(container, {
      students: mockStudents,
      onSelectionChange: vi.fn(),
    })

    const selectAll = container.querySelector('.ts-select-all')
    selectAll.click()

    expect(selectAll.checked).toBe(true)
    expect(selectAll.indeterminate).toBe(false)

    classifier.destroy()
  })

  it('should display empty message when no students match search', () => {
    fuzzySearch.mockReturnValue([])

    const classifier = createStudentClassifier(container, {
      students: mockStudents,
      onSelectionChange: vi.fn(),
    })

    const input = container.querySelector('.ts-search-input')
    input.value = 'xyzzy'
    input.dispatchEvent(new Event('input'))

    expect(container.querySelector('.ts-no-results')).not.toBeNull()
    expect(container.querySelector('.ts-no-results').textContent).toContain('No hay alumnos')

    classifier.destroy()
  })

  it('should remove element from DOM on destroy()', () => {
    const classifier = createStudentClassifier(container, {
      students: mockStudents,
      onSelectionChange: vi.fn(),
    })

    const el = classifier.element
    expect(container.contains(el)).toBe(true)

    classifier.destroy()
    expect(container.contains(el)).toBe(false)
  })
})
