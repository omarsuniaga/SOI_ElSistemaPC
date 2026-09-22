/**
 * alumnosView.verInactivos.test.js
 *
 * El listener de #btnIrInactivos ya existía (navega a la ruta 'alumnos-inactivos'),
 * pero ningún botón con ese id se renderizaba en el DOM: era un botón fantasma,
 * enganchado a un elemento que nunca existió.
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

vi.mock('../../../shared/components/AppModal.js', () => ({
  AppModal: { open: vi.fn(), close: vi.fn() },
}))
vi.mock('../../../shared/components/AppToast.js', () => ({
  AppToast: { success: vi.fn(), error: vi.fn() },
}))
vi.mock('../api/alumnosApi.js', () => ({
  obtenerAlumnos: vi.fn().mockResolvedValue({ alumnos: [], total: 0 }),
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

describe('alumnosView — botón "Ver inactivos"', () => {
  let container

  beforeEach(async () => {
    const { renderAlumnosView } = await import('../views/alumnosView.js')
    container = document.createElement('div')
    document.body.appendChild(container)
    window.router = { navigate: vi.fn() }
    await renderAlumnosView(container)
  })

  afterEach(() => {
    container?.remove()
    delete window.router
  })

  it('existe un botón visible que navega a alumnos-inactivos', () => {
    const btn = container.querySelector('#btnIrInactivos')
    expect(btn).not.toBeNull()

    btn.dispatchEvent(new Event('click', { bubbles: true }))

    expect(window.router.navigate).toHaveBeenCalledWith('alumnos-inactivos')
  })
})
