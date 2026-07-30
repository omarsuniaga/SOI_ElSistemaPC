import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { createPeriodSelector } from '../components/PeriodSelector.js'

vi.mock('../api/semesterTransition.js', () => ({
  getPeriods: vi.fn(),
}))

import { getPeriods } from '../api/semesterTransition.js'

const mockPeriods = [
  { id: 'p2', nombre: '2025-Q2', fecha_inicio: '2025-07-01', fecha_fin: '2025-12-31', activo: true, classCount: 10 },
  { id: 'p1', nombre: '2025-Q1', fecha_inicio: '2025-01-15', fecha_fin: '2025-06-30', activo: false, classCount: 8 },
  { id: 'p0', nombre: '2024-Q2', fecha_inicio: '2024-07-01', fecha_fin: '2024-12-31', activo: false, classCount: 12 },
]

function makeContainer() {
  const div = document.createElement('div')
  document.body.appendChild(div)
  return div
}

function cleanup(container) {
  document.body.removeChild(container)
}

describe('PeriodSelector', () => {
  let container

  beforeEach(() => {
    vi.clearAllMocks()
    container = makeContainer()
  })

  afterEach(() => {
    cleanup(container)
  })

  it('should render period list after load with name, date range, and class count', async () => {
    getPeriods.mockResolvedValue(mockPeriods)

    const selector = createPeriodSelector(container, { onChange: vi.fn() })
    await selector.load()

    const items = container.querySelectorAll('.ts-period-item')
    expect(items).toHaveLength(3)

    // First period shows name, date range, class count
    expect(items[0].textContent).toContain('2025-Q2')
    expect(items[0].textContent).toContain('2025-07-01')
    expect(items[0].textContent).toContain('10')
  })

  it('should mark the active period with a badge', async () => {
    getPeriods.mockResolvedValue(mockPeriods)

    const selector = createPeriodSelector(container, { onChange: vi.fn() })
    await selector.load()

    const items = container.querySelectorAll('.ts-period-item')
    const activeItem = items[0] // 2025-Q2 is activo: true
    expect(activeItem.querySelector('.ts-period-badge')).not.toBeNull()
    expect(activeItem.querySelector('.ts-period-badge').textContent).toContain('Activo')
  })

  it('should call onChange when a period is selected', async () => {
    getPeriods.mockResolvedValue(mockPeriods)
    const onChange = vi.fn()

    const selector = createPeriodSelector(container, { onChange })
    await selector.load()

    const items = container.querySelectorAll('.ts-period-item')
    items[1].click() // Click 2025-Q1

    expect(onChange).toHaveBeenCalledWith(mockPeriods[1])
  })

  it('should highlight the selected period', async () => {
    getPeriods.mockResolvedValue(mockPeriods)

    const selector = createPeriodSelector(container, { onChange: vi.fn() })
    await selector.load()

    let items = container.querySelectorAll('.ts-period-item')
    items[1].click()

    // Re-query after render rebuilds DOM
    items = container.querySelectorAll('.ts-period-item')
    expect(items[1].classList.contains('ts-period-selected')).toBe(true)
    expect(items[0].classList.contains('ts-period-selected')).toBe(false)
  })

  it('should display empty state message when no periods exist', async () => {
    getPeriods.mockResolvedValue([])

    const selector = createPeriodSelector(container, { onChange: vi.fn() })
    await selector.load()

    expect(container.querySelector('.ts-period-empty')).not.toBeNull()
    expect(container.querySelector('.ts-period-empty').textContent).toContain('No hay periodos')
  })

  it('should display error message when getPeriods fails', async () => {
    getPeriods.mockRejectedValue(new Error('Network error'))

    const selector = createPeriodSelector(container, { onChange: vi.fn() })
    await selector.load()

    expect(container.querySelector('.ts-period-error')).not.toBeNull()
    expect(container.querySelector('.ts-period-error').textContent).toContain('Error')
  })

  it('should return selected period via getSelected()', async () => {
    getPeriods.mockResolvedValue(mockPeriods)

    const selector = createPeriodSelector(container, { onChange: vi.fn() })
    await selector.load()

    expect(selector.getSelected()).toBeNull()

    const items = container.querySelectorAll('.ts-period-item')
    items[1].click()

    expect(selector.getSelected()).toEqual(mockPeriods[1])
  })

  it('should remove element from DOM on destroy()', async () => {
    getPeriods.mockResolvedValue(mockPeriods)

    const selector = createPeriodSelector(container, { onChange: vi.fn() })
    await selector.load()

    const el = selector.element
    expect(container.contains(el)).toBe(true)

    selector.destroy()
    expect(container.contains(el)).toBe(false)
  })
})
