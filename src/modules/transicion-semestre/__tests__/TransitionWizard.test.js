import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { createTransitionWizard } from '../components/TransitionWizard.js'

vi.mock('../api/semesterTransition.js', () => ({
  getPeriods: vi.fn(),
  getTransitionPreview: vi.fn(),
  validateConflicts: vi.fn(),
  cloneClasses: vi.fn(),
  bulkEnrollStudents: vi.fn(),
}))

vi.mock('../api/studentClassifier.js', () => ({
  getSourceStudents: vi.fn(),
  fuzzySearch: vi.fn(),
  getInstrumentFacets: vi.fn(),
}))

import { getPeriods, getTransitionPreview, cloneClasses, bulkEnrollStudents } from '../api/semesterTransition.js'
import { getSourceStudents, getInstrumentFacets } from '../api/studentClassifier.js'

const mockPeriods = [
  { id: 'p2', nombre: '2025-Q2', fecha_inicio: '2025-07-01', fecha_fin: '2025-12-31', activo: true, classCount: 0 },
  { id: 'p1', nombre: '2025-Q1', fecha_inicio: '2025-01-15', fecha_fin: '2025-06-30', activo: false, classCount: 8 },
]

const mockPreview = {
  toCreate: [
    { id: 'c1', nombre: 'Piano I', instrumento: 'Piano', maestro_principal_id: 'm1', capacidad_maxima: 15, horarios: [{ dia: 'lunes', hora_inicio: '08:00', hora_fin: '10:00' }] },
    { id: 'c2', nombre: 'Guitarra I', instrumento: 'Guitarra', maestro_principal_id: 'm2', capacidad_maxima: 10, horarios: [{ dia: 'martes', hora_inicio: '10:00', hora_fin: '12:00' }] },
  ],
  toSkip: [],
  existingInTarget: 0,
}

function makeContainer() {
  const div = document.createElement('div')
  document.body.appendChild(div)
  return div
}

function cleanup(container) {
  document.body.removeChild(container)
}

/**
 * Select periods in the wizard by targeting the correct column containers.
 * Source column = first .ts-period-column, Target = second.
 * Clicks the item at the given index in each column, re-querying after each click.
 */
function selectPeriods(container, sourceIndex, targetIndex) {
  // Source column
  const sourceCol = container.querySelector('.ts-period-column')
  let sourceItems = sourceCol.querySelectorAll('.ts-period-item')
  sourceItems[sourceIndex].click()

  // Target column (re-query after source re-render)
  const targetCol = container.querySelectorAll('.ts-period-column')[1]
  const targetItems = targetCol.querySelectorAll('.ts-period-item')
  targetItems[targetIndex].click()
}

