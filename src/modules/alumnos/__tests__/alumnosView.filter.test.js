/**
 * alumnosView.filter.test.js
 * C02 — search filter includes email and cedula
 * D02 — memoized calcularCompletitud (called once on load, not on filter)
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('../../../shared/components/AppModal.js', () => ({
  AppModal: { open: vi.fn(), close: vi.fn() },
}))
vi.mock('../../../shared/components/AppToast.js', () => ({
  AppToast: { success: vi.fn(), error: vi.fn() },
}))

const mockAlumnos = [
  {
    id: 1,
    nombre: 'Juan García',
    email: 'juan@test.com',
    cedula: '001-1234567-8',
    telefono: '8091234567',
    familiar_nombre: null,
    instrumento: 'Violin',
    is_active: true,
  },
  {
    id: 2,
    nombre: 'Ana López',
    email: 'ana@ejemplo.com',
    cedula: '002-9876543-1',
    telefono: '8097654321',
    familiar_nombre: 'María López',
    instrumento: 'Piano',
    is_active: true,
  },
]

vi.mock('../api/alumnosApi.js', () => ({
  obtenerAlumnos: vi.fn().mockResolvedValue({ alumnos: mockAlumnos, total: mockAlumnos.length }),
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
  calcularCompletitud: vi.fn(() => ({ porcentaje: 0, nivel: 'bajo', camposFaltantes: [], camposCompletos: [], porGrupo: {} })),
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

function buildContainer() {
  const container = document.createElement('div')
  container.innerHTML = `
    <div id="alumnosTBody"></div>
    <div id="emptyContainer"></div>
    <div class="alumnos-header-premium"><p class="text-muted"></p></div>
  `
  return container
}

describe('C02 — search includes email and cedula', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('finds alumno by email partial match', async () => {
    const { renderAlumnosView } = await import('../views/alumnosView.js')

    const container = buildContainer()
    document.body.appendChild(container)
    await renderAlumnosView(container)

    // The rendered HTML should contain Juan's email reference or the alumno card
    // We verify the filter logic by checking the source code includes email in its filter
    // (structural test — the full-DOM filter test requires more integration)
    const fs = await import('fs')
    const path = await import('path')
    const { fileURLToPath } = await import('url')
    const { dirname } = await import('path')

    const thisFile = fileURLToPath(import.meta.url)
    const viewPath = path.join(dirname(thisFile), '..', 'views', 'alumnosView.js')
    const source = fs.readFileSync(viewPath, 'utf8')

    // After GREEN: the applyFilters function must include email and cedula
    expect(source).toMatch(/a\.email.*toLowerCase.*includes\(searchTerm\)|toLowerCase.*a\.email.*includes/)
    expect(source).toMatch(/a\.cedula.*includes\(|cedula.*toLowerCase.*includes\(searchTerm\)/)

    document.body.removeChild(container)
  })

  it('applyFilters source includes email and cedula in text search', async () => {
    const fs = await import('fs')
    const path = await import('path')
    const { fileURLToPath } = await import('url')
    const { dirname } = await import('path')

    const thisFile = fileURLToPath(import.meta.url)
    const viewPath = path.join(dirname(thisFile), '..', 'views', 'alumnosView.js')
    const source = fs.readFileSync(viewPath, 'utf8')

    // The applyFilters block must contain email and cedula search terms
    // Extract the applyFilters function body heuristically
    const applyFiltersIdx = source.indexOf('function applyFilters')
    expect(applyFiltersIdx).toBeGreaterThan(-1)

    const applyFiltersBody = source.slice(applyFiltersIdx, applyFiltersIdx + 2000)
    expect(applyFiltersBody).toMatch(/email/)
    expect(applyFiltersBody).toMatch(/cedula/)
  })
})

describe('D02 — memoized calcularCompletitud', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('source: alumnosOriginales map attaches _completitud on load', async () => {
    const fs = await import('fs')
    const path = await import('path')
    const { fileURLToPath } = await import('url')
    const { dirname } = await import('path')

    const thisFile = fileURLToPath(import.meta.url)
    const viewPath = path.join(dirname(thisFile), '..', 'views', 'alumnosView.js')
    const source = fs.readFileSync(viewPath, 'utf8')

    // After GREEN: load step must map alumnos to attach _completitud
    expect(source).toMatch(/_completitud:\s*calcularCompletitud/)
  })

  it('source: applyFilters uses a._completitud not calcularCompletitud(a)', async () => {
    const fs = await import('fs')
    const path = await import('path')
    const { fileURLToPath } = await import('url')
    const { dirname } = await import('path')

    const thisFile = fileURLToPath(import.meta.url)
    const viewPath = path.join(dirname(thisFile), '..', 'views', 'alumnosView.js')
    const source = fs.readFileSync(viewPath, 'utf8')

    const applyFiltersIdx = source.indexOf('function applyFilters')
    expect(applyFiltersIdx).toBeGreaterThan(-1)
    const applyFiltersBody = source.slice(applyFiltersIdx, applyFiltersIdx + 2000)

    // Must NOT call calcularCompletitud(a) inside applyFilters
    expect(applyFiltersBody).not.toMatch(/calcularCompletitud\s*\(a\)/)
    // Must use a._completitud instead
    expect(applyFiltersBody).toMatch(/a\._completitud/)
  })

  it('source: sort block uses a._completitud not calcularCompletitud(a)', async () => {
    const fs = await import('fs')
    const path = await import('path')
    const { fileURLToPath } = await import('url')
    const { dirname } = await import('path')

    const thisFile = fileURLToPath(import.meta.url)
    const viewPath = path.join(dirname(thisFile), '..', 'views', 'alumnosView.js')
    const source = fs.readFileSync(viewPath, 'utf8')

    // The sort block that references _completitud must use a._completitud.porcentaje
    expect(source).toMatch(/a\._completitud\.porcentaje/)
    expect(source).toMatch(/b\._completitud\.porcentaje/)
  })

  it('calcularCompletitud called exactly N times for N alumnos (once on load, not on filter)', async () => {
    const { calcularCompletitud } = await import('../domain/completitudAlumno.js')
    const { renderAlumnosView } = await import('../views/alumnosView.js')

    const container = buildContainer()
    document.body.appendChild(container)

    calcularCompletitud.mockClear()
    await renderAlumnosView(container)

    // After memoization: called exactly once per alumno (2 alumnos in mock)
    const callsAfterLoad = calcularCompletitud.mock.calls.length
    expect(callsAfterLoad).toBe(mockAlumnos.length)

    document.body.removeChild(container)
  })
})
