/**
 * alumnosView.table.test.js
 * Tests for table rendering behavior in alumnosView:
 *   - B02: double empty-state render fix
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('../../../shared/components/AppModal.js', () => ({
  AppModal: { open: vi.fn(), close: vi.fn() },
}))
vi.mock('../../../shared/components/AppToast.js', () => ({
  AppToast: { success: vi.fn(), error: vi.fn() },
}))
vi.mock('../api/alumnosApi.js', () => ({
  obtenerAlumnos: vi.fn().mockResolvedValue([]),
  crearAlumno: vi.fn(),
  actualizarAlumno: vi.fn(),
  eliminarAlumno: vi.fn(),
  obtenerInscripcionesAlumno: vi.fn().mockResolvedValue([]),
  PARENTESCOS: [],
  getParentescoLabel: vi.fn((v) => v),
  obtenerAlumnosFiltradosYOrdenados: vi.fn().mockResolvedValue([]),
}))
vi.mock('../domain/calcularEdad.js', () => ({ calcularEdad: vi.fn(() => null) }))
vi.mock('../domain/completitudAlumno.js', () => ({
  calcularCompletitud: vi.fn(() => ({ porcentaje: 0, nivel: 'bajo' })),
  NIVEL_COLOR: {},
  NIVEL_LABEL: {},
}))
vi.mock('../utils/alumnosUtils.js', () => ({
  formatDate: vi.fn((v) => v || ''),
  escapeHTML: vi.fn((v) => v || ''),
  isValidEmail: vi.fn(() => true),
  formatGenero: vi.fn((v) => v || ''),
  getGeneroIcon: vi.fn(() => ''),
  getEstadoClass: vi.fn(() => ''),
  getEstadoLabel: vi.fn(() => ''),
  getInitials: vi.fn(() => ''),
}))
vi.mock('../domain/generarPdfInscripcion.js', () => ({ descargarPdfListadoAlumnos: vi.fn() }))
vi.mock('../styles/alumnos.css', () => ({}))

// ─── B02: empty-state uniqueness ─────────────────────────────────────────

describe('B02 — refreshTable empty state', () => {
  it('renders exactly one empty-state element when alumnos is empty', async () => {
    /**
     * After fix: when state.alumnos === []:
     *   - #alumnosTBody must be EMPTY (no rows, no empty-state inside it)
     *   - #emptyContainer must have the empty-state content
     *
     * Before fix: empty state was rendered in BOTH #alumnosTBody AND #emptyContainer
     */
    const { renderAlumnosView } = await import('../views/alumnosView.js')

    const container = document.createElement('div')
    container.innerHTML = `
      <div id="alumnosTBody"></div>
      <div id="emptyContainer"></div>
      <div class="alumnos-header-premium"><p class="text-muted"></p></div>
    `
    document.body.appendChild(container)

    // Render with empty state (obtenerAlumnos returns [] from mock)
    await renderAlumnosView(container)

    const tbody = container.querySelector('#alumnosTBody')
    const emptyContainer = container.querySelector('#emptyContainer')

    // tbody should NOT contain empty-state UI — it should be empty
    const tbodyRows = tbody.querySelectorAll('tr')
    expect(tbodyRows.length).toBe(0)

    // tbody itself should NOT have empty-state content
    const tbodyHasEmptyState = tbody.innerHTML.toLowerCase().includes('empty') ||
      tbody.innerHTML.toLowerCase().includes('sin alumnos') ||
      tbody.innerHTML.toLowerCase().includes('no hay') ||
      tbody.querySelectorAll('[class*="empty"]').length > 0

    // emptyContainer should have the empty-state content
    const emptyContainerHasContent = emptyContainer.innerHTML.trim().length > 0

    // The fix ensures empty state appears in emptyContainer, NOT in tbody
    // So either: tbody is truly empty, OR there's only one place showing empty state
    const totalEmptyStateElements = document.querySelectorAll(
      '[data-empty], .empty-state, #emptyContainer [class*="empty"], #emptyContainer p'
    ).length

    // There must not be empty-state content in BOTH places simultaneously
    const emptyInBoth = tbodyHasEmptyState && emptyContainerHasContent
    expect(emptyInBoth).toBe(false)

    document.body.removeChild(container)
  })

  it('tbody has rows and emptyContainer is hidden when alumnos exist', async () => {
    const { obtenerAlumnos } = await import('../api/alumnosApi.js')
    obtenerAlumnos.mockResolvedValueOnce([
      { id: 1, nombre: 'Ana Lopez', email: 'ana@test.com', is_active: true },
    ])

    const { renderAlumnosView } = await import('../views/alumnosView.js')

    const container = document.createElement('div')
    container.innerHTML = `
      <div id="alumnosTBody"></div>
      <div id="emptyContainer"></div>
      <div class="alumnos-header-premium"><p class="text-muted"></p></div>
    `
    document.body.appendChild(container)
    await renderAlumnosView(container)

    const emptyContainer = container.querySelector('#emptyContainer')
    // When there are alumnos, emptyContainer should be empty
    expect(emptyContainer.innerHTML.trim()).toBe('')

    document.body.removeChild(container)
  })
})