describe('TransitionWizard', () => {
  let container

  beforeEach(() => {
    vi.clearAllMocks()
    container = makeContainer()
    getPeriods.mockResolvedValue(mockPeriods)
    getTransitionPreview.mockResolvedValue(mockPreview)
    getSourceStudents.mockResolvedValue([])
    getInstrumentFacets.mockReturnValue([])
    cloneClasses.mockResolvedValue({ created: mockPreview.toCreate, skipped: [], errors: [] })
    bulkEnrollStudents.mockResolvedValue({ enrolled: 0, skipped: 0, errors: [] })
  })

  afterEach(() => {
    cleanup(container)
  })

  it('should render step indicator showing 4 steps on init', () => {
    const wizard = createTransitionWizard(container)

    const steps = container.querySelectorAll('.ts-step-indicator')
    expect(steps).toHaveLength(4)

    wizard.destroy()
  })

  it('should show step 1 (period selection) as active initially', () => {
    const wizard = createTransitionWizard(container)

    const activeStep = container.querySelector('.ts-step-indicator.ts-step-active')
    expect(activeStep).not.toBeNull()
    expect(activeStep.textContent).toContain('Periodo')

    // Step 1 content should be visible
    expect(container.querySelector('.ts-step-periods')).not.toBeNull()

    wizard.destroy()
  })

  it('should block Next when no source period is selected', async () => {
    const wizard = createTransitionWizard(container)

    // Wait for periods to load
    await new Promise(r => setTimeout(r, 0))

    const nextBtn = container.querySelector('.ts-next-btn')
    nextBtn.click()

    // Should still be on step 1
    expect(container.querySelector('.ts-step-periods')).not.toBeNull()

    wizard.destroy()
  })

  it('should advance to step 2 when both periods are selected and Next is clicked', async () => {
    const wizard = createTransitionWizard(container)

    await new Promise(r => setTimeout(r, 0))

    // Select source period (2025-Q1 at index 1) and target (2025-Q2 at index 0)
    selectPeriods(container, 1, 0)

    container.querySelector('.ts-next-btn').click()
    await new Promise(r => setTimeout(r, 0))

    // Should now show step 2
    expect(container.querySelector('.ts-step-preview')).not.toBeNull()

    wizard.destroy()
  })

  it('should go back to step 1 when Back is clicked from step 2', async () => {
    const wizard = createTransitionWizard(container)

    await new Promise(r => setTimeout(r, 0))

    selectPeriods(container, 1, 0)

    container.querySelector('.ts-next-btn').click()
    await new Promise(r => setTimeout(r, 0))

    expect(container.querySelector('.ts-step-preview')).not.toBeNull()

    container.querySelector('.ts-back-btn').click()

    expect(container.querySelector('.ts-step-periods')).not.toBeNull()

    wizard.destroy()
  })

  it('should update step indicator active state when navigating', async () => {
    const wizard = createTransitionWizard(container)

    await new Promise(r => setTimeout(r, 0))

    // Step 1 is active
    let indicators = container.querySelectorAll('.ts-step-indicator')
    expect(indicators[0].classList.contains('ts-step-active')).toBe(true)

    selectPeriods(container, 1, 0)
    container.querySelector('.ts-next-btn').click()
    await new Promise(r => setTimeout(r, 0))

    // Re-query indicators after render rebuild
    indicators = container.querySelectorAll('.ts-step-indicator')
    expect(indicators[0].classList.contains('ts-step-completed')).toBe(true)
    expect(indicators[1].classList.contains('ts-step-active')).toBe(true)

    wizard.destroy()
  })

  it('should show class preview in step 2', async () => {
    const wizard = createTransitionWizard(container)

    await new Promise(r => setTimeout(r, 0))

    selectPeriods(container, 1, 0)

    container.querySelector('.ts-next-btn').click()
    await new Promise(r => setTimeout(r, 0))

    const classItems = container.querySelectorAll('.ts-class-row')
    expect(classItems).toHaveLength(2)
    expect(classItems[0].textContent).toContain('Piano I')
    expect(classItems[1].textContent).toContain('Guitarra I')

    wizard.destroy()
  })

  it('should block step 3 when no classes are selected', async () => {
    const wizard = createTransitionWizard(container)

    await new Promise(r => setTimeout(r, 0))

    selectPeriods(container, 1, 0)

    container.querySelector('.ts-next-btn').click()
    await new Promise(r => setTimeout(r, 0))

    // Deselect all classes
    const classCheckboxes = container.querySelectorAll('.ts-class-check')
    classCheckboxes.forEach(cb => { cb.checked = false; cb.dispatchEvent(new Event('change')) })

    container.querySelector('.ts-next-btn').click()

    // Should still be on step 2
    expect(container.querySelector('.ts-step-preview')).not.toBeNull()

    wizard.destroy()
  })

  it('should remove element from DOM on destroy()', () => {
    const wizard = createTransitionWizard(container)

    const el = wizard.element
    expect(container.contains(el)).toBe(true)

    wizard.destroy()
    expect(container.contains(el)).toBe(false)
  })
})
