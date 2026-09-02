import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('../../styles/clases.css', () => ({}))
vi.mock('../../../../shared/components/AppModal.js', () => ({
  AppModal: { open: vi.fn(), close: vi.fn() },
}))
vi.mock('../../../../shared/components/AppToast.js', () => ({
  AppToast: { progress: vi.fn(), success: vi.fn(), error: vi.fn(), warning: vi.fn() },
}))

const mockSupabaseData = { data: [] }
const mockOrder = vi.fn().mockImplementation(() => Promise.resolve(mockSupabaseData))
const mockSelect = vi.fn().mockImplementation(() => ({ order: mockOrder }))
const mockFrom = vi.fn().mockImplementation(() => ({ select: mockSelect }))

vi.mock('../../../../lib/supabaseClient.js', () => ({
  supabase: {
    from: (...args) => mockFrom(...args),
  },
}))

vi.mock('../../api/clasesApi.js', () => ({
  obtenerClases: vi.fn().mockImplementation(() => Promise.resolve([])),
  eliminarClase: vi.fn(),
  inscribirAlumno: vi.fn(),
  desinscribirAlumno: vi.fn(),
  construirDatosClonados: vi.fn(),
}))

vi.mock('../../components/claseModal.js', () => ({ openClaseModal: vi.fn() }))
vi.mock('../../domain/generarPdfClase.js', () => ({
  descargarPdfClase: vi.fn(),
  descargarPdfListadoAlumnosPorClases: vi.fn(),
}))
vi.mock('../../utils/claseConflictDetector.js', () => ({
  detectarConflictosDeClases: vi.fn(() => new Map()),
  consolidarBadgesFichaClase: vi.fn(() => []),
}))
vi.mock('../../api/acuerdosApi.js', () => ({
  obtenerAcuerdosMaestros: vi.fn(() => []),
  guardarAcuerdoMaestro: vi.fn(),
  eliminarAcuerdoMaestro: vi.fn(),
}))

import { renderClasesView } from '../clasesView.js'
import { obtenerClases } from '../../api/clasesApi.js'

