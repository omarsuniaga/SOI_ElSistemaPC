import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('../../styles/salones.css', () => ({}))
vi.mock('../../../shared/components/AppModal.js', () => ({
  AppModal: { open: vi.fn(), close: vi.fn() },
}))
vi.mock('../../../shared/components/AppToast.js', () => ({
  AppToast: { progress: vi.fn(), success: vi.fn(), error: vi.fn(), warning: vi.fn() },
}))
vi.mock('../../../shared/components/ViewInfoModal.js', () => ({
  renderViewInfoButton: vi.fn(() => '<button id="btnInfo">Info</button>'),
  attachViewInfoEvents: vi.fn(),
}))

vi.mock('../../api/salonesApi.js', () => ({
  obtenerSalones: vi.fn().mockResolvedValue([]),
  crearSalon: vi.fn(),
  actualizarSalon: vi.fn(),
  eliminarSalon: vi.fn(),
  inactivarSalon: vi.fn(),
}))

import { renderSalonesView } from '../salonesView.js'
import { obtenerSalones } from '../../api/salonesApi.js'
import { useSalones } from '../../hooks/useSalones.js'

describe('salonesView 4-card desktop grid and mobile adaptation', () => {
  let container

  beforeEach(() => {
    document.body.innerHTML = ''
    container = document.createElement('div')
    document.body.appendChild(container)
    useSalones.salones = []
  })

  it('renders the grid with 4 cards per row for desktop and 1 for mobile', async () => {
    obtenerSalones.mockResolvedValue([
      { id: 's1', nombre: 'Salón Beethoven', piso: 1, capacidad: 25, condicion: 'excelente', is_active: true, equipamiento: 'Piano' },
      { id: 's2', nombre: 'Salón Mozart', piso: 0, capacidad: 15, condicion: 'buena', is_active: false, equipamiento: '' },
    ])

    renderSalonesView(container)
    await useSalones.fetchSalones()

    const grid = container.querySelector('#salonesTableBody')
    expect(grid).not.toBeNull()

    // Verify 4 cards per row on desktop and 1 card per row on mobile
    expect(grid.classList.contains('row-cols-lg-4')).toBe(true)
    expect(grid.classList.contains('row-cols-1')).toBe(true)
    expect(grid.classList.contains('row-cols-xl-5')).toBe(false)

    // Verify card items
    const cards = container.querySelectorAll('.salon-card-item')
    expect(cards.length).toBe(2)

    // First card: active
    expect(cards[0].textContent).toContain('Salón Beethoven')
    expect(cards[0].classList.contains('salon-card-item--inactivo')).toBe(false)

    // Second card: inactive with proper badge and class
    expect(cards[1].textContent).toContain('Salón Mozart')
    expect(cards[1].classList.contains('salon-card-item--inactivo')).toBe(true)
    expect(cards[1].textContent).toContain('Inactivo')

    // Verify touch-friendly action buttons
    const buttons = cards[0].querySelectorAll('.salon-btn-action')
    expect(buttons.length).toBe(2)
  })
})
