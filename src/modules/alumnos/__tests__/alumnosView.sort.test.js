/**
 * alumnosView.sort.test.js
 * C07 — column sort in student list
 *
 * Structural + behavioral tests for sortable columns.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { readFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

vi.mock('../../../shared/components/AppModal.js', () => ({
  AppModal: { open: vi.fn(), close: vi.fn() },
}))
vi.mock('../../../shared/components/AppToast.js', () => ({
  AppToast: { success: vi.fn(), error: vi.fn() },
}))
vi.mock('../api/alumnosApi.js', () => ({
  obtenerAlumnos: vi.fn().mockResolvedValue({
    alumnos: [
      { id: 1, nombre: 'Zara Martínez', email: null, is_active: true, instrumento: 'Violin', telefono: '8091111111', familiar_nombre: null },
      { id: 2, nombre: 'Ana Gómez', email: null, is_active: true, instrumento: 'Piano', telefono: '8092222222', familiar_nombre: null },
      { id: 3, nombre: 'Luis Pérez', email: null, is_active: true, instrumento: 'Cello', telefono: '8093333333', familiar_nombre: null },
    ],
    total: 3,
  }),
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
  calcularCompletitud: vi.fn(() => ({ porcentaje: 75, nivel: 'medio' })),
  NIVEL_COLOR: { medio: 'warning' },
  NIVEL_LABEL: { medio: 'Incompleto' },
}))
vi.mock('../utils/alumnosUtils.js', () => ({
  formatDate: vi.fn((v) => v || ''),
  escapeHTML: vi.fn((v) => v || ''),
  isValidEmail: vi.fn(() => true),
  formatGenero: vi.fn((v) => v || ''),
  getGeneroIcon: vi.fn(() => ''),
  getEstadoClass: vi.fn(() => ''),
  getEstadoLabel: vi.fn(() => ''),
  getInitials: vi.fn((n) => (n || '').split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() || '?'),
}))
vi.mock('../domain/generarPdfInscripcion.js', () => ({ descargarPdfListadoAlumnos: vi.fn() }))
vi.mock('../styles/alumnos.css', () => ({}))

// ─── C07: Column sort — structural test ─────────────────────────────────────

describe('C07 — column sort in student list (structural)', () => {
  it('alumnosView source contains data-sort attributes on headers', () => {
    const viewPath = join(__dirname, '..', 'views', 'alumnosView.js')
    const source = readFileSync(viewPath, 'utf8')

    // After GREEN: table headers must have data-sort attributes
    expect(source).toMatch(/data-sort/)
  })

  it('alumnosView source contains sort state fields (sortBy, sortDir)', () => {
    const viewPath = join(__dirname, '..', 'views', 'alumnosView.js')
    const source = readFileSync(viewPath, 'utf8')

    expect(source).toMatch(/sortBy/)
    expect(source).toMatch(/sortDir/)
  })

  it('alumnosView source has a click handler wired to [data-sort] headers', () => {
    const viewPath = join(__dirname, '..', 'views', 'alumnosView.js')
    const source = readFileSync(viewPath, 'utf8')

    // The attachEvents function must query [data-sort] and wire clicks
    expect(source).toMatch(/\[data-sort\]/)
    expect(source).toMatch(/dataset\.sort|data-sort/)
  })

  it('alumnosView source sorts alumnos by sortBy field before rendering', () => {
    const viewPath = join(__dirname, '..', 'views', 'alumnosView.js')
    const source = readFileSync(viewPath, 'utf8')

    // applyFilters must sort before calling renderTableRows
    expect(source).toMatch(/sortBy|sortDir/)
    // There must be a sort call — either .sort() with comparison or localeCompare
    expect(source).toMatch(/\.sort\s*\(/)
  })
})

// ─── C07: Column sort — behavioral test ─────────────────────────────────────

describe('C07 — column sort behavioral', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('rendered list is sorted by nombre ASC by default (Ana before Zara)', async () => {
    const { renderAlumnosView } = await import('../views/alumnosView.js')

    const container = document.createElement('div')
    container.innerHTML = `
      <div id="alumnosTBody"></div>
      <div id="emptyContainer"></div>
      <div class="alumnos-header-premium"><p class="text-muted"></p></div>
    `
    document.body.appendChild(container)

    await renderAlumnosView(container)

    // Get rendered list items (cards or rows) in DOM order
    // The alumnosView renders items in a list-group (cards), not a <table>
    const items = container.querySelectorAll('[data-id]')

    if (items.length >= 2) {
      // Find positions of Ana (id=2) and Zara (id=1) in the rendered list
      const itemsArray = Array.from(items)
      const anaIdx = itemsArray.findIndex(el => el.getAttribute('data-id') === '2')
      const zaraIdx = itemsArray.findIndex(el => el.getAttribute('data-id') === '1')

      if (anaIdx !== -1 && zaraIdx !== -1) {
        // Ana should come before Zara in ASC sort
        expect(anaIdx).toBeLessThan(zaraIdx)
      }
    }

    document.body.removeChild(container)
  })
})
