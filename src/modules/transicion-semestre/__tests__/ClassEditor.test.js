import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { createClassEditor } from '../components/ClassEditor.js'

vi.mock('../api/semesterTransition.js', () => ({
  validateConflicts: vi.fn(),
}))

import { validateConflicts } from '../api/semesterTransition.js'

const mockClassData = {
  id: 'c1',
  nombre: 'Piano I',
  instrumento: 'Piano',
  maestro_principal_id: 'm1',
  capacidad_maxima: 15,
  horarios: [
    { dia: 'lunes', hora_inicio: '08:00', hora_fin: '10:00', salon_id: 's1' },
  ],
}

function makeContainer() {
  const div = document.createElement('div')
  document.body.appendChild(div)
  return div
}

function cleanup(container) {
  document.body.removeChild(container)
}

describe('ClassEditor', () => {
  let container

  beforeEach(() => {
    vi.clearAllMocks()
    container = makeContainer()
    validateConflicts.mockResolvedValue([])
  })

  afterEach(() => {
    cleanup(container)
  })

  it('should render class name and editable fields', () => {
    const editor = createClassEditor(container, {
      classData: mockClassData,
      onSave: vi.fn(),
      onCancel: vi.fn(),
    })

    expect(container.querySelector('.ts-editor-name').textContent).toContain('Piano I')

    const capacityInput = container.querySelector('.ts-capacity-input')
    expect(capacityInput).not.toBeNull()
    expect(capacityInput.value).toBe('15')

    editor.destroy()
  })

  it('should call onCancel when cancel button is clicked', () => {
    const onCancel = vi.fn()
    const editor = createClassEditor(container, {
      classData: mockClassData,
      onSave: vi.fn(),
      onCancel,
    })

    container.querySelector('.ts-cancel-btn').click()

    expect(onCancel).toHaveBeenCalled()
    editor.destroy()
  })

  it('should call onSave with updated data when save button is clicked', async () => {
    const onSave = vi.fn().mockResolvedValue()
    const editor = createClassEditor(container, {
      classData: mockClassData,
      onSave,
      onCancel: vi.fn(),
    })

    // Change capacity
    const capacityInput = container.querySelector('.ts-capacity-input')
    capacityInput.value = '20'
    capacityInput.dispatchEvent(new Event('input'))

    container.querySelector('.ts-save-btn').click()

    // Wait for async conflict validation
    await new Promise(r => setTimeout(r, 0))

    expect(onSave).toHaveBeenCalledWith(
      expect.objectContaining({
        id: 'c1',
        capacidad_maxima: '20',
      })
    )

    editor.destroy()
  })

  it('should display conflict badge when conflicts are detected', async () => {
    validateConflicts.mockResolvedValue([
      {
        classId: 'c1',
        type: 'teacher',
        conflictingClass: 'Canto A',
        detail: 'Maestro asignado a "Canto A"',
        timeSlot: 'lunes 08:00-10:00',
      },
    ])

    const editor = createClassEditor(container, {
      classData: mockClassData,
      onSave: vi.fn(),
      onCancel: vi.fn(),
    })

    container.querySelector('.ts-save-btn').click()
    await new Promise(r => setTimeout(r, 0))

    expect(container.querySelector('.ts-conflict-badge')).not.toBeNull()
    expect(container.querySelector('.ts-conflict-badge').textContent).toContain('Maestro asignado')

    editor.destroy()
  })

  it('should block save when unresolved conflicts exist', async () => {
    validateConflicts.mockResolvedValue([
      { classId: 'c1', type: 'room', conflictingClass: 'Guitarra A', detail: 'Salon ocupado', timeSlot: 'lunes 08:00-10:00' },
    ])

    const onSave = vi.fn()
    const editor = createClassEditor(container, {
      classData: mockClassData,
      onSave,
      onCancel: vi.fn(),
    })

    container.querySelector('.ts-save-btn').click()
    await new Promise(r => setTimeout(r, 0))

    expect(onSave).not.toHaveBeenCalled()

    editor.destroy()
  })

  it('should show conflict count in save button when conflicts exist', async () => {
    validateConflicts.mockResolvedValue([
      { classId: 'c1', type: 'teacher', conflictingClass: 'Canto A', detail: 'Teacher conflict', timeSlot: 'lunes 08:00-10:00' },
      { classId: 'c1', type: 'room', conflictingClass: 'Guitarra B', detail: 'Room conflict', timeSlot: 'lunes 08:00-10:00' },
    ])

    const editor = createClassEditor(container, {
      classData: mockClassData,
      onSave: vi.fn(),
      onCancel: vi.fn(),
    })

    container.querySelector('.ts-save-btn').click()
    await new Promise(r => setTimeout(r, 0))

    expect(container.querySelector('.ts-save-btn').textContent).toContain('2')

    editor.destroy()
  })

  it('should remove element from DOM on destroy()', () => {
    const editor = createClassEditor(container, {
      classData: mockClassData,
      onSave: vi.fn(),
      onCancel: vi.fn(),
    })

    const el = editor.element
    expect(container.contains(el)).toBe(true)

    editor.destroy()
    expect(container.contains(el)).toBe(false)
  })
})
