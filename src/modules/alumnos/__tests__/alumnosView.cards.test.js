/**
 * alumnosView.cards.test.js
 * Zona de acciones de las cards del portal ADM:
 *   - sin botón 360° en la card
 *   - atajos visibles de perfil y contacto
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

describe('alumnosView — acciones de la card (etiquetas visibles)', () => {
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

  it('cada tarjeta ofrece perfil y contacto; la inactivación pertenece al expediente', () => {
    for (const id of ['con-tel', 'sin-tel']) {
      expect(actions(id).map((b) => b.dataset.action)).toEqual(['edit', 'whatsapp'])
    }
  })

  it('muestra el nombre de cada acción y conserva una etiqueta accesible', () => {
    for (const id of ['con-tel', 'sin-tel']) {
      for (const btn of actions(id)) {
        expect(['Ver perfil', 'WhatsApp']).toContain(btn.textContent.trim())
        expect(btn.getAttribute('aria-label')).toBeTruthy()
      }
    }
  })

  it('permite seleccionar un alumno y filtrar sin dejar acciones apuntando a otro alumno', () => {
    const panel = container.querySelector('#expediente-seleccionado')
    expect(panel.hidden).toBe(true)
    card('con-tel').querySelector('[data-select-student]').click()
    expect(panel.hidden).toBe(false)
    expect(panel.querySelector('h2').textContent).toBe('Con Teléfono')
    expect(panel.querySelectorAll('[data-student-action]:disabled')).toHaveLength(0)
    const filter = container.querySelector('#buscar')
    filter.value = 'sin telefono'
    filter.dispatchEvent(new Event('input'))
    expect(card('sin-tel')).toBeTruthy()
    expect(panel.hidden).toBe(true)
    filter.value = 'nadie'
    filter.dispatchEvent(new Event('input'))
    expect(container.querySelector('#emptyContainer').textContent).toContain('Ningún alumno coincide')
    expect(container.querySelector('[data-empty="inactivos"]')).toBeTruthy()
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
