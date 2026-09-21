/**
 * alumnosView.cards.test.js
 * Zona de acciones de las cards del portal ADM:
 *   - sin botón 360° en la card
 *   - solo íconos (Editar · WhatsApp · Eliminar), sin texto visible
 *   - card sin teléfono → tinte rojo translúcido + WhatsApp deshabilitado
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

vi.mock('../../../shared/components/AppModal.js', () => ({
  AppModal: { open: vi.fn(), close: vi.fn() },
}))
vi.mock('../../../shared/components/AppToast.js', () => ({
  AppToast: { success: vi.fn(), error: vi.fn() },
}))
vi.mock('../api/alumnosApi.js', () => ({
  obtenerAlumnos: vi.fn().mockResolvedValue({
    alumnos: [
      { id: 'con-tel', nombre: 'Con Teléfono', instrumento: 'Piano', telefono: '+18295551111', familiar_nombre: 'Rep Uno' },
      { id: 'sin-tel', nombre: 'Sin Teléfono', instrumento: 'Piano', telefono: '', familiar_nombre: null },
    ],
    total: 2,
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

describe('alumnosView — acciones de la card (solo íconos)', () => {
  let container

  beforeEach(async () => {
    const { renderAlumnosView } = await import('../views/alumnosView.js')
    container = document.createElement('div')
    document.body.appendChild(container)
    await renderAlumnosView(container)
  })

  afterEach(() => container?.remove())

  const card = (id) => container.querySelector(`.list-group-item[data-id="${id}"]`)
  const actions = (id) => Array.from(card(id).querySelectorAll('button[data-action]'))

  it('renderiza una card por alumno', () => {
    expect(card('con-tel')).toBeTruthy()
    expect(card('sin-tel')).toBeTruthy()
  })

  it('NO hay botón 360° en ninguna card', () => {
    expect(container.querySelector('.list-group-item [data-action="ficha360"]')).toBeNull()
    expect(container.querySelector('.list-group-item')?.textContent).not.toContain('360°')
  })

  it('todas las cards tienen exactamente Editar, WhatsApp y Eliminar, en ese orden', () => {
    for (const id of ['con-tel', 'sin-tel']) {
      expect(actions(id).map((b) => b.dataset.action)).toEqual(['edit', 'whatsapp', 'delete'])
    }
  })

  it('los botones de acción no muestran texto (solo ícono) pero tienen aria-label', () => {
    for (const id of ['con-tel', 'sin-tel']) {
      for (const btn of actions(id)) {
        expect(btn.textContent.trim()).toBe('')
        expect(btn.querySelector('i.bi')).toBeTruthy()
        expect(btn.getAttribute('aria-label')).toBeTruthy()
      }
    }
  })

  it('card SIN teléfono: tinte rojo (clase) y WhatsApp deshabilitado', () => {
    expect(card('sin-tel').classList.contains('alumno-card--sin-telefono')).toBe(true)
    expect(card('sin-tel').classList.contains('bg-body')).toBe(false)
    expect(card('sin-tel').querySelector('[data-action="whatsapp"]').disabled).toBe(true)
  })

  it('card CON teléfono: sin tinte rojo y WhatsApp habilitado', () => {
    expect(card('con-tel').classList.contains('alumno-card--sin-telefono')).toBe(false)
    expect(card('con-tel').classList.contains('bg-body')).toBe(true)
    expect(card('con-tel').querySelector('[data-action="whatsapp"]').disabled).toBe(false)
  })
})