describe('clasesView Search & Focus preservation', () => {
  let container

  beforeEach(() => {
    document.body.innerHTML = ''
    container = document.createElement('div')
    document.body.appendChild(container)
  })

  it('keeps the search input element in DOM without losing focus when typing', async () => {
    obtenerClases.mockImplementation(() => Promise.resolve([
      { id: 'c1', nombre: 'Violín Inicial', instrumento: 'Violín', maestro_nombre: 'Carlos Gómez', activo: true },
      { id: 'c2', nombre: 'Flauta Avanzada', instrumento: 'Flauta', maestro_nombre: 'María López', activo: true },
    ]))

    await renderClasesView(container, { resetFilters: true })

    const searchInput = container.querySelector('#inputBuscarClases')
    expect(searchInput).not.toBeNull()

    // Focus input
    searchInput.focus()
    expect(document.activeElement).toBe(searchInput)

    // Type first character
    searchInput.value = 'V'
    searchInput.dispatchEvent(new Event('input', { bubbles: true }))

    // Assert that the input element is the exact same DOM node and retains focus
    const searchInputAfterV = container.querySelector('#inputBuscarClases')
    expect(searchInputAfterV).toBe(searchInput)
    expect(document.activeElement).toBe(searchInput)

    // Type second character
    searchInput.value = 'Vi'
    searchInput.dispatchEvent(new Event('input', { bubbles: true }))

    const searchInputAfterVi = container.querySelector('#inputBuscarClases')
    expect(searchInputAfterVi).toBe(searchInput)
    expect(document.activeElement).toBe(searchInput)

    // Check that cards are filtered without full re-render
    const cardsContainer = container.querySelector('#clasesCardsContainer')
    expect(cardsContainer.textContent).toContain('Violín Inicial')
    expect(cardsContainer.textContent).not.toContain('Flauta Avanzada')
  })

  it('updates the active filter count badge when search query is entered', async () => {
    obtenerClases.mockImplementation(() => Promise.resolve([
      { id: 'c1', nombre: 'Violín Inicial', instrumento: 'Violín', maestro_nombre: 'Carlos Gómez', activo: true },
    ]))

    await renderClasesView(container, { resetFilters: true })

    const searchInput = container.querySelector('#inputBuscarClases')
    const badgeWrapper = container.querySelector('#filtrosActivosBadgeWrapper')

    expect(badgeWrapper.textContent.trim()).toBe('')

    // Type query
    searchInput.value = 'Violín'
    searchInput.dispatchEvent(new Event('input', { bubbles: true }))

    expect(badgeWrapper.textContent.trim()).toBe('1')

    // Clear query
    searchInput.value = ''
    searchInput.dispatchEvent(new Event('input', { bubbles: true }))

    expect(badgeWrapper.textContent.trim()).toBe('')
  })

  it('does not display "Activa" badge and places warning button in card header when conflicts exist', async () => {
    obtenerClases.mockImplementation(() => Promise.resolve([
      { id: 'c1', nombre: 'Violín Inicial', instrumento: 'Violín', maestro_nombre: 'Carlos Gómez', activo: true },
    ]))

    const { detectarConflictosDeClases } = await import('../../utils/claseConflictDetector.js')
    detectarConflictosDeClases.mockReturnValue(new Map([
      ['c1', [{ tipo: 'solapamiento_maestro', nivel: 'warning', label: 'Solape Maestro' }]],
    ]))

    await renderClasesView(container, { resetFilters: true })

    // Check that "Activa" badge is NOT rendered
    const badges = Array.from(container.querySelectorAll('.badge')).map(b => b.textContent.trim())
    expect(badges).not.toContain('Activa')

    // Check that warning button is rendered in the card header (top-right corner)
    const cardHeader = container.querySelector('.clase-card-v2-header')
    expect(cardHeader).not.toBeNull()
    const warningBtn = cardHeader.querySelector('.clase-btn-warning-corner')
    expect(warningBtn).not.toBeNull()
    expect(warningBtn.dataset.action).toBe('resolver-conflicto')
  })

  it('toggles "Solo Activas" filter and puts inactive classes at the end with clase-card-v2--inactiva class', async () => {
    obtenerClases.mockImplementation(() => Promise.resolve([
      { id: 'c1', nombre: 'Violín Inicial', instrumento: 'Violín', maestro_nombre: 'Carlos Gómez', activo: false, estado: 'inactiva' },
      { id: 'c2', nombre: 'Flauta Avanzada', instrumento: 'Flauta', maestro_nombre: 'María López', activo: true, estado: 'activa' },
    ]))

    const { detectarConflictosDeClases } = await import('../../utils/claseConflictDetector.js')
    detectarConflictosDeClases.mockReturnValue(new Map())

    await renderClasesView(container, { resetFilters: true })

    // By default, Solo Activas is true -> only c2 should be visible
    let cardsContainer = container.querySelector('#clasesCardsContainer')
    expect(cardsContainer.textContent).toContain('Flauta Avanzada')
    expect(cardsContainer.textContent).not.toContain('Violín Inicial')

    // Click "Solo Activas" button to toggle off
    const btnSoloActivas = container.querySelector('#btnFiltroSoloActivas')
    expect(btnSoloActivas).not.toBeNull()
    btnSoloActivas.dispatchEvent(new Event('click', { bubbles: true }))

    // Now both should be visible, with inactive at the end and having .clase-card-v2--inactiva
    const cards = container.querySelectorAll('.clase-card-v2')
    expect(cards.length).toBe(2)

    // First card should be active (Flauta Avanzada)
    expect(cards[0].textContent).toContain('Flauta Avanzada')
    expect(cards[0].classList.contains('clase-card-v2--inactiva')).toBe(false)

    // Second card should be inactive (Violín Inicial) isolated at the end
    expect(cards[1].textContent).toContain('Violín Inicial')
    expect(cards[1].classList.contains('clase-card-v2--inactiva')).toBe(true)
    expect(cards[1].textContent).toContain('Inactiva')
  })
})

