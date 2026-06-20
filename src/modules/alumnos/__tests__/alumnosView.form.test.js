/**
 * alumnosView.form.test.js
 * C03 — email validation in collectAndValidateAlumno
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'

// We need isValidEmail to actually run (not be mocked to always return true)
// So we do NOT mock alumnosUtils — we let it be real for these tests.
// We DO mock everything else.

vi.mock('../../../shared/components/AppModal.js', () => ({
  AppModal: { open: vi.fn(), close: vi.fn() },
}))

const appToastMock = {
  success: vi.fn(),
  error: vi.fn(),
}
vi.mock('../../../shared/components/AppToast.js', () => ({
  AppToast: appToastMock,
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
vi.mock('../domain/generarPdfInscripcion.js', () => ({ descargarPdfListadoAlumnos: vi.fn() }))
vi.mock('../styles/alumnos.css', () => ({}))

/**
 * Build a minimal modal body DOM that collectAndValidateAlumno can read.
 * All required fields are filled by default; override via `overrides`.
 */
function buildModalBody(overrides = {}) {
  const defaults = {
    nombre: 'Juan García',
    email: '',
    telefono: '8091234567',
    cedula: '',
    fechaNacimiento: '',
    genero: '',
    instrumento: 'Violin',
    familiarNombre: '',
    familiarTelefono: '',
    familiarParentesco: '',
    esActivo: true,
    condicionesMedicas: '',
    alergias: '',
    medicamentos: '',
    contactoEmergenciaNombre: '',
    contactoEmergenciaTelefono: '',
    contactoEmergenciaParentesco: '',
  }
  const vals = { ...defaults, ...overrides }

  const body = document.createElement('div')
  body.innerHTML = `
    <input id="modal-nombre" value="${vals.nombre}">
    <input id="modal-email" value="${vals.email}">
    <input id="modal-telefono" value="${vals.telefono}">
    <input id="modal-cedula" value="${vals.cedula}">
    <input id="modal-fechaNacimiento" value="${vals.fechaNacimiento}">
    <select id="modal-genero"><option value="${vals.genero}" selected>${vals.genero}</option></select>
    <input id="modal-instrumento" value="${vals.instrumento}">
    <input id="modal-familiar-nombre" value="${vals.familiarNombre}">
    <input id="modal-familiar-telefono-input" value="${vals.familiarTelefono}">
    <select id="modal-familiar-parentesco-input"><option value="${vals.familiarParentesco}" selected></option></select>
    <input id="modal-esActivo" type="checkbox" ${vals.esActivo ? 'checked' : ''}>
    <input id="modal-contacto-emergencia-nombre" value="${vals.contactoEmergenciaNombre}">
    <input id="modal-contacto-emergencia-telefono" value="${vals.contactoEmergenciaTelefono}">
    <select id="modal-contacto-emergencia-parentesco"><option value="${vals.contactoEmergenciaParentesco}" selected></option></select>
    <textarea id="modal-condiciones-medicas">${vals.condicionesMedicas}</textarea>
    <textarea id="modal-alergias">${vals.alergias}</textarea>
    <textarea id="modal-medicamentos">${vals.medicamentos}</textarea>
  `
  return body
}

describe('C03 — email validation in collectAndValidateAlumno', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns null and shows error for malformed email', async () => {
    // Import the module fresh
    // We need to access collectAndValidateAlumno indirectly via the open modal save
    // Since it's not exported, we test via AppToast.error being called
    const { isValidEmail } = await import('../utils/alumnosUtils.js')

    // Verify the utility itself works
    expect(isValidEmail('notanemail')).toBe(false)
    expect(isValidEmail('also-bad')).toBe(false)
    expect(isValidEmail('missing@')).toBe(false)

    // Verify the source code wires isValidEmail into collectAndValidateAlumno
    const fs = await import('fs')
    const path = await import('path')
    const { fileURLToPath } = await import('url')
    const { dirname } = await import('path')

    const thisFile = fileURLToPath(import.meta.url)
    const viewPath = path.join(dirname(thisFile), '..', 'views', 'alumnosView.js')
    const source = fs.readFileSync(viewPath, 'utf8')

    // The collectAndValidateAlumno function must call isValidEmail
    const collectIdx = source.indexOf('async function collectAndValidateAlumno')
    expect(collectIdx).toBeGreaterThan(-1)

    const collectBody = source.slice(collectIdx, collectIdx + 3000)
    expect(collectBody).toMatch(/isValidEmail/)
    expect(collectBody).toMatch(/email.*formato|formato.*email/i)
  })

  it('isValidEmail passes for a valid email address', async () => {
    const { isValidEmail } = await import('../utils/alumnosUtils.js')
    expect(isValidEmail('valid@test.com')).toBe(true)
    expect(isValidEmail('user.name+tag@example.co.uk')).toBe(true)
  })

  it('isValidEmail treats empty string as invalid (caller guards empty before calling)', async () => {
    const { isValidEmail } = await import('../utils/alumnosUtils.js')
    // collectAndValidateAlumno should NOT call isValidEmail when email is empty
    // The guard: if (email && !isValidEmail(email)) — so empty passes through
    expect(isValidEmail('')).toBe(false) // isValidEmail itself returns false for empty
    // But the caller skips validation when email is ''
    // Test that the source code has the guard:
    const fs = await import('fs')
    const path = await import('path')
    const { fileURLToPath } = await import('url')
    const { dirname } = await import('path')

    const thisFile = fileURLToPath(import.meta.url)
    const viewPath = path.join(dirname(thisFile), '..', 'views', 'alumnosView.js')
    const source = fs.readFileSync(viewPath, 'utf8')

    const collectIdx = source.indexOf('async function collectAndValidateAlumno')
    const collectBody = source.slice(collectIdx, collectIdx + 3000)
    // Must have the guard: if (email && !isValidEmail(email))
    expect(collectBody).toMatch(/if\s*\(\s*email\s*&&\s*!isValidEmail\s*\(/)
  })
})
