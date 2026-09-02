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
})
